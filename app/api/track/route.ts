import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { path, visitorId, consentId } = await req.json();

    if (!path || !visitorId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Ignora percorsi di amministrazione, API o asset interni
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const { error } = await supabaseAdmin
      .from('page_views')
      .insert([
        {
          visitor_id: visitorId,
          consent_id: consentId || null,
          path: path,
        }
      ]);

    if (error) {
      console.error('Error saving page view:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tracker API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
