'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Tag, 
  ArrowUpRight, 
  ShieldCheck, 
  MapPin, 
  X, 
  Check, 
  Clock, 
  Globe, 
  Smartphone, 
  Laptop, 
  Tablet,
  Sparkles
} from 'lucide-react';
import { VisitorIdentityRecord } from '@/types/analytics';

interface StreamItem {
  id: string;
  session_id?: string;
  visitor_id: string;
  identity?: VisitorIdentityRecord | null;
  started_at: string;
  last_active_at?: string;
  duration_seconds: number;
  page_views_count: number;
  entry_path: string;
  current_path: string;
  referrer?: string | null;
  referrer_host?: string | null;
  traffic_channel?: string;
  utm_campaign?: string | null;
  utm_source?: string | null;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string | null;
  os?: string | null;
  country?: string;
  city?: string | null;
  region?: string | null;
  consent_id?: string | null;
  is_bounce?: boolean;
  viewed_product?: boolean;
  added_to_cart?: boolean;
  started_checkout?: boolean;
  completed_purchase?: boolean;
  order_id?: string | null;
  revenue?: number;
}

interface LiveVisitorStreamProps {
  stream: StreamItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
  onIdentityUpdated?: (visitorId: string, identity: VisitorIdentityRecord) => void;
  isLoading?: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹',
  CH: '🇨🇭',
  DE: '🇩🇪',
  FR: '🇫🇷',
  GB: '🇬🇧',
  UK: '🇬🇧',
  US: '🇺🇸',
  ES: '🇪🇸',
  AT: '🇦🇹',
  MC: '🇲🇨',
  BE: '🇧🇪',
  NL: '🇳🇱',
  AE: '🇦🇪',
};

export default function LiveVisitorStream({
  stream = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
  searchTerm,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
  onIdentityUpdated,
  isLoading = false,
}: LiveVisitorStreamProps) {
  // Modal state for assigning / editing identity
  const [selectedVisitorForIdentity, setSelectedVisitorForIdentity] = useState<StreamItem | null>(null);
  const [identityName, setIdentityName] = useState('');
  const [identityEmail, setIdentityEmail] = useState('');
  const [identityRole, setIdentityRole] = useState('customer');
  const [identityNotes, setIdentityNotes] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);

  const handleOpenIdentityModal = (item: StreamItem) => {
    setSelectedVisitorForIdentity(item);
    setIdentityName(item.identity?.name || '');
    setIdentityEmail(item.identity?.email || '');
    setIdentityRole(item.identity?.role || 'customer');
    setIdentityNotes(item.identity?.notes || '');
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitorForIdentity || !identityName.trim()) return;

    setSavingIdentity(true);
    try {
      const res = await fetch('/api/admin/analytics/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: selectedVisitorForIdentity.visitor_id,
          name: identityName.trim(),
          email: identityEmail.trim() || null,
          role: identityRole,
          notes: identityNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.identity) {
        if (onIdentityUpdated) {
          onIdentityUpdated(selectedVisitorForIdentity.visitor_id, data.identity);
        }
        setSelectedVisitorForIdentity(null);
      } else {
        alert('Errore nel salvataggio dell’identità: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      console.error(err);
      alert('Errore di connessione durante il salvataggio');
    } finally {
      setSavingIdentity(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const getDeviceIcon = (device?: string) => {
    if (device === 'mobile') return <Smartphone size={12} className="text-gray-400" />;
    if (device === 'tablet') return <Tablet size={12} className="text-gray-400" />;
    return <Laptop size={12} className="text-gray-400" />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-serif text-xl text-gray-900 tracking-wide">
              Live Visitor Stream &amp; Storico Navigazioni
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-light mt-0.5">
            Tutte le {totalCount.toLocaleString('it-IT')} sessioni registrate con attribuzione e riconoscimento persona
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Channel Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter size={13} className="text-gray-500" />
            <select
              value={channelFilter}
              onChange={(e) => onChannelFilterChange(e.target.value)}
              className="bg-transparent text-gray-800 outline-none font-medium cursor-pointer"
            >
              <option value="all">Tutti i Canali</option>
              <option value="google_organic">Google Organic</option>
              <option value="meta_ads">Meta Ads / Instagram</option>
              <option value="direct">Direct Traffic</option>
              <option value="referral">Referral / PR</option>
              <option value="whatsapp_crm">WhatsApp</option>
              <option value="email_crm">Email CRM</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca pagina, persona, IP..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
            />
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Righe:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs text-gray-800 font-medium outline-none cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stream Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4 font-semibold">Persona / Visitatore</th>
              <th className="py-3 px-3 font-semibold">Canale / UTM</th>
              <th className="py-3 px-4 font-semibold">Percorso Attuale</th>
              <th className="py-3 px-3 font-semibold">Geolocalizzazione</th>
              <th className="py-3 px-3 font-semibold">Dispositivo</th>
              <th className="py-3 px-3 font-semibold text-right">Permanenza</th>
              <th className="py-3 px-3 font-semibold text-right">Data &amp; Ora</th>
              <th className="py-3 px-4 font-semibold text-center">Identità</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {stream.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400 font-light">
                  Nessuna sessione trovata con questi filtri.
                </td>
              </tr>
            ) : (
              stream.map((item) => {
                const identity = item.identity;
                const isFounder = identity?.role === 'founder';
                const isVip = identity?.role === 'vip';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    {/* Visitor & Identity */}
                    <td className="py-3 px-4 max-w-[200px]">
                      {identity ? (
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isFounder
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isVip
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-[#FAF3F0] text-[#8C6558] border border-[#C0A09A]/40'
                            }`}
                          >
                            {isFounder ? '👑' : isVip ? '💎' : identity.name ? identity.name.charAt(0).toUpperCase() : '👤'}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-gray-900 block text-xs truncate">
                              {identity.name || 'Visitatore'}
                            </span>
                            <span className="font-mono text-[9px] text-gray-400 block truncate" title={item.visitor_id}>
                              {item.visitor_id}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-600">
                          <span className="truncate max-w-[150px]" title={item.visitor_id}>
                            {item.visitor_id}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[130px]" title={item.traffic_channel}>
                        {item.traffic_channel || 'Direct'}
                      </span>
                      {item.utm_campaign && (
                        <span className="block text-[9px] text-[#8C6558] font-mono truncate max-w-[130px]" title={item.utm_campaign}>
                          🏷️ {item.utm_campaign}
                        </span>
                      )}
                    </td>

                    {/* Path */}
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-900 max-w-[200px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <ArrowUpRight size={12} className="text-[#C0A09A] shrink-0" />
                        <span className="truncate" title={item.current_path}>
                          {item.current_path}
                        </span>
                      </div>
                    </td>

                    {/* Geo Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                        <span>{COUNTRY_FLAGS[(item.country || 'IT').toUpperCase()] || '🌐'}</span>
                        <span className="truncate max-w-[100px]">{item.city || item.country || 'Italia'}</span>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        {getDeviceIcon(item.device_type)}
                        <span className="capitalize">{item.device_type || 'Desktop'}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-gray-600">
                      {formatDuration(item.duration_seconds)}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-right text-[11px] text-gray-500 font-mono">
                      {new Date(item.last_active_at || item.started_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Identity Tag Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenIdentityModal(item)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#FAF3F0] hover:text-[#8C6558] text-gray-700 rounded-md text-[10px] font-medium transition cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <Tag size={11} />
                        <span>{identity ? 'Modifica' : '+ Assegna'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Mostrando <span className="font-semibold text-gray-900">{(currentPage - 1) * rowsPerPage + 1}</span> -{' '}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * rowsPerPage, totalCount)}
            </span>{' '}
            di <span className="font-semibold text-gray-900">{totalCount.toLocaleString('it-IT')}</span> sessioni
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Precedente</span>
            </button>

            <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-[11px] font-medium text-gray-800">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Successiva</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* IDENTITY TAGGING MODAL */}
      {selectedVisitorForIdentity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedVisitorForIdentity(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-gray-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVisitorForIdentity(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 cursor-pointer"
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#FAF3F0] flex items-center justify-center text-[#8C6558]">
                <UserCheck size={18} />
              </div>
              <h3 className="font-serif text-xl text-gray-900">Identifica Visitatore Reale</h3>
            </div>

            <p className="text-xs text-gray-500 font-light mb-4">
              Assegna un nome o etichetta a questo dispositivo per riconoscerlo ovunque nelle analytics e nel CRM.
            </p>

            <div className="p-2.5 bg-gray-50 rounded-xl mb-4 text-[11px] font-mono text-gray-600 border border-gray-200/60 truncate">
              Visitor ID: <span className="font-semibold text-gray-900">{selectedVisitorForIdentity.visitor_id}</span>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Nome Persona / Etichetta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Elena (Co-Founder), Mario (iPhone), Elena M. (Cliente)..."
                  value={identityName}
                  onChange={(e) => setIdentityName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Email (Opzionale)
                </label>
                <input
                  type="email"
                  placeholder="es. cliente@dominio.it"
                  value={identityEmail}
                  onChange={(e) => setIdentityEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Ruolo / Categoria
                </label>
                <select
                  value={identityRole}
                  onChange={(e) => setIdentityRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition bg-white"
                >
                  <option value="founder">👑 Founder / Team Interno</option>
                  <option value="vip">💎 Cliente VIP / Amico</option>
                  <option value="customer">🛍️ Cliente</option>
                  <option value="lead">👤 Lead / Visitatore</option>
                  <option value="test">🧪 Dispositivo di Test</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Note interne..."
                  value={identityNotes}
                  onChange={(e) => setIdentityNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedVisitorForIdentity(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={savingIdentity}
                  className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#C0A09A] text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{savingIdentity ? 'Salvataggio...' : 'Salva Identità'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
