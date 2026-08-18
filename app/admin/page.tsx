import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClientWrapper from './DashboardClientWrapper';
import { Package } from 'lucide-react';

const ADMIN_EMAILS = ['sviluppo@creativiastudio.com', 'info@isabelpepe.com', 'mario@isabelpepe.com'];

export const revalidate = 0; // Evita la cache, mostra sempre i dati in tempo reale

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  // PROTEZIONE SERVER-SIDE: Temporaneamente disabilitata per dev/demo locale
  // const supabaseAuth = await createClient();
  // const { data: { user } } = await supabaseAuth.auth.getUser();
  // if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
  //   redirect('/login');
  // }

  const resolvedParams = await searchParams;
  const editId = resolvedParams.edit;

  // Peschiamo i dati dal database con fallback in caso di Supabase in pausa/offline
  let products: any[] = [];
  let orders: any[] = [];
  let customers: any[] = [];
  let carts: any[] = [];
  let consents: any[] = [];
  let pageViews: any[] = [];
  let dailyAnalytics: any[] = [];
  let totalViews = 0;

  try {
    const { data: p } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    products = p || [];

    const { data: o } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    orders = o || [];

    const { data: c } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('last_purchase_date', { ascending: false, nullsFirst: false });
    customers = c || [];

    const { data: ca } = await supabaseAdmin
      .from('abandoned_carts')
      .select('*')
      .order('created_at', { ascending: false });
    carts = ca || [];

    const { data: cs } = await supabaseAdmin
      .from('cookie_consents')
      .select('*')
      .order('created_at', { ascending: false });
    consents = cs || [];

    const { data: da } = await supabaseAdmin
      .from('daily_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(365);
    dailyAnalytics = da || [];

    const { data: pv, count } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1000);
    
    pageViews = pv || [];
    totalViews = count || pageViews.length || 0;
  } catch (err) {
    console.error('Supabase query error (project might be paused):', err);
  }

  const activeCartsCount = carts.filter(c => c.status === 'abandoned').length || 0;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const todaySales = orders.filter(o => new Date(o.created_at) >= today).reduce((acc, o) => acc + (o.amount_total || 0), 0) || 0;

  const stats = {
    totalViews: totalViews || 0,
    activeCarts: activeCartsCount,
    todaySales: todaySales
  };

  return (
    <div className="h-screen bg-[#FAFAFA] flex font-sans overflow-hidden">
      <DashboardClientWrapper 
        products={products || []} 
        orders={orders || []} 
        customers={customers || []}
        carts={carts || []}
        consents={consents || []}
        pageViews={pageViews || []}
        dailyAnalytics={dailyAnalytics || []}
        stats={stats}
        initialEditId={editId} 
      />
    </div>
  );
}
