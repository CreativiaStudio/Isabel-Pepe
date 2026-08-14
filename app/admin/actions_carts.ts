'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getAbandonedCarts() {
  const { data, error } = await supabaseAdmin
    .from('abandoned_carts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching abandoned carts:', error);
    return [];
  }
  return data || [];
}

export async function markCartAsLost(id: string) {
  const { error } = await supabaseAdmin
    .from('abandoned_carts')
    .update({ status: 'lost', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating cart:', error);
    return { success: false };
  }
  
  revalidatePath('/admin');
  return { success: true };
}
