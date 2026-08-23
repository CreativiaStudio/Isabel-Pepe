import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import { uploadToR2, getR2Config, renameR2Object } from '../../lib/r2';
import { addProduct, updateFullProduct, updateProductField, deleteProduct } from '../../app/admin/actions';
import { supabaseAdmin } from '../../lib/supabase';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockImageFile,
  createMockUploadRequest,
  safeParseUploadResponse,
  cleanupTestProducts,
  cleanupTestR2Object,
} from './test-helpers';

export async function runTier1Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 1: Feature Coverage (R1, R2, R3, R4)');
  const createdProductIds: string[] = [];
  const createdR2Urls: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 1: EXHAUSTIVE FEATURE COVERAGE (R1, R2, R3, R4)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // FEATURE 1: Route Ingestion & Response Guarantees (POST /api/upload)
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Feature 1: Route Ingestion (POST /api/upload) ---\x1b[0m');

    await runner.test('T1.1.1: Standard JPEG image upload returns 200 with JSON and valid R2 URL', async () => {
      const file = await createMockImageFile({ width: 300, height: 300, format: 'jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 200, 'HTTP status should be 200');
      const contentType = res.headers.get('content-type') || '';
      assertIncludes(contentType, 'application/json', 'Content-Type must be application/json');

      const data = await res.json();
      assertEqual(data.success, true, 'Response JSON success should be true');
      assertDefined(data.url, 'Response JSON must contain url');
      assertIncludes(data.url, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/', 'URL must point to R2 products folder');
      assertIncludes(data.url, '.webp', 'URL should have .webp extension');

      createdR2Urls.push(data.url);
    });

    await runner.test('T1.1.2: Standard PNG image upload converts to WebP and returns 200', async () => {
      const file = await createMockImageFile({ width: 250, height: 250, format: 'png' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 200, 'HTTP status should be 200');
      const data = await res.json();
      assertEqual(data.success, true, 'Upload should succeed');
      assertIncludes(data.url, '.webp', 'PNG should be optimized to WebP');

      createdR2Urls.push(data.url);
    });

    await runner.test('T1.1.3: Upload with customName embeds sanitized name in R2 key', async () => {
      const customName = `isabel-pepe-e2e-tier1-slot1-${Date.now()}`;
      const file = await createMockImageFile({ width: 150, height: 150, format: 'jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      formData.append('customName', customName);

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Upload should return 200');
      assertIncludes(data.url, customName, 'URL should include the customName slug');

      createdR2Urls.push(data.url);
    });

    await runner.test('T1.1.4: Upload to specific folder (e.g. "certificates") prefixes R2 key correctly', async () => {
      const file = await createMockImageFile({ width: 100, height: 100, format: 'jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'certificates');

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Upload should return 200');
      assertIncludes(data.url, '/certificates/', 'URL must contain /certificates/ prefix');

      createdR2Urls.push(data.url);
    });

    await runner.test('T1.1.5: REST route error response returns guaranteed application/json header', async () => {
      const formData = new FormData(); // Empty formData without file
      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 400, 'Missing file should return 400');
      const contentType = res.headers.get('content-type') || '';
      assertIncludes(contentType, 'application/json', 'Error responses must be application/json');
      const data = await res.json();
      assertDefined(data.error, 'Error response must contain error message string');
    });

    // =========================================================================
    // FEATURE 2: Client-Side Safe Response Parsing (safeParseUploadResponse)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 2: Safe Response Parser (safeParseUploadResponse) ---\x1b[0m');

    await runner.test('T1.2.1: Parses valid HTTP 200 JSON upload response cleanly', async () => {
      const mockUrl = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sample.webp';
      const mockRes = new Response(JSON.stringify({ success: true, url: mockUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, true, 'parsed success should be true');
      assertEqual(parsed.url, mockUrl, 'parsed url should match response');
      assertEqual(parsed.error, undefined, 'parsed error should be undefined');
    });

    await runner.test('T1.2.2: Parses HTTP 400 JSON validation error cleanly', async () => {
      const mockRes = new Response(JSON.stringify({ error: 'Nessun file fornito o file vuoto.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'parsed success should be false');
      assertIncludes(parsed.error || '', 'Nessun file fornito', 'Error message should be preserved');
    });

    await runner.test('T1.2.3: Parses HTTP 413 JSON size limit error cleanly', async () => {
      const mockRes = new Response(JSON.stringify({ error: 'La dimensione del file supera il limite massimo di 20MB.' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'parsed success should be false');
      assertIncludes(parsed.error || '', '20MB', 'Error message should mention 20MB');
    });

    await runner.test('T1.2.4: Parses HTTP 500 JSON server error cleanly', async () => {
      const mockRes = new Response(JSON.stringify({ error: 'Errore durante il caricamento su Cloudflare R2: S3 Timeout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'parsed success should be false');
      assertIncludes(parsed.error || '', 'Cloudflare R2', 'Error message should be parsed');
    });

    await runner.test('T1.2.5: Parses text/plain error response without JSON syntax crash', async () => {
      const mockRes = new Response('Bad Gateway: Proxy connection refused', {
        status: 502,
        headers: { 'Content-Type': 'text/plain' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'parsed success should be false');
      assertDefined(parsed.error, 'Error message must be set');
      assert(typeof parsed.error === 'string', 'Error message must be a string');
    });

    // =========================================================================
    // FEATURE 3: Server-Side R2 Storage Pipeline & Sharp Optimization (lib/r2.ts)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 3: Server R2 Storage & Sharp (lib/r2.ts) ---\x1b[0m');

    await runner.test('T1.3.1: uploadToR2 compresses image with Sharp and stores on R2', async () => {
      const file = await createMockImageFile({ width: 400, height: 400, format: 'jpeg' });
      const publicUrl = await uploadToR2(file, 'products', `tier1-sharp-opt-${Date.now()}`);

      assertDefined(publicUrl, 'Returned URL must be defined');
      assertIncludes(publicUrl, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/', 'URL must point to R2 products');
      assertIncludes(publicUrl, '.webp', 'Image should be saved as .webp');

      createdR2Urls.push(publicUrl);
    });

    await runner.test('T1.3.2: uploadToR2 handles non-image file uploads preserving extension', async () => {
      const textBuffer = Buffer.from('Certificate Data Content');
      const file = new File([textBuffer], 'certificate.pdf', { type: 'application/pdf' });
      const publicUrl = await uploadToR2(file, 'certificates', `tier1-cert-${Date.now()}`);

      assertDefined(publicUrl, 'Returned URL must be defined');
      assertIncludes(publicUrl, '.pdf', 'Non-image file should retain original extension');

      createdR2Urls.push(publicUrl);
    });

    await runner.test('T1.3.3: uploadToR2 generates unique filename when customName is omitted', async () => {
      const file = await createMockImageFile({ width: 100, height: 100, format: 'jpeg' });
      const url1 = await uploadToR2(file, 'products');
      const url2 = await uploadToR2(file, 'products');

      assert(url1 !== url2, 'Generated URLs without customName must be unique');
      createdR2Urls.push(url1, url2);
    });

    await runner.test('T1.3.4: getR2Config returns valid configuration parameters', () => {
      const config = getR2Config();
      assertDefined(config.accountId, 'R2 Account ID must be defined');
      assertDefined(config.accessKeyId, 'R2 Access Key ID must be defined');
      assertDefined(config.secretAccessKey, 'R2 Secret Access Key must be defined');
      assertEqual(config.bucketName, 'isabel-pepe', 'Bucket name must be isabel-pepe');
      assertEqual(config.publicUrl, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev', 'Public URL must match R2 dev URL');
    });

    await runner.test('T1.3.5: renameR2Object copies and removes old object on R2', async () => {
      const file = await createMockImageFile({ width: 100, height: 100, format: 'jpeg' });
      const timestamp = Date.now();
      const oldKey = `products/test_rename_src_${timestamp}.webp`;
      const newKey = `products/test_rename_dest_${timestamp}.webp`;

      // Upload source
      await uploadToR2(file, 'products', `test_rename_src_${timestamp}`);
      
      // Execute rename
      const renamed = await renameR2Object(oldKey, newKey);
      assertEqual(renamed, true, 'renameR2Object should return true');

      // Cleanup
      await cleanupTestR2Object(newKey);
    });

    // =========================================================================
    // FEATURE 4: 5-Slot Gallery Synchronization & Database Persistence (actions.ts)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Feature 4: 5-Slot Gallery Persistence (actions.ts) ---\x1b[0m');

    await runner.test('T1.4.1: addProduct with 5 image slots stores all 5 URLs in products.gallery array', async () => {
      const formData = new FormData();
      formData.append('name', `E2E Anello Tier 1 ${Date.now()}`);
      formData.append('sku', `SKU-T1-${Date.now().toString().slice(-4)}`);
      formData.append('price', '149.00');
      formData.append('stock', '5');
      formData.append('category', 'Anelli');
      formData.append('materials', 'Argento 925 nichel free');
      formData.append('slot1_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1.webp');
      formData.append('slot2_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot2.webp');
      formData.append('slot3_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot3.webp');
      formData.append('slot4_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot4.webp');
      formData.append('slot5_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot5.webp');

      const result = await addProduct(formData);
      assertEqual(result.success, true, 'addProduct should succeed');
      assertDefined(result.product?.id, 'Returned product must have an ID');

      const productId = result.product.id;
      createdProductIds.push(productId);

      // Verify in DB
      const { data: dbProduct, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      assert(!error && dbProduct !== null, 'Product must exist in database');
      assert(Array.isArray(dbProduct.gallery), 'gallery must be an array');
      assertEqual(dbProduct.gallery.length, 5, 'gallery must have exactly 5 elements');
      assertEqual(dbProduct.gallery[0], 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot1.webp', 'Slot 1 must match');
      assertEqual(dbProduct.gallery[4], 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/slot5.webp', 'Slot 5 must match');
    });

    await runner.test('T1.4.2: addProduct sets image_secondary=gallery[0] and image_primary=gallery[1]', async () => {
      const slot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/model-slot1.webp';
      const slot2 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/stilllife-slot2.webp';

      const formData = new FormData();
      formData.append('name', `E2E Collana Dual Slot ${Date.now()}`);
      formData.append('price', '180.00');
      formData.append('category', 'Collane');
      formData.append('slot1_url', slot1);
      formData.append('slot2_url', slot2);

      const result = await addProduct(formData);
      assertEqual(result.success, true, 'addProduct should succeed');
      const productId = result.product.id;
      createdProductIds.push(productId);

      const { data: dbProduct } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(dbProduct.image_secondary, slot1, 'image_secondary must match slot1 (Model 2:3)');
      assertEqual(dbProduct.image_primary, slot2, 'image_primary must match slot2 (Still Life 1:1)');
    });

    await runner.test('T1.4.3: updateFullProduct updates metadata and maintains 5-slot structure', async () => {
      // Create initial product
      const initForm = new FormData();
      initForm.append('name', `E2E Orecchini Before Update ${Date.now()}`);
      initForm.append('price', '120.00');
      initForm.append('stock', '3');
      initForm.append('category', 'Orecchini');
      initForm.append('slot1_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/earrings-1.webp');

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      // Perform update
      const updateForm = new FormData();
      updateForm.append('name', `E2E Orecchini After Update ${Date.now()}`);
      updateForm.append('price', '135.00');
      updateForm.append('stock', '8');
      updateForm.append('category', 'Orecchini');
      updateForm.append('slot1_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/earrings-1.webp');
      updateForm.append('slot2_url', 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/earrings-2.webp');

      const updateRes = await updateFullProduct(productId, updateForm);
      assertEqual(updateRes.success, true, 'updateFullProduct should succeed');

      const { data: updatedDb } = await supabaseAdmin.from('products').select('*').eq('id', productId).single();
      assertEqual(updatedDb.price, 135.0, 'Price should be updated to 135');
      assertEqual(updatedDb.stock, 8, 'Stock should be updated to 8');
      assertEqual(updatedDb.gallery[1], 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/earrings-2.webp', 'Slot 2 should be added');
    });

    await runner.test('T1.4.4: updateProductField modifies single field in Supabase table', async () => {
      const initForm = new FormData();
      initForm.append('name', `E2E Single Field Test ${Date.now()}`);
      initForm.append('price', '90.00');
      initForm.append('stock', '10');
      initForm.append('category', 'Bracciali');

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;
      createdProductIds.push(productId);

      const fieldRes = await updateProductField(productId, 'stock', 42);
      assertEqual(fieldRes.success, true, 'updateProductField should succeed');

      const { data: dbProduct } = await supabaseAdmin.from('products').select('stock').eq('id', productId).single();
      assertEqual(dbProduct?.stock, 42, 'Stock should be updated to 42');
    });

    await runner.test('T1.4.5: deleteProduct removes product cleanly from database', async () => {
      const initForm = new FormData();
      initForm.append('name', `E2E Delete Candidate ${Date.now()}`);
      initForm.append('price', '50.00');
      initForm.append('category', 'Collane');

      const createRes = await addProduct(initForm);
      const productId = createRes.product.id;

      const deleteRes = await deleteProduct(productId);
      assertEqual(deleteRes.success, true, 'deleteProduct should return success');

      const { data: dbProduct } = await supabaseAdmin.from('products').select('id').eq('id', productId).single();
      assertEqual(dbProduct, null, 'Deleted product should not exist in database');
    });

  } finally {
    // Database and R2 Teardown
    await cleanupTestProducts(createdProductIds);
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}
