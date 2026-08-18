'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

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
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.image_primary,
      quantity: 1,
      stock: product.stock,
    });
  };

  // Gestione Swipe Touch su Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasSecondary) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Swipe a sinistra -> mostra foto modella
    if (diffX > 30) {
      setActiveImageIndex(1);
    }
    // Swipe a destra -> torna a foto still-life
    else if (diffX < -30) {
      setActiveImageIndex(0);
    }
    touchStartX.current = null;
  };

  const hasDiscount = product.discount_price && product.discount_price > 0 && product.discount_price < product.price;

  // L'immagine secondaria è mostrata se: hover su desktop O activeIndex === 1 su mobile
  const showSecondary = hasSecondary && (isHovered || activeImageIndex === 1);

  return (
    <Link 
      href={`/prodotto/${product.slug}`} 
      className="flex flex-col gap-3 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container proporzionato a 10:11 */}
      <div 
        className="relative overflow-hidden w-full aspect-[10/11] bg-[#F9F8F6] rounded-xl group/image cursor-pointer shadow-sm border border-gray-100/80 transition-shadow duration-300 group-hover:shadow-md"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sconto Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold rounded shadow-sm">
            Sale
          </div>
        )}

        {/* Badge "Indossato" che compare quando è attiva la foto modella */}
        {hasSecondary && showSecondary && (
          <div className="absolute top-3 left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-medium rounded-full flex items-center gap-1 shadow-sm transition-all duration-300 animate-fadeIn">
            <Sparkles size={10} className="text-[#C0A09A]" />
            <span>Indossato</span>
          </div>
        )}

        {/* Primary Image (Still-life Gioiello - Nitida al 100%) */}
        <img 
          src={product.image_primary} 
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-500 ease-out ${
            showSecondary ? 'opacity-0 scale-100' : 'opacity-100 group-hover:scale-105'
          }`} 
        />
        
        {/* Secondary Image (Modella / Indossato - Nitida al 100% senza blur) */}
        {hasSecondary && (
          <img 
            src={product.image_secondary} 
            alt={`${product.name} indossato`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover z-10 transition-all duration-500 ease-out ${
              showSecondary ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} 
          />
        )}

        {/* Indicatori Dots Foto (1: Still Life / 2: Indossato) su Mobile e Desktop */}
        {hasSecondary && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex(0);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                !showSecondary ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
              aria-label="Mostra foto prodotto"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex(1);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                showSecondary ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
              aria-label="Mostra foto indossato"
            />
          </div>
        )}
        
        {/* Add to Wishlist Button */}
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
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm border border-gray-100/80 transition-all duration-300 opacity-90 md:opacity-0 md:group-hover/image:opacity-100 hover:bg-white hover:scale-105 active:scale-95"
          aria-label="Aggiungi ai preferiti"
        >
          <Heart 
            size={14} 
            strokeWidth={isFavorite ? 0 : 1.5} 
            fill={isFavorite ? '#C0A09A' : 'none'} 
            className={isFavorite ? 'text-[#C0A09A]' : 'text-gray-800'}
          />
        </button>

        {/* Quick Add to Cart Button (Sempre visibile e accessibile su mobile, hover elegante su desktop) */}
        <button 
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-md border border-gray-100/90 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover/image:opacity-100 hover:bg-[#C0A09A] hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Aggiungi al carrello rapido"
          title="Aggiungi al carrello"
        >
          <ShoppingBag size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* Details Container */}
      <div className="flex flex-col gap-1 text-center md:text-left mt-1">
        <h3 className="font-serif text-[15px] sm:text-base tracking-wide text-[#1A1A1A] group-hover:text-[#C0A09A] transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-[10px] uppercase text-gray-400 font-sans tracking-widest line-clamp-1">
          {product.materials}
        </p>
        
        <div className="flex items-center justify-center md:justify-start gap-2 mt-0.5 font-sans">
          {hasDiscount ? (
            <>
              <span className="text-sm font-medium text-gray-900">
                €{Number(product.discount_price).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                €{Number(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-900">
              €{Number(product.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
