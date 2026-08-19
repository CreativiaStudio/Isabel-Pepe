import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json({ identified: false });
    }

    // 1. Cerca in visitor_identities (assegnazioni manuali o badge)
    const { data: identity } = await supabaseAdmin
      .from('visitor_identities')
      .select('person_name, notes')
      .eq('visitor_id', visitorId)
      .maybeSingle();

    // 2. Cerca in abandoned_carts (ultimi dati inseriti)
    const { data: cart } = await supabaseAdmin
      .from('abandoned_carts')
      .select('email, phone')
      .eq('visitor_id', visitorId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Cerca in crm_contacts
    let crmEmail = null;
    let crmPhone = null;
    let crmName = null;

    if (!cart?.email) {
      const { data: contact } = await supabaseAdmin
        .from('crm_contacts')
        .select('email, phone, first_name, last_name')
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (contact) {
        crmEmail = contact.email;
        crmPhone = contact.phone;
        crmName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
      }
    }

    const email = cart?.email || crmEmail || null;
    const phone = cart?.phone || crmPhone || null;
    const name = identity?.person_name || crmName || null;

    if (email) {
      return NextResponse.json({
        identified: true,
        email,
        phone,
        name,
      });
    }

    return NextResponse.json({ identified: false, name });
  } catch (error: any) {
    console.error('Error fetching visitor identity in cart:', error);
    return NextResponse.json({ identified: false });
  }
}
