'use client';

import React, { useMemo } from 'react';
import { 
  Share2, 
  ArrowUpRight, 
  Layers, 
  TrendingUp, 
  ShoppingBag,
  ExternalLink
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

interface AttributionBreakdownCardProps {
  channels: ChannelMetric[];
  onOpenCampaignsModal: () => void;
  isLoading?: boolean;
}

const CHANNEL_CONFIG: Record<
  string,
  { label: string; color: string; bgBadge: string; textBadge: string; dotColor: string }
> = {
  'Google Organic': {
    label: 'Google Organic',
    color: '#2563EB',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-700',
    dotColor: 'bg-blue-600',
  },
  'Google Ads': {
    label: 'Google Ads',
    color: '#1D4ED8',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-800',
    dotColor: 'bg-blue-700',
  },
  'Meta Ads': {
    label: 'Meta Ads',
    color: '#9333EA',
    bgBadge: 'bg-purple-50',
    textBadge: 'text-purple-700',
    dotColor: 'bg-purple-600',
  },
  'Instagram Organic': {
    label: 'Instagram Org.',
    color: '#C026D3',
    bgBadge: 'bg-fuchsia-50',
    textBadge: 'text-fuchsia-700',
    dotColor: 'bg-fuchsia-600',
  },
  'Facebook Organic': {
    label: 'Facebook Org.',
    color: '#3B82F6',
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-700',
    dotColor: 'bg-sky-600',
  },
  Direct: {
    label: 'Direct Traffic',
    color: '#1A1A1A',
    bgBadge: 'bg-gray-100',
    textBadge: 'text-gray-900',
    dotColor: 'bg-gray-900',
  },
  Referral: {
    label: 'Referral / PR',
    color: '#059669',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    dotColor: 'bg-emerald-600',
  },
  'WhatsApp CRM': {
    label: 'WhatsApp CRM',
    color: '#16A34A',
    bgBadge: 'bg-green-50',
    textBadge: 'text-green-700',
    dotColor: 'bg-green-600',
  },
  'Email CRM': {
    label: 'Email CRM',
    color: '#D97706',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-700',
    dotColor: 'bg-amber-600',
  },
};

export default function AttributionBreakdownCard({
  channels = [],
  onOpenCampaignsModal,
  isLoading = false,
}: AttributionBreakdownCardProps) {
  // Sort top 5 channels for the main overview card
  const topChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.sessions - a.sessions).slice(0, 6);
  }, [channels]);

  const totalSessions = useMemo(() => {
    return channels.reduce((sum, c) => sum + (c.sessions || 0), 0);
  }, [channels]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                Attribuzione Sorgenti di Traffico
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Riconoscimento multi-touch: Google, Meta, Diretto, WhatsApp, Referral
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCampaignsModal}
            className="text-xs text-[#8C6558] hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer transition"
          >
            <span>Dettaglio UTM</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Horizontal Stacked Percentage Bar */}
        {totalSessions > 0 && (
          <div className="mb-5">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
              {topChannels.map((c) => {
                const cfg = CHANNEL_CONFIG[c.channel] || { color: '#9CA3AF' };
                const pct = totalSessions > 0 ? (c.sessions / totalSessions) * 100 : 0;
                if (pct < 1) return null;
                return (
                  <div
                    key={c.channel}
                    style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:opacity-80"
                    title={`${c.channel}: ${c.sessions} sessioni (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Micro legends */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {topChannels.slice(0, 4).map((c) => {
                const cfg = CHANNEL_CONFIG[c.channel] || { dotColor: 'bg-gray-400', label: c.channel };
                const pct = totalSessions > 0 ? ((c.sessions / totalSessions) * 100).toFixed(1) : '0';
                return (
                  <div key={c.channel} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`}></span>
                    <span>{cfg.label}</span>
                    <span className="font-mono text-gray-400">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table of Top Channels */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                <th className="pb-2.5 font-semibold">Canale</th>
                <th className="pb-2.5 font-semibold text-right">Utenti</th>
                <th className="pb-2.5 font-semibold text-right">Sessioni</th>
                <th className="pb-2.5 font-semibold text-right">Ordini</th>
                <th className="pb-2.5 font-semibold text-right">Fatturato</th>
                <th className="pb-2.5 font-semibold text-right">Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {topChannels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 font-light">
                    Nessun canale di traffico registrato nel periodo.
                  </td>
                </tr>
              ) : (
                topChannels.map((c) => {
                  const cfg = CHANNEL_CONFIG[c.channel] || {
                    label: c.channel,
                    dotColor: 'bg-gray-400',
                    bgBadge: 'bg-gray-100',
                    textBadge: 'text-gray-800',
                  };

                  return (
                    <tr key={c.channel} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`}></span>
                          <span className="font-medium text-gray-900">{cfg.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-700">
                        {c.unique_visitors.toLocaleString('it-IT')}
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-900 font-semibold">
                        {c.sessions.toLocaleString('it-IT')}
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-900 font-semibold">
                        {c.orders}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-700 font-semibold">
                        €{c.revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        <span className="font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          {c.conversion_rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Mostrati i principali {topChannels.length} canali
        </span>
        <button
          type="button"
          onClick={onOpenCampaignsModal}
          className="text-xs text-[#8C6558] hover:text-[#1A1A1A] font-semibold flex items-center gap-1 cursor-pointer transition"
        >
          <span>Esplora tutti i {channels.length} canali &amp; UTM</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
