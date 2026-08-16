'use client';

import React, { useState, useEffect } from 'react';
import { Ruler, X, Check, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RingSizeSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chiudi premendo ESC
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
      {/* Box Selezione Misura */}
      <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
            <span>Misura Disponibile</span>
          </span>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-[#C0A09A] hover:text-[#A98983] font-medium flex items-center gap-1 hover:underline transition-all"
          >
            <Ruler size={13} />
            <span>Guida alle Misure (Pop-up)</span>
          </button>
        </div>

        {/* Pill Taglia Unica Selezionata */}
        <div className="flex items-center gap-3">
          <div className="border-2 border-gray-900 bg-white px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></div>
            <div>
              <div className="font-serif text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <span>Taglia Unica US 6</span>
                <span className="text-xs font-sans text-gray-500 font-normal">(Misura Italiana 12)</span>
              </div>
              <span className="text-[10px] text-gray-500 block font-light">Ø Diametro interno: 16.5 mm • Circonferenza: 52 mm</span>
            </div>
          </div>
        </div>

        {/* Avviso Trasparenza */}
        <p className="text-[11px] text-gray-500 font-light mt-2.5 leading-relaxed flex items-start gap-1.5">
          <Info size={13} className="text-[#C0A09A] shrink-0 mt-0.5" />
          <span>
            Creazione realizzata in <strong>Taglia Unica Standard US 6</strong> (la misura femminile più versatile per anulare, medio o indice).
          </span>
        </p>
      </div>

      {/* POPUP / MODAL GUIDA MISURE ANIELLO */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5 text-gray-900">
                <div className="p-2 bg-[#F5EBE9] text-[#C0A09A] rounded-lg">
                  <Ruler size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base uppercase tracking-wider text-gray-900">Guida alla Misura Anello</h3>
                  <p className="text-[11px] text-gray-500 font-light">Specifiche e calcolo della Taglia Unica US 6</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200/60 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Tabella Equivalenze */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F0E6E1]">
                <span className="text-[10px] uppercase tracking-widest text-[#C0A09A] font-semibold block mb-2">
                  Dati Tecnici di Questa Creazione
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase block">Misura USA</span>
                    <strong className="text-base text-gray-900 font-serif">US 6</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase block">Misura Italia / Europa</span>
                    <strong className="text-base text-gray-900 font-serif">IT 12 <span className="text-xs font-sans text-gray-400">(EU 52)</span></strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase block">Diametro Interno</span>
                    <strong className="text-sm text-gray-900 font-mono font-bold">16.5 mm (1.65 cm)</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <span className="text-gray-400 text-[10px] uppercase block">Circonferenza Dito</span>
                    <strong className="text-sm text-gray-900 font-mono font-bold">51.8 - 52.0 mm</strong>
                  </div>
                </div>
              </div>

              {/* Come verificare in 30 secondi */}
              <div className="space-y-3 text-xs text-gray-600 font-light leading-relaxed">
                <h4 className="font-serif text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#C0A09A]" />
                  Come verificare che sia la tua misura:
                </h4>

                <div className="border border-gray-100 p-3.5 rounded-lg bg-gray-50/50 space-y-1.5">
                  <strong className="text-gray-900 block font-medium">Metodo 1 • Con un anello che possiedi già</strong>
                  <p className="text-gray-600">
                    Prendi un anello della giusta misura e misura con un righello il <strong>diametro interno</strong> da bordo a bordo (escludendo lo spessore del metallo). Se misura <strong>circa 16.5 mm</strong>, l'anello calzerà alla perfezione.
                  </p>
                </div>

                <div className="border border-gray-100 p-3.5 rounded-lg bg-gray-50/50 space-y-1.5">
                  <strong className="text-gray-900 block font-medium">Metodo 2 • Con una striscia di carta o filo</strong>
                  <p className="text-gray-600">
                    Avvolgi una strisciolina di carta attorno alla base del dito desiderato, segna con una penna il punto in cui si sovrappone e misura la lunghezza con un righello. Se corrisponde a <strong>circa 5.2 cm (52 mm)</strong>, la taglia US 6 è esatta.
                  </p>
                </div>
              </div>

              {/* Consiglio di Stile & Vestibilità */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#F0E6E1] text-[11px] text-gray-600 space-y-1">
                <span className="font-semibold text-gray-900 block">✨ Consiglio di Vestibilità:</span>
                <p>
                  La taglia US 6 (IT 12) è la misura standard femminile più richiesta: è ideale per l'anulare della maggior parte delle mani, ma può essere indossata splendidamente anche su medio o indice a seconda della conformazione della mano.
                </p>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white text-xs uppercase tracking-widest font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check size={14} /> Ho Capito
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
