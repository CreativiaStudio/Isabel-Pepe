import React, { useState } from 'react';
import { Users, Search, MessageSquare, Phone, Tag } from 'lucide-react';
import { updateCustomerNotes, updateCustomerTags } from './actions_crm';

interface CrmTableProps {
  customers: any[];
}

export default function CrmTable({ customers }: CrmTableProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('it-IT', { 
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(dateString));
  };

  const filtered = customers.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    const tagsSearch = c.tags?.join(' ').toLowerCase() || '';
    return (
      c.first_name?.toLowerCase().includes(term) ||
      c.last_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      tagsSearch.includes(term)
    );
  });

  const handleSaveNotes = async (id: string) => {
    setIsUpdating(true);
    await updateCustomerNotes(id, notes[id] || '');
    
    // Convert comma separated string to array of tags
    const tagsArray = (tagsInput[id] || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
      
    await updateCustomerTags(id, tagsArray);
    
    setIsUpdating(false);
    alert('Dati del cliente salvati con successo');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">CRM Clienti</h1>
          <p className="text-sm font-sans text-gray-500 tracking-wider mt-1">Gestisci l'anagrafica e analizza il LTV dei tuoi clienti</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca nome, email o telefono..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-sm font-sans text-sm focus:outline-none focus:border-[#C0A09A] w-full md:w-64"
            />
          </div>
        </div>
      </header>

      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">Nessun cliente trovato</p>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contatti</th>
                <th className="px-6 py-4 font-medium">Acquisizione</th>
                <th className="px-6 py-4 font-medium text-right">LTV (Totale Speso)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(customer => (
                <React.Fragment key={customer.id}>
                  <tr 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setExpandedId(expandedId === customer.id ? null : customer.id);
                      if (!notes[customer.id]) {
                        setNotes(prev => ({ ...prev, [customer.id]: customer.internal_notes || '' }));
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        {customer.orders_count} ordini totali
                        {customer.tags?.map((tag: string, i: number) => (
                          <span key={i} className="bg-[#FCE5E7] text-[#D81E5B] px-2 py-0.5 rounded-full text-[9px]">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{customer.email}</div>
                      {customer.phone && <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {customer.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      <span className="uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-sm">
                        {customer.acquisition_source || 'Sconosciuto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-serif text-base text-[#1A1A1A]">{formatPrice(Number(customer.total_spent))}</div>
                      <div className="text-[10px] text-gray-400 mt-1">Ultimo acq: {formatDate(customer.last_purchase_date)}</div>
                    </td>
                  </tr>
                  
                  {expandedId === customer.id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={4} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Info */}
                          <div>
                            <h4 className="font-serif text-sm tracking-widest uppercase mb-4 text-[#C0A09A]">Dettagli Aggiuntivi</h4>
                            <div className="space-y-3 text-sm text-gray-600">
                              <p><strong>Registrato il:</strong> {formatDate(customer.created_at)}</p>
                              {customer.campaign_name && <p><strong>Campagna Ads:</strong> {customer.campaign_name}</p>}
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="font-serif text-sm tracking-widest uppercase mb-2 text-[#C0A09A] flex items-center gap-1">
                                <Tag className="w-4 h-4" /> Tag Cliente
                              </h4>
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Tag Dinamici</p>
                              <input 
                                type="text"
                                className="w-full border border-gray-200 p-2 text-sm text-gray-900 placeholder-gray-400 rounded-sm focus:border-[#C0A09A] outline-none transition-colors"
                                placeholder="Es. VIP, ama oro giallo (separati da virgola)"
                                value={tagsInput[customer.id] !== undefined ? tagsInput[customer.id] : (customer.tags?.join(', ') || '')}
                                onChange={(e) => setTagsInput(prev => ({ ...prev, [customer.id]: e.target.value }))}
                              />
                            </div>

                            {customer.phone && (
                              <a 
                                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-[10px] uppercase tracking-widest transition-colors rounded-sm"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Contatta su WhatsApp
                              </a>
                            )}
                          </div>

                          {/* Note CRM */}
                          <div>
                            <h4 className="font-serif text-sm tracking-widest uppercase mb-4 text-[#C0A09A]">Note Interne (Solo Staff)</h4>
                            <textarea 
                              className="w-full h-24 border border-gray-200 p-3 text-sm text-gray-900 placeholder-gray-400 rounded-sm focus:border-[#C0A09A] outline-none transition-colors"
                              placeholder="Es. Cliente VIP, preferisce gioielli in oro..."
                              value={notes[customer.id] || ''}
                              onChange={(e) => setNotes(prev => ({ ...prev, [customer.id]: e.target.value }))}
                            />
                            <button 
                              onClick={() => handleSaveNotes(customer.id)}
                              disabled={isUpdating}
                              className="mt-2 bg-[#1A1A1A] hover:bg-[#C0A09A] text-white px-4 py-2 text-[10px] uppercase tracking-widest rounded-sm transition-colors"
                            >
                              Salva Modifiche
                            </button>
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
