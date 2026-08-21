import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getProductCertificateInfo } from '../lib/certificates';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function testCertificates() {
  const { data: prods, error } = await supabase.from('products').select('*').order('name');
  if (error || !prods) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Analyzing certificates for ${prods.length} products...\n`);

  const brokenPaths = new Set<string>();
  const results: any[] = [];

  for (const product of prods) {
    const certInfo = getProductCertificateInfo(product);

    const imagesToCheck = [
      certInfo.certificateImage,
      ...certInfo.tabs.map(t => t.imageSrc)
    ];

    const missingImages: string[] = [];
    for (const img of imagesToCheck) {
      const localPath = path.join(process.cwd(), 'public', img.replace(/^\//, ''));
      if (!fs.existsSync(localPath)) {
        missingImages.push(img);
        brokenPaths.add(img);
      }
    }

    results.push({
      name: product.name,
      sku: product.sku,
      category: product.category,
      gemstone: product.gemstone,
      certificateType: certInfo.certificateType,
      hasGraTabs: certInfo.hasGraTabs,
      tabsCount: certInfo.tabs.length,
      certImageSrc: certInfo.certificateImage,
      missingImages: missingImages.join(', ') || 'NONE (OK)'
    });
  }

  console.table(results);

  console.log('\n--- BROKEN / MISSING IMAGE PATHS ON DISK ---');
  if (brokenPaths.size === 0) {
    console.log('✅ ALL CERTIFICATE IMAGE FILES EXIST ON DISK!');
  } else {
    brokenPaths.forEach(p => console.log('❌ MISSING FILE:', p));
  }
}

testCertificates().catch(console.error);
