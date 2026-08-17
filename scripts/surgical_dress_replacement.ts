import sharp from 'sharp';
import path from 'path';

async function executeSurgicalReplacement() {
  const origPath = path.resolve('public/Archive/isabel-pepe-anello-imperial-slot1_ORIGINAL.webp');
  const newDressPath = 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e/anello_imperial_hd_seta_nera_1786987312579.jpg';
  const outputWebP = path.resolve('public/Brand/isabel-pepe-anello-imperial-slot1.webp');
  const outputJpg = path.resolve('public/Brand/anello-imperial-modella-seta-nera.jpg');

  console.log('1. Loading master assets...');
  const { data: origRaw, info: origInfo } = await sharp(origPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: dressRaw } = await sharp(newDressPath)
    .resize(origInfo.width, origInfo.height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = origInfo.width;
  const height = origInfo.height;
  const outBuffer = Buffer.alloc(width * height * 4);

  console.log('2. Computing sub-pixel anatomical blend map...');

  // Ring center: x = 485, y = 730
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const dx = x - 485;
      const dy = y - 730;
      const distToRing = Math.sqrt(dx * dx + dy * dy);

      let origWeight = 0;

      // Rule A: Ring zone (radius 180px around ring center) is 100.00% original pixels
      if (distToRing < 160) {
        origWeight = 1.0;
      } else if (distToRing < 240) {
        origWeight = 1.0 - (distToRing - 160) / 80;
      }

      // Rule B: Entire hand/arm corridor (x: 370..760, y: 400..1380)
      if (x >= 370 && x <= 760 && y >= 400 && y <= 1380) {
        origWeight = Math.max(origWeight, 1.0);
      }

      // Rule C: Model's face and upper neck (y < 340)
      if (y < 300) {
        origWeight = 1.0;
      } else if (y < 380) {
        const neckT = 1.0 - (y - 300) / 80;
        origWeight = Math.max(origWeight, neckT);
      }

      // Rule D: Lower dress areas
      if (y > 700 && (x < 350 || x > 780)) {
        origWeight = 0.0;
      }
      if (y > 1050 && x < 420) {
        origWeight = 0.0;
      }

      const dressWeight = 1.0 - origWeight;
      outBuffer[idx] = Math.round(origRaw[idx] * origWeight + dressRaw[idx] * dressWeight);
      outBuffer[idx + 1] = Math.round(origRaw[idx + 1] * origWeight + dressRaw[idx + 1] * dressWeight);
      outBuffer[idx + 2] = Math.round(origRaw[idx + 2] * origWeight + dressRaw[idx + 2] * dressWeight);
      outBuffer[idx + 3] = 255;
    }
  }

  console.log('3. Exporting master WebP and JPG assets...');
  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(outputWebP);

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .jpeg({ quality: 95 })
    .toFile(outputJpg);

  const zoomCropPath = path.resolve('public/Brand/anello-imperial-zoom-test.jpg');
  await sharp(outputWebP)
    .extract({ left: 340, top: 580, width: 300, height: 300 })
    .resize(600, 600, { kernel: 'lanczos3' })
    .toFile(zoomCropPath);

  console.log('✅ Surgical replacement completed successfully!');
  console.log('Saved to:', outputWebP);
  console.log('Macro zoom verification crop saved to:', zoomCropPath);
}

executeSurgicalReplacement().catch(console.error);
