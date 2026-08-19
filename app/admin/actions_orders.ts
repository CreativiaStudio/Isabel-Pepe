'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { sendShippingNotificationEmail } from '@/lib/email';

// Fetch orders with optional status filter
export async function getOrders(status?: string) {
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data || [];
}

// Update order status
export async function updateOrderStatus(id: string, status: string, trackingCode?: string) {
  const updates: any = { status };
  
  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
  }
  if (trackingCode !== undefined) {
    updates.tracking_code = trackingCode;
  }

  // Fetch dell'ordine corrente se dobbiamo mandare l'email
  let currentOrder = null;
  if (status === 'shipped') {
    const { data } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();
    currentOrder = data;
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }

  // Invia l'email di conferma se spedito
  if (status === 'shipped' && currentOrder && (trackingCode || currentOrder.tracking_code)) {
    sendShippingNotificationEmail({
      customerEmail: currentOrder.customer_email,
      customerName: currentOrder.customer_name,
      orderId: currentOrder.id,
      trackingCode: trackingCode || currentOrder.tracking_code,
      courierName: 'GLS Express 24/48h',
    }).catch(err => console.error('Error sending shipping email:', err));
  }

  revalidatePath('/admin');
  return { success: true };
}

// Get dashboard stats
export async function getDashboardStats() {
  const { data: orders } = await supabaseAdmin.from('orders').select('*');
  const { data: products } = await supabaseAdmin.from('products').select('stock, is_active');

  const stats = {
    totalRevenue: 0,
    totalOrders: 0,
    pendingShipments: 0,
    activeProducts: 0,
  };

  if (orders) {
    stats.totalOrders = orders.length;
    stats.totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount_total || 0), 0);
    stats.pendingShipments = orders.filter((o) => o.status === 'paid').length;
  }

  if (products) {
    stats.activeProducts = products.filter((p) => p.is_active !== false).length;
  }

  return stats;
}
