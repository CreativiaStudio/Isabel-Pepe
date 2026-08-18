import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupAdminCredentials() {
  console.log('=== 🔐 CONFIGURAZIONE CREDENZIALI ADMIN ISABEL PEPE ===\n');

  const adminUsers = [
    {
      email: 'mario@isabelpepe.com',
      password: 'IsabelPepeAdmin2026!',
      name: 'Mario',
    },
    {
      email: 'sviluppo@creativiastudio.com',
      password: 'CreativiaAdmin2026!',
      name: 'Creativia Studio',
    },
    {
      email: 'info@isabelpepe.com',
      password: 'IsabelPepeOfficial2026!',
      name: 'Isabel Pepe Atelier',
    }
  ];

  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();

  for (const admin of adminUsers) {
    const existing = existingUsers.find(u => u.email?.toLowerCase() === admin.email.toLowerCase());

    if (existing) {
      // Aggiorna password e conferma email
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: admin.password,
        email_confirm: true,
        user_metadata: { name: admin.name, role: 'admin' },
      });

      if (error) {
        console.error(`❌ Errore aggiornamento ${admin.email}:`, error.message);
      } else {
        console.log(`✅ Admin aggiornato: ${admin.email} (Password: ${admin.password})`);
      }
    } else {
      // Crea nuovo utente admin
      const { data, error } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: { name: admin.name, role: 'admin' },
      });

      if (error) {
        console.error(`❌ Errore creazione ${admin.email}:`, error.message);
      } else {
        console.log(`✅ Nuovo Admin creato: ${admin.email} (Password: ${admin.password})`);
      }
    }
  }

  console.log('\n🔒 Tutte le credenziali Admin sono sincronizzate e protette in Supabase Auth!');
}

setupAdminCredentials().catch(console.error);
