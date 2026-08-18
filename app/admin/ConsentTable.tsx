'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, XCircle, Search, Calendar, Globe, UserCheck, RefreshCw } from 'lucide-react';

interface ConsentItem {
  id: string;
  consent_id: string;
  visitor_id: string;
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  consent_type: string;
  ip_address: string;
  user_agent: string;
  policy_version: string;
  created_at: string;
  updated_at: string;
}

interface ConsentTableProps {
  consents: ConsentItem[];
}

export default function ConsentTable({ consents = [] }: ConsentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'essential' | 'marketing'>('all');

  const filteredConsents = consents.filter((item) => {
    const matchesSearch =
      item.consent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.visitor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'marketing') return item.marketing === true;
    if (filterType === 'essential') return item.marketing === false && item.analytics === false;
    return true;
  });

  const totalConsents = consents.length;
  const marketingAccepted = consents.filter((c) => c.marketing).length;
  const analyticsAccepted = consents.filter((c) => c.analytics).length;
  const essentialOnly = consents.filter((c) => !c.marketing && !c.analytics).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={24} className="text-[#C0A09A]" />
            <h1 className="font-serif text-3xl text-gray-900 tracking-wide">
              Registro Consensi GDPR
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-light">
            Tracciamento legale dei consensi cookie e privacy ai sensi del Regolamento UE 2016/679
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Aggiorna</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Totale Consensi Registrati
          </span>
          <div className="text-2xl font-serif text-gray-900 font-semibold">{totalConsents}</div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-block">
            100% Prova Legale Archiviata
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Consenso Marketing (CRM/Offerte)
          </span>
          <div className="text-2xl font-serif text-[#C0A09A] font-semibold">{marketingAccepted}</div>
          <span className="text-[10px] text-gray-500">
            {totalConsents > 0 ? Math.round((marketingAccepted / totalConsents) * 100) : 0}% degli utenti
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Consenso Analitico
          </span>
          <div className="text-2xl font-serif text-gray-900 font-semibold">{analyticsAccepted}</div>
          <span className="text-[10px] text-gray-500">
            {totalConsents > 0 ? Math.round((analyticsAccepted / totalConsents) * 100) : 0}% degli utenti
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-1">
            Solo Tecnici / Necessari
          </span>
          <div className="text-2xl font-serif text-gray-700 font-semibold">{essentialOnly}</div>
          <span className="text-[10px] text-gray-500">
            {totalConsents > 0 ? Math.round((essentialOnly / totalConsents) * 100) : 0}% degli utenti
          </span>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per ID Consenso, Visitor ID o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#C0A09A] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tutti ({totalConsents})
          </button>
          <button
            onClick={() => setFilterType('marketing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === 'marketing'
                ? 'bg-[#C0A09A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Marketing OK ({marketingAccepted})
          </button>
          <button
            onClick={() => setFilterType('essential')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterType === 'essential'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Solo Tecnici ({essentialOnly})
          </button>
        </div>
      </div>

      {/* Tabella Registri Consensi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-4 font-semibold">ID Consenso</th>
                <th className="py-3.5 px-4 font-semibold">Visitor ID</th>
                <th className="py-3.5 px-4 font-semibold text-center">Tecnici</th>
                <th className="py-3.5 px-4 font-semibold text-center">Funzionali</th>
                <th className="py-3.5 px-4 font-semibold text-center">Analitici</th>
                <th className="py-3.5 px-4 font-semibold text-center">Marketing</th>
                <th className="py-3.5 px-4 font-semibold">Tipo / Versione</th>
                <th className="py-3.5 px-4 font-semibold">IP &amp; Dispositivo</th>
                <th className="py-3.5 px-4 font-semibold text-right">Data &amp; Ora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredConsents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 font-light">
                    <ShieldCheck size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">Nessun consenso registrato trovato</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">I nuovi consensi rilasciati dagli utenti appariranno qui in tempo reale.</p>
                  </td>
                </tr>
              ) : (
                filteredConsents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-900 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Lock size={12} className="text-[#C0A09A]" />
                        <span>{item.consent_id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                      {item.visitor_id || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center text-emerald-600 font-semibold text-[10px]">
                        <CheckCircle2 size={14} className="mr-0.5" /> OK
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.functional ? (
                        <span className="inline-flex items-center text-emerald-600 font-semibold text-[10px]">
                          <CheckCircle2 size={14} className="mr-0.5" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-300 text-[10px]">
                          <XCircle size={14} className="mr-0.5" /> NO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.analytics ? (
                        <span className="inline-flex items-center text-emerald-600 font-semibold text-[10px]">
                          <CheckCircle2 size={14} className="mr-0.5" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-300 text-[10px]">
                          <XCircle size={14} className="mr-0.5" /> NO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.marketing ? (
                        <span className="inline-flex items-center bg-rose-50 text-[#8A5E58] px-2 py-0.5 rounded-full font-semibold text-[10px] border border-[#C0A09A]/40">
                          <CheckCircle2 size={12} className="mr-1 text-[#C0A09A]" /> Attivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-gray-300 text-[10px]">
                          <XCircle size={14} className="mr-0.5" /> Negato
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-gray-700 font-medium uppercase tracking-wider block">
                        {item.consent_type}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">v{item.policy_version || '1.0'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-gray-600">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Globe size={11} className="text-gray-400" />
                        <span>{item.ip_address || 'Anonimo'}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 block truncate max-w-[140px]" title={item.user_agent}>
                        {item.user_agent || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[11px] text-gray-500 font-mono">
                      {new Date(item.created_at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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
