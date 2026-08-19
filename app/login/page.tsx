'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Sparkles, KeyRound, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com', 'mariopepe9@hotmail.it'];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  // 1. Accesso con Password (Ultra-Veloce & Stabile)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.session) {
        router.push(destination);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Credenziali non corrette. Verifica email e password.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Invio Magic Link 1-Clic
  const handleMagicLink = async (e: React.FormEvent) => {
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
      setMagicSent(true);
    } catch (err: any) {
      setError(err.message || 'Impossibile inviare il link di accesso. Riprova tra qualche istante.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 md:p-14 flex flex-col justify-center">
      
      {/* SELETTORE SCHEDE DI ACCESSO */}
      <div className="flex border-b border-[#EADFD9] mb-8">
        <button
          onClick={() => { setActiveTab('password'); setError(null); setMagicSent(false); }}
          className={`pb-3.5 font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 mr-8 ${
            activeTab === 'password'
              ? 'text-[#1A1A1A] border-[#1A1A1A]'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <KeyRound size={14} className={activeTab === 'password' ? 'text-[#8A5E58]' : 'text-gray-400'} />
          <span>Accedi con Password</span>
        </button>

        <button
          onClick={() => { setActiveTab('magic'); setError(null); }}
          className={`pb-3.5 font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
            activeTab === 'magic'
              ? 'text-[#1A1A1A] border-[#1A1A1A]'
              : 'text-gray-400 border-transparent hover:text-gray-700'
          }`}
        >
          <Sparkles size={14} className={activeTab === 'magic' ? 'text-[#C0A09A]' : 'text-gray-400'} />
          <span>Link Magico (1-Clic)</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200 mb-6">
          {error}
        </div>
      )}

      {/* SCHEDA 1: ACCESSO CON PASSWORD */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-medium">
              Indirizzo Email
            </label>
            <div className="relative">
              <input 
                type="email" 
                required 
                placeholder="iltuoindirizzo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#EADFD9] px-4 py-3.5 bg-white outline-none focus:border-[#C0A09A] transition-all font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
              />
              <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#EADFD9] px-4 py-3.5 bg-white outline-none focus:border-[#C0A09A] transition-all font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
              />
              <Lock size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 mt-3 font-sans text-xs uppercase tracking-[0.25em] transition-all duration-200 disabled:opacity-50 font-medium rounded-sm shadow-md cursor-pointer flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span>Autenticazione in corso...</span>
            ) : (
              <>
                <span>Accedi all'Account</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {/* SCHEDA 2: LINK MAGICO */}
      {activeTab === 'magic' && (
        <div className="animate-in fade-in duration-200">
          {magicSent ? (
            <div className="space-y-4 text-center p-6 bg-[#FAF7F5] border border-[#EADFD9] rounded-sm">
              <div className="w-12 h-12 bg-white border border-[#C0A09A] text-[#8A5E58] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-serif text-lg uppercase tracking-wider text-[#1A1A1A]">
                Link Inviato con Successo!
              </h3>
              <p className="font-sans text-xs text-gray-600 leading-relaxed">
                Abbiamo inviato un link di accesso a <strong>{email}</strong>.<br />
                Apri la tua email e clicca sul pulsante per entrare all'istante senza password.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="font-sans text-[11px] uppercase tracking-wider text-[#8A5E58] underline cursor-pointer mt-2"
              >
                Invia di nuovo o cambia email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="font-sans text-xs text-gray-500 mb-2 leading-relaxed">
                Inserisci la tua email. Ti invieremo un link protetto per accedere con 1 solo clic senza digitare alcuna password.
              </p>

              <div>
                <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5 font-medium">
                  Indirizzo Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    placeholder="iltuoindirizzo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-[#EADFD9] px-4 py-3.5 bg-white outline-none focus:border-[#C0A09A] transition-all font-sans text-sm rounded-sm text-gray-900 placeholder:text-gray-400"
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
                  <span>Invio in corso...</span>
                ) : (
                  <>
                    <Sparkles size={14} className="text-[#C0A09A]" />
                    <span>Invia Link Magico</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* FOOTER SICUREZZA */}
      <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-sans">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#C0A09A]" />
          <span>Atelier Isabel Pepe • Connessione Protetta</span>
        </div>
      </div>

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
              Atelier Privato
            </span>
            <h2 className="font-serif text-2xl tracking-widest uppercase leading-tight text-white">
              L'Eccellenza della Gioielleria Senza Confini
            </h2>
            <p className="font-sans text-[11px] leading-relaxed opacity-85 max-w-xs text-gray-300">
              Accedi alla tua area privata per consultare lo stato delle creazioni in lavorazione, tracciare le consegne e gestire l'atelier.
            </p>
          </div>
        </div>

        {/* Maschera di Login con Suspense */}
        <Suspense fallback={<div className="p-12 text-center text-gray-400 font-sans text-xs">Caricamento...</div>}>
          <LoginFormContent />
        </Suspense>

      </div>
    </div>
  );
}
