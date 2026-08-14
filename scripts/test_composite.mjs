import path from 'path';
import { Jimp } from 'jimp';

const baseDir = "c:/Users/mario/Progetti Antigravity/isabel-pepe";
const modelPath = path.join(baseDir, "Generazione foto", "Riferimento modella", "magnific_isabelpepe-focus-sulle-ma_kLMgoOH16B.png");
const jewelryPath = path.join(baseDir, "Generazione foto", "Prodotti da fare", "ASB4031 - Bracciale Trèfle.png");
const outputPath = path.join(baseDir, "public", "Products", "test_composite.png");

async function run() {
    const modelImg = await Jimp.read(modelPath);
    const jewelryImg = await Jimp.read(jewelryPath);

    // Coordinate da testare per il polso della modella in "focus-sulle-mani"
    // Supponiamo che l'immagine sia grande (es. 1024x1024 o simili). 
    // Dobbiamo ridimensionare e ruotare il gioiello.
    console.log("Model size:", modelImg.bitmap.width, "x", modelImg.bitmap.height);
    
    // Proviamo a scalare il bracciale (es. 300px)
    jewelryImg.resize({ w: 400 });
    
    // Proviamo a ruotarlo per adattarlo al polso
    jewelryImg.rotate(25); // gradi
    
    // Drop shadow
    const shadowImg = jewelryImg.clone();
    shadowImg.color([{ apply: 'shade', params: [100] }]); // Diventa nero
    shadowImg.blur(4);
    shadowImg.opacity(0.6);

    // Posizione stimata sul polso (dovremo aggiustarla)
    const x = modelImg.bitmap.width / 2 - 100;
    const y = modelImg.bitmap.height / 2;

    // Compositing
    modelImg.composite(shadowImg, x + 5, y + 5); // Ombra spostata leggermente
    modelImg.composite(jewelryImg, x, y);

    await modelImg.write(outputPath);
    console.log("Test composite saved to", outputPath);
}

run().catch(console.error);
