import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('Mancano le chiavi API nel file .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });

async function mergeSet() {
  console.log('Inizio merge Set Vivienne...');

  console.log('Eliminazione A180-NECKLACE e A180-EARRING...');
  await supabaseAdmin.from('products').delete().in('sku', ['A180-NECKLACE', 'A180-EARRING']);

  console.log('Creazione prodotto Stripe...');
  const stripeProduct = await stripe.products.create({
    name: 'Set Vivienne',
    metadata: { sku: 'A180-SET' }
  });

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: 27900,
    currency: 'eur',
  });

  console.log('Inserimento in Supabase...');
  const { error } = await supabaseAdmin.from('products').insert({
    sku: 'A180-SET',
    name: 'Set Vivienne',
    price: 279,
    stock: 2,
    category: 'Set',
    carats: 'Variabile',
    plating: 'Oro 18K 1um',
    gemstone: 'Moissanite con certificato GRA',
    description: 'Parure completa Set Vivienne. Include Collana e Orecchini abbinati a prezzo speciale.',
    materials: 'Argento 925 nichel free',
    stripe_product_id: stripeProduct.id,
    stripe_price_id: stripePrice.id,
    image_primary: '/Products/Collana Vivienne.jpg',
    image_secondary: '/Products/Orecchini Vivienne.jpg',
    is_active: false
  });

  if (error) {
    console.error('Errore nell\'inserimento:', error);
  } else {
    console.log('Set Vivienne creato con successo!');
  }
}

mergeSet();
