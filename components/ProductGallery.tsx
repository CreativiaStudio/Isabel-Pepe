"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtra solo le immagini effettivamente valide (esclude stringhe vuote)
  const validImages = (images || []).filter(Boolean);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  if (validImages.length === 0) {
    return (
      <div className="w-full lg:w-3/5 bg-[#F9F8F6] aspect-square rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Nessuna immagine disponibile
      </div>
    );
  }

  return (
    <>
      {/* GALLERIA MOBILE: TOUCH HORIZONTAL SWIPE CAROUSEL (< md) */}
      <div className="w-full md:hidden mb-6">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 scrollbar-none">
          {validImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => openLightbox(idx)}
              className="snap-center shrink-0 w-[88vw] aspect-[4/5] bg-[#F9F8F6] rounded-2xl overflow-hidden shadow-sm relative cursor-zoom-in"
            >
              <img 
                src={img} 
                alt={`${productName} - Vista ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-mono px-2.5 py-1 rounded-full">
                {idx + 1} / {validImages.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GALLERIA DESKTOP: MASONRY ZARA-STYLE STICKY (>= md) */}
      <div className="hidden md:block w-full lg:w-3/5 lg:sticky lg:top-32 self-start">
        {/* LAYOUT 1 FOTO */}
        {validImages.length === 1 && (
          <div 
            onClick={() => openLightbox(0)} 
            className="w-full bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group rounded-xl aspect-[4/5] shadow-sm"
          >
            <img 
              src={validImages[0]} 
              alt={`${productName} - Immagine 1`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
        )}

        {/* LAYOUT 2 FOTO (AFFIANCATE SIMMETRICHE) */}
        {validImages.length === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {validImages.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => openLightbox(idx)} 
                className="bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group aspect-[4/5] rounded-xl shadow-sm"
              >
                <img 
                  src={img} 
                  alt={`${productName} - Immagine ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
            ))}
          </div>
        )}

        {/* LAYOUT 3 FOTO (1 GRANDE + 2 PICCOLE A DESTRA) */}
        {validImages.length === 3 && (
          <div className="grid grid-cols-5 gap-4">
            <div 
              onClick={() => openLightbox(0)} 
              className="col-span-3 bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group aspect-[4/5] rounded-xl shadow-sm"
            >
              <img 
                src={validImages[0]} 
                alt={`${productName} - Vista 1`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            <div className="col-span-2 flex flex-col gap-4">
              {validImages.slice(1, 3).map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openLightbox(idx + 1)} 
                  className="flex-1 bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group rounded-xl shadow-sm min-h-[140px]"
                >
                  <img 
                    src={img} 
                    alt={`${productName} - Vista ${idx + 2}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT 4 FOTO (GRIGLIA 2x2 SIMMETRICA) */}
        {validImages.length === 4 && (
          <div className="grid grid-cols-2 gap-4">
            {validImages.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => openLightbox(idx)} 
                className="bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group aspect-square rounded-xl shadow-sm"
              >
                <img 
                  src={img} 
                  alt={`${productName} - Vista ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
            ))}
          </div>
        )}

        {/* LAYOUT 5 FOTO (MASONRY COMPLETO) */}
        {validImages.length >= 5 && (
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 flex flex-col gap-4">
              <div 
                onClick={() => openLightbox(0)} 
                className="bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group aspect-[4/5] rounded-xl shadow-sm"
              >
                <img src={validImages[0]} alt={`${productName} - Vista 1`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              {validImages[3] && (
                <div 
                  onClick={() => openLightbox(3)} 
                  className="bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group aspect-square rounded-xl shadow-sm"
                >
                  <img src={validImages[3]} alt={`${productName} - Vista 4`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-4">
              {[validImages[1], validImages[2], validImages[4]].filter(Boolean).map((img, idx) => {
                const actualIdx = img === validImages[1] ? 1 : img === validImages[2] ? 2 : 4;
                return (
                  <div 
                    key={idx} 
                    onClick={() => openLightbox(actualIdx)} 
                    className="flex-1 bg-[#F9F8F6] relative cursor-zoom-in overflow-hidden group rounded-xl shadow-sm min-h-[140px]"
                  >
                    <img src={img} alt={`${productName} - Vista ${actualIdx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <div className="absolute inset-0 bg-[#FCE5E7] opacity-95 backdrop-blur-md"></div>

          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-2 text-gray-800 hover:text-black hover:bg-white/50 rounded-full transition"
          >
            <X size={32} strokeWidth={1.5} />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-4 sm:left-12 z-50 p-3 text-gray-800 hover:text-black bg-white/30 hover:bg-white/70 rounded-full transition shadow-sm"
          >
            <ChevronLeft size={32} strokeWidth={1.5} />
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-4 sm:right-12 z-50 p-3 text-gray-800 hover:text-black bg-white/30 hover:bg-white/70 rounded-full transition shadow-sm"
          >
            <ChevronRight size={32} strokeWidth={1.5} />
          </button>

          <div className="relative z-10 w-full h-[85vh] flex items-center justify-center">
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={3}
              centerOnInit={true}
              centerZoomedOut={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: "zoomIn" }}
            >
              {() => (
                <TransformComponent 
                  wrapperClass="!w-full !h-full" 
                  contentClass="!w-full !h-full !flex !items-center !justify-center"
                >
                  <img
                    src={validImages[currentIndex]}
                    alt={`${productName} - Zoom ${currentIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm cursor-grab active:cursor-grabbing"
                  />
                </TransformComponent>
              )}
            </TransformWrapper>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-gray-800 font-medium text-sm tracking-widest uppercase bg-white/40 px-4 py-1.5 rounded-full">
            {currentIndex + 1} / {validImages.length}
          </div>
        </div>
      )}
    </>
  );
}
