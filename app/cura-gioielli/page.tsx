import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Gem, Gift, Droplets, Sun, Feather } from 'lucide-react';

export default function CuraGioielliPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-3">
            Qualità & Manutenzione Haute Joaillerie
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-6 text-gray-900">
            Cura del Gioiello
          </h1>
          <p className="font-sans text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Ogni creazione Isabel Pepe è un’opera d’arte orafa concepita per risplendere al tuo fianco per sempre. Scopri i nostri standard di eccellenza ed i consigli per preservare la lucentezza dei tuoi gioielli.
          </p>
        </div>

        {/* HIGHLIGHT PRODOTTO: PLACCATURA ORO 18K & TRATTAMENTO */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-12 rounded-2xl mb-16 shadow-sm">
          <div className="flex items-center gap-3 text-[#C0A09A] mb-4">
            <Sparkles size={20} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold">Standard di Eccellenza Isabel Pepe</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider mb-6">
            Placcatura Oro 18K 20 Volte Superiore ed Anti-Ossidazione
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-600 leading-relaxed font-light">
            <div className="space-y-4">
              <p>
                A differenza della gioielleria comune che applica micron sottilissimi destinati a sbiadire velocemente, le creazioni <strong>Isabel Pepe</strong> sono realizzate su base <strong>Argento Sterling 925</strong> impreziosite da una placcatura in <strong>Oro 18 Karati fino a 20 volte più spessa</strong> dello standard di mercato.
              </p>
              <p>
                Questo elevato spessore assicura una tonalità dorata profonda, calda ed incredibilmente durevole nel tempo, resistente ai piccoli graffi quotidiani ed all'usura.
              </p>
            </div>

            <div className="space-y-4">
              <p>
                Ogni gioiello viene sottoposto a un esclusivo <strong>trattamento protettivo molecolare anti-ossidazione</strong> e sigillatura nano-tecnologica che impedisce l'imbrunire naturale dell'argento.
              </p>
              <p>
                I nostri pezzi sono <strong>100% anallergici</strong>, rigorosamente privi di Nichel, Piombo e Cadmio, sicuri anche sulle pelli più sensibili.
              </p>
            </div>
          </div>

          {/* BANNER REGALO: PANNO MICROFIBRA */}
          <div className="mt-8 pt-8 border-t border-[#F0E6E1] flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center flex-shrink-0">
              <Gift size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wide uppercase">Panno in Microfibra in Omaggio in Ogni Kit</h3>
              <p className="text-xs text-gray-500 font-light mt-1">
                All'interno di ciascun cofanetto d'acquisto Isabel Pepe troverai in omaggio il nostro speciale <strong>panno in microfibra lucidante delicata</strong> per la pulizia quotidiana dei tuoi preziosi.
              </p>
            </div>
          </div>
        </div>

        {/* 4 REGOLI FONDAMENTALI DI CURA */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl tracking-widest uppercase text-center text-gray-900 mb-10">
            I 4 Consigli d'Oro per la Manutenzione
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            <div className="border border-gray-100 p-8 rounded-xl bg-white shadow-sm hover:border-[#C0A09A]/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mb-4">
                <Droplets size={20} />
              </div>
              <h3 className="font-serif text-base text-gray-900 tracking-wide uppercase mb-2">1. Evita il contatto con prodotti chimici</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Profumi, lozioni per il corpo, lacche per capelli e detergenti aggressivi possono alterare la brillantezza della superficie. Indossa i tuoi gioielli Isabel Pepe come ultimo tocco dopo la tua routine di bellezza.
              </p>
            </div>

            <div className="border border-gray-100 p-8 rounded-xl bg-white shadow-sm hover:border-[#C0A09A]/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mb-4">
                <Sun size={20} />
              </div>
              <h3 className="font-serif text-base text-gray-900 tracking-wide uppercase mb-2">2. Attenzione all'Acqua e all'Attività Fisica</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Sebbene i nostri materiali siano di altissima qualità, consigliamo di rimuovere i gioielli prima di immergersi in piscina (cloro), al mare (salsedine) o durante sessioni intense di allenamento.
              </p>
            </div>

            <div className="border border-gray-100 p-8 rounded-xl bg-white shadow-sm hover:border-[#C0A09A]/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mb-4">
                <Feather size={20} />
              </div>
              <h3 className="font-serif text-base text-gray-900 tracking-wide uppercase mb-2">3. Pulizia Delicata con Microfibra</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Pulisci delicatamente il gioiello dopo averlo indossato utilizzando il panno morbido in omaggio incluso nel cofanetto. Non utilizzare mai spazzolini rigidi, detergenti chimici o panni abrasivi.
              </p>
            </div>

            <div className="border border-gray-100 p-8 rounded-xl bg-white shadow-sm hover:border-[#C0A09A]/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#C0A09A] flex items-center justify-center mb-4">
                <Gem size={20} />
              </div>
              <h3 className="font-serif text-base text-gray-900 tracking-wide uppercase mb-2">4. Conservazione nel Cofanetto Elegante</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Riponi ogni gioiello singolarmente nella sua custodia rigida Isabel Pepe per evitare lo sfregamento tra diversi metalli ed al riparo dall'umidità.
              </p>
            </div>

          </div>
        </div>

        {/* CTA ASSISTENZA */}
        <div className="bg-[#1A1A1A] text-white p-10 rounded-2xl text-center shadow-xl">
          <ShieldCheck size={36} className="text-[#C0A09A] mx-auto mb-4" />
          <h2 className="font-serif text-2xl tracking-widest uppercase mb-3">Hai Bisogno di Assistenza o Riparazioni?</h2>
          <p className="text-xs text-gray-400 font-light tracking-wide max-w-xl mx-auto mb-8">
            I nostri esperti in atelier sono sempre disponibili per consigli di pulizia straordinaria o supporto sulla garanzia di 24 mesi.
          </p>
          <Link href="/assistenza-clienti" className="inline-block bg-[#C0A09A] hover:bg-white text-white hover:text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.25em] px-8 py-4 transition-all duration-300">
            Contatta Concierge Boutique
          </Link>
        </div>

        {/* NAVIGAZIONE FOOTER */}
        <div className="mt-16 text-center border-t border-gray-100 pt-8">
          <Link href="/shop" className="text-xs uppercase tracking-[0.25em] text-gray-500 hover:text-gray-900 transition-colors">
            ← Esplora le Collezioni Isabel Pepe
          </Link>
        </div>

      </div>
    </div>
  );
}
