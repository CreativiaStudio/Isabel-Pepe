'use client';

import React from 'react';
import { 
  BarChart3, 
  RotateCw, 
  Download, 
  Calendar, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { DateRangeKey } from '@/types/analytics';

interface AnalyticsHeaderProps {
  timeRange: DateRangeKey;
  onTimeRangeChange: (range: DateRangeKey) => void;
  onOpenCustomDateModal: () => void;
  onRefresh: () => void;
  onExportData: () => void;
  isLoading: boolean;
  customDateLabel?: string | null;
}

export default function AnalyticsHeader({
  timeRange,
  onTimeRangeChange,
  onOpenCustomDateModal,
  onRefresh,
  onExportData,
  isLoading,
  customDateLabel,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Title & Status Badge */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3F0] flex items-center justify-center text-[#8C6558] border border-[#C0A09A]/30">
              <BarChart3 size={20} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-gray-900 tracking-wide font-normal">
              Analytics &amp; Intelligence Suite
            </h1>
          </div>

          {/* First-Party Human Verified Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-full text-emerald-800 text-[11px] font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-sans font-medium tracking-tight">
              100% First-Party Verified Human Traffic
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 font-light max-w-2xl">
          Intelligence Server-Side proprietaria per Isabel Pepe • Esclusione automatica crawler e bot • Attribuzione multi-canale deterministica
        </p>
      </div>

      {/* Controls: Date Range Selector & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
        {/* Date Range Selector Pill Group */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => onTimeRangeChange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timeRange === 'today'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Oggi
          </button>
          <button
            type="button"
            onClick={() => onTimeRangeChange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timeRange === '7d'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            7 Giorni
          </button>
          <button
            type="button"
            onClick={() => onTimeRangeChange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timeRange === '30d'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            30 Giorni
          </button>
          <button
            type="button"
            onClick={() => onTimeRangeChange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              timeRange === 'month'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Mese Corrente
          </button>
          <button
            type="button"
            onClick={onOpenCustomDateModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              timeRange === 'custom'
                ? 'bg-[#C0A09A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
            title="Personalizza date"
          >
            <Calendar size={13} />
            <span>{timeRange === 'custom' && customDateLabel ? customDateLabel : 'Personalizzato'}</span>
          </button>
        </div>

        {/* Action Buttons: Refresh & Export */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Aggiorna Dati Live"
            aria-label="Aggiorna"
          >
            <RotateCw size={15} className={isLoading ? 'animate-spin text-[#8C6558]' : ''} />
          </button>

          <button
            type="button"
            onClick={onExportData}
            className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#C0A09A] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Esporta Report Completo CSV"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Esporta Dati</span>
          </button>
        </div>
      </div>
    </div>
  );
}
