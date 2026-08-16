async function testHttpUpload() {
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(samplePngBase64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'test_http_upload.png', { type: 'image/png' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'products');
  formData.append('customName', 'test-http-api-upload-' + Date.now());

  console.log('Sending POST to http://localhost:3000/api/upload...');
  const res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
  if (!res.ok || !data.success) {
    throw new Error('Upload failed!');
  }
  console.log('✓ /api/upload is 100% OPERATIONAL!');
}

testHttpUpload().catch(console.error);
