import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';
import { supabaseAdmin } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Il Mio Account | Isabel Pepe Atelier',
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
    redirect('/login');
  }

  // 2. Recupera profilo utente
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // 3. Recupera gli ordini reali dell'utente (per customer_email)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_email', user.email || '')
    .order('created_at', { ascending: false });

  return (
    <AccountClient 
      user={{ id: user.id, email: user.email }}
      initialProfile={profile || null}
      initialOrders={orders || []}
    />
  );
}
