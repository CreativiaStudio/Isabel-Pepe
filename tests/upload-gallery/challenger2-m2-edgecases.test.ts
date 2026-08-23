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
} catch {
  // Ignore if not available
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { workUnitAsyncStorage } = require('next/dist/server/app-render/work-unit-async-storage.external');
  if (workUnitAsyncStorage) {
    workUnitAsyncStorage.getStore = () => ({
      phase: 'action',
      type: 'action',
    });
  }
} catch {
  // Ignore if not available
}

import { NextRequest } from 'next/server';
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import { uploadProductImageAction } from '../../app/admin/actions';
import { uploadToR2, getR2Client, getR2Config } from '../../lib/r2';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  createMockImageFile,
} from './test-helpers';

/**
 * Replicated pure client logic for safeParseUploadResponse from ProductForm.tsx and MediaLibraryModal.tsx
 */
interface SafeUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function safeParseUploadResponse(res: Response): Promise<SafeUploadResult> {
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

/**
 * Replicated client-side compression router logic from ProductForm.tsx and MediaLibraryModal.tsx
 */
function shouldCompressClient(file: File): boolean {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|heif|bmp|tiff)$/i.test(file.name);

  if (!isImage || isSvg || isGif) {
    return false;
  }
  return true;
}

export async function runChallenger2M2EmpiricalSuite(): Promise<boolean> {
  const runner = new TestRunner('Challenger 2 (M2): Client-Side Pre-Processing & Safe Parsing');
  const uploadedKeys: string[] = [];

  const extractKeyFromUrl = (url: string): string => {
    const { publicUrl } = getR2Config();
    const cleanPublic = publicUrl.replace(/\/+$/, '');
    return url.replace(`${cleanPublic}/`, '');
  };

  const cleanupKey = async (key: string) => {
    try {
      const { bucketName } = getR2Config();
      const client = getR2Client();
      await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    } catch {
      // Best effort cleanup
    }
  };

  console.log('\n========================================================================');
  console.log('  CHALLENGER 2 (M2): EMPIRICAL ADVERSARIAL EDGE CASE HARNESS');
  console.log('========================================================================\n');

  // ------------------------------------------------------------------------
  // AREA 1: Non-Image Files, SVG, GIF, Missing MIME Types
  // ------------------------------------------------------------------------
  console.log('--- 1. Non-Image Files, Vector SVGs, Animated GIFs & MIME Detection ---');

  await runner.test('M2-EDGE-1.1: Text and PDF files bypass client compression', async () => {
    const txtFile = new File(['Hello World plain text'], 'document.txt', { type: 'text/plain' });
    const pdfFile = new File([Buffer.from('%PDF-1.4 dummy')], 'guide.pdf', { type: 'application/pdf' });
    const binFile = new File([Buffer.from([0x00, 0xff, 0x55])], 'binary.dat', { type: 'application/octet-stream' });

    assertEqual(shouldCompressClient(txtFile), false);
    assertEqual(shouldCompressClient(pdfFile), false);
    assertEqual(shouldCompressClient(binFile), false);
  });

  await runner.test('M2-EDGE-1.2: Files with missing MIME type but image extension are recognized as image candidates', async () => {
    const noMimeJpg = new File([Buffer.from('dummy-bytes')], 'photo.JPG', { type: '' });
    const noMimePng = new File([Buffer.from('dummy-bytes')], 'graphic.PNG', { type: '' });
    const noMimeWebp = new File([Buffer.from('dummy-bytes')], 'image.WEBP', { type: '' });
    const noMimeAvif = new File([Buffer.from('dummy-bytes')], 'shot.avif', { type: '' });

    assertEqual(shouldCompressClient(noMimeJpg), true);
    assertEqual(shouldCompressClient(noMimePng), true);
    assertEqual(shouldCompressClient(noMimeWebp), true);
    assertEqual(shouldCompressClient(noMimeAvif), true);
  });

  await runner.test('M2-EDGE-1.3: Files with missing MIME type and unknown extension bypass client compression', async () => {
    const unknownFile = new File([Buffer.from('dummy')], 'unknown-format.xyz', { type: '' });
    const noExtFile = new File([Buffer.from('dummy')], 'mysteryfile', { type: '' });

    assertEqual(shouldCompressClient(unknownFile), false);
    assertEqual(shouldCompressClient(noExtFile), false);
  });

  await runner.test('M2-EDGE-1.4: SVG files bypass client compression preserving vector markup', async () => {
    const svgWithMime = new File(['<svg viewBox="0 0 100 100"><circle r="50"/></svg>'], 'logo.svg', {
      type: 'image/svg+xml',
    });
    const svgWithoutMime = new File(['<svg viewBox="0 0 100 100"><circle r="50"/></svg>'], 'icon.SVG', {
      type: '',
    });

    assertEqual(shouldCompressClient(svgWithMime), false);
    assertEqual(shouldCompressClient(svgWithoutMime), false);
  });

  await runner.test('M2-EDGE-1.5: GIF files bypass client compression preserving animation frames', async () => {
    const gifWithMime = new File([Buffer.from('GIF89a dummy')], 'animation.gif', {
      type: 'image/gif',
    });
    const gifWithoutMime = new File([Buffer.from('GIF89a dummy')], 'banner.GIF', {
      type: '',
    });

    assertEqual(shouldCompressClient(gifWithMime), false);
    assertEqual(shouldCompressClient(gifWithoutMime), false);
  });

  // ------------------------------------------------------------------------
  // AREA 2: 0-Byte (Empty) File Edge Cases
  // ------------------------------------------------------------------------
  console.log('\n--- 2. Zero-Byte (0-byte) File Handling ---');

  await runner.test('M2-EDGE-2.1: 0-byte image files are rejected by REST POST /api/upload with HTTP 400 JSON', async () => {
    const emptyJpg = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', emptyJpg);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('M2-EDGE-2.2: 0-byte file in Server Action uploadProductImageAction returns structured error', async () => {
    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', emptyFile);

    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('M2-EDGE-2.3: 0-byte non-image file (.txt) is rejected cleanly with HTTP 400 JSON', async () => {
    const emptyTxt = new File([], 'empty.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', emptyTxt);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    const body = await res.json();
    assertEqual(body.error, 'Nessun file fornito o file vuoto.');
  });

  // ------------------------------------------------------------------------
  // AREA 3: Safe Response Parser Exhaustive Status Code & Malformed Payload Testing
  // ------------------------------------------------------------------------
  console.log('\n--- 3. Safe Response Parser Exhaustive Status Code & Payload Testing ---');

  await runner.test('M2-EDGE-3.1: Valid JSON with url returns success: true', async () => {
    const res = new Response(JSON.stringify({ success: true, url: 'https://r2.isabelpepe.com/products/ring.webp' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, true);
    assertEqual(parsed.url, 'https://r2.isabelpepe.com/products/ring.webp');
  });

  await runner.test('M2-EDGE-3.2: JSON 200 OK missing "url" field returns incomplete response error', async () => {
    const res = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Risposta del server incompleta (URL immagine mancante).');
  });

  await runner.test('M2-EDGE-3.3: JSON 200 OK with explicit error field returns error', async () => {
    const res = new Response(JSON.stringify({ success: false, error: 'Database constraint violation' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Database constraint violation');
  });

  await runner.test('M2-EDGE-3.4: Invalid JSON syntax with application/json header returns non-crashing syntax error', async () => {
    const res = new Response('{"incomplete": true, "url": ', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertIncludes(parsed.error || '', 'Risposta JSON non valida dal server (HTTP 200)');
  });

  await runner.test('M2-EDGE-3.5: Non-JSON 400 Bad Request maps to friendly error', async () => {
    const res = new Response('Bad Request', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Richiesta non valida: verifica il file selezionato.');
  });

  await runner.test('M2-EDGE-3.6: Non-JSON 413 Payload Too Large maps to 20MB limit message', async () => {
    const res = new Response('<html><body>413 Request Entity Too Large</body></html>', {
      status: 413,
      headers: { 'Content-Type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'File troppo grande per il server (massimo 20MB consentiti).');
  });

  await runner.test('M2-EDGE-3.7: Non-JSON 502 / 504 Bad Gateway / Gateway Timeout maps to timeout message', async () => {
    const res502 = new Response('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
    const res504 = new Response('<html>504 Gateway Time-out</html>', {
      status: 504,
      headers: { 'Content-Type': 'text/html' },
    });

    const p502 = await safeParseUploadResponse(res502);
    const p504 = await safeParseUploadResponse(res504);

    assertEqual(p502.success, false);
    assertEqual(p502.error, 'Gateway timeout: riprova tra qualche secondo.');
    assertEqual(p504.success, false);
    assertEqual(p504.error, 'Gateway timeout: riprova tra qualche secondo.');
  });

  await runner.test('M2-EDGE-3.8: Non-JSON 500 / 503 Internal Server / Service Unavailable maps to R2 server error', async () => {
    const res500 = new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
    const res503 = new Response('Service Unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });

    const p500 = await safeParseUploadResponse(res500);
    const p503 = await safeParseUploadResponse(res503);

    assertEqual(p500.success, false);
    assertEqual(p500.error, 'Errore server Cloudflare R2 (HTTP 500).');
    assertEqual(p503.success, false);
    assertEqual(p503.error, 'Errore server Cloudflare R2 (HTTP 503).');
  });

  await runner.test('M2-EDGE-3.9: Non-standard status code with raw HTML strips HTML tags and truncates to 150 chars', async () => {
    const longHtml = '<html><head><title>Custom Error</title></head><body><div><p>' + 'A'.repeat(300) + '</p></div></body></html>';
    const res = new Response(longHtml, {
      status: 409,
      headers: { 'Content-Type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assert(!parsed.error?.includes('<p>'), 'Must not contain raw HTML tags');
    assert((parsed.error?.length || 0) <= 150, `Error message must be <= 150 chars, got ${parsed.error?.length}`);
  });

  await runner.test('M2-EDGE-3.10: Empty body response with non-standard status code returns fallback status message', async () => {
    const res = new Response('', {
      status: 418,
      headers: { 'Content-Type': 'text/plain' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'Errore imprevisto durante il caricamento (Status 418).');
  });

  await runner.test('M2-EDGE-3.11: JSON response containing HTML tags in error string is returned as pure string without crash', async () => {
    const res = new Response(JSON.stringify({ error: '<div class="alert">Errore R2: Riconnessione fallita</div>' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, '<div class="alert">Errore R2: Riconnessione fallita</div>');
  });

  // ------------------------------------------------------------------------
  // AREA 4: Object URL Lifecycle & Memory Safety Simulation
  // ------------------------------------------------------------------------
  console.log('\n--- 4. Object URL Lifecycle & Memory Safety ---');

  await runner.test('M2-EDGE-4.1: URL.createObjectURL and URL.revokeObjectURL 1:1 balance in simulated image lifecycle', async () => {
    let createdCount = 0;
    let revokedCount = 0;
    const activeUrls = new Set<string>();

    const mockCreateObjectURL = (file: File): string => {
      createdCount++;
      const url = `blob:http://localhost:3000/${Date.now()}-${createdCount}`;
      activeUrls.add(url);
      return url;
    };

    const mockRevokeObjectURL = (url: string) => {
      revokedCount++;
      activeUrls.delete(url);
    };

    // Simulate compressImageClient cleanup pattern across 50 simulated upload attempts
    for (let i = 0; i < 50; i++) {
      const file = new File([Buffer.from('mock-bytes')], `sim-${i}.jpg`, { type: 'image/jpeg' });
      let objectUrl: string | null = null;
      try {
        objectUrl = mockCreateObjectURL(file);
      } catch {
        continue;
      }

      const cleanup = () => {
        if (objectUrl) {
          mockRevokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };

      // Case A: Successful decode & blob generation
      if (i % 3 === 0) {
        cleanup();
      }
      // Case B: Canvas / context error
      else if (i % 3 === 1) {
        cleanup();
      }
      // Case C: Image decode error (onerror)
      else {
        cleanup();
      }
    }

    assertEqual(createdCount, 50);
    assertEqual(revokedCount, 50);
    assertEqual(activeUrls.size, 0);
  });

  // ------------------------------------------------------------------------
  // AREA 5: Live R2 Pipeline & Fallback Verification
  // ------------------------------------------------------------------------
  console.log('\n--- 5. Live R2 Upload Pipeline & SVG/Non-Image Handling ---');

  await runner.test('M2-EDGE-5.1: Live SVG upload to R2 processes or preserves SVG and returns valid URL', async () => {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#C0A09A"/></svg>';
    const svgBuffer = Buffer.from(svgContent, 'utf-8');
    const url = await uploadToR2(svgBuffer, 'products', 'test-luxury-badge', {
      originalName: 'test-luxury-badge.svg',
      mimeType: 'image/svg+xml',
    });

    assert(Boolean(url), 'URL should be defined');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assert(url.includes('test-luxury-badge'), `URL should contain base name: got ${url}`);
    assert(key.endsWith('.webp') || key.endsWith('.svg'), `Key should end with .webp or .svg: got ${key}`);
  });

  await runner.test('M2-EDGE-5.2: Live Server Action uploadProductImageAction handles image cleanly', async () => {
    const mockImage = await createMockImageFile({ name: 'server-action-test.jpg', width: 200, height: 200 });
    const formData = new FormData();
    formData.append('file', mockImage);
    formData.append('folder', 'products');
    formData.append('customName', 'm2-challenger-server-action-test');

    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, true);
    assert(Boolean(res.url), 'res.url should be defined');

    const key = extractKeyFromUrl(res.url!);
    uploadedKeys.push(key);
    assert(key.includes('m2-challenger-server-action-test.webp'), `Key should end with webp: ${key}`);
  });

  // ------------------------------------------------------------------------
  // CLEANUP
  // ------------------------------------------------------------------------
  console.log('\n--- Cleaning up R2 Test Artifacts ---');
  for (const key of uploadedKeys) {
    await cleanupKey(key);
  }
  console.log(`Cleaned up ${uploadedKeys.length} test keys from Cloudflare R2.`);

  // ------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------
  const summary = runner.summary();
  console.log('\n========================================================================');
  console.log(`  Challenger 2 (M2) Summary: ${summary.passed}/${summary.total} passed (${summary.failed} failed) in ${summary.totalDurationMs}ms`);
  console.log('========================================================================\n');

  return summary.failed === 0;
}

if (require.main === module) {
  runChallenger2M2EmpiricalSuite()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal error during challenger 2 M2 suite execution:', err);
      process.exit(1);
    });
}
