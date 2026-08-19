import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, name, email, phone, role, notes } = body;

    if (!visitorId || !name) {
      return NextResponse.json({ error: 'visitorId and name are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('visitor_identities')
      .upsert({
        visitor_id: visitorId,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        role: role || 'guest',
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'visitor_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving visitor identity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, identity: data });
  } catch (error: any) {
    console.error('Identity API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
