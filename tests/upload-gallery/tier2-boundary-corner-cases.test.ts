import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { POST as uploadRouteHandler } from '../../app/api/upload/route';
import { uploadToR2 } from '../../lib/r2';
import {
  TestRunner,
  assert,
  assertEqual,
  assertIncludes,
  assertDefined,
  createMockImageFile,
  createMockUploadRequest,
  safeParseUploadResponse,
  cleanupTestR2Object,
} from './test-helpers';

export async function runTier2Tests(): Promise<TestRunner> {
  const runner = new TestRunner('Tier 2: Boundary & Corner Cases');
  const createdR2Urls: string[] = [];

  console.log('\n\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m  TIER 2: BOUNDARY & CORNER CASES (Limits, Fallbacks, HTML Parsing)\x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // =========================================================================
    // BOUNDARY 1: Route Handler Limits & Input Validation
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- Boundary 1: Route Limits & Validation ---\x1b[0m');

    await runner.test('T2.1.1: 0-byte empty file upload returns HTTP 400 with JSON error', async () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', emptyFile);
      formData.append('folder', 'products');

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 400, '0-byte file should return HTTP 400');
      const data = await res.json();
      assertDefined(data.error, 'Error message must be present in JSON');
    });

    await runner.test('T2.1.2: Missing file parameter in FormData returns HTTP 400', async () => {
      const formData = new FormData();
      formData.append('folder', 'products');
      formData.append('customName', 'test-no-file');

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 400, 'Missing file should return HTTP 400');
      const data = await res.json();
      assertDefined(data.error, 'Response must have error field');
    });

    await runner.test('T2.1.3: Boundary file at 10MB payload size is processed cleanly', async () => {
      // 10MB payload test
      const tenMbFile = await createMockImageFile({
        width: 1000,
        height: 1000,
        format: 'jpeg',
        sizeBytes: 10 * 1024 * 1024,
      });

      const formData = new FormData();
      formData.append('file', tenMbFile);
      formData.append('folder', 'products');
      formData.append('customName', `tier2-10mb-${Date.now()}`);

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);

      assertEqual(res.status, 200, '10MB file within 20MB limit should succeed');
      const data = await res.json();
      assertEqual(data.success, true, 'Upload should succeed');
      createdR2Urls.push(data.url);
    });

    await runner.test('T2.1.4: Safe response parser detects 20MB limit rejection (HTTP 413)', async () => {
      const res413 = new Response(JSON.stringify({ error: 'La dimensione del file supera il limite massimo di 20MB.' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });

      const parsed = await safeParseUploadResponse(res413);
      assertEqual(parsed.success, false, 'Should parse as failure');
      assertIncludes(parsed.error || '', '20MB', 'Error must state 20MB limit');
    });

    await runner.test('T2.1.5: Dangerous customName input is handled without path traversal', async () => {
      const dangerousName = '../../products/evil-test-<script>alert(1)</script>';
      const file = await createMockImageFile({ width: 100, height: 100, format: 'jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      formData.append('customName', dangerousName);

      const req = createMockUploadRequest(formData);
      const res = await uploadRouteHandler(req);
      const data = await res.json();

      assertEqual(res.status, 200, 'Upload should complete safely');
      assert(!data.url.includes('../'), 'URL must not contain path traversal ../');
      createdR2Urls.push(data.url);
    });

    // =========================================================================
    // BOUNDARY 2: Sharp Failures & Raw Buffer Fallback (lib/r2.ts)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Boundary 2: Sharp Failures & Raw Buffer Fallback ---\x1b[0m');

    await runner.test('T2.2.1: Corrupted image stream caught by Sharp and saved via raw buffer fallback', async () => {
      const corruptFile = await createMockImageFile({
        name: `corrupt-image-${Date.now()}.jpg`,
        corrupted: true,
      });

      // uploadToR2 must NOT throw an unhandled exception when Sharp fails;
      // it should log error and upload raw buffer fallback cleanly.
      const publicUrl = await uploadToR2(corruptFile, 'products', `tier2-corrupt-${Date.now()}`);

      assertDefined(publicUrl, 'URL must be returned despite Sharp decoding failure');
      assertIncludes(publicUrl, 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/', 'Should upload raw buffer to R2');
      createdR2Urls.push(publicUrl);
    });

    await runner.test('T2.2.2: Non-standard image MIME type with invalid payload uploads via fallback', async () => {
      const fakeHeicBuffer = Buffer.from('ftypheic_mock_invalid_data_stream_bytes');
      const fakeHeicFile = new File([fakeHeicBuffer], `sample-phone-${Date.now()}.heic`, { type: 'image/heic' });

      const publicUrl = await uploadToR2(fakeHeicFile, 'products', `tier2-heic-raw-${Date.now()}`);
      assertDefined(publicUrl, 'URL must be generated');
      createdR2Urls.push(publicUrl);
    });

    await runner.test('T2.2.3: Micro 1x1 pixel image processed cleanly without division by zero', async () => {
      const file1x1 = await createMockImageFile({ width: 1, height: 1, format: 'png' });
      const publicUrl = await uploadToR2(file1x1, 'products', `tier2-1x1-${Date.now()}`);

      assertDefined(publicUrl, '1x1 image must upload cleanly');
      createdR2Urls.push(publicUrl);
    });

    await runner.test('T2.2.4: Extreme panorama aspect ratio (4000x100) processed cleanly', async () => {
      const panoFile = await createMockImageFile({ width: 4000, height: 100, format: 'jpeg' });
      const publicUrl = await uploadToR2(panoFile, 'products', `tier2-pano-${Date.now()}`);

      assertDefined(publicUrl, 'Extreme aspect ratio should upload cleanly');
      createdR2Urls.push(publicUrl);
    });

    await runner.test('T2.2.5: High-dimension square (2500x2500) downscaled smoothly by Sharp', async () => {
      const largeSquare = await createMockImageFile({ width: 2500, height: 2500, format: 'jpeg' });
      const publicUrl = await uploadToR2(largeSquare, 'products', `tier2-2500sq-${Date.now()}`);

      assertDefined(publicUrl, 'Large image should be downscaled and uploaded');
      assertIncludes(publicUrl, '.webp', 'Should be converted to WebP');
      createdR2Urls.push(publicUrl);
    });

    // =========================================================================
    // BOUNDARY 3: HTML & Non-JSON Server Responses (Safe Response Parser)
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- Boundary 3: HTML & Non-JSON Response Parser Resilience ---\x1b[0m');

    await runner.test('T2.3.1: Next.js 500 HTML Error Page parsed without JSON syntax crash', async () => {
      const html500 = `<!DOCTYPE html>
<html>
<head><title>500: Internal Server Error</title></head>
<body>
  <h1>Server Error</h1>
  <p>An error occurred in the Server Components render.</p>
</body>
</html>`;

      const mockRes = new Response(html500, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });

      // Must NOT throw "SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'Must indicate failure');
      assertDefined(parsed.error, 'Must provide structured error');
      assert(typeof parsed.error === 'string', 'Error must be string');
      assert(!parsed.error.includes('<!DOCTYPE'), 'Error message must not expose raw HTML');
    });

    await runner.test('T2.3.2: Cloudflare 502 Bad Gateway HTML parsed to human-readable message', async () => {
      const html502 = `<!DOCTYPE html>
<html>
<head><title>502 Bad Gateway</title></head>
<body bgcolor="white">
<center><h1>502 Bad Gateway</h1></center>
<hr><center>cloudflare</center>
</body>
</html>`;

      const mockRes = new Response(html502, {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'Must indicate failure');
      assertIncludes(parsed.error || '', 'Gateway', 'Error message should mention gateway unavailability');
    });

    await runner.test('T2.3.3: 504 Gateway Timeout HTML page parsed smoothly', async () => {
      const html504 = `<html><body><h1>504 Gateway Time-out</h1></body></html>`;
      const mockRes = new Response(html504, {
        status: 504,
        headers: { 'Content-Type': 'text/html' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'Must indicate failure');
      assertDefined(parsed.error, 'Error must be defined');
    });

    await runner.test('T2.3.4: Reverse Proxy 413 Payload Too Large HTML translated to 20MB limit message', async () => {
      const html413 = `<html><body><h1>413 Request Entity Too Large</h1><p>nginx/1.24.0</p></body></html>`;
      const mockRes = new Response(html413, {
        status: 413,
        headers: { 'Content-Type': 'text/html' },
      });

      const parsed = await safeParseUploadResponse(mockRes);
      assertEqual(parsed.success, false, 'Must indicate failure');
      assertIncludes(parsed.error || '', '20MB', 'Should explicitly inform user about 20MB limit');
    });

    await runner.test('T2.3.5: Empty body response (0 bytes) handled safely without parse crash', async () => {
      const emptyRes = new Response('', {
        status: 500,
        headers: { 'Content-Type': 'application/octet-stream' },
      });

      const parsed = await safeParseUploadResponse(emptyRes);
      assertEqual(parsed.success, false, 'Must indicate failure');
      assertDefined(parsed.error, 'Error must be provided');
    });

  } finally {
    for (const url of createdR2Urls) {
      await cleanupTestR2Object(url);
    }
  }

  return runner;
}
