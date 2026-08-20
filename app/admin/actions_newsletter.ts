'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  is_active: boolean;
  consent_given_at?: string | null;
  source: string;
  ip_address?: string | null;
  user_agent?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  visitor_id?: string | null;
  consent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return [];
    }

    return (data as NewsletterSubscriber[]) || [];
  } catch (err) {
    console.error('Failed to get newsletter subscribers:', err);
    return [];
  }
}

export async function toggleSubscriberStatus(id: string, currentStatus: boolean) {
  try {
    const newStatus = !currentStatus;
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating subscriber status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true, is_active: newStatus };
  } catch (err: any) {
    console.error('Failed to toggle subscriber status:', err);
    return { success: false, error: err.message || 'Errore sconosciuto' };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscriber:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete subscriber:', err);
    return { success: false, error: err.message || 'Errore sconosciuto' };
  }
}
