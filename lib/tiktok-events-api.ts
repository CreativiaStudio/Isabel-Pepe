import crypto from 'crypto';

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

function hashSha256(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export interface TikTokServerEventData {
  event: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'CompletePayment' | string;
  eventId?: string;
  userEmail?: string;
  userPhone?: string;
  ttclid?: string;
  clientIp?: string;
  userAgent?: string;
  value?: number;
  currency?: string;
  contents?: Array<{
    content_id?: string;
    content_type?: string;
    content_name?: string;
    price?: number;
    quantity?: number;
  }>;
}

/**
 * Sends a server-side event to TikTok Events API (CAPI)
 */
export async function sendTikTokServerEvent(eventData: TikTokServerEventData): Promise<{ success: boolean; data?: any; error?: string }> {
  const pixelId = process.env.TIKTOK_PIXEL_ID || 'DAG6OCRC77UDHLL3O14G';
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN || '0d0636445445d6f762639f8405a1cf1c9acef9e7';

  if (!pixelId || !accessToken) {
    console.warn('⚠️ TikTok Events API non configurata (Pixel ID o Access Token mancante)');
    return { success: false, error: 'Missing credentials' };
  }

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: eventData.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventData.eventId || crypto.randomUUID(),
        user: {
          email: hashSha256(eventData.userEmail),
          phone: hashSha256(eventData.userPhone),
          ttclid: eventData.ttclid,
          user_agent: eventData.userAgent,
          ip: eventData.clientIp,
        },
        properties: {
          contents: eventData.contents || [],
          currency: eventData.currency || 'EUR',
          value: eventData.value || 0,
        },
      },
    ],
  };

  try {
    const res = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();
    if (resJson.code === 0) {
      console.log(`✅ TikTok Events API [${eventData.event}] inviato con successo`);
      return { success: true, data: resJson };
    } else {
      console.warn(`❌ Errore risposta TikTok Events API:`, resJson);
      return { success: false, error: resJson.message || 'TikTok API Error' };
    }
  } catch (err: any) {
    console.error('❌ Errore chiamata fetch TikTok Events API:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
