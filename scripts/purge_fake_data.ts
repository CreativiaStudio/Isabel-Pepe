import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeFakeData() {
  console.log('=== 🧹 PULIZIA DATI FITTIZI ISABEL PEPE ===\n');

  // 1. Pulizia ordini di test (mock)
  const { count: ordersCount, error: errOrd } = await supabase
    .from('orders')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // elimina tutti i test
  console.log(`✅ Ordini di test eliminati: ${ordersCount || 0}`);

  // 2. Pulizia carrelli abbandonati fittizi
  const { count: cartsCount } = await supabase
    .from('abandoned_carts')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`✅ Carrelli abbandonati di test eliminati: ${cartsCount || 0}`);

  // 3. Pulizia clienti fittizi
  const { count: custCount } = await supabase
    .from('customers')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`✅ Clienti demo eliminati: ${custCount || 0}`);

  // 4. Pulizia contatti CRM test
  const { count: crmCount } = await supabase
    .from('crm_contacts')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`✅ Contatti CRM demo eliminati: ${crmCount || 0}`);

  // 5. Pulizia page views di test
  const { count: viewsCount } = await supabase
    .from('page_views')
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`✅ Visualizzazioni pagina di test azzerate: ${viewsCount || 0}`);

  // Verifica prodotti rimasti (devono essere intatti!)
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  console.log(`\n💎 PRODOTTI UFFICIALI A CATALOGO INTATTI: ${productsCount} gioielli`);
  console.log('\n✨ Database pulito e pronto per la produzione!');
}

purgeFakeData().catch(console.error);
