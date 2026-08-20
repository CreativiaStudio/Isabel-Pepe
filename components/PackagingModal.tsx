'use client';

import React, { useEffect } from 'react';
import { X, Sparkles, Gift, ShieldCheck, Sparkle, Package } from 'lucide-react';

interface PackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PackagingModal({ isOpen, onClose }: PackagingModalProps) {
  // Chiudi con il tasto ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-[#FAF8F6] border border-[#EADFD9] w-full max-w-3xl rounded-xs shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header con pulsante chiusura */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EADFD9] bg-white">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-[#8A5E58]" />
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#8A5E58] font-bold">
              Packaging & Cofanetto Esclusivo
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Chiudi finestra"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Titolo e Descrizione */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl uppercase tracking-widest text-[#1A1A1A]">
              L'Esperienza Unboxing
            </h3>
            <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed">
              Ogni creazione Isabel Pepe è custodita all'interno del nostro iconico packaging d'alta gioielleria, studiato nei minimi dettagli per stupire chi lo riceve.
            </p>
          </div>

          {/* Immagine Packaging Fotorealistica */}
          <div className="relative rounded-xs overflow-hidden border border-[#EADFD9] bg-white shadow-md group">
            <img 
              src="/Brand/cofanetto-luxury-packaging-isabel-pepe.jpg" 
              alt="Cofanetto Regalo Luxury Isabel Pepe con Certificato e Panno per Gioielli" 
              className="w-full h-[280px] sm:h-[380px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-sans flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#C0A09A]" />
              <span>Incluso in Ogni Ordine</span>
            </div>
          </div>

          {/* 4 Caratteristiche del Packaging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="bg-white p-4 rounded-xs border border-[#EADFD9] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8A5E58]">
                <Gift size={16} />
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Box Luxury per il Gioiello
                </h4>
              </div>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Cofanetto rigido con rivestimento vellutato soft-touch, pensato per preservare la lucentezza della montatura e delle pietre.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xs border border-[#EADFD9] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8A5E58]">
                <Package size={16} />
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Scatola Magnetica di Protezione
                </h4>
              </div>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Elegante scatola rigida con chiusura magnetica coordinata, pensata per una consegna impeccabile, sicura e un'apertura di prestigio.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xs border border-[#EADFD9] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8A5E58]">
                <ShieldCheck size={16} />
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Certificato di Autenticità
                </h4>
              </div>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Certificato gemmologico ufficiale GRA (per Moissanite) e scheda di garanzia ufficiale che ne attesta la qualità superiore.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xs border border-[#EADFD9] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8A5E58]">
                <Sparkle size={16} />
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Panno Lucidante Dedicato
                </h4>
              </div>
              <p className="font-sans text-xs text-gray-500 leading-relaxed">
                Panno professionale in microfibra ultrasoffice per la pulizia quotidiana e il mantenimento della massima brillantezza.
              </p>
            </div>

          </div>

          {/* Banner Valore Gratuito */}
          <div className="bg-[#FAF3F0] border border-[#C0A09A]/40 p-4 rounded-xs text-center space-y-1">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#8A5E58] font-bold block">
              Pronto per Essere Donato
            </span>
            <p className="font-sans text-xs text-[#1A1A1A]">
              Tutti i gioielli vengono spediti già confezionati come dono prezioso, senza indicazione di prezzo all'interno del pacco.
            </p>
          </div>

        </div>

        {/* Footer con bottone */}
        <div className="px-6 py-4 border-t border-[#EADFD9] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1A1A1A] hover:bg-[#8A5E58] text-white px-6 py-2.5 font-sans text-xs uppercase tracking-[0.2em] font-medium rounded-xs transition-colors cursor-pointer"
          >
            Ho Capito, Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
