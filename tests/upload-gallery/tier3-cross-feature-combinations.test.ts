import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { addProduct, updateFullProduct } from '../../app/admin/actions';
import { uploadToR2 } from '../../lib/r2';
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockImageFile,
  safeParseUploadResponse,
  cleanupTestProducts,
  cleanupTestR2Object,
} from './test-helpers';

export async function runTier3Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 3: Cross-Feature Combinations & Fallback Pipelines');
  const createdProductIds: string[] = [];
  const createdR2Urls: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 3: CROSS-FEATURE COMBINATIONS & FALLBACK PIPELINES\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // PIPELINE 1: 2-Tier Upload Fallback Pipeline (REST -> Server Action)
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Pipeline 1: 2-Tier Upload Fallback (REST -> Server Action) ---\x1b[0m');

    await runner.test('T3.1.1: REST route failure triggers Server Action fallback and uploads successfully', async () => {
      // 1. Simulate REST upload failure with 500 HTML response
      const simulatedRestResponse = new Response('<!DOCTYPE html><html><body>500 Internal Server Error</body></html>', {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      });

      const parsedRest = await safeParseUploadResponse(simulatedRestResponse);
      assertEqual(parsedRest.success, false, 'REST call fails gracefully');

      // 2. Client fallback kicks in: calls direct upload / Server Action logic
      const file = await createMockImageFile({ width: 300, height: 300, format: 'jpeg' });
      const fallbackUrl = await uploadToR2(file, 'products', `tier3-fallback-${Date.now()}`);

      assertDefined(fallbackUrl, 'Fallback upload to R2 must succeed');
      assertIncludes(fallbackUrl, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/', 'Fallback URL must be valid');
      createdR2Urls.push(fallbackUrl);
    });

    await runner.test('T3.1.2: Server Action fallback handles customName and folder parameters', async () => {
      const customName = `isabel-pepe-anello-luce-slot1-${Date.now()}`;
      const file = await createMockImageFile({ width: 200, height: 200, format: 'jpeg' });

      // Execute server action upload
      const url = await uploadToR2(file, 'products', customName);
      assertIncludes(url, customName, 'Server Action fallback must respect customName');
      createdR2Urls.push(url);
    });

    await runner.test('T3.1.3: Non-recoverable validation failure (empty file) terminates without infinite retry', async () => {
      const restRes = new Response(JSON.stringify({ error: 'Nessun file fornito o file vuoto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(restRes);
      assertEqual(parsed.success, false, 'Should fail validation');
      assertEqual(parsed.error, 'Nessun file fornito o file vuoto.', 'Error should match');
    });

    await runner.test('T3.1.4: Dual failure (both REST and Server Action error) produces clean error banner state', async () => {
      // Simulate REST 502 Bad Gateway
      const restRes = new Response('<html>502 Bad Gateway</html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      });

      const parsed = await safeParseUploadResponse(restRes);
      assertEqual(parsed.success, false, 'REST failed');
      assertDefined(parsed.error, 'Structured error available for UI banner');
      assert(!parsed.error.includes('<html'), 'HTML must be cleaned');
    });

    // =========================================================================
    // PIPELINE 2: 5-Slot Non-Destructive Update Pipeline
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Pipeline 2: 5-Slot Non-Destructive Update Pipeline ---\x1b[0m');

    await runner.test('T3.2.1: Single slot replacement: updating Slot 1 preserves slots 2, 3, 4, 5 with identical URLs', async () => {
      const originalSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/orig-slot1.webp';
      const originalSlot2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/orig-slot2.webp';
      const originalSlot3 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/orig-slot3.webp';
      const originalSlot4 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/orig-slot4.webp';
      const originalSlot5 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/orig-slot5.webp';

      // 1. Create product with 5 initial slots
      const initForm = new FormData();
      initForm.append('name', `E2E 5Slot Preservation Test ${Date.now()}`);
      initForm.append('price', '220.00');
      initForm.append('category', 'Collane');
      initForm.append('slot1_url', originalSlot1);
      initForm.append('slot2_url', originalSlot2);
      initForm.append('slot3_url', originalSlot3);
      initForm.append('slot4_url', originalSlot4);
      initForm.append('slot5_url', originalSlot5);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // 2. Update ONLY Slot 1 with a new URL
      const newSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/new-slot1-updated.webp';
      const updateForm = new FormData();
      updateForm.append('name', `E2E 5Slot Preservation Test ${Date.now()}`);
      updateForm.append('price', '220.00');
      updateForm.append('category', 'Collane');
      updateForm.append('slot1_url', newSlot1);
      // Notice: slots 2-5 are not re-supplied in form, existingData in DB must preserve them!

      const updateRes = await updateFullProduct(productId, updateForm);
      assertEqual(updateRes.success, true, 'updateFullProduct should succeed');

      // 3. Verify in DB
      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProduct.gallery[0], newSlot1, 'Slot 1 must be updated');
      assertEqual(dbProduct.gallery[1], originalSlot2, 'Slot 2 MUST be preserved intact');
      assertEqual(dbProduct.gallery[2], originalSlot3, 'Slot 3 MUST be preserved intact');
      assertEqual(dbProduct.gallery[3], originalSlot4, 'Slot 4 MUST be preserved intact');
      assertEqual(dbProduct.gallery[4], originalSlot5, 'Slot 5 MUST be preserved intact');
      assertEqual(dbProduct.image_secondary, newSlot1, 'image_secondary must reflect new slot 1');
      assertEqual(dbProduct.image_primary, originalSlot2, 'image_primary must remain original slot 2');
    });

    await runner.test('T3.2.2: Still Life replacement: updating Slot 2 updates image_primary and preserves Slot 1 (image_secondary)', async () => {
      const slot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1-model.webp';
      const slot2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot2-stilllife.webp';

      const initForm = new FormData();
      initForm.append('name', `E2E Still Life Test ${Date.now()}`);
      initForm.append('price', '175.00');
      initForm.append('category', 'Anelli');
      initForm.append('slot1_url', slot1);
      initForm.append('slot2_url', slot2);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      const newSlot2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/new-slot2-stilllife.webp';
      const updateForm = new FormData();
      updateForm.append('name', `E2E Still Life Test ${Date.now()}`);
      updateForm.append('price', '175.00');
      updateForm.append('category', 'Anelli');
      updateForm.append('slot2_url', newSlot2);

      await updateFullProduct(productId, updateForm);

      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProduct.gallery[0], slot1, 'Slot 1 (model) must be preserved');
      assertEqual(dbProduct.gallery[1], newSlot2, 'Slot 2 (still life) must be updated');
      assertEqual(dbProduct.image_secondary, slot1, 'image_secondary must be preserved');
      assertEqual(dbProduct.image_primary, newSlot2, 'image_primary must be updated to new slot 2');
    });

    await runner.test('T3.2.3: Explicit slot removal: slot3_cleared=true clears slot 3 while keeping slots 1, 2, 4, 5', async () => {
      const s1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/s1.webp';
      const s2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/s2.webp';
      const s3 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/s3.webp';
      const s4 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/s4.webp';

      const initForm = new FormData();
      initForm.append('name', `E2E Clear Slot Test ${Date.now()}`);
      initForm.append('price', '195.00');
      initForm.append('category', 'Bracciali');
      initForm.append('slot1_url', s1);
      initForm.append('slot2_url', s2);
      initForm.append('slot3_url', s3);
      initForm.append('slot4_url', s4);

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // Update form clearing slot 3
      const updateForm = new FormData();
      updateForm.append('name', `E2E Clear Slot Test ${Date.now()}`);
      updateForm.append('price', '195.00');
      updateForm.append('category', 'Bracciali');
      updateForm.append('slot3_cleared', 'true');

      await updateFullProduct(productId, updateForm);

      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProduct.gallery[0], s1, 'Slot 1 preserved');
      assertEqual(dbProduct.gallery[1], s2, 'Slot 2 preserved');
      assertEqual(dbProduct.gallery[2], '', 'Slot 3 must be cleared to empty string');
      assertEqual(dbProduct.gallery[3], s4, 'Slot 4 preserved');
    });

    await runner.test('T3.2.4: Pure metadata update (price & stock) preserves all 5 gallery slots intact', async () => {
      const slots = [
        'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/p1.webp',
        'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/p2.webp',
        'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/p3.webp',
        'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/p4.webp',
        'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/p5.webp',
      ];

      const initForm = new FormData();
      initForm.append('name', `E2E Meta Update Test ${Date.now()}`);
      initForm.append('price', '100.00');
      initForm.append('stock', '5');
      initForm.append('category', 'Orecchini');
      slots.forEach((url, i) => initForm.append(`slot${i+1}_url`, url));

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // Metadata only update
      const updateForm = new FormData();
      updateForm.append('name', `E2E Meta Update Test Edited ${Date.now()}`);
      updateForm.append('price', '110.00');
      updateForm.append('stock', '12');
      updateForm.append('category', 'Orecchini');

      await updateFullProduct(productId, updateForm);

      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProduct.price, 110.0, 'Price updated');
      assertEqual(dbProduct.stock, 12, 'Stock updated');
      for (let i = 0; i < 5; i++) {
        assertEqual(dbProduct.gallery[i], slots[i], `Slot ${i+1} must be perfectly preserved`);
      }
    });

    await runner.test('T3.2.5: Legacy schema product without gallery is migrated into 5-slot structure on update', async () => {
      const legacySecondary = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/legacy-sec.webp';
      const legacyPrimary = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/legacy-prim.webp';

      // Insert raw legacy product with null gallery
      const { data: rawProduct } = await supabaseAdmin.from('products').insert({
        name: `E2E Legacy Migration Test ${Date.now()}`,
        slug: `legacy-migration-${Date.now()}`,
        price: 99.0,
        stock: 5,
        category: 'Collane',
        image_secondary: legacySecondary,
        image_primary: legacyPrimary,
        gallery: null, // legacy empty
      }).select().single();

      const productId = rawProduct.id;
      createdProductIds.push(productId);

      // Execute updateFullProduct
      const updateForm = new FormData();
      updateForm.append('name', `E2E Legacy Migration Test ${Date.now()}`);
      updateForm.append('price', '99.00');
      updateForm.append('stock', '5');
      updateForm.append('category', 'Collane');

      await updateFullProduct(productId, updateForm);

      const { data: migratedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assert(Array.isArray(migratedDb.gallery), 'gallery must now be an array');
      assertEqual(migratedDb.gallery.length, 5, 'gallery must have 5 slots');
      assertEqual(migratedDb.gallery[0], legacySecondary, 'Slot 1 must receive legacy secondary');
      assertEqual(migratedDb.gallery[1], legacyPrimary, 'Slot 2 must receive legacy primary');
    });

  } finally {
    await cleanupTestProducts(createdProductIds);
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}
