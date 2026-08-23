'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, Check, RotateCcw } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  privacy: boolean;
  website_hp: string;
}

const INITIAL_FORM_STATE: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  privacy: false,
  website_hp: '',
};

const SUBJECT_SUGGESTIONS = [
  'Consiglio Misura & Guida Taglie',
  'Informazioni su un Ordine',
  'Creazione Gioiello Su Misura',
  'Spedizione & Consegna',
  'Resi & Garanzia 24 Mesi',
];

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (errorMessage) setErrorMessage(null);

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectSelect = (suggestion: string) => {
    if (loading) return;
    if (errorMessage) setErrorMessage(null);
    setFormData((prev) => ({ ...prev, subject: suggestion }));
  };

  const handleCopyTicket = async () => {
    if (!ticketId) return;
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleResetForm = () => {
    setFormSubmitted(false);
    setTicketId(null);
    setErrorMessage(null);
    setFormData(INITIAL_FORM_STATE);
    setCopiedTicket(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validation
    if (!formData.privacy) {
      setErrorMessage(
        'È necessario accettare l\'Informativa sulla Privacy per poter inviare una richiesta.'
      );
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage('Si prega di compilare tutti i campi contrassegnati con l\'asterisco (*).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          privacy: formData.privacy,
          website_hp: formData.website_hp,
          metadata: {
            source: 'contact_page_form',
            submitted_from: typeof window !== 'undefined' ? window.location.pathname : '/assistenza-clienti',
          },
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            'Si è verificato un errore durante l\'invio del messaggio. Riprova tra qualche minuto.'
        );
      }

      setTicketId(result.ticket_id || null);
      setFormSubmitted(true);
      setFormData(INITIAL_FORM_STATE);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Impossibile inviare la richiesta. Si prega di verificare la connessione e riprovare.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-8 sm:p-12 rounded-3xl max-w-3xl mx-auto shadow-sm transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C0A09A] font-semibold block mb-1">
          Messaggio Diretto & Concierge
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wider uppercase">
          Invia una Richiesta
        </h2>
        <p className="text-xs text-gray-500 font-light mt-1.5 max-w-md mx-auto leading-relaxed">
          Compila il modulo per qualsiasi informazione, richiesta di personalizzazione o supporto.
        </p>
      </div>

      {formSubmitted ? (
        /* Luxury Success Confirmation Screen */
        <div className="bg-white border border-[#C0A09A]/40 p-8 sm:p-12 text-center rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#C0A09A]/30 text-[#C0A09A] flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A5E58] font-semibold block">
              Richiesta Ricevuta
            </span>
            <h3 className="font-serif text-2xl text-gray-900 uppercase tracking-wide">
              Messaggio Inviato con Successo
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-lg mx-auto">
            Grazie per aver contattato la Maison Isabel Pepe. La tua richiesta è stata registrata con successo
            ed è stata presa in carico dal nostro Concierge dedicato. Riceverai una risposta personalizzata
            all'indirizzo email indicato entro 24 ore lavorative.
          </p>

          {/* Reference Ticket ID Card */}
          {ticketId && (
            <div className="bg-[#FAF8F5] border border-[#F0E6E1] p-4 sm:p-5 rounded-xl max-w-md mx-auto text-left">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  Codice Riferimento Ticket
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8A5E58] bg-[#FAF8F5]">
                  <CheckCircle2 className="w-3 h-3 text-[#C0A09A]" />
                  Attivo
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-3 py-2 rounded-lg">
                <code className="text-xs font-mono text-[#1A1A1A] font-semibold select-all break-all">
                  {ticketId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="p-1.5 text-gray-500 hover:text-[#C0A09A] transition-colors rounded hover:bg-[#FAF8F5] shrink-0"
                  title="Copia codice ticket"
                  aria-label="Copia codice ticket"
                >
                  {copiedTicket ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-light mt-1.5">
                Conserva questo identificativo per qualsiasi comunicazione di follow-up con il nostro team.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#8A5E58] text-white font-sans text-xs uppercase tracking-[0.25em] px-8 py-3.5 font-medium transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Invia un altro messaggio
            </button>
          </div>
        </div>
      ) : (
        /* Contact Form */
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-[#FDF2F2] border border-[#F5C2C7] text-[#8A5E58] p-4 rounded-xl flex items-start gap-3 text-left transition-all"
            >
              <AlertCircle className="w-5 h-5 text-[#8A5E58] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed font-normal">
                <strong className="font-semibold block mb-0.5">Attenzione</strong>
                {errorMessage}
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-[#8A5E58] hover:text-gray-900 text-xs font-semibold p-1 leading-none"
                aria-label="Chiudi avviso"
              >
                ✕
              </button>
            </div>
          )}

          {/* Honeypot Spam Protection (Hidden for users, filled only by bots) */}
          <div
            className="absolute opacity-0 pointer-events-none -z-50 h-0 w-0 overflow-hidden"
            aria-hidden="true"
            tabIndex={-1}
          >
            <label htmlFor="website_hp">Non compilare questo campo</label>
            <input
              type="text"
              id="website_hp"
              name="website_hp"
              value={formData.website_hp}
              onChange={handleInputChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2"
              >
                Nome e Cognome *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                disabled={loading}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Es. Mario Rossi"
                className="w-full bg-white border border-gray-200 px-4 py-3.5 text-xs text-[#1A1A1A] outline-none focus:border-[#C0A09A] focus:ring-1 focus:ring-[#C0A09A]/20 transition-all rounded-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2"
              >
                Indirizzo Email *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="mario.rossi@esempio.it"
                className="w-full bg-white border border-gray-200 px-4 py-3.5 text-xs text-[#1A1A1A] outline-none focus:border-[#C0A09A] focus:ring-1 focus:ring-[#C0A09A]/20 transition-all rounded-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Subject Field & Quick Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="contact-subject"
                className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold"
              >
                Oggetto della Richiesta *
              </label>
              <span className="text-[10px] text-gray-400 font-light hidden sm:inline">
                Seleziona un tema o digita liberamente
              </span>
            </div>

            <input
              id="contact-subject"
              name="subject"
              type="text"
              required
              disabled={loading}
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Es. Informazioni su un ordine / Consiglio taglia anello"
              className="w-full bg-white border border-gray-200 px-4 py-3.5 text-xs text-[#1A1A1A] outline-none focus:border-[#C0A09A] focus:ring-1 focus:ring-[#C0A09A]/20 transition-all rounded-sm disabled:bg-gray-50 disabled:cursor-not-allowed mb-2.5"
            />

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mr-1">
                Suggeriti:
              </span>
              {SUBJECT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubjectSelect(suggestion)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${
                    formData.subject === suggestion
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#C0A09A] hover:text-[#1A1A1A]'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="contact-message"
              className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2"
            >
              Messaggio *
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              disabled={loading}
              rows={5}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Descrivi in dettaglio la tua richiesta o le informazioni di cui hai bisogno..."
              className="w-full bg-white border border-gray-200 px-4 py-3.5 text-xs text-[#1A1A1A] outline-none focus:border-[#C0A09A] focus:ring-1 focus:ring-[#C0A09A]/20 transition-all rounded-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed leading-relaxed"
            ></textarea>
          </div>

          {/* GDPR Privacy Consent */}
          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="contact-gdpr-consent"
              name="privacy"
              required
              disabled={loading}
              checked={formData.privacy}
              onChange={handleInputChange}
              className="mt-0.5 w-4 h-4 rounded-none border border-gray-300 text-[#C0A09A] accent-[#C0A09A] cursor-pointer shrink-0 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="contact-gdpr-consent"
              className="text-xs text-gray-600 leading-relaxed font-light select-none cursor-pointer"
            >
              Dichiaro di aver letto l'
              <Link
                href="/privacy"
                target="_blank"
                className="text-gray-900 underline font-medium hover:text-[#C0A09A] transition-colors ml-1 mr-1"
              >
                Informativa sulla Privacy
              </Link>
              e acconsento al trattamento dei miei dati personali per l'evasione della presente richiesta.
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1A1A1A] hover:bg-[#8A5E58] disabled:bg-[#1A1A1A]/70 text-white font-sans text-xs uppercase tracking-[0.25em] px-10 py-4 font-medium transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:cursor-not-allowed cursor-pointer min-w-[220px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C0A09A]" />
                  <span>Invio in corso...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#C0A09A]" />
                  <span>Invia Messaggio</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

