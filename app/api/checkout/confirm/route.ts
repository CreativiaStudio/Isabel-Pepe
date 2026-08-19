import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // 1. Recupera la sessione direttamente da Stripe con le chiavi Live
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, message: 'Payment not completed' });
    }

    const customerEmail = session.customer_details?.email || '';
    const customerName = session.customer_details?.name || 'Cliente Isabel Pepe';
    const amountTotal = (session.amount_total || 0) / 100;
    const shippingAddress = (session as any).shipping_details?.address || (session as any).collected_information?.shipping_details?.address || {};
    const metadata = session.metadata || {};
    const items = metadata.cart_items ? JSON.parse(metadata.cart_items) : [];

    // 2. Controlla se l'ordine è già presente nel DB
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (!existingOrder) {
      // Salva l'ordine
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([{
          stripe_session_id: sessionId,
          customer_email: customerEmail,
          customer_name: customerName,
          amount_total: amountTotal,
          status: 'paid',
          shipping_address: shippingAddress,
          items: items,
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order in DB:', orderError);
      } else {
        console.log('✅ Order confirmed and inserted in DB:', orderData.id);

        // Invia email di conferma ordine ufficiale in background
        if (customerEmail && orderData?.id) {
          sendOrderConfirmationEmail({
            customerEmail,
            customerName,
            orderId: orderData.id,
            amountTotal,
            items,
            shippingAddress,
          }).catch((err) => console.error('Error sending order confirmation email:', err));
        }
      }

      // Aggiorna carrello abbandonato a recuperato
      if (metadata.abandoned_cart_id) {
        await supabaseAdmin
          .from('abandoned_carts')
          .update({ status: 'recovered', updated_at: new Date().toISOString() })
          .eq('id', metadata.abandoned_cart_id);
      }

      // 3. Auto-creazione Silenziosa Account Utente & Profilo nel DB
      if (customerEmail) {
        try {
          const nameParts = customerName.split(' ');
          const firstName = nameParts[0] || 'Cliente';
          const lastName = nameParts.slice(1).join(' ') || 'Isabel Pepe';
          const phone = session.customer_details?.phone || '';

          // Controlla se l'utente esiste già in Auth
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = usersData?.users?.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());

          let userId = existingAuthUser?.id;

          if (!existingAuthUser) {
            // Crea automaticamente l'utente in background con email già confermata
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
          console.error('Error auto-creating user on checkout:', authErr);
        }
      }

      // Inoltro Server-Side Purchase Event a N8N per Meta Conversions API (CAPI)
      const n8nWebhookUrl = process.env.N8N_MASTER_WEBHOOK_URL || 'https://n8n.creativiastudio.com/webhook/master-creativia-os';
      try {
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: 'isabel-pepe',
            event: 'purchase',
            data: {
              order_id: orderData?.id,
              stripe_session_id: sessionId,
              email: customerEmail,
              name: customerName,
              phone: session.customer_details?.phone || '',
              amount: amountTotal,
              currency: 'EUR',
              items: items,
              shipping_address: shippingAddress,
              visitor_id: metadata.visitor_id || null,
              consent_id: metadata.consent_id || null,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch(() => {});
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      customerEmail,
      customerName,
      amountTotal,
    });
  } catch (error: any) {
    console.error('Error in checkout confirm route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
