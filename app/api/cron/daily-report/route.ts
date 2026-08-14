import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    // 1. Raccogli dati del giorno precedente
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: dailyOrders } = await supabaseAdmin
      .from('orders')
      .select('amount_total, status')
      .gte('created_at', yesterday.toISOString());

    let dailyRevenue = 0;
    (dailyOrders || []).forEach(o => { dailyRevenue += o.amount_total || 0; });

    // 2. Chiamata a Claude Sonnet 5 (Quadrista)
    const systemPrompt = `Sei Claude Sonnet 5, il Responsabile Marketing (Quadrista).
Il tuo compito è analizzare i dati del giorno precedente ed emettere un "Daily Report" sintetico per il cliente.
Dati di ieri: Incasso €${dailyRevenue.toFixed(2)}, ${dailyOrders?.length || 0} ordini.
REGOLE:
- Sii estremamente conciso (max 3 bullet point).
- Fornisci una breve analisi.
- Suggerisci 1 micro-azione per oggi.`;

    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'), 
      system: systemPrompt,
      messages: [
        { role: 'user', content: 'Genera il Daily Report per oggi.' }
      ],
      temperature: 0.5,
    });

    // 3. Simula la creazione di un task "Recupero Carrelli" (Action Engine)
    const { searchParams } = new URL(req.url);
    const autoPilot = searchParams.get('autoPilot') === 'true';

    const newTask = {
      category: 'marketing',
      title: 'Recupero Carrelli Ieri',
      description: 'Invia email a 3 carrelli abbandonati per recuperarli con codice sconto.',
      action_type: 'send_email',
      action_label: 'Invia Email',
      impact: 85,
      kpi: '+3 Recuperi',
      payload: { emails: ['test1@example.com', 'test2@example.com', 'test3@example.com'], discount: '10%' },
      status: autoPilot ? 'executed' : 'pending'
    };

    await supabaseAdmin.from('jarvis_tasks').insert(newTask);

    if (autoPilot) {
      console.log(`[ACTION ENGINE] Eseguita task in Auto-Pilot: ${newTask.title}`);
    }

    return NextResponse.json({
      success: true,
      report: result.text,
      model: 'claude-sonnet-5',
      taskCreated: true,
      autoPilot
    });
  } catch (error) {
    console.error('Daily Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
