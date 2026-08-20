'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, Heart, Check, Copy, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(''); // Anti-bot honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
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
          gdprConsent: true,
          source: 'footer',
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
        // Storage access fallback
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

  return (
    <footer className="bg-[#0D0D0D] text-white pt-20 pb-12 px-4 sm:px-6 mt-auto border-t border-[#C0A09A]/40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* GRIGLIA PRINCIPALE FOOTER (5 Colonne) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
          
          {/* COLONNA 1 & 2: BRAND & ISABEL PEPE PRIVILEGE NEWSLETTER */}
          <div className="sm:col-span-2 lg:pr-12">
            <h2 className="font-serif tracking-[0.25em] text-3xl sm:text-4xl mb-2 uppercase text-champagne-shimmer inline-block">
              ISABEL PEPE
            </h2>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[1px] w-6 bg-[#C0A09A]/80"></span>
              <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#E8D3CF] font-semibold">
                ISABEL PEPE PRIVILEGE
              </span>
            </div>

            <p className="font-sans text-[#D6CECA] text-xs sm:text-[13px] leading-relaxed mb-6 font-normal tracking-wide max-w-md">
              Ricevi un dono di benvenuto del <strong>10%</strong> sul tuo primo gioiello e accedi a vantaggi e selezioni esclusive dedicate a te.
            </p>

            {/* Newsletter Form o Success State */}
            {status === 'success' ? (
              <div className="bg-white/5 border border-[#C0A09A]/60 p-5 rounded-xs space-y-3.5 max-w-md animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 text-[#E8D3CF]">
                  <Sparkles size={16} className="shrink-0" />
                  <span className="font-serif text-sm uppercase tracking-widest text-[#FAF6F0] font-semibold">
                    Benvenuta in Isabel Pepe Privilege
                  </span>
                </div>
                <p className="font-sans text-xs text-gray-300 leading-relaxed font-light">
                  Il tuo dono esclusivo del <strong>10%</strong> è stato sbloccato. Abbiamo inviato la conferma alla tua email.
                </p>
                <div className="flex items-center justify-between bg-black/40 border border-[#C0A09A]/40 px-3.5 py-2.5 rounded-xs">
                  <div className="space-y-0.5">
                    <span className="font-sans text-[9px] uppercase tracking-widest text-gray-400 block font-light">
                      Codice Regalo Esclusivo
                    </span>
                    <span className="font-mono text-sm tracking-widest text-[#E8D3CF] font-bold">
                      PRIVILEGE10
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-[#C0A09A] hover:bg-white text-[#0D0D0D] px-3.5 py-2 text-[10px] uppercase font-sans tracking-[0.2em] font-semibold transition-all duration-300 rounded-xs cursor-pointer shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-green-700" />
                        <span>Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copia Codice</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-[#C0A09A]/80 tracking-wider block font-light">
                  ✨ Valido su tutte le collezioni senza spesa minima.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3 max-w-md" noValidate>
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

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Il tuo indirizzo email..."
                    className="bg-white/5 border border-white/20 text-xs text-white placeholder-gray-500 px-4 py-3.5 outline-none focus:border-[#C0A09A] focus:bg-white/10 transition-all duration-300 rounded-none w-full"
                    disabled={status === 'loading'}
                    required
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#C0A09A] hover:bg-white text-[#0D0D0D] hover:text-[#0D0D0D] text-[11px] uppercase tracking-[0.25em] px-7 py-3.5 font-semibold transition-all duration-500 whitespace-nowrap shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#0D0D0D]" />
                        <span>Accesso...</span>
                      </>
                    ) : (
                      <span>Entra nel Club</span>
                    )}
                  </button>
                </div>

                {/* GDPR Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="footer-gdpr-consent"
                    checked={gdprConsent}
                    onChange={(e) => {
                      setGdprConsent(e.target.checked);
                      if (status === 'error') setStatus('idle');
                    }}
                    className="mt-0.5 w-3.5 h-3.5 rounded-none border border-white/40 bg-white/10 text-[#C0A09A] accent-[#C0A09A] cursor-pointer shrink-0"
                    disabled={status === 'loading'}
                  />
                  <label
                    htmlFor="footer-gdpr-consent"
                    className="text-xs text-[#E8D3CF] tracking-wide leading-relaxed font-normal select-none cursor-pointer"
                  >
                    Accetto l'
                    <Link
                      href="/privacy"
                      className="text-white font-medium underline hover:text-[#C0A09A] transition-colors ml-1 mr-1"
                    >
                      Informativa sulla Privacy
                    </Link>
                    e acconsento alla ricezione di comunicazioni e vantaggi esclusivi.
                  </label>
                </div>

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-center gap-1.5 text-rose-300 text-xs tracking-wide pt-1 animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <span className="text-xs text-[#D6CECA] tracking-wide block font-light">
                  🔒 Rispettiamo la tua privacy. Nessun invio superfluo, cancellazione in 1 click.
                </span>
              </form>
            )}
          </div>

          {/* COLONNA 3: COLLEZIONI */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#FAF6F0] font-bold">
              Collezioni
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/shop?category=Collane" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Collane & Punto Luce
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Orecchini" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Orecchini & Pendenti
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Anelli" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Anelli Solitari & Pavé
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Set" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Set Parure Royale
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs sm:text-[13px] text-[#E8D3CF] hover:text-white transition-colors duration-200 tracking-wide font-semibold">
                  Tutti i Gioielli →
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNA 4: SERVIZIO CLIENTI */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#FAF6F0] font-bold">
              Servizio Clienti
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/assistenza-clienti" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Assistenza Clienti
                </Link>
              </li>
              <li>
                <Link href="/spedizioni-resi" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Spedizioni & Resi (14gg)
                </Link>
              </li>
              <li>
                <Link href="/garanzia" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Garanzia & Autenticità
                </Link>
              </li>
              <li>
                <Link href="/guida-taglie" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Guida alle Taglie Anelli
                </Link>
              </li>
              <li>
                <Link href="/cura-gioielli" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Cura del Gioiello
                </Link>
              </li>
              <li>
                <Link href="/impegno-animali" className="text-xs sm:text-[13px] text-[#E8D3CF] hover:text-white transition-colors duration-200 tracking-wide font-semibold flex items-center gap-1.5">
                  <HeartHandshake size={15} className="shrink-0 text-[#C0A09A]" />
                  <span>Impegno per gli Animali</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNA 5: CONFORMITÀ LEGALE & SOCIAL */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#FAF6F0] font-bold">
              Legale & Social
            </h3>
            <ul className="space-y-3.5 mb-8">
              <li>
                <Link href="/privacy" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Privacy Policy (GDPR)
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/termini-condizioni" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/termini-condizioni#recesso" className="text-xs sm:text-[13px] text-[#D6CECA] hover:text-white transition-colors duration-200 tracking-wide font-normal">
                  Diritto di Recesso (14 giorni)
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open_cookie_preferences'));
                    }
                  }}
                  className="text-xs sm:text-[13px] text-[#E8D3CF] hover:text-white transition-colors duration-200 tracking-wide font-medium cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>⚙️ Gestisci Consensi Cookie</span>
                </button>
              </li>
            </ul>

            {/* Social Links con Icone Vettoriali Ufficiali */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a 
                href="https://instagram.com/isabelpepe" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram Isabel Pepe"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#E8D3CF] hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://tiktok.com/@isabelpepe" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="TikTok Isabel Pepe"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#E8D3CF] hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V11.2a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.63z"/>
                </svg>
              </a>

              {/* Pinterest */}
              <a 
                href="https://pinterest.com/isabelpepe" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Pinterest Isabel Pepe"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#E8D3CF] hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Pinterest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.39.02-3.42l1.04-4.41s-.27-.53-.27-1.32c0-1.24.72-2.16 1.61-2.16.76 0 1.13.57 1.13 1.26 0 .77-.49 1.91-.74 2.97-.21.89.44 1.61 1.32 1.61 1.58 0 2.8-1.67 2.8-4.08 0-2.13-1.53-3.62-3.72-3.62-2.54 0-4.03 1.9-4.03 3.87 0 .77.3 1.59.67 2.04a.27.27 0 0 1 .06.26c-.07.3-.23.94-.26 1.08-.04.18-.14.22-.32.13-1.2-.56-1.95-2.31-1.95-3.72 0-3.03 2.2-5.81 6.35-5.81 3.33 0 5.92 2.38 5.92 5.55 0 3.31-2.09 5.98-4.99 5.98-.98 0-1.89-.51-2.21-1.11l-.6 2.29c-.22.84-.81 1.9-1.21 2.54A12 12 0 1 0 12 0z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/isabelpepe" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Isabel Pepe"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#E8D3CF] hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* BANDA METODI DI PAGAMENTO SICURI */}
        <div className="py-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* Badges Pagamento con Icone Ufficiali */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D6CECA] font-semibold">
              Pagamenti Sicuri & Rateali:
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full sm:w-auto">
              {/* Prima Fila Mobile: Carte & Digital Wallets */}
              <div className="flex items-center justify-center gap-2">
                {/* Visa */}
                <div className="h-7 sm:h-7.5 px-2.5 bg-white rounded-[5px] flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform" title="Visa">
                  <svg className="h-3.5 w-auto" viewBox="0 0 38 12" fill="none">
                    <path d="M14.62 0.32L9.58 11.68H6.46L3.92 2.52C3.76 1.9 3.4 1.68 2.88 1.4C2.06 0.94 0.96 0.58 0 0.36L0.08 0.32H5.06C5.74 0.32 6.32 0.78 6.48 1.54L7.7 8.04L11.46 0.32H14.62ZM27.02 8.36C27.04 5.16 22.42 4.98 22.46 3.56C22.48 3.12 22.92 2.64 23.94 2.5C24.44 2.44 25.82 2.38 27.34 3.08L27.94 0.72C27.12 0.42 26.06 0.16 24.72 0.16C21.44 0.16 19.14 1.92 19.12 4.4C19.1 6.26 20.76 7.3 22.02 7.92C23.32 8.56 23.76 8.96 23.74 9.54C23.72 10.42 22.68 10.82 21.72 10.84C19.78 10.88 18.66 10.34 17.76 9.94L17.14 12.38C18.06 12.8 19.74 13.16 21.46 13.18C24.96 13.18 27.24 11.44 27.02 8.36ZM34.96 11.68H37.72L35.32 0.32H32.78C32.16 0.32 31.64 0.68 31.42 1.24L26.86 11.68H30.12L30.78 9.86H34.78L34.96 11.68ZM31.66 7.42L33.3 2.92L34.24 7.42H31.66ZM18.52 0.32L15.98 11.68H12.92L15.46 0.32H18.52Z" fill="#1A1F71"/>
                  </svg>
                </div>

                {/* Mastercard */}
                <div className="h-7 sm:h-7.5 px-2 bg-white rounded-[5px] flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform" title="Mastercard">
                  <svg className="h-4.5 w-auto" viewBox="0 0 32 20" fill="none">
                    <circle cx="11" cy="10" r="7" fill="#EB001B"/>
                    <circle cx="21" cy="10" r="7" fill="#F79E1B" fillOpacity="0.9"/>
                    <path d="M16 4.75A6.97 6.97 0 0013.3 10c.87 2.1 2.7 3.6 4.9 4.25a6.97 6.97 0 002.7-4.25c-.87-2.1-2.7-3.6-4.9-4.25z" fill="#FF5F00"/>
                  </svg>
                </div>

                {/* Apple Pay */}
                <div className="h-7 sm:h-7.5 px-2.5 bg-black rounded-[5px] flex items-center justify-center border border-white/20 shadow-sm hover:scale-105 transition-transform" title="Apple Pay">
                  <svg className="h-3.5 w-auto fill-white" viewBox="0 0 170 100">
                    <path d="M47.7,40.1c-0.1-5,4-7.5,4.2-7.6c-2.3-3.4-5.9-3.9-7.2-4c-3.1-0.3-6,1.8-7.6,1.8c-1.6,0-3.9-1.8-6.4-1.7 c-3.3,0.1-6.4,1.9-8.1,4.9c-3.5,6.1-0.9,15.1,2.5,20c1.7,2.4,3.7,5.1,6.3,5c2.5-0.1,3.5-1.6,6.5-1.6c3,0,3.9,1.6,6.5,1.6 c2.7,0,4.4-2.5,6.1-4.9c1.9-2.8,2.7-5.5,2.8-5.6C53.5,47.8,47.8,45.6,47.7,40.1z M42.4,24.4c1.4-1.7,2.3-4.1,2-6.5 c-2,0.1-4.4,1.3-5.8,3c-1.3,1.5-2.4,3.9-2.1,6.3C38.9,27.3,41,26.1,42.4,24.4z"/>
                    <path d="M85.3,27.7h-11v30.7h6.2V46.6h4.8c6.6,0,10.9-4,10.9-9.5C96.2,31.5,91.8,27.7,85.3,27.7z M85.1,41.4h-4.6V33.1h4.6 c3.6,0,5.7,1.8,5.7,4.1C90.8,39.6,88.7,41.4,85.1,41.4z"/>
                    <path d="M109.8,39.2c-4.4,0-7.3,2.1-7.5,4.9c0,2.8,2.5,4.4,6.7,4.7l3,0.2c0.1,2.1-1.7,3.5-4.4,3.5c-2.3,0-4.4-0.8-5.7-1.6 l-1.4,4.2c1.7,1.1,4.5,1.9,7.6,1.9c6.4,0,9.9-3.2,9.9-8.5v-11H113v2.5C112,39.8,110.8,39.2,109.8,39.2z M112.1,46l-2.1-0.2 c-2.1-0.2-3.3-0.9-3.3-2.1c0-1.2,1.3-2,3-2c1.6,0,2.6,0.6,3,1.3V46z"/>
                    <path d="M124.9,59.3l5.5-12.7l-5.6-18.1h6.6l2.8,11.2l3.1-11.2h6.2L130.6,65.6H124.9z"/>
                  </svg>
                </div>

                {/* Google Pay */}
                <div className="h-7 sm:h-7.5 px-2.5 bg-white rounded-[5px] flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform" title="Google Pay">
                  <svg className="h-3.5 w-auto" viewBox="0 0 100 40">
                    <path fill="#4285F4" d="M19.1 16.5v4.6h11.2c-.5 2.8-2.1 5.2-4.6 6.8l7.5 5.8c4.4-4 6.9-10 6.9-17.2 0-1.7-.2-3.4-.5-5H19.1z"/>
                    <path fill="#34A853" d="M19.1 34.6c5.3 0 9.8-1.8 13.1-4.8l-7.5-5.8c-1.8 1.2-4.1 2-5.6 2-4.4 0-8.1-3-9.4-7.1H2l-7.5 5.8c3.7 7.4 11.4 12.5 19.8 12.5z"/>
                    <path fill="#FBBC05" d="M9.7 18.9c-.3-1-.5-2.1-.5-3.2s.2-2.2.5-3.2V6.7H2C.7 9.3 0 12.2 0 15.7s.7 6.4 2 9l7.7-5.8z"/>
                    <path fill="#EA4335" d="M19.1 8.8c2.9 0 5.5 1 7.5 2.9l5.6-5.6C28.8 2.8 24.3 1 19.1 1 10.7 1 3 6.1-.7 13.5l7.7 5.8c1.3-4.1 5-7.1 9.4-7.1z"/>
                    <text x="40" y="27" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill="#5F6368">Pay</text>
                  </svg>
                </div>
              </div>

              {/* Seconda Fila Mobile: PayPal & Rateizzazioni */}
              <div className="flex items-center justify-center gap-2">
                {/* PayPal */}
                <div className="h-7 sm:h-7.5 px-2.5 bg-white rounded-[5px] flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform" title="PayPal">
                  <svg className="h-4 w-auto" viewBox="0 0 100 32" fill="none">
                    <path d="M12.8 22.3H7.5l3.2-19.6h7.9c3.8 0 6.6 1.4 6.1 5-.4 3.7-3.1 5.9-6.7 5.9h-3.4l-1.8 8.7z" fill="#003087"/>
                    <path d="M25.7 7.7c-.5 3.7-3.1 5.9-6.7 5.9h-3.4l-1.8 8.7h-4.3l3.2-19.6h7.9c3.8 0 6.6 1.4 5.1 5z" fill="#0079C1" opacity="0.3"/>
                    <path d="M19.1 13.6h-3.4l-1.8 8.7h-3.6l2.3-14.3h4.7c3.3 0 5.7 1.2 5.3 4.3-.3 2.7-2.3 4.3-5 4.3z" fill="#00457C" opacity="0.2"/>
                    <text x="32" y="20" fontFamily="Arial, sans-serif" fontWeight="bold" fontStyle="italic" fontSize="16" fill="#003087">Pay<tspan fill="#0079C1">Pal</tspan></text>
                  </svg>
                </div>

                {/* Klarna */}
                <div className="h-7 sm:h-7.5 px-3 bg-[#FFB3C7] rounded-[5px] flex items-center justify-center shadow-sm hover:scale-105 transition-transform" title="Klarna - Paga in 3 rate">
                  <span className="text-black font-black text-[11px] tracking-tight">Klarna.</span>
                </div>

                {/* Scalapay */}
                <div className="h-7 sm:h-7.5 px-3 bg-[#FCE5E7] rounded-[5px] flex items-center justify-center border border-[#F0B8C4]/50 shadow-sm hover:scale-105 transition-transform" title="Scalapay - Paga in 3 rate">
                  <span className="text-[#D81E5B] font-extrabold text-[11px] tracking-tight">scalapay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impegno Etico */}
          <div className="flex items-center justify-center text-xs uppercase tracking-[0.18em] text-[#D6CECA] font-normal w-full lg:w-auto">
            <Link href="/impegno-animali" className="text-[#E8D3CF] hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-center">
              <HeartHandshake size={16} className="shrink-0 text-[#C0A09A]" />
              <span className="text-center">L'Arte del Dono — Il 5% per gli Animali</span>
            </Link>
          </div>

        </div>

        {/* FOOTER BOTTOM: DATI SOCIETARI & COPYRIGHT */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-[0.2em] text-[#D6CECA] uppercase font-normal text-center md:text-left">
          <p>© {new Date().getFullYear()} ISABEL PEPE. TUTTI I DIRITTI RISERVATI.</p>
          <p className="normal-case tracking-normal text-[#D6CECA] text-xs text-center md:text-right flex items-center justify-center md:justify-end gap-1.5 font-normal">
            Made with <Heart size={13} className="text-[#C0A09A] fill-[#C0A09A] shrink-0 inline" /> <span className="font-semibold text-white tracking-wider">Creativia Studio</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
