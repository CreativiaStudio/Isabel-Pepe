'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getCustomers() {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('last_purchase_date', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data || [];
}

export async function updateCustomerNotes(id: string, internalNotes: string) {
  const { error } = await supabaseAdmin
    .from('customers')
    .update({ internal_notes: internalNotes })
    .eq('id', id);

  if (error) {
    console.error('Error updating customer:', error);
    return { success: false };
  }
  
  revalidatePath('/admin');
  return { success: true };
}

export async function updateCustomerTags(id: string, tags: string[]) {
  const { error } = await supabaseAdmin
    .from('customers')
    .update({ tags: tags })
    .eq('id', id);

  if (error) {
    console.error('Error updating customer tags:', error);
    return { success: false };
  }
  
  revalidatePath('/admin');
  return { success: true };
}
