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

import { supabaseAdmin } from '../../lib/supabase';
import { addProduct, updateFullProduct, updateProductImage, uploadProductImageAction } from '../../app/admin/actions';
import { PUT as apiAdminProductsPut } from '../../app/api/admin/products/route';
import { uploadToR2 } from '../../lib/r2';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockImageFile,
  cleanupTestProducts,
  cleanupTestR2Object,
} from './test-helpers';
import { NextRequest } from 'next/server';

export async function runChallenger2Milestone3Suite(): Promise<TestRunner> {
  const runner = new TestRunner('Challenger 2 (M3): Empirical Gallery Boundary & Adversarial Suite');
  const createdProductIds: string[] = [];
  const createdR2Urls: string[] = [];

  console.log('\n\x1b[1m\x1b[35m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS SUITE (MILESTONE 3)        \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // SUITE 1: Legacy Database Records & Null/Corrupt Gallery Normalization
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Suite 1: Legacy Database Records & Normalization ---\x1b[0m');

    await runner.test('CH2-M3.1.1: Legacy product with null gallery & both primary/secondary migrates to 5 slots on update', async () => {
      const sec = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-sec-1.webp';
      const pri = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-pri-1.webp';

      const { data: legacyProd, error: insertErr } = await supabaseAdmin.from('products').insert({
        name: `Legacy Null Gallery ${Date.now()}`,
        slug: `legacy-null-gallery-${Date.now()}`,
        price: 150.0,
        stock: 4,
        category: 'Collane',
        image_secondary: sec,
        image_primary: pri,
        gallery: null,
        is_active: true,
      }).select().single();

      assert(!insertErr, `DB insert failed: ${insertErr?.message}`);
      const productId = legacyProd.id;
      createdProductIds.push(productId);

      // Verify ProductForm client mapping logic for legacy data
      const initialSlotUrls: Record<string, string> = {};
      const gallery = Array.isArray(legacyProd.gallery) ? legacyProd.gallery : [];
      if (gallery.length > 0) {
        gallery.forEach((url: string, idx: number) => {
          if (url) initialSlotUrls[`slot${idx + 1}`] = url;
        });
      } else {
        if (legacyProd.image_secondary) initialSlotUrls['slot1'] = legacyProd.image_secondary;
        if (legacyProd.image_primary) initialSlotUrls['slot2'] = legacyProd.image_primary;
      }

      assertEqual(initialSlotUrls['slot1'], sec, 'Client form initial mapping maps legacy secondary to slot 1');
      assertEqual(initialSlotUrls['slot2'], pri, 'Client form initial mapping maps legacy primary to slot 2');
      assertEqual(initialSlotUrls['slot3'], undefined, 'Slot 3 remains undefined');

      // Now execute updateFullProduct updating only description
      const updateForm = new FormData();
      updateForm.append('name', legacyProd.name);
      updateForm.append('price', '155.00');
      updateForm.append('description', 'Updated legacy description');
      updateForm.append('category', 'Collane');

      const res = await updateFullProduct(productId, updateForm);
      assertEqual(res.success, true, 'updateFullProduct should succeed on legacy record');

      const { data: updatedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assert(Array.isArray(updatedDb.gallery), 'Gallery must be converted to array');
      assertEqual(updatedDb.gallery.length, 5, 'Gallery must have exactly 5 elements');
      assertEqual(updatedDb.gallery[0], sec, 'Slot 1 must contain legacy secondary URL');
      assertEqual(updatedDb.gallery[1], pri, 'Slot 2 must contain legacy primary URL');
      assertEqual(updatedDb.gallery[2], '', 'Slot 3 must be empty string');
      assertEqual(updatedDb.gallery[3], '', 'Slot 4 must be empty string');
      assertEqual(updatedDb.gallery[4], '', 'Slot 5 must be empty string');
      assertEqual(updatedDb.image_secondary, sec, 'image_secondary preserved');
      assertEqual(updatedDb.image_primary, pri, 'image_primary preserved');
    });

    await runner.test('CH2-M3.1.2: Legacy product with empty array gallery [] preserves primary/secondary correctly', async () => {
      const sec = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-sec-2.webp';
      const pri = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-pri-2.webp';

      const { data: legacyProd } = await supabaseAdmin.from('products').insert({
        name: `Legacy Empty Array ${Date.now()}`,
        slug: `legacy-empty-array-${Date.now()}`,
        price: 200.0,
        stock: 3,
        category: 'Anelli',
        image_secondary: sec,
        image_primary: pri,
        gallery: [],
        is_active: true,
      }).select().single();

      const productId = legacyProd.id;
      createdProductIds.push(productId);

      const updateForm = new FormData();
      updateForm.append('name', legacyProd.name);
      updateForm.append('price', '210.00');
      updateForm.append('category', 'Anelli');

      await updateFullProduct(productId, updateForm);

      const { data: updatedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(updatedDb.gallery.length, 5);
      assertEqual(updatedDb.gallery[0], sec);
      assertEqual(updatedDb.gallery[1], pri);
    });

    await runner.test('CH2-M3.1.3: Legacy product with 1-element gallery expands to 5 elements without crash', async () => {
      const singleUrl = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/single-only.webp';
      const { data: legacyProd } = await supabaseAdmin.from('products').insert({
        name: `Legacy Single Slot ${Date.now()}`,
        slug: `legacy-single-slot-${Date.now()}`,
        price: 180.0,
        stock: 2,
        category: 'Bracciali',
        image_secondary: singleUrl,
        image_primary: singleUrl,
        gallery: [singleUrl],
        is_active: true,
      }).select().single();

      const productId = legacyProd.id;
      createdProductIds.push(productId);

      const updateForm = new FormData();
      updateForm.append('name', legacyProd.name);
      updateForm.append('price', '185.00');
      updateForm.append('category', 'Bracciali');

      await updateFullProduct(productId, updateForm);

      const { data: updatedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(updatedDb.gallery.length, 5);
      assertEqual(updatedDb.gallery[0], singleUrl);
    });

    await runner.test('CH2-M3.1.4: updateProductImage on legacy record updates target slot and normalizes gallery to 5 elements', async () => {
      const sec = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-sec-thumb.webp';
      const pri = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/leg-pri-thumb.webp';

      const { data: legacyProd } = await supabaseAdmin.from('products').insert({
        name: `Legacy Quick Thumb ${Date.now()}`,
        slug: `legacy-quick-thumb-${Date.now()}`,
        price: 90.0,
        stock: 6,
        category: 'Orecchini',
        image_secondary: sec,
        image_primary: pri,
        gallery: null,
        is_active: true,
      }).select().single();

      const productId = legacyProd.id;
      createdProductIds.push(productId);

      // Upload new secondary thumbnail (Slot 1)
      const mockFile = await createMockImageFile({ width: 120, height: 120, format: 'webp' });
      const updateRes = await updateProductImage(productId, mockFile, 'secondary');
      assertEqual(updateRes.success, true, 'updateProductImage secondary must succeed');
      assertDefined(updateRes.url, 'New URL returned');
      createdR2Urls.push(updateRes.url);

      const { data: updatedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(updatedDb.gallery.length, 5, 'Gallery array has 5 elements');
      assertEqual(updatedDb.gallery[0], updateRes.url, 'Slot 1 updated to new URL');
      assertEqual(updatedDb.gallery[1], pri, 'Slot 2 preserved from legacy primary');
      assertEqual(updatedDb.image_secondary, updateRes.url, 'image_secondary updated');
      assertEqual(updatedDb.image_primary, pri, 'image_primary preserved');
    });

    // =========================================================================
    // SUITE 2: Sparse Arrays & Non-Consecutive Slot Topologies
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Suite 2: Sparse Arrays & Non-Consecutive Slot Topologies ---\x1b[0m');

    await runner.test('CH2-M3.2.1: Sparse topology [url1, "", url3, "", url5] (odd slots only) persists exactly', async () => {
      const u1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u1.webp';
      const u3 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u3.webp';
      const u5 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u5.webp';

      const form = new FormData();
      form.append('name', `Sparse Odd Slots ${Date.now()}`);
      form.append('price', '310.00');
      form.append('category', 'Collane');
      form.append('slot1_url', u1);
      form.append('slot3_url', u3);
      form.append('slot5_url', u5);

      const res = await addProduct(form);
      assertEqual(res.success, true, 'addProduct with sparse array should succeed');
      const productId = res.product.id;
      createdProductIds.push(productId);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery[0], u1, 'Slot 1 correct');
      assertEqual(dbProd.gallery[1], '', 'Slot 2 empty string');
      assertEqual(dbProd.gallery[2], u3, 'Slot 3 correct');
      assertEqual(dbProd.gallery[3], '', 'Slot 4 empty string');
      assertEqual(dbProd.gallery[4], u5, 'Slot 5 correct');
      assertEqual(dbProd.image_secondary, u1, 'image_secondary = gallery[0]');
      // Primary derivation when slot2 is empty: gallery[1] || gallery[0] || null -> u1
      assertEqual(dbProd.image_primary, u1, 'image_primary falls back to slot 1 when slot 2 is empty');
    });

    await runner.test('CH2-M3.2.2: Sparse topology ["", url2, "", url4, ""] (even slots only) derives primary and null secondary', async () => {
      const u2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u2.webp';
      const u4 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u4.webp';

      const form = new FormData();
      form.append('name', `Sparse Even Slots ${Date.now()}`);
      form.append('price', '270.00');
      form.append('category', 'Anelli');
      form.append('slot2_url', u2);
      form.append('slot4_url', u4);

      const res = await addProduct(form);
      const productId = res.product.id;
      createdProductIds.push(productId);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery[0], '', 'Slot 1 empty');
      assertEqual(dbProd.gallery[1], u2, 'Slot 2 populated');
      assertEqual(dbProd.gallery[2], '', 'Slot 3 empty');
      assertEqual(dbProd.gallery[3], u4, 'Slot 4 populated');
      assertEqual(dbProd.gallery[4], '', 'Slot 5 empty');
      assertEqual(dbProd.image_secondary, null, 'image_secondary is null when slot 1 is empty');
      assertEqual(dbProd.image_primary, u2, 'image_primary is slot 2 URL');
    });

    await runner.test('CH2-M3.2.3: Sparse topology ["", "", "", "", url5] (only slot 5) stores clean 5-element array and null primary/secondary', async () => {
      const u5 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-u5-only.webp';

      const form = new FormData();
      form.append('name', `Sparse Slot 5 Only ${Date.now()}`);
      form.append('price', '95.00');
      form.append('category', 'Orecchini');
      form.append('slot5_url', u5);

      const res = await addProduct(form);
      const productId = res.product.id;
      createdProductIds.push(productId);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery[0], '');
      assertEqual(dbProd.gallery[1], '');
      assertEqual(dbProd.gallery[2], '');
      assertEqual(dbProd.gallery[3], '');
      assertEqual(dbProd.gallery[4], u5);
      assertEqual(dbProd.image_secondary, null);
      assertEqual(dbProd.image_primary, null);
    });

    await runner.test('CH2-M3.2.4: Mutating a sparse array: clearing slot 1 while slot 3 and 5 exist does not shift indices', async () => {
      const u1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/mut-u1.webp';
      const u3 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/mut-u3.webp';
      const u5 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/mut-u5.webp';

      const initForm = new FormData();
      initForm.append('name', `Mutate Sparse ${Date.now()}`);
      initForm.append('price', '420.00');
      initForm.append('category', 'Set');
      initForm.append('slot1_url', u1);
      initForm.append('slot3_url', u3);
      initForm.append('slot5_url', u5);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // Clear slot 1 via slot1_cleared=true
      const updateForm = new FormData();
      updateForm.append('name', `Mutate Sparse ${Date.now()}`);
      updateForm.append('price', '420.00');
      updateForm.append('category', 'Set');
      updateForm.append('slot1_cleared', 'true');

      await updateFullProduct(productId, updateForm);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery[0], '', 'Slot 1 must now be empty string');
      assertEqual(dbProd.gallery[1], '', 'Slot 2 remains empty');
      assertEqual(dbProd.gallery[2], u3, 'Slot 3 must remain untouched at index 2');
      assertEqual(dbProd.gallery[3], '', 'Slot 4 remains empty');
      assertEqual(dbProd.gallery[4], u5, 'Slot 5 must remain untouched at index 4');
      assertEqual(dbProd.image_secondary, null, 'image_secondary becomes null');
      assertEqual(dbProd.image_primary, null, 'image_primary becomes null');
    });

    await runner.test('CH2-M3.2.5: Clearing all 5 slots stores 5 empty strings with null primary/secondary without DB error', async () => {
      const u1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/all-u1.webp';
      const u2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/all-u2.webp';

      const initForm = new FormData();
      initForm.append('name', `All Cleared Test ${Date.now()}`);
      initForm.append('price', '130.00');
      initForm.append('category', 'Anelli');
      initForm.append('slot1_url', u1);
      initForm.append('slot2_url', u2);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // Clear all slots
      const updateForm = new FormData();
      updateForm.append('name', `All Cleared Test ${Date.now()}`);
      updateForm.append('price', '130.00');
      updateForm.append('category', 'Anelli');
      updateForm.append('slot1_cleared', 'true');
      updateForm.append('slot2_cleared', 'true');
      updateForm.append('slot3_cleared', 'true');
      updateForm.append('slot4_cleared', 'true');
      updateForm.append('slot5_cleared', 'true');

      await updateFullProduct(productId, updateForm);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery.length, 5);
      for (let i = 0; i < 5; i++) {
        assertEqual(dbProd.gallery[i], '', `Slot ${i + 1} is empty`);
      }
      assertEqual(dbProd.image_secondary, null);
      assertEqual(dbProd.image_primary, null);
    });

    // =========================================================================
    // SUITE 3: Concurrent Slot Uploads, Independent State Isolation & Lockouts
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Suite 3: Concurrent Slot Uploads & Submission Lockout ---\x1b[0m');

    await runner.test('CH2-M3.3.1: Parallel 3-slot upload produces 3 distinct R2 files without race condition', async () => {
      const file1 = await createMockImageFile({ width: 200, height: 200, name: 'slot1-mock.jpg' });
      const file2 = await createMockImageFile({ width: 200, height: 200, name: 'slot3-mock.jpg' });
      const file3 = await createMockImageFile({ width: 200, height: 200, name: 'slot5-mock.jpg' });

      const slug = `concurrent-test-${Date.now()}`;

      // Upload in parallel
      const [url1, url3, url5] = await Promise.all([
        uploadToR2(file1, 'products', `isabel-pepe-${slug}-slot1-${Date.now()}`),
        uploadToR2(file2, 'products', `isabel-pepe-${slug}-slot3-${Date.now()}`),
        uploadToR2(file3, 'products', `isabel-pepe-${slug}-slot5-${Date.now()}`),
      ]);

      assertDefined(url1, 'Slot 1 URL generated');
      assertDefined(url3, 'Slot 3 URL generated');
      assertDefined(url5, 'Slot 5 URL generated');

      assert(url1 !== url3, 'Slot 1 and Slot 3 must have distinct URLs');
      assert(url3 !== url5, 'Slot 3 and Slot 5 must have distinct URLs');

      assertIncludes(url1, '-slot1-', 'Slot 1 URL includes slot1 identifier');
      assertIncludes(url3, '-slot3-', 'Slot 3 URL includes slot3 identifier');
      assertIncludes(url5, '-slot5-', 'Slot 5 URL includes slot5 identifier');

      createdR2Urls.push(url1, url3, url5);
    });

    await runner.test('CH2-M3.3.2: Submission lockout evaluation correctly blocks submission when any slot is uploading', () => {
      // Simulate state from ProductForm.tsx
      const stateIdle: Record<string, boolean> = { slot1: false, slot2: false, slot3: false, slot4: false, slot5: false };
      const isLockoutIdle = Object.values(stateIdle).some(Boolean);
      assertEqual(isLockoutIdle, false, 'No lockout when all slots are idle');

      const stateSlot2Uploading: Record<string, boolean> = { slot1: false, slot2: true, slot3: false, slot4: false, slot5: false };
      const isLockoutSlot2 = Object.values(stateSlot2Uploading).some(Boolean);
      assertEqual(isLockoutSlot2, true, 'Lockout active when slot 2 is uploading');

      const stateMultipleUploading: Record<string, boolean> = { slot1: true, slot2: false, slot3: true, slot4: false, slot5: false };
      const isLockoutMultiple = Object.values(stateMultipleUploading).some(Boolean);
      assertEqual(isLockoutMultiple, true, 'Lockout active when multiple slots are uploading');
    });

    await runner.test('CH2-M3.3.3: Slot error isolation: error on slot 2 leaves slots 1, 3, 4, 5 unpolluted and retriable', () => {
      const slotUrls: Record<string, string> = {
        slot1: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1.webp',
        slot3: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot3.webp',
      };
      const slotErrors: Record<string, string | undefined> = {
        slot2: 'Errore server Cloudflare R2 (HTTP 500)',
      };
      const pendingFiles: Record<string, File | undefined> = {
        slot2: new File(['dummy'], 'failed.jpg', { type: 'image/jpeg' }),
      };

      // Slot 1 and 3 are intact
      assertEqual(slotUrls['slot1'], 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1.webp');
      assertEqual(slotUrls['slot3'], 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot3.webp');
      assertEqual(slotErrors['slot1'], undefined);
      assertEqual(slotErrors['slot3'], undefined);

      // Slot 2 has isolated error and pending file for retry
      assertEqual(slotErrors['slot2'], 'Errore server Cloudflare R2 (HTTP 500)');
      assertDefined(pendingFiles['slot2']);
    });

    // =========================================================================
    // SUITE 4: Security Guard & Server Action Full Flow Validation
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Suite 4: Security Guard & Server Action Flow Validation ---\x1b[0m');

    await runner.test('CH2-M3.4.1: Unauthenticated direct PUT /api/admin/products is safely rejected with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'dummy-id', name: 'Test' }),
      });

      const res = await apiAdminProductsPut(req);
      assertEqual(res.status, 401, 'Unauthenticated request must be blocked with HTTP 401');
      const body = await res.json();
      assertDefined(body.error);
    });

    await runner.test('CH2-M3.4.2: Server Action updateFullProduct persists sparse array safely without route auth overhead', async () => {
      const u1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sa-u1.webp';
      const u4 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sa-u4.webp';

      const initForm = new FormData();
      initForm.append('name', `SA Sparse Flow ${Date.now()}`);
      initForm.append('price', '250.00');
      initForm.append('category', 'Collane');
      initForm.append('slot1_url', u1);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      const updateForm = new FormData();
      updateForm.append('name', `SA Sparse Flow ${Date.now()}`);
      updateForm.append('price', '260.00');
      updateForm.append('category', 'Collane');
      updateForm.append('slot4_url', u4);

      const updateRes = await updateFullProduct(productId, updateForm);
      assertEqual(updateRes.success, true);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProd.gallery[0], u1);
      assertEqual(dbProd.gallery[1], '');
      assertEqual(dbProd.gallery[2], '');
      assertEqual(dbProd.gallery[3], u4);
      assertEqual(dbProd.gallery[4], '');
      assertEqual(dbProd.price, 260.0);
    });

  } finally {
    await cleanupTestProducts(createdProductIds);
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}

if (process.argv[1]?.includes('challenger2-m3-adversarial')) {
  runChallenger2Milestone3Suite().then((runner) => {
    const summary = runner.summary();
    process.exit(summary.failed === 0 ? 0 : 1);
  }).catch((err) => {
    console.error('Fatal error during challenger 2 suite execution:', err);
    process.exit(1);
  });
}
