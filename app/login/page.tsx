'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com'];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const supabase = createClient();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        
        const destination = redirectTarget || (ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? '/admin' : '/account');
        router.push(destination);
        router.refresh();
      } else {
        // Registrazione
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
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 md:p-16 flex flex-col justify-center">
      <div className="flex gap-8 mb-12 border-b border-gray-100 pb-4">
        <button 
          className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${isLogin ? 'text-[#C0A09A] font-bold' : 'text-gray-400 hover:text-gray-900'}`}
          onClick={() => { setIsLogin(true); setError(null); }}
        >
          Accedi
        </button>
        <button 
          className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer ${!isLogin ? 'text-[#C0A09A] font-bold' : 'text-gray-400 hover:text-gray-900'}`}
          onClick={() => { setIsLogin(false); setError(null); }}
        >
          Crea Account
        </button>
      </div>

      <h1 className="font-serif text-2xl tracking-widest uppercase mb-8 text-[#1A1A1A]">
        {isLogin ? 'Accedi al tuo Account' : 'Crea il tuo Account'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 text-[11px] uppercase tracking-widest mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Nome Completo</label>
            <input 
              type="text" 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border-b border-gray-200 py-3 bg-transparent outline-none focus:border-[#C0A09A] transition-colors font-serif"
            />
          </div>
        )}
        <div>
          <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-gray-200 py-3 bg-transparent outline-none focus:border-[#C0A09A] transition-colors font-serif"
          />
        </div>
        <div>
          <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Password</label>
          <input 
            type="password" 
            required 
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-gray-200 py-3 bg-transparent outline-none focus:border-[#C0A09A] transition-colors font-serif"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#1A1A1A] hover:bg-[#C0A09A] text-white py-4 mt-8 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Registrati')}
        </button>
      </form>
      
      {isLogin && (
        <div className="mt-6 text-center">
          <a href="#" className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#C0A09A] transition-colors">
            Hai dimenticato la password?
          </a>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAFAFA] py-20 px-6">
      <div className="bg-white max-w-4xl w-full grid md:grid-cols-2 shadow-2xl overflow-hidden">
        
        {/* Immagine Decorativa */}
        <div className="hidden md:block relative h-full bg-[#1A1A1A] min-h-[480px]">
          <img 
            src="/Products/A180-EARRING - Orecchini Vivienne/Modella Premium.jpg" 
            alt="Isabel Pepe Luxury" 
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C0A09A] font-semibold block mb-2">Atelier Privato</span>
            <h2 className="font-serif text-2xl tracking-widest uppercase mb-3 text-white">Isabel Pepe</h2>
            <p className="font-sans text-[11px] leading-relaxed opacity-90 max-w-xs text-gray-200">
              Accedi alla tua area riservata per gestire ordini, tracciamento spedizioni e collezioni esclusive.
            </p>
          </div>
        </div>

        {/* Form Area in Suspense per Next.js Static Optimization */}
        <Suspense fallback={<div className="p-12 text-center text-gray-400">Caricamento...</div>}>
          <LoginFormContent />
        </Suspense>

      </div>
    </div>
  );
}
