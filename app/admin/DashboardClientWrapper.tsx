'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import AdminSidebar from './AdminSidebar';
import DashboardHome from './DashboardHome';
import OrdersTable from './OrdersTable';
import ShippingTable from './ShippingTable';
import CrmTable from './CrmTable';
import CartsTable from './CartsTable';
import ConsentTable from './ConsentTable';
import AnalyticsDashboard from './AnalyticsDashboard';
import JarvisDashboard from './JarvisDashboard';

interface DashboardClientWrapperProps {
  products: any[];
  orders: any[];
  customers: any[];
  carts: any[];
  consents?: any[];
  pageViews?: any[];
  dailyAnalytics?: any[];
  identities?: any[];
  stats?: any;
  initialEditId?: string;
}

export default function DashboardClientWrapper({ 
  products, 
  orders, 
  customers, 
  carts, 
  consents = [], 
  pageViews = [], 
  dailyAnalytics = [], 
  identities = [], 
  stats, 
  initialEditId 
}: DashboardClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Sync tab with URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    
    if (initialEditId) {
      const prod = products.find(p => p.id === initialEditId);
      if (prod) {
        setEditingProduct(prod);
        setActiveTab('products');
      }
    }
  }, [searchParams, initialEditId, products]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'products') setEditingProduct(null); // chiudi il form se cambi tab
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <>
      {/* Sidebar fissa a sinistra */}
      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Contenuto Principale Dinamico */}
      <div className="flex-1 overflow-y-auto h-screen bg-[#FAFAFA]">
        <div className="p-8 max-w-7xl mx-auto">
          
          {activeTab === 'dashboard' && (
            <DashboardHome products={products} orders={orders} onNavigate={handleTabChange} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              pageViews={pageViews} 
              dailyAnalytics={dailyAnalytics} 
              identities={identities} 
              products={products} 
              orders={orders} 
              carts={carts} 
            />
          )}

          {activeTab === 'jarvis' && (
            <JarvisDashboard stats={stats!} />
          )}

          {activeTab === 'orders' && (
            <OrdersTable orders={orders} />
          )}

          {activeTab === 'crm' && (
            <CrmTable customers={customers} />
          )}

          {activeTab === 'carts' && (
            <CartsTable carts={carts} />
          )}

          {activeTab === 'consents' && (
            <ConsentTable consents={consents} />
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Colonna Sinistra: Tabella (occupa tutto se non stiamo editando, altrimenti 2/3) */}
              <div className={editingProduct ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
                <ProductTable products={products} onEdit={handleEditProduct} onAddNew={() => setEditingProduct({})} />
              </div>
              
              {/* Colonna Destra: Modulo Inserimento/Modifica (visibile solo in editing/nuovo) */}
              {editingProduct && (
                <div className="lg:col-span-1 sticky top-4 self-start">
                  <ProductForm 
                    initialData={Object.keys(editingProduct).length > 0 ? editingProduct : undefined} 
                    onCancel={handleCancelEdit} 
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <ShippingTable orders={orders} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-8 border border-gray-100 rounded-sm">
              <h2 className="font-serif text-xl tracking-widest uppercase mb-4 text-[#C0A09A]">Impostazioni</h2>
              <p className="font-sans text-[11px] text-gray-500 uppercase tracking-widest">In arrivo...</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
