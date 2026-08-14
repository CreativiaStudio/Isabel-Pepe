'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
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
          email,
          password,
        });
        if (error) throw error;
        router.push('/account');
        router.refresh(); // Refresh per aggiornare l'header
      } else {
        // Registrazione
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
            },
          },
        });
        if (error) throw error;
        // In modalita dev senza email conf, il login e' automatico
        router.push('/account');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAFAFA] py-20 px-6">
      <div className="bg-white max-w-4xl w-full grid md:grid-cols-2 shadow-2xl overflow-hidden">
        
        {/* Immagine Decorativa */}
        <div className="hidden md:block relative h-full bg-gray-100">
          <img 
            src="/Products/Modella Premium.jpg" 
            alt="Isabel Pepe Luxury" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-12 left-12 text-white">
            <h2 className="font-serif text-3xl tracking-widest uppercase mb-4">Isabel Pepe</h2>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-80 max-w-xs">
              Accedi alla tua area riservata per gestire i tuoi ordini ed esplorare le nuove collezioni.
            </p>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-12 md:p-16 flex flex-col justify-center">
          <div className="flex gap-8 mb-12 border-b border-gray-100 pb-4">
            <button 
              className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-colors ${isLogin ? 'text-[#C0A09A] font-bold' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setIsLogin(true); setError(null); }}
            >
              Accedi
            </button>
            <button 
              className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-colors ${!isLogin ? 'text-[#C0A09A] font-bold' : 'text-gray-400 hover:text-gray-900'}`}
              onClick={() => { setIsLogin(false); setError(null); }}
            >
              Crea Account
            </button>
          </div>

          <h3 className="font-serif text-2xl tracking-widest uppercase mb-8 text-[#1A1A1A]">
            {isLogin ? 'Bentornato' : 'Nuovo Cliente'}
          </h3>

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
              className="w-full bg-[#1A1A1A] hover:bg-[#C0A09A] text-white py-4 mt-8 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
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
      </div>
    </div>
  );
}
