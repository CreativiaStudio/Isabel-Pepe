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
  BookOpen,
  Layers,
  Droplets,
  Shield,
  Zap,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductTrustBadges from '@/components/ProductTrustBadges';
import FaqSection from '@/components/FaqSection';
import { BASE_URL, getBreadcrumbSchema, getFaqPageSchema } from '@/lib/schema';

export const revalidate = 3600; // ISR cache ogni ora

export const metadata: Metadata = {
  title: 'Cosa sono i Gioielli Demi-Fine: La Guida Definitiva al Lusso Quotidiano | Isabel Pepe',
  description:
    'Scopri cosa sono i gioielli Demi-Fine: la combinazione perfetta tra Argento 925, placcatura spessa in Oro 18K (1.0µm), E-Coating e Moissanite GRA. Guida completa ai materiali e alla cura.',
  alternates: {
    canonical: `${BASE_URL}/guide/gioielli-demi-fine`,
  },
  openGraph: {
    type: 'article',
    locale: 'it_IT',
    url: `${BASE_URL}/guide/gioielli-demi-fine`,
    siteName: 'Isabel Pepe',
    title: 'Cosa sono i Gioielli Demi-Fine: La Guida Definitiva al Lusso Quotidiano',
    description:
      'Guida completa alla gioielleria Demi-Fine: scopri i segreti dell\'Argento 925, placcatura Oro 18K a spessore, E-Coating nano-protettivo e Moissanite GRA.',
    images: [
      {
        url: `${BASE_URL}/Brand/chi_siamo_hero.jpg`,
        width: 1200,
        height: 630,
        alt: 'Guida Ufficiale ai Gioielli Demi-Fine Isabel Pepe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guida ai Gioielli Demi-Fine: Significato, Materiali e Cura | Isabel Pepe',
    description:
      'Tutto ciò che devi sapere sulla gioielleria demi-fine: perché colma il divario tra bigiotteria economica e alta gioielleria inaccessibile.',
    images: [`${BASE_URL}/Brand/chi_siamo_hero.jpg`],
  },
};

const TARGET_SLUGS = [
  'siena-gold',
  'set-glow-ribbon',
  'anello-chatelaine-silver',
  'vendome-pearl',
  'orecchini-opera',
  'bracciale-harmonie',
  'set-sweet-romance',
  'collana-brera-silver'
];

const faqs = [
  {
    question: 'Cosa differenzia un gioiello demi-fine dalla comune bigiotteria?',
    answer:
      'La differenza risiede nell\'anima del metallo e nella lavorazione. La bigiotteria commerciale è realizzata con metalli vili (ottone, rame o zama) ricoperti da una finissima patina dorata (flash plating da 0.03 micron) che svanisce in poche settimane lasciando macchie verdi sulla pelle. Il Demi-Fine di Isabel Pepe utilizza esclusivamente una base in 100% Argento Sterling 925 nichel-free, nobilitato da una placcatura in Oro 18K o Rodio puro spessa 1.0 Micron (fino a 20 volte superiore) e sigillato da uno scudo polimerico E-Coating.'
  },
  {
    question: 'Cosa significa placcatura in Oro 18K a 1.0 Micron?',
    answer:
      'Il micron (µm) misura lo spessore molecolare dell\'oro depositato sull\'argento tramite bagno galvanico ad alta precisione. Mentre lo standard commerciale da "fast fashion" si ferma a 0.05µm, Isabel Pepe applica uno strato di 1.00µm (20x più spesso), conferendo al gioiello la calda tonalità autentica dell\'oro 18 carati e una straordinaria resistenza all\'usura e allo sfregamento quotidiano.'
  },
  {
    question: 'Cos\'è il trattamento nano-tecnologico E-Coating?',
    answer:
      'L\'E-Coating (Electrophoretic Coating) è un processo elettrochimico d\'avanguardia che deposita un film trasparente e invisibile a livello nanometrico su tutta la superficie del gioiello. Questo scudo molecolare isola il metallo prezioso dal contatto con ossigeno, acqua, sudore e agenti atmosferici, prevenendo completamente l\'annerimento dell\'argento e rendendo il gioiello anallergico al 100%.'
  },
  {
    question: 'La Moissanite è una pietra naturale o sintetica e come si confronta con il diamante?',
    answer:
      'La Moissanite è un minerale scoperto originariamente in frammenti di meteorite (carburo di silicio). Oggi viene ricreata in laboratorio in condizioni di purezza assoluta, risultando 100% etica e sostenibile. Ha un indice di rifrazione di 2.65 (superiore al 2.42 del diamante, riflettendo più fuoco di luce) e una durezza di 9.25 sulla scala di Mohs, che la rende eterna e indistruttibile nell\'uso di tutti i giorni.'
  },
  {
    question: 'I gioielli in Argento 925 demi-fine possono essere indossati sotto la doccia?',
    answer:
      'Sì, grazie alla combinazione della placcatura a spessore e del sigillo protettivo E-Coating waterproof. Consigliamo comunque di asciugare il gioiello con il panno in microfibra incluso ed evitare l\'esposizione diretta a profumi aggressivi, candeggina o acque termali ricche di zolfo.'
  }
];

export default async function GuidaGioielliDemiFinePage() {
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
    console.error('Errore fetch guida demi-fine:', err);
  }

  const breadcrumbJsonLd = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guide', url: '/guide/gioielli-demi-fine' },
    { name: 'Cosa Sono i Gioielli Demi-Fine', url: '/guide/gioielli-demi-fine' }
  ]);

  const faqJsonLd = getFaqPageSchema(faqs);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Cosa sono i Gioielli Demi-Fine: La Guida Definitiva al Lusso Quotidiano',
    description: 'Guida approfondita alla gioielleria demi-fine: standard produttivi in Argento 925, placcatura Oro 18K a spessore 1.0µm, nano-trattamento E-Coating e Moissanite GRA.',
    author: {
      '@type': 'Organization',
      name: 'Isabel Pepe',
      url: BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Isabel Pepe',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/Brand/logo-isabel-pepe.png`
      }
    },
    datePublished: '2026-01-15T09:00:00+01:00',
    dateModified: '2026-08-23T12:00:00+02:00',
    mainEntityOfPage: `${BASE_URL}/guide/gioielli-demi-fine`,
    image: `${BASE_URL}/Brand/chi_siamo_hero.jpg`
  };

  const representativeProduct = products[0] || {
    name: 'Siena Gold',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* BREADCRUMB UI */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 font-light">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="hover:text-gray-900 transition-colors">
            Guide
          </span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-[#8A5E58] font-medium truncate">Gioielli Demi-Fine</span>
        </nav>
      </div>

      {/* ARTICLE HEADER / HERO */}
      <header className="px-4 sm:px-6 mb-16 max-w-4xl mx-auto">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#F0E6E1]">
            <BookOpen size={14} className="text-[#8A5E58]" />
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5E58] font-bold">
              Guida Ufficiale ai Materiali &amp; Manifattura
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-gray-900 tracking-wider uppercase leading-tight font-normal">
            Cosa Sono i Gioielli Demi-Fine: <span className="italic font-light text-[#8A5E58]">La Guida al Lusso Quotidiano</span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            La perfetta armonia tra il prestigio dell'alta gioielleria e la libertà del prêt-à-porter quotidiano. Scopri perché il Demi-Fine è la scelta più intelligente, etica e durevole nel mondo dei gioielli moderni.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-light pt-2">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#C0A09A]" />
              <span>Tempo di lettura: 6 min</span>
            </span>
            <span>•</span>
            <span>A cura dell'Atelier Isabel Pepe</span>
            <span>•</span>
            <span>Aggiornato 2026</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mt-10 rounded-3xl overflow-hidden shadow-xl border border-[#F0E6E1] bg-[#FAF8F5] aspect-[16/9] sm:aspect-[21/9]">
          <img
            src="/Brand/chi_siamo_hero.jpg"
            alt="L'Atelier Isabel Pepe e la Creazione dei Gioielli Demi-Fine"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </header>

      {/* ARTICLE BODY */}
      <article className="px-4 sm:px-6 max-w-4xl mx-auto space-y-16">
        
        {/* CAPITOLO 1: LA RIVOLUZIONE DEL DEMI-FINE */}
        <section className="space-y-4 text-sm sm:text-base text-gray-700 font-light leading-relaxed">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
            Capitolo 1
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
            La Rivoluzione del Demi-Fine: Oltre la Bigiotteria e la Cassaforte
          </h2>
          <p>
            Per decenni, chi cercava un gioiello si è trovato di fronte a un bivio obbligato e frustrante: da un lato la <strong>bigiotteria usa-e-getta</strong>, economica ma realizzata con metalli vili (ottone, zama, nichel) che anneriscono dopo pochi utilizzi e irritano la pelle; dall'altro l'<strong>alta gioielleria tradizionale</strong>, con prezzi proibitivi e pezzi così impegnativi da finire dimenticati in una cassaforte per paura di rovinarli o perderli.
          </p>
          <p>
            Il termine <em>"Demi-Fine"</em> nasce per colmare questo vuoto. Rappresenta una categoria d'eccellenza che unisce l'utilizzo di <strong>metalli nobili autentici</strong> (come l'Argento Sterling 925 e l'Oro 18K a spessore) e <strong>pietre preziose etiche</strong> (come la Moissanite Certificata GRA e le perle d'acqua dolce), a un design contemporaneo pensato per essere indossato e vissuto ogni giorno con disinvoltura.
          </p>
        </section>

        {/* I 4 PILASTRI DI QUALITA ISABEL PEPE */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-bold block">
              I Nostri Standard Costruttivi
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
              I 4 Pilastri della Manifattura Isabel Pepe
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Pilastro 1 */}
            <div className="p-6 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wider uppercase font-semibold">
                100% Argento Sterling 925
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Nessuna lega povera in ottone o rame. Ogni montatura è fusa in puro Argento 925, certificato nichel-free, piombo-free e cadmio-free secondo la normativa europea REACH. 100% anallergico per qualsiasi tipo di pelle.
              </p>
            </div>

            {/* Pilastro 2 */}
            <div className="p-6 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wider uppercase font-semibold">
                Placcatura Oro 18K a 1.0 Micron
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Uno spessore galvanico 20 volte superiore al comune "flash plating" da 0.05µm. Questa generosa copertura dona la calda tonalità autentica dell'oro 18 carati e garantisce una tenuta inalterabile negli anni.
              </p>
            </div>

            {/* Pilastro 3 */}
            <div className="p-6 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wider uppercase font-semibold">
                Scudo Molecolare E-Coating
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Un nano-trattamento elettroforetico trasparente e invisibile che avvolge l'intero gioiello. Crea una barriera idrofobica che protegge l'argento da ossidazione, sudore e acqua, preservando la lucentezza a specchio.
              </p>
            </div>

            {/* Pilastro 4 */}
            <div className="p-6 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#8A5E58]/10 text-[#8A5E58] flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wider uppercase font-semibold">
                Moissanite GRA VVS1 D-Color
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Pietre gemmologiche con indice di rifrazione 2.65 (superiore al diamante 2.42) e durezza 9.25 Mohs. Ogni pietra è incisa al laser con codice seriale univoco registrato sul database internazionale GRA.
              </p>
            </div>

          </div>
        </section>

        {/* TABELLA COMPARATIVA */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Confronto Trasparente
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
              Bigiotteria vs Isabel Pepe Demi-Fine vs Alta Gioielleria
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#F0E6E1] shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#F0E6E1] font-serif uppercase tracking-wider text-gray-900">
                <tr>
                  <th className="p-3.5 sm:p-4">Caratteristica</th>
                  <th className="p-3.5 sm:p-4 text-gray-500 font-normal">Bigiotteria Comune</th>
                  <th className="p-3.5 sm:p-4 text-[#8A5E58] font-bold bg-[#FAF3F0]/60">Isabel Pepe Demi-Fine</th>
                  <th className="p-3.5 sm:p-4 text-gray-500 font-normal">Alta Gioielleria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E6E1] text-gray-600 font-light">
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Metallo Base</td>
                  <td className="p-3.5 sm:p-4">Ottone, Rame, Zama</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-gray-900 bg-[#FAF3F0]/30">100% Argento 925 Sterling</td>
                  <td className="p-3.5 sm:p-4">Oro Massiccio 18K/750</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Spessore Placcatura</td>
                  <td className="p-3.5 sm:p-4">0.03 – 0.05 µm (Flash)</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-gray-900 bg-[#FAF3F0]/30">1.00 µm (20x più spesso)</td>
                  <td className="p-3.5 sm:p-4">Metallo pieno</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Protezione Ossidazione</td>
                  <td className="p-3.5 sm:p-4">Nessuna (annerisce rapido)</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-gray-900 bg-[#FAF3F0]/30">Scudo E-Coating Waterproof</td>
                  <td className="p-3.5 sm:p-4">Non necessaria</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Pietre &amp; Gemme</td>
                  <td className="p-3.5 sm:p-4">Vetro, Zirconi economici</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-gray-900 bg-[#FAF3F0]/30">Moissanite GRA VVS1 D-Color</td>
                  <td className="p-3.5 sm:p-4">Diamanti naturali</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Anallergicità</td>
                  <td className="p-3.5 sm:p-4">Bassa (spesso irritante)</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-[#8A5E58] bg-[#FAF3F0]/30">100% Ipoallergenico REACH</td>
                  <td className="p-3.5 sm:p-4">100% Ipoallergenico</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Fascia di Prezzo</td>
                  <td className="p-3.5 sm:p-4">€15 – €50</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-[#8A5E58] bg-[#FAF3F0]/30">€110 – €385</td>
                  <td className="p-3.5 sm:p-4">€2.000 – €20.000+</td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-gray-900">Durata nel Tempo</td>
                  <td className="p-3.5 sm:p-4">Poche settimane / mesi</td>
                  <td className="p-3.5 sm:p-4 font-semibold text-gray-900 bg-[#FAF3F0]/30">Anni con lucentezza inalterata</td>
                  <td className="p-3.5 sm:p-4">Generazioni</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CURATED SHOWCASE */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Icone Demi-Fine
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
              Le Nostre Creazioni Più Rappresentative
            </h2>
            <p className="text-xs text-gray-500 max-w-lg mx-auto font-light">
              Punti luce, parure e bracciali rifiniti a mano in Argento 925 e Oro 18K.
            </p>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* CARE & PRESERVATION GUIDE */}
        <section className="bg-[#FAF8F5] border border-[#F0E6E1] rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-bold block">
              Consigli di Manutenzione
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
              Come Prendersi Cura dei Gioielli Demi-Fine
            </h2>
            <p className="text-xs text-gray-600 font-light max-w-xl mx-auto">
              Piccoli accorgimenti quotidiani per mantenere inalterata la lucentezza a specchio delle tue creazioni:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-gray-700">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#F0E6E1]">
              <Sparkles size={18} className="text-[#8A5E58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-1">Panno in Microfibra Dedicato</strong>
                Usa il panno speciale incluso nel Cofanetto Luxury per rimuovere polvere e impronte dopo ogni indosso.
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#F0E6E1]">
              <Droplets size={18} className="text-[#8A5E58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-1">Profumi e Cosmetici</strong>
                Indossa il tuo gioiello come ultimo tocco, dopo aver applicato profumi, creme corpo o lacche.
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#F0E6E1]">
              <Shield size={18} className="text-[#8A5E58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-1">Evitare Agenti Chimici</strong>
                Rimuovi i gioielli prima di entrare in vasche termali solfuree o durante l'uso di candeggina e solventi.
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#F0E6E1]">
              <Package size={18} className="text-[#8A5E58] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-semibold mb-1">Custodia nel Cofanetto</strong>
                Riponi sempre i gioielli separatamente nell'astuccio rigido per evitare sfregamenti accidentali tra le montature.
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section>
          <ProductTrustBadges product={representativeProduct} />
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Domande Tecniche &amp; Curiosità
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 uppercase tracking-wider font-light">
              Tutto Quello Che C'è da Sapere sul Demi-Fine
            </h2>
          </div>

          <FaqSection faqs={faqs} />
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Vivi il Lusso Quotidiano
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl uppercase tracking-wider font-light">
              Scopri la Collezione Demi-Fine Isabel Pepe
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Argento 925, placcatura Oro 18K 1.0 Micron, Moissanite GRA e Cofanetto Luxury incluso in ogni ordine.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block px-8 py-3.5 bg-[#8A5E58] hover:bg-[#A8827B] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold rounded-full transition-all duration-300 shadow-md"
              >
                Esplora lo Shop
              </Link>
            </div>
          </div>
        </section>

      </article>
    </div>
  );
}
