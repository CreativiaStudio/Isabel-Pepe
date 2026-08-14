import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aarojhgdvzeorhimszpk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDQ0ODIsImV4cCI6MjA5NTgyMDQ4Mn0.bI58QLfKC7FtwoW7Cnml4RNnww8rU29bNQ-1YjjH54k';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9qaGdkdnplb3JoaW1zenBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDI0NDQ4MiwiZXhwIjoyMDk1ODIwNDgyfQ.h6sz5ae-f3LP-noYKwbakguZ2PGtrh2s96XJKrYfgIE';

// Client standard (per leggere i prodotti nella Home Page pubblicamente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client Admin (per inserire, modificare ed eliminare i prodotti dal pannello admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
