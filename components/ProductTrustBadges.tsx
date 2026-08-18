'use client';

import React, { useState } from 'react';
import { ShieldCheck, Gift, Truck, Heart, X, Sparkles, CheckCircle2, Award } from 'lucide-react';

interface ProductTrustBadgesProps {
  product: {
    name: string;
    gemstone?: string;
    materials?: string;
  };
}

export default function ProductTrustBadges({ product }: ProductTrustBadgesProps) {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const isPearl = Boolean(
    (product.gemstone?.toLowerCase().includes('perl') || product.name.toLowerCase().includes('perl') || product.materials?.toLowerCase().includes('perl'))
  );

  const isMoissanite = Boolean(
    (product.gemstone?.toLowerCase().includes('moissanite') || product.gemstone?.toLowerCase().includes('vvs1') || product.gemstone?.toLowerCase().includes('d-color'))
  );

  return (
    <>
      {/* 4 Pilastri di Fiducia — 100% Simmetrici */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 border-y border-gray-100 py-4 sm:py-5 mb-8 items-stretch">
        
        {/* 1. Doppio Scudo */}
        <div className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60">
          <ShieldCheck size={20} className="text-[#C0A09A] mb-1.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center">
            Doppio<br />Scudo
          </span>
          <span className="text-[9px] text-gray-500 font-light leading-snug">
            {isPearl ? "Oro 18K • 1.0µm" : "18K & Rodio"}
          </span>
        </div>

        {/* 2. Cofanetto & Certificato (Interattivo con Popup Modal) */}
        <button
          type="button"
          onClick={() => setIsCertModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] hover:bg-[#F5ECE8] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60 hover:border-[#C0A09A]/40 transition-all duration-300 group cursor-pointer"
          title="Clicca per visualizzare il Certificato Ufficiale"
        >
          <Gift size={20} className="text-[#C0A09A] group-hover:scale-110 mb-1.5 shrink-0 transition-transform" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center group-hover:text-[#8A5E58] transition-colors">
            Cofanetto<br />Luxury
          </span>
          <span className="text-[9px] text-[#C0A09A] font-medium leading-snug underline decoration-[#C0A09A]/40 group-hover:decoration-[#C0A09A]">
            Vedi Certificato 🔍
          </span>
        </button>

        {/* 3. Consegna Express 48H */}
        <div className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60">
          <Truck size={20} className="text-[#C0A09A] mb-1.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center">
            Consegna<br />Express
          </span>
          <span className="text-[9px] text-gray-500 font-light leading-snug">
            48H • Reso 14gg
          </span>
        </div>

        {/* 4. L'Arte del Dono */}
        <div className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60">
          <Heart size={20} className="text-[#C0A09A] mb-1.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center">
            L'Arte del<br />Dono
          </span>
          <span className="text-[9px] text-gray-500 font-light leading-snug">
            5% agli Animali
          </span>
        </div>

      </div>

      {/* MODAL POPUP CERTIFICATO DI AUTENTICITÀ */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCertModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Chiudi finestra certificato"
            >
              <X size={18} />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                Isabel Pepe • Garanzia Ufficiale
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-gray-900 tracking-wide">
                {isPearl ? "Certificato Perle Naturali d'Acqua Dolce" : "Certificato Ufficiale di Autenticità"}
              </h3>
            </div>

            {/* Immagine Card Certificato con Protezione Totale Anti-Download */}
            <div 
              className="relative rounded-xl overflow-hidden shadow-lg border border-[#F0E6E1] mb-6 bg-[#FAF8F5] select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Invisible protection shield over the image */}
              <div 
                className="absolute inset-0 z-20 bg-transparent select-none cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />

              <img
                src="/Brand/certificato_perle_card_clean.webp"
                alt={`Certificato di Autenticità per ${product.name}`}
                className="w-full h-auto object-contain pointer-events-none select-none user-select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>

            {/* Specifiche Garanzia in punti chiave */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#F0E6E1]/80 space-y-2.5 text-xs text-gray-600 font-light">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900 font-medium">Autenticità Garantita: </strong>
                  {isPearl 
                    ? "Perle d'acqua dolce naturali coltivate, selezionate a mano per lucentezza satinata e fascino organico." 
                    : "Pietre VVS1 D-Color certificate con massima rifrazione della luce."
                  }
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900 font-medium">Metallo Nobile Certificato: </strong>
                  100% Argento Sterling 925 con punzonatura legale S925 e incisione laser del marchio "IP".
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900 font-medium">Incluso nel tuo ordine: </strong>
                  Cofanetto rigido di lusso Isabel Pepe e panno speciale in microfibra per la cura quotidiana.
                </span>
              </div>
            </div>

            {/* CTA Chiudi */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-[#C0A09A] text-white text-xs uppercase tracking-widest font-medium rounded-full transition-colors cursor-pointer"
              >
                Chiudi Anteprima
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
