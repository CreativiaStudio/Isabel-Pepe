import fs from 'fs';
import path from 'path';

/**
 * Ensures required certificate aliases exist in public/Brand/
 */
export function ensureCertificateAliases() {
  try {
    const brandDir = path.resolve(process.cwd(), 'public/Brand');
    const cleanWebp = path.join(brandDir, 'certificato_perle_card_clean.webp');
    const aliasWebp = path.join(brandDir, 'certificato_perle_oro18k.webp');
    if (fs.existsSync(cleanWebp) && !fs.existsSync(aliasWebp)) {
      fs.copyFileSync(cleanWebp, aliasWebp);
    }
    const cleanJpg = path.join(brandDir, 'certificato_perle_card_clean.jpg');
    const aliasJpg = path.join(brandDir, 'certificato_perle_oro18k.jpg');
    if (fs.existsSync(cleanJpg) && !fs.existsSync(aliasJpg)) {
      fs.copyFileSync(cleanJpg, aliasJpg);
    }
  } catch (e) {
    // Ignore in environments where fs is restricted
  }
}

// Auto-run on server-side import
ensureCertificateAliases();
