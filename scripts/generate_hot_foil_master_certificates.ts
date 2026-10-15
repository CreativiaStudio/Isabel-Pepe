import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface CertificateSpec {
  id: string;
  title: string;
  printFilename: string;
  webBaseName: string;
  rows: Array<{ label: string; value: string }>;
  certId: string;
}

const CERTIFICATES: CertificateSpec[] = [
  // 1. MOISSANITE & ORO 18K
  {
    id: 'moissanite_gold',
    title: 'CERTIFICATO DI AUTENTICITÀ & QUALITÀ — MOISSANITE & ORO 18K',
    printFilename: 'certificato_stampa_moissanite_oro18k_300dpi.png',
    webBaseName: 'certificato_moissanite_oro18k',
    rows: [
      { label: 'Gemma:', value: 'Moissanite D-Color VVS1 (Doppio Certificato GRA Ufficiale Incluso)' },
      { label: 'Metallo Base:', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Placcatura:', value: 'Placcatura Oro 18K da 1.0 Micron ad Alto Spessore' },
      { label: 'Protezione:', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia:', value: 'Conformità Legale 24 Mesi • Standard Europei REACH' },
      { label: 'ID Certificato:', value: 'IP-MOISS-ORO18K-2026' },
    ],
    certId: 'IP-MOISS-ORO18K-2026',
  },

  // 2. MOISSANITE & RODIO PURO
  {
    id: 'moissanite_rhodium',
    title: 'CERTIFICATO DI AUTENTICITÀ & QUALITÀ — MOISSANITE & RODIO PURO',
    printFilename: 'certificato_stampa_moissanite_rodio_300dpi.png',
    webBaseName: 'certificato_moissanite_rodio',
    rows: [
      { label: 'Gemma:', value: 'Moissanite D-Color VVS1 (Doppio Certificato GRA Ufficiale Incluso)' },
      { label: 'Metallo Base:', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Finitura:', value: 'Placcatura in Rodio Puro a Specchio (Effetto Oro Bianco)' },
      { label: 'Protezione:', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia:', value: 'Conformità Legale 24 Mesi • Standard Europei REACH' },
      { label: 'ID Certificato:', value: 'IP-MOISS-ROD-2026' },
    ],
    certId: 'IP-MOISS-ROD-2026',
  },

  // 3. PERLE NATURALI & ORO 18K
  {
    id: 'pearl_gold',
    title: 'CERTIFICATO DI AUTENTICITÀ & QUALITÀ — PERLE & ORO 18K',
    printFilename: 'certificato_stampa_perle_oro18k_300dpi.png',
    webBaseName: 'certificato_perle_oro18k',
    rows: [
      { label: 'Gemma:', value: "Perle Naturali d'Acqua Dolce Coltivate (Selezione Manuale)" },
      { label: 'Metallo Base:', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Placcatura:', value: 'Placcatura Oro 18K da 1.0 Micron ad Alto Spessore' },
      { label: 'Protezione:', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia:', value: 'Conformità Legale 24 Mesi • Standard Europei REACH' },
      { label: 'ID Certificato:', value: 'IP-PL-ORO18K-2026' },
    ],
    certId: 'IP-PL-ORO18K-2026',
  },

  // 4. ARGENTO STERLING 925 & CRISTALLI
  {
    id: 'silver_crystals',
    title: 'CERTIFICATO DI AUTENTICITÀ & QUALITÀ — METALLI NOBILI & ARGENTO 925',
    printFilename: 'certificato_stampa_argento925_cristalli_300dpi.png',
    webBaseName: 'certificato_argento925',
    rows: [
      { label: 'Metallo Base:', value: '100% Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Dettagli Pietre:', value: 'Cristalli di Luce ad Alta Rifrazione (Taglio Brillante Sfaccettato)' },
      { label: 'Finitura Nobile:', value: 'Finitura di Prestigio in Rodio Puro a Specchio / Oro 18K' },
      { label: 'Protezione:', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia:', value: 'Conformità Legale 24 Mesi • Standard Europei REACH' },
      { label: 'ID Certificato:', value: 'IP-AG925-CRYSTAL-2026' },
    ],
    certId: 'IP-AG925-CRYSTAL-2026',
  },
];

async function generateAllHotFoilMasterCertificates() {
  console.log('✨ Generating 4 Flawless Hot-Foil Rose Gold Certificates (Print 300 DPI + Web)...');

  const baseDir = path.resolve(__dirname, '..');
  const templatesDir = path.join(baseDir, 'brand/assets/master_templates');
  const printDir = path.join(baseDir, 'brand/assets/certificati_stampa_300dpi');
  const webDir = path.join(baseDir, 'public/Brand');

  const masterBlankPath = path.join(templatesDir, 'master_blank_hot_foil_frame.png');
  const masterLogoPath = path.join(templatesDir, 'master_logo_hot_foil_rose_gold.png');

  if (!fs.existsSync(printDir)) fs.mkdirSync(printDir, { recursive: true });
  if (!fs.existsSync(webDir)) fs.mkdirSync(webDir, { recursive: true });

  const targetW = 2526;
  const targetH = 1908;

  const highResBlank = await sharp(masterBlankPath)
    .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const logoW = 710;
  const logoH = Math.round(340 * (logoW / 312));
  const resizedLogo = await sharp(masterLogoPath)
    .resize(logoW, logoH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const logoX = Math.round((targetW - logoW) / 2);
  const logoY = 150;

  const titleY = 1000;
  const tableLeft = 440;
  const tableRight = 2086;
  const tableWidth = tableRight - tableLeft;
  const dividerX = 940;
  const tableTop = 1055;
  const rowH = 82;
  const numRows = 6;
  const tableBottom = tableTop + (numRows * rowH);
  const footerY = tableBottom + 85;

  const escapeXml = (str: string) => str.replace(/&/g, '&amp;');

  for (const cert of CERTIFICATES) {
    console.log(`\n💎 Processing: ${cert.title}...`);

    const rowsSvg = cert.rows.map((row, idx) => {
      const y = tableTop + (idx * rowH) + 53;
      const isLast = idx === cert.rows.length - 1;
      const lineY = tableTop + (idx + 1) * rowH;
      return `
        <!-- Row ${idx + 1}: ${escapeXml(row.label)} -->
        <text x="${tableLeft + 40}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="600" fill="#2E2019">${escapeXml(row.label)}</text>
        <text x="${dividerX + 35}" y="${y}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="27" font-weight="${isLast ? '600' : '400'}" fill="#2E2019">${escapeXml(row.value)}</text>
        ${!isLast ? `<line x1="${tableLeft}" y1="${lineY}" x2="${tableRight}" y2="${lineY}" stroke="#EADFD6" stroke-width="1.5" />` : ''}
      `;
    }).join('\n');

    const svgOverlay = `
    <svg width="${targetW}" height="${targetH}" viewBox="0 0 ${targetW} ${targetH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roseGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C89D91" />
          <stop offset="50%" stop-color="#DCB4A8" />
          <stop offset="100%" stop-color="#AA776A" />
        </linearGradient>
      </defs>

      <text x="${targetW / 2}" y="${titleY}" 
        font-family="Georgia, 'Times New Roman', serif" 
        font-size="33" 
        font-weight="600" 
        letter-spacing="3" 
        fill="#2A1E18" 
        text-anchor="middle">
        ${escapeXml(cert.title)}
      </text>

      <rect x="${tableLeft}" y="${tableTop}" width="${tableWidth}" height="${numRows * rowH}" 
        fill="#FCFAF7" fill-opacity="0.5" 
        stroke="url(#roseGoldBorder)" stroke-width="2.5" rx="4" />

      <line x1="${dividerX}" y1="${tableTop}" x2="${dividerX}" y2="${tableBottom}" 
        stroke="#EADFD6" stroke-width="1.5" />

      ${rowsSvg}

      <text x="${targetW / 2}" y="${footerY}" 
        font-family="Georgia, 'Times New Roman', serif" 
        font-size="20" 
        letter-spacing="5" 
        fill="#9D786E" 
        text-anchor="middle">
        MARCHIO UFFICIALE ISABEL PEPE • DOCUMENTO DI GARANZIA • TUTTI I DIRITTI RISERVATI
      </text>
    </svg>
    `;

    const finalPrintBuffer = await sharp(highResBlank)
      .composite([
        { input: resizedLogo, top: logoY, left: logoX },
        { input: Buffer.from(svgOverlay), top: 0, left: 0 }
      ])
      .png()
      .toBuffer();

    const printFilePath = path.join(printDir, cert.printFilename);
    fs.writeFileSync(printFilePath, finalPrintBuffer);
    console.log(`  ✅ Print (300 DPI): ${printFilePath}`);

    const webPrintCopy = path.join(webDir, cert.printFilename);
    fs.writeFileSync(webPrintCopy, finalPrintBuffer);

    const webW = 1600;
    const webH = Math.round(targetH * (webW / targetW));

    const webpBuffer = await sharp(finalPrintBuffer)
      .resize(webW, webH, { kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 92, effort: 6 })
      .toBuffer();
    const webpPath = path.join(webDir, `${cert.webBaseName}.webp`);
    fs.writeFileSync(webpPath, webpBuffer);
    console.log(`  ✅ Web (WebP): ${webpPath}`);

    const jpgBuffer = await sharp(finalPrintBuffer)
      .resize(webW, webH, { kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    const jpgPath = path.join(webDir, `${cert.webBaseName}.jpg`);
    fs.writeFileSync(jpgPath, jpgBuffer);
    console.log(`  ✅ Web (JPG): ${jpgPath}`);

    if (cert.id === 'silver_crystals') {
      fs.writeFileSync(path.join(webDir, 'certificato_metalli_isabel_clean.webp'), webpBuffer);
      fs.writeFileSync(path.join(webDir, 'certificato_metalli_isabel_clean.jpg'), jpgBuffer);
    }
  }

  console.log('\n🎉 ALL 4 MASTER CERTIFICATES SUCCESSFULLY GENERATED!');
}

generateAllHotFoilMasterCertificates().catch(err => {
  console.error(err);
  process.exit(1);
});
