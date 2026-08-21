import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth-guard';

// GET: Fetch pending tasks from Action Engine
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { data: pendingTasks, error } = await supabaseAdmin
      .from('jarvis_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    // Se ci sono task in coda, usiamo quelli (Action Engine reale)
    if (pendingTasks && pendingTasks.length > 0) {
      const tips = pendingTasks.map(task => ({
        id: task.id,
        category: task.category,
        title: task.title,
        description: task.description,
        impact: task.impact,
        kpi: task.kpi,
        action_label: task.action_label || 'Esegui',
        payload: task.payload
      }));

      return NextResponse.json({
        structured: true,
        tips
      });
    }

    // FALLBACK PER LA DEMO: Se il DB è vuoto, Jarvis usa Haiku per generare 3 consigli dinamici
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('amount_total, status')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: topCustomers } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name, total_spent')
      .order('total_spent', { ascending: false })
      .limit(5);

    let totalRevenue = 0;
    (recentOrders || []).forEach(o => { totalRevenue += o.amount_total || 0; });

    const context = `Fatturato 30gg: €${totalRevenue.toFixed(2)}, ${recentOrders?.length || 0} ordini. Top Clienti: ${topCustomers?.map(c => `${c.first_name} ${c.last_name}`).join(', ')}`;

    const prompt = `Sei Jarvis, un consulente aziendale IA per l'e-commerce "Isabel Pepe".
Dati: ${context}
Genera ESATTAMENTE 3 consigli operativi strategici. Rispondi SOLO con un array JSON valido:
[{"category":"marketing","title":"...","description":"...","impact":85,"kpi":"...","action_label":"..."},{"category":"crm",...},{"category":"operations",...}]
category deve essere marketing, crm o operations.`;

    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      temperature: 0.7,
    });

    let tips;
    try {
      const cleanText = result.text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      tips = JSON.parse(cleanText);
    } catch {
      tips = [
        { category: 'marketing', title: 'Campagna Sconto VIP', description: 'Invia sconto del 15% ai top 5 clienti.', impact: 80, kpi: 'Fidelizzazione', action_label: 'Invia Email' },
        { category: 'crm', title: 'Recupero Carrelli', description: 'Invia reminder per i carrelli abbandonati.', impact: 75, kpi: '+20% Conv', action_label: 'Attiva' },
        { category: 'operations', title: 'Verifica Scorte', description: 'Due articoli stanno esaurendo le scorte.', impact: 60, kpi: 'Logistica', action_label: 'Controlla' }
      ];
    }

    return NextResponse.json({
      structured: true,
      tips
    });
  } catch (error) {
    console.error('Jarvis task fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Conversational chat with action detection and Multi-Agent Routing
export async function POST(req: Request) {
  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) return auth.response;

  try {
    const { message, history, isPremium = false } = await req.json();

    // Guardrail: Controlla se il messaggio è fuori contesto (es. ricette, programmazione generale)
    const lowerMsg = message.toLowerCase();
    const outOfBoundsWords = ['ricetta', 'cucina', 'pasta', 'film', 'meteo', 'calcio', 'politica', 'barzelletta'];
    const isOutOfBounds = outOfBoundsWords.some(w => lowerMsg.includes(w));
    
    if (isOutOfBounds) {
      return NextResponse.json({
        reply: "Sono Jarvis, l'intelligenza artificiale dedicata alla gestione del tuo e-commerce. Posso aiutarti ad analizzare i carrelli, inviare campagne marketing o elaborare strategie di vendita. Su cosa vogliamo focalizzarci oggi?",
        action: null,
        actionDone: null,
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('amount_total, status')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: topCustomers } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name, total_spent')
      .order('total_spent', { ascending: false })
      .limit(3);

    let totalRevenue = 0;
    (recentOrders || []).forEach(o => { totalRevenue += o.amount_total || 0; });

    const context = `
Dati attuali: Fatturato 30gg €${totalRevenue.toFixed(2)}, ${recentOrders?.length || 0} ordini.
Top clienti: ${topCustomers?.map(c => `${c.first_name} ${c.last_name} (€${c.total_spent})`).join(', ')}
    `;

    // Check if user is approving an action
    const isApproving = /\b(ok falla|procedi|approvato|esegui|vai|sì falla|si falla|confermo|approvata)\b/i.test(message);

    // DETERMINAZIONE DEL MODELLO (Multi-Agent Orchestrator)
    let selectedModel = 'claude-haiku-4-5-20251001'; // Default: Operaio Specializzato
    let roleDescription = 'Sei Jarvis, un assistente IA rapido per il customer care e data entry.';

    if (isPremium) {
      // Simula il "Triage Router" che decide il modello in base alla complessità
      if (lowerMsg.includes('strategia') || lowerMsg.includes('prezzi') || lowerMsg.includes('budget')) {
        selectedModel = 'claude-fable-5'; // Manager Fable 5
        roleDescription = 'Sei Jarvis, il Direttore Strategico. Prendi decisioni complesse di macro-strategia, prezzi e allocazione budget. Usa toni autorevoli.';
      } else if (lowerMsg.includes('analisi') || lowerMsg.includes('campagna') || lowerMsg.includes('copy')) {
        selectedModel = 'claude-sonnet-5'; // Quadrista Sonnet 5
        roleDescription = 'Sei Jarvis, il Responsabile Marketing. Fai analisi dati complesse e scrivi copy per email o post. Usa toni analitici e creativi.';
      }
    }

    // Se stiamo usando Fable o Sonnet ma l'account non li ha attivi nella nostra configurazione AI (per via dei mockup nomi API), 
    // faremo un fallback a Sonnet-3.5 o Haiku. Per ora simuliamo che il provider API supporti le stringhe.
    // Nella realtà, l'alias dipenderà da come li chiamano su Vercel AI SDK (es. claude-3-5-sonnet-latest).
    const actualApiModelStr = selectedModel === 'claude-fable-5' ? 'claude-3-5-sonnet-20241022' // Fallback simulato se fable 5 non c'è nell'sdk
      : selectedModel === 'claude-sonnet-5' ? 'claude-3-5-sonnet-20241022'
      : 'claude-haiku-4-5-20251001';

    const systemPrompt = `${roleDescription}
MODALITÀ: Simulazione Demo. 
Dati correnti: ${context}
Hai accesso a questi strumenti (simulati per ora): invio newsletter, creazione promo, aggiornamento spedizioni, campagne ads, email VIP.

REGOLE:
- Sii conciso, professionale e proattivo. Max 3-4 frasi per risposta.
- Se suggerisci un'azione concreta, termina con ACTION: [descrizione breve dell'azione] su una riga separata.
- ${isApproving ? 'L\'utente ha APPROVATO l\'ultima azione suggerita. Simula di eseguirla e conferma con entusiasmo professionale, poi descrivi brevemente cosa hai "fatto". Usa ACTION_DONE: [cosa hai eseguito].' : 'Non simulare esecuzioni a meno che non ti venga chiesto.'}
- Rispondi in italiano.`;

    const conversationHistory = (history || []).slice(-6).map((m: {role: string; content: string}) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const result = await generateText({
      model: anthropic(actualApiModelStr),
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.75,
    });

    const text = result.text;
    
    const actionMatch = text.match(/ACTION:\s*(.+)$/m);
    const actionDoneMatch = text.match(/ACTION_DONE:\s*(.+)$/m);
    const cleanText = text
      .replace(/ACTION:\s*.+$/m, '')
      .replace(/ACTION_DONE:\s*.+$/m, '')
      .trim();

    return NextResponse.json({
      reply: cleanText,
      action: actionMatch ? actionMatch[1].trim() : null,
      actionDone: actionDoneMatch ? actionDoneMatch[1].trim() : null,
      modelUsed: selectedModel // Ritorna il modello al frontend per la UI
    });
  } catch (error) {
    console.error('Jarvis chat error:', error);
    return NextResponse.json({ error: 'Chat error' }, { status: 500 });
  }
}
