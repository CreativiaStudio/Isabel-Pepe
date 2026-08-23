import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Ruler, Sparkles, HelpCircle, CheckCircle2, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Guida alle Taglie Anelli — Come Misurare il Tuo Dito con Precisione",
  description:
    "Trova la misura ideale per il tuo anello o per un regalo a sorpresa. Tabella di conversione millimetrica IT/US e consigli pratici dei maestri orafi Isabel Pepe.",
  openGraph: {
    title: "Guida alle Taglie Anelli | Isabel Pepe Atelier",
    description:
      "Non rischiare di sbagliare misura. Segui la guida millimetrica comparativa IT/US e scopri come misurare il dito con precisione assoluta per il tuo anello.",
  },
  twitter: {
    title: "Guida alle Taglie Anelli Isabel Pepe",
    description:
      "Tabella comparativa IT/US e metodi veloci per calcolare la misura del tuo anello o per fare un regalo perfetto.",
  },
};

export default function GuidaTagliePage() {
  const ringSizes = [
    { sizeIT: '10', diameterMM: '15.9 mm', circumferenceMM: '50.0 mm', sizeUS: '5.25' },
    { sizeIT: '11', diameterMM: '16.2 mm', circumferenceMM: '51.0 mm', sizeUS: '5.75' },
    { sizeIT: '12', diameterMM: '16.5 mm', circumferenceMM: '52.0 mm', sizeUS: '6.0' },
    { sizeIT: '13', diameterMM: '16.8 mm', circumferenceMM: '53.0 mm', sizeUS: '6.5' },
    { sizeIT: '14', diameterMM: '17.2 mm', circumferenceMM: '54.0 mm', sizeUS: '7.0' },
    { sizeIT: '15', diameterMM: '17.5 mm', circumferenceMM: '55.0 mm', sizeUS: '7.25' },
    { sizeIT: '16', diameterMM: '17.8 mm', circumferenceMM: '56.0 mm', sizeUS: '7.75' },
    { sizeIT: '17', diameterMM: '18.1 mm', circumferenceMM: '57.0 mm', sizeUS: '8.0' },
    { sizeIT: '18', diameterMM: '18.5 mm', circumferenceMM: '58.0 mm', sizeUS: '8.5' },
    { sizeIT: '19', diameterMM: '18.8 mm', circumferenceMM: '59.0 mm', sizeUS: '8.75' },
    { sizeIT: '20', diameterMM: '19.1 mm', circumferenceMM: '60.0 mm', sizeUS: '9.25' },
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-3">
            Sizing & Fit Guide
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-6 text-gray-900">
            Guida alle Taglie Anelli
          </h1>
          <p className="font-sans text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Trovare la misura perfetta per il tuo anello Isabel Pepe è semplice. Consulta la tabella comparativa e segui le istruzioni per misurare con precisione il tuo dito o un anello esistente.
          </p>
        </div>

        {/* TABELLA COMPARATIVA TAGLIE */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-16">
          <div className="bg-[#FAF8F5] border-b border-gray-200 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className="text-[#C0A09A]" size={22} />
              <h2 className="font-serif text-xl tracking-wider uppercase text-gray-900">
                Tabella Comparativa Taglie (IT / US)
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#C0A09A] font-semibold">
              Misura Millimetrica
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-sans uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  <th className="py-4 px-6">Taglia Italiana (IT)</th>
                  <th className="py-4 px-6">Diametro Interno (mm)</th>
                  <th className="py-4 px-6">Circonferenza (mm)</th>
                  <th className="py-4 px-6">Taglia Internazionale (US)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700 font-light">
                {ringSizes.map((row, idx) => {
                  const isStandardSize = row.sizeIT === '12';
                  return (
                    <tr 
                      key={row.sizeIT} 
                      className={
                        isStandardSize 
                          ? 'bg-[#F5EBE9]/80 border-2 border-[#C0A09A] font-medium' 
                          : (idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] transition-colors')
                      }
                    >
                      <td className="py-3.5 px-6 font-semibold font-serif text-sm text-gray-900 flex items-center gap-2">
                        <span>Taglia {row.sizeIT}</span>
                        {isStandardSize && (
                          <span className="bg-[#C0A09A] text-white text-[9px] uppercase tracking-wider font-sans font-bold px-2 py-0.5 rounded-full">
                            Taglia Collezione Isabel Pepe
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-[#C0A09A] font-bold">
                        {row.diameterMM}
                      </td>
                      <td className="py-3.5 px-6 font-mono">
                        {row.circumferenceMM}
                      </td>
                      <td className="py-3.5 px-6 text-gray-900 font-medium">
                        US {row.sizeUS}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* METODI DI MISURAZIONE */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl tracking-widest uppercase text-gray-900 mb-3">
              Come Misurare il Tuo Dito
            </h2>
            <p className="text-xs text-gray-500 font-light tracking-wide uppercase">
              Scegli uno dei due metodi semplicissimi da effettuare a casa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* METODO 1 */}
            <div className="border border-gray-200 p-8 rounded-2xl bg-white shadow-sm hover:border-[#C0A09A] transition-colors">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-2">
                Metodo Consigliato
              </span>
              <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-4">
                1. Misura un Anello che Possiedi
              </h3>
              <ol className="space-y-3 text-xs text-gray-600 font-light leading-relaxed list-decimal pl-4">
                <li>Prendi un anello della giusta misura per il dito su cui indosserai la nuova creazione.</li>
                <li>Appoggia l'anello su un righello millimetrato.</li>
                <li>Misura con precisione il <strong>diametro interno</strong> (la distanza tra i due bordi interni nel punto più largo, escludendo il metallo).</li>
                <li>Confronta i millimetri ottenuti con la tabella sopra per identificare la tua Taglia IT.</li>
              </ol>
            </div>

            {/* METODO 2 */}
            <div className="border border-gray-200 p-8 rounded-2xl bg-white shadow-sm hover:border-[#C0A09A] transition-colors">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-2">
                Metodo Alternativo
              </span>
              <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-4">
                2. Misura la Circonferenza del Dito
              </h3>
              <ol className="space-y-3 text-xs text-gray-600 font-light leading-relaxed list-decimal pl-4">
                <li>Avvolgi un metro da sarta o una striscia di carta intorno alla base del dito desiderato.</li>
                <li>Assicurati che il nastro scorra senza stringere troppo e riesca a passare la nocca.</li>
                <li>Segna con una penna il punto di sovrapposizione ed usa un righello per misurarne la lunghezza in mm.</li>
                <li>Trova la corrispondente Circonferenza (mm) nella nostra tabella.</li>
              </ol>
            </div>

          </div>
        </div>

        {/* CONSIGLI PER VESTIBILITÀ PERFETTA */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-2xl mb-16">
          <h3 className="font-serif text-xl text-gray-900 tracking-wider uppercase mb-6 flex items-center gap-3">
            <Sparkles size={20} className="text-[#C0A09A]" />
            I Consigli degli Esperti Isabel Pepe
          </h3>
          <ul className="space-y-4 text-xs text-gray-600 font-light leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <span><strong>Temperatura delle mani:</strong> Misura la taglia preferibilmente a fine giornata, quando le mani sono calde. Le dita tendono ad essere più sottili al mattino presto o quando fa freddo.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <span><strong>Misure Intermedie:</strong> Se la tua misurazione si trova esattamente a metà tra due taglie (es. tra 13 e 14), ti consigliamo di ordinare la taglia più grande per un comfort ideale.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#C0A09A] flex-shrink-0 mt-0.5" />
              <span><strong>Considera il Modello:</strong> Gli anelli a fascia larga vestono leggermente più stretti rispetto agli anelli sottili o solitari. Per fasce larghe si consiglia una taglia in più.</span>
            </li>
          </ul>
        </div>

        {/* CONTATTO DIRETTAMENTE SE IN DUBBIO */}
        <div className="bg-[#1A1A1A] text-white p-8 sm:p-10 rounded-2xl text-center shadow-lg flex flex-col items-center">
          <HelpCircle size={36} className="text-[#C0A09A] mb-3" />
          <h3 className="font-serif text-2xl tracking-widest uppercase mb-2">Dubbi sulla Tua Taglia?</h3>
          <p className="text-xs text-gray-400 font-light max-w-lg mb-6">
            Scrivici indicando le tue misure o il modello che desideri: il nostro team di supporto è a tua completa disposizione.
          </p>
          <Link
            href="/assistenza-clienti"
            className="bg-[#C0A09A] hover:bg-white text-white hover:text-gray-900 text-xs font-semibold uppercase tracking-[0.2em] px-8 py-3.5 transition-all duration-300 flex items-center gap-2"
          >
            Contatta il Servizio Clienti
          </Link>
        </div>

        {/* NAVIGAZIONE SHOP */}
        <div className="mt-16 text-center border-t border-gray-100 pt-8">
          <Link href="/shop?category=Anelli" className="text-xs uppercase tracking-[0.25em] text-[#C0A09A] hover:text-gray-900 transition-colors font-medium">
            Scopri tutti gli Anelli Isabel Pepe →
          </Link>
        </div>

      </div>
    </div>
  );
}
