import fs from 'fs';
import path from 'path';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public/Products";
const transparentTempDir = path.join(baseDir, "transparent_temp");

const files = fs.readdirSync(transparentTempDir);

let createdCount = 0;

for (const file of files) {
  if (file.endsWith(".png")) {
    const folderName = file.replace(".png", "").trim();
    const folderPath = path.join(baseDir, folderName);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      createdCount++;
      console.log(`Creata cartella: ${folderName}`);
    } else {
      console.log(`Cartella già esistente: ${folderName}`);
    }
  }
}

console.log(`\nOperazione completata. Create ${createdCount} nuove cartelle in public/Products.`);
