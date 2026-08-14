import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

async function testRemoval() {
  const inputPath = 'file:///C:/Users/mario/Progetti Antigravity/isabel-pepe/Generazione foto/Prodotti da fare/ASB3093 Orecchini Joséphine.png';
  const outputPath = 'C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\scripts\\test_output.png';

  console.log("Inizio scontorno con @imgly...");
  try {
    const blob = await removeBackground(inputPath);
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log("Scontorno completato. Salvato in", outputPath);
  } catch (error) {
    console.error("Errore:", error);
  }
}

testRemoval();
