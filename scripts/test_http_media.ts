async function testHttpMedia() {
  console.log('Sending GET to http://localhost:3000/api/media...');
  const res = await fetch('http://localhost:3000/api/media');
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Total files returned:', data.files?.length);
  if (!res.ok || !data.success || data.files?.length === 0) {
    throw new Error('Media fetch failed!');
  }
  console.log('Sample file:', data.files[0]);
  console.log('✓ /api/media is 100% OPERATIONAL!');
}

testHttpMedia().catch(console.error);
