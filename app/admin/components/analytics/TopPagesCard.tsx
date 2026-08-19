'use client';

import React from 'react';
import { Compass, ArrowUpRight, ExternalLink } from 'lucide-react';
import { TopPageMetric } from '@/types/analytics';
import Link from 'next/link';

interface TopPagesCardProps {
  pages: TopPageMetric[];
  totalViews?: number;
  onOpenPagesModal: () => void;
  isLoading?: boolean;
}

export default function TopPagesCard({
  pages = [],
  totalViews = 0,
  onOpenPagesModal,
  isLoading = false,
}: TopPagesCardProps) {
  const sumViews = totalViews > 0 ? totalViews : pages.reduce((a, b) => a + (b.views_count || 0), 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Compass size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                🧭 Pagine Più Esplorate
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                I percorsi di navigazione più frequenti sul sito
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPagesModal}
            className="text-xs text-[#8C6558] hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer transition"
          >
            <span>Mappa Completa</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* List of Pages */}
        {pages.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-light">
            Nessuna pagina registrata nel periodo selezionato.
          </div>
        ) : (
          <div className="space-y-3">
            {pages.slice(0, 8).map((pg, idx) => {
              const share = sumViews > 0 ? Math.round((pg.views_count / sumViews) * 100) : 0;

              return (
                <div
                  key={pg.path + idx}
                  className="flex items-center justify-between gap-3 p-2.5 bg-gray-50/70 hover:bg-gray-50 rounded-xl transition border border-gray-100 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <span className="text-xs font-mono font-bold text-gray-400 w-4">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-mono text-gray-900 font-medium truncate" title={pg.path}>
                          {pg.path}
                        </span>
                        <Link
                          href={pg.path}
                          target="_blank"
                          className="text-gray-300 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition shrink-0"
                          title="Apri pagina"
                        >
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                      {pg.page_title && (
                        <span className="text-[10px] text-gray-400 block truncate font-light">
                          {pg.page_title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-gray-900">
                      {pg.views_count.toLocaleString('it-IT')} views
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {share}% del traffico
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Mostrati i primi {Math.min(8, pages.length)} percorsi
        </span>
        <button
          type="button"
          onClick={onOpenPagesModal}
          className="text-xs text-[#8C6558] hover:text-[#1A1A1A] font-semibold flex items-center gap-1 cursor-pointer transition"
        >
          <span>Esplora tutti i {pages.length} percorsi</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
