import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageCircle, Mail, Clock, ShieldCheck } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import FaqSection from '@/components/FaqSection';

export const metadata: Metadata = {
  title: 'Assistenza Clienti & FAQ',
  description:
    'Hai bisogno di supporto? Contatta il Concierge Isabel Pepe via WhatsApp o email per informazioni su ordini, taglie, spedizioni e garanzia 24 mesi.',
  openGraph: {
    title: 'Assistenza Clienti & FAQ | Isabel Pepe',
    description:
      'Hai bisogno di supporto? Contatta il Concierge Isabel Pepe via WhatsApp o email per informazioni su ordini, taglie, spedizioni e garanzia 24 mesi.',
  },
};

export default function AssistenzaClientiPage() {
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
          
          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
                <Mail size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Email Ufficiali</h3>
              <p className="text-xs text-gray-500 font-light mb-3">Scrivici per qualsiasi richiesta. Ti risponderemo entro 24 ore.</p>
            </div>
            <div className="space-y-1.5 text-xs font-mono font-medium text-[#C0A09A]">
              <div>
                <span className="text-[10px] text-gray-400 font-sans uppercase block">Assistenza Ordini:</span>
                <a href="mailto:assistenza@isabelpepe.com" className="hover:underline">assistenza@isabelpepe.com</a>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-gray-400 font-sans uppercase block">Resi & Garanzie:</span>
                <a href="mailto:resi@isabelpepe.com" className="hover:underline">resi@isabelpepe.com</a>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-gray-400 font-sans uppercase block">Info & Comunicazione:</span>
                <a href="mailto:info@isabelpepe.com" className="hover:underline">info@isabelpepe.com</a>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
                <Clock size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Boutique Digitale</h3>
              <p className="text-xs text-gray-500 font-light mb-4">Siamo un brand 100% online, sempre a tua disposizione.</p>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#F0E6E1]/60 text-xs text-gray-600 font-light space-y-1">
              <p className="font-medium text-gray-900">Supporto Clienti</p>
              <p>Lunedì – Sabato: 09:00 – 19:00</p>
              <p className="text-[10px] text-gray-400">Ordini online attivi 24/7</p>
            </div>
          </div>

          <div className="border border-gray-100 p-8 text-center hover:border-[#C0A09A]/50 transition-colors duration-300 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#C0A09A]/10 text-[#C0A09A] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg tracking-wider text-gray-900 uppercase mb-2">Garanzia & Autenticità</h3>
              <p className="text-xs text-gray-500 font-light mb-4">Ogni creazione include il certificato di autenticità e la garanzia legale di conformità.</p>
            </div>
            <Link href="/garanzia" className="text-xs uppercase tracking-widest text-[#C0A09A] font-medium hover:underline block pt-2">
              Termini della Garanzia →
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

          <FaqSection />
        </div>

        {/* FORM DI CONTATTO CLIENT COMPONENT */}
        <ContactForm />

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
