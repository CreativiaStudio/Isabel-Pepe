import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Logica per generare Slug SEO friendly
function generateSlug(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function run() {
  console.log("Inizio Ottimizzazione SEO Prodotti...");
  
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error) {
    console.error("Errore fetch:", error);
    return;
  }

  for (const product of products) {
    let seoTitle = '';
    let seoDesc = '';

    // Mappatura strategica focalizzata su "Lunga Durata" e "Placcatura"
    if (product.name.includes('Eden Rose')) {
      seoTitle = 'Collana Lunga Durata Placcata Oro 18K - Eden Rose | Isabel Pepe';
      seoDesc = "Scopri Eden Rose, la collana resistente all'annerimento con placcatura extra-spessa in Oro 18K. Design elegante, waterproof e perfetta per un regalo destinato a durare nel tempo.";
    } else if (product.name.includes('Vivienne')) {
      seoTitle = 'Set Gioielli Waterproof Placcati Oro 18K - Vivienne | Isabel Pepe';
      seoDesc = "Parure completa di alta gioielleria con placcatura spessa. Il Set Vivienne garantisce massima resistenza all'acqua e assenza di ossidazione. Lusso senza compromessi.";
    } else if (product.name.includes('Eclat Royal')) {
      seoTitle = 'Bracciale Rigido Lunga Durata Anti-Ossidazione - Eclat Royal';
      seoDesc = 'Bracciale Eclat Royal in Argento 925 con speciale trattamento protettivo. Ideale per chi cerca gioielli durevoli, eleganti e anallergici.';
    } else if (product.name.includes('Isabel Romance')) {
      seoTitle = 'Collana Romantica Placcata Oro Lunga Durata | Isabel Pepe';
      seoDesc = 'La collana Isabel Romance unisce un design raffinato a una placcatura extra-forte. Non si rovina, non annerisce la pelle e mantiene la sua lucentezza intatta.';
    } else if (product.category === 'Orecchini') {
      seoTitle = `Orecchini Anallergici Placcatura Spessa Oro 18K - ${product.name}`;
      seoDesc = `Orecchini eleganti e sicuri per la pelle. Realizzati in Argento 925 con placcatura potenziata per evitare usura e annerimento.`;
    } else if (product.category === 'Anelli') {
      seoTitle = `Anello Lunga Durata Resistente all'Acqua - ${product.name} | Isabel Pepe`;
      seoDesc = `Un anello prezioso progettato per la vita di tutti i giorni. Placcatura spessa e materiali premium per garantire che non perda mai il suo colore originale.`;
    } else {
      seoTitle = `Gioielli Lunga Durata in Argento e Oro 18K - ${product.name}`;
      seoDesc = `Scopri ${product.name}, il gioiello progettato per resistere nel tempo. Placcatura extra-spessa e design esclusivo Isabel Pepe.`;
    }

    const slug = generateSlug(`${product.category} lunga durata ${product.name}`);

    // Update the product
    const { error: updateError } = await supabaseAdmin.from('products')
      .update({
        seo_title: seoTitle,
        seo_description: seoDesc,
        slug: slug
      })
      .eq('id', product.id);
      
    if (updateError) {
      console.log(`Errore su ${product.name}:`, updateError.message);
    } else {
      console.log(`✅ Ottimizzato: ${product.name}`);
    }
  }
  
  console.log("Ottimizzazione completata con successo!");
}

run();
