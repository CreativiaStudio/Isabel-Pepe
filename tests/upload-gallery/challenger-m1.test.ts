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

import { NextRequest } from 'next/server';
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import { uploadProductImageAction, updateProductImage } from '../../app/admin/actions';
import { uploadToR2, getR2Config, getR2Client } from '../../lib/r2';
import { supabaseAdmin } from '../../lib/supabase';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createSampleImageBuffer,
  createMockImageFile,
  cleanupTestProducts,
  cleanupTestR2Object,
} from './test-helpers';

export async function runChallengerM1Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Challenger Milestone 1: Server Upload & Storage Hardening');
  const uploadedUrlsToCleanup: string[] = [];
  const testProductIdsToCleanup: string[] = [];

  console.log('\n⚔️  RUNNING ADVERSARIAL CHALLENGER SUITE (MILESTONE 1)  ⚔️\n');

  // =========================================================================
  // VECTOR 1: 20MB Exact Boundary Limits & Error Status Codes
  // =========================================================================
  console.log('--- Vector 1: 20MB Exact Boundary Limits & Rejections ---');

  await runner.test('V1.1: Exact 20MB File (20,971,520 bytes) is NOT rejected as 413', async () => {
    const exact20MB = 20 * 1024 * 1024;
    // Create a 20MB binary file
    const sampleBuffer = await createSampleImageBuffer({ width: 400, height: 400 });
    const fullBuffer = Buffer.alloc(exact20MB);
    sampleBuffer.copy(fullBuffer, 0, 0, sampleBuffer.length);
    const file = new File([fullBuffer], 'boundary-exact-20mb.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'test-challenger');
    formData.append('customName', 'boundary-20mb');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 200, 'Exact 20MB file should be accepted with HTTP 200');
    assertIncludes(res.headers.get('content-type') || '', 'application/json', 'Content-Type must be application/json');

    const json = await res.json();
    assert(Boolean(json.success), 'Upload should succeed');
    assertDefined(json.url, 'URL must be returned');
    uploadedUrlsToCleanup.push(json.url);
  });

  await runner.test('V1.2: 20MB + 1 Byte (20,971,521 bytes) is REJECTED with HTTP 413 JSON', async () => {
    const overLimit = 20 * 1024 * 1024 + 1;
    const overBuffer = Buffer.alloc(overLimit);
    const file = new File([overBuffer], 'over-20mb.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'test-challenger');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 413, 'Over 20MB file must return HTTP 413');
    assertIncludes(res.headers.get('content-type') || '', 'application/json', 'Content-Type must be application/json');

    const json = await res.json();
    assertEqual(json.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  await runner.test('V1.3: 0-Byte Empty File is REJECTED with HTTP 400 JSON', async () => {
    const emptyFile = new File([], 'empty-file.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', emptyFile);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400, '0-byte file must return HTTP 400');
    assertIncludes(res.headers.get('content-type') || '', 'application/json', 'Content-Type must be application/json');

    const json = await res.json();
    assertEqual(json.error, 'Nessun file fornito o file vuoto.');
  });

  await runner.test('V1.4: Missing File in FormData is REJECTED with HTTP 400 JSON', async () => {
    const formData = new FormData();
    formData.append('folder', 'products');
    formData.append('customName', 'no-file');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadRouteHandler(req);
    assertEqual(res.status, 400, 'Missing file must return HTTP 400');
    const json = await res.json();
    assertEqual(json.error, 'Nessun file fornito o file vuoto.');
  });

  // =========================================================================
  // VECTOR 2: Sharp Corruption Fallback, MIME & Extension Resolution
  // =========================================================================
  console.log('\n--- Vector 2: Sharp Error Fallback & Metadata Handling ---');

  await runner.test('V2.1: Corrupted JPEG buffer falls back to raw buffer with .jpg extension & image/jpeg MIME', async () => {
    const corruptBytes = Buffer.from('\xFF\xD8\xFF\xE0CORRUPTED_JPEG_PAYLOAD_CHALLENGE_' + Date.now());
    const file = new File([corruptBytes], 'broken-gold-ring.jpg', { type: 'image/jpeg' });

    const publicUrl = await uploadToR2(file, 'test-challenger', 'corrupt-ring-jpg');
    assertDefined(publicUrl, 'URL must be returned on fallback');
    assert(publicUrl.endsWith('.jpg'), `Fallback URL must preserve .jpg extension: ${publicUrl}`);
    uploadedUrlsToCleanup.push(publicUrl);

    // Verify object metadata directly in Cloudflare R2
    const { bucketName, publicUrl: baseR2Url } = getR2Config();
    const key = publicUrl.replace(`${baseR2Url}/`, '');
    const client = getR2Client();

    const headRes = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    assertEqual(headRes.ContentType, 'image/jpeg', 'R2 object ContentType must be image/jpeg');
    assertEqual(headRes.ContentLength, corruptBytes.length, 'R2 object length must match raw buffer size');
  });

  await runner.test('V2.2: Corrupted PNG buffer falls back with .png extension & image/png MIME', async () => {
    const corruptBytes = Buffer.from('\x89PNG\r\n\x1a\nCORRUPTED_PNG_BODY_' + Date.now());
    const file = new File([corruptBytes], 'damaged-necklace.png', { type: 'image/png' });

    const publicUrl = await uploadToR2(file, 'test-challenger', 'damaged-necklace');
    assertDefined(publicUrl, 'URL must be returned on fallback');
    assert(publicUrl.endsWith('.png'), `Fallback URL must preserve .png extension: ${publicUrl}`);
    uploadedUrlsToCleanup.push(publicUrl);

    const { bucketName, publicUrl: baseR2Url } = getR2Config();
    const key = publicUrl.replace(`${baseR2Url}/`, '');
    const client = getR2Client();

    const headRes = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    assertEqual(headRes.ContentType, 'image/png', 'R2 object ContentType must be image/png');
  });

  await runner.test('V2.3: Non-image PDF upload falls back cleanly with .pdf extension & application/pdf MIME', async () => {
    const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>%%EOF');
    const file = new File([pdfBytes], 'certificate-authenticity.pdf', { type: 'application/pdf' });

    const publicUrl = await uploadToR2(file, 'test-challenger', 'cert-auth');
    assertDefined(publicUrl, 'URL must be returned');
    assert(publicUrl.endsWith('.pdf'), `PDF upload must preserve .pdf extension: ${publicUrl}`);
    uploadedUrlsToCleanup.push(publicUrl);

    const { bucketName, publicUrl: baseR2Url } = getR2Config();
    const key = publicUrl.replace(`${baseR2Url}/`, '');
    const client = getR2Client();

    const headRes = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    assertEqual(headRes.ContentType, 'application/pdf', 'R2 object ContentType must be application/pdf');
  });

  await runner.test('V2.4: uploadToR2 accepts direct Buffer and Uint8Array with options', async () => {
    const sample = await createSampleImageBuffer({ width: 100, height: 100, format: 'png' });
    const uint8 = new Uint8Array(sample);

    const url = await uploadToR2(uint8, 'test-challenger', 'raw-uint8-test', {
      originalName: 'custom-graphic.png',
      mimeType: 'image/png',
    });

    assert(Boolean(url), 'uploadToR2 should succeed with Uint8Array');
    assert(url.endsWith('.webp'), 'Valid PNG should be converted to WebP by Sharp');
    uploadedUrlsToCleanup.push(url);
  });

  await runner.test('V2.5: Path traversal and special characters in folder and customName are sanitized', async () => {
    const sample = await createSampleImageBuffer({ width: 150, height: 150 });
    const file = new File([sample], 'exploit-test.jpg', { type: 'image/jpeg' });

    const url = await uploadToR2(
      file,
      '../../products/../secret',
      '../../../exploit;drop table#$<script>'
    );

    assertDefined(url, 'URL should be generated');
    assert(!url.includes('..'), 'URL must not contain path traversal ..');
    assert(!url.includes('<script>'), 'URL must not contain script tags');
    uploadedUrlsToCleanup.push(url);
  });

  // =========================================================================
  // VECTOR 3: Server Action uploadProductImageAction Direct Execution
  // =========================================================================
  console.log('\n--- Vector 3: uploadProductImageAction Server Action Execution ---');

  await runner.test('V3.1: uploadProductImageAction successfully uploads valid image via FormData', async () => {
    const file = await createMockImageFile({ width: 300, height: 300, format: 'jpeg' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'test-challenger');
    formData.append('customName', 'action-test-success');

    const result = await uploadProductImageAction(formData);
    assertEqual(result.success, true, 'Server action should return success: true');
    assertDefined(result.url, 'Server action must return url');
    assert(result.url.endsWith('.webp'), 'Image should be converted to .webp');
    uploadedUrlsToCleanup.push(result.url);
  });

  await runner.test('V3.2: uploadProductImageAction rejects oversized file (>20MB) with structured error', async () => {
    const overLimit = 20 * 1024 * 1024 + 500;
    const overBuffer = Buffer.alloc(overLimit);
    const file = new File([overBuffer], 'action-over-20mb.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadProductImageAction(formData);
    assertEqual(result.success, false, 'Should fail for oversized file');
    assertEqual(result.error, 'La dimensione del file supera il limite massimo di 20MB.');
  });

  await runner.test('V3.3: uploadProductImageAction rejects empty/corrupt FormData inputs gracefully', async () => {
    // @ts-expect-error Testing invalid runtime input
    const res1 = await uploadProductImageAction(null);
    assertEqual(res1.success, false);
    assertEqual(res1.error, 'Dati del modulo non validi o mancanti.');

    const emptyFormData = new FormData();
    const res2 = await uploadProductImageAction(emptyFormData);
    assertEqual(res2.success, false);
    assertEqual(res2.error, 'Nessun file fornito o file vuoto.');
  });

  // =========================================================================
  // VECTOR 4: updateProductImage Database Consistency & Gallery Synchronization
  // =========================================================================
  console.log('\n--- Vector 4: updateProductImage Database Consistency ---');

  await runner.test('V4.1: updateProductImage updates image_primary and gallery[1] atomically', async () => {
    // 1. Seed temporary product in Supabase
    const testSku = `CHALLENGE-${Date.now()}`;
    const initialGallery = [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1-existing.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot2-old.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot3-existing.webp',
      '',
      '',
    ];

    const { data: createdProduct, error: createError } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Challenger Test Ring',
        slug: `challenger-test-ring-${Date.now()}`,
        sku: testSku,
        price: 99.0,
        category: 'anelli',
        image_secondary: initialGallery[0],
        image_primary: initialGallery[1],
        gallery: initialGallery,
      })
      .select('id, name, slug, gallery, image_primary, image_secondary')
      .single();

    assert(!createError, `Failed to seed test product: ${createError?.message}`);
    assertDefined(createdProduct?.id, 'Created product must have ID');
    testProductIdsToCleanup.push(createdProduct.id);

    // 2. Call updateProductImage with 'primary'
    const newImageFile = await createMockImageFile({ width: 250, height: 250, format: 'jpeg' });
    const updateResult = await updateProductImage(createdProduct.id, newImageFile, 'primary');

    assertEqual(updateResult.success, true, 'updateProductImage primary should succeed');
    assertDefined(updateResult.url, 'updateProductImage must return url');
    uploadedUrlsToCleanup.push(updateResult.url);

    // 3. Query Supabase directly to verify atomic state
    const { data: updatedProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, image_primary, image_secondary, gallery')
      .eq('id', createdProduct.id)
      .single();

    assert(!fetchError, `Failed to fetch updated product: ${fetchError?.message}`);
    assertEqual(updatedProduct?.image_primary, updateResult.url, 'image_primary must match new url');
    assertEqual(updatedProduct?.gallery[1], updateResult.url, 'gallery[1] must match new url');
    assertEqual(updatedProduct?.gallery[0], initialGallery[0], 'gallery[0] must remain unchanged');
    assertEqual(updatedProduct?.gallery[2], initialGallery[2], 'gallery[2] must remain unchanged');
    assertEqual(updatedProduct?.image_secondary, initialGallery[0], 'image_secondary must remain unchanged');
  });

  await runner.test('V4.2: updateProductImage updates image_secondary and gallery[0] atomically', async () => {
    // 1. Seed temporary product in Supabase
    const testSku = `CHALLENGE-SEC-${Date.now()}`;
    const initialGallery = [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sec-old.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/prim-kept.webp',
      '',
      '',
      '',
    ];

    const { data: createdProduct, error: createError } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Challenger Secondary Test',
        slug: `challenger-secondary-test-${Date.now()}`,
        sku: testSku,
        price: 120.0,
        category: 'collane',
        image_secondary: initialGallery[0],
        image_primary: initialGallery[1],
        gallery: initialGallery,
      })
      .select('id, name, slug, gallery, image_primary, image_secondary')
      .single();

    assert(!createError, `Failed to seed test product: ${createError?.message}`);
    assertDefined(createdProduct?.id, 'Created product must have ID');
    testProductIdsToCleanup.push(createdProduct.id);

    // 2. Call updateProductImage with 'secondary'
    const newImageFile = await createMockImageFile({ width: 250, height: 250, format: 'png' });
    const updateResult = await updateProductImage(createdProduct.id, newImageFile, 'secondary');

    assertEqual(updateResult.success, true, 'updateProductImage secondary should succeed');
    assertDefined(updateResult.url, 'updateProductImage must return url');
    uploadedUrlsToCleanup.push(updateResult.url);

    // 3. Query Supabase directly
    const { data: updatedProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, image_primary, image_secondary, gallery')
      .eq('id', createdProduct.id)
      .single();

    assert(!fetchError, `Failed to fetch updated product: ${fetchError?.message}`);
    assertEqual(updatedProduct?.image_secondary, updateResult.url, 'image_secondary must match new url');
    assertEqual(updatedProduct?.gallery[0], updateResult.url, 'gallery[0] must match new url');
    assertEqual(updatedProduct?.image_primary, initialGallery[1], 'image_primary must remain unchanged');
    assertEqual(updatedProduct?.gallery[1], initialGallery[1], 'gallery[1] must remain unchanged');
  });

  await runner.test('V4.3: updateProductImage returns error on non-existent product ID', async () => {
    const dummyFile = await createMockImageFile({ width: 100, height: 100 });
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const result = await updateProductImage(fakeId, dummyFile, 'primary');
    assertEqual(result.success, false, 'Must fail for non-existent ID');
    assertIncludes(result.error || '', 'Prodotto non trovato');
  });

  await runner.test('V4.4: updateProductImage returns error on invalid type', async () => {
    const dummyFile = await createMockImageFile({ width: 100, height: 100 });
    // @ts-expect-error Invalid type parameter
    const result = await updateProductImage('some-id', dummyFile, 'tertiary');
    assertEqual(result.success, false, 'Must fail for invalid type');
    assertIncludes(result.error || '', 'Tipo immagine non valido');
  });

  // =========================================================================
  // VECTOR 5: Cleanups
  // =========================================================================
  console.log('\n--- Cleaning up temporary challenger artifacts ---');
  if (testProductIdsToCleanup.length > 0) {
    await cleanupTestProducts(testProductIdsToCleanup);
    console.log(`Cleaned up ${testProductIdsToCleanup.length} temporary test products.`);
  }

  for (const url of uploadedUrlsToCleanup) {
    await cleanupTestR2Object(url);
  }
  console.log(`Cleaned up ${uploadedUrlsToCleanup.length} temporary R2 test objects.`);

  return runner;
}

// Direct CLI Execution
if (require.main === module) {
  runChallengerM1Tests()
    .then((runner) => {
      const summary = runner.summary();
      console.log('\n========================================================================');
      console.log('                 CHALLENGER M1 TEST SUMMARY REPORT                      ');
      console.log('========================================================================');
      console.log(` Total Tests: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Duration: ${summary.totalDurationMs}ms`);
      console.log('========================================================================\n');
      if (summary.failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('Fatal error during challenger execution:', err);
      process.exit(1);
    });
}
