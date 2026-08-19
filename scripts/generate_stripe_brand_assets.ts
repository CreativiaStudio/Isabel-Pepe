import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateStripeBrandAssets() {
  console.log('--- 🎨 GENERAZIONE ASSET BRANDING PER STRIPE ---');

  const brandDir = path.join(process.cwd(), 'public', 'Brand');
  const iconPath = path.join(brandDir, 'stripe_icon_isabel_pepe.png');
  const logoPath = path.join(brandDir, 'stripe_logo_isabel_pepe.png');

  // 1. GENERAZIONE ICONA QUADRATA 512x512 (Monogramma IP Rosa Champagne)
  const iconSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="champagneGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8A5E58" />
        <stop offset="30%" stop-color="#C0A09A" />
        <stop offset="50%" stop-color="#FDF4F0" />
        <stop offset="70%" stop-color="#C0A09A" />
        <stop offset="100%" stop-color="#8A5E58" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#8A5E58" flood-opacity="0.18"/>
      </filter>
    </defs>
    
    <!-- Background Circle -->
    <rect width="512" height="512" rx="128" fill="#FFFFFF"/>
    <rect x="16" y="16" width="480" height="480" rx="112" fill="#FAF7F5" stroke="#EADFD9" stroke-width="2"/>
    
    <!-- Inner Monogram IP -->
    <g filter="url(#shadow)">
      <circle cx="256" cy="256" r="190" fill="none" stroke="url(#champagneGold)" stroke-width="4"/>
      <circle cx="256" cy="256" r="178" fill="none" stroke="#C0A09A" stroke-width="1" stroke-dasharray="4 6"/>
      
      <!-- IP Letters -->
      <text x="256" y="295" font-family="'Cinzel', 'Playfair Display', 'Bodoni MT', 'Didot', 'Georgia', serif" font-size="160" font-weight="600" letter-spacing="4" text-anchor="middle" fill="url(#champagneGold)">
        IP
      </text>
      <text x="256" y="345" font-family="'Montserrat', 'Helvetica', 'Arial', sans-serif" font-size="20" font-weight="500" letter-spacing="12" text-anchor="middle" fill="#8A5E58">
        ISABEL PEPE
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(iconSvg))
    .png({ quality: 95 })
    .toFile(iconPath);

  console.log('✅ Icona Stripe generata:', iconPath, `(${fs.statSync(iconPath).size / 1024} KB)`);

  // 2. GENERAZIONE LOGO ORIZZONTALE 1000x280 (Logo Completo)
  const logoSvg = `
  <svg width="1000" height="280" viewBox="0 0 1000 280" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="champagneGoldLogo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8A5E58" />
        <stop offset="25%" stop-color="#C0A09A" />
        <stop offset="50%" stop-color="#FFF5F2" />
        <stop offset="75%" stop-color="#C0A09A" />
        <stop offset="100%" stop-color="#8A5E58" />
      </linearGradient>
      <linearGradient id="darkBronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A1A1A" />
        <stop offset="100%" stop-color="#2D2424" />
      </linearGradient>
    </defs>
    
    <!-- Transparent Background with subtle safe padding -->
    <rect width="1000" height="280" fill="transparent"/>

    <!-- Left IP Emblem -->
    <g transform="translate(100, 140)">
      <circle cx="0" cy="0" r="75" fill="#FAF6F4" stroke="url(#champagneGoldLogo)" stroke-width="3"/>
      <circle cx="0" cy="0" r="68" fill="none" stroke="#C0A09A" stroke-width="1" stroke-dasharray="3 4"/>
      <text x="0" y="20" font-family="'Cinzel', 'Playfair Display', 'Bodoni MT', serif" font-size="62" font-weight="600" letter-spacing="2" text-anchor="middle" fill="url(#champagneGoldLogo)">
        IP
      </text>
    </g>

    <!-- Main Typography -->
    <g transform="translate(230, 0)">
      <text x="0" y="145" font-family="'Cinzel', 'Playfair Display', 'Didot', 'Georgia', serif" font-size="68" font-weight="600" letter-spacing="14" fill="#1A1A1A">
        ISABEL PEPE
      </text>
      <text x="5" y="195" font-family="'Montserrat', 'Helvetica', 'Arial', sans-serif" font-size="18" font-weight="400" letter-spacing="16" fill="#8A5E58">
        ALTA GIOIELLERIA ITALIANA
      </text>
      <line x1="5" y1="215" x2="480" y2="215" stroke="url(#champagneGoldLogo)" stroke-width="1.5" />
    </g>
  </svg>
  `;

  await sharp(Buffer.from(logoSvg))
    .png({ quality: 95 })
    .toFile(logoPath);

  console.log('✅ Logo Stripe generato:', logoPath, `(${fs.statSync(logoPath).size / 1024} KB)`);
  console.log('\n🎉 Entrambi i file PNG sono pronti per essere caricati su Stripe!');
}

generateStripeBrandAssets().catch(console.error);
