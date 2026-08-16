const fs = require('fs');
const path = require('path');

const data = [
  { "sku": "MS1093", "name": "Collana L'Éternel", "image_primary": null },
  { "sku": "ASB3142", "name": "Orecchini S925+ brillante+ cz", "image_primary": null },
  { "sku": "MS12242", "name": "Collana S925+brillante", "image_primary": null },
  { "sku": "A114", "name": "Orecchini brillante", "image_primary": null },
  { "sku": "A113", "name": "Anello brillante", "image_primary": null },
  { "sku": "A118", "name": "Orecchini cerchio 15mm", "image_primary": null },
  { "sku": "MS1096", "name": "Collana brillante", "image_primary": null },
  { "sku": "BTB047", "name": "Collana S925+brillante", "image_primary": null },
  { "sku": "MS1105", "name": "Collana/Bracciale S925+brillante", "image_primary": null },
  { "sku": "ASB4064", "name": "Bracciale S925+brillante", "image_primary": null },
  { "sku": "BTS018-NECKLACE", "name": "Siena Gold", "image_primary": "/Products/Siena Gold.jpg" },
  { "sku": "BTS018-EARRING", "name": "Glow Ribbon", "image_primary": "/Products/Glow Ribbon.jpg" },
  { "sku": "BTN028", "name": "Isabel Romance", "image_primary": "/Products/Isabel Romance.jpg" },
  { "sku": "PL-40", "name": "Collana perle acqua dolce 10~11mm", "image_primary": null },
  { "sku": "MSR1075", "name": "Anello S925+ brillante+ cz", "image_primary": null },
  { "sku": "MS1208", "name": "Collana cuore S925+ brillante", "image_primary": null },
  { "sku": "ASB3035", "name": "Orecchini cuori S925+brillante", "image_primary": null },
  { "sku": "ASB0041", "name": "Orecchini pendenti S925+brillante", "image_primary": null },
  { "sku": "A144-EARRING", "name": "Orecchini brillante", "image_primary": null },
  { "sku": "ASB4043", "name": "Bracciale brillante", "image_primary": null },
  { "sku": "A144-NECKLACE", "name": "Collana brillante", "image_primary": null },
  { "sku": "ASB4054-WHITE", "name": "Bracciale S925+ brillante White", "image_primary": null },
  { "sku": "BTB024", "name": "Eclat Royal", "image_primary": "/Products/Eclat Royal.jpg" },
  { "sku": "MSR1089", "name": "Anello S925+brillante Gold", "image_primary": null },
  { "sku": "MSR1093", "name": "Anello fiore S925+ brillante", "image_primary": null },
  { "sku": "ASB4068", "name": "Bracciale tennis brillante", "image_primary": null },
  { "sku": "BTN005-SILVER", "name": "Collana Brera silver", "image_primary": null },
  { "sku": "BTN005-GOLD", "name": "Collana Brera Gold", "image_primary": null },
  { "sku": "MSR1139", "name": "Anello multi brillante", "image_primary": null },
  { "sku": "BTS036-NECKLACE", "name": "Collana farfalla", "image_primary": null },
  { "sku": "MSR1220", "name": "Anello brillante", "image_primary": null },
  { "sku": "ASB3141", "name": "Orecchini full brillante", "image_primary": null },
  { "sku": "ASB4019", "name": "Bracciale brillante", "image_primary": null },
  { "sku": "ASB3093", "name": "Orecchini pink", "image_primary": null },
  { "sku": "PL-15-BRACELET", "name": "Bracciale perle acqua dolce 7.5~8 mm", "image_primary": null },
  { "sku": "ASB4054-PINK", "name": "Eden Rose", "image_primary": "/Products/Eden Rose.jpg" },
  { "sku": "MSR1078", "name": "Anello S925+ brillante Silver", "image_primary": null },
  { "sku": "MS12236", "name": "Collana farfalla full brillante", "image_primary": null },
  { "sku": "ASB4055", "name": "Bracciale full brillante", "image_primary": null },
  { "sku": "BTS036-EARRING", "name": "Orecchini farfalla", "image_primary": null },
  { "sku": "ASB3057", "name": "Orecchini fiore brillante", "image_primary": null },
  { "sku": "PL-15-NECKLACE", "name": "Vendôme Pearl", "image_primary": "/Products/Vendome Pearl.jpg" },
  { "sku": "MS1141", "name": "Collana fiore brillante", "image_primary": null },
  { "sku": "PL-6-NECKLACE", "name": "Collana perle acqua dolce 4~5mm", "image_primary": null },
  { "sku": "PL-6-BRACELET", "name": "Bracciale perle acqua dolce 4~5mm", "image_primary": null },
  { "sku": "PL-30", "name": "Collana perle acqua dolce 5~6mm", "image_primary": null },
  { "sku": "A180-SET", "name": "Set Vivienne", "image_primary": "/Products/Collana Vivienne.jpg" }
];

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/Generazione foto/prodotti finiti";
const publicDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public";

const existingDirs = fs.readdirSync(baseDir);
existingDirs.forEach(dir => {
  if (dir.endsWith(' - ') && dir !== 'Orecchini Rivière') { 
    const dirPath = path.join(baseDir, dir);
    const files = fs.readdirSync(dirPath);
    if (files.length === 0) {
      fs.rmdirSync(dirPath);
    }
  }
});

data.forEach(item => {
    const sku = item.sku;
    const safeName = item.name.replace(/[<>:"\/\\|?*]+/g, '').trim(); 
    const imagePath = item.image_primary;
    
    const targetFolderName = `${sku} - ${safeName}`;
    const targetFolderPath = path.join(baseDir, targetFolderName);
    
    if (!fs.existsSync(targetFolderPath)) {
        fs.mkdirSync(targetFolderPath, { recursive: true });
        console.log(`Created: ${targetFolderName}`);
    }
    
    if (imagePath) {
        const normalizedImg = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const sourceImg = path.join(publicDir, normalizedImg);
        
        if (fs.existsSync(sourceImg)) {
            const destImg = path.join(targetFolderPath, path.basename(sourceImg));
            if (!fs.existsSync(destImg)) {
                fs.copyFileSync(sourceImg, destImg);
                console.log(`Copied ${path.basename(sourceImg)} to ${targetFolderName}`);
            }
        }
    }
});

console.log("Sync complete!");
