import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].replace(/['"\r]/g, '').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

// Simulates generateMetadata function from app/prodotto/[slug]/page.tsx
async function testGenerateMetadata(slug: string) {
  const { data: product } = await supabase
    .from('products')
    .select('name, category, seo_title, seo_description, image_primary')
    .eq('slug', slug)
    .single();

  if (!product) return { title: 'Gioiello non trovato | Isabel Pepe' };

  const title = product.seo_title || `${product.name} — Gioiello Demi-Fine in Argento 925 & Oro 18K | Isabel Pepe`;
  const description = product.seo_description || `Scopri ${product.name} di Isabel Pepe: creazione demi-fine in Argento 925 con doppio scudo protettivo, pietre di pura luce e cofanetto di lusso incluso.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image_primary ? [product.image_primary] : [],
    },
  };
}

async function runMetadataTests() {
  console.log("================================================================================");
  console.log("🧪 TESTING METADATA GENERATION FOR APP/PRODOTTO/[SLUG]");
  console.log("================================================================================");

  const slugsToTest = [
    'orecchini-riviere',
    'bracciale-iconique',
    'vendome-pearl',
    'collana-brera-gold',
    'collana-brera-silver',
    'set-versailles',
    'set-vivienne',
    'anello-constellation',
    'non-existent-slug-12345'
  ];

  for (const slug of slugsToTest) {
    const meta = await testGenerateMetadata(slug);
    console.log(`\nSlug: "${slug}"`);
    console.log(`  Title (${meta.title?.length} ch): "${meta.title}"`);
    console.log(`  Desc (${meta.description?.length || 0} ch): "${meta.description || 'N/A'}"`);
    console.log(`  OG Images: ${JSON.stringify(meta.openGraph?.images || [])}`);

    if (slug === 'non-existent-slug-12345') {
      if (meta.title === 'Gioiello non trovato | Isabel Pepe') {
        console.log("  ✅ 404 Fallback title handled cleanly.");
      } else {
        console.error("  ❌ 404 Fallback failed!");
      }
    } else {
      if (meta.title.length <= 60 && meta.description && meta.description.length >= 140 && meta.description.length <= 155) {
        console.log("  ✅ Dynamic metadata fully compliant.");
      } else {
        console.error("  ❌ Metadata length out of bounds!");
      }
    }
  }

  console.log("\n================================================================================");
  console.log("🧪 METADATA TEST SUITE COMPLETED");
  console.log("================================================================================");
}

runMetadataTests();
