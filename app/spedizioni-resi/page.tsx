import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Truck, RotateCcw, ShieldCheck, Clock, PackageCheck, MapPin, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Spedizioni e Resi",
  description:
    "Spedizioni express 48h sempre gratuite in tutta Italia con corriere espresso (senza minimo di spesa). Reso facile entro 14 giorni garantito.",
  openGraph: {
    title: "Spedizioni e Resi | Isabel Pepe",
    description:
      "Spedizioni express 48h sempre gratuite in tutta Italia con corriere espresso (senza minimo di spesa). Reso facile entro 14 giorni garantito.",
  },
};

export default function SpedizioniResiPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-3">
            Logistica Express & Garanzia Cliente
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-6 text-gray-900">
            Spedizioni & Resi
          </h1>
          <p className="font-sans text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Consegne rapide in 48 ore lavorative sempre gratuite in tutta Italia ed un servizio di reso garantito entro 14 giorni per offrirti un'esperienza di acquisto in totale serenità.
          </p>
        </div>

        {/* SEZIONE 1: SPEDIZIONI EXPRESS */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-12 rounded-2xl mb-16 shadow-sm">
          <div className="flex items-center gap-3 text-[#C0A09A] mb-4">
            <Truck size={24} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold">Servizio Spedizioni Espresse Poste Italiane & SDA</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider mb-6">
            Spedizioni Express In 48 Ore Lavorative
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-600 leading-relaxed font-light mb-8">
            <div className="space-y-4">
              <p>
                Tutti gli ordini ricevuti su <strong>Isabel Pepe</strong> vengono elaborati con massima cura e spediti tramite corriere espresso <strong>Poste Italiane / SDA</strong>.
              </p>
              <p>
                <strong>Spedizione Sempre Gratuita:</strong> Offriamo la spedizione espressa <strong>100% gratuita in tutta Italia</strong> per qualsiasi ordine, senza alcun importo o soglia minima di spesa.
              </p>
            </div>

            <div className="space-y-4">
              <p>
                <strong>Tracciamento in Tempo Reale:</strong> Al momento dell'affidamento del pacco al corriere, riceverai un'email ed un messaggio contenente il tuo <strong>Tracking Code</strong> per monitorare ogni fase della consegna.
              </p>
              <p>
                <strong>Imballo di Sicurezza:</strong> Ogni spedizione viaggia all'interno di un packaging rigido, anonimo ed assicurato, per garantire che il tuo cofanetto di lusso arrivi integro ed in perfetto stato.
              </p>
            </div>
          </div>

          {/* TEMPI E COSTI TABELLA RIASSUNTIVA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F0E6E1]">
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <Clock className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Tempi Consegna</span>
              <span className="font-serif text-lg text-gray-900 font-medium">48 Ore Lavorative</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <PackageCheck className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Costo Spedizione</span>
              <span className="font-serif text-lg text-gray-900 font-medium text-green-700">Sempre Gratuita</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <MapPin className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Copertura</span>
              <span className="font-serif text-lg text-gray-900 font-medium">Tutta Italia</span>
            </div>
          </div>
        </div>

        {/* SEZIONE 2: RESI E RECESSO 14 GIORNI */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-3">
              <RotateCcw size={24} />
            </div>
            <h2 className="font-serif text-3xl tracking-widest uppercase text-gray-900 mb-3">
              Politica di Reso & Recesso (14 Giorni)
            </h2>
            <p className="text-xs text-gray-500 font-light tracking-wide uppercase">
              Diritto di Recesso ai sensi dell'Art. 52 del Codice del Consumo (D.Lgs. 206/2005)
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-8 sm:p-10 rounded-2xl shadow-sm space-y-6 text-xs text-gray-600 font-light leading-relaxed mb-10">
            <p>
              Desideriamo che tu sia al 100% soddisfatto del tuo gioiello Isabel Pepe. In conformità con la normativa italiana ed europea (Codice del Consumo), hai il diritto di recedere dal contratto di acquisto e restituire il gioiello entro <strong>14 giorni di calendario</strong> a partire dal giorno di effettiva ricezione del pacco.
            </p>
            <p>
              Per poter esercitare il diritto di reso, il gioiello deve essere restituito <strong>integro, mai indossato, non alterato o danneggiato</strong> e custodito nella sua confezione originale completa di Cofanetto Luxury Isabel Pepe, certificato di garanzia e panno in microfibra in omaggio.
            </p>
          </div>

          {/* STEP PROCEDURA RESO */}
          <h3 className="font-serif text-xl tracking-wider uppercase text-center text-gray-900 mb-8">
            Come Effettuare un Reso in 3 Semplici Passaggi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="border border-gray-100 p-6 rounded-xl bg-white shadow-sm hover:border-[#C0A09A] transition-colors">
              <span className="w-8 h-8 rounded-full bg-[#C0A09A] text-white text-xs font-serif flex items-center justify-center font-bold mb-4">
                1
              </span>
              <h4 className="font-serif text-base text-gray-900 uppercase mb-2">Richiedi il Reso</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Invia un'email entro 14 giorni a <a href="mailto:resi@isabelpepe.com" className="text-[#C0A09A] underline">resi@isabelpepe.com</a> indicando il numero d'ordine e il nome del gioiello che desideri restituire.
              </p>
            </div>

            <div className="border border-gray-100 p-6 rounded-xl bg-white shadow-sm hover:border-[#C0A09A] transition-colors">
              <span className="w-8 h-8 rounded-full bg-[#C0A09A] text-white text-xs font-serif flex items-center justify-center font-bold mb-4">
                2
              </span>
              <h4 className="font-serif text-base text-gray-900 uppercase mb-2">Prepara il Pacco</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Riponi il gioiello nel cofanetto rigido originale con tutti gli accessori. Riceverai le istruzioni e l'indirizzo logistico per la spedizione del reso.
              </p>
            </div>

            <div className="border border-gray-100 p-6 rounded-xl bg-white shadow-sm hover:border-[#C0A09A] transition-colors">
              <span className="w-8 h-8 rounded-full bg-[#C0A09A] text-white text-xs font-serif flex items-center justify-center font-bold mb-4">
                3
              </span>
              <h4 className="font-serif text-base text-gray-900 uppercase mb-2">Ricevi il Rimborso</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Non appena il reso rientra ed è verificata l'integrità del gioiello, emetteremo il rimborso completo sullo stesso metodo di pagamento utilizzato in fase d'ordine entro 3-5 giorni lavorativi.
              </p>
            </div>

          </div>
        </div>

        {/* GARANZIA SICUREZZA */}
        <div className="bg-[#1A1A1A] text-white p-8 sm:p-10 rounded-2xl text-center shadow-lg flex flex-col items-center">
          <ShieldCheck size={36} className="text-[#C0A09A] mb-3" />
          <h3 className="font-serif text-2xl tracking-widest uppercase mb-2">Hai Bisogno di Aiuto con il Tuo Ordine?</h3>
          <p className="text-xs text-gray-400 font-light max-w-lg mb-6">
            Il nostro team di assistenza è a tua completa disposizione per assisterti in ogni fase della spedizione o del reso.
          </p>
          <Link
            href="/assistenza-clienti"
            className="bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 transition-all duration-300 flex items-center gap-2"
          >
            Contatta il Concierge
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* NAVIGAZIONE SHOP */}
        <div className="mt-16 text-center border-t border-gray-100 pt-8">
          <Link href="/" className="text-xs uppercase tracking-[0.25em] text-gray-400 hover:text-gray-900 transition-colors">
            ← Ritorna alla Home Page
          </Link>
        </div>

      </div>
    </div>
  );
}
