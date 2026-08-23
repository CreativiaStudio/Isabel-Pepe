import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details: string) {
  results.push({
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  });
  if (!condition) {
    console.error(`❌ [FAIL] ${name}: ${details}`);
  } else {
    console.log(`✅ [PASS] ${name}: ${details}`);
  }
}

async function runFaviconTests() {
  console.log('================================================================');
  console.log('🚀 EMPIRICAL ADVERSARIAL TEST: Favicon & Icon Asset Suite');
  console.log('================================================================\n');

  // --- TEST 1: favicon.ico Binary Inspection ---
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  assert(fs.existsSync(icoPath), 'favicon.ico exists', `File found at ${icoPath}`);

  if (fs.existsSync(icoPath)) {
    const icoBuf = fs.readFileSync(icoPath);
    assert(icoBuf.length > 0, 'favicon.ico non-empty', `File size: ${icoBuf.length} bytes`);

    // Parse ICO Header (6 bytes)
    const reserved = icoBuf.readUInt16LE(0);
    const type = icoBuf.readUInt16LE(2);
    const count = icoBuf.readUInt16LE(4);

    assert(reserved === 0, 'ICO Header: Reserved field is 0', `Reserved: ${reserved}`);
    assert(type === 1, 'ICO Header: Resource type is 1 (ICON)', `Type: ${type}`);
    assert(count === 6, 'ICO Header: Exactly 6 embedded images', `Count: ${count}`);

    const expectedDimensions = [
      { w: 16, h: 16, name: '16x16' },
      { w: 32, h: 32, name: '32x32' },
      { w: 48, h: 48, name: '48x48' },
      { w: 64, h: 64, name: '64x64' },
      { w: 128, h: 128, name: '128x128' },
      { w: 256, h: 256, name: '256x256' },
    ];

    const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    for (let i = 0; i < count; i++) {
      const entryOffset = 6 + i * 16;
      const rawWidth = icoBuf.readUInt8(entryOffset + 0);
      const rawHeight = icoBuf.readUInt8(entryOffset + 1);
      const colorCount = icoBuf.readUInt8(entryOffset + 2);
      const entryReserved = icoBuf.readUInt8(entryOffset + 3);
      const planes = icoBuf.readUInt16LE(entryOffset + 4);
      const bpp = icoBuf.readUInt16LE(entryOffset + 6);
      const imgSize = icoBuf.readUInt32LE(entryOffset + 8);
      const imgOffset = icoBuf.readUInt32LE(entryOffset + 12);

      const parsedWidth = rawWidth === 0 ? 256 : rawWidth;
      const parsedHeight = rawHeight === 0 ? 256 : rawHeight;
      const expected = expectedDimensions[i];

      assert(
        parsedWidth === expected.w && parsedHeight === expected.h,
        `ICO Entry #${i + 1} Dimension check`,
        `Expected ${expected.name}, found ${parsedWidth}x${parsedHeight} (raw bytes: w=${rawWidth}, h=${rawHeight})`
      );

      assert(
        planes === 1 && (bpp === 32 || bpp === 0),
        `ICO Entry #${i + 1} Color planes & BPP`,
        `Planes=${planes}, BPP=${bpp}`
      );

      assert(
        imgOffset >= 6 + count * 16 && imgOffset + imgSize <= icoBuf.length,
        `ICO Entry #${i + 1} Offset within bounds`,
        `Offset=${imgOffset}, Size=${imgSize}, Total ICO=${icoBuf.length}`
      );

      // Inspect sub-image buffer
      const subImgBuf = icoBuf.subarray(imgOffset, imgOffset + imgSize);
      const isPng = subImgBuf.subarray(0, 8).equals(PNG_MAGIC);
      assert(
        isPng,
        `ICO Entry #${i + 1} PNG magic header`,
        `Magic header is valid PNG signature: ${isPng}`
      );

      if (isPng) {
        // Parse IHDR
        const ihdrWidth = subImgBuf.readUInt32BE(16);
        const ihdrHeight = subImgBuf.readUInt32BE(20);
        assert(
          ihdrWidth === expected.w && ihdrHeight === expected.h,
          `ICO Entry #${i + 1} PNG IHDR Dimension Match`,
          `IHDR width=${ihdrWidth}, height=${ihdrHeight}`
        );

        // Sharp decoding stress test
        try {
          const metadata = await sharp(subImgBuf).metadata();
          const stats = await sharp(subImgBuf).stats();
          const nonZeroChannels = stats.channels.some((c) => c.mean > 0 || c.stdev > 0);

          assert(
            metadata.width === expected.w && metadata.height === expected.h && nonZeroChannels,
            `ICO Entry #${i + 1} Sharp Decode & Non-Empty Pixel Verification`,
            `Decoded successfully: ${metadata.width}x${metadata.height}, format=${metadata.format}, hasNonZeroPixels=${nonZeroChannels}`
          );
        } catch (err: any) {
          assert(false, `ICO Entry #${i + 1} Sharp Decode Exception`, err.message);
        }
      }
    }
  }

  // --- TEST 2: Standalone PNG Files Verification ---
  const standaloneFiles = [
    { name: 'favicon-16x16.png', w: 16, h: 16 },
    { name: 'favicon-32x32.png', w: 32, h: 32 },
    { name: 'favicon-48x48.png', w: 48, h: 48 },
    { name: 'apple-touch-icon.png', w: 180, h: 180 },
    { name: 'icon-192.png', w: 192, h: 192 },
    { name: 'icon-512.png', w: 512, h: 512 },
  ];

  for (const item of standaloneFiles) {
    const filePath = path.join(PUBLIC_DIR, item.name);
    assert(fs.existsSync(filePath), `PNG ${item.name} exists`, `File exists at ${filePath}`);

    if (fs.existsSync(filePath)) {
      const fileBuf = fs.readFileSync(filePath);
      assert(fileBuf.length > 0, `PNG ${item.name} non-empty`, `File size: ${fileBuf.length} bytes`);

      // Verify PNG magic signature
      const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      assert(
        fileBuf.subarray(0, 8).equals(PNG_MAGIC),
        `PNG ${item.name} Signature Valid`,
        `Magic 8 bytes match standard PNG`
      );

      // Verify dimensions via Sharp
      try {
        const metadata = await sharp(fileBuf).metadata();
        const stats = await sharp(fileBuf).stats();
        const hasContent = stats.channels.some((c) => c.mean > 0);

        assert(
          metadata.width === item.w && metadata.height === item.h && hasContent,
          `PNG ${item.name} Dimension & Content Check`,
          `Expected ${item.w}x${item.h}, got ${metadata.width}x${metadata.height}, format=${metadata.format}, hasContent=${hasContent}`
        );
      } catch (err: any) {
        assert(false, `PNG ${item.name} Sharp Decode Error`, err.message);
      }
    }
  }

  // --- TEST 3: site.webmanifest Verification ---
  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  assert(fs.existsSync(manifestPath), 'site.webmanifest exists', `Found at ${manifestPath}`);

  if (fs.existsSync(manifestPath)) {
    const rawJson = fs.readFileSync(manifestPath, 'utf-8');
    let manifest: any;
    try {
      manifest = JSON.parse(rawJson);
      assert(true, 'site.webmanifest is valid JSON', `Parsed JSON successfully`);
    } catch (e: any) {
      assert(false, 'site.webmanifest JSON parse error', e.message);
    }

    if (manifest) {
      assert(
        manifest.name && manifest.name.includes('Isabel Pepe'),
        'site.webmanifest name check',
        `name: "${manifest.name}"`
      );
      assert(
        manifest.short_name && manifest.short_name === 'Isabel Pepe',
        'site.webmanifest short_name check',
        `short_name: "${manifest.short_name}"`
      );
      assert(
        Array.isArray(manifest.icons) && manifest.icons.length >= 2,
        'site.webmanifest icons array',
        `Contains ${manifest.icons?.length} icon definitions`
      );

      for (const icon of manifest.icons || []) {
        const iconPath = path.join(PUBLIC_DIR, icon.src.replace(/^\//, ''));
        assert(
          fs.existsSync(iconPath),
          `site.webmanifest icon exists: ${icon.src}`,
          `File exists at ${iconPath}`
        );
      }
    }
  }

  // --- SUMMARY ---
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`FAVICON TEST SUMMARY: ${passed}/${total} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFaviconTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
