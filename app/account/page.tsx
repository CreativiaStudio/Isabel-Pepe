import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';

export const metadata: Metadata = {
  title: 'Il Mio Account',
  description:
    "Accedi all'area riservata Isabel Pepe per visualizzare lo stato dei tuoi ordini, i dettagli di spedizione e le impostazioni del tuo account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const supabase = await createClient();

  // 1. Verifica se l'utente è loggato
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Se non è loggato, caccialo alla pagina di login
    redirect('/login');
  }

  // 2. Recupera il suo profilo pubblico (indirizzo, nome, ecc.) creato dal Trigger
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
          <div>
            <h1 className="font-serif text-4xl tracking-widest uppercase text-[#1A1A1A] mb-2">Il Mio Account</h1>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Benvenuto/a, {profile?.first_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com'].includes(user.email || '') && (
              <a 
                href="/admin" 
                className="font-sans text-[11px] uppercase tracking-[0.2em] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-6 py-3 transition-colors"
              >
                Vai a Dashboard Admin
              </a>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Sezione Dati Personali */}
          <div className="md:col-span-1 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-xl tracking-widest uppercase mb-6 text-[#C0A09A]">Dati Personali</h2>
            <div className="space-y-4">
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-gray-400">Nome</p>
                <p className="font-serif text-lg">{profile?.first_name || '-'}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-gray-400">Cognome</p>
                <p className="font-serif text-lg">{profile?.last_name || '-'}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-gray-400">Email</p>
                <p className="font-serif text-base">{user.email}</p>
              </div>
              <button className="font-sans text-[10px] uppercase tracking-[0.2em] border-b border-[#1A1A1A] pb-1 mt-4 hover:text-[#C0A09A] hover:border-[#C0A09A] transition-colors">
                Modifica Dati
              </button>
            </div>
          </div>

          {/* Sezione Spedizioni e Ordini */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 shadow-sm">
              <h2 className="font-serif text-xl tracking-widest uppercase mb-6 text-[#C0A09A]">Indirizzo di Spedizione</h2>
              {profile?.address ? (
                <p className="font-sans text-sm text-gray-600 leading-relaxed">
                  {profile.address}
                </p>
              ) : (
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-400 italic">
                  Nessun indirizzo inserito. Verrà richiesto al checkout.
                </p>
              )}
            </div>

            <div className="bg-white p-8 shadow-sm">
              <h2 className="font-serif text-xl tracking-widest uppercase mb-6 text-[#C0A09A]">I Miei Ordini</h2>
              <div className="py-12 text-center border-2 border-dashed border-gray-100">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Non hai ancora effettuato ordini.
                </p>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
