import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function restoreSweetRomance() {
  const payload = {
    name: 'Set Sweet Romance',
    description: "Il bracciale Sweet Romance unisce perle naturali d'acqua dolce selezionate da 7.5-8 mm a una chiusura in Argento 925 con placcatura Oro 18K da 1 Micron.\n\nDETTAGLI ESCLUSIVI & ARTIGIANALITÀ:\n• Metallo Base: 100% Argento Sterling 925 anallergico nichel-free (certificato norme REACH UE).\n• Placcatura Oro 18K (1.0 Micron): Spessore 20 volte superiore alla media per un colore dorato caldo e duraturo nel tempo.\n• Scudo Protettivo E-Coating: Nano-sigillo elettroforetico trasparente che isola il metallo da acqua, sudore, ossidazione e graffi.\n• Pietre / Elementi: Perle Naturali d'Acqua Dolce di Grado Superiore selezionate a mano per purezza e lucentezza.\n• Sigillo di Autenticità: Incisione ufficiale con iniziali \"IP\" (Isabel Pepe) e punzone \"S925\" su ogni gioiello.\n• Packaging Esclusivo: Cofanetto Luxury Isabel Pepe e panno speciale in microfibra inclusi in ogni ordine.\n• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.",
    price: 295,
    stock: 4,
    category: 'Bracciali',
    image_primary: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-sweet-romance-slot2.webp',
    image_secondary: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-sweet-romance-slot1.webp',
    materials: 'Argento Sterling 925 Nichel-Free (100% Ipoallergenico)',
    plating: 'Placcatura Oro 18K ad Alto Spessore (1.0 Micron • 20x vs Standard) + E-Coating',
    gemstone: "Perle Naturali d'Acqua Dolce Selezionate a Mano",
    sizes: [],
    is_active: true,
    gallery: [
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-sweet-romance-slot1.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-sweet-romance-slot2.webp',
      'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/products/isabel-pepe-set-sweet-romance-slot3.webp',
      '',
      ''
    ],
    sku: 'PL-15-BRACELET',
    carats: "Perle d'Acqua Dolce 7.5-8 mm",
    slug: 'set-sweet-romance'
  };

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('sku', 'PL-15-BRACELET')
    .select();

  if (error) console.error(error);
  else console.log('✅ Set Sweet Romance restored perfectly:', data[0].name);
}

restoreSweetRomance().catch(console.error);
