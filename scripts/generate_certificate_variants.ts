import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAllCertificateVariants() {
  console.log('Generating all dedicated Isabel Pepe Certificate variants...');

  const masterPath = path.resolve(process.cwd(), 'C:/Users/mario/.gemini/antigravity/brain/c179de7c-1904-44ee-afff-b91f47bf4b2e/certificato_moissanite_oro18k_raw_1787059457283.jpg');
  const masterMeta = await sharp(masterPath).metadata();
  const mw = masterMeta.width || 1200;
  const mh = masterMeta.height || 800;

  // Extract clean rectangular card without surrounding drop shadow
  const cardLeft = Math.round(mw * 0.118);
  const cardTop = Math.round(mh * 0.102);
  const cardWidth = Math.round(mw * 0.764);
  const cardHeight = Math.round(mh * 0.796);

  const baseCard = await sharp(masterPath)
    .extract({ left: cardLeft, top: cardTop, width: cardWidth, height: cardHeight })
    .resize(1600, 1040, { fit: 'fill' })
    .toBuffer();

  const w = 1600;
  const h = 1040;

  // 1. Variant: Moissanite & Oro 18K
  // Uses the raw text already on the master card or cleanly rendered
  await sharp(baseCard)
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_oro18k.webp'));
  await sharp(baseCard)
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_oro18k.jpg'));

  // 2. Variant: Moissanite & Rodio Puro
  // Cover title and table lines with exact color matched blush background patch and crisp vector text
  const rodioOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Clean patch over title and specifications -->
    <rect x="${w * 0.10}" y="${h * 0.50}" width="${w * 0.80}" height="${h * 0.40}" fill="#F4EAE4" />

    <!-- Title -->
    <text x="${w * 0.50}" y="${h * 0.54}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="600" letter-spacing="2" fill="#5C4033" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ — MOISSANITE &amp; RODIO
    </text>

    <!-- Table content -->
    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" fill="#3D312A">
      <!-- Row 1: Gemma -->
      <text x="${w * 0.22}" y="${h * 0.61}" font-weight="500" fill="#7A5848">Gemma:</text>
      <text x="${w * 0.38}" y="${h * 0.61}" font-weight="400">Moissanite D-Color VVS1 (Certificato GRA Incluso)</text>

      <!-- Row 2: Metallo Base -->
      <text x="${w * 0.22}" y="${h * 0.66}" font-weight="500" fill="#7A5848">Metallo Base:</text>
      <text x="${w * 0.38}" y="${h * 0.66}" font-weight="400">Argento Sterling 925 Nichel-Free</text>

      <!-- Row 3: Placcatura -->
      <text x="${w * 0.22}" y="${h * 0.71}" font-weight="500" fill="#7A5848">Finitura:</text>
      <text x="${w * 0.38}" y="${h * 0.71}" font-weight="400">Finitura Rodio Puro a Specchio</text>

      <!-- Row 4: Protezione -->
      <text x="${w * 0.22}" y="${h * 0.76}" font-weight="500" fill="#7A5848">Protezione:</text>
      <text x="${w * 0.38}" y="${h * 0.76}" font-weight="400">Nano-Sigillo E-Coating</text>

      <!-- Row 5: Garanzia -->
      <text x="${w * 0.22}" y="${h * 0.81}" font-weight="500" fill="#7A5848">Garanzia:</text>
      <text x="${w * 0.38}" y="${h * 0.81}" font-weight="400">Conformità Legale 24 Mesi • Standard UE</text>

      <!-- Row 6: ID Certificato -->
      <text x="${w * 0.22}" y="${h * 0.86}" font-weight="500" fill="#7A5848">ID Certificato:</text>
      <text x="${w * 0.38}" y="${h * 0.86}" font-weight="400">IP-MOISS-ROD-2026</text>
    </g>
  </svg>
  `;

  await sharp(baseCard)
    .composite([{ input: Buffer.from(rodioOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_rodio.webp'));
  await sharp(baseCard)
    .composite([{ input: Buffer.from(rodioOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_moissanite_rodio.jpg'));

  // 3. Variant: Argento 925 Classico (Demi-Fine / Pave)
  const argentoOverlaySvg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <!-- Clean patch over title and specifications -->
    <rect x="${w * 0.10}" y="${h * 0.50}" width="${w * 0.80}" height="${h * 0.40}" fill="#F4EAE4" />

    <!-- Title -->
    <text x="${w * 0.50}" y="${h * 0.54}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="600" letter-spacing="2" fill="#5C4033" text-anchor="middle">
      CERTIFICATO DI AUTENTICITÀ &amp; QUALITÀ — ARGENTO STERLING 925
    </text>

    <!-- Table content -->
    <g font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" fill="#3D312A">
      <!-- Row 1: Metallo Base -->
      <text x="${w * 0.22}" y="${h * 0.61}" font-weight="500" fill="#7A5848">Metallo Base:</text>
      <text x="${w * 0.38}" y="${h * 0.61}" font-weight="400">Argento Sterling 925 Nichel-Free (Punzone S925)</text>

      <!-- Row 2: Finitura / Placcatura -->
      <text x="${w * 0.22}" y="${h * 0.66}" font-weight="500" fill="#7A5848">Placcatura:</text>
      <text x="${w * 0.38}" y="${h * 0.66}" font-weight="400">Oro 18K (1.0 Micron) / Rodio Puro a Specchio</text>

      <!-- Row 3: Protezione -->
      <text x="${w * 0.22}" y="${h * 0.71}" font-weight="500" fill="#7A5848">Protezione:</text>
      <text x="${w * 0.38}" y="${h * 0.71}" font-weight="400">Nano-Sigillo E-Coating Anti-Ossidazione</text>

      <!-- Row 4: Punzone & Sigillo -->
      <text x="${w * 0.22}" y="${h * 0.76}" font-weight="500" fill="#7A5848">Sigillo:</text>
      <text x="${w * 0.38}" y="${h * 0.76}" font-weight="400">Marchio Legale di Fabbrica &amp; Monogramma IP</text>

      <!-- Row 5: Garanzia -->
      <text x="${w * 0.22}" y="${h * 0.81}" font-weight="500" fill="#7A5848">Garanzia:</text>
      <text x="${w * 0.38}" y="${h * 0.81}" font-weight="400">Conformità Legale 24 Mesi • Standard REACH</text>

      <!-- Row 6: ID Certificato -->
      <text x="${w * 0.22}" y="${h * 0.86}" font-weight="500" fill="#7A5848">ID Certificato:</text>
      <text x="${w * 0.38}" y="${h * 0.86}" font-weight="400">IP-S925-CERT-2026</text>
    </g>
  </svg>
  `;

  await sharp(baseCard)
    .composite([{ input: Buffer.from(argentoOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_argento925.webp'));
  await sharp(baseCard)
    .composite([{ input: Buffer.from(argentoOverlaySvg), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(path.resolve(process.cwd(), 'public/Brand/certificato_argento925.jpg'));

  console.log('✅ All 4 Certificate variants generated and exported successfully!');
}

generateAllCertificateVariants().catch(console.error);
