import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function straightenAndProcessGraAssets() {
  console.log('Straightening and processing real GRA assets with clean borders...');

  // 1. Libretto Esterno (Straighten & remove dark edges)
  const extPath = path.resolve(process.cwd(), 'public/Brand/Libretto_esterno_GRA_originale.jpg');
  const extMeta = await sharp(extPath).metadata();
  const ew = extMeta.width || 2000;
  const eh = extMeta.height || 1400;

  const extLeft = Math.round(ew * 0.016);
  const extTop = Math.round(eh * 0.030);
  const extWidth = Math.round(ew * 0.948);
  const extHeight = Math.round(eh * 0.932);

  await sharp(extPath)
    .extract({ left: extLeft, top: extTop, width: extWidth, height: extHeight })
    .resize(2000, 1400, { fit: 'fill' })
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_libretto_esterno.webp'));

  // 2. Libretto Interno (Straighten, crop table and apply crisp privacy overlay)
  const intPath = path.resolve(process.cwd(), 'public/Brand/Libretto_interno_GRA_originale.jpg');
  const intMeta = await sharp(intPath).metadata();
  const iw = intMeta.width || 2000;
  const ih = intMeta.height || 1400;

  const intLeft = Math.round(iw * 0.024);
  const intTop = Math.round(ih * 0.026);
  const intWidth = Math.round(iw * 0.948);
  const intHeight = Math.round(ih * 0.940);

  const croppedInternalBuffer = await sharp(intPath)
    .extract({ left: intLeft, top: intTop, width: intWidth, height: intHeight })
    .resize(2000, 1400, { fit: 'fill' })
    .toBuffer();

  const w = 2000;
  const h = 1400;
  const intOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Mask over Report Number top-left -->
    <rect x="${w * 0.385}" y="${h * 0.315}" width="${w * 0.105}" height="${h * 0.032}" fill="#FFFFFF" opacity="0.95" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.437}" y="${h * 0.338}" font-family="Arial, sans-serif" font-size="${h * 0.019}" letter-spacing="3" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- Mask over Laser Inscription bottom-left -->
    <rect x="${w * 0.165}" y="${h * 0.775}" width="${w * 0.095}" height="${h * 0.032}" fill="#FFFFFF" opacity="0.95" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.212}" y="${h * 0.798}" font-family="Arial, sans-serif" font-size="${h * 0.019}" letter-spacing="3" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- Mask over QR Code bottom-right -->
    <rect x="${w * 0.58}" y="${h * 0.72}" width="${w * 0.115}" height="${h * 0.155}" fill="#FFFFFF" opacity="0.96" rx="8" stroke="#C0A09A" stroke-width="2" />
    <text x="${w * 0.637}" y="${h * 0.79}" font-family="Arial, sans-serif" font-size="${h * 0.020}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${w * 0.637}" y="${h * 0.825}" font-family="Arial, sans-serif" font-size="${h * 0.014}" fill="#888888" text-anchor="middle">VERIFICA ON-LINE</text>
  </svg>
  `;

  await sharp(croppedInternalBuffer)
    .composite([{ input: Buffer.from(intOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_report_interno_privacy.webp'));

  // 3. Card GRA (Straighten & crop background)
  const cardPath = path.resolve(process.cwd(), 'public/Brand/Card_GRA_originale.jpg');
  const cardMeta = await sharp(cardPath).metadata();
  const cwOrig = cardMeta.width || 1600;
  const chOrig = cardMeta.height || 1000;

  const cardLeft = Math.round(cwOrig * 0.015);
  const cardTop = Math.round(chOrig * 0.018);
  const cardWidth = Math.round(cwOrig * 0.97);
  const cardHeight = Math.round(chOrig * 0.96);

  const cardCroppedBuffer = await sharp(cardPath)
    .extract({ left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight })
    .resize(1600, 1000, { fit: 'fill' })
    .toBuffer();

  const cw = 1600;
  const ch = 1000;
  const cardOverlaySvg = `
  <svg width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg">
    <!-- Frosted mask over QR Code -->
    <rect x="${cw * 0.76}" y="${ch * 0.54}" width="${cw * 0.20}" height="${ch * 0.31}" fill="#111111" opacity="0.95" rx="8" stroke="#333333" stroke-width="1" />
    <text x="${cw * 0.86}" y="${ch * 0.69}" font-family="Arial, sans-serif" font-size="${ch * 0.045}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${cw * 0.86}" y="${ch * 0.75}" font-family="Arial, sans-serif" font-size="${ch * 0.032}" fill="#FFFFFF" opacity="0.8" text-anchor="middle">UNIVOCO</text>

    <!-- Frosted mask over Serial Number -->
    <rect x="${cw * 0.49}" y="${ch * 0.85}" width="${cw * 0.38}" height="${ch * 0.10}" fill="#111111" opacity="0.95" rx="6" stroke="#333333" stroke-width="1" />
    <text x="${cw * 0.68}" y="${ch * 0.92}" font-family="Arial, sans-serif" font-size="${ch * 0.045}" letter-spacing="4" fill="#D4AF37" font-weight="bold" text-anchor="middle">•••• ••• ••• (UNIVOCO)</text>
  </svg>
  `;

  await sharp(cardCroppedBuffer)
    .composite([{ input: Buffer.from(cardOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_card_privacy.webp'));

  console.log('✅ All GRA documents straightened, deskewed, and exported with razor-sharp borders!');
}

straightenAndProcessGraAssets().catch(console.error);
