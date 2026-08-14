import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

const env: any = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${(env.R2_ACCOUNT_ID || '').trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: (env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (env.R2_SECRET_ACCESS_KEY || '').trim(),
  },
  forcePathStyle: true,
});

async function list() {
  const command = new ListObjectsCommand({ Bucket: env.R2_BUCKET_NAME });
  const response = await r2Client.send(command);
  const objects = response.Contents || [];
  console.log(objects.map(o => o.Key).join('\n'));
}

list().catch(console.error);
