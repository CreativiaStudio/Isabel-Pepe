'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
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
  
  const isFavorite = hasItem(product.id);
  
  const currentQuantityInCart = items.find(item => item.id === product.id)?.quantity || 0;
  const isOutOfStock = currentQuantityInCart >= product.stock || product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita di navigare alla pagina del prodotto
    e.stopPropagation(); // Blocca l'evento di bubbling verso il Link padre
    
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

  const hasDiscount = product.discount_price && product.discount_price > 0 && product.discount_price < product.price;

  return (
    <Link href={`/prodotto/${product.slug}`} className="flex flex-col gap-3 group">
      {/* Image Container */}
      <div className="relative overflow-hidden w-full aspect-[4/5] bg-[#F9F8F6] group/image cursor-pointer">
        
        {/* Sconto Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-20 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest px-2 py-1 font-semibold rounded">
            Sale
          </div>
        )}

        {/* Primary Image (Product) */}
        <img 
          src={product.image_primary} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ease-in-out group-hover/image:opacity-0" 
        />
        
        {/* Secondary Image (Lifestyle/On-figure) */}
        {product.image_secondary && (
          <img 
            src={product.image_secondary} 
            alt={`${product.name} indossato`}
            className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 blur-[2px] transition-all duration-[800ms] ease-in-out group-hover/image:opacity-100 group-hover/image:blur-0 scale-105 group-hover/image:scale-100" 
          />
        )}
        
        {/* Add to Wishlist Button */}
        <button 
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
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 hover:bg-white shadow-sm"
          aria-label="Aggiungi ai preferiti"
        >
          <Heart 
            size={14} 
            strokeWidth={isFavorite ? 0 : 1.5} 
            fill={isFavorite ? '#C0A09A' : 'none'} 
            className={isFavorite ? 'text-[#C0A09A]' : 'text-gray-900'}
          />
        </button>

        {/* Quick Add Button */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 hover:bg-white shadow-sm hover:text-[#C0A09A]"
          aria-label="Aggiungi al carrello"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Details Container */}
      <div className="flex flex-col gap-1 text-center md:text-left mt-2">
        <h3 className="font-serif tracking-wide text-[#1A1A1A] group-hover:text-[#C0A09A] transition-colors duration-500">
          {product.name}
        </h3>
        <p className="text-[10px] uppercase text-gray-400 font-sans tracking-widest">
          {product.materials}
        </p>
        
        <div className="flex items-center justify-center md:justify-start gap-2 mt-1 font-sans">
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
            <span className="text-sm text-gray-900">
              €{Number(product.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
