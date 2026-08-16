import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runDetailedAudit() {
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sku', { ascending: true });

  if (error || !products) {
    console.error("DB error:", error);
    process.exit(1);
  }

  console.log(`Auditing ${products.length} products...\n`);

  const results: any[] = [];
  let violations = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const itemAudit: any = {
      index: i + 1,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      price: p.price,
      titleLen: p.seo_title?.length,
      descLen: p.seo_description?.length,
      hasStorytelling: false,
      hasMetalloBase: false,
      hasScudo: false,
      hasPietrePerle: false,
      hasCofanetto: false,
      hasDonazioneAnimali: false,
      hasMoissanite: false,
      hasMadeInItaly: false,
      issues: []
    };

    // 1. Title
    if (!p.seo_title) {
      itemAudit.issues.push("Missing seo_title");
      violations++;
    } else if (p.seo_title.length > 60) {
      itemAudit.issues.push(`seo_title > 60 chars (${p.seo_title.length})`);
      violations++;
    }

    // 2. Desc
    if (!p.seo_description) {
      itemAudit.issues.push("Missing seo_description");
      violations++;
    } else if (p.seo_description.length < 140 || p.seo_description.length > 155) {
      itemAudit.issues.push(`seo_description outside 140-155 (${p.seo_description.length})`);
      violations++;
    }

    // 3. Price
    if (Number(p.price) <= 0 || isNaN(Number(p.price))) {
      itemAudit.issues.push(`Invalid price: ${p.price}`);
      violations++;
    }

    // 4. Content bullets
    const desc = (p.description || '').toLowerCase();
    itemAudit.hasStorytelling = (p.description || '').split('\n\n').length >= 2;
    itemAudit.hasMetalloBase = desc.includes('argento sterling 925') || desc.includes('metallo base');
    itemAudit.hasScudo = desc.includes('doppio scudo protettivo') || desc.includes('e-coating');
    itemAudit.hasPietrePerle = desc.includes('pietre di pura luce') || desc.includes('perle naturali') || desc.includes('taglio brillante');
    itemAudit.hasCofanetto = desc.includes('packaging signature') || desc.includes('cofanetto rigido luxury');
    itemAudit.hasDonazioneAnimali = desc.includes("l'arte del dono") || desc.includes('cura e la salvaguardia degli animali');

    if (!itemAudit.hasMetalloBase || !itemAudit.hasScudo || !itemAudit.hasPietrePerle || !itemAudit.hasCofanetto || !itemAudit.hasDonazioneAnimali) {
      itemAudit.issues.push("Incomplete technical bullets in description");
      violations++;
    }

    // 5. Forbidden terms check
    const rawJson = JSON.stringify(p).toLowerCase();
    if (rawJson.includes('moissanite')) {
      itemAudit.hasMoissanite = true;
      itemAudit.issues.push("Moissanite found in record");
      violations++;
    }
    if (rawJson.includes('made in italy') || rawJson.includes('manifattura italiana') || rawJson.includes('alta oreficeria') || rawJson.includes('alta gioielleria italiana')) {
      itemAudit.hasMadeInItaly = true;
      itemAudit.issues.push("Made in Italy / Alta oreficeria found in record");
      violations++;
    }

    // 6. Slugs
    if (p.sku === 'ASB3142' && p.slug !== 'orecchini-riviere') {
      itemAudit.issues.push(`ASB3142 slug mismatch: ${p.slug}`);
      violations++;
    }
    if (p.sku === 'ASB4019' && p.slug !== 'bracciale-iconique') {
      itemAudit.issues.push(`ASB4019 slug mismatch: ${p.slug}`);
      violations++;
    }

    results.push(itemAudit);
  }

  console.table(results.map(r => ({
    '#': r.index,
    SKU: r.sku,
    Name: r.name,
    Slug: r.slug,
    Price: `€${Number(r.price).toFixed(2)}`,
    'T.Len': r.titleLen,
    'D.Len': r.descLen,
    Story: r.hasStorytelling ? '✅' : '❌',
    Shield: r.hasScudo ? '✅' : '❌',
    Box: r.hasCofanetto ? '✅' : '❌',
    Animal: r.hasDonazioneAnimali ? '✅' : '❌',
    Moiss: r.hasMoissanite ? '🚨' : '0',
    Italy: r.hasMadeInItaly ? '🚨' : '0',
    Issues: r.issues.join('; ') || 'NONE'
  })));

  console.log(`\nTotal violations: ${violations}`);
}

runDetailedAudit();
