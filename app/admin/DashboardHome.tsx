import React from 'react';
import { CreditCard, Package, Truck, Activity } from 'lucide-react';

interface DashboardHomeProps {
  products: any[];
  orders: any[];
  onNavigate: (tab: string) => void;
}

export default function DashboardHome({ products, orders, onNavigate }: DashboardHomeProps) {
  // Calcolo KPI
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount_total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'paid');
  const activeProducts = products.filter(p => p.is_active !== false);
  const lowStockProducts = products.filter(p => p.stock < 5 && p.is_active !== false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">Dashboard</h1>
        <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">Riepilogo delle performance del negozio</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500">Fatturato</h3>
            <CreditCard className="w-5 h-5 text-[#C0A09A]" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{formatPrice(totalRevenue)}</p>
        </div>

        <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm cursor-pointer hover:border-gray-300 transition-colors" onClick={() => onNavigate('orders')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500">Ordini Totali</h3>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{orders.length}</p>
        </div>

        <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm cursor-pointer hover:border-gray-300 transition-colors" onClick={() => onNavigate('shipping')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500">Da Spedire</h3>
            <Truck className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{pendingOrders.length}</p>
        </div>

        <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm cursor-pointer hover:border-gray-300 transition-colors" onClick={() => onNavigate('products')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-500">Prodotti Attivi</h3>
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A1A]">{activeProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ultimi Ordini */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-serif text-lg tracking-widest uppercase text-[#1A1A1A]">Ultimi Ordini</h3>
            <button onClick={() => onNavigate('orders')} className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C0A09A] hover:text-gray-900 transition-colors">Vedi Tutti</button>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-sans text-xs uppercase tracking-widest">
              Nessun ordine presente
            </div>
          ) : (
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Totale</th>
                  <th className="px-6 py-3 font-medium">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 font-serif">{formatPrice(Number(order.amount_total))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm ${
                        order.status === 'paid' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'paid' ? 'Da Spedire' : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Prodotti Low Stock */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-serif text-lg tracking-widest uppercase text-[#1A1A1A]">Scorte in Esaurimento</h3>
            <button onClick={() => onNavigate('products')} className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C0A09A] hover:text-gray-900 transition-colors">Vedi Catalogo</button>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-sans text-xs uppercase tracking-widest">
              Tutti i prodotti hanno buone scorte
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.slice(0, 5).map(prod => (
                <div key={prod.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {prod.image_primary ? (
                      <img src={prod.image_primary} className="w-10 h-10 object-cover bg-gray-100 rounded-sm" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-sans text-sm font-medium text-gray-900">{prod.name}</div>
                      <div className="font-sans text-[10px] text-gray-500 uppercase tracking-widest mt-1">SKU: {prod.sku || '-'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-xl text-red-500">{prod.stock}</div>
                    <div className="font-sans text-[9px] uppercase tracking-widest text-gray-400">Pezzi</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
