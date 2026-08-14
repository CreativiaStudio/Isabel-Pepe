'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="font-sans text-[10px] uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition-colors border border-red-100 hover:bg-red-50 px-6 py-3 mt-8"
    >
      Esci dall'Account
    </button>
  );
}
