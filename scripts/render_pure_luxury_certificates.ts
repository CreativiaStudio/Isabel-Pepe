import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface CertificateSpec {
  id: string;
  filenameKey: string;
  titleSubtitle: string;
  rows: Array<{ label: string; value: string }>;
  certId: string;
}

const certificates: CertificateSpec[] = [
  // 1. ORO PERLA
  {
    id: 'oro_perla',
    filenameKey: 'oro_perla',
    titleSubtitle: 'PERLE NATURALI D\'ACQUA DOLCE &amp; ORO 18K',
    rows: [
      { label: 'Gemma', value: 'Perle Naturali d\'Acqua Dolce Coltivate (Selezione Manuale)' },
      { label: 'Metallo Base', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Placcatura', value: 'Placcatura Oro 18K da 1.0 Micron ad Alto Spessore' },
      { label: 'Protezione', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia Legale', value: '24 Mesi di Conformità Ufficiale • Standard Europei REACH' },
      { label: 'ID Certificato', value: 'IP-PL-ORO18K-2026' },
    ],
    certId: 'IP-PL-ORO18K-2026',
  },
  // 2. ORO MOISSANITE
  {
    id: 'oro_moissanite',
    filenameKey: 'oro_moissanite',
    titleSubtitle: 'MOISSANITE D-COLOR VVS1 &amp; ORO 18K',
    rows: [
      { label: 'Gemma Principale', value: 'Moissanite D-Color VVS1 (Report Gemmologico Ufficiale GRA)' },
      { label: 'Metallo Base', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Placcatura', value: 'Placcatura Oro 18K da 1.0 Micron ad Alto Spessore' },
      { label: 'Protezione', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia Legale', value: '24 Mesi di Conformità Ufficiale • Standard Europei REACH' },
      { label: 'ID Certificato', value: 'IP-MOISS-ORO18K-2026' },
    ],
    certId: 'IP-MOISS-ORO18K-2026',
  },
  // 3. RODIO MOISSANITE
  {
    id: 'rodio_moissanite',
    filenameKey: 'rodio_moissanite',
    titleSubtitle: 'MOISSANITE D-COLOR VVS1 &amp; RODIO PURO',
    rows: [
      { label: 'Gemma Principale', value: 'Moissanite D-Color VVS1 (Report Gemmologico Ufficiale GRA)' },
      { label: 'Metallo Base', value: 'Argento Sterling 925 Nichel-Free (Punzone S925 / IP)' },
      { label: 'Finitura di Prestigio', value: 'Placcatura in Rodio Puro a Specchio (Effetto Oro Bianco)' },
      { label: 'Protezione', value: 'Nano-Sigillo Molecolare E-Coating Anti-Ossidazione' },
      { label: 'Garanzia Legale', value: '24 Mesi di Conformità Ufficiale • Standard Europei REACH' },
      { label: 'ID Certificato', value: 'IP-MOISS-ROD-2026' },
    ],
    certId: 'IP-MOISS-ROD-2026',
  }
];

async function renderPureLuxuryCertificates() {
  console.log('Rendering 100% Pure Vector Luxury Certificate Cards (Zero Patches, 300 DPI)...');

  const W = 2100;
  const H = 1360;

  // Prepare tinted luxury logo PNG buffer
  const logoPath = path.resolve(process.cwd(), 'public/Brand/logotipo-isabel.png');
  const logoBuffer = await sharp(logoPath)
    .resize(280, 280, { fit: 'contain' })
    .toBuffer();

  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  for (const cert of certificates) {
    const tableRowsHtml = cert.rows.map((row, idx) => {
      const yPos = 810 + (idx * 75);
      return `
        <!-- Row ${idx + 1} -->
        <line x1="${W * 0.16}" y1="${yPos - 25}" x2="${W * 0.84}" y2="${yPos - 25}" stroke="#EADFD8" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="${W * 0.18}" y="${yPos + 10}" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" font-weight="600" letter-spacing="1.5" fill="#8C6558">
          ${row.label.toUpperCase()}
        </text>
        <text x="${W * 0.42}" y="${yPos + 10}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="400" fill="#2E221B">
          ${row.value}
        </text>
      `;
    }).join('\n');

    const cardSvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Luxury Cardstock Gradient -->
        <radialGradient id="cardBg" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#FAF5F0" />
          <stop offset="100%" stop-color="#F2E6DF" />
        </radialGradient>

        <!-- Rose Gold Metallic Gradient -->
        <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D4A79C" />
          <stop offset="50%" stop-color="#9C6B5E" />
          <stop offset="100%" stop-color="#D4A79C" />
        </linearGradient>

        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D8B5AB" />
          <stop offset="50%" stop-color="#B88A7D" />
          <stop offset="100%" stop-color="#D8B5AB" />
        </linearGradient>

        <!-- Drop shadow filter for logo -->
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#8A5A4D" flood-opacity="0.25" />
        </filter>
      </defs>

      <!-- 1. Background -->
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#cardBg)" />

      <!-- 2. Outer Luxury Double Border -->
      <rect x="50" y="50" width="${W - 100}" height="${H - 100}" fill="none" stroke="url(#borderGrad)" stroke-width="4" rx="4" />
      <rect x="68" y="68" width="${W - 136}" height="${H - 136}" fill="none" stroke="url(#borderGrad)" stroke-width="1.5" opacity="0.6" rx="2" />

      <!-- Corner Ornaments -->
      <g stroke="url(#borderGrad)" stroke-width="2" fill="none">
        <!-- Top Left -->
        <path d="M 85 130 L 85 85 L 130 85" />
        <circle cx="95" cy="95" r="4" fill="url(#roseGold)" />

        <!-- Top Right -->
        <path d="M ${W - 85} 130 L ${W - 85} 85 L ${W - 130} 85" />
        <circle cx="${W - 95}" cy="95" r="4" fill="url(#roseGold)" />

        <!-- Bottom Left -->
        <path d="M 85 ${H - 130} L 85 ${H - 85} L 130 ${H - 85}" />
        <circle cx="95" cy="${H - 95}" r="4" fill="url(#roseGold)" />

        <!-- Bottom Right -->
        <path d="M ${W - 85} ${H - 130} L ${W - 85} ${H - 85} L ${W - 130} ${H - 85}" />
        <circle cx="${W - 95}" cy="${H - 95}" r="4" fill="url(#roseGold)" />
      </g>

      <!-- 3. Logo Monogram with soft shadow -->
      <g filter="url(#softShadow)">
        <image href="${logoBase64}" x="${(W - 280) / 2}" y="120" width="280" height="280" />
      </g>

      <!-- 4. Brand Name -->
      <text x="${W / 2}" y="470" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="52" font-weight="700" letter-spacing="14" fill="#3D291F" text-anchor="middle">
        ISABEL PEPE
      </text>

      <text x="${W / 2}" y="520" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="20" font-weight="500" letter-spacing="8" fill="#8C6558" text-anchor="middle">
        ALTA GIOIELLERIA DEMI-FINE
      </text>

      <!-- 5. Decorative Divider -->
      <line x1="${W * 0.35}" y1="560" x2="${W * 0.65}" y2="560" stroke="url(#roseGold)" stroke-width="2" />
      <polygon points="${W / 2},555 ${W / 2 + 8},560 ${W / 2},565 ${W / 2 - 8},560" fill="url(#roseGold)" />

      <!-- 6. Certificate Title & Subtitle -->
      <text x="${W / 2}" y="630" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="34" font-weight="600" letter-spacing="4" fill="#3D291F" text-anchor="middle">
        CERTIFICATO DI AUTENTICITÀ &amp; GARANZIA
      </text>

      <text x="${W / 2}" y="680" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="26" font-weight="600" letter-spacing="3" fill="#9C6B5E" text-anchor="middle">
        ${cert.titleSubtitle}
      </text>

      <!-- 7. Specifications Table (Seamlessly Integrated) -->
      ${tableRowsHtml}
      <line x1="${W * 0.16}" y1="1235" x2="${W * 0.84}" y2="1235" stroke="#EADFD8" stroke-width="1.5" stroke-dasharray="3,3" />

      <!-- 8. Bottom Seal & Legal Conformity -->
      <text x="${W / 2}" y="1285" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="3" fill="#8C6558" text-anchor="middle">
        MARCHIO ITALIANO • CONFORME NORMATIVE EUROPEE REACH • TUTTI I DIRITTI RISERVATI
      </text>
    </svg>
    `;

    // 1. Export 300 DPI Print PNG
    const printFilename = `stampa_certificato_${cert.filenameKey}_300dpi.png`;
    await sharp(Buffer.from(cardSvg))
      .png()
      .toFile(path.resolve(process.cwd(), `public/Brand/${printFilename}`));

    // 2. Export Web WebP
    let webpFilename = '';
    if (cert.id === 'oro_perla') webpFilename = 'certificato_perle_card_clean.webp';
    if (cert.id === 'oro_moissanite') webpFilename = 'certificato_moissanite_oro18k.webp';
    if (cert.id === 'rodio_moissanite') webpFilename = 'certificato_moissanite_rodio.webp';

    await sharp(Buffer.from(cardSvg))
      .webp({ quality: 95 })
      .toFile(path.resolve(process.cwd(), `public/Brand/${webpFilename}`));

    // 3. Export Web JPG
    const jpgFilename = webpFilename.replace('.webp', '.jpg');
    await sharp(Buffer.from(cardSvg))
      .jpeg({ quality: 95 })
      .toFile(path.resolve(process.cwd(), `public/Brand/${jpgFilename}`));

    console.log(`✅ Pure luxury certificate generated: ${printFilename} & ${webpFilename}`);
  }

  console.log('🎉 ALL 3 MASTER CERTIFICATES RENDERED WITH ZERO PATCHES AND PURE LUXURY FINISH!');
}

renderPureLuxuryCertificates().catch(console.error);
