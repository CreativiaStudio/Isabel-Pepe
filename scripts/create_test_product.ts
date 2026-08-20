import { sendPrivilegeWelcomeEmail } from '../lib/email';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const targetEmails = ['mariopepe9@hotmail.it', 'sviluppo@creativiastudio.com'];
  
  for (const email of targetEmails) {
    console.log(`Invio email di benvenuto Privilege a ${email}...`);
    const res = await sendPrivilegeWelcomeEmail({
      to: email,
      firstName: 'Mario',
      couponCode: 'PRIVILEGE10'
    });
    console.log(`Risultato per ${email}:`, res);
  }
}

run().catch(console.error);
