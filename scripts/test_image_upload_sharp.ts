import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import { uploadToR2 } from '../lib/r2';

async function testImageUpload() {
  // Let's create a small real test image buffer
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(samplePngBase64, 'base64');
  
  // Create a File-like object or Blob
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'test_sample.png', { type: 'image/png' });

  console.log('Testing uploadToR2 with File object:');
  console.log('File size:', file.size, 'type:', file.type, 'name:', file.name);

  try {
    const url = await uploadToR2(file, 'products', 'test-diagnostic-sharp-image');
    console.log('SUCCESS! Uploaded image URL:', url);
  } catch (err: any) {
    console.error('FAILED uploadToR2:', err);
  }
}

testImageUpload();
