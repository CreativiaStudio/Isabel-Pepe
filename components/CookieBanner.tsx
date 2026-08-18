'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verifichiamo se l'utente ha già salvato il consenso
    const consent = localStorage.getItem('isabel_pepe_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = async (type: 'all' | 'essential') => {
    try {
      // Salva la scelta in localStorage
      const consentData = {
        choice: type,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('isabel_pepe_cookie_consent', JSON.stringify(consentData));

      // Invia il consenso al nostro endpoint GDPR per registrare l'indirizzo IP e la scelta a norma di legge
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'cookie_consent',
          eventData: consentData,
        }),
      }).catch(() => {});

    } catch (e) {
      console.error(e);
    } finally {
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-[#C0A09A]/40 text-white shadow-2xl transition-all duration-500 animate-slide-up">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex-1 text-left">
          <h4 className="font-serif text-lg text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🍪 Rispetto della tua Privacy & Cookie</span>
          </h4>
          <p className="font-sans text-gray-300 text-xs leading-relaxed font-light tracking-wide max-w-4xl">
            Utilizziamo cookie tecnici essenziali ed analitici per garantirti la migliore esperienza di navigazione sul nostro atelier, personalizzare i contenuti e processare gli ordini in totale sicurezza (GDPR UE 2016/679). Per maggiori dettagli consulta la nostra{' '}
            <a href="/privacy" className="text-[#C0A09A] underline hover:text-white transition">Privacy Policy</a> ed il{' '}
            <a href="/cookie-policy" className="text-[#C0A09A] underline hover:text-white transition">Regolamento Cookie</a>.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleAccept('essential')}
            className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-white text-white text-[11px] uppercase tracking-[0.2em] px-6 py-3 font-medium transition-all duration-300"
          >
            Solo Essenziali
          </button>
          <button
            onClick={() => handleAccept('all')}
            className="w-full sm:w-auto bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-[11px] uppercase tracking-[0.2em] px-8 py-3 font-medium transition-all duration-300 shadow-lg"
          >
            Accetta Tutti
          </button>
        </div>

      </div>
    </div>
  );
}
