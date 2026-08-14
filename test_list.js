const { AwsClient } = require('aws4fetch');
const fs = require('fs');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const aws = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  service: 's3'
});

async function testList() {
  const url = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/test_file.txt`;
  const res = await aws.fetch(url, { method: 'PUT', body: 'hello' });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text.substring(0, 500));
}

testList();
