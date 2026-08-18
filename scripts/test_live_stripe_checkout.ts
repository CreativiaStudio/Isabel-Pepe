import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testLiveCheckout() {
  console.log('--- 🧪 TEST COMPLETO ROTTA /api/checkout DI NEXT.JS ---');

  const testPayload = {
    items: [
      {
        id: '2a1cf0ef-f46e-4ad2-a3c3-305cf14e7a8e',
        name: 'Collana Éclipse Moissanite Oro 18K',
        price: 262,
        quantity: 1,
        slug: 'collana-eclipse'
      },
      {
        id: '9b2c3d4e-1111-2222-3333-444455556666',
        name: 'Bracciale Tennis Harmonie Rodio',
        price: 195,
        quantity: 1,
        slug: 'bracciale-tennis-harmonie'
      }
    ],
    customerEmail: 'mario.test.stripe@isabelpepe.com',
    customerPhone: '+393331122334',
    visitorId: 'vid_test_stripe_audit',
    consentId: 'csnt_test_stripe_audit',
  };

  try {
    const res = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('API Response:', data);

    if (data.url && data.url.startsWith('https://checkout.stripe.com/')) {
      console.log('\n🎉 SUCCESSO TOTALE: Checkout Stripe perfettamente funzionante!');
      console.log('🔗 URL di Pagamento Generato:', data.url);
    } else {
      console.error('❌ Errore nella risposta di Stripe:', data);
    }
  } catch (err: any) {
    console.error('❌ Errore durante la chiamata a /api/checkout:', err.message);
  }
}

testLiveCheckout();
