import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { VisitorIdentityRecord } from '@/types/analytics';
import { verifyAdminAuth } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitor_id') || searchParams.get('visitorId');

    if (visitorId) {
      const { data, error } = await supabaseAdmin
        .from('visitor_identities')
        .select('*')
        .eq('visitor_id', visitorId)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ identity: data || null });
    }

    const { data: allIdentities, error } = await supabaseAdmin
      .from('visitor_identities')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ identities: allIdentities || [] });
  } catch (error: any) {
    console.error('Identity GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const visitorId = body.visitorId || body.visitor_id;
    const { name, email, phone, role, notes } = body;

    if (!visitorId || !name) {
      return NextResponse.json(
        { error: 'visitorId and name are required fields' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const identityPayload: Partial<VisitorIdentityRecord> = {
      visitor_id: visitorId.trim(),
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone: phone ? phone.trim() : null,
      role: role ? role.trim().toLowerCase() : 'customer',
      notes: notes ? notes.trim() : null,
      updated_at: nowIso,
    };

    const { data, error } = await supabaseAdmin
      .from('visitor_identities')
      .upsert(identityPayload, { onConflict: 'visitor_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving visitor identity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      identity: data,
    });
  } catch (error: any) {
    console.error('Identity POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
