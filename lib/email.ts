const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://isabelpepe.com').replace(/\/$/, '');

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    senderEmail: process.env.RESEND_FROM_EMAIL || 'Isabel Pepe <info@isabelpepe.com>',
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'https://isabelpepe.com').replace(/\/$/, ''),
  };
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const { apiKey, senderEmail } = getEmailConfig();

  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY non configurata, email saltata.');
    return { success: false, error: 'Missing API key' };
  }

  try {
    const payload: Record<string, any> = {
      from: senderEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };

    if (text) {
      payload.text = text;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Email inviata con successo via Resend:', data.id);
      return { success: true, id: data.id, data };
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
              <a href="${SITE_URL}/account" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
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
              <a href="${SITE_URL}/account" target="_blank" style="display: inline-block; padding: 15px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
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

// 3. EMAIL BENVENUTA ATELIER PRIVÉ & PRIVILEGE CLUB (PRIVILEGE10)
export interface PrivilegeWelcomeEmailParams {
  to?: string;
  email?: string;
  customerEmail?: string;
  firstName?: string;
  customerName?: string;
  couponCode?: string;
}

export function generatePrivilegeWelcomeEmailHtml({
  firstName,
  couponCode = 'PRIVILEGE10',
}: {
  firstName?: string;
  couponCode?: string;
}): string {
  const displayName = firstName?.trim() || 'Cliente Esclusiva';
  const shopUrl = `${SITE_URL}/shop`;
  const privacyUrl = `${SITE_URL}/privacy`;
  const unsubscribeUrl = `${SITE_URL}/privacy#unsubscribe`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Benvenuta nell'Atelier Privé — Isabel Pepe</title>
</head>
<body style="margin: 0; padding: 40px 15px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0D0D0D; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); overflow: hidden;">
    
    <!-- Top Decorative Line -->
    <tr>
      <td style="height: 3px; background: linear-gradient(90deg, #8A5E58 0%, #C0A09A 50%, #8A5E58 100%);"></td>
    </tr>

    <!-- Header Section -->
    <tr>
      <td style="padding: 48px 36px 28px 36px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.35em; color: #8A5E58; font-weight: 700;">
          GIOIELLERIA DEMI-FINE ITALIANA
        </p>
        <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 32px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; font-weight: 700; line-height: 1.2;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 64px; background-color: #C0A09A; margin: 0 auto 20px auto;"></div>
        <p style="margin: 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 16px; letter-spacing: 0.22em; text-transform: uppercase; color: #0D0D0D; font-weight: 600;">
          L'UNIVERSO ISABEL PEPE
        </p>
      </td>
    </tr>

    <!-- Welcome Body -->
    <tr>
      <td style="padding: 0 36px 32px 36px; text-align: center;">
        <h2 style="margin: 0 0 18px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 24px; color: #0D0D0D; font-weight: 500; letter-spacing: 0.04em; line-height: 1.35;">
          Benvenuta nell'Universo Isabel Pepe
        </h2>
        <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.75; color: #4A4A4A;">
          Gentile <strong>${displayName}</strong>, è un piacere darti il benvenuto nell'<strong>Universo Isabel Pepe</strong>.
        </p>
        <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.75; color: #4A4A4A;">
          La tua iscrizione ti apre le porte alle nostre creazioni di gioielleria demi-fine: argento 925, placcatura oro 18K a spessore, pietre di pura luce e vantaggi dedicati.
        </p>

        <!-- Luxury Coupon Box -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #E4D5CE; border-radius: 4px; margin: 0 0 36px 0;">
          <tr>
            <td style="padding: 28px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8A5E58; font-weight: 700;">
                IL TUO DONO DI BENVENUTO ESCLUSIVO
              </p>
              <p style="margin: 0 0 16px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 24px; font-weight: 600; color: #0D0D0D; letter-spacing: 0.05em;">
                10% di Privilegio Riservato
              </p>
              <div style="display: inline-block; background-color: #FFFFFF; border: 1px dashed #C0A09A; padding: 14px 32px; border-radius: 2px; margin-bottom: 12px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; letter-spacing: 0.28em; color: #0D0D0D;">
                  ${couponCode}
                </span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #736763; line-height: 1.5;">
                Inserisci questo codice al checkout sul tuo prossimo ordine per applicare immediatamente il 10% di sconto sul tuo primo gioiello.
              </p>
            </td>
          </tr>
        </table>

        <!-- 3 Privilege Perks Section -->
        <div style="text-align: left; margin-bottom: 36px; padding: 24px 20px; background-color: #FFFFFF; border-top: 1px solid #F0EAE6; border-bottom: 1px solid #F0EAE6;">
          <p style="margin: 0 0 20px 0; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #8A5E58; font-weight: 700;">
            I VANTAGGI DI ISABEL PEPE PRIVILEGE
          </p>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  1
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Creazioni & Selezioni Esclusive
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Scopri in anteprima le nuove creazioni, le parure e i gioielli d'alta gamma selezionati per te.
                </p>
              </td>
            </tr>
          </table>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  2
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Doni & Inviti Riservati
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Attenzioni dedicate, regali di compleanno e vantaggi pensati unicamente per i membri iscritti.
                </p>
              </td>
            </tr>
          </table>

          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="36" valign="top" style="padding-top: 2px;">
                <span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background-color: #FAF7F5; border: 1px solid #C0A09A; color: #8A5E58; font-size: 11px; font-weight: bold;">
                  3
                </span>
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 15px; font-weight: 600; color: #0D0D0D;">
                  Servizio di Cura &amp; Pulizia Gratuita
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Consigli dedicati e panno lucidante professionale per mantenere intatta la purezza e lo splendore delle tue creazioni.
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Luxury CTA Button -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #0D0D0D;">
              <a href="${shopUrl}" target="_blank" style="display: inline-block; padding: 18px 42px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                ESPLORA LA COLLEZIONE &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Concierge / Atelier Note -->
        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #888888; font-style: italic;">
          Per richieste personalizzate o consulenze gemmologiche su misura, il nostro concierge è sempre a tua completa disposizione.
        </p>
      </td>
    </tr>

    <!-- Footer Section -->
    <tr>
      <td style="padding: 28px 36px 36px 36px; background-color: #FAF8F5; border-top: 1px solid #EADFD9; text-align: center;">
        <p style="margin: 0 0 6px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #0D0D0D; font-weight: 600;">
          Isabel Pepe
        </p>
        <p style="margin: 0 0 14px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58;">
          Gioielleria Demi-Fine Italiana
        </p>
        <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.6; color: #888888;">
          Ricevi questa comunicazione perché hai confermato la tua iscrizione all'Universo Isabel Pepe con consenso al trattamento dati.
        </p>
        <p style="margin: 0; font-size: 11px; color: #888888;">
          <a href="${privacyUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 8px;">Informativa Privacy</a>
          •
          <a href="${unsubscribeUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 8px;">Gestione Consensi &amp; Disiscrizione</a>
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

export function generatePrivilegeWelcomeEmailText({
  firstName,
  couponCode = 'PRIVILEGE10',
}: {
  firstName?: string;
  couponCode?: string;
}): string {
  const displayName = firstName?.trim() || 'Cliente Esclusiva';
  const shopUrl = `${SITE_URL}/shop`;
  const privacyUrl = `${SITE_URL}/privacy`;
  const unsubscribeUrl = `${SITE_URL}/privacy#unsubscribe`;

  return `ISABEL PEPE — GIOIELLERIA DEMI-FINE ITALIANA
L'UNIVERSO ISABEL PEPE

Benvenuta nell'Universo Isabel Pepe

Gentile ${displayName},
è un piacere darti il benvenuto nell'Universo Isabel Pepe.

La tua iscrizione ti apre le porte alle nostre creazioni di gioielleria demi-fine: argento 925, placcatura oro 18K a spessore, pietre di pura luce e vantaggi dedicati.

--------------------------------------------------
IL TUO DONO DI BENVENUTO ESCLUSIVO
10% di Privilegio Riservato
CODICE COUPON: ${couponCode}
--------------------------------------------------
Inserisci questo codice al checkout sul tuo prossimo ordine per applicare immediatamente il 10% di sconto sul tuo primo gioiello.

I VANTAGGI DI ISABEL PEPE PRIVILEGE:
1. Creazioni & Selezioni Esclusive: Scopri in anteprima le nuove creazioni, le parure e i gioielli d'alta gamma selezionati per te.
2. Doni & Inviti Riservati: Attenzioni dedicate, regali di compleanno e vantaggi pensati unicamente per i membri iscritti.
3. Servizio di Cura & Pulizia Gratuita: Consigli dedicati e panno lucidante professionale per mantenere intatta la purezza e lo splendore delle tue creazioni.

Esplora la Collezione:
${shopUrl}

Per richieste personalizzate o consulenze gemmologiche su misura, il nostro concierge è sempre a tua completa disposizione: info@isabelpepe.com

--------------------------------------------------
Isabel Pepe • Gioielleria Demi-Fine Italiana
Informativa Privacy: ${privacyUrl}
Disiscrizione: ${unsubscribeUrl}
`;
}

export async function sendPrivilegeWelcomeEmail(
  params: PrivilegeWelcomeEmailParams | { to: string; firstName?: string; couponCode?: string }
): Promise<{ success: boolean; id?: string; data?: any; error?: any }> {
  try {
    const targetEmail = params?.to || (params as PrivilegeWelcomeEmailParams)?.customerEmail || (params as PrivilegeWelcomeEmailParams)?.email;
    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.includes('@')) {
      console.error('❌ Errore invio email Privilege Welcome: indirizzo email non valido', targetEmail);
      return { success: false, error: 'Indirizzo email mancante o non valido' };
    }

    const firstName = params?.firstName || (params as PrivilegeWelcomeEmailParams)?.customerName || '';
    const couponCode = params?.couponCode || 'PRIVILEGE10';

    const subject = "💎 Il tuo 10% di Benvenuto — L'Universo Isabel Pepe";
    const html = generatePrivilegeWelcomeEmailHtml({ firstName, couponCode });
    const text = generatePrivilegeWelcomeEmailText({ firstName, couponCode });

    return await sendEmail({
      to: targetEmail.trim(),
      subject,
      html,
      text,
    });
  } catch (error: any) {
    console.error('❌ Eccezione durante sendPrivilegeWelcomeEmail:', error);
    return { success: false, error: error?.message || error };
  }
}
