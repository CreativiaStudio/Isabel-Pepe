'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Clock, ShieldCheck, ChevronDown, Send, Sparkles } from 'lucide-react';

export default function AssistenzaClientiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: "Come posso tracciare il mio ordine?",
      answer: "Non appena il tuo ordine viene affidato al corriere espresso (Packlink PRO / Poste Italiane), riceverai una mail di conferma contenente il codice di tracciamento unico (Tracking Code). Potrai monitorare lo stato della consegna in tempo reale."
    },
    {
      question: "Quali sono i tempi e i costi di spedizione?",
      answer: "Spediamo in 24/48 ore lavorative in tutta Italia. La spedizione è gratuita per tutti gli ordini superiori a 150€. Per ordini inferiori, la tariffa di spedizione express è di 6,90€."
    },
    {
      question: "Come posso effettuare un reso?",
      answer: "Offriamo la garanzia 'Soddisfatti o Rimborsati' entro 30 giorni dalla ricezione del pacco. Per avviare la procedura di reso ti basterà contattare la nostra boutique via WhatsApp o inviare un'email a sviluppo@creativiastudio.com indicando il tuo numero d'ordine."
    },
    {
      question: "La confezione regalo e la garanzia sono incluse?",
      answer: "Assolutamente sì. Ogni creazione Isabel Pepe viene custodita nel nostro cofanetto rigido di lusso, accompagnata dal certificato di garanzia e dal panno speciale in microfibra per la cura quotidiana dei preziosi."
    },
    {
      question: "I gioielli sono resistenti all'acqua e anallergici?",
      answer: "Sì, i nostri gioielli in Argento 925 con placcatura Oro 18K (20 volte superiore alla media di mercato) sono dotati di un trattamento protettivo anti-ossidazione e sono completamente privi di Nichel, cadmio o piombo."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 px-6 text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs text-[#C0A09A] uppercase tracking-[0.3em] font-semibold block mb-3">
            Boutique Concierge & Customer Care
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-widest uppercase mb-6 text-gray-900">
            Assistenza Clienti
          </h1>
          <p className="font-sans text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Siamo a tua completa disposizione per consigli di stile, personalizzazioni, informazioni sugli ordini e supporto post-vendita.
          </p>
        </div>

        {/* BOX WHATSAPP IN EVIDENZA */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-10 rounded-2xl mb-16 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center flex-shrink-0 shadow-inner">
              <MessageCircle size={36} strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-1">
                Risposta Istantanea
              </span>
              <h2 className="font-serif text-2xl text-gray-900 tracking-wider">
                Chatta Diretto con la Boutique
              </h2>
              <p className="font-sans text-xs text-gray-600 font-light mt-1">
                Contatta il nostro personal shopper su WhatsApp per assistenza immediata.
              </p>
            </div>
          </div>
          
          <a 
            href="https://wa.me/393280000000?text=Ciao%20Isabel%20Pepe!%20Vorrei%20informazioni%20su%20un%20gioiello." 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-sans text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <MessageCircle size={18} />
            Apri Chat WhatsApp
          </a>
        </div>

        {/* CANALI DI CONTATTO & INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Mail size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Email Direct</h3>
            <p className="text-xs text-gray-500 font-light mb-4">Scrivici in qualsiasi momento. Ti risponderemo entro 24 ore.</p>
            <a href="mailto:sviluppo@creativiastudio.com" className="text-xs font-mono font-medium text-[#C0A09A] underline">
              sviluppo@creativiastudio.com
            </a>
          </div>

          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <Clock size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Orari Atelier</h3>
            <p className="text-xs text-gray-500 font-light mb-2">Lunedì – Venerdì: 09:00 – 19:00</p>
            <p className="text-xs text-gray-500 font-light">Sabato: 10:00 – 18:00</p>
          </div>

          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Garanzia 24 Mesi</h3>
            <p className="text-xs text-gray-500 font-light mb-4">Ogni pezzo è coperto da garanzia ufficiale e assistenza tecnica.</p>
            <Link href="/cura-gioielli" className="text-xs uppercase tracking-widest text-[#C0A09A] font-medium hover:underline">
              Cura del Gioiello →
            </Link>
          </div>

        </div>

        {/* DOMANDE FREQUENTI (FAQ) */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl tracking-widest uppercase text-gray-900 mb-3">
              Domande Frequenti
            </h2>
            <p className="text-xs text-gray-500 font-light tracking-wide uppercase">
              Tutto quello che c'è da sapere sulle nostre collezioni e sui servizi
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between bg-white hover:bg-[#FAF8F5] transition-colors"
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
        </div>

        {/* FORM DI CONTATTO */}
        <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-12 rounded-2xl max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-1">
              Messaggio Diretto
            </span>
            <h2 className="font-serif text-2xl text-gray-900 tracking-wider uppercase">
              Invia una Richiesta
            </h2>
          </div>

          {formSubmitted ? (
            <div className="bg-white border border-[#C0A09A]/40 p-8 text-center rounded-lg space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="font-serif text-xl text-gray-900 uppercase">Messaggio Inviato con Successo</h3>
              <p className="text-xs text-gray-600 font-light">
                Grazie per averci contattato. Il nostro Concierge ti risponderà nel più breve tempo possibile.
              </p>
              <button 
                onClick={() => setFormSubmitted(false)} 
                className="mt-4 text-xs text-[#C0A09A] uppercase tracking-widest font-semibold underline"
              >
                Invia un altro messaggio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                    Nome e Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Il tuo nome"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-xs outline-none focus:border-[#C0A09A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                    Indirizzo Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="la-tua-email@esempio.it"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-xs outline-none focus:border-[#C0A09A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Oggetto della Richiesta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Es. Informazioni su un ordine / Consiglio taglia"
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-xs outline-none focus:border-[#C0A09A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Messaggio *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Scrivi qui il tuo messaggio..."
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-xs outline-none focus:border-[#C0A09A] transition-colors resize-none"
                ></textarea>
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white font-sans text-xs uppercase tracking-[0.25em] px-10 py-4 font-medium transition-all duration-300 inline-flex items-center gap-3 shadow-md"
                >
                  <Send size={14} />
                  Invia Messaggio
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Ritorna alla Home */}
        <div className="mt-16 text-center">
          <Link href="/" className="inline-block text-xs uppercase tracking-[0.25em] text-gray-400 hover:text-gray-900 transition-colors">
            ← Torna alla Home Page
          </Link>
        </div>

      </div>
    </div>
  );
}
