import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Informativa sulla Privacy & GDPR",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR). Trasparenza e sicurezza per i tuoi acquisti su Isabel Pepe.",
  openGraph: {
    title: "Informativa sulla Privacy & GDPR | Isabel Pepe",
    description:
      "Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR). Trasparenza e sicurezza per i tuoi acquisti su Isabel Pepe.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-4 text-center">
          Privacy Policy
        </h1>
        <p className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] text-center mb-12 font-semibold">
          Conformità GDPR (Regolamento UE 2016/679)
        </p>

        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-8 font-light tracking-wide">
          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              1. Titolare del Trattamento dei Dati
            </h2>
            <p>
              Il Titolare del trattamento dei dati personali raccolti attraverso il presente sito web <strong>Isabel Pepe</strong> è:
            </p>
            <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#F0E6E1] text-xs text-gray-800 space-y-1 font-mono my-4">
              <p><strong>Ragione Sociale:</strong> Creativia Digital Studio di Mario Pepe</p>
              <p><strong>P.IVA:</strong> 02100840683</p>
              <p><strong>Sede Legale:</strong> Italia</p>
              <p><strong>PEC:</strong> creativiastudio@pec.it</p>
              <p><strong>Email di Contatto:</strong> info@isabelpepe.com</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              2. Tipologia di Dati Raccolti
            </h2>
            <p>
              Raccogliamo i dati necessari per la gestione degli ordini e l'erogazione dei servizi e-commerce:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Dati anagrafici e di contatto (Nome, Cognome, Indirizzo di spedizione, Email, Telefono).</li>
              <li>Dati relativi ai pagamenti gestiti in modo sicuro e crittografato tramite i nostri partner (Stripe, PayPal, Klarna).</li>
              <li>Dati di navigazione e log tecnici di sistema per la sicurezza del sito web.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              3. Finalità e Base Giuridica del Trattamento
            </h2>
            <p>
              I tuoi dati personali vengono trattati esclusivamente per:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>L'esecuzione del contratto di vendita ed invio degli ordini tramite corriere espresso (Packlink / Poste Italiane).</li>
              <li>L'adempimento degli obblighi di legge, fiscali e contabili.</li>
              <li>L'invio di comunicazioni relative allo stato dell'ordine o della spedizione.</li>
              <li>Previo tuo esplicito consenso, l'invio della nostra newsletter per aggiornamenti sulle nuove collezioni.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              4. Diritti dell'Interessato
            </h2>
            <p>
              Ai sensi degli artt. 15-22 del GDPR, hai il diritto di accedere, rettificare, cancellare o limitare il trattamento dei tuoi dati personali in qualsiasi momento, inviando una semplice richiesta all'indirizzo email <a href="mailto:privacy@isabelpepe.com" className="text-[#C0A09A] underline">privacy@isabelpepe.com</a> (oppure a <a href="mailto:info@isabelpepe.com" className="text-[#C0A09A] underline">info@isabelpepe.com</a>).
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
