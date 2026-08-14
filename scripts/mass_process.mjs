import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const inputDir = path.join(baseDir, "public", "Products", "transparent_temp"); // Uso i file resi trasparenti!
const finitiDir = path.join(baseDir, "Generazione foto", "prodotti finiti");
const publicDir = path.join(baseDir, "public", "Products");
const bgPath = path.join(baseDir, "Generazione foto", "Riferimento sfondo", "Sfondo.png");
const packagingSrc = path.join(publicDir, "Orecchini_Riviere_packaging.png");

async function processAll() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        console.log(`Processing: ${file}`);
        
        // Extract SKU and Name
        let sku = "";
        let name = file.replace('.png', '');
        
        if (file.includes(' - ')) {
            const parts = file.split(' - ');
            sku = parts[0];
            name = parts.slice(1).join(' - ').replace('.png', '');
        } else {
            // Se non c'è SKU nel nome, usiamo uno slug generato
            sku = name.toUpperCase().replace(/\s+/g, '_');
        }

        // Se l'SKU è duplicato (es. A144 ha collana e orecchini), diamogli un suffisso
        if (file.toLowerCase().includes('collana') && !sku.includes('-')) sku += '-NECKLACE';
        else if (file.toLowerCase().includes('orecchini') && !sku.includes('-')) sku += '-EARRING';

        const outputName = `${sku}.png`;
        const outputPkgName = `${sku}_packaging.png`;
        
        // 1. Incolla il prodotto sullo sfondo rosa
        const inputPath = path.join(inputDir, file);
        const bgImg = await Jimp.read(bgPath);
        const fgImg = await Jimp.read(inputPath);
        
        bgImg.cover({ w: 1024, h: 1024 });
        fgImg.scaleToFit({ w: 920, h: 920 });
        
        const x = (1024 - fgImg.bitmap.width) / 2;
        const y = (1024 - fgImg.bitmap.height) / 2;
        
        bgImg.composite(fgImg, x, y);
        
        const finalImgPath = path.join(publicDir, outputName);
        await bgImg.write(finalImgPath);
        
        // 2. Crea la cartella in "prodotti finiti"
        const folderName = `${sku} - ${name}`;
        const folderPath = path.join(finitiDir, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        // 3. Salva la foto del prodotto anche nella cartella del prodotto
        await bgImg.write(path.join(folderPath, "prodotto_sfondo.png"));
        
        // 4. Copia il packaging
        fs.copyFileSync(packagingSrc, path.join(publicDir, outputPkgName));
        fs.copyFileSync(packagingSrc, path.join(folderPath, "packaging.png"));
        
        console.log(`=> Completato ${sku}`);
    }
    console.log("Finito! Tutti i prodotti sono stati uniti allo sfondo e le cartelle create.");
}

processAll().catch(console.error);
