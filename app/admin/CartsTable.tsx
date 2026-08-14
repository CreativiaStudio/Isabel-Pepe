import React, { useState } from 'react';
import { ShoppingCart, MessageSquare, Mail, XCircle } from 'lucide-react';
import { markCartAsLost } from './actions_carts';

interface CartsTableProps {
  carts: any[];
}

export default function CartsTable({ carts }: CartsTableProps) {
  const [filter, setFilter] = useState('abandoned');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(dateString));
  };

  const filtered = carts.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    return true;
  });

  const handleMarkLost = async (id: string) => {
    if(confirm("Sei sicuro di voler contrassegnare questo carrello come perso?")) {
      setIsUpdating(true);
      await markCartAsLost(id);
      setIsUpdating(false);
    }
  };

  const potentialRevenue = carts
    .filter(c => c.status === 'abandoned')
    .reduce((sum, c) => sum + Number(c.total_amount), 0);

  const recoveredRevenue = carts
    .filter(c => c.status === 'recovered')
    .reduce((sum, c) => sum + Number(c.total_amount), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">Carrelli Abbandonati</h1>
          <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">Recupera vendite contattando i clienti che non hanno concluso il checkout</p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-sm font-sans text-[11px] uppercase tracking-widest focus:outline-none focus:border-[#C0A09A]"
        >
          <option value="all">Tutti i carrelli</option>
          <option value="abandoned">Da Recuperare (Abbandonati)</option>
          <option value="recovered">Recuperati (Pagati)</option>
          <option value="lost">Persi (Ignorati)</option>
        </select>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-50 p-6 rounded-sm border border-red-100">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-red-400 mb-2">Potenziale da Recuperare</p>
          <p className="font-serif text-3xl text-red-600">{formatPrice(potentialRevenue)}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-sm border border-green-100">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-green-500 mb-2">Fatturato Recuperato</p>
          <p className="font-serif text-3xl text-green-600">{formatPrice(recoveredRevenue)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">Nessun carrello trovato</p>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Contatto</th>
                <th className="px-6 py-4 font-medium">Data Abbandono</th>
                <th className="px-6 py-4 font-medium">Contenuto Carrello</th>
                <th className="px-6 py-4 font-medium">Valore</th>
                <th className="px-6 py-4 font-medium text-right">Azioni Recupero</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(cart => (
                <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cart.email}</div>
                    {cart.phone && <div className="text-xs text-gray-500 mt-1">{cart.phone}</div>}
                    <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-sm ${
                      cart.status === 'abandoned' ? 'bg-orange-100 text-orange-800' :
                      cart.status === 'recovered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {cart.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {formatDate(cart.created_at)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <ul className="space-y-1">
                      {cart.cart_items?.map((item: any, i: number) => (
                        <li key={i}>• {item.quantity}x {item.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-serif text-base">
                    {formatPrice(Number(cart.total_amount))}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {cart.status === 'abandoned' && (
                      <>
                        <a 
                          href={`mailto:${cart.email}?subject=Hai dimenticato qualcosa nel carrello?&body=Ciao! Abbiamo notato che hai lasciato alcuni gioielli nel carrello. Hai bisogno di aiuto?`}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-[9px] uppercase tracking-widest transition-colors rounded-sm"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </a>
                        {cart.phone && (
                          <a 
                            href={`https://wa.me/${cart.phone.replace(/[^0-9]/g, '')}?text=Ciao!%20Ti%20scrivo%20da%20Isabel%20Pepe.%20Ho%20visto%20che%20non%20hai%20completato%20il%20tuo%20ordine,%20posso%20aiutarti?`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-[9px] uppercase tracking-widest transition-colors rounded-sm"
                          >
                            <MessageSquare className="w-3 h-3" /> WA
                          </a>
                        )}
                        <button 
                          onClick={() => handleMarkLost(cart.id)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-red-500 px-2 py-1.5 transition-colors"
                          title="Segna come perso"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
