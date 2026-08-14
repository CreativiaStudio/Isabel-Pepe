const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });

  try {
    await client.connect();
    
    console.log('Inserimento dati di esempio...');

    // 1. Ordini di Esempio
    await client.query(`
      INSERT INTO orders (stripe_session_id, customer_email, customer_name, amount_total, status, items, shipping_address)
      VALUES 
      ('cs_test_1', 'elena.rossi@email.com', 'Elena Rossi', 159.00, 'paid', '[{"id":"1", "name":"Collana Minimal Oro", "price":159, "quantity":1}]', '{"city":"Milano", "country":"IT"}'),
      ('cs_test_2', 'giulia.bianchi@email.com', 'Giulia Bianchi', 280.00, 'paid', '[{"id":"2", "name":"Anello Diamanti", "price":280, "quantity":1}]', '{"city":"Roma", "country":"IT"}')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Clienti CRM
    await client.query(`
      INSERT INTO customers (email, phone, first_name, last_name, total_spent, orders_count, last_purchase_date, acquisition_source, tags, internal_notes)
      VALUES 
      ('elena.rossi@email.com', '+393401234567', 'Elena', 'Rossi', 318.00, 2, now(), 'Meta Ads', '["VIP", "Ama oro giallo"]', 'Cliente alto spendente, adora i regali per le amiche.'),
      ('giulia.bianchi@email.com', '+393339876543', 'Giulia', 'Bianchi', 280.00, 1, now() - interval '2 days', 'Organico', '["nuovo_cliente"]', 'Primo ordine andato bene.'),
      ('mario.verdi@email.com', NULL, 'Mario', 'Verdi', 0, 0, NULL, 'Newsletter', '["lead"]', 'Iscritto alla newsletter ma non ha ancora comprato.')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 3. Carrelli Abbandonati
    await client.query(`
      INSERT INTO abandoned_carts (email, phone, cart_items, total_amount, status, created_at)
      VALUES 
      ('sara.neri@email.com', '+393281122334', '[{"id":"3", "name":"Orecchini Perla", "price":95, "quantity":1}]', 95.00, 'abandoned', now() - interval '2 hours'),
      ('luca.ferrari@email.com', NULL, '[{"id":"4", "name":"Bracciale Tennis", "price":320, "quantity":1}]', 320.00, 'abandoned', now() - interval '1 day'),
      ('elena.rossi@email.com', '+393401234567', '[{"id":"1", "name":"Collana Minimal Oro", "price":159, "quantity":1}]', 159.00, 'recovered', now() - interval '5 days')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Dati inseriti con successo!');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
