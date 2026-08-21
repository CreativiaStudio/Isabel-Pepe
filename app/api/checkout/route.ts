import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems = Array.isArray(body) ? body : body.items;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    // 1. Estrai e valida gli ID prodotto
    const productIds: string[] = rawItems
      .map((item: any) => (typeof item?.id === 'string' ? item.id.trim() : ''))
      .filter((id: string) => id.length > 0);

    if (productIds.length !== rawItems.length) {
      return NextResponse.json(
        { error: 'Tutti gli articoli nel carrello devono contenere un ID prodotto valido' },
        { status: 400 }
      );
    }

    // 2. Query autoritativa al database Supabase (bypass RLS con supabaseAdmin)
    const { data: dbProducts, error: dbError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, discount_price, stock, is_active, slug, image_primary')
      .in('id', productIds);

    if (dbError) {
      console.error('Supabase products fetch error:', dbError);
      return NextResponse.json({ error: 'Errore durante la verifica dei prodotti' }, { status: 500 });
    }

    const productMap = new Map<string, {
      id: string;
      name: string;
      price: number;
      discount_price: number | null;
      stock: number;
      is_active: boolean;
      slug?: string;
      image_primary?: string;
    }>();

    (dbProducts || []).forEach((prod: any) => {
      productMap.set(prod.id, prod);
    });

    // 3. Validazione esistenza, stato attivo e calcolo autoritativo del prezzo
    const validatedItems = [];
    for (const item of rawItems) {
      const dbProduct = productMap.get(item.id);

      // Se il prodotto non esiste nel DB o non è attivo -> Rifiuta con 400
      if (!dbProduct || !dbProduct.is_active) {
        return NextResponse.json(
          { error: `Prodotto non trovato o non più disponibile: ${item.name || item.id}` },
          { status: 400 }
        );
      }

      // Validazione rigorosa della quantità
      const quantity = Math.floor(Number(item.quantity) || 1);
      if (quantity <= 0) {
        return NextResponse.json(
          { error: `Quantità non valida per il prodotto: ${dbProduct.name}` },
          { status: 400 }
        );
      }

      // Calcolo Prezzo Autoritativo dal DB:
      // Se discount_price > 0 usa discount_price, altrimenti price.
      // Qualsiasi prezzo inviato dal client viene tassativamente ignorato e scartato.
      const rawDiscount = dbProduct.discount_price !== null && dbProduct.discount_price !== undefined 
        ? Number(dbProduct.discount_price) 
        : null;
      const rawPrice = Number(dbProduct.price);

      const unitPrice = (rawDiscount !== null && !isNaN(rawDiscount) && rawDiscount > 0)
        ? rawDiscount
        : rawPrice;

      if (isNaN(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          { error: `Configurazione prezzo non valida per il prodotto: ${dbProduct.name}` },
          { status: 400 }
        );
      }

      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name, // Nome autoritativo da DB
        price: unitPrice,     // Prezzo autoritativo da DB
        quantity: quantity,
        slug: dbProduct.slug || item.slug || '',
        image: dbProduct.image_primary || item.image || '',
      });
    }

    // 4. Costruzione dei line_items per Stripe con prezzi autoritativi
    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe centesimi
      },
      quantity: item.quantity,
    }));

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const customerEmail = body.customerEmail;
    const customerPhone = body.customerPhone || '';
    const couponCode = body.couponCode;
    const visitorId = body.visitorId || null;
    const sessionId = body.sessionId || null;
    const consentId = body.consentId || null;
    
    // 5. Calcolo autoritativo del totale per il database e carrelli abbandonati
    const totalAmount = Number(
      validatedItems.reduce((acc: number, item) => acc + item.price * item.quantity, 0).toFixed(2)
    );

    // Controlliamo il consenso marketing
    let marketingConsent = false;
    if (consentId) {
      const { data: consentRecord } = await supabaseAdmin
        .from('cookie_consents')
        .select('marketing')
        .eq('consent_id', consentId)
        .single();
      marketingConsent = Boolean(consentRecord?.marketing);
    }

    // Salviamo o aggiorniamo il carrello abbandonato con dati autoritativi
    let abandonedCartId = null;
    if (customerEmail) {
      const { data: cartData, error: cartError } = await supabaseAdmin
        .from('abandoned_carts')
        .upsert([{
          email: customerEmail.toLowerCase().trim(),
          phone: customerPhone,
          cart_items: validatedItems,
          total_amount: totalAmount,
          status: 'abandoned',
          visitor_id: visitorId,
          consent_id: consentId,
          marketing_consent: marketingConsent,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }], { onConflict: 'email' })
        .select()
        .single();
        
      if (!cartError && cartData) {
        abandonedCartId = cartData.id;
      }
    }

    // Gestione Sconti (Coupon autoritativi da DB)
    let discounts = undefined;
    if (couponCode) {
      const { data: dbCoupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (dbCoupon && dbCoupon.is_active && (!dbCoupon.expires_at || new Date(dbCoupon.expires_at) > new Date())) {
        if (!dbCoupon.target_email || dbCoupon.target_email.toLowerCase() === customerEmail?.toLowerCase()) {
          const stripeCoupon = await stripe.coupons.create({
            percent_off: dbCoupon.discount_percent > 0 ? dbCoupon.discount_percent : undefined,
            amount_off: dbCoupon.discount_amount > 0 ? Math.round(dbCoupon.discount_amount * 100) : undefined,
            currency: dbCoupon.discount_amount > 0 ? 'eur' : undefined,
            duration: 'once',
            name: dbCoupon.code,
          });
          discounts = [{ coupon: stripeCoupon.id }];
        }
      }
    }

    // 6. Creazione della sessione Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      shipping_address_collection: {
        allowed_countries: ['IT', 'SM', 'VA'],
      },
      discounts: discounts,
      metadata: {
        abandoned_cart_id: abandonedCartId || '',
        visitor_id: visitorId || '',
        session_id: sessionId || '',
        consent_id: consentId || '',
        applied_coupon: couponCode || '',
        cart_items: JSON.stringify(validatedItems.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          slug: i.slug,
        }))),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
