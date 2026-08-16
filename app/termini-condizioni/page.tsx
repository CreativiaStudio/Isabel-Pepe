import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Termini e Condizioni di Vendita",
  description:
    "Condizioni generali di vendita e-commerce Isabel Pepe: pagamenti protetti, garanzia legale di conformità 24 mesi e diritto di recesso 14 giorni.",
  openGraph: {
    title: "Termini e Condizioni di Vendita | Isabel Pepe",
    description:
      "Condizioni generali di vendita e-commerce Isabel Pepe: pagamenti protetti, garanzia legale di conformità 24 mesi e diritto di recesso 14 giorni.",
  },
};

export default function TerminiCondizioniPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-4 text-center">
          Termini e Condizioni di Vendita
        </h1>
        <p className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] text-center mb-12 font-semibold">
          Condizioni Generali di Contratto per gli Acquisti Online
        </p>

        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-8 font-light tracking-wide">
          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              1. Informazioni Generali
            </h2>
            <p>
              Le presenti Condizioni Generali di Vendita disciplinano l'acquisto dei prodotti firmati <strong>Isabel Pepe</strong> effettuato tramite il sito e-commerce gestito da:
            </p>
            <div className="bg-[#FAF8F5] p-5 rounded-lg border border-[#F0E6E1] text-xs text-gray-800 space-y-1 font-mono my-4">
              <p><strong>Ditta Individuale:</strong> Creativia Digital Studio di Mario Pepe</p>
              <p><strong>P.IVA:</strong> 02100840683</p>
              <p><strong>PEC:</strong> creativiastudio@pec.it</p>
              <p><strong>Email Assistenza:</strong> assistenza@isabelpepe.com</p>
              <p><strong>Email Resi & Recesso:</strong> resi@isabelpepe.com</p>
              <p><strong>Informazioni Generali:</strong> info@isabelpepe.com</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              2. Prezzi e Modalità di Pagamento
            </h2>
            <p>
              Tutti i prezzi indicati sul sito sono espressi in Euro (€) ed inclusivi di IVA di legge. I pagamenti possono essere effettuati in modo sicuro tramite Stripe (Carte di Credito/Debito, Apple Pay, Google Pay), PayPal, Klarna o Scalapay.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              3. Spedizioni e Consegna
            </h2>
            <p>
              Le spedizioni con corriere espresso (Packlink / Poste Italiane) sono sempre gratuite su tutti gli ordini e vengono affidate entro 24/48 ore lavorative dalla conferma del pagamento. Il cliente riceverà via email il codice di tracciamento (Tracking Code) per seguire la spedizione in tempo reale.
            </p>
          </section>

          <section id="recesso">
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              4. Diritto di Recesso e Resi (14 giorni)
            </h2>
            <p>
              Ai sensi dell'art. 52 del Codice del Consumo (D.Lgs. 206/2005), il Cliente ha il diritto di recedere dal contratto di acquisto entro il termine di <strong>14 giorni di calendario</strong> dall'avvenuta consegna dei prodotti, senza alcuna penalità. I gioielli restituiti devono essere integri, mai indossati o danneggiati, e custoditi nel loro cofanetto rigido e confezione originale completa di certificato di garanzia.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-3">
              5. Garanzia Legale di Conformità (24 mesi)
            </h2>
            <p>
              Ogni gioiello Isabel Pepe è coperto dalla Garanzia Legale di Conformità di 24 mesi ai sensi degli artt. 128 e ss. del Codice del Consumo per qualsiasi difetto originario di fabbricazione dei materiali. La garanzia non copre la normale usura, graffi, ossidazione superficiale, danni accidentali o alterazioni provocate da sostanze chimiche e profumi. Per l'informativa completa, consulta la pagina dedicata: <Link href="/garanzia" className="text-[#C0A09A] underline font-medium">Garanzia & Certificato di Autenticità</Link>.
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
