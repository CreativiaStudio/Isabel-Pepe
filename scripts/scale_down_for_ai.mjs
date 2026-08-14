import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const inputDir = path.join(baseDir, "public", "Products", "transparent_temp");
const outputDir = path.join(baseDir, "public", "Products", "transparent_ai_scaled");

// Scala il gioiello al 30% della dimensione per costringere l'AI a generarlo "fine"
const SCALE_FACTOR = 0.3;

async function processImages() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  console.log(`Trovati ${files.length} file da rimpicciolire per l'AI...`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    try {
      const image = await Jimp.read(inputPath);
      const originalWidth = image.bitmap.width;
      const originalHeight = image.bitmap.height;

      // Crea una nuova tela trasparente clonando l'originale e azzerando l'alpha
      const canvas = image.clone();
      canvas.scan(0, 0, canvas.bitmap.width, canvas.bitmap.height, function(x, y, idx) {
        this.bitmap.data[idx + 3] = 0; // Alpha a 0
      });

      // Rimpicciolisci il gioiello originale
      const scaledImage = image.clone().scale(SCALE_FACTOR);

      // Calcola le coordinate per centrarlo
      const x = (originalWidth - scaledImage.bitmap.width) / 2;
      const y = (originalHeight - scaledImage.bitmap.height) / 2;

      // Composita il gioiello rimpicciolito sulla tela grande vuota
      canvas.composite(scaledImage, x, y);

      await new Promise((resolve, reject) => {
        canvas.write(outputPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`[OK] Scalato matematicamente: ${file}`);
    } catch (err) {
      console.error(`[ERRORE] Impossibile processare ${file}:`, err);
    }
  }

  console.log("Pre-scalatura matematica completata!");
}

processImages();
