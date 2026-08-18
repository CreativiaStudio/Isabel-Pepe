import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateOgImages() {
  console.log('Generating Luxury OpenGraph Preview Images for WhatsApp / Socials...');

  const logoPath = path.join(process.cwd(), 'public', 'Brand', 'logotipo-isabel.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoResized = await sharp(logoBuffer)
    .resize(260, 260, { fit: 'contain' })
    .png()
    .toBuffer();

  const logoBase64 = `data:image/png;base64,${logoResized.toString('base64')}`;

  // 1. Standard 1200x630 OpenGraph Banner (WhatsApp Large / Facebook / Twitter / Telegram)
  const svgBanner = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cardBg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#FCFAF8"/>
          <stop offset="60%" stop-color="#F7F1EB"/>
          <stop offset="100%" stop-color="#ECE3DA"/>
        </radialGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8C6558"/>
          <stop offset="25%" stop-color="#D4A79C"/>
          <stop offset="50%" stop-color="#F2DCD7"/>
          <stop offset="75%" stop-color="#B8867C"/>
          <stop offset="100%" stop-color="#6E4A3F"/>
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#3D291F" flood-opacity="0.08"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#cardBg)"/>

      <!-- Outer Double Filigree Frame -->
      <rect x="36" y="36" width="1128" height="558" fill="none" stroke="url(#gold)" stroke-width="1.8" rx="16"/>
      <rect x="46" y="46" width="1108" height="538" fill="none" stroke="url(#gold)" stroke-width="0.8" stroke-dasharray="6,4" rx="12" opacity="0.75"/>

      <!-- Corner Ornaments -->
      <path d="M 46 64 L 64 64 L 64 46" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
      <path d="M 1154 64 L 1136 64 L 1136 46" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
      <path d="M 46 566 L 64 566 L 64 584" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
      <path d="M 1154 566 L 1136 566 L 1136 584" fill="none" stroke="url(#gold)" stroke-width="2.5"/>

      <!-- Official Logo Crest -->
      <g filter="url(#softShadow)">
        <image href="${logoBase64}" x="470" y="80" width="260" height="260" />
      </g>

      <!-- Typography -->
      <text x="600" y="380" font-family="'Cinzel', 'Playfair Display', 'Didot', 'Georgia', serif" font-size="44" font-weight="600" letter-spacing="10" fill="#221611" text-anchor="middle">
        ISABEL PEPE
      </text>

      <text x="600" y="420" font-family="'Cinzel', 'Playfair Display', 'Georgia', serif" font-size="14" font-weight="500" letter-spacing="8" fill="#8C6558" text-anchor="middle">
        ALTA GIOIELLERIA DEMI-FINE
      </text>

      <!-- Divider line -->
      <line x1="420" y1="445" x2="780" y2="445" stroke="url(#gold)" stroke-width="1" opacity="0.6"/>
      <circle cx="600" cy="445" r="3" fill="#B8867C"/>

      <!-- Specs and Tagline -->
      <text x="600" y="485" font-family="'Inter', -apple-system, sans-serif" font-size="18" font-weight="300" letter-spacing="2.5" fill="#4A3B32" text-anchor="middle">
        Argento Sterling 925 • Placcatura Oro 18K (1.0µm) • Moissanite Certificata GRA
      </text>

      <text x="600" y="525" font-family="'Inter', -apple-system, sans-serif" font-size="13" font-weight="400" letter-spacing="3" fill="#8C6558" text-anchor="middle">
        WWW.ISABELPEPE.COM
      </text>
    </svg>
  `;

  // Render 1200x630 JPEG (High Quality, ~180KB - Perfect for WhatsApp)
  await sharp(Buffer.from(svgBanner))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(process.cwd(), 'public', 'og-image.jpg'));

  // Also save to app/opengraph-image.jpg
  await sharp(Buffer.from(svgBanner))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(process.cwd(), 'app', 'opengraph-image.jpg'));

  console.log('✅ Generated public/og-image.jpg and app/opengraph-image.jpg');
}

generateOgImages().catch(console.error);
