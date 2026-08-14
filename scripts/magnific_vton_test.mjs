import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const modelImage = path.join(baseDir, "Generazione foto", "Riferimento modella", "magnific_isabelpepe-focus-sullorec_BmPazQsoQR.png");
const jewelryImage = path.join(baseDir, "public", "Products", "transparent_ai_scaled", "A113 - Orecchini Duchesse.png");
const outputComposite = path.join(baseDir, "public", "Products", "test_composite_magnific.png");

async function createComposite() {
  console.log("Inizio composizione per il Virtual Try-On...");
  try {
    // Carica l'immagine della modella e il gioiello (già scalato al 30%)
    const model = await Jimp.read(modelImage);
    const jewelry = await Jimp.read(jewelryImage);

    // Vogliamo posizionare l'orecchino sull'orecchio. 
    // Poiché l'immagine del gioiello è grande quanto la tela originale,
    // se la sovrapponiamo centrata potrebbe non finire esattamente sull'orecchio.
    // L'orecchio nella modella focus è solitamente verso il centro-destra.
    // Calcoliamo un offset se necessario, per ora proviamo centrato.
    
    // Per avere controllo, ridimensioniamo il gioiello a 1080x1080 se non lo è
    jewelry.resize({ w: model.bitmap.width, h: model.bitmap.height });
    
    // Composita il gioiello
    model.composite(jewelry, 0, 0);

    await model.write(outputComposite);

    console.log(`[OK] Immagine composita salvata in: ${outputComposite}`);
    console.log("INVIO A MAGNIFIC API IN CORSO...");

    const imageBase64 = fs.readFileSync(outputComposite, { encoding: 'base64' });
    const dataUri = `data:image/png;base64,${imageBase64}`;

    const API_KEY = "MS27065482286144cba24af078fd07cd71"; // Chiave inserita

    // 1. Inizializza il task (usiamo l'upscaler in modalità creativa per fondere i livelli)
    const initResponse = await fetch("https://api.magnific.com/v1/ai/image-upscaler", {
      method: "POST",
      headers: {
        "x-magnific-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: dataUri,
        prompt: "A beautiful luxury earring on a model's ear, extremely realistic, highly detailed, perfect integration, natural lighting, fine jewelry, old money aesthetic",
        creativity: 4, 
        hdr: 2,
        resemblance: 5,
        scale_factor: "2x",
        engine: "automatic",
        fixed_generation: false
      })
    });

    if (!initResponse.ok) {
        const errText = await initResponse.text();
        throw new Error(`Errore API Init: ${initResponse.status} ${errText}`);
    }

    const initData = await initResponse.json();
    console.log("Dati Inizializzazione:", initData);
    
    const taskId = initData.data ? initData.data.task_id : initData.task_id;
    console.log("Task inizializzato! ID:", taskId);

    if (!taskId) throw new Error("Nessun ID task ricevuto dall'API.");

    // 2. Polling del task
    let resultUrl = null;
    while (!resultUrl) {
      await new Promise(r => setTimeout(r, 5000));
      console.log("Controllo stato task...");
      // L'endpoint per il polling di solito è /v1/ai/image-upscaler/{id} 
      // O /v1/tasks/{id} dipendendo dalla API. Proviamo /v1/ai/image-upscaler/{taskId}
      const pollResponse = await fetch(`https://api.magnific.com/v1/ai/image-upscaler/${taskId}`, {
        method: "GET",
        headers: { "x-magnific-api-key": API_KEY }
      });
      
      if (!pollResponse.ok) {
        console.error("Errore polling:", await pollResponse.text());
        break;
      }
      
      const pollData = await pollResponse.json();
      console.log("Dati Polling:", pollData);
      if (pollData.status === "completed" || pollData.status === "success") {
        resultUrl = pollData.result_url || pollData.url || pollData.image_url;
        console.log("MAGNIFIC HA FINITO! URL:", resultUrl);
      } else if (pollData.status === "failed") {
        throw new Error("Generazione fallita su Magnific");
      }
    }

  } catch (err) {
    console.error("[ERRORE] Durante il compositing:", err);
  }
}

createComposite();
