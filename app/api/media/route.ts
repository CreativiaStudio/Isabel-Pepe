import { NextResponse } from 'next/server';
import { getMediaLibrary } from '@/app/admin/actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await getMediaLibrary();
    return NextResponse.json({ 
      success: true, 
      files 
    });
  } catch (error: any) {
    console.error("Errore API Media:", error);
    return NextResponse.json({ 
      error: error.message || 'Errore nel recupero della libreria media' 
    }, { status: 500 });
  }
}
