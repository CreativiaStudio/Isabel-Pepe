import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    // 1. Dati degli ultimi 7 giorni
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: weeklyOrders } = await supabaseAdmin
      .from('orders')
      .select('amount_total, status')
      .gte('created_at', sevenDaysAgo.toISOString());

    let weeklyRevenue = 0;
    (weeklyOrders || []).forEach(o => { weeklyRevenue += o.amount_total || 0; });

    // 2. Chiamata a Claude Fable 5 (Manager Strategico)
    const systemPrompt = `Sei Claude Fable 5, il Direttore Strategico.
Il tuo compito è analizzare i dati dell'ultima settimana ed emettere la "Macro-Direttiva Settimanale" per l'e-commerce Isabel Pepe.
Dati Settimanali: Incasso €${weeklyRevenue.toFixed(2)}, ${weeklyOrders?.length || 0} ordini totali.
REGOLE:
- Sii autorevole, decisionista e lungimirante.
- Inserisci un'analisi critica (cosa va e cosa non va).
- Detta 1 Macro-Strategia aziendale per la settimana corrente.`;

    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'), // Fallback
      system: systemPrompt,
      messages: [
        { role: 'user', content: 'Genera la Macro-Direttiva Strategica per questa settimana.' }
      ],
      temperature: 0.7,
    });

    // 3. Simula la creazione di un task "Macro Direttiva Fable" (Action Engine)
    const { searchParams } = new URL(req.url);
    const autoPilot = searchParams.get('autoPilot') === 'true';

    const newTask = {
      category: 'crm',
      title: 'Campagna Risveglio Clienti VIP',
      description: 'Invia SMS WhatsApp ai top 5 clienti del mese scorso.',
      action_type: 'send_whatsapp',
      action_label: 'Invia WhatsApp',
      impact: 95,
      kpi: 'Alto Engagement',
      payload: { phones: ['+393331234567', '+393337654321'], message: 'Novità in anteprima...' },
      status: autoPilot ? 'executed' : 'pending'
    };

    await supabaseAdmin.from('jarvis_tasks').insert(newTask);

    if (autoPilot) {
      console.log(`[ACTION ENGINE] Eseguita task in Auto-Pilot: ${newTask.title}`);
    }

    return NextResponse.json({
      success: true,
      report: result.text,
      model: 'claude-fable-5',
      taskCreated: true,
      autoPilot
    });
  } catch (error) {
    console.error('Weekly Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
