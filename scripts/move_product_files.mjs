import fs from 'fs';
import path from 'path';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe/public/Products";

// Leggi tutti i file e cartelle
const items = fs.readdirSync(baseDir, { withFileTypes: true });

const folders = items.filter(i => i.isDirectory() && i.name !== 'transparent_temp' && i.name !== 'transparent_ai_scaled').map(i => i.name);
const files = items.filter(i => i.isFile()).map(i => i.name);

let movedCount = 0;

for (const file of files) {
  const fileUpper = file.toUpperCase();
  let bestFolder = null;
  
  if (fileUpper.includes('A113')) bestFolder = folders.find(f => f.includes('A113'));
  else if (fileUpper.includes('A114')) bestFolder = folders.find(f => f.includes('A114'));
  else if (fileUpper.includes('A144') && fileUpper.includes('EARRING')) bestFolder = folders.find(f => f.includes('A144 - Orecchini'));
  else if (fileUpper.includes('A144') && fileUpper.includes('NECK')) bestFolder = folders.find(f => f.includes('A144 - Collana'));
  else if (fileUpper.includes('ANELLO_NOVA')) bestFolder = folders.find(f => f.includes('Anello Nova'));
  else if (fileUpper.includes('ANELLO_OLIMPIA')) bestFolder = folders.find(f => f.includes('Anello Olimpia'));
  else if (fileUpper.includes('BRACCIALE_ALLURE')) bestFolder = folders.find(f => f.includes('Bracciale Allure'));
  else if (fileUpper.includes('ASB3057')) bestFolder = folders.find(f => f.includes('ASB3057'));
  else if (fileUpper.includes('ASB3093')) bestFolder = folders.find(f => f.includes('ASB3093'));
  else if (fileUpper.includes('ASB3141')) bestFolder = folders.find(f => f.includes('ASB3141'));
  else if (fileUpper.includes('ASB4031')) bestFolder = folders.find(f => f.includes('ASB4031'));
  else if (fileUpper.includes('ASB4043')) bestFolder = folders.find(f => f.includes('ASB4043'));
  else if (fileUpper.includes('ASB4054')) bestFolder = folders.find(f => f.includes('ASB4054'));
  else if (fileUpper.includes('ASB4055')) bestFolder = folders.find(f => f.includes('ASB4055'));
  else if (fileUpper.includes('ASB4064')) bestFolder = folders.find(f => f.includes('ASB4064'));
  else if (fileUpper.includes('ASB4068')) bestFolder = folders.find(f => f.includes('ASB4068'));
  else if (fileUpper.includes('BTN005')) bestFolder = folders.find(f => f.includes('BTN005'));
  else if (fileUpper.includes('BTN006')) bestFolder = folders.find(f => f.includes('BTN006'));
  else if (fileUpper.includes('BTS036')) bestFolder = folders.find(f => f.includes('BTS036'));
  else if (fileUpper.includes('MS1105')) bestFolder = folders.find(f => f.includes('MS1105'));
  else if (fileUpper.includes('MS1208')) bestFolder = folders.find(f => f.includes('MS1208'));
  else if (fileUpper.includes('MS12236')) bestFolder = folders.find(f => f.includes('MS12236'));
  else if (fileUpper.includes('MS12242')) bestFolder = folders.find(f => f.includes('MS12242'));
  else if (fileUpper.includes('MSR1075')) bestFolder = folders.find(f => f.includes('MSR1075'));
  else if (fileUpper.includes('MSR1139')) bestFolder = folders.find(f => f.includes('MSR1139'));
  else if (fileUpper.includes('MSR1220')) bestFolder = folders.find(f => f.includes('MSR1220'));
  else if (fileUpper.includes('STALACTITE')) bestFolder = folders.find(f => f.includes('Stalactite'));

  if (bestFolder) {
    fs.renameSync(path.join(baseDir, file), path.join(baseDir, bestFolder, file));
    console.log(`Spostato ${file} -> ${bestFolder}`);
    movedCount++;
  }
}

console.log(`\\nCompletato: spostate ${movedCount} foto nelle rispettive cartelle.`);
