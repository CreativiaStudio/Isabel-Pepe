import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEclipseAndAuditAll() {
  console.log('1. Fixing Collana Eclipse to Oro 18K in Supabase...');

  const descEclipse = `La collana Éclipse in Argento 925 con placcatura in Oro 18K simboleggia l'unione indissolubile attraverso cerchi intrecciati arricchiti da un micro-pavé in Moissanite GRA.

DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:
• Metallo Base: 100% Argento Sterling 925 anallergico nichel-free (certificato norme REACH UE).
• Placcatura Oro 18K ad Alto Spessore: Spessore certificato 1.0 Micron con finitura calda e dorata ad alta resistenza.
• Scudo Protettivo E-Coating: Nano-sigillo elettroforetico trasparente che isola il metallo da acqua, sudore, ossidazione e graffi.
• Pietre / Elementi: Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color) con indice di rifrazione superiore al diamante naturale.
• Sigillo di Autenticità: Incisione ufficiale con iniziali "IP" (Isabel Pepe) e punzone "S925" su ogni gioiello.
• Packaging Esclusivo: Cofanetto Luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Autenticità inclusi.
• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.`;

  const { error: updateError } = await supabase
    .from('products')
    .update({
      plating: 'Placcatura Oro 18K ad Alto Spessore (1.0 Micron • 20x vs Standard) + E-Coating',
      description: descEclipse,
      seo_title: 'Éclipse — Collana in Oro 18K & Argento 925 | Isabel Pepe',
      seo_description: 'Scopri la collana Éclipse di Isabel Pepe: cerchi in Argento 925 con placcatura Oro 18K (1.0µm) e nano-coating. Cofanetto regalo luxury e garanzia inclusi.'
    })
    .eq('slug', 'collana-eclipse');

  if (updateError) {
    console.error('Error updating Eclipse:', updateError);
  } else {
    console.log('✅ Collana Eclipse updated to ORO 18K in database successfully!');
  }

  // 2. Fetch and list all products to verify their plating
  const { data: products } = await supabase.from('products').select('slug, name, sku, plating, gemstone').order('name');
  console.log('\n=== COMPLETE PRODUCT PLATING & CERTIFICATE AUDIT ===');
  products?.forEach(p => {
    const isPearl = p.gemstone?.toLowerCase().includes('perl') || p.name?.toLowerCase().includes('perl');
    const isGold = isPearl || p.plating?.toLowerCase().includes('oro') || p.sku?.toLowerCase().includes('gold');
    const certType = isPearl ? '🦪 ORO PERLA' : isGold ? '💎 ORO MOISSANITE' : '💍 RODIO MOISSANITE';
    console.log(`[${p.slug}] ${p.name} -> ${certType} (${p.plating?.substring(0, 30)}...)`);
  });
}

fixEclipseAndAuditAll().catch(console.error);
