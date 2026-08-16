'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: "Come posso tracciare il mio ordine?",
    answer: "Non appena il tuo ordine viene affidato al corriere espresso (Packlink PRO / Poste Italiane), riceverai una mail di conferma contenente il codice di tracciamento unico (Tracking Code). Potrai monitorare lo stato della consegna in tempo reale."
  },
  {
    question: "Quali sono i tempi e i costi di spedizione?",
    answer: "Spediamo in 24/48 ore lavorative in tutta Italia con corriere espresso (Packlink PRO / Poste Italiane). La spedizione express è SEMPRE GRATUITA su tutti gli ordini, senza alcun minimo di spesa."
  },
  {
    question: "Come posso effettuare un reso?",
    answer: "In conformità al Codice del Consumo, puoi restituire il gioiello entro 14 giorni di calendario dalla consegna. Il gioiello deve essere integro, mai indossato e nella sua confezione originale completa di cofanetto signature e certificato. Per avviare la procedura ti basterà inviare un'email a resi@isabelpepe.com indicando il tuo numero d'ordine."
  },
  {
    question: "La confezione regalo e la garanzia sono incluse?",
    answer: "Assolutamente sì. Ogni creazione Isabel Pepe include il Cofanetto Regalo Signature: astuccio rigido di lusso, panno speciale in microfibra per la pulizia quotidiana e certificato di garanzia ufficiale 24 mesi."
  },
  {
    question: "I gioielli sono resistenti all'acqua e anallergici?",
    answer: "Sì, ogni creazione Isabel Pepe è protetta dal nostro esclusivo Doppio Scudo Protettivo: placcatura ad alto spessore in Oro 18K (1.0 µm) o Rodio Puro (0.1 µm) sigillata con Nano-Protective E-Coating (1.0 µm) anti-ossidazione e waterproof. Tutti i gioielli sono 100% anallergici, nichel-free, piombo e cadmio free."
  }
];

export default function FaqSection({ faqs = defaultFaqs }: { faqs?: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <div 
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
        >
          <button
            onClick={() => toggleFaq(index)}
            className="w-full p-6 text-left flex items-center justify-between bg-white hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <span className="font-serif text-base text-gray-900 tracking-wide">
              {faq.question}
            </span>
            <ChevronDown 
              size={18} 
              className={`text-[#C0A09A] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} 
            />
          </button>
          {openFaq === index && (
            <div className="px-6 pb-6 pt-2 bg-[#FAF8F5] text-xs text-gray-600 leading-relaxed font-light border-t border-gray-100">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
