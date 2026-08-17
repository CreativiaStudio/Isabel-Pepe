'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronRight, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

export default function Header() {
  const { toggleCart, items: cartItems } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Service Bar */}
      <div className="bg-[#FAFAFA] text-[#1A1A1A]/70 text-[9px] uppercase tracking-widest py-2 px-4 text-center flex items-center justify-center gap-3 flex-wrap">
        <span className="font-medium text-gray-900">Spedizione Sempre Gratuita 24/48h</span>
        <span className="hidden sm:inline text-gray-300">•</span>
        <Link href="/impegno-animali" className="text-[#C0A09A] hover:underline font-semibold flex items-center gap-1">
          <span>🐾 L'Arte del Dono: Sosteniamo gli Animali</span>
        </Link>
        <span className="hidden sm:inline text-gray-300">•</span>
        <span className="hidden sm:inline">Reso Facile 14 Giorni</span>
      </div>
      
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Menu Desktop */}
          <nav className="hidden md:flex gap-8 w-1/3 items-center">
            {/* Voce 1 con Mega Menu */}
            <div 
              className="py-6"
              onMouseEnter={() => setIsCollectionsOpen(true)}
              onMouseLeave={() => setIsCollectionsOpen(false)}
            >
              <Link 
                href="/shop" 
                onClick={() => setIsCollectionsOpen(false)}
                className="font-sans tracking-[0.2em] text-[11px] uppercase text-[#C0A09A] hover:text-[#A98983] transition-colors pb-2"
              >
                Le Collezioni
              </Link>
              
              {/* Mega Menu Dropdown Full Screen */}
              <div className={`absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-500 ease-in-out border-t border-gray-100 z-50 ${isCollectionsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="max-w-[1100px] mx-auto px-6 py-8">
                  <div className="grid grid-cols-5 gap-6">
                    
                    {/* Anelli */}
                    <Link href="/shop?category=Anelli" onClick={() => setIsCollectionsOpen(false)} className="group/item flex flex-col gap-4">
                      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
                        <img src="/Products/mega_menu_anelli.webp" alt="Anelli" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-700" />
                      </div>
                      <span className="font-serif text-sm tracking-widest uppercase text-gray-900 group-hover/item:text-[#C0A09A] transition-colors text-center">Anelli</span>
                    </Link>

                    {/* Collane */}
                    <Link href="/shop?category=Collane" onClick={() => setIsCollectionsOpen(false)} className="group/item flex flex-col gap-4">
                      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
                        <img src="/Products/mega_menu_collane.jpg" alt="Collane" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-700" />
                      </div>
                      <span className="font-serif text-sm tracking-widest uppercase text-gray-900 group-hover/item:text-[#C0A09A] transition-colors text-center">Collane</span>
                    </Link>

                    {/* Orecchini */}
                    <Link href="/shop?category=Orecchini" onClick={() => setIsCollectionsOpen(false)} className="group/item flex flex-col gap-4">
                      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
                        <img src="/Products/mega_menu_orecchini.webp" alt="Orecchini" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-700" />
                      </div>
                      <span className="font-serif text-sm tracking-widest uppercase text-gray-900 group-hover/item:text-[#C0A09A] transition-colors text-center">Orecchini</span>
                    </Link>

                    {/* Bracciali */}
                    <Link href="/shop?category=Bracciali" onClick={() => setIsCollectionsOpen(false)} className="group/item flex flex-col gap-4">
                      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
                        <img src="/Products/mega_menu_bracciali.jpg" alt="Bracciali" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-700" />
                      </div>
                      <span className="font-serif text-sm tracking-widest uppercase text-gray-900 group-hover/item:text-[#C0A09A] transition-colors text-center">Bracciali</span>
                    </Link>

                    {/* Set */}
                    <Link href="/shop?category=Set" onClick={() => setIsCollectionsOpen(false)} className="group/item flex flex-col gap-4">
                      <div className="w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6]">
                        <img src="/Products/mega_menu_set.webp" alt="Set" className="w-full h-full object-cover group-hover/item:scale-105 transition duration-700" />
                      </div>
                      <span className="font-serif text-sm tracking-widest uppercase text-gray-900 group-hover/item:text-[#C0A09A] transition-colors text-center">Set</span>
                    </Link>

                  </div>

                  {/* Link "Vedi tutto" */}
                  <div className="text-center mt-8 pt-6 border-t border-gray-100">
                    <Link href="/shop" onClick={() => setIsCollectionsOpen(false)} className="font-sans text-[10px] tracking-[0.3em] uppercase text-gray-500 hover:text-[#C0A09A] transition-colors">
                      Esplora tutta la collezione →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/chi-siamo" className="font-sans tracking-[0.2em] text-[11px] uppercase text-[#C0A09A] relative group py-2">
              Chi è Isabel
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C0A09A] transition-all duration-700 ease-in-out group-hover:w-full"></span>
            </Link>
            <Link href="/assistenza-clienti" className="font-sans tracking-[0.2em] text-[11px] uppercase text-[#C0A09A] relative group py-2">
              Contattaci
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C0A09A] transition-all duration-700 ease-in-out group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Pulsante Hamburger Mobile (< md) */}
          <div className="flex md:hidden items-center z-10">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-900 hover:text-[#C0A09A] transition-colors"
              aria-label="Apri Menu Mobile"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center Logo */}
          <div className="flex-shrink-0 flex justify-center w-full md:w-1/3 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/">
              <span className="font-serif tracking-widest text-xl sm:text-2xl uppercase text-[#C0A09A] block">Isabel Pepe</span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex justify-end gap-5 sm:gap-6 w-auto md:w-1/3 z-10">
            <button className="text-[#1A1A1A] hover:text-[#C0A09A] transition-colors duration-700 ease-in-out">
              <Search strokeWidth={1.2} size={20} />
            </button>
            <Link href="/account" className="text-[#1A1A1A] hover:text-[#C0A09A] transition-colors duration-700 ease-in-out hidden sm:block">
              <User strokeWidth={1.2} size={20} />
            </Link>
            <button 
              className="text-[#1A1A1A] hover:text-[#C0A09A] transition-colors duration-700 ease-in-out relative"
              onClick={toggleWishlist}
            >
              <Heart strokeWidth={1.2} size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C0A09A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button 
              className="text-[#1A1A1A] hover:text-[#C0A09A] transition-colors duration-700 ease-in-out relative"
              onClick={toggleCart}
            >
              <ShoppingBag strokeWidth={1.2} size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER (SLIDE-OUT LEFT) */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Backdrop scuro sfocato */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Contenitore Drawer */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Drawer Mobile */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F5]">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <h2 className="font-serif text-xl tracking-widest uppercase text-[#C0A09A]">Isabel Pepe</h2>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu Scrollabile */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Sezione Collezioni */}
            <div>
              <span className="font-sans text-[10px] text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-4">
                Le Collezioni
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/shop?category=Anelli" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#FAF8F5] p-3 rounded-lg flex flex-col items-center gap-2 border border-gray-100 active:scale-95 transition-transform"
                >
                  <img src="/Products/mega_menu_anelli.webp" alt="Anelli" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-xs font-serif uppercase tracking-wider text-gray-900">Anelli</span>
                </Link>

                <Link 
                  href="/shop?category=Collane" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#FAF8F5] p-3 rounded-lg flex flex-col items-center gap-2 border border-gray-100 active:scale-95 transition-transform"
                >
                  <img src="/Products/mega_menu_collane.jpg" alt="Collane" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-xs font-serif uppercase tracking-wider text-gray-900">Collane</span>
                </Link>

                <Link 
                  href="/shop?category=Orecchini" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#FAF8F5] p-3 rounded-lg flex flex-col items-center gap-2 border border-gray-100 active:scale-95 transition-transform"
                >
                  <img src="/Products/mega_menu_orecchini.webp" alt="Orecchini" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-xs font-serif uppercase tracking-wider text-gray-900">Orecchini</span>
                </Link>

                <Link 
                  href="/shop?category=Set" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#FAF8F5] p-3 rounded-lg flex flex-col items-center gap-2 border border-gray-100 active:scale-95 transition-transform"
                >
                  <img src="/Products/mega_menu_set.webp" alt="Set" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-xs font-serif uppercase tracking-wider text-gray-900">Set</span>
                </Link>
              </div>

              <Link 
                href="/shop" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 block text-center py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.2em] font-medium rounded-lg shadow-sm"
              >
                Tutti i Gioielli →
              </Link>
            </div>

            {/* Link di Servizio & Brand */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <span className="font-sans text-[10px] text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-2">
                Pagine & Assistenza
              </span>

              <Link 
                href="/chi-siamo" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-gray-800 uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>Chi è Isabel</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/impegno-animali" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-[#C0A09A] font-semibold uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>🐾 Impegno per gli Animali</span>
                <ChevronRight size={14} className="text-[#C0A09A]" />
              </Link>

              <Link 
                href="/assistenza-clienti" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-gray-800 uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>Assistenza Clienti & FAQ</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/spedizioni-resi" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-gray-800 uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>Spedizioni & Resi 30gg</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/guida-taglie" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-gray-800 uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>Guida alle Taglie Anelli</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>

              <Link 
                href="/cura-gioielli" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs text-gray-800 uppercase tracking-widest py-2 border-b border-gray-50"
              >
                <span>Cura del Gioiello</span>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
            </div>

            {/* WhatsApp Diretto dal Drawer */}
            <div className="pt-2">
              <a 
                href="https://wa.me/393280000000?text=Ciao%20Isabel%20Pepe!%20Vorrei%20informazioni." 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle size={16} />
                Chat WhatsApp Direct
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
