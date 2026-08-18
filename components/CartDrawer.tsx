'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Assicurati che in .env.local ci sia NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, amount: number, percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Calcolo totale con sconto
  const discountValue = appliedDiscount ? (appliedDiscount.amount > 0 ? appliedDiscount.amount : subtotal * (appliedDiscount.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discountValue);

  const handleApplyPromo = async () => {
    if (!promoCode || !customerEmail) {
      setPromoError('Inserisci email e codice promo');
      return;
    }
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, email: customerEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedDiscount({
          code: data.code,
          amount: data.discount_amount,
          percent: data.discount_percent,
        });
      } else {
        setPromoError(data.error || 'Codice non valido');
        setAppliedDiscount(null);
      }
    } catch (e) {
      setPromoError('Errore di connessione');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!showEmailPrompt) {
      setShowEmailPrompt(true);
      return;
    }

    if (!customerEmail) {
      alert("L'email è obbligatoria per inviare la ricevuta.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, 
          customerEmail, 
          customerPhone,
          couponCode: appliedDiscount?.code 
        }),
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // Reindirizza a Stripe
      } else if (data.sessionId) {
        const stripe = await stripePromise;
        await (stripe as any)?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert('Errore durante la creazione della sessione: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Errore di connessione a Stripe');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            <ShoppingBag size={24} strokeWidth={1} />
            CARRELLO
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-900"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista Prodotti */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-sans text-[11px] uppercase tracking-widest">Il tuo carrello è vuoto</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 border-b border-gray-400 pb-1 text-gray-900 text-sm hover:border-gray-900 transition"
              >
                Torna allo shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-32 bg-[#F9F8F6] overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-lg text-gray-900">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">€{Number(item.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-200">
                      <button 
                        className="px-3 py-1 hover:bg-gray-50"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >-</button>
                      <span className="text-sm px-2">{item.quantity}</span>
                      <button 
                        className={`px-3 py-1 ${item.quantity >= item.stock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >+</button>
                    </div>
                  </div>
                  {item.quantity >= item.stock && (
                    <p className="text-[9px] text-red-500 uppercase mt-2 tracking-widest">
                      Limite stock raggiunto
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-[#FAFAFA]">
            {showEmailPrompt ? (
              <div className="mb-6 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="font-serif text-lg text-gray-900 mb-1">A chi intestiamo l'ordine?</h3>
                  <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest mb-4">Riceverai qui la conferma e il tracciamento</p>
                </div>
                
                <input 
                  type="email" 
                  required
                  placeholder="La tua email *" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#C0A09A] outline-none rounded-sm transition-colors"
                />
                <input 
                  type="tel" 
                  placeholder="Cellulare (opzionale - per SMS corriere)" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:border-[#C0A09A] outline-none rounded-sm transition-colors"
                />

                {/* Promo Code Section */}
                <div className="pt-2">
                  <p className="font-sans text-[10px] text-gray-500 uppercase tracking-widest mb-2">Hai un codice sconto?</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Inserisci coupon" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 border border-gray-200 px-4 py-2 text-sm focus:border-[#C0A09A] outline-none rounded-sm transition-colors uppercase"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={applyingPromo || !promoCode}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-xs uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
                    >
                      Applica
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-[10px] mt-1 uppercase tracking-widest">{promoError}</p>}
                  {appliedDiscount && (
                    <p className="text-green-600 text-[10px] mt-1 uppercase tracking-widest flex items-center gap-1">
                      ✓ Coupon applicato: -{appliedDiscount.percent > 0 ? `${appliedDiscount.percent}%` : `€${appliedDiscount.amount}`}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2 text-gray-500">
                    <span className="font-sans text-[11px] uppercase tracking-widest">Subtotale</span>
                    <span className="font-serif text-lg">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-gray-500">
                    <span className="font-sans text-[11px] uppercase tracking-widest">Spedizione Express 48h</span>
                    <span className="font-sans text-xs uppercase tracking-wider text-green-600 font-semibold">Gratis</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span className="font-sans text-[11px] uppercase tracking-widest">Sconto ({appliedDiscount.code})</span>
                      <span className="font-serif text-lg">-€{discountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-sans text-[11px] uppercase tracking-widest text-gray-900 font-bold">Totale</span>
                    <span className="font-serif text-2xl text-gray-900">€{total.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center text-gray-500">
                  <span className="font-sans text-[11px] uppercase tracking-widest">Spedizione Express 48h</span>
                  <span className="font-sans text-xs uppercase tracking-wider text-green-600 font-semibold">Sempre Gratuita</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-gray-500">Subtotale</span>
                  <span className="font-serif text-2xl text-gray-900">€{subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white uppercase tracking-widest text-sm py-4 rounded transition duration-300 font-medium disabled:opacity-50"
            >
              {loading ? 'Elaborazione...' : (showEmailPrompt ? 'Procedi al Pagamento Sicuro' : 'Vai alla Cassa (Checkout Sicuro)')}
            </button>
            <div className="flex flex-col items-center justify-center gap-3 mt-5">
              <span className="text-[9px] uppercase tracking-widest text-gray-500">Paga in 3 comode rate con</span>
              <div className="flex items-center gap-2">
                {/* Badge PayPal */}
                <span className="bg-[#003087] text-white italic font-bold px-3 py-1 rounded text-[10px] tracking-wide shadow-sm">
                  PayPal
                </span>
                {/* Badge Klarna */}
                <span className="bg-[#FFB3C7] text-black font-bold px-3 py-1 rounded-full text-[10px] tracking-wide shadow-sm">
                  Klarna.
                </span>
                {/* Badge Scalapay */}
                <span className="bg-[#FCE5E7] text-[#D81E5B] font-bold px-3 py-1 rounded-full text-[10px] tracking-wide shadow-sm">
                  scalapay
                </span>
              </div>
            </div>
            <p className="text-[9px] text-center text-gray-400 mt-4 uppercase tracking-widest">
              Spedizione e tasse calcolate al checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
