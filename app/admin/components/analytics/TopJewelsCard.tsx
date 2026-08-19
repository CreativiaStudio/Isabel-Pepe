'use client';

import React from 'react';
import { Sparkles, ExternalLink, Eye, Users } from 'lucide-react';
import { TopProductMetric } from '@/types/analytics';
import Link from 'next/link';

interface TopJewelsCardProps {
  products: TopProductMetric[];
  isLoading?: boolean;
}

export default function TopJewelsCard({ products = [], isLoading = false }: TopJewelsCardProps) {
  const maxViews = Math.max(...products.map((p) => p.views_count || 0), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#8C6558] border border-[#C0A09A]/30">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                💎 Gioielli Più Desiderati &amp; Visti
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Ranking per visualizzazioni e interesse a catalogo
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-[#FAF3F0] text-[#8C6558] font-semibold px-2.5 py-1 rounded-full border border-[#C0A09A]/30">
            Top {products.length}
          </span>
        </div>

        {/* Product Items List */}
        {products.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-light">
            Nessuna visualizzazione prodotto registrata nel periodo selezionato.
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 8).map((p, idx) => {
              const barWidth = maxViews > 0 ? Math.min(100, Math.max(5, (p.views_count / maxViews) * 100)) : 5;

              return (
                <div
                  key={p.product_id || p.slug + idx}
                  className="flex items-center justify-between gap-3 p-2.5 hover:bg-gray-50/80 rounded-xl transition border border-transparent hover:border-gray-100 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-gray-400 w-4">
                      {idx + 1}.
                    </span>

                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs">💎</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/prodotto/${p.slug}`}
                          target="_blank"
                          className="font-medium text-xs text-gray-900 hover:text-[#C0A09A] transition truncate block font-serif"
                          title={p.name}
                        >
                          {p.name}
                        </Link>
                        <Link
                          href={`/prodotto/${p.slug}`}
                          target="_blank"
                          className="text-gray-300 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition shrink-0"
                          title="Apri scheda prodotto"
                        >
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                      <span className="text-[10px] text-gray-400 block font-light">
                        {p.category} {p.price > 0 && `• €${p.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Views Count & Progress Bar */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs font-mono font-bold text-gray-900">
                        {p.views_count.toLocaleString('it-IT')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">views</span>
                    </div>

                    <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden ml-auto">
                      <div
                        className="bg-[#C0A09A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>Monitoraggio continuo catalogo</span>
        <span className="font-mono text-gray-600">8 creazioni in evidenza</span>
      </div>
    </div>
  );
}
