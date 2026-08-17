import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Heart, ShieldCheck, Sparkles, Footprints, Home, Stethoscope, Gift, ArrowRight, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: "L'Arte del Dono — Il 5% per il Benessere Animale",
  description:
    "Il 5% di ogni gioiello Isabel Pepe acquistato viene donato direttamente a rifugi e cure veterinarie per animali in difficoltà. Bellezza che protegge la vita.",
  openGraph: {
    title: "L'Arte del Dono — Il 5% per il Benessere Animale | Isabel Pepe",
    description:
      "Il 5% di ogni gioiello Isabel Pepe acquistato viene donato direttamente a rifugi e cure veterinarie per animali in difficoltà. Bellezza che protegge la vita.",
  },
};

export default function ImpegnoAnimaliPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-[#1A1A1A]">
      
      {/* HERO SECTION */}
      <section className="px-6 mb-20 max-w-4xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-[#C0A09A]/15 text-[#C0A09A] flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Heart size={32} strokeWidth={1.5} />
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

      {/* MANIFESTO E PERCHÉ QUESTA MISSIONE */}
      <section className="px-6 mb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-sm text-gray-600 font-light leading-relaxed tracking-wide">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              La Storia di Elena e Mario
            </span>
            <h2 className="font-serif text-3xl text-gray-900 tracking-wider uppercase">
              Una Passione Nata dal Cuore
            </h2>
            <p>
              Per noi di <strong>Isabel Pepe</strong>, l'amore per gli animali non è una semplice campagna o un dettaglio marginale: <strong>è la nostra missione di vita</strong> ed uno dei valori fondamentali attorno a cui abbiamo costruito l'intero brand.
            </p>
            <p>
              Fin dal primo giorno, io (Elena) e Mario abbiamo desiderato che ogni creazione Isabel Pepe non fosse soltanto un simbolo di bellezza da indossare, ma un vero e proprio <strong>veicolo di speranza e salvezza</strong> per gli animali che ogni giorno soffrono la solitudine, l'abbandono ed il maltrattamento.
            </p>
            <p className="italic font-serif text-[#C0A09A] text-base">
              "Dare una voce a chi non ce l'ha, trasformando la luce dei nostri gioielli in cibo, cure e calore."
            </p>
          </div>

          {/* CARD IMPATTO CONCRETO */}
          <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-[#C0A09A]">
              <Sparkles size={22} />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold">Il Nostro Impegno Concreto</span>
            </div>

            <h3 className="font-serif text-2xl text-gray-900 tracking-wider">
              Il 5% di Ogni Acquisto va a Salvare Vite
            </h3>

            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Per <strong>ogni singolo ordine</strong> effettuato nella nostra boutique online, destiniamo direttamente <strong>il 5% del ricavato</strong> a rifugi indipendenti, canili, gattili e volontari sul campo che dedicano le proprie giornate al salvataggio degli animali.
            </p>

            <div className="space-y-3 pt-4 border-t border-[#F0E6E1]">
              <div className="flex items-start gap-3 text-xs text-gray-700 font-light">
                <Footprints size={18} className="text-[#C0A09A] flex-shrink-0 mt-0.5" />
                <span><strong>100% Etico & Cruelty-Free:</strong> Nessun processo di lavorazione o packaging Isabel Pepe fa uso di derivati o materiali dannosi per gli animali.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-gray-700 font-light">
                <ShieldCheck size={18} className="text-[#C0A09A] flex-shrink-0 mt-0.5" />
                <span><strong>Trasparenza Totale:</strong> Condividiamo periodicamente con la nostra community i risultati dei fondi donati e le storie degli animali salvati.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* I 3 PILASTRI DELLA MISSIONE */}
      <section className="bg-[#FAF8F5] border-y border-[#F0E6E1] py-20 px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.35em] font-semibold block mb-2">
              Dove Vanno le Tue Donazioni
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 tracking-widest uppercase">
              I Pilastri del Nostro Sostegno
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PILASTRO 1 */}
            <div className="bg-white border border-[#F0E6E1] p-8 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-6">
                <Stethoscope size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-3">
                1. Cure Veterinarie d'Emergenza
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Finanziamo interventi chirurgici d'urgenza, vaccini, medicinali ed esami diagnostici per animali trovati feriti o in grave stato di malnutrizione.
              </p>
            </div>

            {/* PILASTRO 2 */}
            <div className="bg-white border border-[#F0E6E1] p-8 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-6">
                <Home size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-3">
                2. Cibo & Riparo nei Rifugi
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Forniamo cibo di qualità, coperte per l'inverno e fondi per migliorare le strutture di accoglienza temporanea ed i stalli di stallo in attesa di adozione.
              </p>
            </div>

            {/* PILASTRO 3 */}
            <div className="bg-white border border-[#F0E6E1] p-8 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mx-auto mb-6">
                <HeartHandshake size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg text-gray-900 uppercase tracking-wider mb-3">
                3. Lotta all'Abbandono & Adozioni
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Promuoviamo campagne di sensibilizzazione contro l'abbandono estivo ed aiutiamo i volontari locali a trovare famiglie pronte ad amare per sempre.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CITAZIONE CHIC & BRAND SYMBOLISM */}
      <section className="px-6 mb-24 max-w-4xl mx-auto text-center">
        <div className="border border-[#F0E6E1] p-10 sm:p-14 rounded-3xl bg-[#FAF8F5] relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#C0A09A] font-semibold block mb-4">
            Un Simbolo da Indossare con Orgoglio
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider leading-relaxed max-w-2xl mx-auto mb-6">
            «Ogni volta che indossi un gioiello Isabel Pepe, la sua luce racconta la storia di chi ha scelto di splendere anche per chi non ha voce.»
          </h2>
          <p className="text-xs text-gray-500 font-light tracking-widest uppercase">
            — Elena & Mario Pepe, Fondatori di Isabel Pepe
          </p>
        </div>
      </section>

      {/* CTA SHOPPING ED ASSOCIAZIONI */}
      <section className="px-6 max-w-4xl mx-auto text-center">
        <div className="bg-[#1A1A1A] text-white p-12 rounded-2xl shadow-xl">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase mb-4">
            Sostieni la Nostra Missione
          </h2>
          <p className="text-xs text-gray-400 font-light leading-relaxed max-w-xl mx-auto mb-8">
            Esplora le nostre collezioni demi-fine e diventa parte attiva del nostro progetto di salvataggio ed amore per gli animali.
          </p>

          <div className="flex items-center justify-center">
            <Link 
              href="/shop" 
              className="w-full sm:w-auto bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.25em] px-8 py-4 transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-xl"
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
