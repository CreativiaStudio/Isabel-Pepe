'use client';

import React from 'react';
import { useCartStore } from '@/store/cart';
import { trackAnalyticsEvent } from '@/lib/analytics-events';

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    image_primary: string;
    stock: number;
    slug?: string;
    category?: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addItem, items } = useCartStore();

  // Troviamo quanti pezzi di questo prodotto sono già nel carrello
  const currentQuantityInCart = items.find(item => item.id === product.id)?.quantity || 0;
  // Disabilita il bottone se abbiamo raggiunto o superato lo stock disponibile
  const isOutOfStock = currentQuantityInCart >= product.stock || product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const finalPrice = product.discount_price || product.price;

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image_primary,
      quantity: 1,
      stock: product.stock,
    });

    // Funnel Milestone Event Hook: add_to_cart
    trackAnalyticsEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug || null,
      product_category: product.category || null,
      price: finalPrice,
      quantity: 1,
    });
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={`w-full uppercase tracking-[0.22em] text-xs sm:text-sm py-5 rounded-xl transition-all duration-500 mb-8 font-medium relative overflow-hidden group active:scale-[0.99] ${
        isOutOfStock 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200' 
          : 'bg-gradient-to-r from-[#C0A09A] via-[#B8938C] to-[#A8827B] hover:from-[#B8938C] hover:via-[#A8827B] hover:to-[#9E7770] text-white shadow-[0_8px_25px_-4px_rgba(192,160,154,0.55)] hover:shadow-[0_12px_32px_-2px_rgba(192,160,154,0.75)] border border-white/30'
      }`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm font-medium">
        {product.stock === 0 ? 'Esaurito' : (isOutOfStock ? 'Limite Stock Raggiunto' : 'Aggiungi al Carrello')}
      </span>
      {/* Riflesso di luce dinamico al passaggio del mouse */}
      {!isOutOfStock && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
      )}
    </button>
  );
}
