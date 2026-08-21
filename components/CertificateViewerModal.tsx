'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  Layers, 
  Award, 
  Gem,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  CertificateType, 
  CERTIFICATE_PRESETS, 
  ProductCertificateInfo 
} from '@/lib/certificates';

interface CertificateViewerModalProps {
  buttonText?: string;
  className?: string;
  initialType?: CertificateType;
  /** Backwards compatibility prop */
  isPearl?: boolean;
}

export default function CertificateViewerModal({
  buttonText = "Visualizza Fac-Simile Certificato 🔍",
  className = "",
  initialType,
  isPearl,
}: CertificateViewerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine starting certificate preset
  const defaultType: CertificateType = initialType 
    ? initialType 
    : isPearl === true 
    ? 'pearl_gold' 
    : 'moissanite_gold';

  const [selectedType, setSelectedType] = useState<CertificateType>(defaultType);
  const currentPreset: ProductCertificateInfo = CERTIFICATE_PRESETS[selectedType];

  const [activeTabId, setActiveTabId] = useState<string>(
    currentPreset.tabs[0]?.id || 'card'
  );

  const handleCategoryChange = (type: CertificateType) => {
    setSelectedType(type);
    const newPreset = CERTIFICATE_PRESETS[type];
    if (newPreset?.tabs[0]) {
      setActiveTabId(newPreset.tabs[0].id);
    }
  };

  const currentTab = currentPreset.tabs.find((t) => t.id === activeTabId) || currentPreset.tabs[0];

  const getCategoryIcon = (type: CertificateType) => {
    switch (type) {
      case 'moissanite_gold':
      case 'moissanite_rhodium':
        return <Gem size={13} className="shrink-0" />;
      case 'pearl_gold':
        return <Sparkles size={13} className="shrink-0" />;
      case 'silver_crystals':
      default:
        return <Award size={13} className="shrink-0" />;
    }
  };

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
      <button
        type="button"
        onClick={() => {
          setSelectedType(defaultType);
          setActiveTabId(CERTIFICATE_PRESETS[defaultType]?.tabs[0]?.id || 'card');
          setIsOpen(true);
        }}
        className={className || "inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FAF8F5] text-gray-900 border border-[#C0A09A]/50 hover:border-[#C0A09A] rounded-full text-xs uppercase tracking-widest font-medium transition-all shadow-sm cursor-pointer"}
      >
        <Eye size={15} className="text-[#C0A09A]" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col p-4 sm:p-6 shadow-2xl border border-gray-100 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 z-40 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              aria-label="Chiudi finestra certificato"
            >
              <X size={16} />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-3 pr-8 pl-8 pt-1 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-0.5">
                Archivio Fac-Simile Certificazioni Ufficiali
              </span>
              <h3 className="font-serif text-lg sm:text-2xl text-gray-900 tracking-wide font-medium leading-tight">
                {currentPreset.modalTitle}
              </h3>
            </div>

            {/* Selettore Categorie 4-Tier */}
            <div className="mb-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#F0E6E1] shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-start sm:justify-center gap-1 min-w-max">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('moissanite_gold')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                    selectedType === 'moissanite_gold'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  {getCategoryIcon('moissanite_gold')}
                  <span>Moissanite &amp; Oro 18K</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('moissanite_rhodium')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                    selectedType === 'moissanite_rhodium'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  {getCategoryIcon('moissanite_rhodium')}
                  <span>Moissanite &amp; Rodio Puro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('pearl_gold')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                    selectedType === 'pearl_gold'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  {getCategoryIcon('pearl_gold')}
                  <span>Perle Naturali &amp; Oro 18K</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('silver_crystals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                    selectedType === 'silver_crystals'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                  }`}
                >
                  {getCategoryIcon('silver_crystals')}
                  <span>Argento 925 &amp; Cristalli</span>
                </button>
              </div>
            </div>

            {/* Sotto-Tabs per la categoria attiva (se > 1 tab) */}
            {currentPreset.tabs.length > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-3 p-1 bg-white rounded-lg border border-[#F0E6E1] shrink-0 overflow-x-auto scrollbar-none">
                {currentPreset.tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-[#8A5E58] text-white shadow-xs' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {getTabIcon(tab.id)}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`text-[8px] px-1 py-0.2 rounded font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
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
              
              {/* Immagine con Zoom Interattivo e Protezione Anti-Download */}
              <div 
                className="relative rounded-xl overflow-hidden shadow-sm border border-[#F0E6E1] bg-[#FAF8F5] select-none flex flex-col items-center justify-center p-2 min-h-[220px]"
                onContextMenu={(e) => e.preventDefault()}
              >
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
                      {/* Zoom Controls */}
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

                {/* Didascalia del Documento */}
                {currentTab.description && (
                  <p className="text-[10px] sm:text-[11px] text-gray-500 text-center mt-2 px-2 italic">
                    {currentTab.description}
                  </p>
                )}
              </div>

              {/* Specifiche Garanzia in punti chiave */}
              <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#F0E6E1]/80 space-y-2 text-[11px] sm:text-xs text-gray-600 font-light select-none">
                {currentPreset.features.map((feature, idx) => (
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
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-[#C0A09A] text-white text-[10px] sm:text-xs uppercase tracking-widest font-medium rounded-full transition-colors cursor-pointer"
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
