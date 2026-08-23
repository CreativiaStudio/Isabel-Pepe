import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, Gem, Compass, Feather, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: "La Nostra Storia — L'Arte del Lusso Demi-Fine & Valori Etici",
  description:
    "Scopri la visione di Elena e Mario: gioielli demi-fine in Oro 18K concepiti per essere vissuti ogni giorno, alta manifattura e il 5% a sostegno degli animali.",
  openGraph: {
    title: "La Nostra Storia — Isabel Pepe & L'Arte di Splendere",
    description:
      "«La vera eleganza non si custodisce in cassaforte: si indossa». Scopri la storia dei fondatori Elena e Mario e l'atelier di lusso accessibile Isabel Pepe.",
  },
  twitter: {
    title: "Chi Siamo | Isabel Pepe Atelier Gioielli Demi-Fine",
    description:
      "Una passione nata per celebrare la bellezza quotidiana con gioielli demi-fine autentici, etici e duraturi.",
  },
};

export default function ChiSiamoPage() {
  return (
    <div className="bg-white min-h-screen pt-28 sm:pt-32 pb-24 text-[#1A1A1A]">
      
      {/* HERO SECTION CON FOTOGRAFIA EDITORIALE */}
      <section className="px-4 sm:px-6 mb-16 max-w-6xl mx-auto">
        
        {/* Banner Fotografico Luxury */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#F0E6E1] mb-12 aspect-[16/9] sm:aspect-[21/9] bg-[#FAF8F5]">
          <img 
            src="/Brand/chi_siamo_hero.jpg" 
            alt="Isabel Pepe — L'Arte di Splendere e la Musa Ispiratrice" 
            className="w-full h-full object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 right-6 sm:right-12 text-white">
            <span className="font-sans text-[10px] sm:text-xs text-[#E8D7D3] uppercase tracking-[0.35em] font-semibold block mb-2">
              La Nostra Filosofia & Storia
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-widest uppercase leading-tight drop-shadow-md">
              L'Arte di Splendere
            </h1>
          </div>
        </div>

        {/* BOX EDITORIALE CITAZIONE "CHI È ISABEL" */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative border-y border-[#F0E6E1] py-10 px-6 sm:px-12 bg-[#FAF8F5]/80 rounded-3xl shadow-xs">
            <span className="text-[#C0A09A] font-serif text-5xl leading-none absolute -top-5 left-1/2 -translate-x-1/2 bg-white px-4 font-normal select-none">
              “
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-gray-900 font-light tracking-wide mb-3">
              Chi è <span className="font-medium text-[#A8827B]">Isabel</span>?
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
              «Isabel è l'ideale di donna che ispira ogni nostra creazione, la luce che guida ogni nostra scelta.»
            </p>
            <div className="w-12 h-[1px] bg-[#C0A09A] mx-auto mt-6"></div>
          </div>
        </div>

      </section>

      {/* MANIFESTO / MUSA ISPIRATRICE */}
      <section className="px-6 mb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-sm text-gray-600 font-light leading-relaxed tracking-wide">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              La Nostra Visione
            </span>
            <h2 className="font-serif text-3xl text-gray-900 tracking-wider uppercase leading-tight">
              L'Ideale della Donna Isabel Pepe
            </h2>
            <p>
              Isabel è la donna che non ha bisogno di ostentare per farsi notare. È colei che cerca la luce nei dettagli impercettibili, che riconosce la vera qualità al primo tocco e che sceglie l'eterno al posto dell'effimero.
            </p>
            <p>
              <strong>Elena e Mario</strong> hanno fondato questo brand con una visione nitida e coraggiosa: portare l'emozione ed il valore del gioiello demi-fine nella vita di tutti i giorni. I gioielli non dovrebbero rimanere custoditi nell'oscurità di una cassaforte, ma accompagnarti nelle tue avventure quotidiane.
            </p>
          </div>

          {/* BOX ESEGETICO ISABEL vs PEPE */}
          <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-3xl space-y-8 shadow-sm">
            <div className="border-b border-[#F0E6E1] pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                L'Anima del Brand
              </span>
              <h3 className="font-serif text-2xl text-gray-900 tracking-widest uppercase">ISABEL</h3>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
                Rappresenta l'eleganza senza tempo, la grazia, la luce delle pietre più pure ed un design sofisticato.
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                Il Carattere ed il Cuore
              </span>
              <h3 className="font-serif text-2xl text-gray-900 tracking-widest uppercase">PEPE</h3>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
                Rappresenta il carattere, la forza, la realtà di ogni giorno, la determinazione e la concretezza di creazioni progettate per durare.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* BANNER DEDICATO ALL'IMPEGNO PER GLI ANIMALI */}
      <section className="bg-[#FAF8F5] border-y border-[#F0E6E1] py-20 px-6 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="w-16 h-16 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Heart size={30} strokeWidth={1.5} />
          </div>

          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.35em] font-semibold block mb-3">
            L'Arte del Dono & Etica Sostenibile
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 tracking-wider uppercase mb-6">
            Una Bellezza Che Protegge la Vita
          </h2>

          <p className="font-sans text-sm text-gray-600 font-light leading-relaxed max-w-2xl mx-auto mb-8 tracking-wide">
            Crediamo fermamente che la vera eleganza risieda nella sensibilità e nella cura del mondo che ci circonda. Per questo motivo, <strong>Isabel Pepe sostiene attivamente i volontari indipendenti che ogni giorno dedicano la propria vita a salvare e accudire animali in difficoltà</strong>.
          </p>

          <div className="bg-white border border-[#F0E6E1] p-8 rounded-2xl max-w-xl mx-auto text-left shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-900 font-semibold">
              <Sparkles size={16} className="text-[#C0A09A]" />
              <span>Il Nostro Impegno Concreto</span>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Il 5% di ogni tua creazione Isabel Pepe viene devoluto direttamente a volontari selezionati con amore. Scegliere un nostro gioiello significa indossare un simbolo di luce che custodisce una promessa concreta verso chi non ha voce.
            </p>
            <div className="pt-2">
              <Link href="/impegno-animali" className="text-xs uppercase tracking-widest text-[#C0A09A] font-semibold hover:underline">
                Scopri la Nostra Missione Etica →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* MATERIALI & ECCELLENZA */}
      <section className="px-6 mb-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-2">
            Maestria e Innovazione
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 tracking-widest uppercase">
            Creazioni Fatte per Vivere
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="border border-gray-100 p-8 rounded-2xl bg-white shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Gem size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">Pietre di Pura Luce</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Pietre selezionate con Taglio Brillante VVS1 D-Color e perle d'acqua dolce naturali ad altissima rifrazione di luce ed inalterabili.
            </p>
          </div>

          <div className="border border-gray-100 p-8 rounded-2xl bg-white shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Feather size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">Doppio Scudo Protettivo</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Base in Argento 925 nichel-free con placcatura Oro 18K (1.0µm, 20x più spessa) o Rodio puro a specchio e sigillo E-Coating.
            </p>
          </div>

          <div className="border border-gray-100 p-8 rounded-2xl bg-white shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Compass size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">Per la Vita di Tutti i Giorni</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Ogni gioiello è pensato per accompagnarti nei tuoi viaggi, nelle tue giornate di lavoro e nelle serate speciali.
            </p>
          </div>

        </div>
      </section>

      {/* CTA FINALE */}
      <section className="px-6 max-w-4xl mx-auto text-center">
        <div className="bg-[#1A1A1A] text-white p-12 rounded-3xl shadow-xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-3">
            Scopri la Collezione
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase mb-6">
            Esplora le Creazioni Isabel Pepe
          </h2>
          <p className="text-xs text-gray-400 font-light leading-relaxed max-w-xl mx-auto mb-8">
            Trova il gioiello che riflette il tuo carattere e celebra la tua luce interiore.
          </p>
          <Link 
            href="/shop" 
            className="inline-block bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.25em] px-10 py-4 rounded-xl transition-all duration-300 shadow-md"
          >
            Scegli il Tuo Gioiello
          </Link>
        </div>
      </section>

    </div>
  );
}
