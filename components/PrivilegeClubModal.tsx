'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Sparkles, Check, Copy, AlertCircle, ShieldCheck, Gift, Clock, Loader2 } from 'lucide-react';

export default function PrivilegeClubModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(''); // Anti-bot honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Close & suppress modal
  const handleClose = useCallback(() => {
    setIsClosing(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isabel_privilege_dismissed', Date.now().toString());
      }
    } catch {
      // Storage fallback
    }
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 280);
  }, []);

  // Triggering and suppression logic
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check suppression criteria
    try {
      const isSubscribed = localStorage.getItem('isabel_subscribed') === 'true';
      const hasCustomerEmail = Boolean(localStorage.getItem('isabel_customer_email'));
      const dismissed = localStorage.getItem('isabel_privilege_dismissed');

      if (isSubscribed || hasCustomerEmail || dismissed) {
        return;
      }
    } catch {
      // Fallback
    }

    let hasTriggered = false;

    const triggerModal = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsOpen(true);
    };

    // 1. Timer trigger (10-12s, standard 11s)
    const timer = setTimeout(() => {
      triggerModal();
    }, 11000);

    // 2. Desktop Exit Intent trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 12 && !hasTriggered) {
        triggerModal();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // ESC Key listener and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus('error');
      setErrorMessage('Inserisci un indirizzo email valido.');
      return;
    }

    if (!gdprConsent) {
      setStatus('error');
      setErrorMessage('È necessario accettare l’Informativa sulla Privacy per accedere al Club.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          firstName: firstName.trim() || undefined,
          gdprConsent: true,
          source: 'popup_vip',
          website_url: websiteUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.error || 'Si è verificato un errore durante l’iscrizione. Riprova più tardi.');
        return;
      }

      // Success
      setStatus('success');
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isabel_subscribed', 'true');
          localStorage.setItem('isabel_customer_email', normalizedEmail);
        }
      } catch {
        // Fallback
      }
    } catch {
      setStatus('error');
      setErrorMessage('Connessione al server non riuscita. Riprova tra qualche istante.');
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('PRIVILEGE10');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privilege-modal-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs transition-opacity duration-300 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Backdrop click */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative bg-[#FAF8F5] border border-[#EADFD9] w-full max-w-3xl rounded-xs shadow-2xl overflow-hidden z-10 max-h-[94vh] flex flex-col md:flex-row transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-in zoom-in-95'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Chiudi invito"
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-gray-950 flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Left Side: Luxury Haute Joaillerie Image & Mood */}
        <div className="relative md:w-5/12 bg-[#0D0D0D] hidden sm:block overflow-hidden min-h-[220px] md:min-h-full">
          <img
            src="/Brand/anello-imperial-modella-seta-nera.jpg"
            alt="Isabel Pepe Creazioni Haute Joaillerie"
            className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 flex flex-col justify-between p-6">
            <div className="inline-flex items-center gap-1.5 self-start bg-[#C0A09A]/30 backdrop-blur-md border border-[#C0A09A]/50 text-[#FAF8F5] text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full font-medium">
              <Sparkles size={11} className="text-[#FAF8F5]" />
              <span>Privilege Club</span>
            </div>

            <div className="space-y-1 text-white">
              <span className="font-serif text-lg tracking-wider block text-champagne-shimmer">
                Isabel Pepe
              </span>
              <p className="font-sans text-[11px] text-gray-300 font-light leading-relaxed tracking-wide">
                L'eccellenza dell'Alta Gioielleria Demi-Fine: argento 925, placcatura oro 18K a spessore e pietre di pura luce.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Content & Form */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto bg-[#FAF8F5]">
          
          {/* Header Monogram & Title */}
          <div className="text-center md:text-left space-y-1.5 mb-5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="h-[1px] w-6 bg-[#C0A09A]"></span>
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-bold">
                Invito Esclusivo
              </span>
              <span className="h-[1px] w-6 bg-[#C0A09A] md:hidden"></span>
            </div>

            <h2
              id="privilege-modal-title"
              className="font-serif text-2xl sm:text-3xl uppercase tracking-widest text-[#1A1A1A] font-normal"
            >
              L'Universo Isabel Pepe
            </h2>

            <p className="font-sans text-xs sm:text-[13px] text-gray-600 leading-relaxed font-light">
              Iscriviti per ricevere il <strong>10% di benvenuto</strong> sulla tua prima creazione e scoprire in anteprima le nuove collezioni di alta gioielleria.
            </p>
          </div>

          {/* Success State */}
          {status === 'success' ? (
            <div className="bg-white border border-[#C0A09A]/60 p-5 rounded-xs space-y-4 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
              <div className="flex items-center gap-2 text-[#8A5E58]">
                <Sparkles size={18} />
                <h3 className="font-serif text-base uppercase tracking-widest font-semibold text-[#1A1A1A]">
                  Benvenuta nell'Universo Isabel Pepe
                </h3>
              </div>

              <p className="font-sans text-xs text-gray-600 leading-relaxed">
                Il tuo codice invito è pronto per essere utilizzato immediatamente al checkout. Ti abbiamo inviato anche la conferma via email.
              </p>

              {/* Coupon Box */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#C0A09A] p-4 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-gray-500 block font-medium">
                    Codice Regalo 10%
                  </span>
                  <span className="font-mono text-xl tracking-widest text-[#8A5E58] font-black">
                    PRIVILEGE10
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white px-5 py-2.5 text-xs uppercase font-sans tracking-[0.2em] font-semibold transition-all duration-300 rounded-xs cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span>Codice Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copia Codice</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="w-full text-center py-3 bg-[#8A5E58] hover:bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-xs transition-colors shadow-sm"
                >
                  Esplora le Creazioni →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* 4 Value Pillars */}
              <div className="grid grid-cols-2 gap-2.5 py-1">
                <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xs border border-[#EADFD9]">
                  <Gift size={15} className="text-[#8A5E58] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-gray-900 block leading-tight">
                      -10% di Benvenuto
                    </span>
                    <span className="font-sans text-[10px] text-gray-500 font-light block leading-tight">
                      Subito attivo
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xs border border-[#EADFD9]">
                  <Sparkles size={15} className="text-[#8A5E58] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-gray-900 block leading-tight">
                      Nuove Creazioni
                    </span>
                    <span className="font-sans text-[10px] text-gray-500 font-light block leading-tight">
                      In anteprima
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xs border border-[#EADFD9]">
                  <ShieldCheck size={15} className="text-[#8A5E58] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-gray-900 block leading-tight">
                      Cura & Garanzia
                    </span>
                    <span className="font-sans text-[10px] text-gray-500 font-light block leading-tight">
                      Supporto dedicato
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xs border border-[#EADFD9]">
                  <Clock size={15} className="text-[#8A5E58] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-gray-900 block leading-tight">
                      Spedizione Rapida
                    </span>
                    <span className="font-sans text-[10px] text-gray-500 font-light block leading-tight">
                      48h assicurata
                    </span>
                  </div>
                </div>
              </div>

              {/* Privilege Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {/* Honeypot hidden input (anti-bot) */}
                <input
                  type="text"
                  name="website_url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Il tuo nome (opzionale)"
                    className="w-full bg-white border border-[#EADFD9] px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#C0A09A] transition-colors rounded-xs"
                    disabled={status === 'loading'}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Il tuo indirizzo email *"
                    className="w-full bg-white border border-[#EADFD9] px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#C0A09A] transition-colors rounded-xs"
                    disabled={status === 'loading'}
                    required
                  />
                </div>

                {/* GDPR Consent Checkbox */}
                <div className="flex items-start gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="modal-gdpr-consent"
                    checked={gdprConsent}
                    onChange={(e) => {
                      setGdprConsent(e.target.checked);
                      if (status === 'error') setStatus('idle');
                    }}
                    className="mt-0.5 w-3.5 h-3.5 rounded-none border border-gray-300 text-[#8A5E58] accent-[#8A5E58] cursor-pointer shrink-0"
                    disabled={status === 'loading'}
                  />
                  <label
                    htmlFor="modal-gdpr-consent"
                    className="text-[10px] text-gray-500 leading-relaxed select-none cursor-pointer"
                  >
                    Accetto l'
                    <Link
                      href="/privacy"
                      onClick={handleClose}
                      className="text-[#8A5E58] underline hover:text-[#1A1A1A] ml-0.5 mr-0.5"
                    >
                      Informativa sulla Privacy
                    </Link>
                    e acconsento a ricevere comunicazioni e vantaggi esclusivi.
                  </label>
                </div>

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs pt-0.5 animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-3 px-4 text-xs uppercase font-sans tracking-[0.25em] font-semibold transition-all duration-300 rounded-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Accesso in corso...</span>
                    </>
                  ) : (
                    <span>Ricevi il 10% di Benvenuto</span>
                  )}
                </button>
              </form>

              {/* Dismiss link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="font-sans text-[10px] text-gray-400 hover:text-gray-700 tracking-wider uppercase underline transition-colors cursor-pointer"
                >
                  Continua senza i vantaggi riservati
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
