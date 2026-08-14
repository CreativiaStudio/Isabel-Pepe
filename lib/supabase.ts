import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client standard (per leggere i prodotti nella Home Page pubblicamente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin (per inserire, modificare ed eliminare i prodotti dal pannello admin)
// Usa la Service Role Key, che ha permessi assoluti
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
