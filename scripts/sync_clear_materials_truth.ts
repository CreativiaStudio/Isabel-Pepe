import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../lib/supabase';

interface InvoiceItem {
  sku: string;
  name: string;
  cost: number;
  stock: number;
  carats: string;
  category: string;
  plating: string;
  gemstone: string;
}

const invoiceData: InvoiceItem[] = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'scripts/invoice_data.json'), 'utf8')
);

const invoiceMap = new Map<string, InvoiceItem>();
invoiceData.forEach(item => {
  invoiceMap.set(item.sku.trim().toUpperCase(), item);
});

// Custom storytelling dictionary to ensure ZERO ambiguous "in oro 18k" phrases
const cleanStorytelling: Record<string, string> = {
  "ASB4064": "Il bracciale Mon Amour Royale custodisce un cuore scintillante taglio brillante in Moissanite GRA, montato su Argento 925 con finitura in Rodio Puro per celebrare le connessioni più profonde con autentica eleganza.",
  "ASB3142": "Gli orecchini Rivière presentano un design a cascata lineare in Argento 925 rodiato dal movimento sinuoso, offrendo una rifrazione di luce ineguagliabile grazie alla Moissanite certificata GRA.",
  "MSR1220": "L'anello solitario Lune d'Argent in puro Argento 925 riflette la luce fredda e pura del Rodio specchiato, coronato da una luminosa Moissanite centrale taglio brillante da 2 carati.",
  "A114": "Gli orecchini Rêve in Argento 925 rodiato sono il punto luce quotidiano per eccellenza: delicati, luminosi e leggeri, impreziositi da Moissanite certificata GRA.",
  "MSR1075": "L'anello Constellation unisce la purezza dell'Argento 925 con finitura in Rodio a un solitario centrale da 1 carato in Moissanite GRA circondato da un delicato micro-pavé.",
  "MS1093": "La collana L'Éternel a tre cuori in Argento 925 rodiato simboleggia ieri, oggi e per sempre, impreziosita da tre Moissanite certificate GRA resistenti all'uso quotidiano.",
  "ASB4019": "Il bracciale Iconique in Argento 925 con finitura in Rodio celebra il minimalismo contemporaneo con una Moissanite solitaria a taglio brillante sospesa su una catena leggera e resistente.",
  "BTB047": "La collana Siena Gold in Argento 925 si distingue per la sua finitura dorata con placcatura in Oro 18K da 1 Micron (20 volte più spessa della media), pensata per illuminare il décolleté.",
  "ASB3035": "Gli orecchini Éternel in Argento 925 rodiato reinterpretano il cuore con moderna compostezza, arricchiti da Moissanite certificata GRA che celebra l'amore autentico e duraturo.",
  "PL-6": "Il Set Parure Perla Royal abbina collana e bracciale in perle naturali d'acqua dolce da 4-5 mm a componenti in Argento 925 con placcatura Oro 18K ad alto spessore (1 Micron).",
  "MS1141": "La collana Fleur in Argento 925 con finitura in Rodio Puro sboccia con petali scintillanti e una Moissanite centrale da 1 carato certificata GRA.",
  "ASB4054-WHITE": "Il bracciale Harmonie in Argento 925 rodiato è l'emblema dell'equilibrio: una Moissanite bianca a taglio brillante da 1 carato riflette una luce cristallina ad ogni gesto.",
  "ASB4068": "Il bracciale tennis Monte Carlo è l'icona intramontabile del lusso accessibile: una fila continua di Moissanite certificate GRA su montatura in Argento 925 rodiato con chiusura di sicurezza.",
  "MSR1078": "L'anello Châtelaine Silver in Argento 925 riflette la purezza del Rodio specchiato, esaltando una Moissanite centrale da 1 carato certificata GRA per un'eleganza senza tempo.",
  "A118": "I cerchi Opéra 15mm in Argento 925 uniscono il calore della placcatura Oro 18K ad alto spessore (1 Micron, 20x) alla maestria del pavé a taglio brillante in Moissanite GRA.",
  "BTN028": "La collana Isabel Romance in Argento 925 con placcatura Oro 18K da 1 Micron (20x più spessa) custodisce un romantico cuore pavé in Moissanite per una luce inalterabile.",
  "MSR1139": "L'anello Imperial in Argento 925 rodiato esprime una maestosità scultorea con 3.6 carati di Moissanite certificate GRA incastonate a mano ad altissima rifrazione.",
  "BTN006": "La collana Éclipse in Argento 925 con finitura in Rodio simboleggia l'unione indissolubile attraverso cerchi intrecciati arricchiti da un micro-pavé in Moissanite GRA.",
  "BTB024": "Il bracciale Eclat Royal a maglie scultoree in Argento 925 vanta una generosa placcatura in Oro 18K da 1 Micron (20 volte più spessa della media) sigillata da nano-coating.",
  "ASB4043": "Il bracciale Radiance in Argento 925 rodiato emana un fascino moderno e magnetico con Moissanite centrale da 1 carato, ideale da indossare da solo o combinato.",
  "ASB4055": "Il bracciale Cascade in Argento 925 rodiato presenta un pavé continuo di Moissanite scintillanti che avvolge il polso con fluidità e comfort impeccabile.",
  "PL-15-BRACELET": "Il bracciale Sweet Romance unisce perle naturali d'acqua dolce selezionate da 7.5-8 mm a una chiusura in Argento 925 con placcatura Oro 18K da 1 Micron.",
  "A144": "La parure Versailles in Argento 925 con finitura in Rodio Puro incarna lo splendore demi-fine con collana e orecchini coordinati in Moissanite certificata GRA.",
  "MS12236": "La collana Métamorphose a forma di farfalla in Argento 925 con placcatura Oro 18K da 1 Micron (20x) cattura la leggerezza del volo con ali in Moissanite pavé.",
  "A180-SET": "Il Set Vivienne a linea V in Argento 925 unisce collana e orecchini con placcatura Oro 18K da 1 Micron (20 volte più spessa) e Moissanite certificate GRA.",
  "ASB3093": "Gli orecchini Joséphine in Argento 925 con finitura in Rodio Puro uniscono la dolcezza dei cristalli rosa a una montatura luminosa anallergica.",
  "BTN005-SILVER": "La collana Brera Silver in Argento 925 riflette la luce fredda e pura del Rodio specchiato, esaltando ogni sfaccettatura del pavé in Moissanite certificata GRA.",
  "BTS018-EARRING": "Gli orecchini Glow Ribbon a fiocco in Argento 925 sono impreziositi da una placcatura in Oro 18K da 1 Micron (20x spessore) e Moissanite taglio brillante.",
  "A113": "Gli orecchini Duchesse in Argento 925 rodiato esprimono una raffinatezza regale grazie al doppio solitario in Moissanite certificata GRA da 0.5ct + 0.5ct.",
  "ASB4054-PINK": "Il bracciale Eden Rose in Argento 925 con placcatura Oro 18K da 1 Micron fonde la calda luce dorata con una pietra centrale rosa dai riflessi vellutati.",
  "ASB0041": "Gli orecchini pendenti Pétale d'Argent in Argento 925 rodiato richiamano la grazia dei petali mossi dal vento, con 2.16 carati totali di Moissanite certificata GRA.",
  "BTS036": "Il Set Papillon Splendeur in Argento 925 con finitura in Rodio unisce collana e orecchini a farfalla coordinati in Moissanite per una brillantezza continua.",
  "PL-30": "La collana Vendôme Pearl reinterpreta il classico filo di perle con perle d'acqua dolce calibrate da 7-8 mm e chiusura in Argento 925 con placcatura Oro 18K da 1 Micron.",
  "MS12242": "La collana Chantilly in Argento 925 rodiato illumina il décolleté con 3.2 carati di Moissanite certificate GRA incastonate a nido d'ape per una luce maestosa.",
  "PL-40": "La collana Solitaire Paris esalta la purezza di una perla naturale d'acqua dolce da 10-11 mm sospesa su una catena in Argento 925 con placcatura Oro 18K da 1 Micron.",
  "BTN005-GOLD": "La collana Brera Gold in Argento 925 unisce il fascino metropolitano alla placcatura in Oro 18K da 1 Micron (20 volte più spessa della media) con pavé in Moissanite.",
  "MS1096": "La collana Étoile in Argento 925 con finitura in Rodio Puro custodisce una Moissanite solitaria da 1 carato certificata GRA per una brillantezza quotidiana inalterabile.",
  "ASB3141": "I cerchi Soirée in Argento 925 rodiato presentano una linea continua di Moissanite certificate GRA a taglio brillante per una lucentezza a specchio garantita.",
  "MS1105": "La collana Symbiose in Argento 925 rodiato vanta 1.1 carati di Moissanite GRA su una montatura contemporanea protetta da nano-coating trasparente.",
  "ASB3057": "Gli orecchini Butterfly in Argento 925 con finitura in Rodio Puro trasformano la luce in ali scintillanti con 1.6 carati di Moissanite certificate GRA.",
  "MS1208": "La collana Duo Harmonie in Argento 925 rodiato unisce due cuori concentrici con Moissanite centrale da 1 carato certificata GRA protetta da doppio scudo.",
  "MSR1089": "L'anello Solitaire Gold Grace in Argento 925 con placcatura Oro 18K da 1 Micron (20x) accoglie un solitario da 1 carato in Moissanite GRA per una luce eterna."
};

async function syncAllProducts() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabaseAdmin.from('products').select('*');
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Updating ${products.length} products with 100% clear materials truth & E-Coating explanation...`);

  let count = 0;

  for (const p of products) {
    const skuKey = (p.sku || '').trim().toUpperCase();
    const inv = invoiceMap.get(skuKey);

    const isGold = (p.name.toLowerCase().includes('gold') || 
                    p.sku?.toUpperCase().includes('GOLD') || 
                    inv?.plating?.toLowerCase().includes('oro') ||
                    p.category === 'Set' && (p.name.includes('Vivienne') || p.name.includes('Perla') || p.name.includes('Sweet') || p.name.includes('Glow Ribbon')) ||
                    p.name.includes('Siena') || p.name.includes('Métamorphose') || p.name.includes('Isabel Romance') || p.name.includes('Eclat Royal') || p.name.includes('Vendôme') || p.name.includes('Solitaire Paris') || p.name.includes('Solitaire Gold Grace') || p.name.includes('Eden Rose'));

    const isPearl = p.name.toLowerCase().includes('perla') || p.name.toLowerCase().includes('pearl') || p.sku?.toUpperCase().includes('PL-') || inv?.gemstone?.toLowerCase().includes('perle');
    const isPink = p.name.toLowerCase().includes('joséphine') || p.name.toLowerCase().includes('eden rose') || p.sku?.toUpperCase().includes('PINK') || p.sku === 'ASB3093';

    // 1. Plating string
    const plating = isGold
      ? 'Placcatura Oro 18K ad Alto Spessore (1.0 Micron • 20x vs Standard) + E-Coating'
      : 'Finitura in Rodio Puro a Specchio (Metallo Nobile del Platino) + E-Coating';

    // 2. Gemstone string
    let gemstone = '';
    let stoneBullet = '';
    if (isPearl) {
      gemstone = "Perle Naturali d'Acqua Dolce Selezionate a Mano";
      stoneBullet = "• Pietre / Elementi: Perle Naturali d'Acqua Dolce di Grado Superiore selezionate a mano per purezza e lucentezza.";
    } else if (isPink) {
      gemstone = "Cristalli di Luce Rosa ad Altissima Rifrazione (Taglio Brillante)";
      stoneBullet = "• Pietre / Elementi: Cristalli di Pura Luce Rosa a taglio brillante con elevata rifrazione e sfaccettatura fine.";
    } else {
      gemstone = "Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color)";
      stoneBullet = "• Pietre / Elementi: Moissanite Certificata GRA (Taglio Brillante VVS1 D-Color) con indice di rifrazione superiore al diamante naturale.";
    }

    // 3. Materials
    const materials = 'Argento Sterling 925 Nichel-Free (100% Ipoallergenico)';

    // 4. Bullets
    const baseMetalBullet = '• Metallo Base: 100% Argento Sterling 925 anallergico nichel-free (certificato norme REACH UE).';
    const platingBullet = isGold
      ? '• Placcatura Oro 18K (1.0 Micron): Spessore 20 volte superiore alla media per un colore dorato caldo e duraturo nel tempo.'
      : '• Finitura in Rodio Puro: Metallo nobile del gruppo del platino per una brillantezza a specchio eterna e protezione anti-annerimento.';
    const ecoatingBullet = '• Scudo Protettivo E-Coating: Nano-sigillo elettroforetico trasparente che isola il metallo da acqua, sudore, ossidazione e graffi.';
    
    let ringSizeBullet = '';
    if (p.category === 'Anelli' || p.name.toLowerCase().includes('anello')) {
      ringSizeBullet = '\n• Misura Esclusiva: Taglia Unica Standard US 6 (IT 12 • Diametro interno 16.5 mm • Circonferenza 52 mm).';
    }

    const packagingBullet = '• Packaging Esclusivo: Cofanetto Luxury Isabel Pepe, panno in microfibra lucidante e Certificato Ufficiale di Autenticità inclusi.';
    const donationBullet = "• L'Arte del Dono: Una quota di questo acquisto sostiene attivamente la cura e la salvaguardia degli animali nei rifugi.";

    // 5. Introductory storytelling
    const intro = cleanStorytelling[skuKey] || p.description?.split('DETTAGLI ESCLUSIVI')[0]?.trim() || `${p.name} di Isabel Pepe, creazione demi-fine in puro Argento 925.`;

    const fullDescription = `${intro}\n\nDETTAGLI ESCLUSIVI & ARTIGIANALITÀ:\n${baseMetalBullet}\n${platingBullet}\n${ecoatingBullet}\n${stoneBullet}${ringSizeBullet}\n${packagingBullet}\n${donationBullet}`;

    const { error: updateErr } = await supabaseAdmin.from('products').update({
      materials: materials,
      plating: plating,
      gemstone: gemstone,
      description: fullDescription,
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`Error on ${p.name}:`, updateErr.message);
    } else {
      count++;
    }
  }

  console.log(`✓ Successfully updated ${count}/${products.length} products in Supabase!`);
}

syncAllProducts().catch(console.error);
