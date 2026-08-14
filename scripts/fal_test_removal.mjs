import fs from 'fs';
import path from 'path';

// Lettura chiave API
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let falKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('FAL_KEY=')) {
    falKey = line.split('=')[1].trim();
  }
});

const inputPath = 'C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\Generazione foto\\Prodotti da fare\\ASB3093 Orecchini Joséphine.png';
const outputPath = 'C:\\Users\\mario\\Progetti Antigravity\\isabel-pepe\\scripts\\ASB3093_scontornato_FAL.png';

async function removeBackgroundFAL() {
  console.log(`[FAL.ai] Inizio test scontorno su ASB3093...`);
  
  // Convertire in Base64
  const imageBuffer = fs.readFileSync(inputPath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  console.log(`[FAL.ai] Immagine convertita. Invio ai server Bria AI via FAL...`);

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/bria/remove-background', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: base64Image
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Errore API (${response.status}): ${err}`);
    }

    const data = await response.json();
    console.log(`[FAL.ai] Risposta ricevuta!`);

    // L'API di solito restituisce l'immagine come image.url (che può essere base64 o URL)
    const resultUrl = data.image?.url || data.image_url;
    
    if (resultUrl) {
      if (resultUrl.startsWith('data:image')) {
        const base64Data = resultUrl.split(',')[1];
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
      } else {
        const imageRes = await fetch(resultUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
      }
      console.log(`✅ Scontorno completato! File salvato in: ${outputPath}`);
    } else {
      console.log('Risposta API inattesa:', data);
    }
  } catch (error) {
    console.error(`[FAL.ai] Errore fatale:`, error);
  }
}

removeBackgroundFAL();
