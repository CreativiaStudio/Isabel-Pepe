import { supabaseAdmin } from '@/lib/supabase';

export async function incrementDailyMetric({
  isProduct = false,
  isCart = false,
  isOrder = false,
  amount = 0,
}: {
  isProduct?: boolean;
  isCart?: boolean;
  isOrder?: boolean;
  amount?: number;
}) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Controlla se esiste il record del giorno
    const { data: existing } = await supabaseAdmin
      .from('daily_analytics')
      .select('*')
      .eq('date', today)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('daily_analytics')
        .update({
          total_views: (existing.total_views || 0) + 1,
          product_views: isProduct ? (existing.product_views || 0) + 1 : (existing.product_views || 0),
          cart_additions: isCart ? (existing.cart_additions || 0) + 1 : (existing.cart_additions || 0),
          orders_count: isOrder ? (existing.orders_count || 0) + 1 : (existing.orders_count || 0),
          total_revenue: isOrder ? (Number(existing.total_revenue) || 0) + amount : (Number(existing.total_revenue) || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('date', today);
    } else {
      await supabaseAdmin
        .from('daily_analytics')
        .insert({
          date: today,
          total_views: 1,
          unique_visitors: 1,
          product_views: isProduct ? 1 : 0,
          cart_additions: isCart ? 1 : 0,
          orders_count: isOrder ? 1 : 0,
          total_revenue: isOrder ? amount : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
  } catch (err) {
    console.error('Error incrementing daily analytics:', err);
  }
}
