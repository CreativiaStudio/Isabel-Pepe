import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook secret is missing' }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Gestione degli eventi di successo
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Estrai le informazioni necessarie
      const sessionId = session.id;
      const customerEmail = session.customer_details?.email || '';
      const customerName = session.customer_details?.name || 'Cliente Sconosciuto';
      const amountTotal = (session.amount_total || 0) / 100;
      const shippingAddress = (session as any).shipping_details?.address || (session as any).collected_information?.shipping_details?.address || {};
      const metadata = session.metadata || {};
      const items = metadata.cart_items ? JSON.parse(metadata.cart_items) : [];

      // Salva l'ordine in Supabase
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          stripe_session_id: sessionId,
          customer_email: customerEmail,
          customer_name: customerName,
          amount_total: amountTotal,
          status: 'paid',
          shipping_address: shippingAddress,
          items: items
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Errore durante il salvataggio dell\'ordine su Supabase:', orderError);
        throw orderError;
      }

      console.log('Ordine salvato con successo:', orderData.id);

      // 1. Recupero Carrello (se presente)
      if (metadata.abandoned_cart_id) {
        await supabaseAdmin
          .from('abandoned_carts')
          .update({ status: 'recovered', updated_at: new Date().toISOString() })
          .eq('id', metadata.abandoned_cart_id);
      }

      // 2. Aggiornamento CRM (customers)
      if (customerEmail) {
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('email', customerEmail)
          .single();

        // Estrai first e last name
        const nameParts = customerName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        // Estrai il phone se c'è
        const phone = session.customer_details?.phone || '';

        if (existingCustomer) {
          // Aggiorna
          await supabaseAdmin
            .from('customers')
            .update({
              total_spent: Number(existingCustomer.total_spent) + amountTotal,
              orders_count: (existingCustomer.orders_count || 0) + 1,
              last_purchase_date: new Date().toISOString(),
              first_name: existingCustomer.first_name || firstName,
              last_name: existingCustomer.last_name || lastName,
              phone: existingCustomer.phone || phone,
            })
            .eq('id', existingCustomer.id);
        } else {
          // Crea nuovo
          await supabaseAdmin
            .from('customers')
            .insert([{
              email: customerEmail,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              total_spent: amountTotal,
              orders_count: 1,
              last_purchase_date: new Date().toISOString(),
              acquisition_source: 'purchase',
              tags: ['nuovo_cliente']
            }]);
        }
      }

      // (Opzionale) Aggiorna lo stock dei prodotti
      // Mettiamo un loop per iterare sui prodotti acquistati e scalare le giacenze
      for (const item of items) {
        // Leggiamo lo stock attuale
        const { data: prod } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (prod && prod.stock > 0) {
          await supabaseAdmin
            .from('products')
            .update({ stock: Math.max(0, prod.stock - item.quantity) })
            .eq('id', item.id);
        }
      }

    } catch (err: any) {
      console.error('Errore webhook processing:', err);
      return NextResponse.json({ error: 'Errore interno webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
