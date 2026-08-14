import fs from 'fs';
import path from 'path';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public/Products";
const sourceDir = path.join(baseDir, "Ispirazioni_e_Bozze");

const mappings = [
  { sku: 'ASB4054-PINK', name: 'Eden Rose', file: 'Eden Rose.jpg' },
  { sku: 'BTN028', name: 'Isabel Romance', file: 'Isabel Romance.jpg' },
  { sku: 'BTS018-EARRING', name: 'Glow Ribbon', file: 'Glow Ribbon.jpg' },
  { sku: 'BTS018-NECKLACE', name: 'Siena Gold', file: 'Siena Gold.jpg' },
  { sku: 'BTB024', name: 'Eclat Royal', file: 'Eclat Royal.jpg' },
  { sku: 'PL-15-NECKLACE', name: 'Vendôme Pearl', file: 'Vendome Pearl.jpg' },
  { sku: 'A180-NECKLACE', name: 'Collana Vivienne', file: 'Collana Vivienne.jpg' },
  { sku: 'A180-EARRING', name: 'Orecchini Vivienne', file: 'Orecchini Vivienne.jpg' },
];

for (const m of mappings) {
  // Pulisci il nome per la cartella
  const safeName = m.name.replace(/[^a-zA-Z0-9 -]/g, "");
  const folderName = `${m.sku} - ${safeName}`;
  const folderPath = path.join(baseDir, folderName);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Creata cartella mancante: ${folderName}`);
  }
  
  const oldPath = path.join(sourceDir, m.file);
  const newPath = path.join(folderPath, m.file);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Spostato ${m.file} -> ${folderName}`);
  }
}
