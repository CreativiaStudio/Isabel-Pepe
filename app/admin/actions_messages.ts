'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { SupportMessage, SupportMessageStatus } from '@/types/support';

const VALID_STATUSES: readonly SupportMessageStatus[] = ['unread', 'pending', 'replied', 'closed'] as const;

export async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Errore caricamento messaggi concierge:', error);
      return [];
    }

    return (data as SupportMessage[]) || [];
  } catch (err) {
    console.error('❌ Eccezione recupero messaggi:', err);
    return [];
  }
}

export async function updateMessageStatus(
  id: string,
  status: string
): Promise<{ success: boolean; status?: SupportMessageStatus; error?: string }> {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID messaggio mancante o non valido' };
    }

    const normalizedStatus = status?.trim().toLowerCase() as SupportMessageStatus;
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return {
        success: false,
        error: `Stato non valido: "${status}". Valori ammessi: ${VALID_STATUSES.join(', ')}`,
      };
    }

    const nowIso = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('support_messages')
      .update({
        status: normalizedStatus,
        updated_at: nowIso,
      })
      .eq('id', id.trim());

    if (error) {
      console.error('❌ Errore aggiornamento stato messaggio:', error);
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context (e.g. standalone test runners)
    }

    return { success: true, status: normalizedStatus };
  } catch (err: any) {
    console.error('❌ Eccezione updateMessageStatus:', err);
    return { success: false, error: err.message || 'Errore sconosciuto durante aggiornamento stato' };
  }
}

export async function deleteMessage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID messaggio mancante o non valido' };
    }

    const { error } = await supabaseAdmin
      .from('support_messages')
      .delete()
      .eq('id', id.trim());

    if (error) {
      console.error('❌ Errore eliminazione messaggio:', error);
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/admin');
    } catch {
      // Ignored outside Next.js request context (e.g. standalone test runners)
    }

    return { success: true };
  } catch (err: any) {
    console.error('❌ Eccezione deleteMessage:', err);
    return { success: false, error: err.message || 'Errore sconosciuto durante eliminazione messaggio' };
  }
}
