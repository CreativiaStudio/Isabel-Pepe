'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Sparkles } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/account';
  const supabase = createClient();
  const [statusText, setStatusText] = useState('Autenticazione in corso nel tuo Atelier...');

  useEffect(() => {
    // 1. Ascolta i cambi di stato auth (gestisce automaticamente sia l'hash che i cookie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setStatusText('Accesso confermato! Reindirizzamento in corso...');
        router.push(next);
        router.refresh();
      }
    });

    // 2. Controllo immediato se la sessione è già presente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push(next);
        router.refresh();
      }
    });

    // 3. Fallback se dopo 4 secondi non è loggato
    const timeout = setTimeout(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          router.push(next);
          router.refresh();
        } else {
          // Se non ha sessione, rimanda al login con avviso
          router.push('/login');
        }
      });
    }, 3500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, next, supabase]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF8F6] px-4 text-center">
      <div className="bg-white border border-[#EADFD9] p-10 sm:p-14 rounded-sm shadow-sm max-w-md w-full space-y-5">
        <div className="w-14 h-14 bg-[#FAF4F2] border border-[#C0A09A] rounded-full flex items-center justify-center mx-auto text-[#8A5E58] animate-pulse">
          <Sparkles size={24} />
        </div>
        
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A5E58] font-semibold block mb-1">
            Isabel Pepe Atelier
          </span>
          <h2 className="font-serif text-xl uppercase tracking-widest text-[#1A1A1A]">
            Accesso Istantaneo
          </h2>
        </div>

        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          {statusText}
        </p>

        <div className="w-24 h-[2px] bg-[#EADFD9] mx-auto overflow-hidden rounded-full">
          <div className="w-full h-full bg-[#C0A09A] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F6]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0A09A]"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
