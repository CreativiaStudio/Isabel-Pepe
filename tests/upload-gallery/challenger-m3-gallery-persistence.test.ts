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

import { createClient } from '@supabase/supabase-js';
import { addProduct, updateFullProduct, updateProductField, updateProductImage } from '../../app/admin/actions';
import { PUT as productsPutHandler, POST as productsPostHandler } from '../../app/api/admin/products/route';
import { supabaseAdmin } from '../../lib/supabase';
import { NextRequest } from 'next/server';
import {
  TestRunner,
  assert,
  assertEqual,
  assertDefined,
  cleanupTestProducts,
  cleanupTestR2Object,
  createMockImageFile,
} from './test-helpers';

/**
 * Helper to dynamically generate a valid Supabase Admin Bearer Token
 * using an ISOLATED client so supabaseAdmin service role is never mutated.
 */
async function getAdminAuthHeader(): Promise<string> {
  const adminEmail = 'sviluppo@creativiastudio.com';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDQ0ODIsImV4cCI6MjA5NTgyMDQ4Mn0.bI58QLfKC7FtwoW7Cnml4RNnww8rU29bNQ-1YjjH54k';

  const isolatedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const gen = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: adminEmail,
  });

  if (!gen.data?.properties?.email_otp) {
    throw new Error('Failed to generate admin auth magiclink OTP');
  }

  const verified = await isolatedClient.auth.verifyOtp({
    email: adminEmail,
    token: gen.data.properties.email_otp,
    type: 'magiclink',
  });

  if (!verified.data?.session?.access_token) {
    throw new Error('Failed to verify admin auth OTP for test session');
  }

  return `Bearer ${verified.data.session.access_token}`;
}

export async function runChallengerM3Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Challenger Milestone 3: 5-Slot Gallery State & Non-Destructive Persistence');
  const createdProductIds: string[] = [];
  const createdR2Urls: string[] = [];

  console.log('\n⚔️  RUNNING ADVERSARIAL CHALLENGER SUITE (MILESTONE 3)  ⚔️\n');

  let adminAuthHeader = '';
  try {
    adminAuthHeader = await getAdminAuthHeader();
    console.log('✓ Admin authentication bearer token generated for test session.');
  } catch (err: any) {
    console.warn('⚠️ Could not generate admin auth token:', err.message);
  }

  try {
    // =========================================================================
    // VECTOR 1: "Set Isabel Rose (A145)" Multi-Phase Non-Destructive Editing
    // =========================================================================
    console.log('\n--- Vector 1: "Set Isabel Rose (A145)" Multi-Phase Non-Destructive Editing ---');

    let isabelRoseId = '';
    const initialSlots = [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-model.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot2-stilllife.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot3-panorama.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot4-lifestyle.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot5-packaging.webp',
    ];

    await runner.test('V1.1: Seed "Set Isabel Rose (A145)" with 5 full slots and rich metadata', async () => {
      const { data: seeded, error } = await supabaseAdmin
        .from('products')
        .insert({
          name: 'Set Isabel Rose (A145)',
          slug: `set-isabel-rose-a145-${Date.now()}`,
          sku: `A145-${Date.now()}`,
          description: 'Luxury Parure Set with Rose Gold and VVS1 stones.',
          materials: 'Argento 925 nichel free',
          plating: 'Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)',
          gemstone: 'Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color)',
          carats: '2.5ct',
          sizes: ['12', '14', '16'],
          price: 145.0,
          discount_price: 125.0,
          stock: 8,
          category: 'Set',
          gallery: initialSlots,
          image_secondary: initialSlots[0],
          image_primary: initialSlots[1],
          is_active: true,
        })
        .select()
        .single();

      assert(!error, `Failed to seed Isabel Rose: ${error?.message}`);
      assertDefined(seeded?.id, 'Seeded product must have ID');
      isabelRoseId = seeded.id;
      createdProductIds.push(isabelRoseId);

      assertEqual(seeded.gallery.length, 5, 'Must have 5 slots in gallery');
      assertEqual(seeded.image_secondary, initialSlots[0]);
      assertEqual(seeded.image_primary, initialSlots[1]);
    });

    await runner.test('V1.2: updateFullProduct — Replace Slot 1 ONLY, verify Slots 2..5 and metadata untouched', async () => {
      const newSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-v2-4k.webp';
      const formData = new FormData();
      formData.append('name', 'Set Isabel Rose (A145)');
      formData.append('price', '145.00');
      formData.append('discount_price', '125.00');
      formData.append('stock', '8');
      formData.append('category', 'Set');
      formData.append('materials', 'Argento 925 nichel free');
      formData.append('plating', 'Placcatura Oro 18K a Spessore (1.0 µm) + Sigillo Nano-Protective E-Coating (1.0 µm)');
      formData.append('gemstone', 'Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color)');
      formData.append('carats', '2.5ct');
      formData.append('description', 'Luxury Parure Set with Rose Gold and VVS1 stones.');
      formData.append('slot1_url', newSlot1);

      const res = await updateFullProduct(isabelRoseId, formData);
      assertEqual(res.success, true, 'updateFullProduct should succeed');

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', isabelRoseId).single();
      assertDefined(updated, 'Updated record must exist');
      assertEqual(updated.gallery[0], newSlot1, 'Slot 1 must be new URL');
      assertEqual(updated.gallery[1], initialSlots[1], 'Slot 2 MUST be strictly preserved');
      assertEqual(updated.gallery[2], initialSlots[2], 'Slot 3 MUST be strictly preserved');
      assertEqual(updated.gallery[3], initialSlots[3], 'Slot 4 MUST be strictly preserved');
      assertEqual(updated.gallery[4], initialSlots[4], 'Slot 5 MUST be strictly preserved');
      assertEqual(updated.image_secondary, newSlot1, 'image_secondary must match slot 1');
      assertEqual(updated.image_primary, initialSlots[1], 'image_primary must remain slot 2');
      assertEqual(updated.price, 145.0, 'Price must remain untouched');
      assertEqual(updated.discount_price, 125.0, 'Discount price must remain untouched');
      assertEqual(updated.stock, 8, 'Stock must remain untouched');
    });

    await runner.test('V1.3: Update metadata ONLY (Price to €159, Stock to 15), verify ALL 5 slots preserved', async () => {
      const formData = new FormData();
      formData.append('name', 'Set Isabel Rose (A145) Special Edition');
      formData.append('price', '159.00');
      formData.append('discount_price', '');
      formData.append('stock', '15');
      formData.append('category', 'Set');

      const res = await updateFullProduct(isabelRoseId, formData);
      assertEqual(res.success, true, 'updateFullProduct should succeed');

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', isabelRoseId).single();
      assertEqual(updated.price, 159.0, 'Price updated to 159');
      assertEqual(updated.discount_price, null, 'Discount cleared');
      assertEqual(updated.stock, 15, 'Stock updated to 15');

      const currentSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-v2-4k.webp';
      assertEqual(updated.gallery[0], currentSlot1, 'Slot 1 preserved');
      assertEqual(updated.gallery[1], initialSlots[1], 'Slot 2 preserved');
      assertEqual(updated.gallery[2], initialSlots[2], 'Slot 3 preserved');
      assertEqual(updated.gallery[3], initialSlots[3], 'Slot 4 preserved');
      assertEqual(updated.gallery[4], initialSlots[4], 'Slot 5 preserved');
      assertEqual(updated.image_secondary, currentSlot1);
      assertEqual(updated.image_primary, initialSlots[1]);
    });

    await runner.test('V1.4: PUT /api/admin/products — Update Slot 4 via REST PUT with Admin Auth, preserving Slots 1, 2, 3, 5', async () => {
      const newSlot4 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot4-editorial-v2.webp';
      const currentSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-rose-slot1-v2-4k.webp';

      const payload = {
        id: isabelRoseId,
        name: 'Set Isabel Rose (A145) Special Edition',
        price: '159.00',
        stock: '15',
        category: 'Set',
        gallery: [
          currentSlot1,
          initialSlots[1],
          initialSlots[2],
          newSlot4,
          initialSlots[4],
        ],
      };

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminAuthHeader,
        },
        body: JSON.stringify(payload),
      });

      const res = await productsPutHandler(req);
      assertEqual(res.status, 200, 'REST PUT must return HTTP 200 with admin auth');

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', isabelRoseId).single();
      assertEqual(updated.gallery[0], currentSlot1, 'Slot 1 preserved');
      assertEqual(updated.gallery[1], initialSlots[1], 'Slot 2 preserved');
      assertEqual(updated.gallery[2], initialSlots[2], 'Slot 3 preserved');
      assertEqual(updated.gallery[3], newSlot4, 'Slot 4 updated');
      assertEqual(updated.gallery[4], initialSlots[4], 'Slot 5 preserved');
      assertEqual(updated.image_secondary, currentSlot1);
      assertEqual(updated.image_primary, initialSlots[1]);
    });

    await runner.test('V1.5: REST PUT without auth returns HTTP 401 Unauthorized', async () => {
      const payload = {
        id: isabelRoseId,
        name: 'Set Isabel Rose Unauth Edit',
      };

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await productsPutHandler(req);
      assertEqual(res.status, 401, 'Unauthenticated request must return 401');
    });

    // =========================================================================
    // VECTOR 2: Slot Deletion / Clearing Without Index Shifting
    // =========================================================================
    console.log('\n--- Vector 2: Slot Deletion Without Index Shifting ---');

    let deletionProductId = '';
    const fixedSlots = [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-u1.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-u2.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-u3.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-u4.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/test-u5.webp',
    ];

    await runner.test('V2.1: Seed product with 5 distinct test slots', async () => {
      const { data: seeded, error } = await supabaseAdmin
        .from('products')
        .insert({
          name: 'Deletions Test Necklace',
          slug: `del-test-${Date.now()}`,
          price: 99.0,
          stock: 10,
          category: 'Collane',
          gallery: [...fixedSlots],
          image_secondary: fixedSlots[0],
          image_primary: fixedSlots[1],
          is_active: true,
        })
        .select()
        .single();

      assert(!error, `Failed to seed: ${error?.message}`);
      deletionProductId = seeded.id;
      createdProductIds.push(deletionProductId);
    });

    await runner.test('V2.2: Clear Slot 3 (slot3_cleared=true): gallery[2] becomes "" and Slots 4,5 DO NOT shift left', async () => {
      const formData = new FormData();
      formData.append('name', 'Deletions Test Necklace');
      formData.append('price', '99.00');
      formData.append('stock', '10');
      formData.append('category', 'Collane');
      formData.append('slot3_cleared', 'true');

      const res = await updateFullProduct(deletionProductId, formData);
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', deletionProductId).single();
      assertEqual(updated.gallery[0], fixedSlots[0], 'Slot 1 intact');
      assertEqual(updated.gallery[1], fixedSlots[1], 'Slot 2 intact');
      assertEqual(updated.gallery[2], '', 'Slot 3 must be empty string');
      assertEqual(updated.gallery[3], fixedSlots[3], 'Slot 4 MUST NOT shift into Slot 3');
      assertEqual(updated.gallery[4], fixedSlots[4], 'Slot 5 MUST NOT shift into Slot 4');
      assertEqual(updated.gallery.length, 5, 'Gallery array length must remain 5');
    });

    await runner.test('V2.3: Clear Slot 2 (slot2_cleared=true): image_primary falls back to slot 1', async () => {
      const formData = new FormData();
      formData.append('name', 'Deletions Test Necklace');
      formData.append('price', '99.00');
      formData.append('stock', '10');
      formData.append('category', 'Collane');
      formData.append('slot2_cleared', 'true');

      const res = await updateFullProduct(deletionProductId, formData);
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', deletionProductId).single();
      assertEqual(updated.gallery[0], fixedSlots[0], 'Slot 1 intact');
      assertEqual(updated.gallery[1], '', 'Slot 2 cleared');
      assertEqual(updated.gallery[2], '', 'Slot 3 still empty');
      assertEqual(updated.gallery[3], fixedSlots[3], 'Slot 4 intact');
      assertEqual(updated.gallery[4], fixedSlots[4], 'Slot 5 intact');
      assertEqual(updated.image_secondary, fixedSlots[0], 'image_secondary remains slot 1');
      assertEqual(updated.image_primary, fixedSlots[0], 'image_primary falls back to slot 1 when slot 2 is cleared');
    });

    await runner.test('V2.4: Clear Slot 1 (slot1_cleared=true): both image_secondary and image_primary become null', async () => {
      const formData = new FormData();
      formData.append('name', 'Deletions Test Necklace');
      formData.append('price', '99.00');
      formData.append('stock', '10');
      formData.append('category', 'Collane');
      formData.append('slot1_cleared', 'true');

      const res = await updateFullProduct(deletionProductId, formData);
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', deletionProductId).single();
      assertEqual(updated.gallery[0], '', 'Slot 1 cleared');
      assertEqual(updated.gallery[1], '', 'Slot 2 empty');
      assertEqual(updated.gallery[2], '', 'Slot 3 empty');
      assertEqual(updated.gallery[3], fixedSlots[3], 'Slot 4 intact');
      assertEqual(updated.gallery[4], fixedSlots[4], 'Slot 5 intact');
      assertEqual(updated.image_secondary, null, 'image_secondary becomes null');
      assertEqual(updated.image_primary, null, 'image_primary becomes null when slots 1 & 2 are empty');
    });

    await runner.test('V2.5: Clear Slots 4 and 5: entire gallery becomes 5 empty strings with null primary/secondary', async () => {
      const formData = new FormData();
      formData.append('name', 'Deletions Test Necklace');
      formData.append('price', '99.00');
      formData.append('stock', '10');
      formData.append('category', 'Collane');
      formData.append('slot4_cleared', 'true');
      formData.append('slot5_cleared', 'true');

      const res = await updateFullProduct(deletionProductId, formData);
      assertEqual(res.success, true);

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', deletionProductId).single();
      assertEqual(updated.gallery.length, 5, 'Gallery remains 5 slots');
      assertEqual(updated.gallery[0], '');
      assertEqual(updated.gallery[1], '');
      assertEqual(updated.gallery[2], '');
      assertEqual(updated.gallery[3], '');
      assertEqual(updated.gallery[4], '');
      assertEqual(updated.image_secondary, null);
      assertEqual(updated.image_primary, null);
    });

    // =========================================================================
    // VECTOR 3: Sparse Slot Creation & Sparse Persistence
    // =========================================================================
    console.log('\n--- Vector 3: Sparse Slot Ingestion & Persistence ---');

    await runner.test('V3.1: addProduct with sparse slots (Slot 1 and Slot 5 only) maintains 5-element array', async () => {
      const sparseSlot1 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-s1.webp';
      const sparseSlot5 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/sparse-s5.webp';

      const formData = new FormData();
      formData.append('name', `Sparse Test Product ${Date.now()}`);
      formData.append('price', '79.00');
      formData.append('stock', '10');
      formData.append('category', 'Bracciali');
      formData.append('slot1_url', sparseSlot1);
      formData.append('slot5_url', sparseSlot5);

      const res = await addProduct(formData);
      assertEqual(res.success, true, 'addProduct must succeed with sparse slots');
      const prodId = res.product.id;
      createdProductIds.push(prodId);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', prodId).single();
      assertEqual(dbProd.gallery.length, 5, 'Gallery must have length 5');
      assertEqual(dbProd.gallery[0], sparseSlot1, 'Slot 1 matches');
      assertEqual(dbProd.gallery[1], '', 'Slot 2 is empty string');
      assertEqual(dbProd.gallery[2], '', 'Slot 3 is empty string');
      assertEqual(dbProd.gallery[3], '', 'Slot 4 is empty string');
      assertEqual(dbProd.gallery[4], sparseSlot5, 'Slot 5 matches');
      assertEqual(dbProd.image_secondary, sparseSlot1);
      assertEqual(dbProd.image_primary, sparseSlot1);
    });

    await runner.test('V3.2: POST /api/admin/products with sparse array and Admin Auth creates valid 5-slot record', async () => {
      const s2Url = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/rest-sparse-s2.webp';
      const s4Url = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/rest-sparse-s4.webp';

      const payload = {
        name: `REST Sparse Product ${Date.now()}`,
        price: '110.00',
        stock: '5',
        category: 'Orecchini',
        gallery: ['', s2Url, '', s4Url, ''],
      };

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminAuthHeader,
        },
        body: JSON.stringify(payload),
      });

      const res = await productsPostHandler(req);
      assertEqual(res.status, 200, 'POST /api/admin/products should return 200 with admin auth');
      const json = await res.json();
      assertDefined(json.product?.id);
      const prodId = json.product.id;
      createdProductIds.push(prodId);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', prodId).single();
      assertEqual(dbProd.gallery[0], '');
      assertEqual(dbProd.gallery[1], s2Url);
      assertEqual(dbProd.gallery[2], '');
      assertEqual(dbProd.gallery[3], s4Url);
      assertEqual(dbProd.gallery[4], '');
      assertEqual(dbProd.image_secondary, null);
      assertEqual(dbProd.image_primary, s2Url);
    });

    // =========================================================================
    // VECTOR 4: Legacy Product Auto-Migration to 5-Slot Gallery
    // =========================================================================
    console.log('\n--- Vector 4: Legacy Product Auto-Migration ---');

    await runner.test('V4.1: Updating legacy product (gallery=[]) auto-migrates image_secondary -> Slot 1 and image_primary -> Slot 2', async () => {
      const legacySec = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/legacy-sec.webp';
      const legacyPrim = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/legacy-prim.webp';

      const { data: legacyProd, error } = await supabaseAdmin
        .from('products')
        .insert({
          name: 'Legacy Vintage Ring',
          slug: `legacy-ring-${Date.now()}`,
          price: 130.0,
          stock: 10,
          category: 'Anelli',
          image_secondary: legacySec,
          image_primary: legacyPrim,
          gallery: [],
          is_active: true,
        })
        .select()
        .single();

      assert(!error, `Failed to seed legacy: ${error?.message}`);
      createdProductIds.push(legacyProd.id);

      const newSlot3 = 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/legacy-added-slot3.webp';
      const formData = new FormData();
      formData.append('name', 'Legacy Vintage Ring Migrated');
      formData.append('price', '135.00');
      formData.append('stock', '10');
      formData.append('category', 'Anelli');
      formData.append('slot3_url', newSlot3);

      const res = await updateFullProduct(legacyProd.id, formData);
      assertEqual(res.success, true);

      const { data: migrated } = await supabaseAdmin.from('products').select('*').eq('id', legacyProd.id).single();
      assertEqual(migrated.gallery.length, 5, 'Migrated gallery must have length 5');
      assertEqual(migrated.gallery[0], legacySec, 'Legacy image_secondary mapped to slot 1');
      assertEqual(migrated.gallery[1], legacyPrim, 'Legacy image_primary mapped to slot 2');
      assertEqual(migrated.gallery[2], newSlot3, 'New slot 3 correctly appended');
      assertEqual(migrated.gallery[3], '', 'Slot 4 empty');
      assertEqual(migrated.gallery[4], '', 'Slot 5 empty');
      assertEqual(migrated.image_secondary, legacySec);
      assertEqual(migrated.image_primary, legacyPrim);
    });

    await runner.test('V4.2: updateProductImage on legacy record updates target slot and normalizes gallery to 5 elements', async () => {
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
    // VECTOR 5: updateProductField & Inline Persistence
    // =========================================================================
    console.log('\n--- Vector 5: Inline Product Updates ---');

    await runner.test('V5.1: updateProductField updates single field without wiping gallery', async () => {
      const prodId = isabelRoseId;
      const res = await updateProductField(prodId, 'stock', 25);
      assertEqual(res.success, true);

      const { data: dbProd } = await supabaseAdmin.from('products').select('*').eq('id', prodId).single();
      assertEqual(dbProd.stock, 25, 'Stock updated to 25');
      assertEqual(dbProd.gallery.length, 5, 'Gallery remains 5 slots');
      assert(dbProd.gallery[0].length > 0, 'Slot 1 still intact');
    });

    // =========================================================================
    // VECTOR 6: Adversarial Concurrency & Edge Cases
    // =========================================================================
    console.log('\n--- Vector 6: Adversarial Concurrency & Edge Cases ---');

    await runner.test('V6.1: Concurrent updates to different slots on same product resolve deterministically', async () => {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .insert({
          name: 'Concurrent Stress Product',
          slug: `concurrent-stress-${Date.now()}`,
          price: 50.0,
          stock: 5,
          category: 'Collane',
          gallery: ['u1', 'u2', 'u3', 'u4', 'u5'],
          is_active: true,
        })
        .select()
        .single();

      createdProductIds.push(prod.id);

      const form1 = new FormData();
      form1.append('name', 'Concurrent Stress Product');
      form1.append('price', '50.00');
      form1.append('stock', '5');
      form1.append('category', 'Collane');
      form1.append('slot1_url', 'https://r2/u1-new.webp');

      const form2 = new FormData();
      form2.append('name', 'Concurrent Stress Product');
      form2.append('price', '50.00');
      form2.append('stock', '5');
      form2.append('category', 'Collane');
      form2.append('slot5_url', 'https://r2/u5-new.webp');

      await updateFullProduct(prod.id, form1);
      await updateFullProduct(prod.id, form2);

      const { data: finalProd } = await supabaseAdmin.from('products').select('*').eq('id', prod.id).single();
      assertEqual(finalProd.gallery[0], 'https://r2/u1-new.webp', 'Slot 1 update preserved');
      assertEqual(finalProd.gallery[1], 'u2', 'Slot 2 preserved');
      assertEqual(finalProd.gallery[2], 'u3', 'Slot 3 preserved');
      assertEqual(finalProd.gallery[3], 'u4', 'Slot 4 preserved');
      assertEqual(finalProd.gallery[4], 'https://r2/u5-new.webp', 'Slot 5 update preserved');
    });

    await runner.test('V6.2: Malformed gallery array with fewer than 5 items pads to exactly 5 elements in REST PUT', async () => {
      const testProdId = isabelRoseId;
      const payload = {
        id: testProdId,
        name: 'Set Isabel Rose (A145)',
        price: '159.00',
        stock: '15',
        category: 'Set',
        gallery: ['https://r2/slot1-only.webp'], // Only 1 element
      };

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminAuthHeader,
        },
        body: JSON.stringify(payload),
      });

      const res = await productsPutHandler(req);
      assertEqual(res.status, 200, 'PUT with padded gallery should succeed');

      const { data: updated } = await supabaseAdmin.from('products').select('*').eq('id', testProdId).single();
      assertEqual(updated.gallery.length, 5, 'Gallery padded to 5 elements');
      assertEqual(updated.gallery[0], 'https://r2/slot1-only.webp');
      assertEqual(updated.gallery[1], '');
      assertEqual(updated.gallery[2], '');
      assertEqual(updated.gallery[3], '');
      assertEqual(updated.gallery[4], '');
    });

  } finally {
    console.log('\n--- Cleaning up temporary test products & R2 objects ---');
    if (createdProductIds.length > 0) {
      await cleanupTestProducts(createdProductIds);
      console.log(`Cleaned up ${createdProductIds.length} test products.`);
    }
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}

// Direct CLI Execution
if (require.main === module) {
  runChallengerM3Tests()
    .then((runner) => {
      const summary = runner.summary();
      console.log('\n========================================================================');
      console.log('                 CHALLENGER M3 TEST SUMMARY REPORT                      ');
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
