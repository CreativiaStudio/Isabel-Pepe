'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Eye, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Search,
  ChevronRight,
  Database
} from 'lucide-react';
import Link from 'next/link';

interface PageView {
  id: string;
  visitor_id: string;
  consent_id?: string | null;
  path: string;
  created_at: string;
}

interface DailyRecord {
  date: string;
  total_views: number;
  unique_visitors: number;
  product_views: number;
  cart_additions: number;
  orders_count: number;
  total_revenue: number;
}

interface AnalyticsDashboardProps {
  pageViews: PageView[];
  dailyAnalytics?: DailyRecord[];
  products: any[];
  orders: any[];
  carts: any[];
}

export default function AnalyticsDashboard({ pageViews = [], dailyAnalytics = [], products = [], orders = [], carts = [] }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | 'today'>('all');
  const [chartMode, setChartMode] = useState<'views' | 'visitors' | 'products'>('views');
  const [searchPath, setSearchPath] = useState('');

  // 1. Filtraggio temporale delle page_views correnti
  const filteredViews = useMemo(() => {
    const now = new Date();
    return pageViews.filter(pv => {
      const viewDate = new Date(pv.created_at);
      if (timeRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return viewDate >= todayStart;
      }
      if (timeRange === '7d') {
        const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return viewDate >= past7;
      }
      if (timeRange === '30d') {
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return viewDate >= past30;
      }
      return true;
    });
  }, [pageViews, timeRange]);

  // 2. Calcolo Metriche Chiave
  const totalViews = filteredViews.length;
  const uniqueVisitors = useMemo(() => {
    const set = new Set(filteredViews.map(v => v.visitor_id).filter(Boolean));
    return set.size;
  }, [filteredViews]);

  const productViews = useMemo(() => {
    return filteredViews.filter(v => v.path?.startsWith('/prodotto/')).length;
  }, [filteredViews]);

  const conversionRate = useMemo(() => {
    if (uniqueVisitors === 0) return 0;
    return ((orders.length / uniqueVisitors) * 100).toFixed(1);
  }, [uniqueVisitors, orders.length]);

  // 3. Generazione Timeline Giornaliera per il Grafico Storico
  const historicalTimeline = useMemo(() => {
    // Raggruppa le visite per giorno (YYYY-MM-DD)
    const map: Record<string, { date: string; views: number; visitors: Set<string>; products: number }> = {};
    
    // Inizializza gli ultimi 14 giorni per avere sempre un grafico completo
    const numDays = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 14;
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map[key] = { date: key, views: 0, visitors: new Set(), products: 0 };
    }

    // Incorpora record da dailyAnalytics permanenti
    dailyAnalytics.forEach(da => {
      if (map[da.date]) {
        map[da.date].views += da.total_views || 0;
        map[da.date].products += da.product_views || 0;
      }
    });

    // Popola con i log recenti di page_views
    filteredViews.forEach(v => {
      const day = v.created_at?.split('T')[0];
      if (day) {
        if (!map[day]) {
          map[day] = { date: day, views: 0, visitors: new Set(), products: 0 };
        }
        map[day].views += 1;
        if (v.visitor_id) map[day].visitors.add(v.visitor_id);
        if (v.path?.startsWith('/prodotto/')) map[day].products += 1;
      }
    });

    return Object.values(map).map(item => ({
      date: item.date,
      displayDate: new Date(item.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      views: item.views,
      visitors: item.visitors.size,
      products: item.products,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredViews, dailyAnalytics, timeRange]);

  const maxValInTimeline = useMemo(() => {
    const vals = historicalTimeline.map(t => chartMode === 'views' ? t.views : chartMode === 'visitors' ? t.visitors : t.products);
    return Math.max(...vals, 10);
  }, [historicalTimeline, chartMode]);

  // 4. Top Gioielli Più Visualizzati
  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredViews.forEach(v => {
      if (v.path?.startsWith('/prodotto/')) {
        const slug = v.path.replace('/prodotto/', '').split('?')[0];
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([slug, count]) => {
        const prod = products.find(p => p.slug === slug || p.id === slug);
        return {
          slug,
          name: prod?.name || slug.replace(/-/g, ' ').toUpperCase(),
          image: prod?.images?.[0] || prod?.image_url || null,
          price: prod?.price || 0,
          category: prod?.category || 'Gioielli',
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredViews, products, totalViews]);

  // 5. Pagine Più Visitate (Top Pages)
  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredViews.forEach(v => {
      const cleanPath = v.path?.split('?')[0] || '/';
      counts[cleanPath] = (counts[cleanPath] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredViews, totalViews]);

  // 6. Ultime Visite Live in Tempo Reale
  const liveStream = useMemo(() => {
    return filteredViews
      .filter(v => searchPath ? v.path?.toLowerCase().includes(searchPath.toLowerCase()) || v.visitor_id?.toLowerCase().includes(searchPath.toLowerCase()) : true)
      .slice(0, 20);
  }, [filteredViews, searchPath]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={24} className="text-[#C0A09A]" />
            <h1 className="font-serif text-3xl text-gray-900 tracking-wide">
              Analytics &amp; Traffico Interno
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-light">
            Monitoraggio First-Party Server-Side 100% proprietario con storico permanente aggregato a norma GDPR
          </p>
        </div>

        {/* Filtro Temporale */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              timeRange === 'today' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Oggi
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              timeRange === '7d' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            7 Giorni
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              timeRange === '30d' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            30 Giorni
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              timeRange === 'all' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tutto lo Storico
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Visualizzazioni Totali
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#C0A09A]">
              <Eye size={16} />
            </div>
          </div>
          <div className="text-3xl font-serif text-gray-900 font-semibold">{totalViews.toLocaleString('it-IT')}</div>
          <p className="text-[11px] text-gray-400 mt-1">Pagine caricate lato server</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Visitatori Unici
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-serif text-gray-900 font-semibold">{uniqueVisitors.toLocaleString('it-IT')}</div>
          <p className="text-[11px] text-gray-400 mt-1">Dispositivi / Sessioni distinte</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Views Schede Prodotto
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-3xl font-serif text-gray-900 font-semibold">{productViews.toLocaleString('it-IT')}</div>
          <p className="text-[11px] text-gray-400 mt-1">
            {totalViews > 0 ? Math.round((productViews / totalViews) * 100) : 0}% del traffico totale
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Tasso di Conversione
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-3xl font-serif text-gray-900 font-semibold">{conversionRate}%</div>
          <p className="text-[11px] text-gray-400 mt-1">Acquisti su Visitatori Unici</p>
        </div>
      </div>

      {/* GRAFICO STORICO PERMANENTE (DAILY TRAFFIC TIMELINE) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#C0A09A]" />
              <h3 className="font-serif text-xl text-gray-900 tracking-wide">
                Andamento Storico Giornaliero
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              I dati numerici giornalieri rimangono memorizzati per sempre a memoria storica delle visite del brand
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartMode('views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                chartMode === 'views' ? 'bg-[#C0A09A] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Visite Totali
            </button>
            <button
              onClick={() => setChartMode('visitors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                chartMode === 'visitors' ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Visitatori Unici
            </button>
            <button
              onClick={() => setChartMode('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                chartMode === 'products' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Views Prodotti
            </button>
          </div>
        </div>

        {/* Visualizzazione Grafico a Barre */}
        <div className="pt-6 pb-2">
          <div className="flex items-end justify-between gap-2 sm:gap-3 h-48 sm:h-56 px-2 border-b border-gray-100">
            {historicalTimeline.map((item) => {
              const val = chartMode === 'views' ? item.views : chartMode === 'visitors' ? item.visitors : item.products;
              const heightPercent = maxValInTimeline > 0 ? Math.max((val / maxValInTimeline) * 100, 4) : 4;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-12 bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg font-mono">
                    <span className="font-semibold">{item.date}</span>: {val} {chartMode === 'views' ? 'visite' : chartMode === 'visitors' ? 'utenti' : 'views'}
                  </div>

                  {/* Valore sopra la barra */}
                  <span className="text-[9px] font-mono text-gray-400 mb-1.5 group-hover:text-gray-900 font-medium">
                    {val > 0 ? val : ''}
                  </span>

                  {/* Barra */}
                  <div
                    className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 group-hover:opacity-80 ${
                      chartMode === 'views'
                        ? 'bg-[#C0A09A]'
                        : chartMode === 'visitors'
                        ? 'bg-gray-900'
                        : 'bg-emerald-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>

                  {/* Etichetta Data */}
                  <span className="text-[9px] font-mono text-gray-400 mt-2 truncate max-w-full">
                    {item.displayDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRIGLIA: TOP PRODOTTI & TOP PAGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. TOP GIOIELLI PIÙ VISUALIZZATI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                  💎 Gioielli Più Desiderati &amp; Visti
                </h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">I prodotti con il maggior engagement a catalogo</p>
              </div>
              <span className="text-[10px] bg-rose-50 text-[#8C6558] font-semibold px-2.5 py-1 rounded-full border border-[#C0A09A]/30">
                Top {topProducts.length}
              </span>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-light">
                Nessuna visualizzazione prodotto registrata nel periodo selezionato.
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={p.slug} className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-gray-400 w-4">{idx + 1}.</span>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">💎</div>
                      )}
                      <div className="truncate">
                        <Link href={`/prodotto/${p.slug}`} target="_blank" className="font-medium text-xs text-gray-900 hover:text-[#C0A09A] transition truncate block">
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-gray-400 block">{p.category} {p.price > 0 && `• €${p.price}`}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-gray-900 font-mono">{p.count} views</div>
                      <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className="bg-[#C0A09A] h-full rounded-full" style={{ width: `${Math.min(100, p.percentage * 3)}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. TOP PAGINE PIÙ VISITATE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                  🧭 Pagine Più Esplorate
                </h3>
                <p className="text-xs text-gray-400 font-light mt-0.5">I percorsi di navigazione più frequenti</p>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                Mappa Pagine
              </span>
            </div>

            {topPages.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-light">
                Nessuna pagina registrata nel periodo selezionato.
              </div>
            ) : (
              <div className="space-y-3.5">
                {topPages.map((pg, idx) => (
                  <div key={pg.path} className="flex items-center justify-between gap-4 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0 truncate">
                      <span className="text-xs font-mono font-bold text-gray-400">{idx + 1}.</span>
                      <span className="text-xs font-mono text-gray-800 truncate">{pg.path}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-semibold text-gray-900">{pg.count} visualizzazioni</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{pg.percentage}% del traffico</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. LIVE VISITOR STREAM (FEED IN TEMPO REALE) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="font-serif text-xl text-gray-900 tracking-wide">
                Live Visitor Stream
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              Tutte le visite registrate lato server in tempo reale con ID Visitatore e Consenso GDPR
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filtra per pagina o Visitor ID..."
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4 font-semibold">Pagina Visualizzata</th>
                <th className="py-3 px-4 font-semibold">Visitor ID</th>
                <th className="py-3 px-4 font-semibold">Consenso GDPR</th>
                <th className="py-3 px-4 font-semibold text-right">Data &amp; Ora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {liveStream.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 font-light">
                    Nessuna visita registrata al momento. Le nuove visite appariranno qui istantaneamente.
                  </td>
                </tr>
              ) : (
                liveStream.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-900 font-medium">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight size={13} className="text-[#C0A09A]" />
                        <span>{v.path}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {v.visitor_id}
                    </td>
                    <td className="py-3 px-4">
                      {v.consent_id ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck size={11} /> {v.consent_id}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">Tecnico Essenziale</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[11px] text-gray-500 font-mono">
                      {new Date(v.created_at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
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
