import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEdenRoseInDatabase() {
  console.log('Fixing Bracciale Eden Rose to Rodio + Moissanite Rosa in Supabase...');

  const descEden = `Il bracciale Eden Rose in Argento 925 con finitura in Rodio Puro fonde la lucentezza a specchio del metallo nobile del platino con una pietra centrale in Moissanite Rosa certificata GRA dai riflessi vellutati.

DETTAGLI ESCLUSIVI & ARTIGIANALITÀ:
• Metallo Base: 100% Argento Sterling 925 anallergico nichel-free (certificato norme REACH UE).
• Finitura in Rodio Puro: Metallo nobile del gruppo del platino per una brillantezza a specchio eterna e protezione anti-annerimento.
• Scudo Protettivo E-Coating: Nano-sigillo elettroforetico trasparente che isola il metallo da acqua, sudore, ossidazione e graffi.
• Pietre / Elementi: Moissanite Certificata GRA Rosa (Taglio Brillante VVS1 Pink) con elevata rifrazione e sfaccettatura fine.
• Sigillo di Autenticità: Incisione ufficiale con iniziali "IP" (Isabel Pepe) e punzone "S925" su ogni gioiello.
• Packaging Esclusivo: Cofanetto Luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Autenticità inclusi.
• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.`;

  const { error } = await supabase
    .from('products')
    .update({
      plating: 'Finitura in Rodio Puro a Specchio (Metallo Nobile del Platino) + E-Coating',
      gemstone: 'Moissanite Certificata GRA Rosa (Taglio Brillante VVS1 Pink)',
      description: descEden,
      seo_title: 'Eden Rose — Bracciale in Rodio & Moissanite Rosa | Isabel Pepe',
      seo_description: 'Scopri il bracciale Eden Rose di Isabel Pepe: Argento 925 con finitura in Rodio e Moissanite Rosa certificata GRA. Cofanetto regalo luxury e garanzia inclusi.'
    })
    .eq('slug', 'bracciale-eden-rose');

  if (error) {
    console.error('Error updating Eden Rose:', error);
  } else {
    console.log('✅ Bracciale Eden Rose updated to Rodio + Moissanite Rosa in database successfully!');
  }
}

fixEdenRoseInDatabase().catch(console.error);
