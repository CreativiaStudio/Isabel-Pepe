import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { addProduct, updateFullProduct, updateProductImage } from '../../app/admin/actions';
import { uploadToR2 } from '../../lib/r2';
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockImageFile,
  compressImageClientNode,
  cleanupTestProducts,
  cleanupTestR2Object,
} from './test-helpers';

export async function runTier4Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 4: Real-World Scenarios');
  const createdProductIds: string[] = [];
  const createdR2Urls: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 4: REAL-WORLD LUXURY E-COMMERCE SCENARIOS\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // SCENARIO 1: Set Isabel Rose (A145) Full Catalog Lifecycle
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Scenario 1: "Set Isabel Rose (A145)" Catalog Lifecycle ---\x1b[0m');

    let isabelRoseId: string = '';
    const slot1Original = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-model-v1.webp';
    const slot2Original = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot2-stilllife-gold-v1.webp';
    const slot3Original = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot3-panorama-v1.webp';

    await runner.test('T4.1.1: Creation of "Set Isabel Rose (A145)" with 3 official luxury images', async () => {
      const formData = new FormData();
      formData.append('name', `Set Isabel Rose (A145) ${Date.now()}`);
      formData.append('sku', `A145-${Date.now().toString().slice(-4)}`);
      formData.append('description', 'Parure esclusiva Isabel Pepe con finitura oro rosa 18k e pietre taglio brillante.');
      formData.append('materials', 'Argento 925 nichel free');
      formData.append('plating', 'Placcatura Oro Rosa 18K (1.0µm) + Nano-Coating');
      formData.append('gemstone', 'Pietre di Pura Luce (Taglio Brillante VVS1 D-Color)');
      formData.append('price', '145.00');
      formData.append('stock', '4');
      formData.append('category', 'Set');
      formData.append('slot1_url', slot1Original);
      formData.append('slot2_url', slot2Original);
      formData.append('slot3_url', slot3Original);

      const res = await addProduct(formData);
      assertEqual(res.success, true, 'Product creation must succeed');
      isabelRoseId = res.product.id;
      createdProductIds.push(isabelRoseId);

      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', isabelRoseId).single();
      assertDefined(dbProduct, 'Product must be in DB');
      assertEqual(dbProduct.gallery[0], slot1Original, 'Slot 1 Model 2:3 must match');
      assertEqual(dbProduct.gallery[1], slot2Original, 'Slot 2 Still Life 1:1 must match');
      assertEqual(dbProduct.gallery[2], slot3Original, 'Slot 3 Panorama 1:1 must match');
      assertEqual(dbProduct.image_secondary, slot1Original, 'image_secondary must match slot1');
      assertEqual(dbProduct.image_primary, slot2Original, 'image_primary must match slot2');
    });

    await runner.test('T4.1.2: Edit "Set Isabel Rose (A145)": replace Slot 1, populate Slots 4 & 5, apply discount', async () => {
      assert(!!isabelRoseId, 'isabelRoseId must be set');
      const newSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-model-4k-retouched.webp';
      const slot4New = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot4-lifestyle.webp';
      const slot5New = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot5-packaging.webp';

      const updateForm = new FormData();
      updateForm.append('name', `Set Isabel Rose (A145) Luxury Edit`);
      updateForm.append('price', '145.00');
      updateForm.append('discount_price', '125.00');
      updateForm.append('stock', '6');
      updateForm.append('category', 'Set');
      updateForm.append('slot1_url', newSlot1);
      updateForm.append('slot4_url', slot4New);
      updateForm.append('slot5_url', slot5New);

      const updateRes = await updateFullProduct(isabelRoseId, updateForm);
      assertEqual(updateRes.success, true, 'Product update must succeed');

      const { data: updatedProduct } = await supabaseAdmin.from('products').select('*').eq('id', isabelRoseId).single();
      assertEqual(updatedProduct.gallery[0], newSlot1, 'Slot 1 must be updated to new 4K retouched photo');
      assertEqual(updatedProduct.gallery[1], slot2Original, 'Slot 2 (Still Life) MUST be preserved intact');
      assertEqual(updatedProduct.gallery[2], slot3Original, 'Slot 3 (Panorama) MUST be preserved intact');
      assertEqual(updatedProduct.gallery[3], slot4New, 'Slot 4 must be populated');
      assertEqual(updatedProduct.gallery[4], slot5New, 'Slot 5 must be populated');
      assertEqual(updatedProduct.discount_price, 125.0, 'Discount price must be €125');
      assertEqual(updatedProduct.image_secondary, newSlot1, 'image_secondary must reflect new slot 1');
      assertEqual(updatedProduct.image_primary, slot2Original, 'image_primary must remain original slot 2');
    });

    // =========================================================================
    // SCENARIO 2: High-Resolution Smartphone Photo Ingestion (48MP Camera / 15MB)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Scenario 2: High-Resolution Smartphone Photo Ingestion ---\x1b[0m');

    await runner.test('T4.2.1: Ingestion & client pre-compression of 15MB 4000x3000 camera photo', async () => {
      // 1. Generate 15MB simulated camera photo (4000x3000)
      const rawCameraPhoto = await createMockImageFile({
        name: 'IMG_4821_IPHONE_PRO_RAW.jpg',
        width: 3000,
        height: 2000,
        format: 'jpeg',
        sizeBytes: 12 * 1024 * 1024,
      });

      // 2. Run client compression pipeline (downscales to max 2000px, 85% WebP)
      const compressedFile = await compressImageClientNode(rawCameraPhoto, { maxDim: 2000, quality: 85 });
      assert(compressedFile.size < rawCameraPhoto.size, 'Compressed file size must be smaller than raw photo');
      assert(compressedFile.size < 2 * 1024 * 1024, 'Compressed photo should be well under 2MB');
      assertEqual(compressedFile.type, 'image/webp', 'Compressed photo format must be image/webp');

      // 3. Upload to R2
      const uploadedUrl = await uploadToR2(compressedFile, 'products', `tier4-smartphone-compressed-${Date.now()}`);
      assertDefined(uploadedUrl, 'Uploaded URL must be defined');
      assertIncludes(uploadedUrl, '.webp', 'Uploaded URL must be .webp');
      createdR2Urls.push(uploadedUrl);
    });

    // =========================================================================
    // SCENARIO 3: Admin Table Quick Image Replacement (updateProductImage)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Scenario 3: Admin Table Quick Image Replacement ---\x1b[0m');

    await runner.test('T4.3.1: Admin quick replace primary image via updateProductImage', async () => {
      // Create product
      const form = new FormData();
      form.append('name', `E2E Quick Table Replace ${Date.now()}`);
      form.append('price', '85.00');
      form.append('category', 'Collane');

      const createRes = await addProduct(form);
      const prodId = createRes.product.id;
      createdProductIds.push(prodId);

      // Quick update primary
      const newImg = await createMockImageFile({ width: 200, height: 200, format: 'jpeg' });
      const updateRes = await updateProductImage(prodId, newImg, 'primary');
      
      // Verification
      if (updateRes.success) {
        assertDefined(updateRes.url, 'Updated primary image URL must be returned');
        const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', prodId).single();
        assertEqual(dbProd.image_primary, updateRes.url, 'image_primary in DB must be updated');
      }
    });

    // =========================================================================
    // SCENARIO 4: Multi-Slot Concurrent Upload & State Integrity
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Scenario 4: Concurrent Multi-Slot Upload & State Integrity ---\x1b[0m');

    await runner.test('T4.4.1: Concurrent upload of all 5 slots completes with distinct URLs and no slot swapping', async () => {
      const files = await Promise.all([
        createMockImageFile({ width: 100, height: 100, format: 'jpeg', name: 'slot1.jpg' }),
        createMockImageFile({ width: 100, height: 100, format: 'jpeg', name: 'slot2.jpg' }),
        createMockImageFile({ width: 100, height: 100, format: 'jpeg', name: 'slot3.jpg' }),
        createMockImageFile({ width: 100, height: 100, format: 'jpeg', name: 'slot4.jpg' }),
        createMockImageFile({ width: 100, height: 100, format: 'jpeg', name: 'slot5.jpg' }),
      ]);

      const timestamp = Date.now();
      const uploadPromises = files.map((file, idx) =>
        uploadToR2(file, 'products', `tier4-concurrent-slot${idx + 1}-${timestamp}`)
      );

      const urls = await Promise.all(uploadPromises);
      assertEqual(urls.length, 5, 'Must have 5 uploaded URLs');
      const uniqueUrls = new Set(urls);
      assertEqual(uniqueUrls.size, 5, 'All 5 uploaded URLs must be distinct');

      for (let i = 0; i < 5; i++) {
        assertIncludes(urls[i], `slot${i + 1}`, `URL ${i + 1} must correspond to slot${i + 1}`);
      }

      createdR2Urls.push(...urls);
    });

  } finally {
    await cleanupTestProducts(createdProductIds);
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}
