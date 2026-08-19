import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateExactSiteLogo() {
  console.log('--- 💎 GENERAZIONE LOGO TESTUALE "ISABEL PEPE" ESATTO DEL SITO ---');

  const brandDir = path.join(process.cwd(), 'public', 'Brand');
  const logoDest = path.join(brandDir, 'stripe_logo_isabel_pepe.png');
  const artDir = 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e';

  // SVG con la scritta ISABEL PEPE identica a quella del sito:
  // Font Serif elegante, tracking ampio (letter-spacing: 0.2em), colore #C0A09A su fondo trasparente
  const logoSvg = `
  <svg width="900" height="200" viewBox="0 0 900 200" xmlns="http://www.w3.org/2000/svg">
    <text 
      x="50%" 
      y="58%" 
      dominant-baseline="middle" 
      text-anchor="middle" 
      font-family="'Playfair Display', 'Cinzel', 'Didot', 'Bodoni MT', 'Baskerville', 'Georgia', serif" 
      font-size="64" 
      font-weight="500" 
      letter-spacing="18" 
      fill="#C0A09A"
    >
      ISABEL PEPE
    </text>
  </svg>
  `;

  await sharp(Buffer.from(logoSvg))
    .trim()
    .resize(800, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toFile(logoDest);

  // Copia anche nella cartella artifacts
  fs.copyFileSync(logoDest, path.join(artDir, 'stripe_logo_isabel_pepe.png'));

  console.log('✅ Logo testuale ISABEL PEPE generato con successo:', logoDest, `(${fs.statSync(logoDest).size / 1024} KB)`);
}

generateExactSiteLogo().catch(console.error);
