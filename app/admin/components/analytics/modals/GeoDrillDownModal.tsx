'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Download, 
  MapPin, 
  Globe, 
  Clock, 
  TrendingUp, 
  ShoppingBag,
  Building2,
  Flag
} from 'lucide-react';
import { GeoMetric } from '@/types/analytics';

interface CountryMetric {
  country_code: string;
  country_name: string;
  unique_visitors: number;
  sessions: number;
  orders: number;
  revenue: number;
  share_percentage: number;
}

interface GeoDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: GeoMetric[];
  countries: CountryMetric[];
  timeRangeLabel?: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  IT: '🇮🇹',
  CH: '🇨🇭',
  DE: '🇩🇪',
  FR: '🇫🇷',
  GB: '🇬🇧',
  UK: '🇬🇧',
  US: '🇺🇸',
  ES: '🇪🇸',
  AT: '🇦🇹',
  MC: '🇲🇨',
  BE: '🇧🇪',
  NL: '🇳🇱',
  AE: '🇦🇪',
  SM: '🇸🇲',
};

export default function GeoDrillDownModal({
  isOpen,
  onClose,
  cities = [],
  countries = [],
  timeRangeLabel = 'Periodo Selezionato',
}: GeoDrillDownModalProps) {
  const [activeTab, setActiveTab] = useState<'cities' | 'countries'>('cities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  if (!isOpen) return null;

  // Extract unique regions for filter
  const regionsList = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => {
      if (c.region) set.add(c.region);
    });
    return Array.from(set).sort();
  }, [cities]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    let list = [...cities];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.city?.toLowerCase().includes(q) ||
          c.region?.toLowerCase().includes(q) ||
          c.country?.toLowerCase().includes(q)
      );
    }
    if (selectedRegion !== 'all') {
      list = list.filter((c) => c.region === selectedRegion);
    }
    return list;
  }, [cities, searchTerm, selectedRegion]);

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const q = searchTerm.toLowerCase().trim();
    return countries.filter(
      (c) =>
        c.country_name?.toLowerCase().includes(q) ||
        c.country_code?.toLowerCase().includes(q)
    );
  }, [countries, searchTerm]);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (activeTab === 'cities') {
      headers = [
        'Città',
        'Regione',
        'Paese',
        'Visitatori Unici',
        'Sessioni Totali',
        'Ordini Conclusi',
        'Fatturato (€)',
        'Tasso di Conversione (%)',
      ];
      rows = filteredCities.map((c) => [
        `"${c.city}"`,
        `"${c.region || 'N/A'}"`,
        `"${c.country}"`,
        c.visitors_count,
        c.sessions_count,
        c.orders_count,
        c.revenue,
        `${c.conversion_rate}%`,
      ]);
      filename = `isabel_pepe_geo_citta_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = [
        'Codice Paese',
        'Nome Paese',
        'Visitatori Unici',
        'Sessioni Totali',
        'Quota Traffico (%)',
        'Ordini Conclusi',
        'Fatturato (€)',
      ];
      rows = filteredCountries.map((c) => [
        `"${c.country_code}"`,
        `"${c.country_name}"`,
        c.unique_visitors,
        c.sessions,
        `${c.share_percentage}%`,
        c.orders,
        c.revenue,
      ]);
      filename = `isabel_pepe_geo_paesi_${new Date().toISOString().split('T')[0]}.csv`;
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
              <MapPin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl text-gray-900 tracking-wide">
                  Distribuzione Geografica &amp; Intelligence Territoriale
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Dettaglio capillare per città metropolitane, province italiane e paesi esteri • {timeRangeLabel}
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

        {/* Tab & Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('cities'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cities'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 size={13} />
              <span>Città Italiane ({cities.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('countries'); setSearchTerm(''); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'countries'
                  ? 'bg-[#C0A09A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Globe size={13} />
              <span>Paesi Internazionali ({countries.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'cities' && regionsList.length > 0 && (
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs text-gray-800 font-medium outline-none cursor-pointer"
              >
                <option value="all">Tutte le Regioni</option>
                {regionsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'cities' ? 'Cerca per città...' : 'Cerca per nazione...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-y-auto p-0">
          {/* TAB 1: CITTÀ ITALIANE */}
          {activeTab === 'cities' && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Città &amp; Territorio</th>
                  <th className="py-3.5 px-3 font-semibold">Regione</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Visitatori Unici</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sessioni</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Ordini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fatturato</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-light">
                      Nessuna città registrata nel periodo con i filtri correnti.
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((c, idx) => (
                    <tr key={c.city + c.country + idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400 w-5">{idx + 1}.</span>
                          <MapPin size={13} className="text-[#8C6558] shrink-0" />
                          <span className="font-medium text-xs text-gray-900">{c.city}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-600 text-xs">
                        {c.region || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {c.visitors_count.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                        {c.sessions_count.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-900 font-semibold">
                        {c.orders_count}
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

          {/* TAB 2: PAESI INTERNAZIONALI */}
          {activeTab === 'countries' && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#FAF8F5] border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-600 z-10 select-none">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Paese / Nazione</th>
                  <th className="py-3.5 px-3 font-semibold">Codice ISO</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Visitatori Unici</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Sessioni</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Quota Traffico</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Ordini</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fatturato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-light">
                      Nessun paese registrato nel periodo.
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((co, idx) => (
                    <tr key={co.country_code + idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 font-medium text-gray-900 text-xs">
                          <span className="text-base leading-none">
                            {COUNTRY_FLAGS[co.country_code.toUpperCase()] || '🌐'}
                          </span>
                          <span>{co.country_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {co.country_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-semibold">
                        {co.unique_visitors.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                        {co.sessions.toLocaleString('it-IT')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-gray-900 text-xs">{co.share_percentage}%</span>
                          <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#C0A09A] h-full rounded-full"
                              style={{ width: `${Math.min(100, co.share_percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-900 font-semibold">
                        {co.orders}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                        €{co.revenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
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
