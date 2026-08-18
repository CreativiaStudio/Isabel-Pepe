import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processGraAssets() {
  console.log('Processing real GRA assets with privacy redactions...');

  // 1. Process Card GRA
  const cardPath = path.resolve(process.cwd(), 'public/Brand/Card_GRA_originale.jpg');
  const cardMeta = await sharp(cardPath).metadata();
  const cw = cardMeta.width || 1200;
  const ch = cardMeta.height || 800;
  console.log('Card size:', cw, ch);

  const cardOverlaySvg = `
  <svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Frosted mask over QR Code -->
    <rect x="${cw * 0.76}" y="${ch * 0.54}" width="${cw * 0.19}" height="${ch * 0.30}" fill="#111111" opacity="0.92" rx="8" />
    <text x="${cw * 0.855}" y="${ch * 0.69}" font-family="Arial, sans-serif" font-size="${ch * 0.042}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${cw * 0.855}" y="${ch * 0.74}" font-family="Arial, sans-serif" font-size="${ch * 0.030}" fill="#FFFFFF" opacity="0.75" text-anchor="middle">UNIVOCO</text>

    <!-- Frosted mask over Serial Number -->
    <rect x="${cw * 0.49}" y="${ch * 0.85}" width="${cw * 0.38}" height="${ch * 0.10}" fill="#111111" opacity="0.94" rx="6" />
    <text x="${cw * 0.68}" y="${ch * 0.92}" font-family="Arial, sans-serif" font-size="${ch * 0.045}" letter-spacing="4" fill="#D4AF37" font-weight="bold" text-anchor="middle">•••• ••• ••• (UNIVOCO)</text>
  </svg>
  `;

  await sharp(cardPath)
    .composite([{ input: Buffer.from(cardOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_card_privacy.webp'));

  // 2. Process Libretto Interno GRA
  const intPath = path.resolve(process.cwd(), 'public/Brand/Libretto_interno_GRA_originale.jpg');
  const intMeta = await sharp(intPath).metadata();
  const iw = intMeta.width || 1200;
  const ih = intMeta.height || 800;
  console.log('Libretto interno size:', iw, ih);

  const intOverlaySvg = `
  <svg width="${iw}" height="${ih}" xmlns="http://www.w3.org/2000/svg">
    <!-- Mask over Report Number top-left -->
    <rect x="${iw * 0.38}" y="${ih * 0.31}" width="${iw * 0.11}" height="${ih * 0.035}" fill="#EEEEEE" opacity="0.95" rx="4" />
    <text x="${iw * 0.435}" y="${ih * 0.335}" font-family="Arial, sans-serif" font-size="${ih * 0.018}" letter-spacing="2" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- Mask over Laser Inscription bottom-left -->
    <rect x="${iw * 0.165}" y="${ih * 0.76}" width="${iw * 0.10}" height="${ih * 0.035}" fill="#EEEEEE" opacity="0.95" rx="4" />
    <text x="${iw * 0.215}" y="${ih * 0.785}" font-family="Arial, sans-serif" font-size="${ih * 0.018}" letter-spacing="2" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- Mask over QR Code bottom-right -->
    <rect x="${iw * 0.57}" y="${ih * 0.71}" width="${iw * 0.115}" height="${ih * 0.155}" fill="#FFFFFF" opacity="0.95" rx="6" stroke="#C0A09A" stroke-width="2" />
    <text x="${iw * 0.627}" y="${ih * 0.78}" font-family="Arial, sans-serif" font-size="${ih * 0.018}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${iw * 0.627}" y="${ih * 0.81}" font-family="Arial, sans-serif" font-size="${ih * 0.013}" fill="#888888" text-anchor="middle">VERIFICA ON-LINE</text>
  </svg>
  `;

  await sharp(intPath)
    .composite([{ input: Buffer.from(intOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_report_interno_privacy.webp'));

  // 3. Process Libretto Esterno GRA
  const extPath = path.resolve(process.cwd(), 'public/Brand/Libretto_esterno_GRA_originale.jpg');
  await sharp(extPath)
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_libretto_esterno.webp'));

  console.log('✅ Real GRA assets processed with privacy masks successfully!');
}

processGraAssets().catch(console.error);
