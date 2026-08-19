import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function createTestProduct() {
  console.log('Creazione prodotto demo da 1 Euro...');

  const testProduct = {
    name: 'Test Prova Checkout Live',
    slug: 'test-prova-checkout-live',
    price: 1,
    stock: 99,
    category: 'Test',
    description: 'Prodotto di test ufficiale Isabel Pepe al costo simbolico di 1,00 € per verificare dal vivo i flussi di pagamento reale Stripe, carrello, consensi GDPR e tracciamento in modalità incognito.',
    materials: 'Argento Sterling 925 Nichel-Free',
    plating: 'Finitura in Rodio Puro a Specchio',
    gemstone: 'Moissanite Certificata GRA',
    image_primary: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-mon-amour-royale-slot2.webp',
    image_secondary: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-mon-amour-royale-slot1.webp',
    gallery: [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-mon-amour-royale-slot1.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-mon-amour-royale-slot2.webp'
    ],
    sku: 'TEST-01-EUR',
    is_active: true,
    seo_title: 'Test Prova Checkout Live (1€) | Isabel Pepe',
    seo_description: 'Test di acquisto reale da 1 Euro per verificare il checkout di Isabel Pepe.'
  };

  const { data, error } = await supabase
    .from('products')
    .upsert(testProduct, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    console.error('❌ Errore creazione prodotto:', error.message);
  } else {
    console.log('✅ PRODOTTO DA 1 EURO CREATO CON SUCCESSO!');
    console.log('   • ID:', data.id);
    console.log('   • Nome:', data.name);
    console.log('   • Prezzo: €' + data.price);
    console.log('   • URL Scheda Prodotto: http://localhost:3000/prodotto/' + data.slug);
    console.log('   • URL Online: https://www.isabelpepe.com/prodotto/' + data.slug);
  }
}

createTestProduct().catch(console.error);
