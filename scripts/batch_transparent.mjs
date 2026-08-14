import fs from 'fs';
import path from 'path';
import { removeBackground } from '@imgly/background-removal-node';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const inputDir = path.join(baseDir, "Generazione foto", "Prodotti da fare");
const outputDir = path.join(baseDir, "public", "Products", "transparent_temp");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processAll() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        if (fs.existsSync(outputPath)) {
            console.log(`Skipping ${file}, already transparent.`);
            continue;
        }

        console.log(`Removing background for: ${file}`);
        try {
            const imageBuffer = fs.readFileSync(inputPath);
            const blob = new Blob([imageBuffer], { type: 'image/png' });
            const bgRemovalResult = await removeBackground(blob);
            
            const arrayBuffer = await bgRemovalResult.arrayBuffer();
            const fgBuffer = Buffer.from(arrayBuffer);
            
            fs.writeFileSync(outputPath, fgBuffer);
            console.log(`=> Saved transparent PNG: ${file}`);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
    console.log("Finito! Tutti i PNG trasparenti creati.");
}

processAll().catch(console.error);
