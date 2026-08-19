'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Le due password non coincidono.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Impossibile reimpostare la password. Il link potrebbe essere scaduto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF8F6] py-16 px-4 sm:px-6">
      <div className="bg-white max-w-md w-full p-8 sm:p-12 shadow-xl border border-[#EADFD9] rounded-sm">
        
        <div className="text-center mb-8">
          <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#8A5E58] font-semibold block mb-2">
            Sicurezza Account
          </span>
          <h1 className="font-serif text-2xl uppercase tracking-widest text-[#1A1A1A]">
            Nuova Password
          </h1>
          <p className="font-sans text-xs text-gray-500 mt-2">
            Inserisci la nuova password per il tuo account Isabel Pepe.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-gray-900 font-medium">Password Aggiornata!</h3>
              <p className="text-xs text-gray-500">
                La tua password è stata modificata con successo. Ora puoi accedere.
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-3.5 rounded-sm text-xs uppercase tracking-widest font-medium transition-colors"
            >
              <span>Vai al Login</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 text-xs rounded-sm border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                Nuova Password (min. 6 caratteri)
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">
                Conferma Nuova Password
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 bg-white outline-none focus:border-[#C0A09A] transition-colors font-sans text-sm rounded-sm text-gray-900"
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1A1A1A] hover:bg-[#8A5E58] text-white py-4 mt-2 font-sans text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 font-medium rounded-sm shadow-sm cursor-pointer"
            >
              {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
