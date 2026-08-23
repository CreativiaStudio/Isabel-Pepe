import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, max-age=0',
};

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (parseError: unknown) {
      console.error('[API /api/upload] Errore parsing FormData:', parseError);
      return NextResponse.json(
        { error: 'Payload non valido o upload interrotto.' },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const file = formData.get('file') as File | null;
    const customNameRaw = formData.get('customName') as string | null;
    const folderRaw = formData.get('folder') as string | null;

    // 1. File Presence & Non-Zero Size Validation
    if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
      return NextResponse.json(
        { error: 'Nessun file fornito o file vuoto.' },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // 2. 20MB Size Limit Check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'La dimensione del file supera il limite massimo di 20MB.' },
        { status: 413, headers: JSON_HEADERS }
      );
    }

    const folder = folderRaw && folderRaw.trim() ? folderRaw.trim() : 'products';
    const customName = customNameRaw && customNameRaw.trim() ? customNameRaw.trim() : undefined;

    // 3. Upload to R2
    const publicUrl = await uploadToR2(file, folder, customName);

    return NextResponse.json(
      { success: true, url: publicUrl },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: unknown) {
    console.error('[API /api/upload] Errore durante il caricamento immagine su R2:', error);
    const msg = error instanceof Error ? error.message : String(error || '');
    const errName = error instanceof Error ? error.name : '';
    const is413 = msg.toLowerCase().includes('payload') || msg.toLowerCase().includes('too large') || errName === 'PayloadTooLargeError';
    const status = is413 ? 413 : 500;
    const errorText = is413
      ? 'La dimensione del file supera il limite massimo di 20MB.'
      : `Errore durante il caricamento su Cloudflare R2: ${msg || 'Errore interno del server'}`;

    return NextResponse.json(
      { error: errorText },
      { status, headers: JSON_HEADERS }
    );
  }
}
