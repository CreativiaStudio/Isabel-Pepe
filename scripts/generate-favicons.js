const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_IMAGE = path.join(__dirname, '..', 'public', 'Brand', 'stripe_icon_isabel_pepe.png');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function buildIcoBuffer(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO type
  header.writeUInt16LE(count, 4); // count of images

  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color palette (0 for truecolor)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function generateFavicons() {
  console.log('--- Generating Favicons and SERP Asset Suite ---');
  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error(`Source image not found: ${SOURCE_IMAGE}`);
  }

  // 1. Generate standalone PNGs
  const standaloneAssets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  for (const asset of standaloneAssets) {
    const outPath = path.join(PUBLIC_DIR, asset.name);
    await sharp(SOURCE_IMAGE)
      .resize(asset.size, asset.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    const stats = fs.statSync(outPath);
    console.log(`✓ Created ${asset.name} (${asset.size}x${asset.size}) - ${stats.size} bytes`);
  }

  // 2. Generate multi-layer ICO with sizes [16, 32, 48, 64, 128, 256]
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoPngBuffers = [];
  for (const size of icoSizes) {
    const buf = await sharp(SOURCE_IMAGE)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    icoPngBuffers.push(buf);
  }

  const icoBuffer = buildIcoBuffer(icoPngBuffers, icoSizes);
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  const icoStats = fs.statSync(icoPath);
  console.log(`✓ Created favicon.ico (layers: ${icoSizes.join(', ')}px) - ${icoStats.size} bytes`);

  // 3. Generate site.webmanifest
  const manifest = {
    name: 'Isabel Pepe | Gioielli Demi-Fine & Regali Esclusivi',
    short_name: 'Isabel Pepe',
    description: 'Gioielli Demi-Fine in Argento 925 con placcatura Oro 18K e cofanetto luxury regalo incluso.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#141414',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };

  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Created site.webmanifest`);

  console.log('--- Favicon Generation Complete ---');
}

if (require.main === module) {
  generateFavicons().catch((err) => {
    console.error('Error generating favicons:', err);
    process.exit(1);
  });
}

module.exports = { generateFavicons };
