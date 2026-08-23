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
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductTrustBadges from '@/components/ProductTrustBadges';
import FaqSection from '@/components/FaqSection';
import { BASE_URL, getBreadcrumbSchema, getFaqPageSchema } from '@/lib/schema';

export const revalidate = 3600; // ISR cache ogni ora

export const metadata: Metadata = {
  title: 'Idee Regalo Gioielli per Donna: Eleganza Senza Tempo & Cofanetto Luxury | Isabel Pepe',
  description:
    'Cerchi il regalo perfetto per lei? Scopri i gioielli demi-fine Isabel Pepe in Argento 925 e Oro 18K. Cofanetto luxury incluso, spedizione express 24/48h e garanzia 24 mesi.',
  alternates: {
    canonical: `${BASE_URL}/regali/donna-elegante`,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: `${BASE_URL}/regali/donna-elegante`,
    siteName: 'Isabel Pepe',
    title: 'Idee Regalo Gioielli per Donna: Eleganza Senza Tempo | Isabel Pepe',
    description:
      'L\'arte del dono perfetto: creazioni demi-fine in Argento 925 e Oro 18K, custodite nell\'iconico cofanetto luxury in velluto con panno e garanzia 24 mesi.',
    images: [
      {
        url: `${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cofanetto Regalo Luxury Isabel Pepe con Gioielli Demi-Fine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idee Regalo Gioielli per Donna | Isabel Pepe Atelier',
    description:
      'Gioielli raffinati in Oro 18K e Moissanite con cofanetto luxury pronto per essere donato. Spedizione express 24/48h gratuita.',
    images: [`${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`],
  },
};

const TARGET_SLUGS = [
  'isabel-romance',
  'set-vivienne',
  'siena-gold',
  'vendome-pearl',
  'mon-amour-royale',
  'anello-imperial',
  'set-sweet-romance',
  'orecchini-opera'
];

const faqs = [
  {
    question: 'Il pacco contiene lo scontrino o i prezzi visibili all\'interno?',
    answer:
      'Assolutamente no. Tutti i nostri ordini vengono spediti con packing slip privo di indicazioni di prezzo, rendendo la consegna perfetta e discreta anche se spedita direttamente al domicilio della destinataria.'
  },
  {
    question: 'Cosa include la confezione regalo Isabel Pepe?',
    answer:
      'Ogni gioiello arriva già pronto per essere donato all\'interno dell\'iconico Cofanetto Luxury con finitura soft-touch, scatola magnetica rigida di protezione esterna, panno speciale in microfibra per la pulizia quotidiana e Certificato Ufficiale di Autenticità e Garanzia (con report GRA nominale per le creazioni in Moissanite).'
  },
  {
    question: 'Cosa succede se la misura o il modello non dovesse piacere?',
    answer:
      'Offriamo il reso gratuito e il cambio misura senza pensieri entro 14 giorni dalla consegna. La procedura è rapidissima: basta inviare un\'email a resi@isabelpepe.com e il nostro concierge si occuperà del ritiro e della sostituzione.'
  },
  {
    question: 'Quali sono i tempi di consegna in Italia?',
    answer:
      'Spediamo con corriere espresso tracciato (Poste Italiane / SDA). La consegna avviene in 24/48 ore lavorative su tutto il territorio nazionale ed è sempre gratuita, senza alcun importo minimo di spesa.'
  },
  {
    question: 'I gioielli possono essere indossati ogni giorno senza rovinarsi?',
    answer:
      'Sì, tutte le creazioni Isabel Pepe sono realizzate in puro Argento Sterling 925 anallergico protetto da una placcatura in Oro 18K ad alto spessore (1.0 Micron, 20 volte più resistente del flash plating comune) e sigillate dallo scudo molecolare E-Coating che previene l\'ossidazione e resiste a docce e sudore.'
  }
];

export default async function RegaliDonnaElegantePage() {
  // Query Supabase per i prodotti selezionati
  let products: any[] = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('slug', TARGET_SLUGS);

    if (!error && data && data.length > 0) {
      // Ordina i prodotti secondo l'ordine di TARGET_SLUGS
      products = [...data].sort((a, b) => {
        const indexA = TARGET_SLUGS.indexOf(a.slug);
        const indexB = TARGET_SLUGS.indexOf(b.slug);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
    } else {
      // Fallback a prodotti attivi generici se i target non sono trovati
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8);
      products = fallbackData || [];
    }
  } catch (err) {
    console.error('Errore fetch regali donna elegante:', err);
  }

  // Schema.org Structured Data
  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Regali', url: '/shop' },
    { name: 'Idee Regalo Donna Elegante', url: '/regali/donna-elegante' }
  ]);

  const faqJsonLd = getFaqPageSchema(faqs);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Selezione Regalo Donna Elegante — Isabel Pepe',
    description: 'I migliori gioielli demi-fine in Oro 18K e Argento 925 selezionati per un regalo femminile memorabile.',
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
    name: 'Isabel Romance',
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
          <span className="text-[#8A5E58] font-medium truncate">Donna Elegante</span>
        </nav>
      </div>

      {/* HERO SECTION EDITORIALE */}
      <section className="px-4 sm:px-6 mb-16 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#F0E6E1] bg-[#FAF8F5] p-8 sm:p-14 lg:p-20 text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A09A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8A5E58]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EADFD9] shadow-2xs">
              <Sparkles size={14} className="text-[#8A5E58]" />
              <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5E58] font-bold">
                L'Arte del Dono Perfetto
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-gray-900 tracking-wider uppercase leading-tight font-normal">
              Idee Regalo Gioielli per Donna: <span className="italic font-light text-[#8A5E58]">Eleganza Senza Tempo</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Dimentica i regali convenzionali. Regala un'emozione pura con creazioni demi-fine in Argento 925 rifinite in Oro 18K e pietre di luce eterna. Ogni gioiello arriva già custodito nel nostro iconico Cofanetto Luxury, pronto per far brillare i suoi occhi.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#selezione-regalo"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-center"
              >
                Scopri la Selezione Regalo ↓
              </a>
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FAF8F5] text-gray-900 border border-[#C0A09A]/60 hover:border-gray-900 font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 text-center"
              >
                Esplora Tutte le Collezioni
              </Link>
            </div>
          </div>
        </div>

        {/* VALUE PILLARS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Gift size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Cofanetto &amp; Panno</p>
              <p className="text-[11px] text-gray-500 font-light">Inclusi in omaggio</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Truck size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Spedizione Express</p>
              <p className="text-[11px] text-gray-500 font-light">24/48h gratuita in tutta Italia</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Package size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Pacco Anonimo</p>
              <p className="text-[11px] text-gray-500 font-light">Nessun prezzo nel pacco</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <RotateCcw size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Reso Senza Pensieri</p>
              <p className="text-[11px] text-gray-500 font-light">14 giorni e cambio misura</p>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED PRODUCT SHOWCASE GRID */}
      <section id="selezione-regalo" className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto scroll-mt-28">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Selezione Esclusiva per Lei
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            I Bestseller Più Amati in Regalo
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Parure coordinate, punti luce scintillanti e creazioni intramontabili scelte per stupire ed emozionare.
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

      {/* THE UNBOXING EXPERIENCE (PACKAGING FOCUS) */}
      <section className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto">
        <div className="bg-[#FAF8F6] border border-[#EADFD9] rounded-3xl p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Visual Cofanetto */}
            <div className="relative rounded-2xl overflow-hidden border border-[#EADFD9] shadow-md group">
              <img
                src="/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg"
                alt="Cofanetto Regalo Luxury Isabel Pepe con Certificato e Panno per Gioielli"
                className="w-full h-[320px] sm:h-[420px] object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xs text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-sans flex items-center gap-2">
                <Sparkles size={13} className="text-[#C0A09A]" />
                <span>Incluso in Ogni Ordine Senza Costi Extra</span>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="space-y-6">
              <div>
                <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8A5E58] font-bold block mb-2">
                  L'Esperienza Unboxing
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-wider uppercase leading-tight font-light">
                  Un Dono Che Incanta <span className="italic text-[#8A5E58]">Prima Ancora di Aprirlo</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Il momento del regalo deve essere un rituale indimenticabile. Ogni creazione Isabel Pepe viene adagiata con cura artigianale nel nostro cofanetto rigido soft-touch, accompagnata da tutto ciò che serve per preservarne il pregio nel tempo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-[#EADFD9] space-y-1">
                  <div className="flex items-center gap-2 text-[#8A5E58]">
                    <Gift size={16} />
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-gray-900">
                      Box Rigido Soft-Touch
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    Astuccio foderato in velluto per proteggere la montatura e le gemme.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EADFD9] space-y-1">
                  <div className="flex items-center gap-2 text-[#8A5E58]">
                    <Package size={16} />
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-gray-900">
                      Scatola Magnetica Esterna
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    Scatola rigida con chiusura magnetica per un'apertura di puro prestigio.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EADFD9] space-y-1">
                  <div className="flex items-center gap-2 text-[#8A5E58]">
                    <Award size={16} />
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-gray-900">
                      Certificato &amp; Garanzia
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    Certificato gemmologico nominale e garanzia 24 mesi inclusi nel pacco.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#EADFD9] space-y-1">
                  <div className="flex items-center gap-2 text-[#8A5E58]">
                    <Sparkles size={16} />
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-gray-900">
                      Panno Lucidante Dedicato
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    Panno in microfibra ultrasoffice per conservare la lucentezza a specchio.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GIFTING GUIDE BY RECIPIENT STYLE */}
      <section className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Guida alla Scelta
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            Qual è il Gioiello Perfetto per Lei?
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Scopri i consigli delle nostre stiliste per scegliere il regalo in base alla sua personalità e al suo stile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center">
              <Gem size={20} />
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              La Donna Classica &amp; Raffinata
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Ama i dettagli discreti, le linee pulite e i pezzi intramontabili che non passano mai di moda. 
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Il Regalo Consigliato:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Punto Luce Siena Gold o Collana Vendôme Pearl
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              La Donna Sofisticata &amp; Moderna
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Ama farsi notare con armonia, indossa parure complete e apprezza l'armonia di set coordinati da sera o da giorno.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Il Regalo Consigliato:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Parure Set Vivienne o Set Sweet Romance
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center">
              <Heart size={20} />
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              L'Amante della Luce Quotidiana
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Cerca gioielli versatili e luminosi da indossare dall'ufficio alla cena con gli amici, resistenti e leggeri.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Il Regalo Consigliato:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Bracciale Mon Amour Royale o Orecchini Opéra
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST BADGES & CERTIFICATI INTERATTIVI */}
      <section className="px-4 sm:px-6 mb-20 max-w-4xl mx-auto">
        <ProductTrustBadges product={representativeProduct} />
      </section>

      {/* FAQ SECTION INTERATTIVA */}
      <section className="px-4 sm:px-6 mb-16 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Domande Frequenti sui Regali
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider uppercase font-light">
            Tutto Ciò che Devi Sapere per un Regalo Impeccabile
          </h2>
        </div>

        <FaqSection faqs={faqs} />
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Assistenza Concierge Dedicata
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl uppercase tracking-wider font-light">
              Hai Bisogno di un Consiglio su Misura?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Il nostro team è a tua disposizione per aiutarti a scegliere la misura perfetta, abbinare una parure o personalizzare il tuo biglietto regalo.
            </p>
            <div className="pt-2">
              <Link
                href="/assistenza-clienti"
                className="inline-block px-8 py-3.5 bg-[#8A5E58] hover:bg-[#A8827B] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                Contatta il Concierge Isabel Pepe
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
