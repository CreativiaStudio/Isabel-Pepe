import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildOfficialAssets() {
  console.log('--- 💎 GENERAZIONE ASSET FEDELI AL SITO PER STRIPE ---');

  const brandDir = path.join(process.cwd(), 'public', 'Brand');
  const iconDest = path.join(brandDir, 'stripe_icon_isabel_pepe.png');
  const logoDest = path.join(brandDir, 'stripe_logo_isabel_pepe.png');

  // 1. ICONA: 100% Fedele a logotipo-isabel.png (512x512 PNG, trasparente)
  await sharp(path.join(brandDir, 'logotipo-isabel.png'))
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95 })
    .toFile(iconDest);

  console.log('✅ Icona creata da logotipo-isabel.png:', iconDest, `(${fs.statSync(iconDest).size / 1024} KB)`);

  // 2. LOGO: logo-isabel-pepe.png trasformato in Rose Gold (#C0A09A / #C8969A)
  // Leggiamo i pixel di logo-isabel-pepe.png
  const inputBuffer = await sharp(path.join(brandDir, 'logo-isabel-pepe.png')).trim().toBuffer();
  const { data, info } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });

  // Creiamo un buffer RGBA dove il testo nero diventa Rose Gold metallico (#C0A09A e sfumature) e il fondo bianco diventa trasparente
  const rgbaBuffer = Buffer.alloc(info.width * info.height * 4);

  // Colori Rose Gold dal sito:
  // Base: R: 192, G: 160, B: 154 (#C0A09A)
  // Highlight: R: 200, G: 150, B: 154 (#C8969A)
  // Deep: R: 138, G: 94, B: 88 (#8A5E58)

  for (let y = 0; y < info.height; y++) {
    const t = y / info.height; // gradiente verticale soft
    const targetR = Math.round(192 + (200 - 192) * (1 - t));
    const targetG = Math.round(160 + (150 - 160) * (1 - t));
    const targetB = Math.round(154 + (154 - 154) * (1 - t));

    for (let x = 0; x < info.width; x++) {
      const srcIdx = (y * info.width + x) * info.channels;
      const dstIdx = (y * info.width + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      // Luminosità (0 = nero, 255 = bianco)
      const brightness = (r + g + b) / 3;

      if (brightness < 235) {
        // Pixel del logo/testo: coloriamo in Rose Gold
        const opacity = Math.min(255, Math.max(0, (255 - brightness) * 1.5));
        rgbaBuffer[dstIdx] = targetR;
        rgbaBuffer[dstIdx + 1] = targetG;
        rgbaBuffer[dstIdx + 2] = targetB;
        rgbaBuffer[dstIdx + 3] = opacity;
      } else {
        // Sfondo: trasparente
        rgbaBuffer[dstIdx] = 0;
        rgbaBuffer[dstIdx + 1] = 0;
        rgbaBuffer[dstIdx + 2] = 0;
        rgbaBuffer[dstIdx + 3] = 0;
      }
    }
  }

  // Salviamo il logo in Rose Gold perfetto con rapporto d'aspetto orizzontale
  await sharp(rgbaBuffer, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .resize(1000, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 95 })
    .toFile(logoDest);

  console.log('✅ Logo Rose Gold generato da logo-isabel-pepe.png:', logoDest, `(${fs.statSync(logoDest).size / 1024} KB)`);
}

buildOfficialAssets().catch(console.error);
