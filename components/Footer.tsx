'use client';

import Link from 'next/link';
import { HeartHandshake, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-white pt-20 pb-12 px-4 sm:px-6 mt-auto border-t border-[#C0A09A]/40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* GRIGLIA PRINCIPALE FOOTER (4 Colonne) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
          
          {/* COLONNA 1 & 2: BRAND & NEWSLETTER EXECUTIVE */}
          <div className="sm:col-span-2 lg:pr-12">
            <h2 className="font-serif tracking-[0.25em] text-3xl sm:text-4xl mb-3 text-white uppercase">
              ISABEL PEPE
            </h2>
            <p className="font-sans text-gray-400 text-xs leading-relaxed mb-6 font-light tracking-wider max-w-md">
              Iscriviti al nostro Club Esclusivo per accedere in anteprima alle nuove collezioni e consigli di stile personalizzati.
            </p>

            {/* Form Newsletter Premium */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Inserisci la tua email..."
                className="bg-white/5 border border-white/15 text-xs text-white placeholder-gray-500 px-4 py-3.5 outline-none focus:border-[#C0A09A] focus:bg-white/10 transition-all duration-300 rounded-none w-full"
                required
              />
              <button
                type="submit"
                className="bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-[11px] uppercase tracking-[0.25em] px-8 py-3.5 font-medium transition-all duration-500 whitespace-nowrap shadow-lg"
              >
                Iscriviti
              </button>
            </form>
            <span className="text-[10px] text-gray-500 tracking-wider block mt-3 font-light">
              🔒 Rispettiamo la tua privacy. Puoi disiscriverti in qualsiasi momento.
            </span>
          </div>

          {/* COLONNA 3: COLLEZIONI */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#C0A09A] font-semibold">
              Collezioni
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/shop?category=Collane" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Collane & Punto Luce
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Orecchini" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Orecchini & Pendenti
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Anelli" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Anelli Solitari & Pavé
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Set" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Set Parure Royale
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs text-[#C0A09A] hover:text-white transition-colors duration-300 tracking-wider font-medium">
                  Tutti i Gioielli →
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNA 4: SERVIZIO CLIENTI */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#C0A09A] font-semibold">
              Servizio Clienti
            </h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/assistenza-clienti" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Assistenza Clienti
                </Link>
              </li>
              <li>
                <Link href="/spedizioni-resi" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Spedizioni & Resi (14gg)
                </Link>
              </li>
              <li>
                <Link href="/garanzia" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Garanzia & Autenticità
                </Link>
              </li>
              <li>
                <Link href="/guida-taglie" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Guida alle Taglie Anelli
                </Link>
              </li>
              <li>
                <Link href="/cura-gioielli" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Cura del Gioiello
                </Link>
              </li>
              <li>
                <Link href="/impegno-animali" className="text-xs text-[#C0A09A] hover:text-white transition-colors duration-300 tracking-wider font-medium flex items-center gap-1.5">
                  <HeartHandshake size={14} className="shrink-0" />
                  <span>Impegno per gli Animali</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNA 5: CONFORMITÀ LEGALE & SOCIAL */}
          <div>
            <h3 className="font-sans tracking-[0.25em] text-xs uppercase mb-6 text-[#C0A09A] font-semibold">
              Legale & Social
            </h3>
            <ul className="space-y-3.5 mb-8">
              <li>
                <Link href="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Privacy Policy (GDPR)
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/termini-condizioni" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Termini e Condizioni
                </Link>
              </li>
              <li>
                <Link href="/termini-condizioni#recesso" className="text-xs text-gray-400 hover:text-white transition-colors duration-300 tracking-wider font-light">
                  Diritto di Recesso (14 giorni)
                </Link>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-300 hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/10 transition-all duration-300">
                IG
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-300 hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/10 transition-all duration-300">
                TK
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-300 hover:text-white hover:border-[#C0A09A] hover:bg-[#C0A09A]/10 transition-all duration-300">
                PT
              </a>
            </div>
          </div>

        </div>

        {/* BANDA METODI DI PAGAMENTO SICURI */}
        <div className="py-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* Badges Pagamento con Icone Ufficiali */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
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
          <div className="flex items-center justify-center text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 font-light w-full lg:w-auto">
            <Link href="/impegno-animali" className="text-[#C0A09A] hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-center">
              <HeartHandshake size={15} className="shrink-0" />
              <span className="text-center">L'Arte del Dono — Il 5% per gli Animali</span>
            </Link>
          </div>

        </div>

        {/* FOOTER BOTTOM: DATI SOCIETARI & COPYRIGHT */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] text-gray-500 uppercase font-light text-center md:text-left">
          <p>© {new Date().getFullYear()} ISABEL PEPE. TUTTI I DIRITTI RISERVATI.</p>
          <p className="normal-case tracking-normal text-gray-400 text-[11px] text-center md:text-right flex items-center justify-center md:justify-end gap-1.5 font-light">
            Made with <Heart size={13} className="text-[#C0A09A] fill-[#C0A09A] shrink-0 inline" /> <span className="font-medium text-white tracking-wider">Creativia Studio</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
