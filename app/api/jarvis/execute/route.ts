import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID mancante' }, { status: 400 });
    }

    // Recupera la task dal DB per sapere quale azione eseguire
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('jarvis_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task non trovata' }, { status: 404 });
    }

    // Qui andrebbe la logica reale di Esecuzione (Action Engine reale)
    // ---------------------------------------------------------------
    // Esempio:
    // if (task.action_type === 'send_email') {
    //    await resend.emails.send({ to: task.payload.email, subject: task.title, html: task.payload.body });
    // } else if (task.action_type === 'send_whatsapp') {
    //    await twilio.messages.create({ to: task.payload.phone, body: task.payload.body });
    // }
    // ---------------------------------------------------------------
    
    // Per ora facciamo un log fittizio in console per simulare il successo:
    console.log(`[ACTION ENGINE] Eseguita task: ${task.title} (Azione: ${task.action_type})`);

    // Aggiorna lo stato sul database
    const { error: updateError } = await supabaseAdmin
      .from('jarvis_tasks')
      .update({ status: 'executed' })
      .eq('id', taskId);

    if (updateError) {
      console.error('Errore durante update status:', updateError);
      return NextResponse.json({ error: 'Impossibile aggiornare lo stato' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Azione eseguita con successo!' });

  } catch (error) {
    console.error('Execute Task Error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
