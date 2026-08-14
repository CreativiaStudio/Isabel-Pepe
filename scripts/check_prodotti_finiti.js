const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\Generazione foto\\prodotti finiti';

if (!fs.existsSync(baseDir)) {
  console.log('Cartella non trovata:', baseDir);
  process.exit(1);
}

const items = fs.readdirSync(baseDir, { withFileTypes: true });
const subfolders = items.filter(item => item.isDirectory()).map(item => item.name);

const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.webm'];

let countWithPhotos = 0;
let countEmpty = 0;

const results = [];

subfolders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath);
  const mediaFiles = files.filter(f => imageExts.includes(path.extname(f).toLowerCase()));
  
  if (mediaFiles.length > 0) {
    countWithPhotos++;
    results.push({ folder, count: mediaFiles.length, files: mediaFiles });
  } else {
    countEmpty++;
    results.push({ folder, count: 0, files: [] });
  }
});

console.log('TOTALE_CARTELLE:', subfolders.length);
console.log('CARTELLE_CON_FOTO:', countWithPhotos);
console.log('CARTELLE_SENZA_FOTO:', countEmpty);
console.log('\n--- DETTAGLIO ---');
results.forEach(r => {
  console.log(`[${r.count > 0 ? 'CON FOTO' : 'VUOTA'}] ${r.folder}: ${r.count} foto/video`);
  if (r.count > 0) {
    r.files.forEach(f => console.log('   - ' + f));
  }
});
