import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function exportUltraCleanGraCard() {
  console.log('Exporting perfectly aligned frosted privacy masks for GRA Card...');

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

  // 1. QR Code is at x: 1130..1550, y: 560..945
  // 2. The number 2304192083 is at x: 650..1015, y: 820..915
  const cardOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Frosted Privacy Mask over ENTIRE QR Code + Subtext (Right column) -->
    <rect x="1130" y="565" width="415" height="385" fill="#141414" opacity="0.98" rx="10" stroke="#333333" stroke-width="2" />
    <text x="1337" y="740" font-family="'Helvetica Neue', Arial, sans-serif" font-size="34" fill="#C0A09A" font-weight="bold" text-anchor="middle">QR CODE</text>
    <text x="1337" y="790" font-family="'Helvetica Neue', Arial, sans-serif" font-size="23" letter-spacing="2" fill="#E5E5E5" opacity="0.85" text-anchor="middle">UNIVOCO</text>

    <!-- Frosted Privacy Mask DIRECTLY OVER the Serial Number: 2304192083 -->
    <rect x="645" y="818" width="375" height="100" fill="#141414" opacity="0.98" rx="8" stroke="#333333" stroke-width="2" />
    <text x="832" y="885" font-family="Arial, sans-serif" font-size="38" letter-spacing="5" fill="#D4AF37" font-weight="bold" text-anchor="middle">••••••••••</text>
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

  console.log('✅ Serial number mask placed DIRECTLY over the number 2304192083!');
}

exportUltraCleanGraCard().catch(console.error);
