'use client';

import React, { useState, useRef, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Sparkles, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com', 'mariopepe9@hotmail.it'];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  // OTP code state (6 separate digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Invio Magic Link & OTP
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.isabelpepe.com';
    const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(destination)}`,
        },
      });

      if (error) throw error;
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Impossibile inviare il link di accesso. Riprova tra qualche istante.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Gestione digitazione OTP (auto-focus next input)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Gestione Incolla codice completo
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Salta al prossimo input se inserita una cifra
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // 3. Verifica Codice OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Inserisci il codice completo a 6 cifre ricevuto via email.');
      return;
    }

    setLoading(true);
    setError(null);

    const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'email',
      });

      if (error) throw error;

      if (data?.session) {
        router.push(destination);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Codice non valido o scaduto. Riprova o richiedi un nuovo link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 md:p-14 flex flex-col justify-center">
      
      {step === 'input' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-bold">
                Atelier Privato
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0A09A]"></span>
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                100% Passwordless
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-widest uppercase text-[#1A1A1A]">
              Accedi al tuo Account
            </h1>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-sm">
              Nessuna password da ricordare. Inserisci la tua email per accedere all'istante con un clic o tramite codice di sicurezza.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSendLink} className="space-y-5">
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 font-medium">
                Indirizzo Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  placeholder="iltuoindirizzo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#EADFD9] px-4 py-3.5 bg-white outline-none focus:border-[#C0A09A] focus:ring-1 focus:ring-[#C0A09A] transition-all font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400 shadow-xs"
                />
                <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 font-sans text-xs uppercase tracking-[0.25em] transition-all duration-200 disabled:opacity-50 font-medium rounded-sm shadow-md cursor-pointer flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-[#C0A09A]" />
                  <span>Invio in corso...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#C0A09A] group-hover:scale-110 transition-transform" />
                  <span>Ricevi Link di Accesso</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Vantaggi Luxury */}
          <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-3 text-[11px] text-gray-500 font-sans">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#C0A09A] shrink-0" />
              <span>Sicurezza Crittografica</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#C0A09A] shrink-0" />
              <span>Ordini & Spedizioni Live</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-[#FAF4F2] border border-[#C0A09A] rounded-full flex items-center justify-center mx-auto text-[#8A5E58] shadow-xs animate-bounce">
              <Mail size={26} strokeWidth={1.5} />
            </div>
            
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-bold block">
              Link & Codice Inviati
            </span>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-[#1A1A1A]">
              Controlla la tua Email
            </h2>
            <p className="font-sans text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
              Abbiamo inviato un'email a <strong>{email}</strong>. Clicca sul pulsante nell'email oppure inserisci il codice a 6 cifre qui sotto:
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* Form OTP a 6 Cifre */}
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputsRef.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-10 h-13 sm:w-12 sm:h-14 text-center font-serif text-xl sm:text-2xl font-bold bg-white border border-[#EADFD9] focus:border-[#8A5E58] focus:ring-2 focus:ring-[#FAF3F0] outline-none rounded-sm transition-all text-gray-900 shadow-xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-3.5 font-sans text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-40 font-medium rounded-sm shadow-sm cursor-pointer"
            >
              {loading ? 'Verifica in corso...' : 'Conferma ed Entra'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100 space-y-2">
            <button
              onClick={() => { setStep('input'); setOtp(['', '', '', '', '', '']); setError(null); }}
              className="font-sans text-[11px] uppercase tracking-wider text-gray-400 hover:text-[#8A5E58] transition-colors underline cursor-pointer"
            >
              ← Modifica email o richiedi nuovo link
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF8F6] py-14 px-4 sm:px-6">
      <div className="bg-white max-w-4xl w-full grid md:grid-cols-2 shadow-xl border border-[#EADFD9] rounded-sm overflow-hidden">
        
        {/* Banner Editoriale Hero Sinistro */}
        <div className="hidden md:block relative h-full bg-[#1A1A1A] min-h-[520px]">
          <img 
            src="/Brand/login_hero.jpg" 
            alt="Isabel Pepe Atelier" 
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <div className="absolute top-8 left-8">
            <span className="font-serif text-lg tracking-[0.25em] text-[#C0A09A] uppercase font-bold">
              ISABEL PEPE
            </span>
          </div>

          <div className="absolute bottom-10 left-8 right-8 text-white space-y-3">
            <div className="w-8 h-[2px] bg-[#C0A09A]"></div>
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block">
              Esperienza Su Misura
            </span>
            <h2 className="font-serif text-2xl tracking-widest uppercase leading-tight text-white">
              L'Eccellenza della Gioielleria Senza Confini
            </h2>
            <p className="font-sans text-[11px] leading-relaxed opacity-85 max-w-xs text-gray-300">
              Accedi alla tua area privata per consultare lo stato delle creazioni in lavorazione, tracciare le consegne e scoprire le collezioni private.
            </p>
          </div>
        </div>

        {/* Maschera di Login Passwordless con Suspense */}
        <Suspense fallback={<div className="p-12 text-center text-gray-400 font-sans text-xs">Caricamento...</div>}>
          <LoginFormContent />
        </Suspense>

      </div>
    </div>
  );
}
