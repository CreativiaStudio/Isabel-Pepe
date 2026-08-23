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
  Flame,
  Shield,
  Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductTrustBadges from '@/components/ProductTrustBadges';
import FaqSection from '@/components/FaqSection';
import { BASE_URL, getBreadcrumbSchema, getFaqPageSchema } from '@/lib/schema';

export const revalidate = 3600; // ISR cache ogni ora

export const metadata: Metadata = {
  title: 'Gioielli per Anniversario: Simboli di Luce Eterna in Oro 18K & Rodio | Isabel Pepe',
  description:
    'Celebra il vostro amore con un gioiello indimenticabile: solitari taglio brillante, bracciali tennis e parure Royale in Argento 925 e Oro 18K. Cofanetto luxury e certificato inclusi.',
  alternates: {
    canonical: `${BASE_URL}/regali/anniversario`,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: `${BASE_URL}/regali/anniversario`,
    siteName: 'Isabel Pepe',
    title: 'Gioielli per Anniversario: Simboli di Luce Eterna | Isabel Pepe',
    description:
      'Un pegno d\'amore eterno: solitari taglio brillante, bracciali tennis e parure preziose in Oro 18K e Moissanite GRA. Consegna express 24/48h e cofanetto luxury.',
    images: [
      {
        url: `${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`,
        width: 1200,
        height: 630,
        alt: 'Gioielli Anniversario Isabel Pepe in Oro 18K e Moissanite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gioielli per Anniversario | Isabel Pepe Atelier',
    description:
      'Solitari, tennis e parure per celebrare i vostri traguardi d\'amore più importanti. Cofanetto regalo e certificato inclusi.',
    images: [`${BASE_URL}/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg`],
  },
};

const TARGET_SLUGS = [
  'anello-lune-d-argent',
  'anello-imperial',
  'bracciale-tennis-monte-carlo',
  'eclat-royal',
  'set-versailles',
  'set-vivienne',
  'collana-brera-gold',
  'isabel-romance',
  'set-ternel'
];

const faqs = [
  {
    question: 'Qual è il gioiello più consigliato per celebrare un 1° anniversario?',
    answer:
      'Per il primo anniversario consigliamo un punto luce raffinato come la Collana Brera Gold o la Collana Isabel Romance, oppure gli orecchini a lobo in Moissanite. Sono simboli di pura luce quotidiana che si abbinano a qualsiasi stile.'
  },
  {
    question: 'La Moissanite mantiene la sua brillantezza per sempre come il diamante?',
    answer:
      'Assolutamente sì. Con una durezza di 9.25 sulla scala di Mohs (seconda solo al diamante naturale) e un indice di rifrazione di 2.65 (superiore al 2.42 del diamante), la Moissanite non si opacizza mai, non attira il grasso cutaneo ed emette un fuoco cromatico inalterabile nei decenni.'
  },
  {
    question: 'Come posso scegliere la misura corretta per un anello a sorpresa?',
    answer:
      'Puoi consultare la nostra Guida alle Taglie interattiva per misurare il diametro interno di un anello che la destinataria già indossa. Inoltre, offriamo il cambio misura gratuito entro 14 giorni: se la misura non fosse perfetta, la sostituiremo tempestivamente e senza spese.'
  },
  {
    question: 'È garantita la consegna prima della data esatta dell\'anniversario?',
    answer:
      'Spediamo entro 24 ore dall\'ordine con corriere espresso tracciato (Poste Italiane / SDA). La consegna avviene in 24/48 ore lavorative in tutta Italia. Per qualsiasi esigenza di data tassativa, puoi contattare il nostro concierge su WhatsApp per una gestione prioritaria.'
  },
  {
    question: 'Cosa include il Certificato Gemmologico GRA per gli anelli e i solitari?',
    answer:
      'Ogni creazione in Moissanite include il Certificato Ufficiale GRA con Report Card nominale, caratura dettagliata, grado di purezza VVS1, colore D (eccezionale bianco) e numero di serie univoco micro-inciso a laser sulla cintura della pietra, verificabile online sul database ufficiale.'
  }
];

export default async function RegaliAnniversarioPage() {
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
    console.error('Errore fetch regali anniversario:', err);
  }

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Regali', url: '/shop' },
    { name: 'Gioielli per Anniversario', url: '/regali/anniversario' }
  ]);

  const faqJsonLd = getFaqPageSchema(faqs);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gioielli per Anniversario — Isabel Pepe',
    description: 'Solitari, bracciali tennis e parure in Oro 18K per celebrare i traguardi d\'amore più preziosi.',
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
    name: "Anello Lune d'Argent",
    plating: 'Finitura in Rodio Puro a Specchio + E-Coating',
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
          <span className="text-[#8A5E58] font-medium truncate">Anniversario</span>
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
                Simboli di Luce per Traguardi Indimenticabili
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-gray-900 tracking-wider uppercase leading-tight font-normal">
              Gioielli per Anniversario: <span className="italic font-light text-[#8A5E58]">Simboli di Luce Eterna</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              1 anno, 5 anni o una vita insieme: ogni anniversario merita una luce che non si spegne mai. Creazioni eterne in Argento 925 con placcatura spessa in Oro 18K o Rodio Puro e Moissanite Certificata GRA VVS1 D-Color.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#selezione-anniversario"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-center"
              >
                Esplora i Gioielli Anniversario ↓
              </a>
              <a
                href="#guida-traguardi"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FAF8F5] text-gray-900 border border-[#C0A09A]/60 hover:border-gray-900 font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 text-center"
              >
                Guida ai Traguardi d'Amore
              </a>
            </div>
          </div>
        </div>

        {/* VALUE PILLARS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Gem size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Moissanite GRA</p>
              <p className="text-[11px] text-gray-500 font-light">Taglio Brillante VVS1 D-Color</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <ShieldCheck size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Doppio Scudo</p>
              <p className="text-[11px] text-gray-500 font-light">Oro 18K 1.0µm + E-Coating</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Gift size={22} className="text-[#8A5E58] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Cofanetto Luxury</p>
              <p className="text-[11px] text-gray-500 font-light">Scatola magnetica e panno inclusi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl">
            <Truck size={22} className="text-[#C0A09A] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Consegna Express</p>
              <p className="text-[11px] text-gray-500 font-light">24/48h garantita e tracciata</p>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONE ANNIVERSARY GIFTING GUIDE */}
      <section id="guida-traguardi" className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto scroll-mt-28">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Tradizione &amp; Simbolismo
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            Il Dono Perfetto per Ogni Traguardo
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Ogni anno insieme ha un significato speciale. Ecco le nostre raccomandazioni per celebrare i vostri momenti più importanti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1° Anno */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-serif text-base font-bold">
              1°
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              1° Anno — La Promessa di Luce
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Il primo capitolo di un grande cammino. Si celebra con un gioiello da portare vicino al cuore ogni singolo giorno.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Creazioni Iconiche:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Collana Brera Gold o Isabel Romance
              </p>
            </div>
          </div>

          {/* 5° Anno */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-serif text-base font-bold">
              5°
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              5° Anno — Il Cerchio d'Amore
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              La complicità solida e inossidabile. Il bracciale tennis simboleggia una sequenza ininterrotta di giorni luminosi.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Creazioni Iconiche:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Bracciale Tennis Monte Carlo o Eclat Royal
              </p>
            </div>
          </div>

          {/* 10° & 25° Anno */}
          <div className="p-8 bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl space-y-4 shadow-2xs hover:border-[#C0A09A] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-serif text-base font-bold">
              10+
            </div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase">
              10° &amp; 25° Anno — Il Traguardo Reale
            </h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Un amore eterno che merita il massimo splendore: un solitario maestoso o una parure regale coordinata.
            </p>
            <div className="pt-2 border-t border-[#F0E6E1] space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block">
                Creazioni Iconiche:
              </span>
              <p className="text-xs text-gray-900 font-medium">
                Anello Lune d'Argent 2.0ct o Set Versailles
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CURATED SHOWCASE GRID */}
      <section id="selezione-anniversario" className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto scroll-mt-28">
        <div className="text-center mb-12 space-y-3">
          <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Collezione Anniversario
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-gray-900 tracking-wider uppercase font-light">
            Solitari, Tennis e Parure di Puro Splendore
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            Ogni pezzo è rifinito a mano con punzone di garanzia S925 e incisione laser Isabel Pepe.
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

      {/* THE SCIENCE OF ETERNAL SPARKLE (GEMMOLOGICAL AUTHORITY) */}
      <section className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto">
        <div className="bg-[#141414] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A09A]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
                Eccellenza Gemmologica &amp; Innovazione
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl uppercase tracking-wider font-light">
                La Scienza del Fuoco Eterno: <span className="italic text-[#C0A09A]">Moissanite GRA VVS1</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                Perché la Moissanite Certificata GRA è la scelta gemmologica più nobile e intelligente per celebrare un anniversario:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="text-[#C0A09A] flex items-center gap-2">
                  <Flame size={20} />
                  <h3 className="font-serif text-base uppercase tracking-wider font-semibold">
                    Brillantezza Superiore (2.65)
                  </h3>
                </div>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  Con un indice di rifrazione di 2.65 (contro il 2.42 del diamante), la Moissanite riflette fino al 10% in più di luce pura e fuoco cromatico sotto ogni angolazione.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="text-[#C0A09A] flex items-center gap-2">
                  <Shield size={20} />
                  <h3 className="font-serif text-base uppercase tracking-wider font-semibold">
                    Durezza Estrema 9.25 Mohs
                  </h3>
                </div>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  Seconda solo al diamante per durezza al mondo. Resiste a urti, graffi e usura quotidiana senza mai opacizzarsi, garantendo uno splendore eterno.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="text-[#C0A09A] flex items-center gap-2">
                  <Award size={20} />
                  <h3 className="font-serif text-base uppercase tracking-wider font-semibold">
                    Certificazione &amp; Incisione Laser
                  </h3>
                </div>
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  Ogni pietra è marchiata al laser con matricola univoca visibile al microscopio gemmologico e accompagnata da Certificato GRA e Garanzia 24 mesi.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* UNBOXING PACKAGING SHOWCASE */}
      <section className="px-4 sm:px-6 mb-20 max-w-6xl mx-auto">
        <div className="bg-[#FAF8F6] border border-[#EADFD9] rounded-3xl p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="relative rounded-2xl overflow-hidden border border-[#EADFD9] shadow-md group">
              <img
                src="/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg"
                alt="Cofanetto Regalo Anniversario Luxury Isabel Pepe con Certificato e Panno per Gioielli"
                className="w-full h-[320px] sm:h-[420px] object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xs text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-sans flex items-center gap-2">
                <Sparkles size={13} className="text-[#C0A09A]" />
                <span>Pronto per Essere Donato</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#8A5E58] font-bold block mb-2">
                  Presentazione Impeccabile
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-wider uppercase leading-tight font-light">
                  Un'Apertura da Sogno <span className="italic text-[#8A5E58]">per il Vostro Anniversario</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Tutto è studiato per creare stupore: il cofanetto vellutato protegge la parure, la scatola magnetica rigida offre una consistenza di prestigio al tatto, mentre il certificato GRA nominale testimonia l'autenticità del tuo pegno d'amore.
              </p>

              <div className="space-y-3 pt-2 text-xs text-gray-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Nessuna ricevuta o prezzo all'interno del pacco</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Panno in microfibra per mantenere il gioiello lucido ogni giorno</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8A5E58] shrink-0" />
                  <span>Cambio misura anello gratuito e reso 14 giorni garantito</span>
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
            Domande Frequenti sull'Anniversario
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider uppercase font-light">
            Guida alla Scelta e Garanzie
          </h2>
        </div>

        <FaqSection faqs={faqs} />
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Celebra la Vostra Storia
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl uppercase tracking-wider font-light">
              Rendi Indimenticabile Questo Anniversario
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Ordina oggi con consegna express 24/48h. Ricevi il cofanetto luxury pronto per essere consegnato nelle sue mani.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#8A5E58] hover:bg-[#A8827B] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                Esplora Tutte le Creazioni
              </Link>
              <Link
                href="/assistenza-clienti"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 text-white border border-white/30 font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300"
              >
                Parla con il Concierge
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
