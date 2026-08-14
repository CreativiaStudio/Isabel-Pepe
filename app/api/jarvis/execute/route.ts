import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
