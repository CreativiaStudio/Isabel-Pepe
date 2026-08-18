import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function createPrintReadyCertificate() {
  console.log('Generating 300 DPI print-ready certificate...');

  // Standard luxury certificate card: 85mm x 55mm at 600 DPI for micro-print quality
  const width = 2100;
  const height = 1360;

  // Read official logo in base64
  const logoPath = path.resolve(process.cwd(), 'public/Brand/logotipo-isabel.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = 'data:image/png;base64,' + logoBuffer.toString('base64');

  const svgContent = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Sfondo carta luxury crema -->
      <linearGradient id="paperBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FCFAF7"/>
        <stop offset="50%" stop-color="#F9F6F2"/>
        <stop offset="100%" stop-color="#F5F0EB"/>
      </linearGradient>

      <!-- Gradiente Lamina Oro Rosa / Rosa Champagne -->
      <linearGradient id="champagneFoil" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#A87B74"/>
        <stop offset="25%" stop-color="#CBB1AB"/>
        <stop offset="50%" stop-color="#F2E4E1"/>
        <stop offset="75%" stop-color="#C0A09A"/>
        <stop offset="100%" stop-color="#8A5E58"/>
      </linearGradient>
    </defs>

    <!-- Sfondo Carta -->
    <rect width="${width}" height="${height}" fill="url(#paperBg)"/>

    <!-- Cornice Esterna Guilloché / Doppia Linea -->
    <rect x="60" y="60" width="${width - 120}" height="${height - 120}" fill="none" stroke="url(#champagneFoil)" stroke-width="4" rx="10"/>
    <rect x="75" y="75" width="${width - 150}" height="${height - 150}" fill="none" stroke="url(#champagneFoil)" stroke-width="1.5" stroke-dasharray="10 5" rx="8" opacity="0.65"/>

    <!-- Angoli Decorativi Filigrana -->
    <g stroke="url(#champagneFoil)" stroke-width="2" fill="none" opacity="0.8">
      <path d="M 85,150 Q 85,85 150,85"/>
      <path d="M ${width - 85},150 Q ${width - 85},85 ${width - 150},85"/>
      <path d="M 85,${height - 150} Q 85,${height - 85} 150,${height - 85}"/>
      <path d="M ${width - 85},${height - 150} Q ${width - 85},${height - 85} ${width - 150},${height - 85}"/>
    </g>

    <!-- Logo Ufficiale ISABEL PEPE (Stemma Circolare) -->
    <image href="${logoBase64}" x="${(width - 240) / 2}" y="105" width="240" height="240" />

    <!-- Nome Marchio -->
    <text x="${width / 2}" y="395" font-family="Georgia, serif" font-size="52" letter-spacing="12" fill="#222222" font-weight="600" text-anchor="middle">
      ISABEL PEPE
    </text>

    <!-- Titolo Certificato -->
    <text x="${width / 2}" y="465" font-family="Georgia, serif" font-size="28" letter-spacing="5" fill="url(#champagneFoil)" font-weight="600" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ
    </text>
    <text x="${width / 2}" y="510" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" letter-spacing="4" fill="#666666" font-weight="500" text-anchor="middle">
      PERLE NATURALI D'ACQUA DOLCE &amp; ARGENTO 925
    </text>

    <!-- Linea divisoria oro rosa -->
    <line x1="280" y1="545" x2="${width - 280}" y2="545" stroke="url(#champagneFoil)" stroke-width="2"/>

    <!-- Tabella Specifiche Tecniche Certificate -->
    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" fill="#333333">
      <!-- Riga 1 -->
      <text x="320" y="615" font-weight="600" fill="#1A1A1A">Gemma:</text>
      <text x="740" y="615" font-weight="400">Perle Naturali d'Acqua Dolce Coltivate</text>
      <line x1="320" y1="640" x2="${width - 320}" y2="640" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 2 -->
      <text x="320" y="700" font-weight="600" fill="#1A1A1A">Selezione:</text>
      <text x="740" y="700" font-weight="400">Scelta Manuale di Prima Qualità • Lustro Organico</text>
      <line x1="320" y1="725" x2="${width - 320}" y2="725" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 3 -->
      <text x="320" y="785" font-weight="600" fill="#1A1A1A">Metallo Base:</text>
      <text x="740" y="785" font-weight="400">Argento Sterling 925 Nichel-Free (Punzone S925)</text>
      <line x1="320" y1="810" x2="${width - 320}" y2="810" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 4 -->
      <text x="320" y="870" font-weight="600" fill="#1A1A1A">Placcatura:</text>
      <text x="740" y="870" font-weight="400">Placcatura in Oro 18K da 1.0 Micron (Spessore Luxury)</text>
      <line x1="320" y1="895" x2="${width - 320}" y2="895" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 5 -->
      <text x="320" y="955" font-weight="600" fill="#1A1A1A">Protezione:</text>
      <text x="740" y="955" font-weight="400">Sigillo Molecolare E-Coating Anti-Ossidazione</text>
      <line x1="320" y1="980" x2="${width - 320}" y2="980" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 6 -->
      <text x="320" y="1040" font-weight="600" fill="#1A1A1A">Garanzia Legale:</text>
      <text x="740" y="1040" font-weight="400">Conformità 24 Mesi • Standard Europei REACH</text>
      <line x1="320" y1="1065" x2="${width - 320}" y2="1065" stroke="#E8E2DA" stroke-width="1.5"/>

      <!-- Riga 7 (ID Certificato) -->
      <text x="320" y="1125" font-weight="600" fill="url(#champagneFoil)">ID Certificato:</text>
      <text x="740" y="1125" font-weight="600" letter-spacing="3" fill="#1A1A1A">IP-PL-CERT-2026</text>
    </g>

    <!-- Footer Certificato -->
    <text x="${width / 2}" y="1255" font-family="'Helvetica Neue', Arial, sans-serif" font-size="17" letter-spacing="4" fill="#888888" text-anchor="middle">
      ISABEL PEPE • MARCHIO ITALIANO • WWW.ISABELPEPE.COM
    </text>
  </svg>
  `;

  const svgPath = path.resolve(process.cwd(), 'public/Brand/stampa_certificato_perle_vettore.svg');
  const pngPrintPath = path.resolve(process.cwd(), 'public/Brand/stampa_certificato_perle_300dpi.png');
  const webpCardPath = path.resolve(process.cwd(), 'public/Brand/certificato_perle_card_clean.webp');

  fs.writeFileSync(svgPath, svgContent);

  // Render 300 DPI Ultra HD PNG for Printer (2100x1360)
  await sharp(Buffer.from(svgContent))
    .png({ quality: 100 })
    .toFile(pngPrintPath);

  // Render WebP for Web PDP & Modals
  await sharp(Buffer.from(svgContent))
    .webp({ quality: 95 })
    .toFile(webpCardPath);

  console.log('✅ Print assets and web card successfully generated!');
  console.log('SVG:', svgPath);
  console.log('PNG 300DPI:', pngPrintPath);
  console.log('WebP Card:', webpCardPath);
}

createPrintReadyCertificate().catch(console.error);
