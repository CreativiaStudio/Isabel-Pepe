'use client';

import React, { useState } from 'react';
import { Calendar, X, Check, Clock } from 'lucide-react';

interface CustomDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (from: string, to: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

export default function CustomDateRangeModal({
  isOpen,
  onClose,
  onApply,
  initialFrom = '',
  initialTo = '',
}: CustomDateRangeModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState(initialFrom || todayStr);
  const [to, setTo] = useState(initialTo || todayStr);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreset = (daysAgo: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    setFrom(start.toISOString().split('T')[0]);
    setTo(end.toISOString().split('T')[0]);
    setError(null);
  };

  const handlePresetMonth = (monthsAgo: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    setFrom(start.toISOString().split('T')[0]);
    setTo(end.toISOString().split('T')[0]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError('Inserisci sia la data di inizio che quella di fine.');
      return;
    }
    if (new Date(from) > new Date(to)) {
      setError('La data di inizio non può essere successiva alla data di fine.');
      return;
    }
    setError(null);
    onApply(from, to);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-gray-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition cursor-pointer"
          aria-label="Chiudi"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF3F0] flex items-center justify-center text-[#C0A09A]">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="font-serif text-xl text-gray-900">Intervallo Personalizzato</h3>
            <p className="text-xs text-gray-400 font-light">Seleziona le date per filtrare le metriche</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-2">
            Scorciatoie Rapide
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePreset(3)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Ultimi 3 gg
            </button>
            <button
              type="button"
              onClick={() => handlePreset(14)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Ultimi 14 gg
            </button>
            <button
              type="button"
              onClick={() => handlePreset(60)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Ultimi 60 gg
            </button>
            <button
              type="button"
              onClick={() => handlePreset(90)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Ultimi 90 gg
            </button>
            <button
              type="button"
              onClick={() => handlePresetMonth(1)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Mese Scorso
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setFrom(`${now.getFullYear()}-01-01`);
                setTo(todayStr);
                setError(null);
              }}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-[#FAF3F0] hover:text-[#8C6558] hover:border-[#C0A09A]/40 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer text-gray-700"
            >
              Anno Corrente
            </button>
          </div>
        </div>

        {/* Date Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                Data Inizio *
              </label>
              <input
                type="date"
                required
                value={from}
                max={todayStr}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                Data Fine *
              </label>
              <input
                type="date"
                required
                value={to}
                max={todayStr}
                onChange={(e) => {
                  setTo(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-[#C0A09A] transition font-mono bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#C0A09A] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check size={14} />
              <span>Applica Filtro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
