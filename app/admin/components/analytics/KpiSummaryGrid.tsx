'use client';

import React from 'react';
import { 
  Users, 
  Eye, 
  Activity, 
  ArrowDownRight, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { KpiSummary } from '@/types/analytics';

interface KpiSummaryGridProps {
  summary: KpiSummary | null;
  isLoading?: boolean;
}

export default function KpiSummaryGrid({ summary, isLoading }: KpiSummaryGridProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const renderDelta = (changeVal: number | undefined) => {
    if (changeVal === undefined || changeVal === null) return null;
    const isPositive = changeVal >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
          isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
        }`}
      >
        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {isPositive ? `+${changeVal}%` : `${changeVal}%`}
      </span>
    );
  };

  const visitors = summary?.real_unique_visitors || 0;
  const pageViews = summary?.total_page_views || 0;
  const liveVisitors = summary?.active_live_visitors || 0;
  const bounceRate = summary?.bounce_rate ?? 0;
  const avgDuration = summary?.avg_session_duration_seconds || 0;

  const visitorsChange = summary?.prev_period_change?.visitors_change;
  const viewsChange = summary?.prev_period_change?.views_change;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. REAL UNIQUE HUMAN VISITORS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#C0A09A]/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Visitatori Unici Reali
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50/80 flex items-center justify-center text-blue-600 border border-blue-100">
            <Users size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                visitors.toLocaleString('it-IT')
              )}
            </div>
            {renderDelta(visitorsChange)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            Dispositivi e persone reali verificate
          </p>
        </div>
      </div>

      {/* 2. TOTAL PAGE VIEWS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#C0A09A]/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Visualizzazioni Totali
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FAF3F0] flex items-center justify-center text-[#8C6558] border border-[#C0A09A]/30">
            <Eye size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                pageViews.toLocaleString('it-IT')
              )}
            </div>
            {renderDelta(viewsChange)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            Pagine caricate lato server (no bot)
          </p>
        </div>
      </div>

      {/* 3. ACTIVE LIVE VISITORS (LAST 5 MIN) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Visitatori Live (5 min)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Activity size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                liveVisitors.toLocaleString('it-IT')
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            Persone attive sul sito ora
          </p>
        </div>
      </div>

      {/* 4. BOUNCE RATE (FREQUENZA DI RIMBALZO) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#C0A09A]/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Frequenza di Rimbalzo
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <ArrowDownRight size={16} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                `${bounceRate}%`
              )}
            </div>
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                bounceRate <= 40
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : bounceRate <= 60
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {bounceRate <= 40 ? 'Ottimo (<40%)' : bounceRate <= 60 ? 'Normale' : 'Alto (>60%)'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            Sessioni a pagina singola
          </p>
        </div>
      </div>

      {/* 5. AVERAGE SESSION DURATION */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#C0A09A]/40 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Permanenza Media
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <Clock size={16} />
          </div>
        </div>

        <div>
          <div className="text-3xl font-serif font-semibold text-gray-900 tabular-nums">
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-100 animate-pulse rounded"></div>
            ) : (
              formatDuration(avgDuration)
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-light">
            Tempo medio trascorso per sessione
          </p>
        </div>
      </div>
    </div>
  );
}
