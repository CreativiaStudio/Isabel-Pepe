import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';
import { Jimp } from 'jimp'; // Use Jimp for compositing

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const inputPath = path.join(baseDir, "Generazione foto", "Packaging.jpg");
const bgPath = path.join(baseDir, "Generazione foto", "Riferimento sfondo", "Sfondo.png");
const outputPath = path.join(baseDir, "public", "Products", "Orecchini_Riviere_packaging.png");

async function processImage() {
    console.log("Removing background with imgly...");
    const imageBuffer = fs.readFileSync(inputPath);
    
    // We pass a Blob
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    const bgRemovalResult = await removeBackground(blob);
    
    const arrayBuffer = await bgRemovalResult.arrayBuffer();
    const fgBuffer = Buffer.from(arrayBuffer);
    
    console.log("Loading foreground and background with Jimp...");
    const fgImg = await Jimp.read(fgBuffer);
    const bgImg = await Jimp.read(bgPath);
    
    // Resize background to 1024x1024 (1:1 square)
    bgImg.cover({ w: 1024, h: 1024 });
    
    // Resize foreground to fit (max 90% of 1024 = 920)
    fgImg.scaleToFit({ w: 920, h: 920 });
    
    // Calculate position: align to the right edge to hide the camera crop!
    const x = 1024 - fgImg.bitmap.width; // Allineato a destra
    const y = (1024 - fgImg.bitmap.height) / 2; // Centrato verticalmente
    
    // Composite
    console.log("Compositing...");
    bgImg.composite(fgImg, x, y);
    
    console.log("Saving...");
    await bgImg.write(outputPath);
    console.log("Done! Saved to", outputPath);
}

processImage().catch(console.error);
