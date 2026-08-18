'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Eye } from 'lucide-react';

interface CertificateViewerModalProps {
  buttonText?: string;
  className?: string;
  isPearl?: boolean;
}

export default function CertificateViewerModal({
  buttonText = "Visualizza Fac-Simile Certificato 🔍",
  className = "",
  isPearl = true,
}: CertificateViewerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FAF8F5] text-gray-900 border border-[#C0A09A]/50 hover:border-[#C0A09A] rounded-full text-xs uppercase tracking-widest font-medium transition-all shadow-sm cursor-pointer"}
      >
        <Eye size={15} className="text-[#C0A09A]" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Chiudi finestra certificato"
            >
              <X size={18} />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1">
                Documento Ufficiale Isabel Pepe
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-gray-900 tracking-wide">
                Certificato di Autenticità & Qualità
              </h3>
            </div>

            {/* Immagine Card Certificato con Protezione Totale Anti-Download */}
            <div 
              className="relative rounded-xl overflow-hidden shadow-lg border border-[#F0E6E1] mb-6 bg-[#FAF8F5] select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Invisible protection shield over the image to block dragging & context menu */}
              <div 
                className="absolute inset-0 z-20 bg-transparent select-none cursor-default"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />

              <img
                src="/Brand/certificato_perle_card_clean.webp"
                alt="Certificato di Autenticità Isabel Pepe"
                className="w-full h-auto object-contain pointer-events-none select-none user-select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>

            {/* Specifiche Garanzia in punti chiave */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#F0E6E1]/80 space-y-2.5 text-xs text-gray-600 font-light select-none">
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
            </div>

            {/* Badge di Protezione & CTA Chiudi */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-light select-none">
                <Lock size={13} className="text-[#C0A09A]" />
                <span>Documento Protetto da Copyright Isabel Pepe</span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
