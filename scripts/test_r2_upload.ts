import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

async function testR2() {
  console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? 'SET' : 'MISSING');
  console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'SET' : 'MISSING');
  console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING');
  console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
  console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL);

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${(process.env.R2_ACCOUNT_ID || '').trim()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: (process.env.R2_ACCESS_KEY_ID || '').trim(),
      secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || '').trim(),
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    forcePathStyle: true,
  });

  try {
    console.log('\nTesting ListObjects on R2...');
    const listRes = await r2Client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 5,
    }));
    console.log('ListObjects Success! Total objects found:', listRes.KeyCount);
    if (listRes.Contents && listRes.Contents.length > 0) {
      console.log('Sample key:', listRes.Contents[0].Key);
    }
  } catch (err: any) {
    console.error('ListObjects Error:', err);
  }

  try {
    console.log('\nTesting PutObject (upload test file) on R2...');
    const testContent = Buffer.from('test upload content ' + Date.now());
    const testKey = `products/test-diagnostic-${Date.now()}.txt`;
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }));
    console.log('PutObject Success! Uploaded key:', testKey);
    console.log('Public URL would be:', `${process.env.R2_PUBLIC_URL}/${testKey}`);
  } catch (err: any) {
    console.error('PutObject Error:', err);
  }
}

testR2();
