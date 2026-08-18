'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Settings, Check, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export function generateId(prefix: string) {
  return prefix + '_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visitorId, setVisitorId] = useState<string>('');
  const [consentId, setConsentId] = useState<string>('');

  // Categorie di consenso GDPR (Le categorie opzionali DEVONO essere disattivate di default per legge!)
  const [categories, setCategories] = useState({
    essential: true,   // Sempre attivo per funzionamento carrello & sicurezza
    functional: false, // Disattivato di default (Opt-in esplicito)
    analytics: false,  // Disattivato di default (Opt-in esplicito)
    marketing: false,  // Disattivato di default (Opt-in esplicito)
  });

  useEffect(() => {
    // 1. Inizializza o recupera Visitor ID
    let currentVid = localStorage.getItem('isabel_visitor_id');
    if (!currentVid) {
      currentVid = generateId('vid');
      localStorage.setItem('isabel_visitor_id', currentVid);
    }
    setVisitorId(currentVid);

    // 2. Inizializza o recupera Consent ID & scelte
    const savedConsent = localStorage.getItem('isabel_pepe_cookie_consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsentId(parsed.consentId || generateId('csnt'));
        if (parsed.categories) {
          setCategories(parsed.categories);
        }
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      const newCid = generateId('csnt');
      setConsentId(newCid);
      setShowBanner(true);
    }

    // 3. Listener globale per consentire la riapertura del banner da link nel footer ("Gestisci Consensi")
    const handleReopen = () => {
      setShowModal(true);
    };
    window.addEventListener('open_cookie_preferences', handleReopen);
    return () => window.removeEventListener('open_cookie_preferences', handleReopen);
  }, []);

  const saveConsent = async (type: 'all' | 'essential' | 'custom', customCategories?: typeof categories) => {
    const finalCategories = customCategories || (
      type === 'all'
        ? { essential: true, functional: true, analytics: true, marketing: true }
        : type === 'essential'
        ? { essential: true, functional: false, analytics: false, marketing: false }
        : categories
    );

    const activeCid = consentId || generateId('csnt');
    const activeVid = visitorId || localStorage.getItem('isabel_visitor_id') || generateId('vid');

    const consentData = {
      consentId: activeCid,
      visitorId: activeVid,
      categories: finalCategories,
      consentType: type,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    // Salva localmente
    localStorage.setItem('isabel_pepe_cookie_consent', JSON.stringify(consentData));
    localStorage.setItem('isabel_consent_id', activeCid);
    localStorage.setItem('isabel_visitor_id', activeVid);

    // Aggiorna stato UI
    setCategories(finalCategories);
    setShowBanner(false);
    setShowModal(false);

    // Emetti evento per GTM / Tracker
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('isabel_cookie_consent', { detail: consentData }));
    }

    // Invia al server (Registrazione Legale del Consenso GDPR & Sync CRM / Carrelli Abbandonati)
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData),
      });
    } catch (err) {
      console.warn('Errore salvataggio consenso server-side:', err);
    }
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* 0. OVERLAY MORBIDO DI SFONDO (INVITA L'UTENTE ALLA SCELTA IN MODO ELEGANTE) */}
      {(showBanner || showModal) && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* 1. BANNER PRINCIPALE DI PRIMO LIVELLO (COMPATTO & DI LUSSO) */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-[#C0A09A]/40 text-white shadow-2xl transition-all duration-500 animate-slide-up">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck size={18} className="text-[#C0A09A]" />
                <h4 className="font-serif text-base sm:text-lg text-white uppercase tracking-wider">
                  Rispetto della Privacy &amp; Consenso Cookie
                </h4>
              </div>
              <p className="font-sans text-gray-300 text-xs leading-relaxed font-light tracking-wide max-w-4xl">
                Il nostro atelier utilizza cookie tecnici indispensabili per il funzionamento dell'e-commerce, e previo tuo consenso, cookie di profilazione e statistici per offrirti un'esperienza di acquisto su misura (Regolamento UE 2016/679 GDPR). Consulta la nostra{' '}
                <Link href="/privacy" className="text-[#C0A09A] underline hover:text-white transition">Privacy Policy</Link> ed il{' '}
                <Link href="/cookie-policy" className="text-[#C0A09A] underline hover:text-white transition">Regolamento Cookie</Link>.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-[#C0A09A] text-gray-300 hover:text-white text-[10px] sm:text-[11px] uppercase tracking-[0.2em] px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Settings size={14} />
                <span>Personalizza</span>
              </button>

              <button
                type="button"
                onClick={() => saveConsent('essential')}
                className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-white text-white text-[10px] sm:text-[11px] uppercase tracking-[0.2em] px-5 py-3 font-medium transition-all duration-300 cursor-pointer"
              >
                Solo Necessari
              </button>

              <button
                type="button"
                onClick={() => saveConsent('all')}
                className="w-full sm:w-auto bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] px-6 py-3 font-semibold transition-all duration-300 shadow-lg cursor-pointer whitespace-nowrap"
              >
                Accetta Tutti
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. MODAL PREFERENZE DETTAGLIATE (GRANULARE GDPR CON CATEGORIE ED ID) */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative bg-[#FAF8F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#F0E6E1] my-auto text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsante Chiusura */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-1">
                Centro Gestione Privacy &amp; GDPR
              </span>
              <h3 className="font-serif text-2xl text-gray-900 tracking-wide">
                Personalizza le tue Preferenze
              </h3>
              <p className="text-xs text-gray-600 font-light mt-1.5 leading-relaxed">
                Puoi scegliere liberamente quali categorie di cookie e tracciamento abilitare. Le tue scelte sono salvate con un identificativo anonimo univoco a tutela della trasparenza legale.
              </p>
              {consentId && (
                <div className="mt-2 text-[10px] font-mono text-gray-400">
                  ID Consenso: <span className="text-[#8C6558]">{consentId}</span>
                </div>
              )}
            </div>

            {/* Lista Categorie con Switch (Predefinite a OFF a norma di legge) */}
            <div className="space-y-3.5 mb-8 max-h-[50vh] overflow-y-auto pr-1">
              
              {/* 1. Cookie Tecnici Necessari */}
              <div className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-start justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-[#C0A09A]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                      1. Tecnici &amp; Strettamente Necessari
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold">
                      Sempre Attivi
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    Indispensabili per il carrello, la sicurezza delle transazioni, la sessione d'acquisto e per memorizzare le tue preferenze sulla privacy. Non possono essere disattivati.
                  </p>
                </div>
                <div className="w-11 h-6 bg-[#C0A09A] rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-80 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </div>
              </div>

              {/* 2. Funzionali & Preferenze */}
              <div className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-start justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                      2. Funzionalità &amp; Preferenze
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    Consentono di salvare i gioielli nella Wishlist, memorizzare la valuta e personalizzare l'esperienza di navigazione.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategories(prev => ({ ...prev, functional: !prev.functional }))}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 cursor-pointer ${
                    categories.functional ? 'bg-[#C0A09A] justify-end' : 'bg-gray-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>
              </div>

              {/* 3. Analitici & Misurazione */}
              <div className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-start justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                      3. Analitici &amp; Statistiche
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    Ci aiutano a capire quali collezioni sono più apprezzate raccogliendo metriche anonime e aggregate lato server sul traffico del sito.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategories(prev => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 cursor-pointer ${
                    categories.analytics ? 'bg-[#C0A09A] justify-end' : 'bg-gray-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>
              </div>

              {/* 4. Marketing & Carrelli Abbandonati */}
              <div className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-start justify-between gap-4 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                      4. Marketing &amp; Comunicazioni
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                    Permettono di ricevere assistenza sui carrelli lasciati in sospeso, inviare offerte dedicate e coupon personalizzati via email o WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategories(prev => ({ ...prev, marketing: !prev.marketing }))}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 cursor-pointer ${
                    categories.marketing ? 'bg-[#C0A09A] justify-end' : 'bg-gray-200 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                </button>
              </div>

            </div>

            {/* Footer Azioni */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 border-t border-[#F0E6E1]">
              <button
                type="button"
                onClick={() => saveConsent('essential')}
                className="w-full sm:w-auto px-5 py-3 border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 text-[11px] uppercase tracking-wider font-medium rounded-lg transition cursor-pointer"
              >
                Rifiuta Opzionali
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveConsent('custom', categories)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-black text-white text-[11px] uppercase tracking-wider font-semibold rounded-lg transition cursor-pointer shadow-sm"
                >
                  Salva Preferenze
                </button>

                <button
                  type="button"
                  onClick={() => saveConsent('all')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#C0A09A] hover:bg-[#a88680] text-white text-[11px] uppercase tracking-wider font-semibold rounded-lg transition cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Accetta Tutti
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
