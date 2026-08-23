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
import { uploadToR2, getR2Client, getR2Config } from '../../lib/r2';
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import { uploadProductImageAction } from '../../app/admin/actions';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  createMockImageFile,
  safeParseUploadResponse,
} from './test-helpers';

export async function runChallenger2AdversarialSuite(): Promise<boolean> {
  const runner = new TestRunner('Challenger 2: Adversarial Hardening Suite');
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

  console.log('\n======================================================');
  console.log('  CHALLENGER 2: ADVERSARIAL STRESS-TEST SUITE');
  console.log('======================================================\n');

  // ------------------------------------------------------------------------
  // SUITE 1: Directory Traversal Attacks (lib/r2.ts & /api/upload)
  // ------------------------------------------------------------------------
  console.log('--- 1. Directory Traversal Resistance & Sanitization ---');

  await runner.test('ADV-1.1: folder="../../../etc" path traversal check', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, '../../../etc', 'traversal-folder-1');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assert(!key.includes('..'), `Key must not contain '..': got ${key}`);
    // Check if leading slashes leaked into the key due to regex order
    const hasLeadingSlashLeak = key.startsWith('/');
    if (hasLeadingSlashLeak) {
      console.warn(`    [OBSERVATION] Leading slash leak observed in R2 key: "${key}" (caused by folder.replace(/^\/+/).replace(/\\.\\./))`);
    }
    assert(!key.startsWith('/'), `Key must not start with '/': got "${key}"`);
  });

  await runner.test('ADV-1.2: folder=".../...//etc" and leading/trailing slashes are sanitized', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, '///products///', 'slashes-test');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assert(!key.startsWith('/'), `Key must not start with '/': got ${key}`);
    assertEqual(key, 'products/slashes-test.webp');
  });

  await runner.test('ADV-1.3: folder="   " (whitespace-only) defaults to "products"', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, '   ', 'blank-folder-test');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assert(key.startsWith('products/'), `Key should default to 'products/': got ${key}`);
  });

  await runner.test('ADV-1.4: customName="foo/bar/../../baz" sanitizes path traversal completely', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'foo/bar/../../baz');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assert(!key.includes('..'), `Key should not contain '..': got ${key}`);
    assert(!key.replace('products/', '').includes('/'), `Filename portion must not contain slashes: got ${key}`);
    assertEqual(key, 'products/foo-bar-baz.webp');
  });

  await runner.test('ADV-1.5: customName="../../shadow" sanitizes traversal without escaping folder', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', '../../shadow');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/shadow.webp');
  });

  await runner.test('ADV-1.6: customName with unicode & special symbols is slugified safely', async () => {
    const file = await createMockImageFile({ name: 'safe.jpg', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'Set Isabel Rosé (A145) #1 - Spec!al & Cool');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/set-isabel-rose-a145-1-spec-al-cool.webp');
  });

  // ------------------------------------------------------------------------
  // SUITE 2: Key Extension Duplication Prevention
  // ------------------------------------------------------------------------
  console.log('\n--- 2. Key Extension Duplication Prevention ---');

  await runner.test('ADV-2.1: customName="photo.jpg" on JPEG produces "photo.webp" (NOT "photo.jpg.webp")', async () => {
    const file = await createMockImageFile({ name: 'original.jpg', format: 'jpeg', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'photo.jpg');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/photo.webp');
  });

  await runner.test('ADV-2.2: customName="ring.png" on PNG produces "ring.webp" (NOT "ring.png.webp")', async () => {
    const file = await createMockImageFile({ name: 'original.png', format: 'png', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'ring.png');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/ring.webp');
  });

  await runner.test('ADV-2.3: customName="banner.webp" on WebP produces "banner.webp" (NOT "banner.webp.webp")', async () => {
    const file = await createMockImageFile({ name: 'original.webp', format: 'webp', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'banner.webp');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/banner.webp');
  });

  await runner.test('ADV-2.4: customName="necklace.final.v2.jpg" produces "necklace-final-v2.webp"', async () => {
    const file = await createMockImageFile({ name: 'original.jpg', format: 'jpeg', width: 100, height: 100 });
    const url = await uploadToR2(file, 'products', 'necklace.final.v2.jpg');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'products/necklace-final-v2.webp');
  });

  await runner.test('ADV-2.5: Sharp failure fallback on corrupt image maintains detected ext without duplication', async () => {
    const file = await createMockImageFile({ name: 'corrupted-item.jpg', corrupted: true });
    const url = await uploadToR2(file, 'products', 'corrupted-item.jpg');
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    // Corrupted file fails Sharp optimization and falls back to raw buffer with detected initial extension 'jpg'
    assertEqual(key, 'products/corrupted-item.jpg');
  });

  await runner.test('ADV-2.6: Non-image PDF upload preserves "pdf" extension cleanly', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 sample non-image pdf binary stream');
    const url = await uploadToR2(pdfBuffer, 'documents', 'catalog-guide.pdf', {
      originalName: 'catalog-guide.pdf',
      mimeType: 'application/pdf',
    });
    const key = extractKeyFromUrl(url);
    uploadedKeys.push(key);

    assertEqual(key, 'documents/catalog-guide.pdf');
  });

  // ------------------------------------------------------------------------
  // SUITE 3: Empty Payload and Malformed FormData Rejection
  // ------------------------------------------------------------------------
  console.log('\n--- 3. Empty Payload & Malformed FormData Rejection ---');

  await runner.test('ADV-3.1: POST /api/upload with non-multipart raw text returns HTTP 400 JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: 'INVALID_RAW_NON_MULTIPART_STRING',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'Payload non valido o upload interrotto.');
  });

  await runner.test('ADV-3.2: POST /api/upload with raw JSON body returns HTTP 400 JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: JSON.stringify({ file: 'not-a-file', customName: 'test' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'Payload non valido o upload interrotto.');
  });

  await runner.test('ADV-3.3: POST /api/upload with empty FormData returns HTTP 400 JSON', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('ADV-3.4: POST /api/upload with string in "file" field returns HTTP 400 JSON', async () => {
    const formData = new FormData();
    formData.append('file', 'just-a-string-value');
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('ADV-3.5: POST /api/upload with 0-byte File returns HTTP 400 JSON', async () => {
    const formData = new FormData();
    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
    formData.append('file', emptyFile);
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('ADV-3.6: POST /api/upload with >20MB file returns HTTP 413 JSON', async () => {
    const formData = new FormData();
    const oversizedBuffer = Buffer.alloc(20 * 1024 * 1024 + 1024); // 20MB + 1KB
    const oversizedFile = new File([oversizedBuffer], 'huge.jpg', { type: 'image/jpeg' });
    formData.append('file', oversizedFile);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 413);
    assertEqual(res.headers.get('content-type'), 'application/json');
    const body = await res.json();
    assertEqual(body.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  // ------------------------------------------------------------------------
  // SUITE 4: Server Action uploadProductImageAction Adversarial Validation
  // ------------------------------------------------------------------------
  console.log('\n--- 4. Server Action uploadProductImageAction Adversarial Inputs ---');

  await runner.test('ADV-4.1: uploadProductImageAction(null as any) returns structured error object', async () => {
    const res = await uploadProductImageAction(null as unknown as FormData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'Dati del modulo non validi o mancanti.');
  });

  await runner.test('ADV-4.2: uploadProductImageAction(undefined as any) returns structured error object', async () => {
    const res = await uploadProductImageAction(undefined as unknown as FormData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'Dati del modulo non validi o mancanti.');
  });

  await runner.test('ADV-4.3: uploadProductImageAction with empty FormData returns structured error', async () => {
    const formData = new FormData();
    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('ADV-4.4: uploadProductImageAction with 0-byte file returns structured error', async () => {
    const formData = new FormData();
    formData.append('file', new File([], 'zero.jpg', { type: 'image/jpeg' }));
    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('ADV-4.5: uploadProductImageAction with >20MB file returns structured error', async () => {
    const formData = new FormData();
    const hugeBuffer = Buffer.alloc(20 * 1024 * 1024 + 500);
    formData.append('file', new File([hugeBuffer], 'huge.jpg', { type: 'image/jpeg' }));
    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, false);
    assertEqual(res.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  await runner.test('ADV-4.6: uploadProductImageAction with traversal folder and customName sanitizes safely', async () => {
    const formData = new FormData();
    const file = await createMockImageFile({ name: 'action-safe.jpg', width: 100, height: 100 });
    formData.append('file', file);
    formData.append('folder', 'certificates');
    formData.append('customName', 'test/../../action-sanitized');

    const res = await uploadProductImageAction(formData);
    assertEqual(res.success, true);
    assert(Boolean(res.url), 'res.url should be defined');

    const key = extractKeyFromUrl(res.url!);
    uploadedKeys.push(key);

    assert(!key.includes('..'), `Key should not contain '..': got ${key}`);
    assert(!key.startsWith('/'), `Key should not start with '/': got ${key}`);
    assert(key.includes('action-sanitized.webp'), `Key should contain sanitized filename: got ${key}`);
  });

  // ------------------------------------------------------------------------
  // SUITE 5: Guaranteed application/json Content-Type & Client Safe Parsing
  // ------------------------------------------------------------------------
  console.log('\n--- 5. Guaranteed JSON Headers & Safe Response Parsing ---');

  await runner.test('ADV-5.1: 200 OK has Content-Type: application/json and Cache-Control: no-store', async () => {
    const formData = new FormData();
    const file = await createMockImageFile({ name: 'valid-header.jpg', width: 100, height: 100 });
    formData.append('file', file);
    formData.append('customName', 'valid-header-check');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 200);
    assertEqual(res.headers.get('content-type'), 'application/json');
    assertEqual(res.headers.get('cache-control'), 'no-store, max-age=0');

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, true);
    assert(Boolean(parsed.url), 'parsed.url should be defined');
    uploadedKeys.push(extractKeyFromUrl(parsed.url!));
  });

  await runner.test('ADV-5.2: 400 Bad Request has Content-Type: application/json and parses via safeParseUploadResponse', async () => {
    const formData = new FormData();
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

  await runner.test('ADV-5.3: 413 Payload Too Large has Content-Type: application/json and parses cleanly', async () => {
    const formData = new FormData();
    const huge = new File([Buffer.alloc(20 * 1024 * 1024 + 10)], 'huge.jpg');
    formData.append('file', huge);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 413);
    assertEqual(res.headers.get('content-type'), 'application/json');

    const parsed = await safeParseUploadResponse(res);
    assertEqual(parsed.success, false);
    assertEqual(parsed.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  await runner.test('ADV-5.4: Simulated HTML response is handled by safeParseUploadResponse without syntax crash', async () => {
    const htmlResponse = new Response('<html><body><h1>502 Bad Gateway</h1></body></html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(htmlResponse);
    assertEqual(parsed.success, false);
    assertIncludes(parsed.error || '', 'Gateway');
  });

  await runner.test('ADV-5.5: Simulated HTML 413 response is translated to friendly error without syntax crash', async () => {
    const html413 = new Response('<html><body>413 Request Entity Too Large</body></html>', {
      status: 413,
      headers: { 'Content-Type': 'text/html' },
    });

    const parsed = await safeParseUploadResponse(html413);
    assertEqual(parsed.success, false);
    assertIncludes(parsed.error || '', '20MB');
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
  console.log('\n======================================================');
  console.log(`  Adversarial Test Summary: ${summary.passed}/${summary.total} passed (${summary.failed} failed) in ${summary.totalDurationMs}ms`);
  console.log('======================================================\n');

  return summary.failed === 0;
}

// Auto-execute if run directly
if (require.main === module) {
  runChallenger2AdversarialSuite()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal error during adversarial suite execution:', err);
      process.exit(1);
    });
}
