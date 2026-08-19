'use client';

import React, { useState } from 'react';
import { ShieldCheck, Gift, Truck, Heart, X, Award, CheckCircle2, Lock, Gem, BookOpen, CreditCard, Layers } from 'lucide-react';

import PackagingModal from './PackagingModal';

interface ProductTrustBadgesProps {
  product: {
    name: string;
    gemstone?: string;
    materials?: string;
    plating?: string;
    description?: string;
    color?: string;
    sku?: string;
  };
}

export default function ProductTrustBadges({ product }: ProductTrustBadgesProps) {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const [activeGraTab, setActiveGraTab] = useState<'report' | 'card' | 'cover' | 'brand'>('report');

  const nameLower = product.name?.toLowerCase() || '';
  const gemstoneLower = product.gemstone?.toLowerCase() || '';
  const materialsLower = product.materials?.toLowerCase() || '';
  const platingLower = product.plating?.toLowerCase() || '';
  const descLower = product.description?.toLowerCase() || '';
  const colorLower = product.color?.toLowerCase() || '';
  const skuLower = product.sku?.toLowerCase() || '';

  // 1. Gemstone classifications
  const isPearl = Boolean(
    gemstoneLower.includes('perl') || 
    nameLower.includes('perl') || 
    materialsLower.includes('perl') ||
    platingLower.includes('perl')
  );

  const isMoissanite = Boolean(
    !isPearl && (
      gemstoneLower.includes('moissanite') || 
      gemstoneLower.includes('vvs1') || 
      gemstoneLower.includes('d-color') ||
      nameLower.includes('moissanite') ||
      descLower.includes('moissanite') ||
      (product.gemstone && product.gemstone !== '-' && !gemstoneLower.includes('zircon') && !gemstoneLower.includes('cristall'))
    )
  );

  // 2. Finish / Plating classifications (Analisi chirurgica dei campi del database)
  const isGold = Boolean(
    isPearl || // Tutte le creazioni in perla sono 100% in Oro 18K
    platingLower.includes('oro') || 
    platingLower.includes('18k') || 
    platingLower.includes('gold') || 
    platingLower.includes('giallo') ||
    materialsLower.includes('oro') || 
    materialsLower.includes('18k') || 
    materialsLower.includes('gold') || 
    nameLower.includes('oro') || 
    nameLower.includes('gold') ||
    skuLower.includes('gold') ||
    colorLower.includes('oro') ||
    colorLower.includes('giallo') ||
    descLower.includes('oro 18k') ||
    descLower.includes('oro giallo')
  );

  const certImageSrc = isPearl
    ? '/Brand/certificato_perle_oro18k.webp'
    : isGold
    ? '/Brand/certificato_moissanite_oro18k.webp'
    : '/Brand/certificato_moissanite_rodio.webp';

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
            {isGold ? "Oro 18K • 1.0µm" : "Rodio • E-Coating"}
          </span>
        </div>

        {/* 2. Cofanetto Luxury (Panno & Box) - Cliccabile */}
        <div 
          onClick={() => setIsPackagingModalOpen(true)}
          className="flex flex-col items-center justify-center text-center p-3 bg-[#FAF8F5] hover:bg-[#FAF3F0] rounded-xl h-full min-h-[105px] border border-[#F0E6E1]/60 hover:border-[#C0A09A] transition-all cursor-pointer group shadow-2xs"
          title="Clicca per visualizzare il cofanetto e gli accessori inclusi"
        >
          <Gift size={20} className="text-[#8A5E58] mb-1.5 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-900 font-semibold leading-tight mb-1.5 min-h-[26px] flex flex-col justify-center">
            Cofanetto<br />Luxury
          </span>
          <span className="text-[9px] text-[#8A5E58] font-medium leading-snug flex items-center gap-0.5">
            <span>Vedi Foto</span>
            <span>➔</span>
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

      {/* Banner Cofanetto & Packaging Luxury */}
      <div className="mb-4 p-3.5 sm:p-4 bg-[#FAF7F5] border border-[#EADFD9] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#8A5E58]/10 flex items-center justify-center text-[#8A5E58] shrink-0">
            <Gift size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8A5E58] font-bold block truncate">
              Packaging d'Alta Gioielleria Incluso
            </span>
            <p className="text-xs text-gray-800 font-medium leading-tight truncate">
              Box rigido luxury, panno lucidante, box esterno & garanzia
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPackagingModalOpen(true)}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-gray-900 text-gray-900 hover:text-white border border-[#C0A09A]/50 hover:border-gray-900 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 shadow-2xs shrink-0 cursor-pointer"
        >
          Vedi Cofanetto 🎁
        </button>
      </div>

      {/* Banner Certificato Dinamico */}
      <div className="mb-8 p-3.5 sm:p-4 bg-[#FAF8F5] border border-[#F0E6E1] rounded-2xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#C0A09A]/15 flex items-center justify-center text-[#8A5E58] shrink-0">
            {isMoissanite ? <Gem size={18} /> : <Award size={18} />}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#C0A09A] font-semibold block truncate">
              {isMoissanite ? "Doppia Certificazione Inclusa" : "Garanzia Ufficiale di Qualità"}
            </span>
            <p className="text-xs text-gray-800 font-medium leading-tight truncate">
              {isPearl 
                ? "Certificato Perle Naturali d'Acqua Dolce & Oro 18K" 
                : isMoissanite 
                ? `Libretto Gemmologico GRA + Card di Garanzia & Certificato ${isGold ? 'Oro 18K' : 'Rodio'}` 
                : `Certificato di Autenticità & Metalli Nobili ${isGold ? 'Oro 18K' : 'Rodio'}`
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveGraTab('report');
            setIsCertModalOpen(true);
          }}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white hover:bg-gray-900 text-gray-900 hover:text-white border border-[#C0A09A]/50 hover:border-gray-900 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
        >
          {isMoissanite ? "Vedi Certificati GRA 🔍" : "Vedi Certificato 🔍"}
        </button>
      </div>

      {/* MODAL COFANETTO & PACKAGING */}
      <PackagingModal 
        isOpen={isPackagingModalOpen} 
        onClose={() => setIsPackagingModalOpen(false)} 
      />

      {/* MODAL POPUP PROFESSIONALE (VIEWPORT SAFE & TITOLO 100% VISIBILE) */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto pt-8 sm:pt-6 pb-6"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[84vh] flex flex-col p-4 sm:p-6 shadow-2xl border border-gray-100 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCertModalOpen(false)}
              className="absolute top-3.5 right-3.5 z-40 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              aria-label="Chiudi finestra certificato"
            >
              <X size={16} />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-3 pr-8 pl-8 pt-1 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-0.5">
                {isMoissanite ? "Certificazione Gemmologica & Garanzia di Lusso" : "Documento Ufficiale Isabel Pepe"}
              </span>
              <h3 className="font-serif text-base sm:text-lg text-gray-900 tracking-wide font-medium leading-tight">
                {isPearl 
                  ? "Certificato Ufficiale Perle & Oro 18K" 
                  : isMoissanite 
                  ? `Certificato Ufficiale GRA & Garanzia ${isGold ? 'Oro 18K' : 'Rodio Puro'}` 
                  : `Certificato di Autenticità & Garanzia ${isGold ? 'Oro 18K' : 'Rodio Puro'}`
                }
              </h3>
            </div>

            {/* Tabs di Navigazione Permanente (Solo Moissanite) */}
            {isMoissanite && (
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-3 p-1 bg-[#FAF8F5] rounded-xl border border-[#F0E6E1] shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveGraTab('report')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeGraTab === 'report' 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  <BookOpen size={12} />
                  <span>1. Libretto GRA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGraTab('card')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeGraTab === 'card' 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  <CreditCard size={12} />
                  <span>2. Card GRA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGraTab('cover')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeGraTab === 'cover' 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  <Layers size={12} />
                  <span>3. Copertina GRA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGraTab('brand')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeGraTab === 'brand' 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  <Award size={12} />
                  <span>4. Certificato Isabel Pepe</span>
                </button>
              </div>
            )}

            {/* Contenuto Scorrevole */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* Immagine Documento Raddrizzata con Protezione Anti-Download */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-sm border border-[#F0E6E1] bg-[#FAF8F5] select-none flex items-center justify-center p-2 min-h-[180px]"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Invisible protection shield */}
                <div 
                  className="absolute inset-0 z-20 bg-transparent select-none cursor-default"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />

                <img
                  src={
                    isMoissanite
                      ? activeGraTab === 'report'
                        ? '/Brand/gra_report_interno_privacy.webp'
                        : activeGraTab === 'card'
                        ? '/Brand/gra_card_privacy.webp'
                        : activeGraTab === 'cover'
                        ? '/Brand/gra_libretto_esterno.webp'
                        : certImageSrc
                      : certImageSrc
                  }
                  alt={isMoissanite ? "Documentazione Ufficiale GRA Moissanite" : "Certificato di Autenticità Isabel Pepe"}
                  className="w-full h-auto max-h-[230px] sm:max-h-[270px] object-contain pointer-events-none select-none user-select-none mx-auto rounded-lg shadow-sm"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>

              {/* Box Informativo Seriale Univoco & Privacy (Solo Moissanite) */}
              {isMoissanite && (
                <div className="bg-[#FAF8F5] border border-[#F0E6E1] rounded-xl p-3 flex items-start gap-2.5">
                  <Lock size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                  <div className="text-[11px] text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold block mb-0.5">
                      Caratura, Numero di Serie &amp; QR Code Univoci per Ogni Singola Pietra
                    </strong>
                    In questa anteprima caratura, misure, codice seriale e QR Code sono oscurati a tutela della privacy. 
                    Ogni gioiello in Moissanite acquistato include il proprio certificato nominale e la <strong>micro-incisione laser sulla cintura della pietra</strong> con matricola dedicata, verificabile online sul database ufficiale GRA.
                  </div>
                </div>
              )}

              {/* Specifiche Garanzia in punti chiave */}
              <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#F0E6E1]/80 space-y-2 text-[11px] sm:text-xs text-gray-600 font-light select-none">
                {isMoissanite ? (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">1. Libretto Ufficiale GRA: </strong>
                        Moissanite Grading Report con Grado Colore D, Purezza VVS1 e Taglio Excellent.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">2. Card Rigida di Garanzia GRA: </strong>
                        Tessera magnetica PVC per la registrazione e verifica online della gemma.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">3. Certificato Ufficiale Isabel Pepe: </strong>
                        Attesta la fusione in 100% Argento 925 Nichel-Free, placcatura {isGold ? 'Oro 18K (1.0 Micron)' : 'Rodio Puro a Specchio'} e Nano-Sigillo E-Coating.
                      </span>
                    </div>
                  </>
                ) : isPearl ? (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">Perle d'Acqua Dolce Coltivate: </strong>
                        Selezionate a mano per lucentezza organica e purezza (100% naturali).
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">Metallo Nobile Certificato: </strong>
                        Argento Sterling 925 Nichel-Free con punzone legale S925 e sigillo laser "IP".
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">Placcatura Oro 18K &amp; E-Coating: </strong>
                        Spessore luxury da 1.0 Micron con scudo molecolare protettivo anti-ossidazione.
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">Argento Sterling 925: </strong>
                        100% anallergico e nichel-free, punzonato con marchio legale S925 e "IP".
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900 font-medium">Doppio Scudo Protettivo: </strong>
                        Placcatura {isGold ? 'Oro 18K (1.0 Micron)' : 'Rodio Puro a Specchio'} + Nano-Sigillo Molecolare E-Coating.
                      </span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Footer Modal Fisso */}
            <div className="mt-2.5 flex items-center justify-between gap-3 pt-2 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-light select-none">
                <Lock size={12} className="text-[#C0A09A]" />
                <span>Documenti Ufficiali Protetti da Copyright</span>
              </div>

              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-[#C0A09A] text-white text-[10px] sm:text-xs uppercase tracking-widest font-medium rounded-full transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
