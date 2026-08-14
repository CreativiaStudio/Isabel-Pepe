import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOCK_CUSTOMERS = [
  { first_name: 'Giulia', last_name: 'Rossi', email: 'giulia.rossi88@gmail.com', phone: '+393331234567' },
  { first_name: 'Francesca', last_name: 'Bianchi', email: 'franci.bianchi@hotmail.it', phone: '+393387654321' },
  { first_name: 'Martina', last_name: 'Ricci', email: 'marty.ricci92@libero.it', phone: '+393471122334' },
  { first_name: 'Chiara', last_name: 'Marino', email: 'chiara.marino@yahoo.com', phone: '+393284455667' },
  { first_name: 'Silvia', last_name: 'Greco', email: 'silvietta.greco@gmail.com', phone: '+393409988776' },
  { first_name: 'Valentina', last_name: 'Conti', email: 'vale.conti.1990@gmail.com', phone: '+393395544332' },
  { first_name: 'Alessia', last_name: 'Gallo', email: 'alessia.gallo.design@outlook.it', phone: '+393452233445' },
  { first_name: 'Sara', last_name: 'Costa', email: 'sara.costa.music@gmail.com', phone: '+393498877665' },
  { first_name: 'Elena', last_name: 'Giordano', email: 'elena.gio85@hotmail.com', phone: '+393316677889' },
  { first_name: 'Laura', last_name: 'Rizzo', email: 'laura.rizzo.arch@yahoo.it', phone: '+393475566778' },
  { first_name: 'Federica', last_name: 'Lombardi', email: 'fede.lombardi94@gmail.com', phone: '+393332211445' },
  { first_name: 'Eleonora', last_name: 'Moretti', email: 'ele.moretti.art@gmail.com', phone: '+393289900112' },
  { first_name: 'Ilaria', last_name: 'Barbieri', email: 'ilaria.barbieri.fit@hotmail.com', phone: '+393401122334' },
  { first_name: 'Giorgia', last_name: 'Fontana', email: 'giorgia.fontana.style@libero.it', phone: '+393393344556' },
  { first_name: 'Alice', last_name: 'Russo', email: 'alice.russo.travel@gmail.com', phone: '+393457788990' },
  { first_name: 'Beatrice', last_name: 'Ferrari', email: 'bea.ferrari.photo@yahoo.com', phone: '+393491122334' },
  { first_name: 'Serena', last_name: 'Esposito', email: 'serena.espo89@gmail.com', phone: '+393315566778' },
  { first_name: 'Camilla', last_name: 'Romano', email: 'camilla.romano.blog@hotmail.it', phone: '+393479900112' },
  { first_name: 'Vittoria', last_name: 'Colombo', email: 'vittoria.colombo.biz@gmail.com', phone: '+393335566778' },
  { first_name: 'Arianna', last_name: 'De Luca', email: 'arianna.deluca.food@libero.it', phone: '+393281122334' },
];

const STATUSES = ['delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'paid', 'pending'];

function getRandomDate(daysBack: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

async function seedMockData() {
  console.log('Fetching products...');
  const { data: products } = await supabase.from('products').select('id, name, price, image_primary');
  
  if (!products || products.length === 0) {
    console.error('No products found in DB.');
    return;
  }

  console.log('Inserting mock customers...');
  const insertedCustomers = [];
  
  for (const c of MOCK_CUSTOMERS) {
    const orderCount = Math.floor(Math.random() * 3) + 1;
    let totalSpent = 0;
    let lastPurchaseDate = '';

    const ordersToInsert = [];

    for (let i = 0; i < orderCount; i++) {
      const itemsCount = Math.floor(Math.random() * 2) + 1;
      const orderItems = [];
      let orderTotal = 0;

      for (let j = 0; j < itemsCount; j++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        orderItems.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 1,
          image: prod.image_primary
        });
        orderTotal += prod.price;
      }

      totalSpent += orderTotal;
      const orderDate = getRandomDate(30);
      if (!lastPurchaseDate || new Date(orderDate) > new Date(lastPurchaseDate)) {
        lastPurchaseDate = orderDate;
      }

      ordersToInsert.push({
        stripe_session_id: 'mock_sess_' + uuidv4().substring(0, 8),
        customer_email: c.email,
        customer_name: `${c.first_name} ${c.last_name}`,
        amount_total: orderTotal,
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        shipping_address: {
          city: 'Roma',
          country: 'IT',
          line1: 'Via Roma ' + Math.floor(Math.random() * 100),
          postal_code: '00100'
        },
        items: orderItems,
        created_at: orderDate
      });
    }

    const { data: customerData } = await supabase
      .from('customers')
      .upsert([{
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        total_spent: totalSpent,
        orders_count: orderCount,
        last_purchase_date: lastPurchaseDate,
        acquisition_source: 'purchase',
        tags: totalSpent > 250 ? ['VIP'] : ['nuovo_cliente']
      }], { onConflict: 'email' })
      .select()
      .single();
      
    insertedCustomers.push(customerData);

    if (ordersToInsert.length > 0) {
      await supabase.from('orders').insert(ordersToInsert);
    }
  }

  console.log(`✅ Successfully inserted ${MOCK_CUSTOMERS.length} customers and their orders!`);
}

seedMockData().catch(console.error);
