import fs from 'fs';
import path from 'path';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public/Products";
const items = fs.readdirSync(baseDir, { withFileTypes: true });

const folders = items.filter(i => i.isDirectory() && i.name !== 'Ispirazioni_e_Bozze').map(i => i.name);

let totalProducts = folders.length;
let completeProducts = 0;
let incompleteProducts = [];

console.log(`\n=== REPORT STATO GALLERIE (Totale Prodotti: ${totalProducts}) ===\n`);

for (const folder of folders) {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp') ||
    f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm')
  );
  
  const count = files.length;
  
  if (count >= 3 && count <= 5) {
    completeProducts++;
  } else {
    incompleteProducts.push({ folder, count });
  }
}

console.log(`✅ Prodotti con Galleria Completa (3-5 file): ${completeProducts}`);
console.log(`❌ Prodotti Incompleti (Mancano file o troppi file): ${incompleteProducts.length}\n`);

if (incompleteProducts.length > 0) {
  console.log("--- DETTAGLIO PRODOTTI INCOMPLETI ---");
  for (const p of incompleteProducts) {
    if (p.count === 0) {
      console.log(`- ${p.folder}: VUOTO (Mancano 3-5 file)`);
    } else if (p.count < 3) {
      console.log(`- ${p.folder}: Ha solo ${p.count} file. (Ne mancano ${3 - p.count})`);
    } else if (p.count > 5) {
      console.log(`- ${p.folder}: Ha ${p.count} file. (Troppi! Rimuoverne ${p.count - 5})`);
    }
  }
}

console.log("\nRegola di validazione usata: Minimo 3, Massimo 5 file (inclusi Video MP4/MOV).");
