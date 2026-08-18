import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateThe3MasterCertificates() {
  console.log('Generating the 3 Master Official Certificates (Web + 300 DPI Print files)...');

  // Master base template: high-res embossed card
  const masterPath = path.resolve(process.cwd(), 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e/certificato_moissanite_oro18k_raw_1787059457283.jpg');
  const masterMeta = await sharp(masterPath).metadata();
  const mw = masterMeta.width || 1200;
  const mh = masterMeta.height || 800;

  const cardLeft = Math.round(mw * 0.118);
  const cardTop = Math.round(mh * 0.102);
  const cardWidth = Math.round(mw * 0.764);
  const cardHeight = Math.round(mh * 0.796);

  // Standard high-res print card: 2100 x 1360 px (85x55mm at ~300 DPI)
  const baseCardPrint = await sharp(masterPath)
    .extract({ left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight })
    .resize(2100, 1360, { fit: 'fill' })
    .toBuffer();

  const pw = 2100;
  const ph = 1360;

  // ==========================================
  // 1. TIPO 1: ORO PERLA
  // ==========================================
  const oroPerlaOverlaySvg = `
  <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
    <!-- Clean patch over title and specifications -->
    <rect x="${pw * 0.08}" y="${ph * 0.49}" width="${pw * 0.84}" height="${ph * 0.43}" fill="#F4EAE4" />

    <!-- Title -->
    <text x="${pw * 0.50}" y="${ph * 0.54}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="34" font-weight="600" letter-spacing="2" fill="#5C4033" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ — PERLE &amp; ORO 18K
    </text>

    <!-- Table content -->
    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="30" fill="#3D312A">
      <text x="${pw * 0.20}" y="${ph * 0.62}" font-weight="600" fill="#7A5848">Gemma:</text>
      <text x="${pw * 0.38}" y="${ph * 0.62}" font-weight="400">Perle Naturali d'Acqua Dolce Coltivate</text>

      <text x="${pw * 0.20}" y="${ph * 0.68}" font-weight="600" fill="#7A5848">Selezione:</text>
      <text x="${pw * 0.38}" y="${ph * 0.68}" font-weight="400">Scelta Manuale di Prima Qualità</text>

      <text x="${pw * 0.20}" y="${ph * 0.74}" font-weight="600" fill="#7A5848">Metallo Base:</text>
      <text x="${pw * 0.38}" y="${ph * 0.74}" font-weight="400">Argento Sterling 925 Nichel-Free</text>

      <text x="${pw * 0.20}" y="${ph * 0.80}" font-weight="600" fill="#7A5848">Placcatura:</text>
      <text x="${pw * 0.38}" y="${ph * 0.80}" font-weight="400">Placcatura Oro 18K (1.0 Micron) + E-Coating</text>

      <text x="${pw * 0.20}" y="${ph * 0.86}" font-weight="600" fill="#7A5848">Garanzia:</text>
      <text x="${pw * 0.38}" y="${ph * 0.86}" font-weight="400">Conformità Legale 24 Mesi • Standard UE</text>

      <text x="${pw * 0.20}" y="${ph * 0.92}" font-weight="600" fill="#7A5848">ID Certificato:</text>
      <text x="${pw * 0.38}" y="${ph * 0.92}" font-weight="400">IP-PL-ORO18K</text>
    </g>
  </svg>
  `;

  // Save 300 DPI Print file + Web formats
  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroPerlaOverlaySvg), top: 0, left: 0 }])
    .png()
    .toFile(path.resolve(process.cwd(), 'public/Brand/stampa_certificato_oro_perla_300dpi.png'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroPerlaOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_perle_card_clean.webp'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroPerlaOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_perle_card_clean.jpg'));

  // ==========================================
  // 2. TIPO 2: ORO MOISSANITE
  // ==========================================
  const oroMoissaniteOverlaySvg = `
  <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${pw * 0.08}" y="${ph * 0.49}" width="${pw * 0.84}" height="${ph * 0.43}" fill="#F4EAE4" />

    <text x="${pw * 0.50}" y="${ph * 0.54}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="34" font-weight="600" letter-spacing="2" fill="#5C4033" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ — MOISSANITE &amp; ORO 18K
    </text>

    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="30" fill="#3D312A">
      <text x="${pw * 0.20}" y="${ph * 0.62}" font-weight="600" fill="#7A5848">Gemma:</text>
      <text x="${pw * 0.38}" y="${ph * 0.62}" font-weight="400">Moissanite D-Color VVS1 (Certificato GRA Incluso)</text>

      <text x="${pw * 0.20}" y="${ph * 0.68}" font-weight="600" fill="#7A5848">Metallo Base:</text>
      <text x="${pw * 0.38}" y="${ph * 0.68}" font-weight="400">Argento Sterling 925 Nichel-Free</text>

      <text x="${pw * 0.20}" y="${ph * 0.74}" font-weight="600" fill="#7A5848">Placcatura:</text>
      <text x="${pw * 0.38}" y="${ph * 0.74}" font-weight="400">Placcatura Oro 18K (1.0 Micron)</text>

      <text x="${pw * 0.20}" y="${ph * 0.80}" font-weight="600" fill="#7A5848">Protezione:</text>
      <text x="${pw * 0.38}" y="${ph * 0.80}" font-weight="400">Nano-Sigillo E-Coating Anti-Ossidazione</text>

      <text x="${pw * 0.20}" y="${ph * 0.86}" font-weight="600" fill="#7A5848">Garanzia:</text>
      <text x="${pw * 0.38}" y="${ph * 0.86}" font-weight="400">Conformità Legale 24 Mesi • Standard UE</text>

      <text x="${pw * 0.20}" y="${ph * 0.92}" font-weight="600" fill="#7A5848">ID Certificato:</text>
      <text x="${pw * 0.38}" y="${ph * 0.92}" font-weight="400">IP-MOISS-ORO18K</text>
    </g>
  </svg>
  `;

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroMoissaniteOverlaySvg), top: 0, left: 0 }])
    .png()
    .toFile(path.resolve(process.cwd(), 'public/Brand/stampa_certificato_oro_moissanite_300dpi.png'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroMoissaniteOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_oro18k.webp'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(oroMoissaniteOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_oro18k.jpg'));

  // ==========================================
  // 3. TIPO 3: RODIO MOISSANITE
  // ==========================================
  const rodioMoissaniteOverlaySvg = `
  <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${pw * 0.08}" y="${ph * 0.49}" width="${pw * 0.84}" height="${ph * 0.43}" fill="#F4EAE4" />

    <text x="${pw * 0.50}" y="${ph * 0.54}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="34" font-weight="600" letter-spacing="2" fill="#5C4033" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ — MOISSANITE &amp; RODIO
    </text>

    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="30" fill="#3D312A">
      <text x="${pw * 0.20}" y="${ph * 0.62}" font-weight="600" fill="#7A5848">Gemma:</text>
      <text x="${pw * 0.38}" y="${ph * 0.62}" font-weight="400">Moissanite D-Color VVS1 (Certificato GRA Incluso)</text>

      <text x="${pw * 0.20}" y="${ph * 0.68}" font-weight="600" fill="#7A5848">Metallo Base:</text>
      <text x="${pw * 0.38}" y="${ph * 0.68}" font-weight="400">Argento Sterling 925 Nichel-Free</text>

      <text x="${pw * 0.20}" y="${ph * 0.74}" font-weight="600" fill="#7A5848">Finitura:</text>
      <text x="${pw * 0.38}" y="${ph * 0.74}" font-weight="400">Finitura Rodio Puro a Specchio</text>

      <text x="${pw * 0.20}" y="${ph * 0.80}" font-weight="600" fill="#7A5848">Protezione:</text>
      <text x="${pw * 0.38}" y="${ph * 0.80}" font-weight="400">Nano-Sigillo E-Coating Anti-Ossidazione</text>

      <text x="${pw * 0.20}" y="${ph * 0.86}" font-weight="600" fill="#7A5848">Garanzia:</text>
      <text x="${pw * 0.38}" y="${ph * 0.86}" font-weight="400">Conformità Legale 24 Mesi • Standard UE</text>

      <text x="${pw * 0.20}" y="${ph * 0.92}" font-weight="600" fill="#7A5848">ID Certificato:</text>
      <text x="${pw * 0.38}" y="${ph * 0.92}" font-weight="400">IP-MOISS-ROD-2026</text>
    </g>
  </svg>
  `;

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(rodioMoissaniteOverlaySvg), top: 0, left: 0 }])
    .png()
    .toFile(path.resolve(process.cwd(), 'public/Brand/stampa_certificato_rodio_moissanite_300dpi.png'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(rodioMoissaniteOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_rodio.webp'));

  await sharp(baseCardPrint)
    .composite([{ input: Buffer.from(rodioMoissaniteOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_rodio.jpg'));

  console.log('✅ The 3 Master Certificates generated and exported successfully for Print (300 DPI) & Web!');
}

generateThe3MasterCertificates().catch(console.error);
