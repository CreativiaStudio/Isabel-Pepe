import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function assignElena() {
  const elenaVisitorId = 'vid_cn5xrtkfdw5mstcyaeq';

  const { data, error } = await supabase
    .from('visitor_identities')
    .upsert({
      visitor_id: elenaVisitorId,
      name: 'Elena (Co-Founder)',
      email: 'elena@isabelpepe.com',
      role: 'founder',
      notes: 'Dispositivo Smartphone di Elena — Navigazione Catalogo Gioielli',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'visitor_id' })
    .select()
    .single();

  if (error) console.error('Error:', error);
  else console.log('✅ Identità di Elena assegnata con successo:', data);
}

assignElena().catch(console.error);
