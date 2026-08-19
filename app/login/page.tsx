'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Mail, Lock, User as UserIcon, Sparkles, KeyRound } from 'lucide-react';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com', 'mariopepe9@hotmail.it'];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const supabase = createClient();
  const [authMethod, setAuthMethod] = useState<'magic' | 'password' | 'register'>('magic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.isabelpepe.com';
    const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');

    try {
      if (authMethod === 'magic') {
        // Accesso Istantaneo con Magic Link (1-Clic)
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });
        if (error) throw error;
        setMagicLinkSent(true);
      } else if (authMethod === 'password') {
        // Accesso Tradizionale con Password
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        router.push(destination);
        router.refresh();
      } else if (authMethod === 'register') {
        // Registrazione Nuovo Profilo
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName,
            },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });
        if (error) throw error;
        router.push(destination);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 md:p-14 flex flex-col justify-center">
      
      {/* SEZIONE 1: CONFERMA INVIO MAGIC LINK */}
      {magicLinkSent ? (
        <div className="space-y-6 animate-in fade-in duration-300 text-center">
          <div className="w-16 h-16 bg-[#FAF3F0] border border-[#C0A09A] text-[#8A5E58] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Mail size={30} strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-semibold block">
              Magic Link Inviato
            </span>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-[#1A1A1A]">
              Controlla la tua Email
            </h2>
            <p className="font-sans text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
              Abbiamo inviato un link di accesso sicuro a <strong>{email}</strong>. Clicca sul link nell'email per entrare direttamente nel tuo account senza password!
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => { setMagicLinkSent(false); setAuthMethod('password'); }}
              className="font-sans text-xs uppercase tracking-widest text-[#8A5E58] hover:underline font-medium"
            >
              Preferisci inserire la password? Clicca qui
            </button>
            <button
              onClick={() => { setMagicLinkSent(false); }}
              className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-700 mt-1"
            >
              Reinvia link o cambia email
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          
          {/* TAB METODI DI ACCESSO */}
          <div className="flex gap-6 mb-8 border-b border-gray-100 pb-3 text-xs uppercase font-sans tracking-[0.2em]">
            <button 
              className={`pb-3 -mb-[13px] transition-colors cursor-pointer flex items-center gap-1.5 ${authMethod === 'magic' ? 'text-[#8A5E58] font-bold border-b-2 border-[#C0A09A]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setAuthMethod('magic'); setError(null); }}
            >
              <Sparkles size={13} className="text-[#C0A09A]" />
              <span>Magic Link (1-Clic)</span>
            </button>
            <button 
              className={`pb-3 -mb-[13px] transition-colors cursor-pointer flex items-center gap-1.5 ${authMethod === 'password' ? 'text-[#8A5E58] font-bold border-b-2 border-[#C0A09A]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setAuthMethod('password'); setError(null); }}
            >
              <KeyRound size={13} />
              <span>Password</span>
            </button>
            <button 
              className={`pb-3 -mb-[13px] transition-colors cursor-pointer ${authMethod === 'register' ? 'text-[#8A5E58] font-bold border-b-2 border-[#C0A09A]' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setAuthMethod('register'); setError(null); }}
            >
              <span>Registrati</span>
            </button>
          </div>

          <div className="mb-6">
            <h1 className="font-serif text-2xl tracking-widest uppercase text-[#1A1A1A] mb-1.5">
              {authMethod === 'magic' ? 'Accesso Istantaneo (1-Clic)' : authMethod === 'password' ? 'Accedi con Password' : 'Crea il tuo Profilo'}
            </h1>
            <p className="font-sans text-xs text-gray-500">
              {authMethod === 'magic' 
                ? 'Nessuna password da ricordare: ricevi un link sicuro sulla tua email ed entri all\'istante.'
                : authMethod === 'password' 
                ? 'Inserisci la tua email e la password per accedere al tuo account.'
                : 'Crea il tuo profilo per salvare preferiti, tracciare spedizioni e gestire i tuoi ordini.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMethod === 'register' && (
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

            {(authMethod === 'password' || authMethod === 'register') && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500">Password</label>
                  {authMethod === 'password' && (
                    <button 
                      type="button"
                      onClick={() => setAuthMethod('magic')}
                      className="text-[10px] uppercase tracking-wider text-[#8A5E58] hover:underline"
                    >
                      Password dimenticata? Usa Magic Link
                    </button>
                  )}
                </div>
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
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 mt-2 font-sans text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 font-medium rounded-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                'Elaborazione...'
              ) : authMethod === 'magic' ? (
                <>
                  <Sparkles size={14} />
                  <span>Invia Magic Link di Accesso</span>
                </>
              ) : authMethod === 'password' ? (
                'Accedi al Profilo'
              ) : (
                'Crea il Mio Account'
              )}
            </button>
          </form>

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
