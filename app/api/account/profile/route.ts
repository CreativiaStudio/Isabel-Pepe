import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, address } = body;

    // 1. Aggiorna tabella profiles
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Sincronizza anche la tabella customers se l'email esiste
    if (user.email) {
      await supabaseAdmin
        .from('customers')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
        .eq('email', user.email);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message || 'Errore server' }, { status: 500 });
  }
}
