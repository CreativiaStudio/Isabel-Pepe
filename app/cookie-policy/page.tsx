import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-4 text-center">
          Cookie Policy
        </h1>
        <p className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] text-center mb-12 font-semibold">
          Informativa estesa sull'uso dei Cookie
        </p>

        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-8 font-light tracking-wide">
          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              1. Cosa sono i Cookie
            </h2>
            <p>
              I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              2. Tipologie di Cookie Utilizzati
            </h2>
            <p>
              Questo sito web utilizza esclusivamente le seguenti tipologie di cookie:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cookie Tecnici e Strettamente Necessari:</strong> Indispensabili per il corretto funzionamento del carrello, della gestione della sessione d'acquisto e della sicurezza.</li>
              <li><strong>Cookie Analitici:</strong> Utilizzati per raccogliere informazioni in forma aggregata ed anonima sul numero degli utenti e su come questi visitano il sito.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              3. Gestione dei Consensi
            </h2>
            <p>
              Puoi modificare o revocare il tuo consenso all'uso dei cookie in qualsiasi momento attraverso le impostazioni del tuo browser o inviando una richiesta a <a href="mailto:sviluppo@creativiastudio.com" className="text-[#C0A09A] underline">sviluppo@creativiastudio.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center border-t border-gray-100 pt-8">
          <Link href="/" className="inline-block bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-[0.25em]">
            Ritorna alla Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
