import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerEmail, customerPhone, visitorId, consentId } = body;

    if (!visitorId && !customerEmail) {
      return NextResponse.json({ error: 'visitorId or email required' }, { status: 400 });
    }

    const totalAmount = Array.isArray(items) 
      ? items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0)
      : 0;

    // 1. Controlla il consenso marketing nel database tramite consentId
    let marketingConsent = false;
    if (consentId) {
      const { data: consentRecord } = await supabaseAdmin
        .from('cookie_consents')
        .select('marketing')
        .eq('consent_id', consentId)
        .single();
      marketingConsent = Boolean(consentRecord?.marketing);
    }

    // 2. Se c'è un'email, salviamo/aggiorniamo il carrello tracciato
    if (customerEmail && Array.isArray(items) && items.length > 0) {
      const { data: cartData, error: cartError } = await supabaseAdmin
        .from('abandoned_carts')
        .upsert({
          email: customerEmail.toLowerCase().trim(),
          phone: customerPhone || null,
          cart_items: items,
          total_amount: totalAmount,
          status: 'abandoned',
          visitor_id: visitorId || null,
          consent_id: consentId || null,
          marketing_consent: marketingConsent,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' })
        .select()
        .single();

      if (cartError) {
        console.error('Error syncing abandoned cart in Supabase:', cartError);
      }

      // 3. Salvataggio / Sync nel CRM (crm_contacts)
      const { error: crmError } = await supabaseAdmin
        .from('crm_contacts')
        .upsert({
          email: customerEmail.toLowerCase().trim(),
          phone: customerPhone || null,
          visitor_id: visitorId || null,
          consent_id: consentId || null,
          marketing_consent: marketingConsent,
          status: 'abandoned_cart',
          tags: ['isabel-pepe', 'cart-abandoned', marketingConsent ? 'gdpr-marketing-ok' : 'gdpr-essential-only'],
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (crmError) {
        console.error('Error syncing CRM contact:', crmError);
      }

      // 4. Inoltro Server-Side al Master Webhook N8N / Creativia OS (se configurato)
      const n8nWebhookUrl = process.env.N8N_MASTER_WEBHOOK_URL || 'https://n8n.creativiastudio.com/webhook/master-creativia-os';
      try {
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: 'isabel-pepe',
            event: 'abandoned_cart',
            data: {
              email: customerEmail,
              phone: customerPhone,
              totalAmount,
              itemCount: items.length,
              items: items.map((i: any) => ({ name: i.name, price: i.price, quantity: i.quantity })),
              visitorId,
              consentId,
              marketingConsent,
            },
          }),
        }).catch(() => {}); // Non blocca se il webhook è offline
      } catch (err) {
        // Silenzioso
      }
    }

    return NextResponse.json({ success: true, totalAmount, marketingConsent });
  } catch (error: any) {
    console.error('Cart Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
