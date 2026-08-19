import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { incrementDailyMetric } from '@/lib/analytics';

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
      const customerName = session.customer_details?.name || 'Cliente Isabel Pepe';
      const amountTotal = (session.amount_total || 0) / 100;
      const shippingAddress = (session as any).shipping_details?.address || (session as any).collected_information?.shipping_details?.address || {};
      const metadata = session.metadata || {};
      const items = metadata.cart_items ? JSON.parse(metadata.cart_items) : [];
      const visitorId = metadata.visitor_id || null;
      const analyticsSessionId = metadata.session_id || null;
      const nowIso = new Date().toISOString();

      // Salva l'ordine in Supabase (se non già creato da /api/checkout/confirm)
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();

      let orderId = existingOrder?.id;

      if (!existingOrder) {
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

        orderId = orderData.id;
        console.log('Ordine salvato con successo:', orderData.id);

        // Invia email di conferma ordine ufficiale
        if (customerEmail && orderData?.id) {
          sendOrderConfirmationEmail({
            customerEmail,
            customerName,
            orderId: orderData.id,
            amountTotal,
            items,
            shippingAddress,
          }).catch((err) => console.error('Error sending order confirmation email on webhook:', err));
        }

        // Funnel Milestone: Update analytics_sessions with completed purchase
        if (analyticsSessionId) {
          await supabaseAdmin
            .from('analytics_sessions')
            .update({
              completed_purchase: true,
              started_checkout: true,
              added_to_cart: true,
              is_bounce: false,
              order_id: orderId,
              revenue: amountTotal,
              last_active_at: nowIso,
              updated_at: nowIso,
            })
            .eq('session_id', analyticsSessionId);
        } else if (visitorId) {
          await supabaseAdmin
            .from('analytics_sessions')
            .update({
              completed_purchase: true,
              started_checkout: true,
              added_to_cart: true,
              is_bounce: false,
              order_id: orderId,
              revenue: amountTotal,
              last_active_at: nowIso,
              updated_at: nowIso,
            })
            .eq('visitor_id', visitorId);
        }

        // Funnel Milestone: Record purchase event in analytics_events
        await supabaseAdmin.from('analytics_events').insert([
          {
            session_id: analyticsSessionId || `sid_${visitorId || sessionId}`,
            visitor_id: visitorId || `vid_${sessionId}`,
            event_name: 'purchase',
            path: '/success',
            order_id: orderId,
            cart_total: amountTotal,
            coupon_code: metadata.applied_coupon || null,
            event_data: {
              stripe_session_id: sessionId,
              amount: amountTotal,
              items_count: items.length,
              customer_email: customerEmail,
              items: items,
            },
            created_at: nowIso,
          },
        ]);

        // Funnel Milestone: Increment daily metric
        incrementDailyMetric({ isOrder: true, amount: amountTotal }).catch(() => {});
      }

      // 1. Recupero Carrello (se presente)
      if (metadata.abandoned_cart_id) {
        await supabaseAdmin
          .from('abandoned_carts')
          .update({ status: 'recovered', updated_at: nowIso })
          .eq('id', metadata.abandoned_cart_id);
      }

      // 2. Auto-creazione Silenziosa Account Utente & Profilo in DB
      if (customerEmail) {
        try {
          const nameParts = customerName.split(' ');
          const firstName = nameParts[0] || 'Cliente';
          const lastName = nameParts.slice(1).join(' ') || 'Isabel Pepe';
          const phone = session.customer_details?.phone || '';

          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = usersData?.users?.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());

          let userId = existingAuthUser?.id;

          if (!existingAuthUser) {
            const randomPassword = 'Ip_' + Math.random().toString(36).slice(-8) + '!2026';
            const { data: newAuthUser } = await supabaseAdmin.auth.admin.createUser({
              email: customerEmail,
              password: randomPassword,
              email_confirm: true,
              user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
              }
            });
            userId = newAuthUser?.user?.id;
          }

          if (userId) {
            const formattedAddress = typeof shippingAddress === 'string' ? shippingAddress : [
              shippingAddress.line1,
              shippingAddress.postal_code,
              shippingAddress.city,
              shippingAddress.state,
            ].filter(Boolean).join(', ');

            await supabaseAdmin.from('profiles').upsert({
              id: userId,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              address: formattedAddress || null,
            });
          }
        } catch (authErr) {
          console.error('Error auto-creating user on webhook:', authErr);
        }
      }

      // 3. (Opzionale) Aggiorna lo stock dei prodotti
      for (const item of items) {
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
