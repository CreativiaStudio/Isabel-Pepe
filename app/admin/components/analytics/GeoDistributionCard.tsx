'use client';

import React from 'react';
import { MapPin, Globe, ArrowUpRight, Building2 } from 'lucide-react';
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

interface GeoDistributionCardProps {
  cities: GeoMetric[];
  countries: CountryMetric[];
  onOpenGeoModal: () => void;
  isLoading?: boolean;
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
};

export default function GeoDistributionCard({
  cities = [],
  countries = [],
  onOpenGeoModal,
  isLoading = false,
}: GeoDistributionCardProps) {
  const topCities = cities.slice(0, 6);
  const topCountries = countries.slice(0, 5);

  const maxCityVisitors = Math.max(...topCities.map((c) => c.visitors_count || 0), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Globe size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900 tracking-wide">
                Distribuzione Geografica
              </h3>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                Presidio territoriale in Italia e mercati internazionali
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenGeoModal}
            className="text-xs text-[#8C6558] hover:text-gray-900 font-medium flex items-center gap-1 cursor-pointer transition"
          >
            <span>Dettaglio Geo</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Split Grid: Countries & Italian Cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. PAESI INTERNAZIONALI */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-3">
              🌍 Mercati Principali
            </span>

            {topCountries.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs font-light">
                Nessun dato paese.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topCountries.map((co) => (
                  <div key={co.country_code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-gray-800">
                        <span className="text-sm">
                          {COUNTRY_FLAGS[co.country_code.toUpperCase()] || '🌐'}
                        </span>
                        <span>{co.country_name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-gray-900 font-semibold">
                          {co.unique_visitors} utenti
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          ({co.share_percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#C0A09A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, co.share_percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. CITTÀ ITALIANE */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-3">
              📍 Top Città Italiane
            </span>

            {topCities.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs font-light">
                Nessun dato città.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topCities.map((ci, idx) => {
                  const cityBarWidth = maxCityVisitors > 0 ? (ci.visitors_count / maxCityVisitors) * 100 : 0;

                  return (
                    <div
                      key={ci.city + idx}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-gray-400 w-3">
                          {idx + 1}.
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-medium text-gray-900 block truncate">
                            {ci.city}
                          </span>
                          {ci.region && (
                            <span className="text-[10px] text-gray-400 block font-light">
                              {ci.region}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-semibold text-gray-900 block">
                          {ci.visitors_count}
                        </span>
                        {ci.orders_count > 0 && (
                          <span className="text-[10px] font-mono text-emerald-600 font-medium block">
                            {ci.orders_count} ordini
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Intelligence geografica basata su IP anonimizzati
        </span>
        <button
          type="button"
          onClick={onOpenGeoModal}
          className="text-xs text-[#8C6558] hover:text-[#1A1A1A] font-semibold flex items-center gap-1 cursor-pointer transition"
        >
          <span>Esplora tutte le {cities.length} città</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
