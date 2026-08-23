import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Global Mocking for Next.js 16 Server Action & revalidatePath runtime context
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { workAsyncStorage } = require('next/dist/server/app-render/work-async-storage.external');
  if (workAsyncStorage) {
    workAsyncStorage.getStore = () => ({
      incrementalCache: {
        revalidateTag: () => {},
      },
      route: '/admin',
      page: '/admin',
    });
  }
} catch {}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { workUnitAsyncStorage } = require('next/dist/server/app-render/work-unit-async-storage.external');
  if (workUnitAsyncStorage) {
    workUnitAsyncStorage.getStore = () => ({
      phase: 'action',
      type: 'action',
    });
  }
} catch {}

import sharp from 'sharp';
import { uploadProductImageAction } from '../../app/admin/actions';
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createSampleImageBuffer,
  createMockImageFile,
  cleanupTestR2Object,
} from './test-helpers';

// Exact duplication of client-side safeParseUploadResponse from ProductForm.tsx / MediaLibraryModal.tsx
export interface SafeUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function safeParseUploadResponse(res: Response): Promise<SafeUploadResult> {
  try {
    const contentType = res.headers.get('content-type') || '';

    // 1. JSON Response
    if (contentType.includes('application/json')) {
      let data: any;
      try {
        data = await res.json();
      } catch {
        return {
          success: false,
          error: `Risposta JSON non valida dal server (HTTP ${res.status}).`,
        };
      }

      if (!res.ok || data.error) {
        return {
          success: false,
          error: data.error || `Errore HTTP ${res.status}: Impossibile completare il caricamento.`,
        };
      }

      if (!data.url) {
        return {
          success: false,
          error: 'Risposta del server incompleta (URL immagine mancante).',
        };
      }

      return { success: true, url: data.url };
    }

    // 2. Non-JSON Response (HTML error page from Next.js, Cloudflare, Nginx)
    const rawText = await res.text().catch(() => '');

    if (res.status === 413) {
      return {
        success: false,
        error: 'File troppo grande per il server (massimo 20MB consentiti).',
      };
    }
    if (res.status === 502 || res.status === 504) {
      return {
        success: false,
        error: 'Gateway timeout: riprova tra qualche secondo.',
      };
    }
    if (res.status >= 500) {
      return {
        success: false,
        error: `Errore server Cloudflare R2 (HTTP ${res.status}).`,
      };
    }
    if (res.status === 400) {
      return {
        success: false,
        error: 'Richiesta non valida: verifica il file selezionato.',
      };
    }

    const cleanText = rawText.replace(/<[^>]*>?/gm, '').trim();
    return {
      success: false,
      error: cleanText.slice(0, 150) || `Errore imprevisto durante il caricamento (Status ${res.status}).`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore imprevisto durante l\'elaborazione della risposta.',
    };
  }
}

// Emulated browser Canvas compressor replicating exact ProductForm.tsx compressImageClient logic
export async function simulateCompressImageClient(
  file: File,
  mockHooks?: {
    forceZeroDimensions?: boolean;
    forceNullContext?: boolean;
    forceNullBlob?: boolean;
    forceDrawImageError?: boolean;
    forceCreateObjectUrlThrow?: boolean;
    forceImageError?: boolean;
    onRevokeObjectURL?: (url: string) => void;
  }
): Promise<{ compressedFile: File; revokedUrls: string[]; dimensions: { width: number; height: number } }> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|heif|bmp|tiff)$/i.test(file.name);

  const revokedUrls: string[] = [];

  if (!isImage || isSvg || isGif) {
    return { compressedFile: file, revokedUrls, dimensions: { width: 0, height: 0 } };
  }

  let objectUrl: string | null = null;
  try {
    if (mockHooks?.forceCreateObjectUrlThrow) {
      throw new Error('DOMException: Failed to create Object URL');
    }
    objectUrl = `blob:http://localhost:3000/${Math.random().toString(36).substring(2)}`;
  } catch {
    return { compressedFile: file, revokedUrls, dimensions: { width: 0, height: 0 } };
  }

  const cleanup = () => {
    if (objectUrl) {
      revokedUrls.push(objectUrl);
      mockHooks?.onRevokeObjectURL?.(objectUrl);
      objectUrl = null;
    }
  };

  // Inspect image dimensions via sharp (emulating img.onload)
  let naturalWidth = 0;
  let naturalHeight = 0;

  try {
    if (mockHooks?.forceImageError) {
      throw new Error('Image decode error');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    naturalWidth = metadata.width || 0;
    naturalHeight = metadata.height || 0;
  } catch {
    // img.onerror handler in ProductForm.tsx
    cleanup();
    return { compressedFile: file, revokedUrls, dimensions: { width: 0, height: 0 } };
  }

  if (mockHooks?.forceZeroDimensions) {
    naturalWidth = 0;
    naturalHeight = 0;
  }

  if (naturalWidth === 0 || naturalHeight === 0) {
    cleanup();
    return { compressedFile: file, revokedUrls, dimensions: { width: 0, height: 0 } };
  }

  let width = naturalWidth;
  let height = naturalHeight;
  const maxDim = 2000;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  if (mockHooks?.forceNullContext || mockHooks?.forceDrawImageError || mockHooks?.forceNullBlob) {
    cleanup();
    return { compressedFile: file, revokedUrls, dimensions: { width, height } };
  }

  // Compress using sharp to WebP 85% at target dimensions
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const compressedBuffer = await sharp(inputBuffer)
    .resize(width, height)
    .webp({ quality: 85 })
    .toBuffer();

  cleanup();

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const compressedFile = new File([compressedBuffer], `${baseName}.webp`, {
    type: 'image/webp',
  });

  return { compressedFile, revokedUrls, dimensions: { width, height } };
}

export async function runChallengerM2StressSuite(): Promise<TestRunner> {
  const runner = new TestRunner('Challenger Milestone 2: Client Pre-Processing, Safe Parsing & 2-Tier Fallback');
  const uploadedUrlsToCleanup: string[] = [];

  console.log('\n⚔️  RUNNING ADVERSARIAL CHALLENGER SUITE (MILESTONE 2)  ⚔️\n');

  // =========================================================================
  // VECTOR 1: Canvas WebP Client Pre-Processing & Dimension Math
  // =========================================================================
  console.log('--- Vector 1: Canvas WebP Pre-Processing & Boundary Cases ---');

  await runner.test('V1.1: 6000x4000 Landscape Image scales to exactly 2000x1333 WebP (85% quality)', async () => {
    const rawBuffer = await sharp({
      create: { width: 6000, height: 4000, channels: 3, background: { r: 255, g: 100, b: 50 } }
    }).jpeg({ quality: 95 }).toBuffer();

    const rawFile = new File([rawBuffer], 'huge-camera-landscape.jpg', { type: 'image/jpeg' });
    const { compressedFile, revokedUrls, dimensions } = await simulateCompressImageClient(rawFile);

    assertEqual(compressedFile.type, 'image/webp', 'MIME type must be image/webp');
    assertEqual(compressedFile.name, 'huge-camera-landscape.webp', 'File extension must be .webp');
    assertEqual(dimensions.width, 2000, 'Long edge width must be exactly 2000');
    assertEqual(dimensions.height, 1333, 'Scaled height must preserve aspect ratio (1333)');
    assert(compressedFile.size < rawFile.size, `Compressed size (${compressedFile.size}B) must be smaller than raw (${rawFile.size}B)`);
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked cleanly');
  });

  await runner.test('V1.2: 3000x9000 Portrait Image scales to exactly 667x2000 WebP', async () => {
    const rawBuffer = await sharp({
      create: { width: 3000, height: 9000, channels: 3, background: { r: 50, g: 150, b: 255 } }
    }).png().toBuffer();

    const rawFile = new File([rawBuffer], 'ultra-tall-model.png', { type: 'image/png' });
    const { compressedFile, dimensions } = await simulateCompressImageClient(rawFile);

    assertEqual(compressedFile.type, 'image/webp', 'MIME type must be image/webp');
    assertEqual(dimensions.height, 2000, 'Long edge height must be exactly 2000');
    assertEqual(dimensions.width, 667, 'Scaled width must preserve aspect ratio (667)');
  });

  await runner.test('V1.3: 4000x4000 Square Image scales to exactly 2000x2000 WebP', async () => {
    const rawBuffer = await sharp({
      create: { width: 4000, height: 4000, channels: 3, background: { r: 212, g: 175, b: 55 } }
    }).jpeg().toBuffer();

    const rawFile = new File([rawBuffer], 'still-life-square.jpg', { type: 'image/jpeg' });
    const { compressedFile, dimensions } = await simulateCompressImageClient(rawFile);

    assertEqual(dimensions.width, 2000, 'Square width must be 2000');
    assertEqual(dimensions.height, 2000, 'Square height must be 2000');
  });

  await runner.test('V1.4: 800x600 Small Image is NOT upscaled, preserves 800x600 WebP', async () => {
    const rawBuffer = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 100, g: 100, b: 100 } }
    }).jpeg().toBuffer();

    const rawFile = new File([rawBuffer], 'small-thumb.jpg', { type: 'image/jpeg' });
    const { compressedFile, dimensions } = await simulateCompressImageClient(rawFile);

    assertEqual(dimensions.width, 800, 'Small width must remain 800 (no upscaling)');
    assertEqual(dimensions.height, 600, 'Small height must remain 600 (no upscaling)');
    assertEqual(compressedFile.type, 'image/webp');
  });

  await runner.test('V1.5: SVG Vector File passes through completely untouched', async () => {
    const svgContent = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="gold"/></svg>';
    const svgFile = new File([Buffer.from(svgContent)], 'brand-logo.svg', { type: 'image/svg+xml' });

    const { compressedFile } = await simulateCompressImageClient(svgFile);
    assertEqual(compressedFile.name, 'brand-logo.svg', 'SVG name must remain unchanged');
    assertEqual(compressedFile.type, 'image/svg+xml', 'SVG type must remain image/svg+xml');
    assertEqual(compressedFile.size, svgFile.size, 'SVG byte size must remain unchanged');
  });

  await runner.test('V1.6: Animated GIF File passes through untouched to protect animation frames', async () => {
    const gifBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
    const gifFile = new File([gifBuffer], 'sparkle-animation.gif', { type: 'image/gif' });

    const { compressedFile } = await simulateCompressImageClient(gifFile);
    assertEqual(compressedFile.name, 'sparkle-animation.gif');
    assertEqual(compressedFile.type, 'image/gif');
    assertEqual(compressedFile.size, gifFile.size);
  });

  await runner.test('V1.7: Non-Image File (.pdf / .txt) passes through safely', async () => {
    const docFile = new File([Buffer.from('PDF_DUMMY_CONTENT')], 'certificate.pdf', { type: 'application/pdf' });
    const { compressedFile } = await simulateCompressImageClient(docFile);
    assertEqual(compressedFile.name, 'certificate.pdf');
    assertEqual(compressedFile.type, 'application/pdf');
  });

  await runner.test('V1.8: Zero Dimension / Empty Image falls back cleanly to raw file', async () => {
    const sample = await createMockImageFile({ width: 200, height: 200 });
    const { compressedFile, revokedUrls } = await simulateCompressImageClient(sample, { forceZeroDimensions: true });
    assertEqual(compressedFile, sample, 'Must return original file on zero dimensions');
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked on zero dimensions');
  });

  await runner.test('V1.9: Canvas Context Unavailable (null ctx) falls back cleanly', async () => {
    const sample = await createMockImageFile({ width: 200, height: 200 });
    const { compressedFile, revokedUrls } = await simulateCompressImageClient(sample, { forceNullContext: true });
    assertEqual(compressedFile, sample, 'Must return original file if canvas context is null');
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked on null context');
  });

  await runner.test('V1.10: Canvas toBlob Failure (null blob) falls back cleanly', async () => {
    const sample = await createMockImageFile({ width: 200, height: 200 });
    const { compressedFile, revokedUrls } = await simulateCompressImageClient(sample, { forceNullBlob: true });
    assertEqual(compressedFile, sample, 'Must return original file if toBlob returns null');
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked on null blob');
  });

  await runner.test('V1.11: Canvas Draw Crash / DOMException falls back cleanly to raw file', async () => {
    const sample = await createMockImageFile({ width: 200, height: 200 });
    const { compressedFile, revokedUrls } = await simulateCompressImageClient(sample, { forceDrawImageError: true });
    assertEqual(compressedFile, sample, 'Must return original file on canvas exception');
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked on catch');
  });

  await runner.test('V1.12: Un-decodable Format (HEIC / corrupt) onerror falls back cleanly to raw file', async () => {
    const sample = await createMockImageFile({ corrupted: true, name: 'iphone-raw.heic' });
    const { compressedFile, revokedUrls } = await simulateCompressImageClient(sample, { forceImageError: true });
    assertEqual(compressedFile, sample, 'Must return original file on decode error for server-side Sharp handling');
    assertEqual(revokedUrls.length, 1, 'Object URL must be revoked on decode error');
  });

  await runner.test('V1.13: URL.createObjectURL Exception falls back cleanly to raw file', async () => {
    const sample = await createMockImageFile({ width: 200, height: 200 });
    const { compressedFile } = await simulateCompressImageClient(sample, { forceCreateObjectUrlThrow: true });
    assertEqual(compressedFile, sample, 'Must return original file if URL.createObjectURL throws');
  });

  // =========================================================================
  // VECTOR 2: Safe Response Parsing (`safeParseUploadResponse`)
  // =========================================================================
  console.log('\n--- Vector 2: Safe Response Parsing & HTML Error Trapping ---');

  await runner.test('V2.1: Valid JSON Success (200) parses URL correctly', async () => {
    const mockRes = new Response(JSON.stringify({ success: true, url: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/valid.webp' }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, true);
    assertEqual(parsed.url, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/valid.webp');
  });

  await runner.test('V2.2: Valid JSON Application Error (200 with error field) returns failure', async () => {
    const mockRes = new Response(JSON.stringify({ success: false, error: 'Database constraint violation' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Database constraint violation');
  });

  await runner.test('V2.3: Valid JSON HTTP 400 returns custom error message', async () => {
    const mockRes = new Response(JSON.stringify({ error: 'Nessun file fornito o file vuoto.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('V2.4: Valid JSON HTTP 413 returns 20MB limit error message', async () => {
    const mockRes = new Response(JSON.stringify({ error: 'La dimensione del file supera il limite massimo di 20MB.' }), {
      status: 413,
      headers: { 'content-type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  await runner.test('V2.5: Valid JSON HTTP 200 Missing "url" returns incomplete response error', async () => {
    const mockRes = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertIncludes(parsed.error || '', 'URL immagine mancante');
  });

  await runner.test('V2.6: Malformed JSON with application/json header does NOT throw SyntaxError', async () => {
    const malformedBody = '{"success": true, "url": "https://broken';
    const mockRes = new Response(malformedBody, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertIncludes(parsed.error || '', 'Risposta JSON non valida dal server (HTTP 200)');
  });

  await runner.test('V2.7: Cloudflare/Nginx 413 Payload Too Large HTML Page does NOT throw Unexpected token <', async () => {
    const nginxHtml = `
      <html>
      <head><title>413 Request Entity Too Large</title></head>
      <body>
      <center><h1>413 Request Entity Too Large</h1></center>
      <hr><center>nginx/1.18.0</center>
      </body>
      </html>
    `;
    const mockRes = new Response(nginxHtml, {
      status: 413,
      headers: { 'content-type': 'text/html; charset=UTF-8' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'File troppo grande per il server (massimo 20MB consentiti).');
  });

  await runner.test('V2.8: Cloudflare 502 Bad Gateway HTML Page translates to friendly gateway timeout error', async () => {
    const cfHtml = `
      <!DOCTYPE html>
      <html lang="en-US">
      <head><title>502 Bad Gateway</title></head>
      <body><h1>Bad Gateway</h1><p>Cloudflare could not reach your origin host.</p></body>
      </html>
    `;
    const mockRes = new Response(cfHtml, {
      status: 502,
      headers: { 'content-type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Gateway timeout: riprova tra qualche secondo.');
  });

  await runner.test('V2.9: 504 Gateway Timeout HTML Page translates to friendly gateway timeout error', async () => {
    const mockRes = new Response('<html><body>504 Gateway Timeout</body></html>', {
      status: 504,
      headers: { 'content-type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Gateway timeout: riprova tra qualche secondo.');
  });

  await runner.test('V2.10: Next.js 500 Internal Server Error Full HTML Stack Trace is safely trapped', async () => {
    const nextErrorHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>500: Internal Server Error</title></head>
      <body>
        <h1>Internal Server Error</h1>
        <pre>TypeError: Cannot read properties of undefined (reading 's3')
            at Object.uploadToR2 (C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\lib\\r2.ts:182:20)</pre>
      </body>
      </html>
    `;
    const mockRes = new Response(nextErrorHtml, {
      status: 500,
      headers: { 'content-type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Errore server Cloudflare R2 (HTTP 500).');
  });

  await runner.test('V2.11: 400 Bad Request HTML translates to friendly validation error', async () => {
    const mockRes = new Response('<html><body>Bad Request</body></html>', {
      status: 400,
      headers: { 'content-type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Richiesta non valida: verifica il file selezionato.');
  });

  await runner.test('V2.12: Unhandled 403 Forbidden with HTML & Script tags strips tags and limits length', async () => {
    const xssHtml = '<html><body><script>alert("xss")</script><p>Access Denied: You do not have permission to upload to this bucket.</p></body></html>';
    const mockRes = new Response(xssHtml, {
      status: 403,
      headers: { 'content-type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assert(!parsed.error?.includes('<script>'), 'HTML script tags must be stripped');
    assert(!parsed.error?.includes('</script>'), 'HTML tags must be stripped');
    assert(parsed.error!.length <= 150, 'Clean text must be capped at 150 characters');
    assertIncludes(parsed.error!, 'Access Denied');
  });

  await runner.test('V2.13: Empty Body (0 bytes) with text/plain Content-Type handles safely without crash', async () => {
    const mockRes = new Response('', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });

    const parsed = await safeParseUploadResponse(mockRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Errore imprevisto durante il caricamento (Status 200).');
  });

  await runner.test('V2.14: Corrupted Response Object whose text() throws rejects safely', async () => {
    const brokenRes = {
      status: 500,
      headers: { get: () => 'text/html' },
      text: () => Promise.reject(new Error('Stream closed prematurely')),
      json: () => Promise.reject(new Error('Not json')),
    } as unknown as Response;

    const parsed = await safeParseUploadResponse(brokenRes);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Errore server Cloudflare R2 (HTTP 500).');
  });

  // =========================================================================
  // VECTOR 3: 2-Tier Fallback Execution Simulation
  // =========================================================================
  console.log('\n--- Vector 3: 2-Tier Fallback Execution & Pipeline Resilience ---');

  await runner.test('V3.1: Tier 1 Happy Path — REST endpoint succeeds, Server Action is not called', async () => {
    const testFile = await createMockImageFile({ width: 200, height: 200, name: 'tier1-success.jpg' });
    let tier2Called = false;

    const mockFetch = async () => {
      return new Response(JSON.stringify({
        success: true,
        url: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-slot1-success.webp'
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    };

    const mockServerAction = async () => {
      tier2Called = true;
      return { success: true, url: 'https://r2.dev/fallback.webp' };
    };

    let uploadedUrl: string | undefined;
    let uploadError: string | undefined;

    const res = await mockFetch();
    const parsed = await safeParseUploadResponse(res);
    if (parsed.success && parsed.url) {
      uploadedUrl = parsed.url;
    } else {
      uploadError = parsed.error;
    }

    if (!uploadedUrl) {
      const actionRes = await mockServerAction();
      if (actionRes.success && actionRes.url) {
        uploadedUrl = actionRes.url;
      }
    }

    assertEqual(uploadedUrl, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-slot1-success.webp');
    assertEqual(tier2Called, false, 'Server Action must NOT be called when REST succeeds');
    assertEqual(uploadError, undefined);
  });

  await runner.test('V3.2: Tier 1 HTTP 500 HTML Failure triggers Tier 2 Server Action successfully', async () => {
    const testFile = await createMockImageFile({ width: 200, height: 200, name: 'tier2-fallback.jpg' });
    let tier2Called = false;

    const mockFetch = async () => {
      return new Response('<!DOCTYPE html><html><body>500 Internal Server Error</body></html>', {
        status: 500,
        headers: { 'content-type': 'text/html' }
      });
    };

    const mockServerAction = async (formData: FormData) => {
      tier2Called = true;
      return uploadProductImageAction(formData);
    };

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('folder', 'test-challenger-m2');
    const customName = `challenger-m2-fallback-${Date.now()}`;
    formData.append('customName', customName);

    let uploadedUrl: string | undefined;
    let uploadError: string | undefined;

    try {
      const res = await mockFetch();
      const parsed = await safeParseUploadResponse(res);
      if (parsed.success && parsed.url) {
        uploadedUrl = parsed.url;
      } else {
        uploadError = parsed.error;
      }
    } catch (fetchErr: any) {
      uploadError = fetchErr.message;
    }

    assertEqual(uploadedUrl, undefined);
    assertEqual(uploadError, 'Errore server Cloudflare R2 (HTTP 500).');

    if (!uploadedUrl) {
      try {
        const actionRes = await mockServerAction(formData);
        if (actionRes.success && actionRes.url) {
          uploadedUrl = actionRes.url;
          uploadError = undefined;
          uploadedUrlsToCleanup.push(actionRes.url);
        } else {
          uploadError = actionRes.error;
        }
      } catch (actionErr: any) {
        uploadError = actionErr.message;
      }
    }

    assertEqual(tier2Called, true, 'Server Action must be called when REST fails');
    assertDefined(uploadedUrl, 'Uploaded URL must be populated by Tier 2 fallback');
    assertIncludes(uploadedUrl, 'https://', 'Uploaded URL must be valid https R2 URL');
    assertEqual(uploadError, undefined, 'Upload error must be cleared on Tier 2 success');
  });

  await runner.test('V3.3: Tier 1 Network Exception (Failed to fetch) triggers Tier 2 Server Action successfully', async () => {
    const testFile = await createMockImageFile({ width: 200, height: 200, name: 'tier2-network-drop.jpg' });
    let tier2Called = false;

    const mockFetch = async (): Promise<Response> => {
      throw new TypeError('Failed to fetch (Network connection lost)');
    };

    const mockServerAction = async (formData: FormData) => {
      tier2Called = true;
      return uploadProductImageAction(formData);
    };

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('folder', 'test-challenger-m2');
    const customName = `challenger-m2-network-drop-${Date.now()}`;
    formData.append('customName', customName);

    let uploadedUrl: string | undefined;
    let uploadError: string | undefined;

    try {
      const res = await mockFetch();
      const parsed = await safeParseUploadResponse(res);
      if (parsed.success && parsed.url) {
        uploadedUrl = parsed.url;
      } else {
        uploadError = parsed.error;
      }
    } catch (fetchErr: any) {
      uploadError = fetchErr.message;
    }

    assertEqual(uploadError, 'Failed to fetch (Network connection lost)');

    if (!uploadedUrl) {
      const actionRes = await mockServerAction(formData);
      if (actionRes.success && actionRes.url) {
        uploadedUrl = actionRes.url;
        uploadError = undefined;
        uploadedUrlsToCleanup.push(actionRes.url);
      }
    }

    assertEqual(tier2Called, true);
    assertDefined(uploadedUrl);
    assertEqual(uploadError, undefined);
  });

  await runner.test('V3.4: Dual Failure (REST 500 + Server Action Error) captures slot error and preserves pending file', async () => {
    const testFile = await createMockImageFile({ width: 200, height: 200, name: 'dual-failure.jpg' });

    let slotErrors: Record<string, string | undefined> = {};
    let pendingFiles: Record<string, File | undefined> = {};
    let message = '';

    const slotKey = 'slot3';

    const mockFetch = async () => new Response('<html><body>502 Bad Gateway</body></html>', { status: 502 });
    const mockServerAction = async () => ({ success: false, error: 'Cloudflare R2 Authentication Failed' });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('folder', 'products');

    let uploadedUrl: string | undefined;
    let uploadError: string | undefined;

    try {
      const res = await mockFetch();
      const parsed = await safeParseUploadResponse(res);
      if (parsed.success && parsed.url) {
        uploadedUrl = parsed.url;
      } else {
        uploadError = parsed.error;
      }
    } catch (fetchErr: any) {
      uploadError = fetchErr.message;
    }

    if (!uploadedUrl) {
      try {
        const actionRes = await mockServerAction();
        if (actionRes.success && actionRes.url) {
          uploadedUrl = actionRes.url;
          uploadError = undefined;
        } else {
          uploadError = actionRes.error || uploadError || 'Errore durante il caricamento fallback su Cloudflare R2.';
        }
      } catch (actionErr: any) {
        uploadError = actionErr.message;
      }
    }

    if (uploadedUrl) {
      slotErrors[slotKey] = undefined;
      pendingFiles[slotKey] = undefined;
    } else {
      slotErrors[slotKey] = uploadError || 'Caricamento non riuscito';
      pendingFiles[slotKey] = testFile;
      message = `❌ Errore caricamento foto (${slotKey}): ${uploadError}`;
    }

    assertEqual(slotErrors[slotKey], 'Cloudflare R2 Authentication Failed');
    assertEqual(pendingFiles[slotKey], testFile, 'Original File must be preserved in pendingFiles for retry');
    assertIncludes(message, 'Cloudflare R2 Authentication Failed');
  });

  // =========================================================================
  // VECTOR 4: Per-Slot State Management & 1-Click Retry Mechanics
  // =========================================================================
  console.log('\n--- Vector 4: Per-Slot Error State & 1-Click Retry Mechanics ---');

  await runner.test('V4.1: handleRetrySlot re-submits pending file and resolves slot error upon success', async () => {
    const testFile = await createMockImageFile({ width: 200, height: 200, name: 'retry-photo.jpg' });

    let slotUrls: Record<string, string> = {};
    let slotErrors: Record<string, string | undefined> = { slot2: 'Timeout connection' };
    let pendingFiles: Record<string, File | undefined> = { slot2: testFile };
    let uploadingSlots: Record<string, boolean> = {};

    const executeSlotUpload = async (file: File, slotKey: string, simulateSuccess: boolean) => {
      uploadingSlots[slotKey] = true;
      try {
        if (simulateSuccess) {
          const customName = `retry-success-${Date.now()}`;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'test-challenger-m2');
          formData.append('customName', customName);

          const res = await uploadProductImageAction(formData);
          if (res.success && res.url) {
            slotUrls[slotKey] = res.url;
            slotErrors[slotKey] = undefined;
            pendingFiles[slotKey] = undefined;
            uploadedUrlsToCleanup.push(res.url);
          }
        }
      } finally {
        uploadingSlots[slotKey] = false;
      }
    };

    const handleRetrySlot = async (slotKey: string) => {
      const file = pendingFiles[slotKey];
      if (file) {
        await executeSlotUpload(file, slotKey, true);
      }
    };

    await handleRetrySlot('slot2');

    assertDefined(slotUrls['slot2'], 'Slot 2 URL must be populated after retry');
    assertEqual(slotErrors['slot2'], undefined, 'Slot 2 error must be cleared');
    assertEqual(pendingFiles['slot2'], undefined, 'Pending file must be cleared after successful retry');
    assertEqual(uploadingSlots['slot2'], false, 'Uploading state must be false');
  });

  await runner.test('V4.2: handleRemovePhoto clears all slot state cleanly', async () => {
    let previews: Record<string, string> = { slot1: 'blob:http://localhost/temp-preview' };
    let slotUrls: Record<string, string> = { slot1: 'https://r2.dev/products/old.webp' };
    let slotErrors: Record<string, string | undefined> = { slot1: 'Some error' };
    let pendingFiles: Record<string, File | undefined> = { slot1: new File([], 'temp.jpg') };
    let clearedSlots: Record<string, boolean> = {};

    const handleRemovePhoto = (slotKey: string) => {
      clearedSlots[slotKey] = true;
      previews[slotKey] = '';
      slotUrls[slotKey] = '';
      slotErrors[slotKey] = undefined;
      pendingFiles[slotKey] = undefined;
    };

    handleRemovePhoto('slot1');

    assertEqual(clearedSlots['slot1'], true);
    assertEqual(previews['slot1'], '');
    assertEqual(slotUrls['slot1'], '');
    assertEqual(slotErrors['slot1'], undefined);
    assertEqual(pendingFiles['slot1'], undefined);
  });

  await runner.test('V4.3: Form submit is blocked when any slot is uploading (uploadingSlots guard)', async () => {
    const uploadingSlots: Record<string, boolean> = { slot1: false, slot2: true, slot3: false };
    let formSubmitted = false;
    let message = '';

    const handleSubmitSimulation = () => {
      if (Object.values(uploadingSlots).some(Boolean)) {
        message = '⏳ Attendi il completamento del caricamento delle foto prima di salvare.';
        return;
      }
      formSubmitted = true;
    };

    handleSubmitSimulation();

    assertEqual(formSubmitted, false, 'Form submit must be blocked while upload is active');
    assertEqual(message, '⏳ Attendi il completamento del caricamento delle foto prima di salvare.');
  });

  console.log('\n--- Challenger Milestone 2 Cleanup ---');
  for (const url of uploadedUrlsToCleanup) {
    try {
      await cleanupTestR2Object(url);
    } catch {}
  }

  return runner;
}

if (require.main === module) {
  runChallengerM2StressSuite()
    .then((runner) => {
      const summary = runner.summary();
      console.log('\n========================================================================');
      console.log(` Challenger Milestone 2 Results: ${summary.passed}/${summary.total} passed in ${summary.totalDurationMs}ms`);
      console.log('========================================================================');
      if (summary.failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('Fatal test error:', err);
      process.exit(1);
    });
}
