'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Mail, Lock, User as UserIcon } from 'lucide-react';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com', 'mariopepe9@hotmail.it'];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');
        router.push(destination);
        router.refresh();
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName,
            },
          },
        });
        if (error) throw error;
        const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');
        router.push(destination);
        router.refresh();
      } else if (mode === 'forgot') {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.isabelpepe.com';
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?type=recovery&next=/reset-password`,
        });
        if (error) throw error;
        setForgotSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 md:p-14 flex flex-col justify-center">
      
      {mode === 'forgot' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <button 
            onClick={() => { setMode('login'); setError(null); setForgotSuccess(false); }}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 uppercase tracking-widest font-sans font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Torna al Login</span>
          </button>

          <div>
            <h1 className="font-serif text-2xl tracking-widest uppercase mb-2 text-[#1A1A1A]">
              Recupera Password
            </h1>
            <p className="font-sans text-xs text-gray-500 leading-relaxed">
              Inserisci l'indirizzo email associato al tuo account Isabel Pepe. Ti invieremo un link sicuro per reimpostare la tua password.
            </p>
          </div>

          {forgotSuccess ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                <span>Link inviato con successo!</span>
              </div>
              <p className="leading-relaxed">
                Controlla la tua casella di posta (incluso spam) e clicca sul link per scegliere una nuova password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">Email dell'Account</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    placeholder="iltuoindirizzo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 font-sans text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 font-medium rounded-sm shadow-sm"
              >
                {loading ? 'Invio in corso...' : 'Invia Link di Ripristino'}
              </button>
            </form>
          )}

        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="flex gap-8 mb-10 border-b border-gray-100 pb-4">
            <button 
              className={`font-sans text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer ${mode === 'login' ? 'text-[#8A5E58] font-bold border-b-2 border-[#C0A09A] pb-4 -mb-[18px]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setMode('login'); setError(null); }}
            >
              Accedi
            </button>
            <button 
              className={`font-sans text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer ${mode === 'register' ? 'text-[#8A5E58] font-bold border-b-2 border-[#C0A09A] pb-4 -mb-[18px]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setMode('register'); setError(null); }}
            >
              Crea Account
            </button>
          </div>

          <h1 className="font-serif text-2xl tracking-widest uppercase mb-6 text-[#1A1A1A]">
            {mode === 'login' ? 'Accedi al tuo Account' : 'Crea il tuo Profilo'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">Nome Completo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="Mario Rossi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <UserIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  placeholder="iltuoindirizzo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 mt-4 font-sans text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 font-medium rounded-sm shadow-sm cursor-pointer"
            >
              {loading ? 'Attendi...' : (mode === 'login' ? 'Accedi' : 'Crea Account')}
            </button>
          </form>
          
          {mode === 'login' && (
            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => { setMode('forgot'); setError(null); }}
                className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500 hover:text-[#8A5E58] transition-colors underline cursor-pointer"
              >
                Hai dimenticato la password?
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF8F6] py-14 px-4 sm:px-6">
      <div className="bg-white max-w-4xl w-full grid md:grid-cols-2 shadow-xl border border-[#EADFD9] rounded-sm overflow-hidden">
        
        {/* Immagine Decorativa Hero con percorso pulito */}
        <div className="hidden md:block relative h-full bg-[#1A1A1A] min-h-[520px]">
          <img 
            src="/Brand/login_hero.jpg" 
            alt="Isabel Pepe Atelier" 
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
          <div className="absolute bottom-10 left-8 right-8 text-white">
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-2">Atelier Privato</span>
            <h2 className="font-serif text-2xl tracking-widest uppercase mb-2 text-white">Isabel Pepe</h2>
            <p className="font-sans text-[11px] leading-relaxed opacity-90 max-w-xs text-gray-200">
              Accedi alla tua area riservata per gestire ordini, tracciamento spedizioni in tempo reale e collezioni esclusive.
            </p>
          </div>
        </div>

        {/* Form Area in Suspense per Next.js Static Optimization */}
        <Suspense fallback={<div className="p-12 text-center text-gray-400 font-sans text-xs">Caricamento...</div>}>
          <LoginFormContent />
        </Suspense>

      </div>
    </div>
  );
}
