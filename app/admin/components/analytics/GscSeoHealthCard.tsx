'use client';

import React from 'react';
import { Search, Globe, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { SearchConsoleData } from '@/types/analytics';

interface GscSeoHealthCardProps {
  gscData: SearchConsoleData | null;
  isLoading?: boolean;
}

export default function GscSeoHealthCard({
  gscData,
  isLoading = false,
}: GscSeoHealthCardProps) {
  const impressions = gscData?.total_impressions || 0;
  const clicks = gscData?.total_clicks || 0;
  const ctr = gscData?.avg_ctr || 0;
  const avgPos = gscData?.avg_position || 0;
  const queries = gscData?.queries || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Search size={16} />
            </div>
            <div>
              <h3 className="font-serif text-xl text-gray-900 tracking-wide">
                Google Search Console &amp; SEO Health
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Visibilità organica, query di ricerca e posizionamento Demi-Fine Jewelry
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-medium self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sincronizzato con Search Console</span>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#FAF8F5]/80 p-4 rounded-xl border border-gray-100">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Impression Organiche
          </span>
          <div className="text-2xl font-serif font-semibold text-gray-900 tabular-nums">
            {impressions.toLocaleString('it-IT')}
          </div>
          <span className="text-[11px] text-gray-400 font-light">Visualizzazioni in SERP</span>
        </div>

        <div className="bg-[#FAF8F5]/80 p-4 rounded-xl border border-gray-100">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Click da Ricerca
          </span>
          <div className="text-2xl font-serif font-semibold text-blue-600 tabular-nums">
            {clicks.toLocaleString('it-IT')}
          </div>
          <span className="text-[11px] text-gray-400 font-light">Visite organiche Google</span>
        </div>

        <div className="bg-[#FAF8F5]/80 p-4 rounded-xl border border-gray-100">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            CTR Medio
          </span>
          <div className="text-2xl font-serif font-semibold text-gray-900 tabular-nums">
            {ctr}%
          </div>
          <span className="text-[11px] text-gray-400 font-light">Percentuale di Click-Through</span>
        </div>

        <div className="bg-[#FAF8F5]/80 p-4 rounded-xl border border-gray-100">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Posizione Media SERP
          </span>
          <div className="text-2xl font-serif font-semibold text-emerald-700 tabular-nums">
            {avgPos.toFixed(1)}
          </div>
          <span className="text-[11px] text-gray-400 font-light">Ranking medio query</span>
        </div>
      </div>

      {/* Top 5 Queries Table */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-3">
          🔍 Top Query di Ricerca per Gioielli &amp; Brand
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                <th className="pb-2.5 font-semibold">Parola Chiave / Query</th>
                <th className="pb-2.5 font-semibold text-right">Click</th>
                <th className="pb-2.5 font-semibold text-right">Impression</th>
                <th className="pb-2.5 font-semibold text-right">CTR</th>
                <th className="pb-2.5 font-semibold text-right">Posizione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400 font-light">
                    Nessuna query registrata.
                  </td>
                </tr>
              ) : (
                queries.slice(0, 5).map((q, idx) => (
                  <tr key={q.query + idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400">{idx + 1}.</span>
                        <span className="font-mono text-xs text-gray-900 font-medium">
                          {q.query}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-blue-600 font-semibold">
                      {q.clicks.toLocaleString('it-IT')}
                    </td>
                    <td className="py-2.5 text-right font-mono text-gray-700">
                      {q.impressions.toLocaleString('it-IT')}
                    </td>
                    <td className="py-2.5 text-right font-mono text-gray-900 font-semibold">
                      {q.ctr}%
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          q.position <= 3
                            ? 'text-emerald-700 bg-emerald-50'
                            : q.position <= 10
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-gray-700 bg-gray-100'
                        }`}
                      >
                        #{q.position.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
