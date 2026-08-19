'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { trackAnalyticsEvent } from '@/lib/analytics-events';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  category: string;
  materials: string;
  image_primary: string;
  image_secondary: string;
  stock: number;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCartStore();
  const { toggleItem, hasItem } = useWishlistStore();
  
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const isFavorite = hasItem(product.id);
  const hasSecondary = Boolean(product.image_secondary && product.image_secondary.trim() !== '');

  const currentQuantityInCart = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = currentQuantityInCart >= product.stock || product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert("Hai raggiunto il limite di stock per questo prodotto.");
      return;
    }
    
    const finalPrice = product.discount_price || product.price;

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image_primary,
      quantity: 1,
      stock: product.stock,
    });

    // Funnel Milestone Event Hook: add_to_cart (Quick Add)
    trackAnalyticsEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_category: product.category,
      price: finalPrice,
      quantity: 1,
    });
  };

  // Gestione Swipe Touch fluido su Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasSecondary) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Swipe a sinistra -> mostra foto modella
    if (diffX > 25) {
      setActiveImageIndex(1);
    }
    // Swipe a destra -> torna a foto still-life
    else if (diffX < -25) {
      setActiveImageIndex(0);
    }
    touchStartX.current = null;
  };

  const hasDiscount = product.discount_price && product.discount_price > 0 && product.discount_price < product.price;

  // L'immagine secondaria è mostrata se: hover su desktop O activeIndex === 1 su mobile
  const showSecondary = hasSecondary && (isHovered || activeImageIndex === 1);

  return (
    <div 
      className="flex flex-col gap-2.5 group select-none relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenitore Immagine 100% Pulito (Nessuna icona a coprire il gioiello) */}
      <Link 
        href={`/prodotto/${product.slug}`} 
        className="relative overflow-hidden w-full aspect-[10/11] bg-[#FAF8F5] rounded-xs group/image cursor-pointer shadow-2xs border border-[#EADFD9]/60 block"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sconto Badge Minimalista */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-[#1A1A1A] text-[#FAF8F6] text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 font-medium rounded-xs shadow-xs">
            Offerta
          </div>
        )}

        {/* Primary Image (Still-life Gioiello - 100% Nitida e Libera da Ostacoli) */}
        <img 
          src={product.image_primary} 
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-700 ease-out ${
            showSecondary ? 'opacity-0 scale-100' : 'opacity-100 group-hover:scale-103'
          }`} 
        />
        
        {/* Secondary Image (Modella / Indossato - 100% Nitida) */}
        {hasSecondary && (
          <img 
            src={product.image_secondary} 
            alt={`${product.name} indossato`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover z-10 transition-all duration-700 ease-out ${
              showSecondary ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
            }`} 
          />
        )}

        {/* Barra di indicatore swipe ultra-sottile e discreta sul bordo inferiore (solo se ci sono 2 foto) */}
        {hasSecondary && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-black/5 flex">
            <div 
              className={`h-full transition-all duration-300 ${
                !showSecondary ? 'w-1/2 bg-[#8A5E58]' : 'w-1/2 bg-transparent'
              }`} 
            />
            <div 
              className={`h-full transition-all duration-300 ${
                showSecondary ? 'w-1/2 bg-[#8A5E58]' : 'w-1/2 bg-transparent'
              }`} 
            />
          </div>
        )}

        {/* Wishlist Heart discreto (in alto a destra, visibile su hover desktop o se salvato) */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem({
              id: product.id,
              name: product.name,
              price: product.discount_price || product.price,
              image: product.image_primary,
              slug: product.slug,
            });
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isFavorite 
              ? 'bg-white text-[#8A5E58] shadow-xs opacity-100 scale-100' 
              : 'bg-white/80 backdrop-blur-xs text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105'
          }`}
          aria-label="Aggiungi ai preferiti"
        >
          <Heart 
            size={13} 
            strokeWidth={isFavorite ? 0 : 1.5} 
            fill={isFavorite ? '#8A5E58' : 'none'} 
            className={isFavorite ? 'text-[#8A5E58]' : 'text-gray-700'}
          />
        </button>

        {/* Pulsante Rapido Carrello solo su Hover Desktop in fondo alla foto (non copre nulla su mobile) */}
        <div className="hidden md:block absolute bottom-0 inset-x-0 z-20 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-white/95 hover:bg-white text-[#1A1A1A] hover:text-[#8A5E58] py-2 px-3 text-[10px] uppercase tracking-[0.2em] font-medium rounded-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag size={12} strokeWidth={1.75} />
            <span>Aggiungi al Carrello</span>
          </button>
        </div>
      </Link>

      {/* Dettagli Gioiello Sotto la Foto */}
      <Link href={`/prodotto/${product.slug}`} className="flex flex-col gap-1 text-center md:text-left block">
        <h3 className="font-serif text-[14px] sm:text-[15px] tracking-wide text-[#1A1A1A] group-hover:text-[#8A5E58] transition-colors duration-300 font-medium">
          {product.name}
        </h3>
        <p className="text-[9px] uppercase text-gray-400 font-sans tracking-[0.18em] line-clamp-1">
          {product.materials}
        </p>
        
        <div className="flex items-center justify-center md:justify-start gap-2 mt-0.5 font-sans">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                €{Number(product.discount_price).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                €{Number(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[#1A1A1A]">
              €{Number(product.price).toFixed(2)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
