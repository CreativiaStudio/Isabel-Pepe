import React, { useState } from 'react';
import { Truck, Check, Copy, ExternalLink, Package } from 'lucide-react';
import { updateOrderStatus } from './actions_orders';
import { createPacklinkShipmentAction } from './actions_packlink';

interface ShippingTableProps {
  orders: any[];
}

export default function ShippingTable({ orders }: ShippingTableProps) {
  // Mostriamo solo ordini pagati o spediti
  const shippingOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped');
  
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [packlinkMsg, setPacklinkMsg] = useState<Record<string, string>>({});

  const handleTrackingChange = (id: string, val: string) => {
    setTrackingInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleShipOrder = async (id: string) => {
    setIsUpdating(id);
    const trackingCode = trackingInputs[id] || '';
    await updateOrderStatus(id, 'shipped', trackingCode);
    setIsUpdating(null);
  };

  const handleMarkDelivered = async (id: string) => {
    setIsUpdating(id);
    await updateOrderStatus(id, 'delivered');
    setIsUpdating(null);
  };

  const handleCreatePacklink = async (id: string) => {
    setIsUpdating(id);
    const res = await createPacklinkShipmentAction(id);
    if (res.error) {
      setPacklinkMsg(prev => ({ ...prev, [id]: `❌ ${res.error}` }));
    } else if (res.reference) {
      setPacklinkMsg(prev => ({ ...prev, [id]: `✓ Ref: ${res.reference}` }));
    }
    setIsUpdating(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiato: ' + text);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">Spedizioni</h1>
          <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">Gestisci le spedizioni e genera etichette Packlink PRO</p>
        </div>
        <a 
          href="https://pro.packlink.it/private/shipments" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-3 py-2 rounded border border-blue-200 font-medium flex items-center gap-1.5 transition"
        >
          <Package className="w-4 h-4" /> Apri Dashboard Packlink PRO <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        {shippingOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Truck className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">Nessun ordine da spedire</p>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente & Indirizzo</th>
                <th className="px-6 py-4 font-medium">Articoli</th>
                <th className="px-6 py-4 font-medium">Tracking / Packlink</th>
                <th className="px-6 py-4 font-medium text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shippingOrders.map(order => {
                const packlinkRefMatch = order.notes?.match(/Packlink PRO Ref: (IT[A-Z0-9]+)/);
                const packlinkRef = packlinkRefMatch ? packlinkRefMatch[1] : null;

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1">{order.customer_name}</div>
                      {order.shipping_address ? (
                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                          <span>{order.shipping_address.line1}</span>
                          <span>{order.shipping_address.postal_code} {order.shipping_address.city}</span>
                          <button 
                            onClick={() => copyToClipboard(`${order.customer_name}\n${order.shipping_address.line1}\n${order.shipping_address.postal_code} ${order.shipping_address.city}`)}
                            className="text-[#C0A09A] hover:text-[#1A1A1A] inline-flex items-center gap-1 w-fit mt-1 uppercase tracking-widest text-[9px]"
                          >
                            <Copy className="w-3 h-3" /> Copia indirizzo
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-red-400">Nessun indirizzo</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {order.items?.map((item: any, i: number) => (
                          <li key={i}>• {item.quantity}x {item.name}</li>
                        ))}
                      </ul>
                    </td>

                    <td className="px-6 py-4">
                      {order.status === 'shipped' ? (
                        <div className="text-sm font-medium">
                          {order.tracking_code || <span className="text-gray-400 italic">Nessun tracking inserito</span>}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            placeholder="Inserisci codice tracking..." 
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#C0A09A]"
                          />
                          {packlinkRef || packlinkMsg[order.id] ? (
                            <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              <span>📦 {packlinkRef ? `Packlink: ${packlinkRef}` : packlinkMsg[order.id]}</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        {order.status === 'shipped' ? (
                          <button 
                            onClick={() => handleMarkDelivered(order.id)}
                            disabled={isUpdating === order.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-[10px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3" /> Segna Consegnato
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleCreatePacklink(order.id)}
                              disabled={isUpdating === order.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[10px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              <Package className="w-3 h-3" /> 1-Click Packlink
                            </button>
                            <button 
                              onClick={() => handleShipOrder(order.id)}
                              disabled={isUpdating === order.id}
                              className="bg-[#1A1A1A] hover:bg-[#C0A09A] text-white px-3 py-1.5 text-[10px] uppercase tracking-widest rounded transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              <Truck className="w-3 h-3" /> Segna Spedito
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
