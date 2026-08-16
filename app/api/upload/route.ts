import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('customName') as string | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 });
    }

    const publicUrl = await uploadToR2(
      file, 
      folder, 
      customName || `isabel-pepe-upload-${Date.now()}`
    );

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error: any) {
    console.error('Errore durante il caricamento immagine su R2:', error);
    return NextResponse.json({ 
      error: error.message || 'Errore durante il caricamento su Cloudflare R2' 
    }, { status: 500 });
  }
}
