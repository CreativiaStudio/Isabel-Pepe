'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Download,
  Users,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Tag,
  Phone,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Crown
} from 'lucide-react';
import { toggleSubscriberStatus, NewsletterSubscriber } from './actions_newsletter';

interface NewsletterTableProps {
  subscribers: NewsletterSubscriber[];
}

export default function NewsletterTable({ subscribers: initialSubscribers = [] }: NewsletterTableProps) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'popup_vip' | 'footer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sync if props update
  React.useEffect(() => {
    setSubscribers(initialSubscribers);
  }, [initialSubscribers]);

  // KPI Calculations
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.is_active).length;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;
  const activeRate = totalSubscribers > 0 ? Math.round((activeSubscribers / totalSubscribers) * 100) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysCount = subscribers.filter(
    (s) => new Date(s.created_at || s.consent_given_at || 0) >= thirtyDaysAgo
  ).length;

  const popupVipCount = subscribers.filter((s) => s.source === 'popup_vip').length;
  const footerCount = subscribers.filter((s) => s.source === 'footer').length;
  const otherSourceCount = totalSubscribers - popupVipCount - footerCount;

  // Filtered subscribers
  const filteredSubscribers = subscribers.filter((item) => {
    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchEmail = item.email?.toLowerCase().includes(term);
      const matchName =
        (item.first_name && item.first_name.toLowerCase().includes(term)) ||
        (item.last_name && item.last_name.toLowerCase().includes(term));
      const matchPhone = item.phone && item.phone.includes(term);
      const matchUtm =
        (item.utm_source && item.utm_source.toLowerCase().includes(term)) ||
        (item.utm_campaign && item.utm_campaign.toLowerCase().includes(term));
      const matchIp = item.ip_address && item.ip_address.includes(term);

      if (!matchEmail && !matchName && !matchPhone && !matchUtm && !matchIp) {
        return false;
      }
    }

    // Source match
    if (sourceFilter === 'popup_vip' && item.source !== 'popup_vip') return false;
    if (sourceFilter === 'footer' && item.source !== 'footer') return false;

    // Status match
    if (statusFilter === 'active' && !item.is_active) return false;
    if (statusFilter === 'inactive' && item.is_active) return false;

    return true;
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  // Toggle active status
  const handleToggleStatus = async (subscriber: NewsletterSubscriber) => {
    setIsUpdatingId(subscriber.id);
    try {
      const res = await toggleSubscriberStatus(subscriber.id, subscriber.is_active);
      if (res.success) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === subscriber.id ? { ...s, is_active: !s.is_active } : s))
        );
      } else {
        alert('Errore durante l\'aggiornamento dello stato: ' + res.error);
      }
    } catch (err: any) {
      alert('Errore di connessione: ' + err.message);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // 1-Click Excel-safe UTF-8 BOM CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const BOM = '\uFEFF';
      const headers = [
        'Email',
        'Nome',
        'Cognome',
        'Telefono',
        'Data Iscrizione',
        'Fonte',
        'UTM Source',
        'UTM Campaign',
        'Stato',
        'IP',
      ];

      const escapeField = (val: any): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = filteredSubscribers.map((s) => [
        escapeField(s.email),
        escapeField(s.first_name || ''),
        escapeField(s.last_name || ''),
        escapeField(s.phone || ''),
        escapeField(s.created_at || s.consent_given_at || ''),
        escapeField(s.source || ''),
        escapeField(s.utm_source || ''),
        escapeField(s.utm_campaign || ''),
        escapeField(s.is_active ? 'Attivo' : 'Disiscritto'),
        escapeField(s.ip_address || ''),
      ]);

      const csvContent =
        BOM +
        headers.join(',') +
        '\n' +
        rows.map((row) => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `isabel_pepe_privilege_club_subscribers_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('CSV export failed:', err);
      alert('Errore durante l\'esportazione del file CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-[#FAF4F2] text-[#C0A09A] rounded-md border border-[#C0A09A]/20">
              <Crown className="w-5 h-5 text-[#C0A09A]" />
            </div>
            <h1 className="font-serif text-3xl text-[#1A1A1A] tracking-wider">
              Privilege Club & Newsletter
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-sans tracking-wide">
            Gestisci la lista esclusiva di iscritti all'Atelier Privé, analizza l'acquisizione ed esporta i contatti per le campagne.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={isExporting || filteredSubscribers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#C0A09A] disabled:opacity-50 text-white rounded-md text-xs font-sans uppercase tracking-widest transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Esportazione...' : 'Esporta CSV (Excel UTF-8)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Subscribers */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5ECE8]/40 to-transparent rounded-bl-full pointer-events-none" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block mb-1">
            Membri Attivi Privilege Club
          </span>
          <div className="text-3xl font-serif text-[#1A1A1A] font-semibold flex items-baseline gap-2">
            {activeSubscribers}
            <span className="text-xs font-sans text-gray-400 font-normal">/ {totalSubscribers} totali</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasso Attivo: {activeRate}%</span>
          </div>
        </div>

        {/* 30 Days New Subscriptions */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block mb-1">
            Nuove Iscrizioni (30 Giorni)
          </span>
          <div className="text-3xl font-serif text-[#C0A09A] font-semibold">
            {last30DaysCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-sans">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Crescita recente costante</span>
          </div>
        </div>

        {/* Popup VIP Source */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block mb-1">
            Canale Modal VIP (10% Off)
          </span>
          <div className="text-3xl font-serif text-[#1A1A1A] font-semibold">
            {popupVipCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#C0A09A]" />
            <span>{totalSubscribers > 0 ? Math.round((popupVipCount / totalSubscribers) * 100) : 0}% del totale iscritti</span>
          </div>
        </div>

        {/* Footer Atelier Privé Source */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold block mb-1">
            Canale Footer Atelier Privé
          </span>
          <div className="text-3xl font-serif text-[#1A1A1A] font-semibold">
            {footerCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-sans">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span>{totalSubscribers > 0 ? Math.round((footerCount / totalSubscribers) * 100) : 0}% del totale iscritti</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca email, nome, telefono o UTM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md font-sans text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Source filters */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                sourceFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutte le fonti
            </button>
            <button
              onClick={() => setSourceFilter('popup_vip')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                sourceFilter === 'popup_vip' ? 'bg-white text-[#8A5E58] shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Popup VIP ({popupVipCount})
            </button>
            <button
              onClick={() => setSourceFilter('footer')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                sourceFilter === 'footer' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Footer ({footerCount})
            </button>
          </div>

          {/* Status filters */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutti gli stati
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Attivi ({activeSubscribers})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-sm font-sans font-medium transition-colors ${
                statusFilter === 'inactive' ? 'bg-white text-rose-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Disiscritti ({inactiveSubscribers})
            </button>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-medium">Iscritto / Contatto</th>
                <th className="px-5 py-4 font-medium">Fonte Acquisizione</th>
                <th className="px-5 py-4 font-medium">Attribuzione UTM</th>
                <th className="px-5 py-4 font-medium">Data Consenso</th>
                <th className="px-5 py-4 font-medium text-center">Stato</th>
                <th className="px-5 py-4 font-medium text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#C0A09A]/40" />
                    <p className="font-serif text-sm text-gray-700">Nessun iscritto trovato</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                      Gli iscritti al Privilege Club appariranno qui automaticamente.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ');

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50/80 transition-colors">
                        {/* Subscriber info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{item.email}</span>
                            <span className="inline-flex items-center gap-1 bg-[#FAF4F2] text-[#8A5E58] px-2 py-0.5 rounded-full text-[9px] font-semibold border border-[#C0A09A]/30">
                              <Crown className="w-2.5 h-2.5 text-[#C0A09A]" /> Club Privé
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 text-[11px] mt-1">
                            {fullName && (
                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <User className="w-3 h-3 text-gray-400" />
                                {fullName}
                              </span>
                            )}
                            {item.phone && (
                              <span className="flex items-center gap-1 text-gray-500 font-mono text-[10px]">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {item.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-4">
                          {item.source === 'popup_vip' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#FAF4F2] text-[#8A5E58] border border-[#C0A09A]/30">
                              <Sparkles className="w-3 h-3 text-[#C0A09A]" /> Modal VIP
                            </span>
                          ) : item.source === 'footer' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                              <Layers className="w-3 h-3 text-gray-400" /> Footer Atelier
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 uppercase">
                              {item.source || 'Diretto'}
                            </span>
                          )}
                        </td>

                        {/* UTM */}
                        <td className="px-5 py-4">
                          {item.utm_source || item.utm_campaign ? (
                            <div className="space-y-0.5">
                              {item.utm_source && (
                                <div className="text-[11px] font-medium text-gray-800">
                                  {item.utm_source}
                                  {item.utm_medium && <span className="text-gray-400"> / {item.utm_medium}</span>}
                                </div>
                              )}
                              {item.utm_campaign && (
                                <div className="text-[10px] text-[#8A5E58] font-mono truncate max-w-[180px]" title={item.utm_campaign}>
                                  campagna: {item.utm_campaign}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px] font-light">Diretto / Organico</span>
                          )}
                        </td>

                        {/* Consent Date */}
                        <td className="px-5 py-4 text-gray-600 font-mono text-[11px]">
                          {formatDate(item.consent_given_at || item.created_at)}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4 text-center">
                          {item.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Attivo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Disiscritto
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              disabled={isUpdatingId === item.id}
                              className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                                item.is_active
                                  ? 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isUpdatingId === item.id
                                ? '...'
                                : item.is_active
                                ? 'Disattiva'
                                : 'Riattiva'}
                            </button>

                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                              title="Dettagli audit GDPR"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded audit trail details */}
                      {isExpanded && (
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
                              {/* Audit info */}
                              <div>
                                <h4 className="font-serif text-xs tracking-wider uppercase text-[#C0A09A] mb-2 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Conformità Legale GDPR
                                </h4>
                                <div className="space-y-1 text-[11px]">
                                  <p><strong>Consenso ID:</strong> <span className="font-mono text-gray-500">{item.consent_id || 'N/A'}</span></p>
                                  <p><strong>Visitor ID:</strong> <span className="font-mono text-gray-500">{item.visitor_id || 'N/A'}</span></p>
                                  <p><strong>IP Address:</strong> <span className="font-mono text-gray-500">{item.ip_address || 'Anonimo'}</span></p>
                                </div>
                              </div>

                              {/* UTM full breakdown */}
                              <div>
                                <h4 className="font-serif text-xs tracking-wider uppercase text-[#C0A09A] mb-2 flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" /> Tracciamento Marketing
                                </h4>
                                <div className="space-y-1 text-[11px]">
                                  <p><strong>Sorgente:</strong> {item.utm_source || '-'}</p>
                                  <p><strong>Medium:</strong> {item.utm_medium || '-'}</p>
                                  <p><strong>Campagna:</strong> {item.utm_campaign || '-'}</p>
                                  {item.utm_content && <p><strong>Contenuto:</strong> {item.utm_content}</p>}
                                  {item.utm_term && <p><strong>Termine / Chiave:</strong> {item.utm_term}</p>}
                                </div>
                              </div>

                              {/* Technical & Timestamps */}
                              <div>
                                <h4 className="font-serif text-xs tracking-wider uppercase text-[#C0A09A] mb-2 flex items-center gap-1">
                                  <Globe className="w-3.5 h-3.5" /> Dati Dispositivo
                                </h4>
                                <div className="space-y-1 text-[11px]">
                                  <p><strong>Registrazione:</strong> {formatDate(item.created_at)}</p>
                                  <p><strong>Ultimo Aggiornamento:</strong> {formatDate(item.updated_at)}</p>
                                  <p className="truncate max-w-[280px]" title={item.user_agent || ''}>
                                    <strong>User-Agent:</strong> <span className="font-mono text-gray-500">{item.user_agent || '-'}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
