import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    // Costruisce i line_items per Stripe
    const lineItems = items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: 'eur', // Valuta Europea
        product_data: {
          name: item.name,
          // Rimuoviamo images per evitare l'errore "Not a valid URL" o crash con localhost su Stripe
        },
        unit_amount: Math.round(item.price * 100), // Stripe vuole i centesimi
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
    
    // Calcoliamo il totale per il db
    const totalAmount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

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

    // Salviamo o aggiorniamo il carrello abbandonato collegato a visitor_id e consent_id
    let abandonedCartId = null;
    if (customerEmail) {
      const { data: cartData, error: cartError } = await supabaseAdmin
        .from('abandoned_carts')
        .upsert([{
          email: customerEmail.toLowerCase().trim(),
          phone: customerPhone,
          cart_items: items,
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

    // Gestione Sconti (Coupon)
    let discounts = undefined;
    if (couponCode) {
      // 1. Verifica su db interno
      const { data: dbCoupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (dbCoupon && dbCoupon.is_active && (!dbCoupon.expires_at || new Date(dbCoupon.expires_at) > new Date())) {
        if (!dbCoupon.target_email || dbCoupon.target_email.toLowerCase() === customerEmail?.toLowerCase()) {
          // 2. Crea un coupon monouso su Stripe
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

    // Crea la sessione con Dynamic Payment Methods (Cards, Apple Pay, Google Pay, Klarna, Link)
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined, // Precompila l'email su Stripe
      shipping_address_collection: {
        allowed_countries: ['IT', 'SM', 'VA'], // Limitiamo a Italia, San Marino, Vaticano
      },
      discounts: discounts,
      metadata: {
        abandoned_cart_id: abandonedCartId || '',
        visitor_id: visitorId || '',
        session_id: sessionId || '',
        consent_id: consentId || '',
        applied_coupon: couponCode || '',
        cart_items: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          slug: i.slug
        })))
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
