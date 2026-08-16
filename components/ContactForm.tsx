'use client';

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function ContactForm() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
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
              className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white font-sans text-xs uppercase tracking-[0.25em] px-10 py-4 font-medium transition-all duration-300 inline-flex items-center gap-3 shadow-md cursor-pointer"
            >
              <Send size={14} />
              Invia Messaggio
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
