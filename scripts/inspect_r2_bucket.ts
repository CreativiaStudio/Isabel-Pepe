import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

async function inspectR2() {
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

  console.log('Fetching ALL objects in bucket:', process.env.R2_BUCKET_NAME);
  try {
    const res = await r2Client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    }));
    console.log('Total objects found in root:', res.KeyCount);
    if (res.Contents) {
      res.Contents.forEach((c, idx) => {
        console.log(`[${idx+1}] Key: "${c.Key}" (${c.Size} bytes)`);
      });
    }

    console.log('\nFetching with Prefix "products/":');
    const resProducts = await r2Client.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: 'products/',
    }));
    console.log('Total objects found in products/:', resProducts.KeyCount);
    if (resProducts.Contents) {
      resProducts.Contents.forEach((c, idx) => {
        console.log(`  [${idx+1}] Key: "${c.Key}"`);
      });
    }
  } catch (err: any) {
    console.error('Error inspecting R2:', err);
  }
}

inspectR2();
