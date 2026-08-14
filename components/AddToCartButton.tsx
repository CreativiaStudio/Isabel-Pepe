'use client';

import React from 'react';
import { useCartStore } from '@/store/cart';

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

export default function AddToCartButton({ product }: Props) {
  const { addItem, items } = useCartStore();

  // Troviamo quanti pezzi di questo prodotto sono già nel carrello
  const currentQuantityInCart = items.find(item => item.id === product.id)?.quantity || 0;
  // Disabilita il bottone se abbiamo raggiunto o superato lo stock disponibile
  const isOutOfStock = currentQuantityInCart >= product.stock || product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.image_primary,
      quantity: 1,
      stock: product.stock,
    });
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={`w-full uppercase tracking-widest text-sm py-5 rounded transition duration-300 mb-8 font-medium ${
        isOutOfStock 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-[#1A1A1A] hover:bg-black text-white'
      }`}
    >
      {product.stock === 0 ? 'Esaurito' : (isOutOfStock ? 'Limite Stock Raggiunto' : 'Aggiungi al Carrello')}
    </button>
  );
}
