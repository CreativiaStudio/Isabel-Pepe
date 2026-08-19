'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Truck, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart, setIsOpen } = useCartStore();
  const [orderDetails, setOrderDetails] = useState<{
    customerName?: string;
    customerEmail?: string;
    amount?: number;
  } | null>(null);

  useEffect(() => {
    // 1. Chiude subito il carrello drawer e svuota gli articoli acquistati
    setIsOpen(false);
    clearCart();

    // 2. Se abbiamo sessionId, confermiamo e registriamo l'ordine all'istante
    if (sessionId) {
      fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success) {
            setOrderDetails({
              customerEmail: data.customerEmail,
              customerName: data.customerName,
              amount: data.amountTotal,
            });
          }
        })
        .catch((err) => console.error('Error confirming order:', err));
    } else {
      const savedEmail = localStorage.getItem('isabel_customer_email');
      const savedName = localStorage.getItem('isabel_customer_name');
      if (savedEmail || savedName) {
        setOrderDetails({
          customerEmail: savedEmail || undefined,
          customerName: savedName || undefined,
        });
      }
    }
  }, [clearCart, setIsOpen, sessionId]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-16 px-4 sm:px-6 bg-[#FAF8F6]">
      <div className="bg-white border border-[#EADFD9] p-8 sm:p-14 shadow-sm max-w-2xl w-full text-center rounded-sm">
        
        {/* Icona Checkmark Luxury */}
        <div className="w-20 h-20 rounded-full bg-[#FAF3F0] border border-[#C0A09A]/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#C0A09A]" strokeWidth={1.5} />
        </div>
        
        {/* Titolo e Sottotitolo */}
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-semibold block mb-2">
          Pagamento Confermato con Successo
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase mb-4 text-[#1A1A1A]">
          Ordine Ricevuto
        </h1>
        
        <p className="font-sans text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Grazie per aver scelto <span className="font-serif font-semibold text-[#8A5E58]">Isabel Pepe</span>. I tuoi gioielli sono ora presi in carico dal nostro atelier con la massima cura.
        </p>

        {/* Box Dettagli Spedizione & Ricevuta */}
        <div className="bg-[#FAF7F5] border border-[#EADFD9] p-6 mb-8 text-left rounded-sm space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-[#E8DDD6] pb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Stato Ordine</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
              In Preparazione
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="flex items-start gap-2.5">
              <Package className="w-4 h-4 text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-gray-900 block">Cofanetto Luxury</span>
                <span className="text-gray-500 text-[11px]">Confezionamento regalo & garanzia inclusi</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-gray-900 block">Corriere Espresso</span>
                <span className="text-gray-500 text-[11px]">Consegna tracciata in 24/48h</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-gray-900 block">Assistenza Diretta</span>
                <span className="text-gray-500 text-[11px]">Supporto WhatsApp dedicato</span>
              </div>
            </div>
          </div>

          {orderDetails?.customerEmail && (
            <div className="border-t border-[#E8DDD6] pt-3 text-[11px] text-gray-500">
              Riceverai a breve il tracking e la ricevuta completa all'indirizzo: <strong className="text-gray-900">{orderDetails.customerEmail}</strong>
            </div>
          )}
        </div>

        {/* Pulsanti di Azione */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 px-8 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-sm font-medium shadow-sm hover:shadow"
          >
            <ShoppingBag size={15} />
            <span>Continua lo Shopping</span>
          </Link>
          <Link 
            href="/assistenza-clienti"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#C0A09A] text-[#8A5E58] hover:bg-[#FAF3F0] py-4 px-8 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-sm font-medium"
          >
            <span>Hai Domande? Contattaci</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
