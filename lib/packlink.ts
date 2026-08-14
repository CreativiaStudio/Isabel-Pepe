// lib/packlink.ts
// Client per le API ufficiali di Packlink PRO per Isabel Pepe

const PACKLINK_API_KEY = process.env.PACKLINK_API_KEY || '';
const BASE_URL = 'https://api.packlink.com/v1';

export interface PacklinkAddress {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  zip_code: string;
  city: string;
  country: string; // ISO 2 (es. 'IT')
  phone: string;
  email: string;
}

export interface PacklinkPackage {
  weight: number; // in kg (es. 0.2)
  length: number; // in cm (es. 15)
  width: number;  // in cm (es. 15)
  height: number; // in cm (es. 5)
}

export interface CreateShipmentPayload {
  content: string;
  source?: string;
  packages: PacklinkPackage[];
  from: PacklinkAddress;
  to: PacklinkAddress;
}

// Mittente Predefinito per Isabel Pepe
export const DEFAULT_SENDER: PacklinkAddress = {
  name: 'Isabel Pepe',
  company: 'Isabel Pepe Jewels',
  street1: process.env.PACKLINK_SENDER_STREET || 'Via Sparano da Bari 50',
  zip_code: process.env.PACKLINK_SENDER_ZIP || '70121',
  city: process.env.PACKLINK_SENDER_CITY || 'Bari',
  country: 'IT',
  phone: process.env.PACKLINK_SENDER_PHONE || '+393400000000',
  email: process.env.PACKLINK_SENDER_EMAIL || 'info@isabelpepe.com'
};

// Pacco Standard Predefinito per i gioielli
export const DEFAULT_PACKAGE: PacklinkPackage = {
  weight: 0.2, // 200 grammi
  length: 15,  // 15 cm
  width: 15,   // 15 cm
  height: 5    // 5 cm
};

/**
 * Crea una spedizione bozza (Draft) su Packlink PRO
 */
export async function createPacklinkDraft(order: any): Promise<{ reference?: string; error?: string }> {
  if (!PACKLINK_API_KEY) {
    return { error: 'Chiave API Packlink PRO non configurata in .env.local' };
  }

  const shippingAddr = order.shipping_address || {};
  const recipientName = order.customer_name || `${shippingAddr.first_name || ''} ${shippingAddr.last_name || ''}`.trim() || 'Cliente';
  const recipientEmail = order.customer_email || 'cliente@isabelpepe.com';

  const recipient: PacklinkAddress = {
    name: recipientName,
    street1: shippingAddr.line1 || shippingAddr.street || 'Indirizzo non fornito',
    street2: shippingAddr.line2 || '',
    zip_code: String(shippingAddr.postal_code || shippingAddr.zip || '00100'),
    city: shippingAddr.city || 'Roma',
    country: shippingAddr.country || 'IT',
    phone: shippingAddr.phone || order.customer_phone || '+393400000000',
    email: recipientEmail
  };

  const payload: CreateShipmentPayload = {
    content: 'Gioielli Isabel Pepe',
    source: 'API_ISABEL_PEPE',
    packages: [DEFAULT_PACKAGE],
    from: DEFAULT_SENDER,
    to: recipient
  };

  try {
    const res = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Authorization': PACKLINK_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Packlink API error:', errData);
      return { error: errData.message || `Errore Packlink (${res.status})` };
    }

    const data = await res.json();
    return { reference: data.reference || data.packlink_reference };
  } catch (err: any) {
    console.error('Errore chiamata Packlink:', err);
    return { error: err.message || 'Errore di connessione a Packlink' };
  }
}

/**
 * Recupera i dettagli ed il tracciamento di una spedizione da Packlink PRO
 */
export async function getPacklinkShipmentDetails(reference: string) {
  if (!PACKLINK_API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/shipments/${reference}`, {
      headers: {
        'Authorization': PACKLINK_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Errore recupero dettagli Packlink:', err);
    return null;
  }
}

/**
 * Recupera l'URL dell'etichetta PDF di spedizione
 */
export async function getPacklinkLabelUrl(reference: string): Promise<string[] | null> {
  if (!PACKLINK_API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/shipments/${reference}/labels`, {
      headers: {
        'Authorization': PACKLINK_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.error('Errore recupero etichetta Packlink:', err);
    return null;
  }
}
