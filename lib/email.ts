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
            Ogni gioiello Isabel Pepe include cofanetto luxury regalo, certificato ufficiale di autenticità e garanzia legale di conformità 24 mesi.
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

  const customerSendPromise = sendEmail({
    to: customerEmail,
    subject: `✨ Il tuo ordine è confermato, ${customerName || 'cara cliente'} — Isabel Pepe`,
    html,
  });

  // Notifica immediata ad Admin per evasione rapida
  sendEmail({
    to: ['info@isabelpepe.com', 'sviluppo@creativiastudio.com'],
    subject: `🚨 [NUOVO ORDINE] #${shortOrderId} — €${amountTotal.toFixed(2)} da ${customerName || customerEmail}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
        <h2 style="color: #8A5E58;">🎉 Nuovo Ordine Ricevuto su Isabel Pepe!</h2>
        <p><strong>ID Ordine:</strong> #${shortOrderId}</p>
        <p><strong>Cliente:</strong> ${customerName} (<a href="mailto:${customerEmail}">${customerEmail}</a>)</p>
        <p><strong>Totale Incassato:</strong> €${amountTotal.toFixed(2)}</p>
        <p><strong>Indirizzo Spedizione:</strong> ${formattedAddress || 'Indirizzo in checkout'}</p>
        <p style="margin-top: 20px;">
          <a href="${SITE_URL}/admin?tab=orders" style="background: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Apri Pannello Ordini &rarr;
          </a>
        </p>
      </div>
    `,
  }).catch((err) => console.warn('Admin new order notification warning:', err));

  return customerSendPromise;
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
  const trackingUrl = `https://www.sda.it/wps/portal/Servizi_online/Ricerca-spedizioni?tracking=${encodeURIComponent(trackingCode)}`;

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
              <a href="${SITE_URL}/assistenza-clienti" target="_blank" style="display: inline-block; padding: 15px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                Assistenza Clienti &rarr;
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
    subject: `🚚 I tuoi gioielli sono in viaggio, ${customerName || 'cara cliente'} — Isabel Pepe`,
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
                  Cura del Gioiello &amp; Consigli Esclusivi
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #666666;">
                  Guida personalizzata alla cura dei tuoi gioielli Isabel Pepe, con panno in microfibra professionale incluso in ogni cofanetto.
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
          Per richieste personalizzate o consulenze gemmologiche su misura, il nostro concierge è sempre a tua completa disposizione: <a href="mailto:info@isabelpepe.com" style="color: #8A5E58; text-decoration: none;">info@isabelpepe.com</a>
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

// 4. EMAIL NOTIFICA ADMIN - NUOVO MESSAGGIO CONCIERGE / ASSISTENZA
export interface SupportAdminNotificationParams {
  ticketId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
}

export function generateSupportAdminNotificationEmailHtml({
  ticketId,
  customerName,
  customerEmail,
  subject,
  message,
  ipAddress,
  userAgent,
  createdAt,
}: SupportAdminNotificationParams): string {
  const shortTicketId = ticketId ? ticketId.substring(0, 8).toUpperCase() : 'N/D';
  const adminInboxUrl = `${SITE_URL}/admin?tab=messages`;
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    : new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

  // Escape HTML in user content to prevent rendering issues or injection in email clients
  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeName = escapeHtml(customerName);
  const safeEmail = escapeHtml(customerEmail);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const safeIp = escapeHtml(ipAddress || 'Sconosciuto');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Nuovo Messaggio Concierge — Isabel Pepe</title>
</head>
<body style="margin: 0; padding: 40px 15px; background-color: #FAF8F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04); overflow: hidden;">
    
    <!-- Top Decorative Rose Gold Gradient -->
    <tr>
      <td style="height: 4px; background: linear-gradient(90deg, #8A5E58 0%, #C0A09A 50%, #8A5E58 100%);"></td>
    </tr>

    <!-- Header Section -->
    <tr>
      <td style="padding: 36px 32px 20px 32px; text-align: center; background-color: #FFFFFF;">
        <p style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.35em; color: #8A5E58; font-weight: 700;">
          CONCIERGE &amp; ASSISTENZA CLIENTI
        </p>
        <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 30px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; font-weight: 700;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 60px; background-color: #C0A09A; margin: 0 auto 20px auto;"></div>
        
        <div style="display: inline-block; background-color: #FAF2EF; border: 1px solid #EADFD9; padding: 6px 16px; border-radius: 20px; margin-bottom: 10px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8A5E58; font-weight: 600;">
            🔔 Nuovo Ticket #${shortTicketId}
          </span>
        </div>
      </td>
    </tr>

    <!-- Main Content Body -->
    <tr>
      <td style="padding: 10px 32px 32px 32px;">
        <h2 style="margin: 0 0 18px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 20px; color: #1A1A1A; font-weight: 600; text-align: center;">
          Nuova Richiesta da ${safeName}
        </h2>
        <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #555555; text-align: center;">
          È arrivato un nuovo messaggio dal modulo di contatto del sito web. Rispondi rapidamente dalla dashboard admin per garantire un'esperienza cliente d'eccellenza.
        </p>

        <!-- Customer & Ticket Detail Box -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF7F5; border: 1px solid #EADFD9; border-radius: 4px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="30%" style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A5E58; font-weight: bold;">
                    Cliente:
                  </td>
                  <td width="70%" style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 600;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A5E58; font-weight: bold;">
                    Email:
                  </td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A;">
                    <a href="mailto:${safeEmail}" style="color: #8A5E58; text-decoration: underline; font-weight: 500;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A5E58; font-weight: bold;">
                    Oggetto:
                  </td>
                  <td style="padding: 6px 0; font-size: 13px; color: #1A1A1A; font-weight: 600;">
                    ${safeSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A5E58; font-weight: bold;">
                    Data / Ora:
                  </td>
                  <td style="padding: 6px 0; font-size: 12px; color: #666666;">
                    ${formattedDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A5E58; font-weight: bold;">
                    Indirizzo IP:
                  </td>
                  <td style="padding: 6px 0; font-size: 12px; color: #777777; font-family: monospace;">
                    ${safeIp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Message Body Container -->
        <div style="margin-bottom: 28px;">
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58; font-weight: 700;">
            Messaggio del Cliente:
          </p>
          <div style="background-color: #FFFFFF; border-left: 3px solid #C0A09A; border-top: 1px solid #F0EAE6; border-right: 1px solid #F0EAE6; border-bottom: 1px solid #F0EAE6; padding: 18px 20px; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.7; color: #222222;">
            ${safeMessage}
          </div>
        </div>

        <!-- Luxury Action CTA Button -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #1A1A1A;">
              <a href="${adminInboxUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                Apri Concierge Inbox &amp; Rispondi &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 11px; text-align: center; color: #888888; font-style: italic;">
          Suggerimento: puoi rispondere direttamente dal pannello admin con modelli luxury preimpostati in 1 click.
        </p>
      </td>
    </tr>

    <!-- Footer Section -->
    <tr>
      <td style="padding: 24px 32px 30px 32px; background-color: #FAF8F6; border-top: 1px solid #EADFD9; text-align: center;">
        <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #1A1A1A; font-weight: 600;">
          Isabel Pepe • Atelier Concierge System
        </p>
        <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #8A5E58;">
          Notifica Interna ad Alta Priorità
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

export function generateSupportAdminNotificationEmailText({
  ticketId,
  customerName,
  customerEmail,
  subject,
  message,
  ipAddress,
  createdAt,
}: SupportAdminNotificationParams): string {
  const shortTicketId = ticketId ? ticketId.substring(0, 8).toUpperCase() : 'N/D';
  const adminInboxUrl = `${SITE_URL}/admin?tab=messages`;
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    : new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

  return `ISABEL PEPE — CONCIERGE & ASSISTENZA CLIENTI
NUOVO MESSAGGIO RICEVUTO [Ticket #${shortTicketId}]
--------------------------------------------------

DETTAGLI CLIENTE:
- Nome: ${customerName}
- Email: ${customerEmail}
- Oggetto: ${subject}
- Data / Ora: ${formattedDate}
- Indirizzo IP: ${ipAddress || 'Sconosciuto'}

MESSAGGIO:
--------------------------------------------------
${message}
--------------------------------------------------

Per rispondere direttamente con i template luxury:
${adminInboxUrl}

Isabel Pepe • Notifica Interna ad Alta Priorità
`;
}

export async function sendSupportAdminNotificationEmail(
  params: SupportAdminNotificationParams
): Promise<{ success: boolean; id?: string; data?: any; error?: any }> {
  try {
    const { customerName, customerEmail, subject, message } = params;

    if (!customerName || !customerEmail || !subject || !message) {
      console.error('❌ Errore invio email notifica admin: parametri obbligatori mancanti', params);
      return { success: false, error: 'Parametri obbligatori mancanti' };
    }

    const emailSubject = `🛎️ [CONCIERGE] Nuovo Messaggio da ${customerName.trim()} — ${subject.trim()}`;
    const html = generateSupportAdminNotificationEmailHtml(params);
    const text = generateSupportAdminNotificationEmailText(params);

    const recipients = ['info@isabelpepe.com', 'sviluppo@creativiastudio.com'];

    return await sendEmail({
      to: recipients,
      subject: emailSubject,
      html,
      text,
    });
  } catch (error: any) {
    console.error('❌ Eccezione durante sendSupportAdminNotificationEmail:', error);
    return { success: false, error: error?.message || error };
  }
}

// 5. EMAIL RISPOSTA CONCIERGE DIRETTA AL CLIENTE (ONE-CLICK DIRECT REPLY)
export interface SupportReplyEmailParams {
  customerEmail: string;
  customerName: string;
  originalSubject: string;
  originalMessage?: string;
  replyText: string;
  ticketId?: string;
  subject?: string;
}

export function generateSupportReplyEmailHtml({
  customerName,
  originalSubject,
  originalMessage,
  replyText,
  ticketId,
}: {
  customerName: string;
  originalSubject: string;
  originalMessage?: string;
  replyText: string;
  ticketId?: string;
}): string {
  const shortTicketId = ticketId ? ticketId.substring(0, 8).toUpperCase() : '';
  const shopUrl = `${SITE_URL}/shop`;
  const contactUrl = `${SITE_URL}/assistenza-clienti`;
  const privacyUrl = `${SITE_URL}/privacy`;

  const escapeHtml = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeName = escapeHtml(customerName?.trim() || 'Gentile Cliente');
  const safeSubject = escapeHtml(originalSubject || 'Richiesta Concierge');
  const safeReply = escapeHtml(replyText).replace(/\n/g, '<br/>');
  const safeOriginalMsg = originalMessage ? escapeHtml(originalMessage).replace(/\n/g, '<br/>') : '';

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Risposta da Isabel Pepe Concierge</title>
</head>
<body style="margin: 0; padding: 40px 15px; background-color: #FAF8F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EADFD9; border-radius: 4px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04); overflow: hidden;">
    
    <!-- Top Decorative Rose Gold Bar -->
    <tr>
      <td style="height: 4px; background: linear-gradient(90deg, #8A5E58 0%, #C0A09A 50%, #8A5E58 100%);"></td>
    </tr>

    <!-- Header Section -->
    <tr>
      <td style="padding: 42px 36px 20px 36px; text-align: center; background-color: #FFFFFF;">
        <p style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.35em; color: #8A5E58; font-weight: 700;">
          ATELIER CONCIERGE &amp; PRIVATE SERVICE
        </p>
        <h1 style="margin: 0 0 12px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 30px; letter-spacing: 0.25em; text-transform: uppercase; color: #C0A09A; font-weight: 700;">
          ISABEL PEPE
        </h1>
        <div style="height: 1px; width: 60px; background-color: #C0A09A; margin: 0 auto 20px auto;"></div>
        
        ${shortTicketId ? `
        <div style="display: inline-block; background-color: #FAF4F2; border: 1px solid #EADFD9; padding: 5px 14px; border-radius: 20px; margin-bottom: 8px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8A5E58; font-weight: 600;">
            Rif. Richiesta #${shortTicketId}
          </span>
        </div>
        ` : ''}
      </td>
    </tr>

    <!-- Main Message Content -->
    <tr>
      <td style="padding: 10px 36px 32px 36px;">
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #1A1A1A; font-weight: 600;">
          Gentile ${safeName},
        </p>
        
        <!-- Reply Message Body -->
        <div style="font-size: 14px; line-height: 1.8; color: #333333; margin-bottom: 28px;">
          ${safeReply}
        </div>

        <!-- Signature -->
        <div style="margin-bottom: 32px; padding-top: 16px; border-top: 1px solid #F2ECE9;">
          <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, Georgia, serif; font-size: 15px; font-weight: 600; color: #1A1A1A;">
            Elena &amp; Mario Pepe
          </p>
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8A5E58;">
            Isabel Pepe Atelier Concierge
          </p>
        </div>

        <!-- Original Message Quote Box -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FAF7F5; border-left: 3px solid #C0A09A; border-top: 1px solid #EADFD9; border-right: 1px solid #EADFD9; border-bottom: 1px solid #EADFD9; border-radius: 0 4px 4px 0; margin-bottom: 32px;">
          <tr>
            <td style="padding: 18px 20px;">
              <p style="margin: 0 0 6px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58; font-weight: bold;">
                La tua richiesta originale:
              </p>
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #1A1A1A;">
                ${safeSubject}
              </p>
              ${safeOriginalMsg ? `
              <div style="font-size: 12px; line-height: 1.6; color: #666666; font-style: italic;">
                "${safeOriginalMsg}"
              </div>
              ` : ''}
            </td>
          </tr>
        </table>

        <!-- Luxury Packaging & Guarantee Badges -->
        <div style="background-color: #FFFFFF; border: 1px solid #F0EAE6; border-radius: 4px; padding: 20px; margin-bottom: 30px; text-align: left;">
          <p style="margin: 0 0 14px 0; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #8A5E58; font-weight: 700;">
            Le Garanzie dell'Atelier Isabel Pepe
          </p>
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="padding: 6px; text-align: center; vertical-align: top;">
                <p style="margin: 0 0 4px 0; font-size: 16px;">🎁</p>
                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #1A1A1A;">Cofanetto Luxury</p>
                <p style="margin: 0; font-size: 10px; color: #777777; line-height: 1.4;">Incluso in omaggio con panno lucidante</p>
              </td>
              <td width="33%" style="padding: 6px; text-align: center; vertical-align: top; border-left: 1px solid #F0EAE6; border-right: 1px solid #F0EAE6;">
                <p style="margin: 0 0 4px 0; font-size: 16px;">📜</p>
                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #1A1A1A;">Garanzia Ufficiale</p>
                <p style="margin: 0; font-size: 10px; color: #777777; line-height: 1.4;">24 mesi e certificato di autenticità</p>
              </td>
              <td width="33%" style="padding: 6px; text-align: center; vertical-align: top;">
                <p style="margin: 0 0 4px 0; font-size: 16px;">🚚</p>
                <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 600; color: #1A1A1A;">Reso &amp; Cambio Facile</p>
                <p style="margin: 0; font-size: 10px; color: #777777; line-height: 1.4;">14 giorni con corriere espresso</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto;">
          <tr>
            <td align="center" style="border-radius: 2px; background-color: #1A1A1A;">
              <a href="${shopUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 2px;">
                Visita l'Atelier Online &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 11px; text-align: center; color: #888888; line-height: 1.5;">
          Per qualsiasi ulteriore informazione o consiglio, puoi rispondere direttamente a questa email.
        </p>
      </td>
    </tr>

    <!-- Footer Section -->
    <tr>
      <td style="padding: 24px 36px 30px 36px; background-color: #FAF8F6; border-top: 1px solid #EADFD9; text-align: center;">
        <p style="margin: 0 0 4px 0; font-family: 'Playfair Display', 'Times New Roman', Times, serif; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #1A1A1A; font-weight: 600;">
          Isabel Pepe
        </p>
        <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8A5E58;">
          Haute Joaillerie Demi-Fine Italiana
        </p>
        <p style="margin: 0; font-size: 11px; color: #888888;">
          <a href="${contactUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 6px;">Assistenza Clienti</a>
          •
          <a href="${privacyUrl}" target="_blank" style="color: #8A5E58; text-decoration: underline; margin: 0 6px;">Informativa Privacy</a>
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

export function generateSupportReplyEmailText({
  customerName,
  originalSubject,
  originalMessage,
  replyText,
  ticketId,
}: {
  customerName: string;
  originalSubject: string;
  originalMessage?: string;
  replyText: string;
  ticketId?: string;
}): string {
  const shortTicketId = ticketId ? ticketId.substring(0, 8).toUpperCase() : '';
  const shopUrl = `${SITE_URL}/shop`;

  return `ISABEL PEPE — ATELIER CONCIERGE & PRIVATE SERVICE
${shortTicketId ? `[Riferimento Ticket #${shortTicketId}]\n` : ''}--------------------------------------------------

Gentile ${customerName || 'Cliente'},

${replyText}

--
Elena & Mario Pepe
Isabel Pepe Atelier Concierge
Email: info@isabelpepe.com

--------------------------------------------------
LA TUA RICHIESTA ORIGINALE:
Oggetto: ${originalSubject}
${originalMessage ? `Messaggio: ${originalMessage}\n` : ''}--------------------------------------------------

GARANZIE ISABEL PEPE:
- Cofanetto Luxury Regalo & Panno Lucidante inclusi
- Garanzia Legale 24 mesi e Certificato Ufficiale
- Reso e cambio facile entro 14 giorni

Visita la collezione: ${shopUrl}

Isabel Pepe • Haute Joaillerie Demi-Fine Italiana
`;
}

export async function sendSupportReplyEmail(
  params: SupportReplyEmailParams
): Promise<{ success: boolean; id?: string; data?: any; error?: any }> {
  try {
    const {
      customerEmail,
      customerName,
      originalSubject,
      originalMessage,
      replyText,
      ticketId,
      subject,
    } = params;

    if (!customerEmail || !replyText) {
      console.error('❌ Errore invio email risposta concierge: email o testo mancante', params);
      return { success: false, error: 'Email cliente o testo risposta mancante' };
    }

    const emailSubject = subject || (originalSubject && originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject || 'Richiesta Isabel Pepe Concierge'}`);
    const html = generateSupportReplyEmailHtml({
      customerName,
      originalSubject,
      originalMessage,
      replyText,
      ticketId,
    });
    const text = generateSupportReplyEmailText({
      customerName,
      originalSubject,
      originalMessage,
      replyText,
      ticketId,
    });

    return await sendEmail({
      to: customerEmail.trim(),
      subject: emailSubject,
      html,
      text,
    });
  } catch (error: any) {
    console.error('❌ Eccezione durante sendSupportReplyEmail:', error);
    return { success: false, error: error?.message || error };
  }
}

