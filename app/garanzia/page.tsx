import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Award, Sparkles, AlertCircle, HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: "Garanzia & Certificato di Autenticità",
  description:
    "Scopri la politica di garanzia e il Certificato di Autenticità Isabel Pepe: materiali certificati Argento 925, placcatura Oro 18K/Rodio e tutela sui difetti di fabbricazione.",
  openGraph: {
    title: "Garanzia & Certificato di Autenticità | Isabel Pepe",
    description:
      "Scopri la politica di garanzia e il Certificato di Autenticità Isabel Pepe: materiali certificati Argento 925, placcatura Oro 18K/Rodio e tutela sui difetti di fabbricazione.",
  },
};

export default function GaranziaPage() {
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-3">
            Trasparenza & Alta Manifattura
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-6 text-gray-900">
            Garanzia & Autenticità
          </h1>
          <p className="font-sans text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Ogni gioiello Isabel Pepe è una creazione demi-fine concepita per durare nel tempo, accompagnata dal Certificato Ufficiale di Autenticità e dalla Garanzia Legale di Conformità.
          </p>
        </div>

        {/* SEZIONE 1: IL CERTIFICATO DI AUTENTICITÀ */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-12 rounded-2xl mb-16 shadow-sm">
          <div className="flex items-center gap-3 text-[#C0A09A] mb-4">
            <Award size={24} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold">Certificato Ufficiale Incluso</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider mb-6">
            Cosa Attesta il Nostro Certificato di Garanzia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-600 leading-relaxed font-light mb-8">
            <div className="space-y-4">
              <p>
                All'interno del tuo <strong>Cofanetto Luxury</strong> troverai il <strong>Certificato Ufficiale di Autenticità & Garanzia Isabel Pepe</strong>, un documento nominale che attesta la purezza e le specifiche tecniche della tua creazione.
              </p>
              <p>
                <strong>Purezza Argento 925 & Incisione "IP":</strong> Certifica l'utilizzo esclusivo di Argento Sterling 925 anallergico al 100%, con punzonatura legale "S925" e incisione laser ufficiale delle iniziali del marchio <strong>"IP" (Isabel Pepe)</strong> su ogni gioiello.
              </p>
            </div>

            <div className="space-y-4">
              <p>
                <strong>Doppio Scudo Protettivo:</strong> Certifica la placcatura in Oro 18K da 1.0 Micron (20 volte più spessa dello standard) o la finitura a specchio in Rodio Puro, sigillate dall'invisibile nano-trattamento molecolare protettivo E-Coating anti-ossidazione.
              </p>
              <p>
                <strong>Selezione Pietre & Perle:</strong> Attesta il taglio brillante di massima rifrazione o la provenienza naturale delle perle d'acqua dolce selezionate a mano.
              </p>
            </div>
          </div>

          {/* 3 PILASTRI CERTIFICATO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F0E6E1]">
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <ShieldCheck className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Metallo Nobile</span>
              <span className="font-serif text-base text-gray-900 font-medium">Argento 925 Nichel-Free</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <Sparkles className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Finitura Luxury</span>
              <span className="font-serif text-base text-gray-900 font-medium">Oro 18K & Rodio Puro</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 text-center">
              <Award className="text-[#C0A09A] mx-auto mb-2" size={20} />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">Copertura Legale</span>
              <span className="font-serif text-base text-gray-900 font-medium">Garanzia di Conformità</span>
            </div>
          </div>
        </div>

        {/* SEZIONE 2: COSA COPRE E COSA NON COPRE (TABELLA COMPARATIVA) */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl tracking-widest uppercase text-gray-900 mb-3">
              Termini & Condizioni della Garanzia
            </h2>
            <p className="text-xs text-gray-500 font-light tracking-wide uppercase">
              Garanzia Legale ai sensi degli Artt. 128 e ss. del Codice del Consumo (D.Lgs. 206/2005)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BOX COSA COPRE */}
            <div className="bg-white border border-emerald-100 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-800 font-serif text-lg uppercase tracking-wider mb-4 border-b border-emerald-100 pb-3">
                <CheckCircle2 size={22} className="text-emerald-700 shrink-0" />
                <h3>Cosa Copre la Garanzia</h3>
              </div>
              <p className="text-xs text-gray-600 font-light leading-relaxed mb-4">
                La garanzia copre esclusivamente i <strong>difetti originari di conformità e fabbricazione</strong> già presenti al momento della consegna:
              </p>
              <ul className="space-y-3 text-xs text-gray-700 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>Difetti delle chiusure:</strong> cedimento spontaneo di moschettoni, perni o molle dovuto a vizio originario del meccanismo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>Incastonature strutturali:</strong> difetto originario nelle griffe o nella sede della pietra che ne provochi il distacco non accidentale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span><strong>Difetti strutturali del metallo:</strong> porosità anomala o rottura spontanea di maglie e saldature non soggette a trazione.</span>
                </li>
              </ul>
            </div>

            {/* BOX COSA NON COPRE */}
            <div className="bg-white border border-rose-100 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 text-rose-800 font-serif text-lg uppercase tracking-wider mb-4 border-b border-rose-100 pb-3">
                <XCircle size={22} className="text-rose-700 shrink-0" />
                <h3>Cosa NON è Coperto</h3>
              </div>
              <p className="text-xs text-gray-600 font-light leading-relaxed mb-4">
                La garanzia <strong>non si applica</strong> a danni derivanti dall'uso quotidiano, incuria o eventi accidentali:
              </p>
              <ul className="space-y-3 text-xs text-gray-700 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">•</span>
                  <span><strong>Normale usura e graffi:</strong> opacizzazione, micro-graffi superficiali o fisiologico invecchiamento del metallo nobile dovuto all'uso.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">•</span>
                  <span><strong>Agenti chimici e cosmetici:</strong> alterazioni provocate da profumi, lacche, creme, cloro, candeggina, detersivi o acque termali solfuree.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">•</span>
                  <span><strong>Danni accidentali o trazione:</strong> rotture da impatto, schiacciamento, caduta o catene spezzate a causa di strappi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">•</span>
                  <span><strong>Manomissioni esterne:</strong> riparazioni o modifiche eseguite da orafi o laboratori terzi non autorizzati da Isabel Pepe.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* SEZIONE 3: COME RICHIEDERE ASSISTENZA */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-2xl mb-16 shadow-sm">
          <div className="flex items-center gap-3 text-[#C0A09A] mb-3">
            <HelpCircle size={24} />
            <h3 className="font-serif text-2xl text-gray-900 tracking-wider">
              Come Richiedere Assistenza in Garanzia
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-light leading-relaxed mb-6">
            Qualora riscontrassi un'anomalia coperta da garanzia, il nostro servizio clienti è pronto ad assisterti con la massima rapidità:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700 font-light">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <span className="w-6 h-6 rounded-full bg-[#C0A09A] text-white text-[11px] font-bold flex items-center justify-center mb-3">1</span>
              <strong className="block text-gray-900 mb-1">Invia la Segnalazione</strong>
              <p className="text-gray-500">Scrivi a <a href="mailto:assistenza@isabelpepe.com" className="text-[#C0A09A] underline">assistenza@isabelpepe.com</a> allegando numero d'ordine e foto nitide del gioiello e del dettaglio.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <span className="w-6 h-6 rounded-full bg-[#C0A09A] text-white text-[11px] font-bold flex items-center justify-center mb-3">2</span>
              <strong className="block text-gray-900 mb-1">Perizia Tecnica</strong>
              <p className="text-gray-500">I nostri maestri orafi valuteranno le immagini per confermare la natura del difetto e ti forniranno le istruzioni di spedizione.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <span className="w-6 h-6 rounded-full bg-[#C0A09A] text-white text-[11px] font-bold flex items-center justify-center mb-3">3</span>
              <strong className="block text-gray-900 mb-1">Riparazione o Sostituzione</strong>
              <p className="text-gray-500">Se il difetto è confermato, provvederemo alla riparazione o alla sostituzione gratuita del gioiello con re-invio express.</p>
            </div>
          </div>
        </div>

        {/* GUIDA CURA PRODOTTI BANNER */}
        <div className="border border-[#E8D8D5] bg-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#C0A09A] text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={16} /> Preserva la Lucentezza
            </div>
            <h4 className="font-serif text-xl text-gray-900">Consulta la Nostra Guida alla Cura dei Gioielli</h4>
            <p className="text-xs text-gray-500 font-light">Semplici gesti quotidiani per mantenere i tuoi gioielli Isabel Pepe perfetti negli anni.</p>
          </div>
          <Link
            href="/cura-gioielli"
            className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white text-xs uppercase tracking-[0.2em] font-semibold px-6 py-3 rounded-md transition-colors flex items-center gap-2 shrink-0"
          >
            Leggi la Guida <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
