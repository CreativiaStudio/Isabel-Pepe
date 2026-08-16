'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  videoUrl: string;
  fallbackUrl: string;
  subtitle: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    videoUrl: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/hero/isabel-pepe-hero-video-1.mp4',
    fallbackUrl: '/Video per Hero/Isabel Pepe Hero1.mp4',
    subtitle: 'Demi-Fine Jewelry',
    title: 'Eterna\nBellezza',
    description: 'La nuova collezione. Lusso accessibile senza tempo disegnato con etica e passione.',
    ctaText: 'Scopri la Collezione',
    ctaLink: '/shop',
  },
  {
    id: 2,
    videoUrl: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/hero/isabel-pepe-hero-video-2.mp4',
    fallbackUrl: '/Video per Hero/Isabel Pepe Hero2.mp4',
    subtitle: 'Pietre di Pura Luce',
    title: 'Scintille\nd’Anima',
    description: 'Pietre ad altissima rifrazione con Taglio Brillante su Argento 925 e finiture in Oro 18K.',
    ctaText: 'Esplora i Gioielli',
    ctaLink: '/shop',
  },
  {
    id: 3,
    videoUrl: 'https://pub-69fc98b4654c4a76b9ce99bd374126e4.r2.dev/hero/isabel-pepe-hero-video-3.mp4',
    fallbackUrl: '/Video per Hero/Isabel Pepe Hero3.mp4',
    subtitle: 'Edizioni Esclusive',
    title: 'L’Arte dell’\nEleganza',
    description: 'Creazioni senza tempo nate per illuminare ed esaltare ogni momento della tua vita.',
    ctaText: 'Vedi i Set Royale',
    ctaLink: '/shop?category=Set',
  },
];

export default function HeroVideoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Quando la slide attiva cambia, avviamo la riproduzione del video corrente dall'inizio
  useEffect(() => {
    const currentVideo = videoRefs.current[currentSlide];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {});
    }
  }, [currentSlide]);

  // Handler chiamato quando il video FINISCE la sua riproduzione naturale
  const handleVideoEnded = (index: number) => {
    if (index === currentSlide) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  return (
    <section className="relative w-full h-[85vh] sm:h-[90vh] md:h-screen overflow-hidden bg-black flex items-center">
      
      {/* 1. LAYER VIDEO — Ciascun video viene riprodotto una sola volta per intero, e alla fine passa al successivo */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={slide.videoUrl}
              onEnded={() => handleVideoEnded(index)}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes(slide.fallbackUrl)) {
                  target.src = slide.fallbackUrl;
                  target.play().catch(() => {});
                }
              }}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
            
            {/* OVERLAY MINIMO LEGGERISSIMO: Garantisce massima brillantezza visiva del video originale */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
          </div>
        );
      })}

      {/* 2. TESTO E CALL TO ACTION ALLINEATI A SINISTRA (Modella visibile sulla destra) */}
      <div className="relative z-20 max-w-[1400px] w-full mx-auto px-5 sm:px-10 lg:px-16 pointer-events-none">
        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col items-start text-left pointer-events-auto">
          
          {/* Subtitle / Tagline */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C0A09A]"></span>
            <span className="font-sans text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.3em] text-[#C0A09A] font-semibold drop-shadow">
              {slides[currentSlide].subtitle}
            </span>
          </div>

          {/* Titolo Principale */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-white leading-[1.08] uppercase mb-4 sm:mb-6 drop-shadow-lg whitespace-pre-line">
            {slides[currentSlide].title}
          </h1>

          {/* Descrizione Breve */}
          <p className="font-sans text-gray-200 text-xs sm:text-sm md:text-base max-w-md leading-relaxed tracking-wider font-light mb-6 sm:mb-8 drop-shadow">
            {slides[currentSlide].description}
          </p>

          {/* Bottone Call To Action */}
          <Link
            href={slides[currentSlide].ctaLink}
            className="inline-flex items-center gap-3 bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 px-6 sm:px-9 py-3.5 sm:py-4 text-[11px] sm:text-xs uppercase tracking-[0.25em] font-medium transition-all duration-500 rounded-none shadow-lg hover:shadow-2xl group"
          >
            <span>{slides[currentSlide].ctaText}</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </div>
      </div>

      {/* 3. INDICATORI SLIDE ED INDICATORE TEMPO IN BASSO A SINISTRA */}
      <div className="absolute bottom-6 sm:bottom-10 left-5 sm:left-10 lg:left-16 z-30 flex items-center gap-5">
        {/* Contatore numerico */}
        <span className="font-mono text-[11px] sm:text-xs text-white/80 tracking-widest drop-shadow">
          0{currentSlide + 1} / 0{slides.length}
        </span>

        {/* Indicatori a barre orizzontali */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-[2px] transition-all duration-500 relative overflow-hidden ${
                  isActive ? 'w-10 sm:w-12 bg-white' : 'w-3 sm:w-4 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Vai alla slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

    </section>
  );
}
