import React from 'react';
import Link from 'next/link';
import { Sparkles, HeartHandshake, ShieldCheck, Gem, Compass, Feather, Heart } from 'lucide-react';

export default function ChiSiamoPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-[#1A1A1A]">
      
      {/* HERO SECTION */}
      <section className="px-6 mb-20 max-w-4xl mx-auto text-center">
        <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.35em] font-semibold block mb-4">
          La Nostra Filosofia & Storia
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl tracking-widest uppercase mb-8 text-gray-900 leading-tight">
          L'Arte di Splendere
        </h1>
        <p className="font-serif italic text-xl sm:text-2xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto border-y border-[#F0E6E1] py-8">
          «Tutti ci chiedono: Chi è Isabel? Isabel è l'ideale di donna che ispira ogni nostra scelta.»
        </p>
      </section>

      {/* MANIFESTO / MUSA ISPRATRICE */}
      <section className="px-6 mb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-sm text-gray-600 font-light leading-relaxed tracking-wide">
            <h2 className="font-serif text-3xl text-gray-900 tracking-wider uppercase mb-2">
              L'Ideale della Donna Isabel Pepe
            </h2>
            <p>
              Isabel è la donna che non ha bisogno di ostentare per farsi notare. È colei che cerca la luce nei dettagli impercettibili, che riconosce la vera qualità al primo tocco e che sceglie l'eterno al posto dell'effimero.
            </p>
            <p>
              <strong>Elena</strong> ha fondato questo brand con una visione nitida e coraggiosa: portare la maestria e l'emozione dell'alta gioielleria nella vita di tutti i giorni. I gioielli non dovrebbero rimanere custoditi nell'oscurità di una cassaforte per le occasioni speciali, ma accompagnarti nelle tue avventure quotidiane.
            </p>
          </div>

          {/* BOX ESEGETICO ISABEL vs PEPE */}
          <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-2xl space-y-8 shadow-sm">
            <div className="border-b border-[#F0E6E1] pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                L'Anima del Brand
              </span>
              <h3 className="font-serif text-2xl text-gray-900 tracking-widest uppercase">ISABEL</h3>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
                Rappresenta l'eleganza senza tempo, la grazia, la luce della Moissanite più pura e le linee armoniose dell'alta oreficeria.
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                Il Carattere ed il Cuore
              </span>
              <h3 className="font-serif text-2xl text-gray-900 tracking-widest uppercase">PEPE</h3>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
                Rappresenta il carattere, la forza, la realtà di ogni giorno, la determinazione e la concretezza di materiali preziosi creati per durare.
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
            Crediamo fermamente che la vera eleganza risieda nella sensibilità e nella cura del mondo che ci circonda. Per questo motivo, <strong>Isabel Pepe sostiene attivamente chi ogni giorno dedica la propria vita a salvare, accogliere ed accudire gli animali in difficoltà</strong>.
          </p>

          <div className="bg-white border border-[#F0E6E1] p-8 rounded-xl max-w-xl mx-auto text-left shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-900 font-semibold">
              <Sparkles size={16} className="text-[#C0A09A]" />
              <span>Il Nostro Impegno Concreto</span>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Una quota di ogni tua creazione Isabel Pepe viene devoluta direttamente a rifugi ed enti no-profit dedicati alla salvaguardia degli animali. Scegliere un nostro gioiello significa indossare un simbolo di luce che custodisce una promessa d'amore verso i più deboli.
            </p>
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
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">Moissanite Più Pura</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Pietre selezionate con la massima brillantezza e rifrazione di luce superiore al diamante naturale, certificate ed inalterabili.
            </p>
          </div>

          <div className="border border-gray-100 p-8 rounded-2xl bg-white shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Feather size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-2">Argento 925 & Oro 18K</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Base in Argento Sterling con placcatura in Oro 18K spessa fino a 20 volte lo standard di mercato e protezione anti-ossidazione.
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
        <div className="bg-[#1A1A1A] text-white p-12 rounded-2xl shadow-xl">
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
            className="inline-block bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.25em] px-10 py-4 transition-all duration-300 shadow-md"
          >
            Vedi Tutti i Gioielli
          </Link>
        </div>
      </section>

    </div>
  );
}
