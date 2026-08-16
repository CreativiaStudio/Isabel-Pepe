import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';
import { uploadToR2, getR2Client } from '../lib/r2';
import { getMediaLibrary } from '../app/admin/actions';

async function testCompleteFlow() {
  console.log('=== STEP 1: Test R2 Media Library Fetch ===');
  const media = await getMediaLibrary();
  console.log(`✓ Fetched ${media.length} items from R2.`);
  if (media.length === 0) {
    throw new Error('R2 returned 0 items!');
  }

  console.log('\n=== STEP 2: Test Upload to R2 ===');
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(samplePngBase64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'test_e2e_image.png', { type: 'image/png' });

  const uploadedUrl = await uploadToR2(file, 'products', `test-e2e-${Date.now()}`);
  console.log('✓ Successfully uploaded test image to R2:', uploadedUrl);

  console.log('\n=== STEP 3: Test Product Update in Supabase ===');
  // Fetch one product to test
  const { data: product, error: fetchErr } = await supabaseAdmin.from('products').select('*').limit(1).single();
  if (fetchErr || !product) {
    throw new Error('Could not fetch test product: ' + fetchErr?.message);
  }
  console.log(`Found test product: [${product.name}] (ID: ${product.id})`);

  const currentGallery = Array.isArray(product.gallery) ? [...product.gallery] : [];
  while (currentGallery.length < 5) currentGallery.push('');
  
  // Set test URL in slot 3
  currentGallery[2] = uploadedUrl;

  const { error: updateErr } = await supabaseAdmin.from('products').update({
    gallery: currentGallery,
    image_primary: currentGallery[1] || product.image_primary,
    image_secondary: currentGallery[0] || product.image_secondary,
  }).eq('id', product.id);

  if (updateErr) {
    throw new Error('Update in Supabase failed: ' + updateErr.message);
  }
  console.log('✓ Successfully updated gallery in Supabase!');

  console.log('\n=== STEP 4: Verification Read from Supabase ===');
  const { data: updatedProduct } = await supabaseAdmin.from('products').select('id, name, gallery').eq('id', product.id).single();
  console.log('Verified updated gallery in DB:', updatedProduct?.gallery);
  if (updatedProduct?.gallery?.[2] !== uploadedUrl) {
    throw new Error('Verification failed: Slot 3 does not match uploaded URL!');
  }
  console.log('✓ 100% End-to-End Verification PASSED!');
}

testCompleteFlow().catch((e) => {
  console.error('Test FAILED:', e);
  process.exit(1);
});
