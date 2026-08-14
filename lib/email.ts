// Questa è una funzione placeholder per l'invio delle email
// Per attivarla servirà creare un account su Resend (gratuito fino a 3000 email/mese)
// e inserire la chiave API nel file .env.local come RESEND_API_KEY

export async function sendShippingConfirmationEmail(customerEmail: string, customerName: string, trackingCode: string, orderId: string) {
  console.log(`\n\n=== SIMULAZIONE INVIO EMAIL ===`);
  console.log(`A: ${customerEmail} (${customerName})`);
  console.log(`Oggetto: Il tuo ordine Isabel Pepe è in viaggio!`);
  console.log(`Corpo: Ciao ${customerName}, il tuo ordine è stato affidato al corriere.`);
  console.log(`Tracking Code: ${trackingCode}`);
  console.log(`================================\n\n`);

  // Logica futura con Resend:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'Isabel Pepe <ordini@isabelpepe.com>',
    to: customerEmail,
    subject: 'Il tuo ordine è in viaggio! 🚚',
    html: `
      <h1>Ciao ${customerName},</h1>
      <p>Ottime notizie! Il tuo ordine è stato appena affidato al corriere e sta viaggiando verso di te.</p>
      <p>Puoi seguire la spedizione inserendo questo codice di tracciamento sul sito del corriere:</p>
      <div style="padding: 12px; background: #f4f4f4; border-radius: 4px; font-weight: bold; margin: 16px 0;">
        ${trackingCode}
      </div>
      <p>A presto,<br>Il team di Isabel Pepe</p>
    `
  });
  */
  
  return true;
}
