import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { consentId, visitorId, categories, consentType } = body;

    if (!consentId || !visitorId) {
      return NextResponse.json({ error: 'Missing consentId or visitorId' }, { status: 400 });
    }

    // Estrazione IP e User Agent lato server per compliance GDPR (prova legale di consenso)
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const essential = true;
    const functional = Boolean(categories?.functional);
    const analytics = Boolean(categories?.analytics);
    const marketing = Boolean(categories?.marketing);

    // 1. Salva o aggiorna il log del consenso in Supabase
    const { data: consentData, error: consentError } = await supabaseAdmin
      .from('cookie_consents')
      .upsert({
        consent_id: consentId,
        visitor_id: visitorId,
        essential: essential,
        functional: functional,
        analytics: analytics,
        marketing: marketing,
        consent_type: consentType || 'custom',
        ip_address: ipAddress,
        user_agent: userAgent,
        policy_version: '1.0',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'consent_id' })
      .select()
      .single();

    if (consentError) {
      console.error('Error saving cookie consent in Supabase:', consentError);
    }

    // 2. Se ci sono carrelli abbandonati per questo visitor_id, aggiorna il flag di marketing_consent
    await supabaseAdmin
      .from('abandoned_carts')
      .update({
        consent_id: consentId,
        marketing_consent: marketing,
        updated_at: new Date().toISOString(),
      })
      .eq('visitor_id', visitorId);

    // 3. Se presente nei contatti CRM, sincronizza lo stato del consenso
    await supabaseAdmin
      .from('crm_contacts')
      .update({
        consent_id: consentId,
        marketing_consent: marketing,
        updated_at: new Date().toISOString(),
      })
      .eq('visitor_id', visitorId);

    return NextResponse.json({
      success: true,
      consentId: consentId,
      categories: { essential, functional, analytics, marketing },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Consent API Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
