'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Download, 
  Share2, 
  Tag, 
  Globe, 
  TrendingUp, 
  ShoppingBag, 
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { TrafficChannel } from '@/types/analytics';

interface ChannelMetric {
  channel: TrafficChannel;
  unique_visitors: number;
  sessions: number;
  page_views: number;
  pages_per_session: number;
  avg_duration: number;
  bounce_rate: number;
  cart_additions: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
}

interface CampaignMetric {
  campaign: string;
  source: string;
  medium: string;
  content: string | null;
  term?: string | null;
  sessions: number;
  cart_additions: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
}

interface ReferrerMetric {
  referrer_host: string;
  sessions: number;
  bounce_rate: number;
  orders: number;
}

interface CampaignsDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: ChannelMetric[];
  campaigns: CampaignMetric[];
  referrers: ReferrerMetric[];
  timeRangeLabel?: string;
}

export default function CampaignsDrillDownModal({
  isOpen,
  onClose,
  channels = [],
  campaigns = [],
  referrers = [],
  timeRangeLabel = 'Periodo Selezionato',
}: CampaignsDrillDownModalProps) {
  const [activeTab, setActiveTab] = useState<'channels' | 'campaigns' | 'referrers'>('channels');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    if (!searchTerm.trim()) return campaigns;
    const q = searchTerm.toLowerCase().trim();
    return campaigns.filter(
      (c) =>
        c.campaign?.toLowerCase().includes(q) ||
        c.source?.toLowerCase().includes(q) ||
        c.medium?.toLowerCase().includes(q) ||
        c.content?.toLowerCase().includes(q)
    );
  }, [campaigns, searchTerm]);

  // Filtered Referrers
  const filteredReferrers = useMemo(() => {
    if (!searchTerm.trim()) return referrers;
    const q = searchTerm.toLowerCase().trim();
    return referrers.filter((r) => r.referrer_host?.toLowerCase().includes(q));
  }, [referrers, searchTerm]);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (activeTab === 'channels') {
      headers = [
        'Canale di Acquisizione',
        'Visitatori Unici',
        'Sessioni Totali',
        'Pagine Visualizzate',
        'Pagine/Sessione',
        'Permanenza Media (sec)',
        'Frequenza di Rimbalzo (%)',
        'Aggiunte Carrello',
        'Ordini',
        'Fatturato (€)',
        'Tasso di Conversione (%)',
      ];
      rows = channels.map((c) => [
        `"${c.channel}"`,
        c.unique_visitors,
        c.sessions,
        c.page_views,
        c.pages_per_session,
        c.avg_duration,
        `${c.bounce_rate}%`,
        c.cart_additions,
        c.orders,
        c.revenue,
        `${c.conversion_rate}%`,
      ]);
      filename = `isabel_pepe_canali_traffico_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeTab === 'campaigns') {
      headers = [
        'Campagna (utm_campaign)',
        'Sorgente (utm_source)',
        'Medium (utm_medium)',
        'Contenuto (utm_content)',
        'Sessioni',
        'Aggiunte Carrello',
        'Ordini Conclusi',
        'Fatturato (€)',
        'Tasso di Conversione (%)',
      ];
      rows = filteredCampaigns.map((c) => [
        `"${(c.campaign || 'N/A').replace(/"/g, '""')}"`,
        `"${c.source || 'N/A'}"`,
        `"${c.medium || 'N/A'}"`,
        `"${c.content || 'N/A'}"`,
        c.sessions,
        c.cart_additions,
        c.orders,
        c.revenue,
        `${c.conversion_rate}%`,
      ]);
      filename = `isabel_pepe_campagne_utm_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = ['Host Referrer', 'Sessioni Generate', 'Frequenza Rimbalzo (%)', 'Ordini Conclusi'];
      rows = filteredReferrers.map((r) => [
        `"${r.referrer_host}"`,
        r.sessions,
        `${r.bounce_rate}%`,
        r.orders,
      ]);
      filename = `isabel_pepe_referrers_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChannelBadge = (channel: TrafficChannel) => {
    switch (channel) {
      case 'Google Organic':
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0"></span>;
      case 'Meta Ads':
      case 'Instagram Organic':
      case 'Facebook Organic':
        return <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-600 inline-block shrink-0"></span>;
      case 'Direct':
        return <span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block shrink-0"></span>;
      case 'Referral':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>;
      case 'WhatsApp CRM':
        return <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shrink-0"></span>;
      case 'Email CRM':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block shrink-0"></span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 text-gray-900 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3F0] flex items-center justify-center text-[#8C6558] border border-[#C0A09A]/30">
              <Share2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-gray-900 tracking-wide">
                  Intelligence Sorgenti di Traffico, Campagne &amp; UTM
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Attribuzione multi-canale, dettaglio parametri di marketing e domini di provenienza • {timeRangeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download size={14} className="text-gray-500" />
              <span>Esporta CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 transition rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('channels'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'channels'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Layers size={13} />
              <span>Panoramica Canali ({channels.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('campaigns'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'campaigns'
                  ? 'bg-[#C0A09A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Tag size={13} />
              <span>Dettaglio Campagne UTM ({campaigns.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('referrers'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'referrers'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Globe size={13} />
              <span>Referrer Esterni ({referrers.length})</span>
            </button>
          </div>

          {(activeTab === 'campaigns' || activeTab === 'referrers') && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'campaigns' ? 'Cerca per campagna, source...' : 'Cerca per host referrer...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
              />
            </div>
          )}
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-y-auto p-0">
          {/* TAB 1: PANORAMICA CANALI */}
          {activeTab === 'channels' && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Canale di Acquisizione</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Visitatori Unici</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sessioni</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Pagine/Sess</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Rimbalzo</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Carrelli</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Ordini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fatturato</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {channels.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 font-light">
                      Nessun dato di canale registrato nel periodo.
                    </td>
                  </tr>
                ) : (
                  channels.map((c) => (
                    <tr key={c.channel} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 font-medium text-gray-900 text-xs">
                          {getChannelBadge(c.channel)}
                          <span>{c.channel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {c.unique_visitors.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                        {c.sessions.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-600">
                        {c.pages_per_session}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                            c.bounce_rate <= 35
                              ? 'text-emerald-700 bg-emerald-50'
                              : c.bounce_rate <= 60
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {c.bounce_rate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-700">
                        {c.cart_additions}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-900 font-semibold">
                        {c.orders}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        €{c.revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                          {c.conversion_rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: DETTAGLIO CAMPAGNE UTM */}
          {activeTab === 'campaigns' && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Campagna (utm_campaign)</th>
                  <th className="py-3.5 px-3 font-semibold">Sorgente / Medium</th>
                  <th className="py-3.5 px-3 font-semibold">Contenuto (Ad)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sessioni</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Carrelli</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Ordini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fatturato</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-light">
                      Nessuna campagna UTM registrata nel periodo selezionato.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((c, idx) => (
                    <tr key={c.campaign + c.source + idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-[#8C6558] shrink-0" />
                          <span className="font-mono text-xs font-semibold text-gray-900">
                            {c.campaign || 'Nessun nome'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {c.source || 'direct'} / {c.medium || 'none'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-gray-500">
                        {c.content || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {c.sessions.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-700">
                        {c.cart_additions}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-900 font-semibold">
                        {c.orders}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        €{c.revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {c.conversion_rate}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: REFERRER ESTERNI */}
          {activeTab === 'referrers' && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Host Referrer Esterno</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sessioni Generate</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Frequenza Rimbalzo</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ordini Generati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredReferrers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 font-light">
                      Nessun referrer esterno registrato nel periodo.
                    </td>
                  </tr>
                ) : (
                  filteredReferrers.map((r) => (
                    <tr key={r.referrer_host} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono text-xs text-gray-900 font-medium">
                          <Globe size={13} className="text-gray-400" />
                          <span>{r.referrer_host}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {r.sessions.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                            r.bounce_rate <= 35
                              ? 'text-emerald-700 bg-emerald-50'
                              : r.bounce_rate <= 60
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {r.bounce_rate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {r.orders}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
