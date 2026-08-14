import fs from 'fs';
import path from 'path';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public/Products";
const invoicePath = "c:/Users/mario/Progetti Antigravity/isabel-pepe/scripts/invoice_data.json";

// Leggi tutti i prodotti fatturati
const rawData = fs.readFileSync(invoicePath, 'utf-8');
const products = JSON.parse(rawData);

// Leggi tutte le cartelle esistenti
const items = fs.readdirSync(baseDir, { withFileTypes: true });
const folders = items.filter(i => i.isDirectory()).map(i => i.name);

let createdCount = 0;

for (const p of products) {
  // Controlla se esiste già una cartella che inizia con l'SKU
  const exists = folders.some(f => f.startsWith(p.sku + " -") || f === p.sku);
  
  if (!exists) {
    // Pulisci il nome per il file system
    const safeName = p.name.replace(/[^a-zA-Z0-9 -]/g, "").trim();
    const folderName = `${p.sku} - ${safeName}`;
    const folderPath = path.join(baseDir, folderName);
    
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Creata cartella mancante per fattura: ${folderName}`);
    createdCount++;
  }
}

console.log(`\nControllo terminato. Create ${createdCount} cartelle mancanti.`);
