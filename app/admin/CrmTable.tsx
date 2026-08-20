'use client';

import React, { useState } from 'react';
import { Users, Search, MessageSquare, Phone, Tag, Crown, Sparkles, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { updateCustomerNotes, updateCustomerTags } from './actions_crm';

interface CrmTableProps {
  customers: any[];
}

export default function CrmTable({ customers = [] }: CrmTableProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'privilege' | 'with_orders'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  // Helper to extract tag array safely
  const getCustomerTags = (customer: any): string[] => {
    if (!customer?.tags) return [];
    if (Array.isArray(customer.tags)) return customer.tags;
    if (typeof customer.tags === 'string') {
      try {
        const parsed = JSON.parse(customer.tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return customer.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Check if customer is a Privilege Club member
  const isPrivilegeMember = (customer: any): boolean => {
    const tags = getCustomerTags(customer);
    return tags.some((t: string) => {
      const lower = t.toLowerCase().trim();
      return (
        lower === 'club privé' ||
        lower === 'club prive' ||
        lower === 'privilege-club' ||
        lower === 'privilege club' ||
        lower === 'isabel-pepe' ||
        lower === 'vip-club'
      );
    });
  };

  // KPI Metrics
  const totalCustomers = customers.length;
  const privilegeMembersCount = customers.filter(isPrivilegeMember).length;
  const customersWithOrdersCount = customers.filter((c) => Number(c.orders_count || 0) > 0).length;

  const filtered = customers.filter((c) => {
    // Search match
    if (search) {
      const term = search.toLowerCase();
      const tagsSearch = getCustomerTags(c).join(' ').toLowerCase();
      const matchText =
        c.first_name?.toLowerCase().includes(term) ||
        c.last_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        tagsSearch.includes(term);

      if (!matchText) return false;
    }

    // Filter type
    if (filterType === 'privilege' && !isPrivilegeMember(c)) return false;
    if (filterType === 'with_orders' && Number(c.orders_count || 0) <= 0) return false;

    return true;
  });

  const handleSaveNotes = async (id: string) => {
    setIsUpdating(true);
    await updateCustomerNotes(id, notes[id] || '');

    // Convert comma separated string to array of tags
    const tagsArray = (tagsInput[id] !== undefined ? tagsInput[id] : getCustomerTags(customers.find((c) => c.id === id)).join(', '))
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await updateCustomerTags(id, tagsArray);

    setIsUpdating(false);
    alert('Dati del cliente salvati con successo');
  };

  const handleTogglePrivilegeTag = async (customer: any) => {
    const currentTags = getCustomerTags(customer);
    const hasPrivilege = isPrivilegeMember(customer);
    let newTags: string[];

    if (hasPrivilege) {
      newTags = currentTags.filter(
        (t) =>
          !['club privé', 'club prive', 'privilege-club', 'privilege club'].includes(
            t.toLowerCase().trim()
          )
      );
    } else {
      newTags = Array.from(new Set([...currentTags, 'Club Privé', 'privilege-club']));
    }

    setIsUpdating(true);
    setTagsInput((prev) => ({ ...prev, [customer.id]: newTags.join(', ') }));
    await updateCustomerTags(customer.id, newTags);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-[#FAF4F2] text-[#C0A09A] rounded-md border border-[#C0A09A]/20">
              <Users className="w-5 h-5 text-[#C0A09A]" />
            </div>
            <h1 className="text-3xl font-serif tracking-widest text-[#1A1A1A]">CRM Clienti</h1>
          </div>
          <p className="text-xs font-sans text-gray-500 tracking-wider">
            Gestisci l'anagrafica unificata, analizza il LTV e identifica i membri esclusivi del Privilege Club.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca nome, email o telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md font-sans text-xs focus:outline-none focus:border-[#C0A09A] w-full md:w-64"
            />
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tutti i Clienti ({totalCustomers})
          </button>
          <button
            onClick={() => setFilterType('privilege')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer ${
              filterType === 'privilege'
                ? 'bg-[#FAF4F2] text-[#8A5E58] border border-[#C0A09A]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#C0A09A]" />
            Club Privé ({privilegeMembersCount})
          </button>
          <button
            onClick={() => setFilterType('with_orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
              filterType === 'with_orders'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Con Ordini Effettuati ({customersWithOrdersCount})
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-sans">
          Mostrando {filtered.length} di {totalCustomers} contatti
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">Nessun cliente trovato</p>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente &amp; Privilege Status</th>
                <th className="px-6 py-4 font-medium">Contatti</th>
                <th className="px-6 py-4 font-medium">Acquisizione</th>
                <th className="px-6 py-4 font-medium text-right">LTV (Totale Speso)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => {
                const isPrivilege = isPrivilegeMember(customer);
                const tags = getCustomerTags(customer);

                return (
                  <React.Fragment key={customer.id}>
                    <tr
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setExpandedId(expandedId === customer.id ? null : customer.id);
                        if (!notes[customer.id]) {
                          setNotes((prev) => ({ ...prev, [customer.id]: customer.internal_notes || '' }));
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {customer.first_name} {customer.last_name}
                          </span>
                          {isPrivilege && (
                            <span className="inline-flex items-center gap-1 bg-[#FAF4F2] text-[#8A5E58] px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-[#C0A09A]/40 tracking-wider">
                              <Crown className="w-3 h-3 text-[#C0A09A]" /> Club Privé
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-gray-500 font-medium">
                            {customer.orders_count || 0} ordini totali
                          </span>
                          {tags.map((tag: string, i: number) => {
                            const isPrivTag = ['club privé', 'club prive', 'privilege-club', 'privilege club', 'isabel-pepe'].includes(
                              tag.toLowerCase()
                            );
                            return (
                              <span
                                key={i}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                                  isPrivTag
                                    ? 'bg-[#FAF4F2] text-[#8A5E58] border border-[#C0A09A]/30'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{customer.email}</div>
                        {customer.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-mono">
                            <Phone className="w-3 h-3 text-gray-400" /> {customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <span className="uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-sm text-[10px] font-medium">
                          {customer.acquisition_source || 'Sconosciuto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-serif text-base text-[#1A1A1A] font-semibold">
                          {formatPrice(Number(customer.total_spent))}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Ultimo acq: {formatDate(customer.last_purchase_date)}
                        </div>
                      </td>
                    </tr>

                    {expandedId === customer.id && (
                      <tr className="bg-gray-50/90 border-b border-gray-100">
                        <td colSpan={4} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Customer details & VIP membership */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-serif text-sm tracking-widest uppercase text-[#C0A09A]">
                                  Identità &amp; Privilege Club
                                </h4>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePrivilegeTag(customer);
                                  }}
                                  disabled={isUpdating}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                                    isPrivilege
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                      : 'bg-[#FAF4F2] text-[#8A5E58] hover:bg-[#F5ECE8] border border-[#C0A09A]'
                                  }`}
                                >
                                  <Crown className="w-3 h-3 text-[#C0A09A]" />
                                  {isPrivilege ? 'Rimuovi da Club Privé' : 'Aggiungi a Club Privé'}
                                </button>
                              </div>

                              <div className="space-y-2 text-xs text-gray-600 bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
                                <p><strong>Registrato il:</strong> {formatDate(customer.created_at)}</p>
                                {customer.campaign_name && (
                                  <p><strong>Campagna Ads:</strong> <span className="font-mono text-gray-700">{customer.campaign_name}</span></p>
                                )}
                                <p>
                                  <strong>Membro Privilege Club:</strong>{' '}
                                  {isPrivilege ? (
                                    <span className="text-emerald-700 font-semibold">Sì (Attivo)</span>
                                  ) : (
                                    <span className="text-gray-400">Non ancora iscritto</span>
                                  )}
                                </p>
                              </div>

                              <div className="mt-4">
                                <h4 className="font-serif text-xs tracking-widest uppercase mb-2 text-[#C0A09A] flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" /> Tag Cliente
                                </h4>
                                <input
                                  type="text"
                                  className="w-full border border-gray-200 p-2 text-xs text-gray-900 placeholder-gray-400 rounded-md focus:border-[#C0A09A] outline-none transition-colors bg-white"
                                  placeholder="Es. VIP, Club Privé, ama oro giallo (separati da virgola)"
                                  value={
                                    tagsInput[customer.id] !== undefined
                                      ? tagsInput[customer.id]
                                      : tags.join(', ')
                                  }
                                  onChange={(e) =>
                                    setTagsInput((prev) => ({ ...prev, [customer.id]: e.target.value }))
                                  }
                                />
                              </div>

                              {customer.phone && (
                                <a
                                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-[10px] uppercase tracking-widest transition-colors rounded-md shadow-2xs"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Contatta su WhatsApp
                                </a>
                              )}
                            </div>

                            {/* Right Column: Staff Internal Notes */}
                            <div>
                              <h4 className="font-serif text-sm tracking-widest uppercase mb-4 text-[#C0A09A]">
                                Note Interne (Solo Staff Atelier)
                              </h4>
                              <textarea
                                className="w-full h-32 border border-gray-200 p-3 text-xs text-gray-900 placeholder-gray-400 rounded-md focus:border-[#C0A09A] outline-none transition-colors bg-white"
                                placeholder="Es. Cliente Privilege VIP, ha acquistato Collana Éclipse, preferisce essere contattata su WhatsApp per le nuove uscite..."
                                value={notes[customer.id] || ''}
                                onChange={(e) => setNotes((prev) => ({ ...prev, [customer.id]: e.target.value }))}
                              />
                              <button
                                onClick={() => handleSaveNotes(customer.id)}
                                disabled={isUpdating}
                                className="mt-2 bg-[#1A1A1A] hover:bg-[#C0A09A] text-white px-5 py-2.5 text-[10px] uppercase tracking-widest rounded-md transition-colors shadow-2xs cursor-pointer"
                              >
                                {isUpdating ? 'Salvataggio...' : 'Salva Modifiche CRM'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
