import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processInternalGraWithCaratsMask() {
  console.log('Applying frosted privacy masks over Carats, Measurements, Serial and QR on GRA internal report...');

  const intSrc = path.resolve(process.cwd(), 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e/gra_report_interno_perfetto_1787056609531.jpg');
  const intMeta = await sharp(intSrc).metadata();
  const iw = intMeta.width || 2000;
  const ih = intMeta.height || 1400;

  const intLeft = Math.round(iw * 0.050);
  const intTop = Math.round(ih * 0.022);
  const intWidth = Math.round(iw * 0.898);
  const intHeight = Math.round(ih * 0.950);

  const croppedIntBuffer = await sharp(intSrc)
    .extract({ left: intLeft, top: intTop, width: intWidth, height: intHeight })
    .resize(2000, 1360, { fit: 'fill' })
    .toBuffer();

  const w = 2000;
  const h = 1360;
  const intOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- 1. Mask over Report Number top-left -->
    <rect x="${w * 0.380}" y="${h * 0.315}" width="${w * 0.110}" height="${h * 0.032}" fill="#FFFFFF" opacity="0.97" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.435}" y="${h * 0.338}" font-family="Arial, sans-serif" font-size="${h * 0.019}" letter-spacing="3" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- 2. Mask over Measurements (e.g. 2.0mm) -->
    <rect x="${w * 0.410}" y="${h * 0.375}" width="${w * 0.080}" height="${h * 0.032}" fill="#FFFFFF" opacity="0.97" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.450}" y="${h * 0.398}" font-family="Arial, sans-serif" font-size="${h * 0.017}" letter-spacing="2" fill="#666666" font-weight="bold" text-anchor="middle">•••••</text>

    <!-- 3. Mask over Carat Weight (e.g. 1.50 carat*) -->
    <rect x="${w * 0.395}" y="${h * 0.485}" width="${w * 0.095}" height="${h * 0.034}" fill="#FFFFFF" opacity="0.97" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.442}" y="${h * 0.509}" font-family="Arial, sans-serif" font-size="${h * 0.017}" letter-spacing="2" fill="#666666" font-weight="bold" text-anchor="middle">•••• ct</text>

    <!-- 4. Mask over Laser Inscription bottom-left -->
    <rect x="${w * 0.170}" y="${h * 0.772}" width="${w * 0.100}" height="${h * 0.032}" fill="#FFFFFF" opacity="0.97" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.220}" y="${h * 0.795}" font-family="Arial, sans-serif" font-size="${h * 0.019}" letter-spacing="3" fill="#666666" font-weight="bold" text-anchor="middle">•••••••••</text>

    <!-- 5. Mask over Real Weight bottom-left (e.g. Real weight:1.50 Carat) -->
    <rect x="${w * 0.310}" y="${h * 0.805}" width="${w * 0.075}" height="${h * 0.028}" fill="#FFFFFF" opacity="0.97" rx="4" stroke="#E8E2DA" stroke-width="1" />
    <text x="${w * 0.347}" y="${h * 0.825}" font-family="Arial, sans-serif" font-size="${h * 0.015}" letter-spacing="2" fill="#666666" font-weight="bold" text-anchor="middle">•••• ct</text>

    <!-- 6. Mask over QR Code bottom-right -->
    <rect x="${w * 0.575}" y="${h * 0.72}" width="${w * 0.115}" height="${h * 0.155}" fill="#FFFFFF" opacity="0.97" rx="8" stroke="#C0A09A" stroke-width="2" />
    <text x="${w * 0.632}" y="${h * 0.79}" font-family="Arial, sans-serif" font-size="${h * 0.020}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${w * 0.632}" y="${h * 0.825}" font-family="Arial, sans-serif" font-size="${h * 0.014}" fill="#888888" text-anchor="middle">VERIFICA ON-LINE</text>
  </svg>
  `;

  await sharp(croppedIntBuffer)
    .composite([{ input: Buffer.from(intOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_report_interno_privacy.webp'));

  await sharp(croppedIntBuffer)
    .composite([{ input: Buffer.from(intOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_report_interno_privacy.jpg'));

  console.log('✅ GRA internal report updated with universal Carats & Measurements privacy masks!');
}

processInternalGraWithCaratsMask().catch(console.error);
