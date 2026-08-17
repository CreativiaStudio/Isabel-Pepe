'use client';

import React, { useState, useEffect } from 'react';
import { Ruler, X, Sparkles, Check, Info, ShieldCheck } from 'lucide-react';

export default function RingSizeSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="mb-8">
      {/* Box Selezione Misura Luxury */}
      <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C0A09A]"></span>
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-gray-900">
              Misura Anello
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-[#C0A09A] hover:text-[#9E7D77] font-medium flex items-center gap-1.5 transition-colors group cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#F0E6E1] shadow-2xs hover:shadow-xs"
          >
            <Ruler size={13} className="group-hover:scale-110 transition-transform" />
            <span className="underline underline-offset-2">Guida alle Taglie (Pop-up)</span>
          </button>
        </div>

        {/* Pillola Misura Attiva Selezionata */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border-2 border-gray-900 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#F0E6E1] flex items-center justify-center font-serif text-sm font-bold text-gray-900">
              12
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-gray-900">Taglia Unica 12 (IT)</span>
                <span className="bg-[#F5EBE9] text-[#8A6A64] text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full">
                  Ø 16.5 mm
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-light block mt-0.5">
                Diametro interno: <strong>16.5 mm</strong> • Circonferenza: <strong>52 mm</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Informazione Trasparenza & Vestibilità */}
        <div className="mt-3 pt-3 border-t border-[#F0E6E1]/70 flex items-start gap-2 text-xs text-gray-600 font-light leading-relaxed">
          <Sparkles size={14} className="text-[#C0A09A] shrink-0 mt-0.5" />
          <p>
            Questo anello è realizzato nella <strong>misura standard italiana 12 (Ø 16.5 mm)</strong>, la taglia più versatile e confortevole per anulare, medio o indice.
          </p>
        </div>
      </div>

      {/* POPUP / MODAL INTERATTIVO GUIDA TAGLIE */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-5 border-b flex justify-between items-center bg-[#FAF8F5] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EBE9] text-[#C0A09A] flex items-center justify-center shadow-2xs">
                  <Ruler size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900">Guida alla Misura Anello</h3>
                  <p className="text-xs text-gray-500 font-light">Specifiche e verifica della Taglia Unica 12 (IT)</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200/60 transition cursor-pointer"
                title="Chiudi (ESC)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenuto Scrollabile */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Box Scheda Tecnica Misura */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#F0E6E1]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold">
                    Dati di Calibrazione Ufficiale
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Taglia di Collezione
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Misura Italia (IT)</span>
                    <strong className="text-xl text-gray-900 font-serif">Taglia 12</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Diametro Interno</span>
                    <strong className="text-sm text-[#C0A09A] font-mono font-bold">16.5 mm (1.65 cm)</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Circonferenza Dito</span>
                    <strong className="text-sm text-gray-800 font-mono font-bold">51.8 - 52.0 mm</strong>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Equivalente USA</span>
                    <strong className="text-xl text-gray-700 font-serif">US 6</strong>
                  </div>
                </div>
              </div>

              {/* Istruzioni pratiche in 2 passaggi */}
              <div className="space-y-3.5">
                <h4 className="font-serif text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-[#C0A09A]" />
                  Come verificare la tua misura a casa:
                </h4>

                {/* Metodo 1 */}
                <div className="border border-gray-100 bg-gray-50/70 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#C0A09A] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Con un anello che indossi già (Metodo più preciso)</span>
                  </div>
                  <p className="text-xs text-gray-600 font-light leading-relaxed pl-7">
                    Prendi un anello della misura giusta e misura con un righello il <strong>diametro interno</strong> (la distanza da bordo a bordo interno, senza considerare lo spessore del metallo). Se misura <strong>circa 16.5 mm</strong>, la Taglia 12 è perfetta per te!
                  </p>
                </div>

                {/* Metodo 2 */}
                <div className="border border-gray-100 bg-gray-50/70 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#C0A09A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Con una striscia di carta o un filo</span>
                  </div>
                  <p className="text-xs text-gray-600 font-light leading-relaxed pl-7">
                    Avvolgi una strisciolina di carta attorno al dito, segna con una penna il punto di incontro e stendila su un righello. Se misura <strong>circa 5.2 cm (52 mm)</strong>, corrisponde esattamente alla Taglia 12.
                  </p>
                </div>
              </div>

              {/* Consiglio Vestibilità */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6E1] text-xs text-gray-600 space-y-1">
                <span className="font-semibold text-gray-900 block flex items-center gap-1.5">
                  <Info size={14} className="text-[#C0A09A]" /> Consiglio di Vestibilità:
                </span>
                <p className="font-light leading-relaxed">
                  La Taglia 12 (Ø 16.5 mm) è la misura standard regina della gioielleria femminile: se per l'anulare della tua mano dovesse risultare leggermente comoda o aderente, calzerà con grazia su dito medio o indice.
                </p>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
              >
                <Check size={14} /> Ho Verificato la Mia Misura
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
