import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key_for_build';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key_for_build';

// Client standard (per leggere i prodotti nella Home Page pubblicamente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin (per inserire, modificare ed eliminare i prodotti dal pannello admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
