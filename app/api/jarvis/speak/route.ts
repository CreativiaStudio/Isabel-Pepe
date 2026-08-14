import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    // Voice ID per "Brian - Deep, Resonant and Comforting" (ottimo per Jarvis)
    const voiceId = 'nPczCjzI2devNBz1zQrb';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5', // Modello ultra veloce per bassa latenza
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ElevenLabs API Error:', err);
      return NextResponse.json({ error: 'ElevenLabs API Error' }, { status: response.status });
    }

    // Restituiamo direttamente lo stream audio
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in Jarvis Speak API:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
