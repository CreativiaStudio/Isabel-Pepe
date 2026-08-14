import React, { useState } from 'react';
import { ShoppingCart, Search, Eye, ExternalLink } from 'lucide-react';
import { updateOrderStatus } from './actions_orders';

interface OrdersTableProps {
  orders: any[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(dateString));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    await updateOrderStatus(id, newStatus);
    setIsUpdating(null);
  };

  const filteredOrders = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.customer_name?.toLowerCase().includes(search.toLowerCase()) && 
        !o.customer_email?.toLowerCase().includes(search.toLowerCase()) &&
        !o.stripe_session_id?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">Ordini</h1>
          <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">Gestisci gli ordini dei clienti</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca per nome, email o ID Stripe..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-sm font-sans text-sm focus:outline-none focus:border-[#C0A09A] w-full md:w-64"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-sm font-sans text-[11px] uppercase tracking-widest focus:outline-none focus:border-[#C0A09A]"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In Attesa (Non Pagati)</option>
            <option value="paid">Da Spedire (Pagati)</option>
            <option value="shipped">Spediti</option>
            <option value="delivered">Consegnati</option>
          </select>
        </div>
      </header>

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">Nessun ordine trovato</p>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Totale</th>
                <th className="px-6 py-4 font-medium">Stato</th>
                <th className="px-6 py-4 font-medium text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 font-serif text-base">{formatPrice(Number(order.amount_total))}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating === order.id}
                        className={`text-[10px] uppercase tracking-wider rounded-sm px-2 py-1 border-0 focus:ring-2 focus:ring-[#C0A09A] ${
                          order.status === 'paid' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">In Attesa</option>
                        <option value="paid">Da Spedire</option>
                        <option value="shipped">Spedito</option>
                        <option value="delivered">Consegnato</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C0A09A] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Dettagli
                      </button>
                    </td>
                  </tr>
                  
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Articoli */}
                          <div>
                            <h4 className="font-serif text-sm tracking-widest uppercase mb-4 text-[#C0A09A]">Articoli Acquistati</h4>
                            <div className="space-y-3">
                              {order.items && order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span className="font-serif">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Spedizione & Tracking */}
                          <div>
                            <h4 className="font-serif text-sm tracking-widest uppercase mb-4 text-[#C0A09A]">Dettagli Spedizione</h4>
                            {order.shipping_address ? (
                              <div className="text-sm text-gray-600 mb-4 leading-relaxed">
                                {order.shipping_address.line1}<br />
                                {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
                                {order.shipping_address.postal_code} {order.shipping_address.city} ({order.shipping_address.state})<br />
                                {order.shipping_address.country}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic mb-4">Nessun indirizzo fornito</div>
                            )}

                            <div className="space-y-2 text-xs text-gray-500">
                              <p><strong>Stripe ID:</strong> <a href={`https://dashboard.stripe.com/payments/${order.stripe_session_id}`} target="_blank" className="text-[#C0A09A] hover:underline inline-flex items-center gap-1">{order.stripe_session_id} <ExternalLink className="w-3 h-3"/></a></p>
                              {order.tracking_code && <p><strong>Tracking:</strong> {order.tracking_code}</p>}
                              {order.shipped_at && <p><strong>Data spedizione:</strong> {formatDate(order.shipped_at)}</p>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
