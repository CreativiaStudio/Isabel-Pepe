import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

async function createPinkBackgroundPhoto() {
  const inputPath = 'C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\Generazione foto\\Prodotti da fare\\ASB3093 Orecchini Joséphine.png';
  const outputPath = 'C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\public\\Products\\ASB3093 - Orecchini pink\\ASB3093_sfondo_rosa.png';

  console.log("Lettura file sorgente...");
  const jewelry = await Jimp.read(inputPath);
  
  // Imposta dimensione canvas 1:1
  const canvasSize = 2048;
  const canvas = new Jimp({ width: canvasSize, height: canvasSize, color: '#F9F8F6' });

  // L'orecchino deve essere proporzionato ed elegante. Lo ridimensioniamo a occupare circa il 45% del canvas.
  jewelry.scaleToFit({ w: canvasSize * 0.45, h: canvasSize * 0.45 });

  // Calcola coordinate per centrare
  const x = (canvasSize - jewelry.bitmap.width) / 2;
  const y = (canvasSize - jewelry.bitmap.height) / 2;

  // Sovrapponi il gioiello sul canvas
  canvas.composite(jewelry, x, y);

  console.log("Salvataggio in corso...");
  await canvas.write(outputPath);
  console.log("Fatto! Immagine salvata in:", outputPath);
}

createPinkBackgroundPhoto().catch(console.error);
