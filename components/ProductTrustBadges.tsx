'use client';

import React, { useState } from 'react';
import { ShieldCheck, Gift, Truck, Heart, X, Award, CheckCircle2, Lock, Sparkles, Gem } from 'lucide-react';

interface ProductTrustBadgesProps {
  product: {
    name: string;
    gemstone?: string;
    materials?: string;
    description?: string;
  };
}

export default function ProductTrustBadges({ product }: ProductTrustBadgesProps) {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const isPearl = Boolean(
    (product.gemstone?.toLowerCase().includes('perl') || 
     product.name.toLowerCase().includes('perl') || 
     product.materials?.toLowerCase().includes('perl'))
  );

  const isMoissanite = Boolean(
    (product.gemstone?.toLowerCase().includes('moissanite') || 
     product.gemstone?.toLowerCase().includes('vvs1') || 
     product.gemstone?.toLowerCase().includes('d-color') ||
     product.name.toLowerCase().includes('moissanite') ||
     product.description?.toLowerCase()?.includes('moissanite') ||
     (!isPearl && product.gemstone && product.gemstone !== '-'))
  );

  return (
    <>
      {/* 4 Pilastri di Fiducia — 100% Simmetrici */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 border-y border-gray-100 py-4 sm:py-5 mb-6 items-stretch">
        
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

        {/* 2. Cofanetto Luxury (Panno & Box) */}
        <div className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60">
          <Gift size={20} className="text-[#C0A09A] mb-1.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center">
            Cofanetto<br />Luxury
          </span>
          <span className="text-[9px] text-gray-500 font-light leading-snug">
            Panno & Astuccio
          </span>
        </div>

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

      {/* Banner Certificato Dinamico (Perle vs Moissanite vs Argento) */}
      <div className="mb-8 p-3.5 sm:p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#C0A09A]/15 flex items-center justify-center text-[#8A5E58] shrink-0">
            {isMoissanite ? <Gem size={18} /> : <Award size={18} />}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#C0A09A] font-semibold block truncate">
              {isMoissanite ? "Certificazione Gemmologica Ufficiale" : "Garanzia Ufficiale di Qualità"}
            </span>
            <p className="text-xs text-gray-800 font-medium leading-tight truncate">
              {isPearl 
                ? "Certificato Perle Naturali d'Acqua Dolce" 
                : isMoissanite 
                ? "Certificato Ufficiale GRA Moissanite Incluso" 
                : "Certificato di Autenticità & Metalli Nobili"
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCertModalOpen(true)}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-gray-900 text-gray-900 hover:text-white border border-[#C0A09A]/50 hover:border-gray-900 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
        >
          {isMoissanite ? "Vedi Certificato GRA 🔍" : "Vedi Certificato 🔍"}
        </button>
      </div>

      {/* MODAL POPUP DINAMICO */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCertModalOpen(false)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Chiudi finestra certificato"
            >
              <X size={18} />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                {isMoissanite ? "Report Gemmologico Internazionale" : "Documento Ufficiale Isabel Pepe"}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-gray-900 tracking-wide">
                {isPearl 
                  ? "Certificato Perle Naturali d'Acqua Dolce" 
                  : isMoissanite 
                  ? "Certificato Gemmologico Ufficiale GRA" 
                  : "Certificato di Autenticità & Garanzia 24 Mesi"
                }
              </h3>
            </div>

            {/* Immagine Card Certificato con Protezione Totale Anti-Download */}
            <div 
              className="relative rounded-xl overflow-hidden shadow-lg border border-[#F0E6E1] mb-6 bg-[#FAF8F5] select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Invisible protection shield */}
              <div 
                className="absolute inset-0 z-20 bg-transparent select-none cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />

              <img
                src={isMoissanite ? "/Brand/certificato_gra_moissanite_clean.webp" : "/Brand/certificato_perle_card_clean.webp"}
                alt={isMoissanite ? "Certificato GRA Moissanite" : "Certificato di Autenticità Isabel Pepe"}
                className="w-full h-auto object-contain pointer-events-none select-none user-select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>

            {/* Specifiche Garanzia in punti chiave Dinamiche */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#F0E6E1]/80 space-y-2.5 text-xs text-gray-600 font-light select-none">
              {isMoissanite ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Moissanite VVS1 D-Color: </strong>
                      Certificata dall'Istituto Gemmologico GRA per massima purezza, brillantezza e rifrazione della luce superiore al diamante.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Codice Seriale Univoco: </strong>
                      Ogni pietra presenta una micro-incisione laser sulla cintura con numero di serie verificabile tramite QR Code.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Doppio Scudo Protettivo: </strong>
                      100% Argento 925 con placcatura Oro 18K / Rodio Puro sigillata da Nano-Sigillo E-Coating.
                    </span>
                  </div>
                </>
              ) : isPearl ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Perle d'Acqua Dolce Coltivate: </strong>
                      Selezionate a mano per lucentezza organica e purezza (100% naturali).
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Metallo Nobile Certificato: </strong>
                      Argento Sterling 925 Nichel-Free con punzone legale S925 e sigillo laser "IP".
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Placcatura Oro 18K & E-Coating: </strong>
                      Spessore luxury da 1.0 Micron con scudo molecolare protettivo anti-ossidazione.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Argento Sterling 925: </strong>
                      100% anallergico e nichel-free, punzonato con marchio legale S925 e "IP".
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">Doppio Scudo Protettivo: </strong>
                      Placcatura Oro 18K / Rodio Puro + Nano-Sigillo Molecolare E-Coating.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal con Protezione Copyright */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-light select-none">
                <Lock size={13} className="text-[#C0A09A]" />
                <span>Documento Protetto da Copyright Isabel Pepe</span>
              </div>

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
