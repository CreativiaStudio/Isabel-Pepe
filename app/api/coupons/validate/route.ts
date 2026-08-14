import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Codice non fornito' }, { status: 400 });
    }

    // 1. Cerca il coupon
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: 'Codice inesistente o scaduto' }, { status: 404 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: 'Codice non più attivo' }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Codice scaduto' }, { status: 400 });
    }

    // 2. Controllo Email Vincolante
    if (coupon.target_email && coupon.target_email.toLowerCase() !== email?.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Questo codice sconto è riservato a un altro account. Inserisci la mail corretta.' 
      }, { status: 403 });
    }

    // Restituisci il valore dello sconto
    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      discount_amount: coupon.discount_amount,
    });

  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
