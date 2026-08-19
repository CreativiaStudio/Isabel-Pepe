'use client';

import React from 'react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { X, Trash2, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { trackAnalyticsEvent } from '@/lib/analytics-events';

export default function WishlistDrawer() {
  const { items, isOpen, setIsOpen, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  if (!isOpen) return null;

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: item.stock ?? 10,
    });

    trackAnalyticsEvent('add_to_cart', {
      product_id: item.id,
      product_name: item.name,
      product_slug: item.slug || null,
      price: item.price,
      quantity: 1,
    });

    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay Sfondo */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-500">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-widest text-gray-900 flex items-center gap-2">
            <Heart size={24} strokeWidth={1} />
            PREFERITI
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-900"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista Preferiti */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <Heart size={48} strokeWidth={1} />
              <p className="font-sans text-[11px] uppercase tracking-widest text-center">
                La tua lista dei desideri è vuota
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 border-b border-gray-400 pb-1 text-gray-900 text-sm hover:border-gray-900 transition"
              >
                Scopri la collezione
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <Link href={`/prodotto/${item.slug}`} onClick={() => setIsOpen(false)} className="w-24 h-32 bg-[#F9F8F6] overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </Link>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link href={`/prodotto/${item.slug}`} onClick={() => setIsOpen(false)}>
                        <h3 className="font-serif text-lg text-gray-900 hover:text-[#C0A09A] transition-colors">{item.name}</h3>
                      </Link>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">€{Number(item.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#C0A09A] px-4 py-2 rounded transition-colors"
                    >
                      <ShoppingBag size={12} />
                      Aggiungi al Carrello
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
