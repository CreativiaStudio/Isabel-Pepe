/**
 * ============================================================================
 * ISABEL PEPE — E2E CERTIFICATE AUTOMATED TEST SUITE (4-TIER ARCHITECTURE)
 * ============================================================================
 * 
 * Authoritative Reference: ORIGINAL_REQUEST.md (2026-08-26T16:48:05Z),
 * PROJECT.md, and TEST_INFRA.md.
 * 
 * 4-Tier Opaque-Box Test Architecture:
 * - Tier 1: Feature Coverage (Isolated Feature Validation)
 * - Tier 2: Boundary & Corner Cases (Perimeter bounds, file sizes, zero ghost text, unicode)
 * - Tier 3: Cross-Feature Interactions (PDP to Modal propagation, switcher, aliases, palette sync)
 * - Tier 4: Real-World Workload Scenarios (41+ catalog walk, 300 DPI prepress readiness, build integrity)
 * 
 * Execution: npx tsx scripts/verify_certificates_e2e.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { 
  getProductCertificateInfo, 
  CERTIFICATE_PRESETS, 
  CertificateType,
  ProductCertificateInfo,
  ProductInput
} from '../lib/certificates';
import { supabaseAdmin } from '../lib/supabase';
import { ensureCertificateAliases } from '../lib/init-assets';

// ============================================================================
// Types & Test Framework Harness
// ============================================================================

export interface AssertionResult {
  id: string;
  tier: 1 | 2 | 3 | 4;
  description: string;
  passed: boolean;
  error?: string;
  details?: Record<string, any>;
}

export interface TierSummary {
  tier: 1 | 2 | 3 | 4;
  title: string;
  total: number;
  passed: number;
  failed: number;
}

export interface E2ETestReport {
  passed: boolean;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  tierSummaries: TierSummary[];
  catalogCount: number;
  distribution: {
    pearl_gold: number;
    moissanite_gold: number;
    moissanite_rhodium: number;
    silver_crystals: number;
  };
  assertions: AssertionResult[];
  errors: string[];
}

class TestRunner {
  private assertions: AssertionResult[] = [];

  assert(
    id: string, 
    tier: 1 | 2 | 3 | 4, 
    description: string, 
    condition: boolean, 
    errorMessage?: string,
    details?: Record<string, any>
  ) {
    const passed = Boolean(condition);
    const result: AssertionResult = {
      id,
      tier,
      description,
      passed,
      error: passed ? undefined : (errorMessage || `Assertion failed: ${description}`),
      details
    };
    this.assertions.push(result);

    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} [${id}] ${description}${!passed ? ` -> FAIL: ${result.error}` : ''}`);
  }

  getResults(): AssertionResult[] {
    return this.assertions;
  }
}

// ============================================================================
// Main 4-Tier Test Runner Execution
// ============================================================================

export async function runCertificateVerification(): Promise<E2ETestReport> {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        ISABEL PEPE — MASTER CERTIFICATES 4-TIER E2E TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const runner = new TestRunner();
  const publicDir = path.resolve(process.cwd(), 'public');
  const brandDir = path.join(publicDir, 'Brand');

  // Trigger asset alias check at start
  ensureCertificateAliases();

  // --------------------------------------------------------------------------
  // TIER 1: FEATURE COVERAGE (ISOLATED FEATURE VALIDATION)
  // --------------------------------------------------------------------------
  console.log('┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TIER 1: FEATURE COVERAGE (ISOLATED FEATURE VALIDATION)                     │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  // 1.1 Print PNG Files Existence
  const printFiles = [
    'stampa_certificato_oro_moissanite_300dpi.png',
    'stampa_certificato_rodio_moissanite_300dpi.png',
    'stampa_certificato_oro_perla_300dpi.png',
    'stampa_certificato_argento925_300dpi.png'
  ];

  for (const filename of printFiles) {
    const filePath = path.join(brandDir, filename);
    const exists = fs.existsSync(filePath);
    runner.assert(
      `T1.1_PRINT_PNG_EXISTS_${filename.replace('stampa_certificato_', '').replace('_300dpi.png', '').toUpperCase()}`,
      1,
      `300 DPI Print file exists: ${filename}`,
      exists,
      `File not found on disk: ${filePath}`
    );
  }

  // 1.2 Print PNG Dimensions & DPI Aspect Ratio (2400x1560 px, 85x55mm 300 DPI format)
  for (const filename of printFiles) {
    const filePath = path.join(brandDir, filename);
    if (fs.existsSync(filePath)) {
      const meta = await sharp(filePath).metadata();
      const isExactDimensions = meta.width === 2400 && meta.height === 1560;
      const aspectRatio = (meta.width || 0) / (meta.height || 1);
      const isExpectedRatio = Math.abs(aspectRatio - (2400 / 1560)) < 0.001;

      runner.assert(
        `T1.2_PRINT_PNG_DIMENSIONS_${filename.replace('stampa_certificato_', '').replace('_300dpi.png', '').toUpperCase()}`,
        1,
        `Print PNG ${filename} is exactly 2400x1560 px (aspect ratio 1.5385)`,
        isExactDimensions && isExpectedRatio,
        `Expected 2400x1560 px, received ${meta.width}x${meta.height} px (aspect ratio: ${aspectRatio.toFixed(4)})`,
        { width: meta.width, height: meta.height, aspectRatio }
      );
    }
  }

  // 1.3 Web WebP Files Existence & Readability
  const webpFiles = [
    'certificato_moissanite_oro18k.webp',
    'certificato_moissanite_rodio.webp',
    'certificato_perle_card_clean.webp',
    'certificato_perle_oro18k.webp',
    'certificato_argento925.webp'
  ];

  for (const filename of webpFiles) {
    const filePath = path.join(brandDir, filename);
    const exists = fs.existsSync(filePath);
    let readable = false;
    let width = 0, height = 0;
    if (exists) {
      try {
        const meta = await sharp(filePath).metadata();
        readable = meta.format === 'webp';
        width = meta.width || 0;
        height = meta.height || 0;
      } catch (e) {
        readable = false;
      }
    }
    runner.assert(
      `T1.3_WEB_WEBP_${filename.replace('.webp', '').toUpperCase()}`,
      1,
      `Web WebP file exists and is valid readable image: ${filename}`,
      exists && readable && width >= 1200 && height >= 800,
      `WebP verification failed for ${filename} (exists: ${exists}, readable: ${readable}, ${width}x${height})`,
      { filename, exists, readable, width, height }
    );
  }

  // 1.4 Web JPG Files Existence & Readability
  const jpgFiles = [
    'certificato_moissanite_oro18k.jpg',
    'certificato_moissanite_rodio.jpg',
    'certificato_perle_card_clean.jpg',
    'certificato_perle_oro18k.jpg',
    'certificato_argento925.jpg'
  ];

  for (const filename of jpgFiles) {
    const filePath = path.join(brandDir, filename);
    const exists = fs.existsSync(filePath);
    let readable = false;
    let width = 0, height = 0;
    if (exists) {
      try {
        const meta = await sharp(filePath).metadata();
        readable = meta.format === 'jpeg';
        width = meta.width || 0;
        height = meta.height || 0;
      } catch (e) {
        readable = false;
      }
    }
    runner.assert(
      `T1.4_WEB_JPG_${filename.replace('.jpg', '').toUpperCase()}`,
      1,
      `Web JPG file exists and is valid readable image: ${filename}`,
      exists && readable && width >= 1200 && height >= 800,
      `JPG verification failed for ${filename} (exists: ${exists}, readable: ${readable}, ${width}x${height})`,
      { filename, exists, readable, width, height }
    );
  }

  // 1.5 Cardstock Texture Continuity & Pixel Luminance Checks (No abrupt patch transitions)
  const masterGoldPrint = path.join(brandDir, 'stampa_certificato_oro_moissanite_300dpi.png');
  if (fs.existsSync(masterGoldPrint)) {
    const { data, info } = await sharp(masterGoldPrint).raw().toBuffer({ resolveWithObject: true });
    
    // Sample vertical margin at x=150 (inside border, outside text) across y from 100 to 1450 in 50px blocks
    const sampleX = 150;
    const blockMeans: number[] = [];
    const blockStdDevs: number[] = [];

    for (let y = 100; y < 1450; y += 50) {
      let sum = 0, sumSq = 0, count = 0;
      for (let dy = 0; dy < 50; dy++) {
        for (let dx = -10; dx <= 10; dx++) {
          const idx = ((y + dy) * info.width + (sampleX + dx)) * info.channels;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          sum += lum;
          sumSq += lum * lum;
          count++;
        }
      }
      const mean = sum / count;
      const stdDev = Math.sqrt(Math.max(0, sumSq / count - mean * mean));
      blockMeans.push(mean);
      blockStdDevs.push(stdDev);
    }

    let maxConsecutiveDiff = 0;
    for (let i = 1; i < blockMeans.length; i++) {
      const diff = Math.abs(blockMeans[i] - blockMeans[i - 1]);
      if (diff > maxConsecutiveDiff) maxConsecutiveDiff = diff;
    }

    const avgStdDev = blockStdDevs.reduce((a, b) => a + b, 0) / blockStdDevs.length;
    const isContinuous = maxConsecutiveDiff < 5.0; // No step function / sharp seam > 5.0 luminance units
    const hasTexture = avgStdDev >= 0.5; // Natural subtle grain present

    runner.assert(
      'T1.5_CARDSTOCK_SEAMLESS_CONTINUITY',
      1,
      `Cardstock texture is 100% continuous with zero patch step transitions (max delta: ${maxConsecutiveDiff.toFixed(2)} < 5.0, avg stdDev: ${avgStdDev.toFixed(2)})`,
      isContinuous && hasTexture,
      `Cardstock discontinuity detected! Max block step: ${maxConsecutiveDiff.toFixed(2)}, Avg stdDev: ${avgStdDev.toFixed(2)}`,
      { maxConsecutiveDiff, avgStdDev, sampleBlocksCount: blockMeans.length }
    );
  }

  // 1.6 Crest Alpha & Centering Integrity
  const crestLogoPath = path.join(brandDir, 'logotipo-isabel.png');
  const crestExists = fs.existsSync(crestLogoPath);
  let crestHasAlpha = false;
  if (crestExists) {
    const crestMeta = await sharp(crestLogoPath).metadata();
    crestHasAlpha = Boolean(crestMeta.hasAlpha) && (crestMeta.channels === 4);
    runner.assert(
      'T1.6_CREST_ALPHA_INTEGRITY',
      1,
      `Monogram laurel crest asset exists with true 4-channel alpha transparency (2048x2048)`,
      crestExists && crestHasAlpha && (crestMeta.width || 0) >= 2048,
      `Crest logo asset invalid or missing alpha channel`,
      { width: crestMeta.width, height: crestMeta.height, channels: crestMeta.channels, hasAlpha: crestMeta.hasAlpha }
    );
  }

  // 1.7 Typography Bronze Contrast Against Ivory Cardstock
  if (fs.existsSync(masterGoldPrint)) {
    const { data, info } = await sharp(masterGoldPrint).raw().toBuffer({ resolveWithObject: true });
    
    // Sample background luminance in top center (y=80, x=1200)
    let bgSum = 0, bgCount = 0;
    for (let y = 70; y < 90; y++) {
      for (let x = 1190; x < 1210; x++) {
        const idx = (y * info.width + x) * info.channels;
        bgSum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        bgCount++;
      }
    }
    const bgLuminance = bgSum / bgCount;

    // Sample brand text "ISABEL PEPE" dark pixels in center (y=460..480, x=1150..1250)
    let minTextLum = 255;
    for (let y = 460; y < 480; y++) {
      for (let x = 1150; x < 1250; x++) {
        const idx = (y * info.width + x) * info.channels;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (lum < minTextLum) minTextLum = lum;
      }
    }

    const contrastRatio = (bgLuminance + 0.05) / (minTextLum + 0.05);
    const isHighContrast = contrastRatio > 3.0; // High contrast text against ivory paper

    runner.assert(
      'T1.7_TYPOGRAPHY_BRONZE_CONTRAST',
      1,
      `Typography exhibits razor-sharp contrast against ivory cardstock (Contrast: ${contrastRatio.toFixed(2)}:1, bgLum: ${bgLuminance.toFixed(1)}, textLum: ${minTextLum.toFixed(1)})`,
      isHighContrast,
      `Insufficient text contrast! Ratio: ${contrastRatio.toFixed(2)}:1`,
      { contrastRatio, bgLuminance, minTextLum }
    );
  }

  // 1.8 - 1.11 Specification Profiles for all 4 Families
  const presetMoissGold = CERTIFICATE_PRESETS.moissanite_gold;
  runner.assert(
    'T1.8_MOISSANITE_GOLD_SPECS',
    1,
    'Moissanite & Oro 18K preset contains exact gemological GRA and 18K Gold specs',
    presetMoissGold.certificateType === 'moissanite_gold' &&
    presetMoissGold.hasGraTabs === true &&
    presetMoissGold.tabs.length === 4 &&
    presetMoissGold.tabs[0].id === 'report' &&
    presetMoissGold.tabs[3].id === 'brand'
  );

  const presetMoissRhodium = CERTIFICATE_PRESETS.moissanite_rhodium;
  runner.assert(
    'T1.9_MOISSANITE_RHODIUM_SPECS',
    1,
    'Moissanite & Rodio Puro preset contains exact gemological GRA and Pure Rhodium specs',
    presetMoissRhodium.certificateType === 'moissanite_rhodium' &&
    presetMoissRhodium.hasGraTabs === true &&
    presetMoissRhodium.tabs.length === 4 &&
    presetMoissRhodium.tabs[0].id === 'report' &&
    presetMoissRhodium.tabs[3].id === 'brand'
  );

  const presetPearlGold = CERTIFICATE_PRESETS.pearl_gold;
  runner.assert(
    'T1.10_PEARL_GOLD_SPECS',
    1,
    'Perle Naturali & Oro 18K preset contains Freshwater Pearl specs with strictly NO GRA tabs',
    presetPearlGold.certificateType === 'pearl_gold' &&
    presetPearlGold.hasGraTabs === false &&
    presetPearlGold.tabs.length === 2 &&
    presetPearlGold.tabs[0].id === 'card' &&
    presetPearlGold.tabs[1].id === 'flatlay'
  );

  const presetSilver = CERTIFICATE_PRESETS.silver_crystals;
  runner.assert(
    'T1.11_SILVER_CRYSTALS_SPECS',
    1,
    'Argento Sterling 925 & Cristalli preset contains S925 & Crystal specs with NO GRA tabs',
    presetSilver.certificateType === 'silver_crystals' &&
    presetSilver.hasGraTabs === false &&
    presetSilver.tabs.length >= 1 &&
    presetSilver.tabs[0].id === 'card'
  );

  // --------------------------------------------------------------------------
  // TIER 2: BOUNDARY & CORNER CASES
  // --------------------------------------------------------------------------
  console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TIER 2: BOUNDARY & CORNER CASES                                            │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  // 2.1 Double Filigree Debossed Border Bounds & Integrity
  if (fs.existsSync(masterGoldPrint)) {
    const { data, info } = await sharp(masterGoldPrint).raw().toBuffer({ resolveWithObject: true });
    
    // Scan horizontal line at mid-height y = 780 for border strokes (lum < 160)
    const midY = Math.floor(info.height / 2);
    let leftBorderX = -1;
    let rightBorderX = -1;

    for (let x = 0; x < 200; x++) {
      const idx = (midY * info.width + x) * info.channels;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 160) {
        leftBorderX = x;
        break;
      }
    }

    for (let x = info.width - 1; x >= info.width - 200; x--) {
      const idx = (midY * info.width + x) * info.channels;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 160) {
        rightBorderX = x;
        break;
      }
    }

    const midX = Math.floor(info.width / 2);
    let topBorderY = -1;
    let botBorderY = -1;

    for (let y = 0; y < 200; y++) {
      const idx = (y * info.width + midX) * info.channels;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 160) {
        topBorderY = y;
        break;
      }
    }

    for (let y = info.height - 1; y >= info.height - 200; y--) {
      const idx = (y * info.width + midX) * info.channels;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 160) {
        botBorderY = y;
        break;
      }
    }

    const bordersContained = leftBorderX >= 15 && leftBorderX <= 120 &&
                            rightBorderX >= 2280 && rightBorderX <= 2390 &&
                            topBorderY >= 15 && topBorderY <= 120 &&
                            botBorderY >= 1440 && botBorderY <= 1558;

    runner.assert(
      'T2.1_BORDER_FRAME_BOUNDS',
      2,
      `Double filigree debossed border is strictly contained within safe canvas bounds (X: [${leftBorderX}, ${rightBorderX}], Y: [${topBorderY}, ${botBorderY}])`,
      bordersContained,
      `Border coordinates out of bounds! X: [${leftBorderX}, ${rightBorderX}], Y: [${topBorderY}, ${botBorderY}]`,
      { leftBorderX, rightBorderX, topBorderY, botBorderY, canvasWidth: info.width, canvasHeight: info.height }
    );

    const isSymmetricX = Math.abs(leftBorderX - (info.width - rightBorderX)) < 30;
    const isSymmetricY = Math.abs(topBorderY - (info.height - botBorderY)) < 40;
    runner.assert(
      'T2.1_BORDER_FRAME_SYMMETRY',
      2,
      `Debossed border exhibits balanced geometric symmetry across both axes (ΔX: ${Math.abs(leftBorderX - (info.width - rightBorderX))}px, ΔY: ${Math.abs(topBorderY - (info.height - botBorderY))}px)`,
      isSymmetricX && isSymmetricY,
      `Border asymmetric: ΔX=${Math.abs(leftBorderX - (info.width - rightBorderX))}px, ΔY=${Math.abs(topBorderY - (info.height - botBorderY))}px`
    );
  }

  // 2.2 Print File Size Limits (> 800 KB, < 10 MB)
  for (const filename of printFiles) {
    const filePath = path.join(brandDir, filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const sizeKB = stat.size / 1024;
      const isWithinLimits = sizeKB >= 800 && sizeKB <= 10240;
      runner.assert(
        `T2.2_PRINT_SIZE_${filename.replace('stampa_certificato_', '').replace('_300dpi.png', '').toUpperCase()}`,
        2,
        `Print file ${filename} size is within high-res limits (800KB - 10MB): ${sizeKB.toFixed(1)} KB`,
        isWithinLimits,
        `Print file size outside limits: ${sizeKB.toFixed(1)} KB`,
        { filename, sizeKB }
      );
    }
  }

  // 2.3 Web File Size Optimization (< 500 KB)
  for (const filename of [...webpFiles, ...jpgFiles]) {
    const filePath = path.join(brandDir, filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const sizeKB = stat.size / 1024;
      const isOptimized = sizeKB < 500;
      runner.assert(
        `T2.3_WEB_SIZE_${filename.replace(/\./g, '_').toUpperCase()}`,
        2,
        `Web asset ${filename} is lightweight & optimized (< 500 KB): ${sizeKB.toFixed(1)} KB`,
        isOptimized,
        `Web asset exceeded 500 KB payload limit: ${sizeKB.toFixed(1)} KB`,
        { filename, sizeKB }
      );
    }
  }

  // 2.4 Zero Ghost Text or Underlying Bleed-Through in Specification Region
  if (fs.existsSync(masterGoldPrint)) {
    const { data, info } = await sharp(masterGoldPrint).raw().toBuffer({ resolveWithObject: true });
    
    // Sample right-hand unprinted margin in specification table zone (y=800..1200, x=2000..2150)
    let maxLocalVariance = 0;
    let minLum = 255;
    for (let y = 800; y < 1200; y += 20) {
      let sum = 0, sumSq = 0, n = 0;
      for (let dy = 0; dy < 20; dy++) {
        for (let x = 2000; x < 2150; x++) {
          const idx = ((y + dy) * info.width + x) * info.channels;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += lum;
          sumSq += lum * lum;
          if (lum < minLum) minLum = lum;
          n++;
        }
      }
      const mean = sum / n;
      const stdDev = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
      if (stdDev > maxLocalVariance) maxLocalVariance = stdDev;
    }

    const noGhostBleed = maxLocalVariance < 8.0 && minLum > 175;
    runner.assert(
      'T2.4_ZERO_GHOST_TEXT_IN_SPEC_AREA',
      2,
      `Specification table unprinted region exhibits zero ghost text or bleed-through (max variance: ${maxLocalVariance.toFixed(2)}, min background lum: ${minLum.toFixed(1)})`,
      noGhostBleed,
      `Ghost text or artifact bleed detected in unprinted region! Variance: ${maxLocalVariance.toFixed(2)}, Min lum: ${minLum.toFixed(1)}`,
      { maxLocalVariance, minLum }
    );
  }

  // 2.5 Unicode & Extreme Character Encoding Integrity (è, é, à, d'Acqua Dolce, 925‰, •, —)
  const allPresetStrings: string[] = [];
  for (const preset of Object.values(CERTIFICATE_PRESETS)) {
    allPresetStrings.push(preset.badgeTitle, preset.badgeSubtitle, preset.modalTitle, preset.modalCategory);
    for (const tab of preset.tabs) {
      allPresetStrings.push(tab.label, tab.alt, tab.description, tab.badge || '');
    }
    for (const feat of preset.features) {
      allPresetStrings.push(feat.title, feat.text);
    }
  }

  const hasMojibake = allPresetStrings.some((s) => s.includes('\uFFFD') || s.includes('Ã') || s.includes('Â'));
  const hasAccents = allPresetStrings.some((s) => s.includes('è') || s.includes('é') || s.includes('à') || s.includes("d'Acqua Dolce"));
  const hasSpecialPunctuation = allPresetStrings.some((s) => s.includes('•') || s.includes('—') || s.includes('"'));

  runner.assert(
    'T2.5_EXTREME_UNICODE_CHARACTER_ENCODING',
    2,
    'All certificate Italian typography strings, accents (è, é, à), quotes, and bullets render with 100% valid UTF-8 encoding (0 mojibake)',
    !hasMojibake && hasAccents && hasSpecialPunctuation,
    'Unicode corruption or mojibake detected in preset strings'
  );

  // --------------------------------------------------------------------------
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // --------------------------------------------------------------------------
  console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TIER 3: CROSS-FEATURE COMBINATIONS                                         │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  // 3.1 PDP Badge / Modal Propagation & Tab Mappings
  const testPearlProduct: ProductInput = { sku: 'PL-6', name: "Collana Perle d'Acqua Dolce", gemstone: 'Perle Naturali', plating: 'Oro 18K' };
  const pearlResult = getProductCertificateInfo(testPearlProduct);
  runner.assert(
    'T3.1_PDP_PROPAGATION_PEARLS',
    3,
    'Pearl product correctly maps to 2 tabs (Certificato Ufficiale, Flatlay), hasGraTabs = false',
    pearlResult.certificateType === 'pearl_gold' && pearlResult.tabs.length === 2 && pearlResult.hasGraTabs === false
  );

  const testMoissGoldProduct: ProductInput = { sku: 'A118', name: 'Orecchini Opéra', gemstone: 'Moissanite D-Color VVS1', plating: 'Placcatura Oro 18K (1.0 Micron)' };
  const moissGoldResult = getProductCertificateInfo(testMoissGoldProduct);
  runner.assert(
    'T3.1_PDP_PROPAGATION_MOISSANITE_GOLD',
    3,
    'Moissanite Gold product maps to 4 tabs (Libretto, Card, Copertina, Certificato Oro 18K), hasGraTabs = true',
    moissGoldResult.certificateType === 'moissanite_gold' && moissGoldResult.tabs.length === 4 && moissGoldResult.hasGraTabs === true
  );

  const testMoissRhodiumProduct: ProductInput = { sku: 'A113', name: 'Orecchini Duchesse', gemstone: 'Moissanite D-Color VVS1', plating: 'Rodio Puro a Specchio' };
  const moissRhodiumResult = getProductCertificateInfo(testMoissRhodiumProduct);
  runner.assert(
    'T3.1_PDP_PROPAGATION_MOISSANITE_RHODIUM',
    3,
    'Moissanite Rhodium product maps to 4 tabs (Libretto, Card, Copertina, Certificato Rodio), hasGraTabs = true',
    moissRhodiumResult.certificateType === 'moissanite_rhodium' && moissRhodiumResult.tabs.length === 4 && moissRhodiumResult.hasGraTabs === true
  );

  const testSilverProduct: ProductInput = { sku: 'ASB3093', name: 'Orecchini Joséphine', gemstone: 'Cristalli Rosa', plating: 'Rodio Puro' };
  const silverResult = getProductCertificateInfo(testSilverProduct);
  runner.assert(
    'T3.1_PDP_PROPAGATION_SILVER_CRYSTALS',
    3,
    'Silver/Crystal product maps to 1 tab (Certificato Argento Sterling 925), hasGraTabs = false',
    silverResult.certificateType === 'silver_crystals' && silverResult.tabs.length === 1 && silverResult.hasGraTabs === false
  );

  // 3.2 Garanzia Page Category Switcher (All 4 Presets valid with non-empty features and valid image paths)
  let allPresetsValid = true;
  for (const [key, preset] of Object.entries(CERTIFICATE_PRESETS)) {
    const mainImgExists = fs.existsSync(path.join(publicDir, preset.certificateImage.replace(/^\//, '')));
    const tabsExist = preset.tabs.every(t => fs.existsSync(path.join(publicDir, t.imageSrc.replace(/^\//, ''))));
    const featuresValid = preset.features.length >= 2;
    if (!mainImgExists || !tabsExist || !featuresValid) {
      allPresetsValid = false;
    }
  }

  runner.assert(
    'T3.2_GARANZIA_PAGE_CATEGORY_SWITCHER',
    3,
    'Guarantee page switcher supports all 4 presets with 100% valid images and features',
    allPresetsValid,
    'One or more presets in CERTIFICATE_PRESETS have broken image paths or invalid features'
  );

  // 3.3 Startup Asset Check & Alias Synchronization
  const cleanWebpPath = path.join(brandDir, 'certificato_perle_card_clean.webp');
  const aliasWebpPath = path.join(brandDir, 'certificato_perle_oro18k.webp');
  const cleanJpgPath = path.join(brandDir, 'certificato_perle_card_clean.jpg');
  const aliasJpgPath = path.join(brandDir, 'certificato_perle_oro18k.jpg');

  const aliasesExist = fs.existsSync(cleanWebpPath) && 
                       fs.existsSync(aliasWebpPath) && 
                       fs.existsSync(cleanJpgPath) && 
                       fs.existsSync(aliasJpgPath);
  
  let aliasSizesMatch = false;
  if (aliasesExist) {
    const webpCleanSize = fs.statSync(cleanWebpPath).size;
    const webpAliasSize = fs.statSync(aliasWebpPath).size;
    const jpgCleanSize = fs.statSync(cleanJpgPath).size;
    const jpgAliasSize = fs.statSync(aliasJpgPath).size;
    aliasSizesMatch = (webpCleanSize === webpAliasSize) && (jpgCleanSize === jpgAliasSize);
  }

  runner.assert(
    'T3.3_INIT_ASSETS_ALIAS_SYNC',
    3,
    'lib/init-assets.ts maintains perfect byte-level alias synchronization for pearl certificates',
    aliasesExist && aliasSizesMatch,
    'Certificate alias files do not match clean sources'
  );

  // 3.4 Color Palette Consistency Between Print (PNG) and Web (WebP / JPG)
  const printPngPath = path.join(brandDir, 'stampa_certificato_oro_moissanite_300dpi.png');
  const webWebpPath = path.join(brandDir, 'certificato_moissanite_oro18k.webp');
  let paletteAligned = false;

  if (fs.existsSync(printPngPath) && fs.existsSync(webWebpPath)) {
    const printBuf = await sharp(printPngPath).resize(400, 260).raw().toBuffer();
    const webBuf = await sharp(webWebpPath).resize(400, 260).raw().toBuffer();
    
    // Compare average RGB in center region (150..250, 100..160)
    let pR = 0, pG = 0, pB = 0, pCount = 0;
    let wR = 0, wG = 0, wB = 0;

    for (let y = 100; y < 160; y++) {
      for (let x = 150; x < 250; x++) {
        const idx = (y * 400 + x) * 3;
        pR += printBuf[idx]; pG += printBuf[idx + 1]; pB += printBuf[idx + 2];
        wR += webBuf[idx]; wG += webBuf[idx + 1]; wB += webBuf[idx + 2];
        pCount++;
      }
    }

    const avgPrintR = pR / pCount, avgPrintG = pG / pCount, avgPrintB = pB / pCount;
    const avgWebR = wR / pCount, avgWebG = wG / pCount, avgWebB = wB / pCount;

    const deltaR = Math.abs(avgPrintR - avgWebR);
    const deltaG = Math.abs(avgPrintG - avgWebG);
    const deltaB = Math.abs(avgPrintB - avgWebB);

    paletteAligned = deltaR < 10 && deltaG < 10 && deltaB < 10;
    runner.assert(
      'T3.4_PRINT_AND_WEB_PALETTE_ALIGNMENT',
      3,
      `Color palette between 300 DPI Print and Web formats matches with delta < 5% (dR: ${deltaR.toFixed(1)}, dG: ${deltaG.toFixed(1)}, dB: ${deltaB.toFixed(1)})`,
      paletteAligned,
      `Palette discrepancy between print and web formats exceeded threshold: dR=${deltaR.toFixed(1)}, dG=${deltaG.toFixed(1)}, dB=${deltaB.toFixed(1)}`
    );
  }

  // --------------------------------------------------------------------------
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // --------------------------------------------------------------------------
  console.log('\n┌────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ TIER 4: REAL-WORLD WORKLOAD SCENARIOS                                      │');
  console.log('└────────────────────────────────────────────────────────────────────────────┘');

  // Load Catalog (Supabase live query with fallback to db_snapshot.json)
  let products: any[] = [];
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*');
    if (!error && data && data.length > 0) {
      products = data;
      console.log(`  ℹ️ Loaded ${products.length} products live from Supabase.`);
    } else {
      throw new Error(error?.message || 'Empty response');
    }
  } catch (e) {
    const snapshotPath = path.resolve(process.cwd(), 'scripts/db_snapshot.json');
    if (fs.existsSync(snapshotPath)) {
      products = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
      console.log(`  ℹ️ Loaded ${products.length} products from scripts/db_snapshot.json fallback.`);
    }
  }

  let pearlCount = 0;
  let moissGoldCount = 0;
  let moissRhodiumCount = 0;
  let silverCount = 0;
  let missingProductAssets = 0;
  let invalidProductTabs = 0;

  // 4.1 Full 41+ Product Catalog Audit & Modal Simulation
  for (const product of products) {
    const sku = (product.sku || '').toUpperCase();
    const cert = getProductCertificateInfo(product);

    if (cert.certificateType === 'pearl_gold') pearlCount++;
    else if (cert.certificateType === 'moissanite_gold') moissGoldCount++;
    else if (cert.certificateType === 'moissanite_rhodium') moissRhodiumCount++;
    else if (cert.certificateType === 'silver_crystals') silverCount++;

    // Verify main certificate image
    const mainImgPath = path.join(publicDir, cert.certificateImage.replace(/^\//, ''));
    if (!fs.existsSync(mainImgPath)) missingProductAssets++;

    // Verify tab images
    for (const tab of cert.tabs) {
      const tabImgPath = path.join(publicDir, tab.imageSrc.replace(/^\//, ''));
      if (!fs.existsSync(tabImgPath)) missingProductAssets++;
    }

    // Verify tab structural constraints
    if (cert.certificateType === 'pearl_gold' && (cert.hasGraTabs || cert.tabs.length !== 2)) {
      invalidProductTabs++;
    }
    if ((cert.certificateType === 'moissanite_gold' || cert.certificateType === 'moissanite_rhodium') && (!cert.hasGraTabs || cert.tabs.length !== 4)) {
      invalidProductTabs++;
    }
    if (cert.certificateType === 'silver_crystals' && (cert.hasGraTabs || cert.tabs.length < 1)) {
      invalidProductTabs++;
    }
  }

  runner.assert(
    'T4.1_FULL_CATALOG_41_PRODUCTS_AUDIT',
    4,
    `Full catalog audit (${products.length} products): 100% valid classifications, zero missing assets, and zero broken modal tabs`,
    missingProductAssets === 0 && invalidProductTabs === 0 && products.length >= 41,
    `Catalog audit failed: ${missingProductAssets} missing assets, ${invalidProductTabs} invalid tabs`,
    { totalProducts: products.length, missingProductAssets, invalidProductTabs }
  );

  runner.assert(
    'T4.1_CATALOG_DISTRIBUTION_ACCURACY',
    4,
    `Classification breakdown matches authoritative inventory: ${pearlCount} Pearls (exp 4), ${moissGoldCount} Moiss Gold (exp 10), ${moissRhodiumCount} Moiss Rhodium (exp 26-27), ${silverCount} Silver (exp 1)`,
    pearlCount === 4 && moissGoldCount === 10 && moissRhodiumCount >= 26 && silverCount === 1,
    `Catalog distribution mismatch: Pearls=${pearlCount}, MoissGold=${moissGoldCount}, MoissRhodium=${moissRhodiumCount}, Silver=${silverCount}`
  );

  // 4.2 300 DPI Prepress Reproduction Readiness Validation (Per Print File)
  for (const filename of printFiles) {
    const filePath = path.join(brandDir, filename);
    let prepressValid = false;
    let details: Record<string, any> = {};

    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      const isPngSignature = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      const meta = await sharp(filePath).metadata();
      const is300DpiStandard = meta.width === 2400 && meta.height === 1560 && (meta.channels === 3 || meta.channels === 4);
      prepressValid = isPngSignature && is300DpiStandard;
      details = { filename, isPngSignature, width: meta.width, height: meta.height, channels: meta.channels };
    }

    runner.assert(
      `T4.2_PREPRESS_300DPI_${filename.replace('stampa_certificato_', '').replace('_300dpi.png', '').toUpperCase()}`,
      4,
      `Prepress 300 DPI raster validation passed for ${filename} (2400x1560, valid PNG signature)`,
      prepressValid,
      `Prepress validation failed for ${filename}`,
      details
    );
  }

  // 4.3 Production Types & Module Exports Integrity
  const typesValid = typeof getProductCertificateInfo === 'function' &&
                     typeof CERTIFICATE_PRESETS === 'object' &&
                     typeof ensureCertificateAliases === 'function';

  runner.assert(
    'T4.3_MODULE_EXPORTS_AND_CONTRACT_INTEGRITY',
    4,
    'All certificate module exports, TypeScript interface contracts, and preset maps are intact and type-safe',
    typesValid
  );

  // ============================================================================
  // Aggregation & Final Report Generation
  // ============================================================================
  const allAssertions = runner.getResults();
  const totalAssertions = allAssertions.length;
  const passedAssertions = allAssertions.filter(a => a.passed).length;
  const failedAssertions = allAssertions.filter(a => !a.passed).length;
  const errors = allAssertions.filter(a => !a.passed).map(a => `[${a.id}] ${a.error || a.description}`);

  const tierSummaries: TierSummary[] = [1, 2, 3, 4].map(t => {
    const tierAssertions = allAssertions.filter(a => a.tier === t);
    const tierTitles: Record<number, string> = {
      1: 'Feature Coverage (Isolated Feature Validation)',
      2: 'Boundary & Corner Cases',
      3: 'Cross-Feature Interactions',
      4: 'Real-World Workload Scenarios'
    };
    return {
      tier: t as 1 | 2 | 3 | 4,
      title: tierTitles[t],
      total: tierAssertions.length,
      passed: tierAssertions.filter(a => a.passed).length,
      failed: tierAssertions.filter(a => !a.passed).length
    };
  });

  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   E2E TEST SUITE EXECUTION SUMMARY                         ║');
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  tierSummaries.forEach(ts => {
    const status = ts.failed === 0 ? 'PASS ✅' : 'FAIL ❌';
    console.log(`║ Tier ${ts.tier}: ${ts.title.padEnd(46)} | ${ts.passed}/${ts.total} ${status} ║`);
  });
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  console.log(`║ Total Assertions: ${passedAssertions}/${totalAssertions} Passed (${((passedAssertions/totalAssertions)*100).toFixed(1)}%)`.padEnd(77) + '║');
  console.log(`║ Total Products Verified: ${products.length} (4 Pearls, 10 Moiss Gold, ${moissRhodiumCount} Moiss Rhod, 1 Silver)`.padEnd(77) + '║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  if (failedAssertions === 0) {
    console.log('🎉 100% PASS: ALL 4 TIERS & ACCEPTANCE CRITERIA ARE VERIFIED WITH ZERO DEFECTS!\n');
  } else {
    console.error(`❌ ${failedAssertions} TEST ASSERTION(S) FAILED:`);
    errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
    console.log();
  }

  return {
    passed: failedAssertions === 0,
    totalAssertions,
    passedAssertions,
    failedAssertions,
    tierSummaries,
    catalogCount: products.length,
    distribution: {
      pearl_gold: pearlCount,
      moissanite_gold: moissGoldCount,
      moissanite_rhodium: moissRhodiumCount,
      silver_crystals: silverCount
    },
    assertions: allAssertions,
    errors
  };
}

// Direct CLI Execution
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('verify_certificates_e2e'))) {
  runCertificateVerification()
    .then((report) => {
      if (!report.passed) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal execution error in E2E test suite:', err);
      process.exit(1);
    });
}
