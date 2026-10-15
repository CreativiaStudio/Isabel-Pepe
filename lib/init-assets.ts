import fs from 'fs';
import path from 'path';

/**
 * Ensures required certificate aliases exist in public/Brand/
 */
export function ensureCertificateAliases() {
  try {
    const brandDir = path.resolve(process.cwd(), 'public/Brand');
    const masterWebp = path.join(brandDir, 'certificato_perle_oro18k.webp');
    const legacyWebp = path.join(brandDir, 'certificato_perle_card_clean.webp');
    if (fs.existsSync(masterWebp)) {
      fs.copyFileSync(masterWebp, legacyWebp);
    }
    const masterJpg = path.join(brandDir, 'certificato_perle_oro18k.jpg');
    const legacyJpg = path.join(brandDir, 'certificato_perle_card_clean.jpg');
    if (fs.existsSync(masterJpg)) {
      fs.copyFileSync(masterJpg, legacyJpg);
    }
  } catch (e) {
    // Ignore in environments where fs is restricted
  }
}

// Auto-run on server-side import
ensureCertificateAliases();
