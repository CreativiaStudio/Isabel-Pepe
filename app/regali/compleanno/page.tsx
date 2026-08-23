import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Truck, 
  Heart, 
  RotateCcw, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Gem,
  Package,
  Clock,
  Tag,
  Star,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductTrustBadges from '@/components/ProductTrustBadges';
import FaqSection from '@/components/FaqSection';
import { BASE_URL, getBreadcrumbSchema, getFaqPageSchema } from '@/lib/schema';

export const revalidate = 3600; // ISR cache ogni ora

export const metadata: Metadata = {
  title: 'Regali di Compleanno Esclusivi: Gioielli Demi-Fine da Indossare Ogni Giorno | Isabel Pepe',
  description:
    'Trova il regalo di compleanno perfetto: orecchini punto luce, collane delicate e bracciali in Argento 925 e Oro 18K. Cofanetto regalo luxury incluso e consegna in 24/48h.',
  alternates: {
    canonical: `${BASE_URL}/regali/compleanno`,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: `${BASE_URL}/regali/compleanno`,
    siteName: 'Isabel Pepe',
    title: 'Regali di Compleanno Esclusivi: Gioielli Demi-Fine | Isabel Pepe',
    description:
      'Festeggia il suo compleanno con un dono indimenticabile: gioielli demi-fine luminosi, leggeri e anallergici con cofanetto luxury e spedizione express inclusi.',
    images: [
      {
        url: `${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`,
        width: 1200,
        height: 630,
        alt: 'Idee Regalo Compleanno Donna Isabel Pepe Gioielli Demi-Fine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regali di Compleanno Donna | Isabel Pepe Atelier',
    description:
      'Orecchini, collane e bracciali demi-fine in Oro 18K con cofanetto regalo soft-touch e spedizione 24/48h.',
    images: [`${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`],
  },
};

const TARGET_SLUGS = [
  'orecchini-reve',
  'orecchini-duchesse',
  'fleur',
  'collana-metamorphose',
  'bracciale-iconique',
  'orecchini-jos-phine',
  'orecchini-butterfly',
  'set-papillon-splendeur',
  'collana-etoile',
  'anello-chatelaine-silver'
];

const faqs = [
  {
    question: 'I gioielli possono essere indossati sotto la doccia o al mare?',
    answer:
      'Sì. Grazie allo scudo protettivo trasparente E-Coating applicato su una spessa placcatura in Oro 18K (1.0 Micron) o Rodio puro, i nostri gioielli in Argento 925 resistono a schizzi, acqua dolce e sudore senza ossidarsi né macchiare la pelle.'
  },
  {
    question: 'Se il compleanno è tra pochi giorni, riuscirò a ricevere il regalo in tempo?',
    answer:
      'Tutti gli ordini effettuati nei giorni feriali vengono elaborati immediatamente e consegnati in 24/48 ore lavorative in tutta Italia con corriere espresso tracciato (Poste Italiane / SDA). Riceverai il codice di tracciamento via email appena il pacco parte.'
  },
  {
    question: 'I gioielli provocano allergie o irritazioni alle orecchie o alla pelle sensibile?',
    answer:
      'Assolutamente no. Tutte le creazioni Isabel Pepe sono realizzate con base in puro Argento Sterling 925 certificato nichel-free, piombo-free e cadmio-free in piena conformità ai rigidi standard europei REACH. Sono 100% ipoallergenici e adatti anche alle pelli più sensibili.'
  },
  {
    question: 'Come posso aggiungere un messaggio di auguri personalizzato?',
    answer:
      'Puoi indicare il tuo testo di auguri nelle note durante il checkout oppure contattare subito il nostro Concierge via WhatsApp con il numero del tuo ordine: stamperemo per te un elegante biglietto coordinato da inserire nella scatola del dono.'
  },
  {
    question: 'Se la festeggiata desidera cambiare modello o misura, come funziona?',
    answer:
      'Il reso e la sostituzione sono gratuiti entro 14 giorni dalla consegna. La festeggiata o chi ha acquistato potrà semplicemente contattare resi@isabelpepe.com per concordare il ritiro del pacco e la scelta di una nuova creazione.'
  }
];

export default async function RegaliCompleannoPage() {
  let products: any[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('slug', TARGET_SLUGS);

    if (!error && data && data.length > 0) {
      products = [...data].sort((a, b) => {
        const indexA = TARGET_SLUGS.indexOf(a.slug);
        const indexB = TARGET_SLUGS.indexOf(b.slug);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
    } else {
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8);
      products = fallbackData || [];
    }
  } catch (err) {
    console.error('Errore fetch regali compleanno:', err);
  }

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Regali', url: '/shop' },
    { name: 'Regali di Compleanno', url: '/regali/compleanno' }
  ]);

  const faqJsonLd = getFaqPageSchema(faqs);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Idee Regalo Compleanno Donna — Isabel Pepe',
    description: 'Selezione di gioielli demi-fine in Oro 18K e Argento 925 perfetti per un compleanno indimenticabile.',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.name,
      url: `${BASE_URL}/prodotto/${p.slug}`,
      image: p.image_primary,
      offers: {
        '@type': 'Offer',
        price: (p.discount_price && p.discount_price > 0 ? p.discount_price : p.price).toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
      }
    }))
  };

  const representativeProduct = products[0] || {
    name: 'Orecchini Rêve',
    plating: 'Placcatura Oro 18K ad Alto Spessore (1.0 Micron) + E-Coating',
    gemstone: 'Moissanite Certificata GRA VVS1 D-Color',
    materials: 'Argento Sterling 925 Nichel-Free'
  };

  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 pb-24 text-[#1A1A1A]">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* BREADCRUMB UI */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 font-light">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/shop" className="hover:text-gray-900 transition-colors">
            Regali
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-[#8A5E58] font-medium truncate">Compleanno</span>
        </nav>
      </div>

      {/* HERO SECTION EDITORIALE */}
      <section className="px-4 sm:px-6 mb-16 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#F0E6E1] bg-[#FAF8F5] p-8 sm:p-14 lg:p-20 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A09A]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8A5E58]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EADFD9] shadow-2xs">
              <Sparkles size={14} className="text-[#8A5E58]" />
              <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5E58] font-bold">
                Celebra il Suo Giorno Speciale
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-gray-900 tracking-wider uppercase leading-tight font-normal">
              Regali di Compleanno Esclusivi: <span className="italic font-light text-[#8A5E58]">Lusso Quotidiano</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Un regalo che non finisce in un cassetto. I gioielli demi-fine Isabel Pepe uniscono il pregio dei metalli nobili alla versatilità quotidiana, grazie allo scudo E-Coating waterproof e anallergico.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#selezione-compleanno"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-center"
              >
                Scopri le Idee Compleanno ↓
              </a>
              <a
                href="#fasce-prezzo"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FAF8F5] text-gray-900 border border-[#C0A09A]/60 hover:border-gray-900 font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 text-center"
              >
                Guida alle Fasce di Prezzo
              </a>
            </div>
          </div>
        </div>

        {/* VALUE PILLARS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Gift size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Pronto da Donare</p>
              <p className="text-[11px] text-gray-500 font-light">Cofanetto e nastro luxury</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Package size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Zero Prezzi nel Pacco</p>
              <p className="text-[11px] text-gray-500 font-light">Perfetto per la consegna diretta</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Truck size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Consegna in 24/48h</p>
              <p className="text-[11px] text-gray-500 font-light">Spedizione express gratuita</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <RotateCcw size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Cambio Facile 14gg</p>
              <p className="text-[11px] text-gray-500 font-light">Reso e sostituzione gratuiti</p>
            </div>
          </div>
        </div>
      </section>

      {/* BIRTHDAY GIFT TIERS */}
      <section id="fasce-prezzo" className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto scroll-mt-28">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Idee per Ogni Budget
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            Scegli il Regalo in Base alla Tua Fascia
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Dal pensiero raffinato alla parure da sogno: tutto il prestigio dell'alta gioielleria a prezzi accessibili.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Fascia 1 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="inline-block px-3 py-1 bg-[#8A5E58]/10 text-[#8A5E58] rounded-full text-[10px] font-bold uppercase tracking-widest">
              Under €130
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              Pensiero Prezioso
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Orecchini a lobo e piccoli punti luce da indossare ogni giorno. Un gesto delicato ed elegantissimo che fa sempre breccia.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                I Pezzi Consigliati:
              </span>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Orecchini Joséphine (€110)</li>
                <li>• Orecchini Duchesse (€115)</li>
                <li>• Orecchini Rêve (€120)</li>
              </ul>
            </div>
          </div>

          {/* Fascia 2 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="inline-block px-3 py-1 bg-[#8A5E58]/10 text-[#8A5E58] rounded-full text-[10px] font-bold uppercase tracking-widest">
              €130 — €185
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              Eleganza Quotidiana
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Collane pendenti, bracciali a catena e solitari in Moissanite. Il regalo memorabile per un'amica speciale, la fidanzata o una sorella.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                I Pezzi Consigliati:
              </span>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Collana Fleur (€160)</li>
                <li>• Collana Métamorphose (€185)</li>
                <li>• Bracciale Iconique (€145)</li>
              </ul>
            </div>
          </div>

          {/* Fascia 3 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="inline-block px-3 py-1 bg-[#8A5E58]/10 text-[#8A5E58] rounded-full text-[10px] font-bold uppercase tracking-widest">
              Set &amp; Parure
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              Il Dono Completo
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Parure coordinate pronte nel cofanetto: collana + orecchini o bracciale abbinato per chi merita un regalo di compleanno davvero speciale.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                I Pezzi Consigliati:
              </span>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Set Isabel Rose (€200)</li>
                <li>• Set Papillon Splendeur (€225)</li>
                <li>• Set Vivienne Royale (€340)</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* CURATED PRODUCT SHOWCASE GRID */}
      <section id="selezione-compleanno" className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto scroll-mt-28">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            I Regali Più Scelti
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            Idee Regalo Compleanno Pronte per Lei
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Seleziona la creazione perfetta. Ogni pezzo include il cofanetto luxury soft-touch e il panno in microfibra.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#FAF8F5] rounded-3xl border border-[#F0E6E1]">
            <p className="text-sm text-gray-600 mb-4">I prodotti sono in fase di aggiornamento.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-full text-xs uppercase tracking-widest"
            >
              Visita lo Shop Completo
            </Link>
          </div>
        )}
      </section>

      {/* UNBOXING READY-TO-GIFT PROMISE */}
      <section className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto">
        <div className="bg-[#FAF8F6] border border-[#EADFD9] rounded-3xl p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="relative rounded-2xl overflow-hidden border border-[#EADFD9] shadow-md group">
              <img
                src="/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg"
                alt="Cofanetto Compleanno Luxury Isabel Pepe con Certificato e Panno per Gioielli"
                className="w-full h-[320px] sm:h-[420px] object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xs text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-sans flex items-center gap-2">
                <Sparkles size={13} className="text-[#C0A09A]" />
                <span>La Promessa Ready-to-Gift</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8A5E58] font-bold block mb-2">
                  Esperienza di Dono Completa
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-wider uppercase leading-tight font-light">
                  Non Devi Pensare a Nulla: <span className="italic text-[#8A5E58]">Pensiamo a Tutto Noi</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Non serve cercare una busta o una carta da regalo: ogni creazione arriva già custodita in una confezione impeccabile, soft-touch e coordinata, accompagnata dal certificato nominale e dal panno lucidante.
              </p>

              <div className="space-y-3 pt-2 text-xs text-gray-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Confezionamento luxury gratuito su ogni singolo ordine</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Spedizione anonima ideale per una consegna a sorpresa</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Possibilità di messaggio auguri personalizzato con il Concierge</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="px-4 sm:px-6 mb-20 max-w-4xl mx-auto">
        <ProductTrustBadges product={representativeProduct} />
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 sm:px-6 mb-16 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Domande Frequenti sul Compleanno
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider uppercase font-light">
            Tutte le Risposte per il Dono Perfetto
          </h2>
        </div>

        <FaqSection faqs={faqs} />
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Un Augurio Che Lascia il Segno
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl uppercase tracking-wider font-light">
              Fai Brillare il Suo Compleanno
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Ordina con consegna express 24/48h. Cofanetto regalo, panno e garanzia inclusi in omaggio.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#8A5E58] hover:bg-[#A8827B] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                Vedi Tutti i Gioielli
              </Link>
              <Link
                href="/assistenza-clienti"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 text-white border border-white/30 font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300"
              >
                Assistenza WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
