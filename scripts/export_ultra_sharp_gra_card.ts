import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function exportUltraCleanGraCard() {
  console.log('Exporting ultra-clean, razor-sharp GRA Card asset...');

  const cardSrc = path.resolve(process.cwd(), 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e/gra_card_hd_master_1787056981384.jpg');
  const cardMeta = await sharp(cardSrc).metadata();
  const cw = cardMeta.width || 2000;
  const ch = cardMeta.height || 1333;

  // Extract clean card rectangle from background
  const cardLeft = Math.round(cw * 0.125);
  const cardTop = Math.round(ch * 0.138);
  const cardWidth = Math.round(cw * 0.755);
  const cardHeight = Math.round(ch * 0.738);

  const croppedBuffer = await sharp(cardSrc)
    .extract({ left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight })
    .resize(1600, 1000, { fit: 'fill' })
    .toBuffer();

  const w = 1600;
  const h = 1000;
  const cardOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Frosted Privacy Mask over QR Code -->
    <rect x="${w * 0.725}" y="${h * 0.58}" width="${w * 0.185}" height="${h * 0.29}" fill="#111111" opacity="0.95" rx="8" stroke="#333333" stroke-width="1.5" />
    <text x="${w * 0.817}" y="${h * 0.71}" font-family="Arial, sans-serif" font-size="${h * 0.040}" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="${w * 0.817}" y="${h * 0.77}" font-family="Arial, sans-serif" font-size="${h * 0.028}" fill="#FFFFFF" opacity="0.8" text-anchor="middle">UNIVOCO</text>

    <!-- Frosted Privacy Mask over Serial Number -->
    <rect x="${w * 0.40}" y="${h * 0.77}" width="${w * 0.22}" height="${h * 0.09}" fill="#111111" opacity="0.95" rx="6" stroke="#333333" stroke-width="1" />
    <text x="${w * 0.51}" y="${h * 0.83}" font-family="Arial, sans-serif" font-size="${h * 0.040}" letter-spacing="4" fill="#D4AF37" font-weight="bold" text-anchor="middle">•••••••••</text>
  </svg>
  `;

  await sharp(croppedBuffer)
    .composite([{ input: Buffer.from(cardOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_card_privacy.webp'));

  await sharp(croppedBuffer)
    .composite([{ input: Buffer.from(cardOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/gra_card_privacy.jpg'));

  console.log('✅ Razor-sharp GRA Card asset exported successfully!');
}

exportUltraCleanGraCard().catch(console.error);
