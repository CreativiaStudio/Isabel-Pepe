'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Gift, 
  Truck, 
  Heart, 
  X, 
  Award, 
  CheckCircle2, 
  Lock, 
  Gem, 
  BookOpen, 
  CreditCard, 
  Layers, 
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import PackagingModal from './PackagingModal';
import { getProductCertificateInfo, ProductCertificateInfo, ProductInput } from '@/lib/certificates';

interface ProductTrustBadgesProps {
  product: ProductInput & {
    name: string;
    gemstone?: string;
    materials?: string;
    plating?: string;
    description?: string;
    color?: string;
    sku?: string;
    category?: string;
  };
}

export default function ProductTrustBadges({ product }: ProductTrustBadgesProps) {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);

  // Deterministic 4-tier certificate classification
  const certInfo: ProductCertificateInfo = getProductCertificateInfo(product);

  const [activeTabId, setActiveTabId] = useState<string>(
    certInfo.tabs[0]?.id || 'card'
  );

  // Reset tab when product changes or modal opens
  useEffect(() => {
    if (certInfo.tabs[0]) {
      setActiveTabId(certInfo.tabs[0].id);
    }
  }, [product.sku, certInfo.certificateType]);

  const currentTab = certInfo.tabs.find((t) => t.id === activeTabId) || certInfo.tabs[0];

  const isMoissanite = certInfo.hasGraTabs;
  const isGold = certInfo.certificateType === 'moissanite_gold' || certInfo.certificateType === 'pearl_gold';

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'report':
        return <BookOpen size={13} className="shrink-0" />;
      case 'card':
        return <CreditCard size={13} className="shrink-0" />;
      case 'cover':
        return <Layers size={13} className="shrink-0" />;
      case 'flatlay':
        return <Sparkles size={13} className="shrink-0" />;
      case 'brand':
      default:
        return <Award size={13} className="shrink-0" />;
    }
  };

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
              Cofanetto Luxury Incluso
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
              {certInfo.badgeTitle}
            </span>
            <p className="text-xs text-gray-800 font-medium leading-tight truncate">
              {certInfo.badgeSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (certInfo.tabs[0]) {
              setActiveTabId(certInfo.tabs[0].id);
            }
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

      {/* MODAL POPUP CERTIFICATO AD ALTA RISOLUZIONE & MULTI-TAB */}
      {isCertModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
          onClick={() => setIsCertModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl border border-gray-100 overflow-hidden my-auto"
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
                {certInfo.modalCategory}
              </span>
              <h3 className="font-serif text-base sm:text-xl text-gray-900 tracking-wide font-medium leading-tight">
                {certInfo.modalTitle}
              </h3>
            </div>

            {/* Tabs di Navigazione Multi-Certificato Reattivi */}
            {certInfo.tabs.length > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-3 p-1 bg-[#FAF8F5] rounded-xl border border-[#F0E6E1] shrink-0 overflow-x-auto scrollbar-none">
                {certInfo.tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                      }`}
                    >
                      {getTabIcon(tab.id)}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Contenuto Scorrevole */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              
              {/* Immagine Documento con Zoom Interattivo e Protezione Anti-Download */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-sm border border-[#F0E6E1] bg-[#FAF8F5] select-none flex flex-col items-center justify-center p-2 min-h-[220px]"
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Visualizzatore con Zoom / Pan / Pinch */}
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={3}
                  doubleClick={{ disabled: false, mode: 'toggle', step: 0.8 }}
                  wheel={{ disabled: false, step: 0.2 }}
                  pinch={{ disabled: false }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {/* Zoom Controls Bar */}
                      <div className="w-full flex items-center justify-between px-2 py-1 mb-1 border-b border-[#F0E6E1]/60 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="text-[#C0A09A]" />
                          <span>Doppio click o pizzica per ingrandire</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => zoomIn()}
                            className="p-1 hover:bg-white rounded text-gray-700 transition"
                            title="Ingrandisci"
                            aria-label="Zoom in"
                          >
                            <ZoomIn size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => zoomOut()}
                            className="p-1 hover:bg-white rounded text-gray-700 transition"
                            title="Riduci"
                            aria-label="Zoom out"
                          >
                            <ZoomOut size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => resetTransform()}
                            className="p-1 hover:bg-white rounded text-gray-700 transition"
                            title="Ripristina zoom"
                            aria-label="Reset zoom"
                          >
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      </div>

                      <TransformComponent
                        wrapperClass="w-full flex items-center justify-center overflow-hidden"
                        contentClass="w-full flex items-center justify-center"
                      >
                        <div className="relative group flex items-center justify-center">
                          <img
                            src={currentTab.imageSrc}
                            alt={currentTab.alt}
                            className="w-full h-auto max-h-[250px] sm:max-h-[300px] object-contain pointer-events-auto select-none user-select-none mx-auto rounded-lg shadow-sm"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>

                {/* Didascalia del Documento Corrente */}
                {currentTab.description && (
                  <p className="text-[10px] sm:text-[11px] text-gray-500 text-center mt-2 px-2 italic">
                    {currentTab.description}
                  </p>
                )}
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
                {certInfo.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[#C0A09A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-900 font-medium">{feature.title}: </strong>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Footer Modal Fisso */}
            <div className="mt-2.5 flex items-center justify-between gap-3 pt-2 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-light select-none">
                <Lock size={12} className="text-[#C0A09A]" />
                <span>Documenti Ufficiali Protetti da Copyright Isabel Pepe</span>
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
