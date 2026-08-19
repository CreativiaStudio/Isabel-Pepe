'use client';

import React, { useState } from 'react';
import { 
  Filter, 
  ShoppingBag, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  CreditCard,
  Layers
} from 'lucide-react';
import { FunnelData } from '@/types/analytics';

interface ConversionFunnelCardProps {
  funnel: FunnelData | null;
  onChannelChange?: (channel: string) => void;
  selectedChannel?: string;
  isLoading?: boolean;
}

export default function ConversionFunnelCard({
  funnel,
  onChannelChange,
  selectedChannel = 'all',
  isLoading = false,
}: ConversionFunnelCardProps) {
  const f = funnel || {
    stage_1_landing: 0,
    stage_2_product_view: 0,
    stage_3_add_to_cart: 0,
    stage_4_checkout_started: 0,
    stage_5_purchase_completed: 0,
    cr_1_to_2: 0,
    cr_2_to_3: 0,
    cr_3_to_4: 0,
    cr_4_to_5: 0,
    cr_overall: 0,
    drop_off_1_to_2: 0,
    drop_off_2_to_3: 0,
    drop_off_3_to_4: 0,
    drop_off_4_to_5: 0,
    total_revenue: 0,
  };

  const stages = [
    {
      step: 1,
      title: '1. Landing & Sessioni',
      desc: 'Tutti i visitatori che entrano nel sito',
      count: f.stage_1_landing,
      passPct: 100,
      dropPct: f.drop_off_1_to_2,
      stepCr: f.cr_1_to_2,
      color: '#1A1A1A',
      icon: Layers,
    },
    {
      step: 2,
      title: '2. Schede Gioiello',
      desc: 'Esplorazione pagine prodotto /prodotto/*',
      count: f.stage_2_product_view,
      passPct: f.stage_1_landing > 0 ? (f.stage_2_product_view / f.stage_1_landing) * 100 : 0,
      dropPct: f.drop_off_2_to_3,
      stepCr: f.cr_2_to_3,
      color: '#C0A09A',
      icon: Sparkles,
    },
    {
      step: 3,
      title: '3. Aggiunta al Carrello',
      desc: 'Gioielli inseriti nella bag di acquisto',
      count: f.stage_3_add_to_cart,
      passPct: f.stage_1_landing > 0 ? (f.stage_3_add_to_cart / f.stage_1_landing) * 100 : 0,
      dropPct: f.drop_off_3_to_4,
      stepCr: f.cr_3_to_4,
      color: '#9333EA',
      icon: ShoppingBag,
    },
    {
      step: 4,
      title: '4. Inizio Checkout',
      desc: 'Avvio procedura ordine e dati spedizione',
      count: f.stage_4_checkout_started,
      passPct: f.stage_1_landing > 0 ? (f.stage_4_checkout_started / f.stage_1_landing) * 100 : 0,
      dropPct: f.drop_off_4_to_5,
      stepCr: f.cr_4_to_5,
      color: '#D97706',
      icon: CreditCard,
    },
    {
      step: 5,
      title: '5. Acquisto Concluso',
      desc: 'Ordini pagati con successo',
      count: f.stage_5_purchase_completed,
      passPct: f.stage_1_landing > 0 ? (f.stage_5_purchase_completed / f.stage_1_landing) * 100 : 0,
      dropPct: 0,
      stepCr: 100,
      color: '#059669',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-serif text-xl text-gray-900 tracking-wide">
                Funnel di Conversione E-Commerce (5 Fasi)
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Dalla prima visita alla transazione completata con tracciamento abbandoni
              </p>
            </div>
          </div>
        </div>

        {/* Header Badges: Overall CR & Channel Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {onChannelChange && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <Filter size={13} className="text-gray-400" />
              <select
                value={selectedChannel}
                onChange={(e) => onChannelChange(e.target.value)}
                className="bg-transparent text-gray-800 outline-none font-medium cursor-pointer"
              >
                <option value="all">Tutti i Canali</option>
                <option value="google_organic">Google Organic</option>
                <option value="meta_ads">Meta Ads / IG</option>
                <option value="direct">Direct</option>
                <option value="referral">Referral / PR</option>
                <option value="whatsapp_crm">WhatsApp</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#FAF3F0] border border-[#C0A09A]/40 px-3.5 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6558] font-bold">
              CR Totale:
            </span>
            <span className="font-serif text-base font-bold text-gray-900 tabular-nums">
              {f.cr_overall}%
            </span>
          </div>
        </div>
      </div>

      {/* 5-Step Funnel Flow Bars */}
      <div className="space-y-4 pt-2 pb-2">
        {stages.map((st, idx) => {
          const IconComponent = st.icon;
          const isLast = idx === stages.length - 1;
          const barWidth = Math.max(st.passPct, 4);

          return (
            <div key={st.step} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                {/* Stage Name & Icon */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: st.color }}
                  >
                    <IconComponent size={12} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-xs">
                      {st.title}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-2 hidden md:inline font-light">
                      • {st.desc}
                    </span>
                  </div>
                </div>

                {/* Counts & Step Conversion */}
                <div className="flex items-center gap-3 font-mono self-end sm:self-auto">
                  <span className="font-bold text-gray-900 text-sm">
                    {st.count.toLocaleString('it-IT')}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({st.passPct.toFixed(1)}% tot)
                  </span>

                  {!isLast && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <TrendingDown size={10} />
                      -{st.dropPct}% abbandono
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: st.color,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div>
            Fatturato Generato nel Funnel:{' '}
            <span className="font-mono font-bold text-emerald-700 text-sm">
              €{f.total_revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 font-light">
          Calcolato su sessioni First-Party 100% verificate
        </div>
      </div>
    </div>
  );
}
