import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const inputPath = path.join(baseDir, "Generazione foto", "Prodotti da fare", "ASB4031 - Bracciale Trèfle.png");
const outputPath = path.join(baseDir, "public", "Products", "ASB4031_transparent.png");

async function processImage() {
    console.log("Removing background with imgly...");
    const imageBuffer = fs.readFileSync(inputPath);
    
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    const bgRemovalResult = await removeBackground(blob);
    
    const arrayBuffer = await bgRemovalResult.arrayBuffer();
    const fgBuffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(outputPath, fgBuffer);
    console.log("Done! Saved transparent PNG to", outputPath);
}

processImage().catch(console.error);
