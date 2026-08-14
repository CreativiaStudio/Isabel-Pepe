'use client';

import Link from 'next/link';
import { HeartHandshake, Truck } from 'lucide-react';

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
                  Spedizioni Express & Resi 30gg
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
          
          {/* Badges Pagamento */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
              Pagamenti Sicuri & Rateali:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-white/10 text-white text-[9px] font-mono px-2.5 py-1 rounded border border-white/10">
                Stripe 256-bit
              </span>
              <span className="bg-white/10 text-white text-[9px] font-mono px-2.5 py-1 rounded border border-white/10">
                Visa / Mastercard
              </span>
              <span className="bg-white/10 text-white text-[9px] font-mono px-2.5 py-1 rounded border border-white/10">
                Apple Pay / Google Pay
              </span>
              <span className="bg-[#003087] text-white text-[9px] font-bold italic px-2.5 py-1 rounded shadow-sm">
                PayPal
              </span>
              <span className="bg-[#FFB3C7] text-black text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                Klarna.
              </span>
              <span className="bg-[#FCE5E7] text-[#D81E5B] text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                scalapay
              </span>
            </div>
          </div>

          {/* Impegno & Spedizioni */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 font-light w-full lg:w-auto">
            <Link href="/impegno-animali" className="text-[#C0A09A] hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-center">
              <HeartHandshake size={15} className="shrink-0" />
              <span className="text-center">L'Arte del Dono — Insieme per gli Animali</span>
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="flex items-center justify-center gap-2 text-center">
              <Truck size={15} className="text-[#C0A09A] shrink-0" />
              <span className="text-center">Spedizioni Express Packlink & Poste Italiane</span>
            </span>
          </div>

        </div>

        {/* FOOTER BOTTOM: DATI SOCIETARI & COPYRIGHT */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] text-gray-500 uppercase font-light text-center md:text-left">
          <p>© {new Date().getFullYear()} ISABEL PEPE. TUTTI I DIRITTI RISERVATI.</p>
          <p className="normal-case tracking-normal text-gray-400 text-[11px] text-center md:text-right">
            Creativia Digital Studio di Mario Pepe • P.IVA 02100840683 • PEC: creativiastudio@pec.it
          </p>
        </div>

      </div>
    </footer>
  );
}
