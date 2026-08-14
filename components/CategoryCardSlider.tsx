'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryCardSliderProps {
  title: string;
  subtitle: string;
  categoryLink: string;
  ctaText: string;
  images: string[];
}

export default function CategoryCardSlider({
  title,
  subtitle,
  categoryLink,
  ctaText,
  images,
}: CategoryCardSliderProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Transizione automatica morbida ogni 3.5 secondi per mostrare le 2/3 foto modella
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images]);

  return (
    <Link
      href={categoryLink}
      className="relative group overflow-hidden h-[480px] rounded-xl shadow-lg block bg-gray-900 border border-gray-100/10"
    >
      {/* IMMAGINI MODELLA CON DISSOLVENZA FADE FLUIDA */}
      {images.map((imgUrl, index) => {
        const isActive = index === currentImgIndex;
        return (
          <img
            key={imgUrl}
            src={imgUrl}
            alt={`${title} Isabel Pepe`}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 group-hover:scale-105 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        );
      })}

      {/* OVERLAY GRADIENTE DI LUSSO PER LA LEGGIBILITÀ DEL TESTO */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-20 group-hover:from-black/90 transition-colors duration-500"></div>

      {/* DETTAGLI TESTO E CALL TO ACTION IN BASSO */}
      <div className="absolute bottom-8 left-8 right-8 z-30">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-1.5 drop-shadow">
          {subtitle}
        </span>
        <h3 className="text-white font-serif text-2xl sm:text-3xl tracking-widest uppercase mb-3 drop-shadow-md">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-white/90 font-sans text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-[#C0A09A] transition-colors duration-300 font-medium">
            {ctaText} <span className="transform transition-transform group-hover:translate-x-2">→</span>
          </span>

          {/* INDICATORI PALLINI DOTTED DELLE FOTO MODELLA */}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentImgIndex ? 'w-4 bg-[#C0A09A]' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
