import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error("Mancano le chiavi API nel file .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });

async function runImport() {
  console.log("Inizio processo di importazione...");

  // 1. Leggi i dati
  const dataPath = path.resolve(__dirname, 'invoice_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const products = JSON.parse(rawData);
  console.log(`Trovati ${products.length} lotti di prodotti da importare.`);

  // 2. Pulizia: Cancella tutti i prodotti esistenti in Supabase
  console.log("Cancellazione dei prodotti demo esistenti...");
  const { error: delError } = await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.error("Errore durante la cancellazione:", delError.message);
    process.exit(1);
  }
  console.log("Database pulito.");

  // 3. Importazione progressiva
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
    // Formula di pricing: (Costo + 10) * 3
    const finalPrice = Math.round((p.cost + 10) * 3);
    
    console.log(`[${i+1}/${products.length}] Importazione: ${p.sku} - ${p.name} (Costo: $${p.cost} -> Prezzo: €${finalPrice})`);

    try {
      // Crea prodotto Stripe
      const stripeProduct = await stripe.products.create({
        name: p.name,
        metadata: { sku: p.sku }
      });

      // Crea prezzo Stripe
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: finalPrice * 100, // in centesimi
        currency: 'eur',
      });

      // Inserisci in Supabase
      const { error: dbError } = await supabaseAdmin.from('products').insert({
        sku: p.sku,
        name: p.name,
        price: finalPrice,
        stock: p.stock,
        category: p.category,
        carats: p.carats,
        plating: p.plating,
        gemstone: p.gemstone,
        description: 'Descrizione provvisoria da fattura.',
        materials: 'Argento 925 nichel free',
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        is_active: false // Nascosto
      });

      if (dbError) throw new Error(dbError.message);

    } catch (err: any) {
      console.error(`Errore nell'importazione di ${p.sku}:`, err.message);
    }
  }

  console.log("Importazione massiva completata con successo!");
}

runImport();
