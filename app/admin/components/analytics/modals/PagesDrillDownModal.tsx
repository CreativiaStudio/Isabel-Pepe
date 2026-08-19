'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Download, 
  ExternalLink, 
  Compass, 
  Clock, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layers,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { TopPageMetric } from '@/types/analytics';
import Link from 'next/link';

interface PagesDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: TopPageMetric[];
  timeRangeLabel?: string;
}

export default function PagesDrillDownModal({
  isOpen,
  onClose,
  pages = [],
  timeRangeLabel = 'Periodo Selezionato',
}: PagesDrillDownModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'visitors' | 'time' | 'bounce'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (!isOpen) return null;

  const totalViewsAcrossPages = useMemo(() => {
    return pages.reduce((sum, p) => sum + (p.views_count || 0), 0);
  }, [pages]);

  const filteredPages = useMemo(() => {
    let result = [...pages];

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.path?.toLowerCase().includes(q) ||
          p.page_title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'products') {
        result = result.filter((p) => p.path?.startsWith('/prodotto/'));
      } else if (selectedCategory === 'categories') {
        result = result.filter(
          (p) =>
            p.path?.startsWith('/categoria/') ||
            p.path === '/shop' ||
            p.path?.includes('collane') ||
            p.path?.includes('orecchini') ||
            p.path?.includes('anelli') ||
            p.path?.includes('bracciali')
        );
      } else if (selectedCategory === 'brand') {
        result = result.filter(
          (p) =>
            p.path === '/' ||
            p.path?.startsWith('/chi-siamo') ||
            p.path?.startsWith('/impegno-animali') ||
            p.path?.startsWith('/cura-gioielli') ||
            p.path?.startsWith('/guida-taglie') ||
            p.path?.startsWith('/assistenza-clienti') ||
            p.path?.startsWith('/spedizioni-resi') ||
            p.path?.startsWith('/privacy') ||
            p.path?.startsWith('/cookie-policy') ||
            p.path?.startsWith('/termini-condizioni')
        );
      } else if (selectedCategory === 'checkout') {
        result = result.filter(
          (p) =>
            p.path?.startsWith('/checkout') ||
            p.path?.startsWith('/carrello') ||
            p.path?.startsWith('/ordine')
        );
      }
    }

    // Sorting
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'views') {
        valA = a.views_count || 0;
        valB = b.views_count || 0;
      } else if (sortBy === 'visitors') {
        valA = a.unique_visitors || 0;
        valB = b.unique_visitors || 0;
      } else if (sortBy === 'time') {
        valA = a.avg_time_seconds || 0;
        valB = b.avg_time_seconds || 0;
      } else if (sortBy === 'bounce') {
        valA = a.bounce_rate || 0;
        valB = b.bounce_rate || 0;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [pages, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Max views for relative bar rendering
  const maxViews = useMemo(() => {
    return Math.max(...pages.map((p) => p.views_count || 0), 1);
  }, [pages]);

  // Pagination
  const totalPages = rowsPerPage > 0 ? Math.max(1, Math.ceil(filteredPages.length / rowsPerPage)) : 1;
  const paginatedPages = useMemo(() => {
    if (rowsPerPage === 0) return filteredPages;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPages.slice(start, start + rowsPerPage);
  }, [filteredPages, currentPage, rowsPerPage]);

  const handleSort = (type: 'views' | 'visitors' | 'time' | 'bounce') => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      'Percorso (Path)',
      'Titolo Pagina',
      'Categoria',
      'Visualizzazioni Totali',
      'Visitatori Unici',
      'Permanenza Media (sec)',
      'Frequenza di Rimbalzo (%)',
      'Entrate Dirette',
    ];

    const rows = filteredPages.map((p) => [
      `"${p.path}"`,
      `"${(p.page_title || '').replace(/"/g, '""')}"`,
      `"${p.category || 'Generale'}"`,
      p.views_count,
      p.unique_visitors,
      p.avg_time_seconds,
      `${p.bounce_rate}%`,
      p.direct_entrances,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isabel_pepe_pagine_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const getCategoryBadge = (path: string) => {
    if (path.startsWith('/prodotto/')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <Sparkles size={10} /> Prodotto
        </span>
      );
    }
    if (path.startsWith('/categoria/') || path === '/shop') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          <Layers size={10} /> Catalogo
        </span>
      );
    }
    if (path.startsWith('/checkout') || path.startsWith('/carrello')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <ShoppingBag size={10} /> Checkout
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
        <FileText size={10} /> Brand
      </span>
    );
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
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3F0] flex items-center justify-center text-[#8C6558] border border-[#C0A09A]/30">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-gray-900 tracking-wide">
                  Mappa Completa Pagine &amp; Deep Engagement
                </h2>
                <span className="text-[10px] font-mono font-semibold bg-rose-50 text-[#8C6558] px-2.5 py-0.5 rounded-full border border-[#C0A09A]/40">
                  {pages.length} URL indicizzati
                </span>
              </div>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Analisi granulare di visualizzazioni, permanenza media, frequenza di rimbalzo ed entrate dirette • {timeRangeLabel}
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

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tutte ({pages.length})
            </button>
            <button
              onClick={() => { setSelectedCategory('products'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'products'
                  ? 'bg-[#C0A09A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💎 Prodotti
            </button>
            <button
              onClick={() => { setSelectedCategory('categories'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'categories'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📂 Categorie
            </button>
            <button
              onClick={() => { setSelectedCategory('brand'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'brand'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✨ Brand &amp; Servizi
            </button>
            <button
              onClick={() => { setSelectedCategory('checkout'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === 'checkout'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🛒 Checkout
            </button>
          </div>

          {/* Search Box & Rows selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtra per percorso o titolo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
              />
            </div>

            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs text-gray-700 font-medium outline-none cursor-pointer"
            >
              <option value={15}>15 righe</option>
              <option value={25}>25 righe</option>
              <option value={50}>50 righe</option>
              <option value={100}>100 righe</option>
              <option value={0}>Tutte ({filteredPages.length})</option>
            </select>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Percorso URL &amp; Titolo</th>
                <th className="py-3.5 px-3 font-semibold">Tipo</th>
                <th
                  onClick={() => handleSort('views')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-gray-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Views</span>
                    <ArrowUpDown size={12} className={sortBy === 'views' ? 'text-[#8C6558]' : 'text-gray-300'} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('visitors')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-gray-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Utenti Unici</span>
                    <ArrowUpDown size={12} className={sortBy === 'visitors' ? 'text-[#8C6558]' : 'text-gray-300'} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('time')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-gray-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tempo Medio</span>
                    <ArrowUpDown size={12} className={sortBy === 'time' ? 'text-[#8C6558]' : 'text-gray-300'} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bounce')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-gray-900 group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Rimbalzo</span>
                    <ArrowUpDown size={12} className={sortBy === 'bounce' ? 'text-[#8C6558]' : 'text-gray-300'} />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Entrate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedPages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-light">
                    Nessuna pagina trovata corrispondente ai criteri di ricerca.
                  </td>
                </tr>
              ) : (
                paginatedPages.map((pg, idx) => {
                  const sharePercent = totalViewsAcrossPages > 0 ? ((pg.views_count / totalViewsAcrossPages) * 100).toFixed(1) : '0.0';
                  const barWidth = maxViews > 0 ? Math.min(100, Math.max(4, Math.round((pg.views_count / maxViews) * 100))) : 4;

                  return (
                    <tr key={pg.path + idx} className="hover:bg-gray-50/80 transition-colors group">
                      {/* URL Path */}
                      <td className="py-3 px-4 max-w-[320px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 w-5">
                            {rowsPerPage > 0 ? (currentPage - 1) * rowsPerPage + idx + 1 : idx + 1}.
                          </span>
                          <div className="min-w-0 flex-1 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-900 font-medium truncate" title={pg.path}>
                                {pg.path}
                              </span>
                              <Link
                                href={pg.path}
                                target="_blank"
                                className="text-gray-400 hover:text-[#8C6558] opacity-0 group-hover:opacity-100 transition shrink-0"
                                title="Apri pagina"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                            {pg.page_title && (
                              <span className="text-[10px] text-gray-400 block truncate font-light" title={pg.page_title}>
                                {pg.page_title}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 shrink-0">
                        {getCategoryBadge(pg.path)}
                      </td>

                      {/* Views Count with Bar */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-semibold text-gray-900 text-xs">
                            {pg.views_count.toLocaleString('it-IT')}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-mono text-gray-400">{sharePercent}%</span>
                            <div className="w-14 bg-gray-100 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-[#C0A09A] h-full rounded-full"
                                style={{ width: `${barWidth}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unique Visitors */}
                      <td className="py-3 px-4 text-right font-mono text-gray-800">
                        {pg.unique_visitors.toLocaleString('it-IT')}
                      </td>

                      {/* Avg Duration */}
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          {formatDuration(pg.avg_time_seconds)}
                        </span>
                      </td>

                      {/* Bounce Rate */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            pg.bounce_rate <= 35
                              ? 'text-emerald-700 bg-emerald-50'
                              : pg.bounce_rate <= 60
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {pg.bounce_rate}%
                        </span>
                      </td>

                      {/* Direct Entrances */}
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        {pg.direct_entrances || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {filteredPages.length > 0 && rowsPerPage > 0 && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-[#FAF8F5]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Mostrando <span className="font-semibold text-gray-900">{(currentPage - 1) * rowsPerPage + 1}</span> -{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(currentPage * rowsPerPage, filteredPages.length)}
              </span>{' '}
              di <span className="font-semibold text-gray-900">{filteredPages.length}</span> pagine
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Precedente</span>
              </button>

              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-mono text-[11px] font-medium text-gray-800">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <span>Successiva</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
