import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Heart, ShieldCheck, Sparkles, Footprints, Gift, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: "L'Arte del Dono — Il Nostro Impegno per gli Animali",
  description:
    "Il 5% di ogni acquisto Isabel Pepe sostiene direttamente i volontari che dedicano la vita a salvare e accudire animali in difficoltà. Bellezza etica che protegge la vita.",
  openGraph: {
    title: "L'Arte del Dono — Il Nostro Impegno per gli Animali | Isabel Pepe",
    description:
      "Il 5% di ogni acquisto Isabel Pepe sostiene direttamente i volontari che dedicano la vita a salvare e accudire animali in difficoltà. Bellezza etica che protegge la vita.",
  },
};

export default function ImpegnoAnimaliPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-[#1A1A1A]">
      
      {/* HERO SECTION */}
      <section className="px-6 mb-20 max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-[#C0A09A]/15 text-[#C0A09A] flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Heart size={30} strokeWidth={1.5} />
        </div>
        <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.35em] font-semibold block mb-3">
          La Nostra Missione Etica & Il Nostro Cuore
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl tracking-widest uppercase mb-6 text-gray-900 leading-tight">
          L'Arte del Dono
        </h1>
        <p className="font-serif italic text-xl sm:text-2xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto border-y border-[#F0E6E1] py-8">
          «Crediamo che la vera eleganza non sia soltanto una questione di estetica, ma di profonda empatia verso ogni creatura indifesa.»
        </p>
      </section>

      {/* SEZIONE 1: LA PASSIONE DI ELENA CON FOTO EDITORIALE */}
      <section className="px-6 mb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-sm text-gray-600 font-light leading-relaxed tracking-wide">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Il Cuore di Isabel Pepe
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 tracking-wider uppercase leading-tight">
              Una Passione Nata dal Grande Cuore di Elena
            </h2>
            <p>
              Per noi di <strong>Isabel Pepe</strong>, l'amore per gli animali non è una semplice campagna o un dettaglio marginale: <strong>è la nostra missione di vita</strong> ed uno dei valori fondamentali attorno a cui abbiamo costruito l'intero brand.
            </p>
            <p>
              Ogni creazione Isabel Pepe non è soltanto un simbolo di bellezza da indossare, ma un vero e proprio <strong>veicolo di speranza e salvezza</strong> per gli animali che ogni giorno soffrono la solitudine, l'abbandono ed il maltrattamento.
            </p>

            {/* FRASE CHIAVE IN GRANDE RISALTO */}
            <div className="p-6 bg-[#FAF8F5] border-l-2 border-[#C0A09A] rounded-r-2xl shadow-xs my-6">
              <p className="font-serif italic text-lg sm:text-xl text-gray-900 font-light leading-relaxed">
                “Dare una voce a chi non ce l'ha, trasformando la luce dei nostri gioielli in cibo, cure e calore.”
              </p>
            </div>
          </div>

          {/* FOTO HERO ELENA & PET */}
          <div className="lg:col-span-5 relative group">
            <div className="relative overflow-hidden rounded-3xl aspect-[4/5] shadow-xl border border-[#F0E6E1] bg-[#FAF8F5]">
              <img 
                src="/Brand/elena-isabel-pepe-impegno-animali.jpg" 
                alt="Elena Isabel Pepe — Amore e impegno etico per la salvaguardia degli animali" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#E8D7D3] block font-semibold">
                  Amore Incondizionato
                </span>
                <span className="font-serif text-sm italic tracking-wider">
                  La luce che ispira ogni nostra scelta
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEZIONE 2: IL SOSTEGNO DIRETTO AI VOLONTARI SUL CAMPO */}
      <section className="bg-[#FAF8F5] border-y border-[#F0E6E1] py-20 px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* FOTO SECONDA EDITORIALE */}
            <div className="lg:col-span-5 order-2 lg:order-1 relative">
              <div className="relative overflow-hidden rounded-3xl aspect-[4/3] shadow-lg border border-[#F0E6E1] bg-white">
                <img 
                  src="/Brand/impegno_animali_kitten.jpg" 
                  alt="Cura e dedizione verso ogni creatura indifesa" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* TESTO IMPEGNO CONCRETO & SELEZIONE ENERGETICA */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-sm text-gray-600 font-light leading-relaxed tracking-wide">
              <div className="flex items-center gap-3 text-[#C0A09A]">
                <Sparkles size={20} />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold">Trasparenza & Dedizione</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 tracking-wider uppercase leading-tight">
                Il 5% di Ogni Acquisto va Direttamente ai Volontari
              </h2>

              <p>
                Non destiniamo le nostre donazioni a strutture convenzionate già sostenute da fondi pubblici. Il nostro aiuto va <strong>direttamente ai volontari indipendenti</strong>: persone straordinarie che ogni singolo giorno si dedicano anima e corpo sul campo per salvare, accogliere e nutrire animali invisibili o in pericolo.
              </p>

              <p>
                <strong>Elena seleziona personalmente ogni volontario</strong>: individui puri, autentici, che mettono il benessere degli animali al di sopra di tutto. Persone con un’energia speciale che si battono instancabilmente affinché ogni creatura possa trovare dignità, serenità e una famiglia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F0E6E1]">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-1">
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Footprints size={15} className="text-[#C0A09A]" /> 100% Etico & Cruelty-Free
                  </span>
                  <p className="text-[11px] text-gray-500 font-light">
                    Nessun materiale o packaging Isabel Pepe fa uso di derivati o elementi dannosi per gli animali.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-1">
                  <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-[#C0A09A]" /> Trasparenza & Cuore
                  </span>
                  <p className="text-[11px] text-gray-500 font-light">
                    Condividiamo regolarmente con la community l'impatto reale e le storie degli animali aiutati.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CITAZIONE CHIC & BRAND SYMBOLISM */}
      <section className="px-6 mb-24 max-w-4xl mx-auto text-center">
        <div className="border border-[#F0E6E1] p-10 sm:p-14 rounded-3xl bg-[#FAF8F5] relative overflow-hidden shadow-sm">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#C0A09A] font-semibold block mb-4">
            Un Simbolo da Indossare con Orgoglio
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider leading-relaxed max-w-2xl mx-auto mb-6">
            «Ogni volta che indossi un gioiello Isabel Pepe, la sua luce racconta la storia di chi ha scelto di splendere anche per chi non ha voce.»
          </h2>
          <p className="text-xs text-gray-500 font-light tracking-widest uppercase">
            — Elena & Mario, Fondatori di Isabel Pepe
          </p>
        </div>
      </section>

      {/* CTA SHOPPING FOCALIZZATA */}
      <section className="px-6 max-w-4xl mx-auto text-center">
        <div className="bg-[#1A1A1A] text-white p-12 rounded-3xl shadow-xl">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase mb-4">
            Sostieni la Nostra Missione
          </h2>
          <p className="text-xs text-gray-400 font-light leading-relaxed max-w-xl mx-auto mb-8">
            Esplora le nostre collezioni demi-fine e diventa parte attiva del nostro progetto di salvataggio ed amore per gli animali.
          </p>

          <div className="flex items-center justify-center">
            <Link 
              href="/shop" 
              className="w-full sm:w-auto bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.25em] px-9 py-4 transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-xl"
            >
              <Gift size={16} />
              Scegli il Tuo Gioiello
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
