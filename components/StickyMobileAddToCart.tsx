'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { ShoppingBag } from 'lucide-react';

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    image_primary: string;
    stock: number;
  };
};

export default function StickyMobileAddToCart({ product }: Props) {
  const { addItem, items, toggleCart } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);

  const currentQuantityInCart = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = currentQuantityInCart >= product.stock || product.stock === 0;
  const finalPrice = product.discount_price || product.price;

  useEffect(() => {
    const handleScroll = () => {
      // Mostra la barra sticky su mobile solo dopo essere scesi di 400px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image_primary,
      quantity: 1,
      stock: product.stock,
    });
    toggleCart(); // Apre automaticamente il carrello drawer per feedback immediato
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 shadow-2xl md:hidden transition-all duration-300 transform translate-y-0">
      <div className="flex items-center justify-between gap-3">
        
        {/* Foto & Info Prodotto */}
        <div className="flex items-center gap-3 min-w-0">
          <img 
            src={product.image_primary} 
            alt={product.name} 
            className="w-11 h-11 object-cover rounded-lg bg-[#FAF8F5] border border-gray-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-serif text-xs text-gray-900 truncate tracking-wide">
              {product.name}
            </h4>
            <span className="font-sans text-xs font-semibold text-[#C0A09A]">
              €{Number(finalPrice).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bottone Aggiungi */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`px-5 sm:px-6 py-3 rounded-xl text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#C0A09A] via-[#B8938C] to-[#A8827B] hover:from-[#B8938C] hover:via-[#A8827B] text-white shadow-[0_6px_20px_-2px_rgba(192,160,154,0.55)] border border-white/30'
          }`}
        >
          <ShoppingBag size={14} className="drop-shadow-sm" />
          <span className="drop-shadow-sm font-medium">{isOutOfStock ? 'Esaurito' : 'Aggiungi'}</span>
        </button>

      </div>
    </div>
  );
}
