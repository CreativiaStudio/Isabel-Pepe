const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Isabel Pepe <info@isabelpepe.com>';

async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY non configurata, email saltata.');
    return { success: false, error: 'Missing API key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Email inviata con successo via Resend:', data.id);
      return { success: true, data };
    } else {
      console.error('❌ Errore invio Resend:', data);
      return { success: false, error: data };
    }
  } catch (error: any) {
    console.error('❌ Eccezione durante invio email:', error);
    return { success: false, error: error.message };
  }
}

// 1. EMAIL CONFERMA ORDINE & RICEVUTA PAGAMENTO
export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  orderId,
  amountTotal,
  items,
  shippingAddress,
}: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  amountTotal: number;
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
  shippingAddress?: any;
}) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const formattedAddress = typeof shippingAddress === 'string' ? shippingAddress : [
    shippingAddress?.line1,
    shippingAddress?.postal_code,
    shippingAddress?.city,
    shippingAddress?.state,
    shippingAddress?.country,
  ].filter(Boolean).join(', ');

  const itemsHtml = (items || []).map((item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE6;">
        <span style="font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: 600; color: #1A1A1A; display: block;">
          ${item.name}
        </span>
        <span style="font-size: 11px; color: #777777;">Quantità: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #F0EAE6; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 15px; color: #1A1A1A; font-weight: 600;">
        €${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma Ordine Isabel Pepe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F6; margin: 0; padding: 40px 15px; color: #1A1A1A;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8A5E58; font-weight: 600; margin: 0 0 10px 0;">
          Atelier Privato
        </p>
        <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 28px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; margin: 0 0 20px 0; font-weight: bold;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 60px; background-color: #C0A09A; margin: 0 auto 25px auto;"></div>

        <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 22px; letter-spacing: 0.05em; color: #1A1A1A; margin: 0 0 15px 0; font-weight: normal;">
          Ordine Confermato #${shortOrderId}
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 25px 0;">
          Gentile <strong>${customerName || 'Cliente'}</strong>, grazie per aver scelto Isabel Pepe. Abbiamo ricevuto il tuo ordine e i nostri maestri artigiani stanno già preparando i tuoi gioielli con la massima cura.
        </p>

        <!-- Box Riepilogo Articoli -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text-align: left; margin-bottom: 25px; border-top: 1px solid #F0EAE6;">
          ${itemsHtml}
          <tr>
            <td style="padding: 14px 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #777777;">
              Spedizione Express 48h (Assicurata)
            </td>
            <td style="padding: 14px 0 6px 0; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #16a34a; font-weight: bold;">
              Gratis
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: bold; color: #1A1A1A;">
              Totale Pagato
            </td>
            <td style="padding: 8px 0; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 22px; font-weight: bold; color: #1A1A1A;">
              €${amountTotal.toFixed(2)}
            </td>
          </tr>
        </table>

        <!-- Box Spedizione -->
        <div style="background-color: #FAF7F5; border: 1px solid #EADFD9; padding: 18px 20px; text-align: left; border-radius: 2px; margin-bottom: 30px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58; font-weight: bold; margin: 0 0 6px 0;">
            Indirizzo di Spedizione
          </p>
          <p style="font-size: 13px; color: #333333; margin: 0; line-height: 1.5;">
            ${formattedAddress || 'Indirizzo registrato in fase di checkout'}
          </p>
        </div>

        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #1A1A1A;">
              <a href="https://www.isabelpepe.com/account" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                Visualizza lo Stato dell'Ordine &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="border-top: 1px solid #F0EAE6; padding-top: 25px; font-size: 11px; line-height: 1.6; color: #888888;">
          <p style="margin: 0 0 6px 0;">
            Ogni gioiello Isabel Pepe include confezionamento luxury, garanzia a vita sui metalli preziosi e certificato di autenticità.
          </p>
          <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.15em; color: #AAAAAA; font-size: 10px;">
            Isabel Pepe • Haute Joaillerie Italiana
          </p>
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: customerEmail,
    subject: `✨ Ordine Confermato #${shortOrderId} — Isabel Pepe Atelier`,
    html,
  });
}

// 2. EMAIL NOTIFICA SPEDIZIONE & CODICE TRACKING CORRIERE
export async function sendShippingNotificationEmail({
  customerEmail,
  customerName,
  orderId,
  trackingCode,
  courierName = 'Corriere Espresso',
}: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  trackingCode: string;
  courierName?: string;
}) {
  const shortOrderId = orderId.substring(0, 8).toUpperCase();
  const trackingUrl = `https://www.google.com/search?q=${encodeURIComponent('tracking ' + trackingCode)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Il tuo pacco è in viaggio — Isabel Pepe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F6; margin: 0; padding: 40px 15px; color: #1A1A1A;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8A5E58; font-weight: 600; margin: 0 0 10px 0;">
          Spedizione in Consegna
        </p>
        <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 28px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; margin: 0 0 20px 0; font-weight: bold;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 60px; background-color: #C0A09A; margin: 0 auto 25px auto;"></div>

        <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 22px; letter-spacing: 0.05em; color: #1A1A1A; margin: 0 0 15px 0; font-weight: normal;">
          I tuoi gioielli sono in viaggio! 🚚
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 25px 0;">
          Gentile <strong>${customerName || 'Cliente'}</strong>, il tuo ordine <strong>#${shortOrderId}</strong> è stato accuratamente confezionato nel cofanetto regalo ed affidato a <strong>${courierName}</strong>. La consegna è prevista in 24/48 ore lavorative.
        </p>

        <!-- Box Tracking -->
        <div style="background-color: #FAF7F5; border: 1px solid #EADFD9; padding: 22px 20px; text-align: center; border-radius: 2px; margin-bottom: 30px;">
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #8A5E58; font-weight: bold; margin: 0 0 8px 0;">
            Codice di Tracciamento Ufficiale
          </p>
          <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1A1A1A; letter-spacing: 0.15em; margin: 0 0 15px 0;">
            ${trackingCode}
          </p>
          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="border-radius: 2px; background-color: #8A5E58;">
                <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                  Traccia la Spedizione &rarr;
                </a>
              </td>
            </tr>
          </table>
        </div>

        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 30px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #1A1A1A;">
              <a href="https://www.isabelpepe.com/account" target="_blank" style="display: inline-block; padding: 15px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                Il Mio Account Isabel Pepe &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="border-top: 1px solid #F0EAE6; padding-top: 25px; font-size: 11px; line-height: 1.6; color: #888888;">
          <p style="margin: 0 0 6px 0;">
            Per qualsiasi esigenza sulla consegna, rispondi direttamente a questa email o contattaci su WhatsApp.
          </p>
          <p style="margin: 0; text-transform: uppercase; letter-spacing: 0.15em; color: #AAAAAA; font-size: 10px;">
            Isabel Pepe • Haute Joaillerie Italiana
          </p>
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: customerEmail,
    subject: `🚚 Il tuo ordine #${shortOrderId} è in viaggio! — Isabel Pepe`,
    html,
  });
}

// Alias per compatibilità Packlink
export async function sendShippingConfirmationEmail(
  customerEmail: string,
  customerName: string,
  trackingCode: string,
  orderId: string
) {
  return sendShippingNotificationEmail({
    customerEmail,
    customerName,
    orderId,
    trackingCode,
    courierName: 'GLS Express 24/48h',
  });
}
