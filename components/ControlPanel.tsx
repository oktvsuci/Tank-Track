'use client';

import React from 'react';
import { Filter, RotateCcw, PlusCircle, Truck, Calendar, Sparkles, Gauge, AlertTriangle, TrendingUp } from 'lucide-react';
import { AggregateSummary } from '../src/types';

interface ControlPanelProps {
  filterHari: string;
  setFilterHari: (hari: string) => void;
  filterKode: string;
  setFilterKode: (kode: string) => void;
  onResetFilter: () => void;
  onOpenAddModal: () => void;
  summary: AggregateSummary | null;
  isLoading: boolean;
}

const HARI_OPTIONS = [
  { value: 'Semua', label: 'Semua Hari (7 Hari Penuh)' },
  { value: 'Senin', label: 'Senin, 03 Maret 2025' },
  { value: 'Selasa', label: 'Selasa, 04 Maret 2025' },
  { value: 'Rabu', label: 'Rabu, 05 Maret 2025' },
  { value: 'Kamis', label: 'Kamis, 06 Maret 2025' },
  { value: 'Jumat', label: 'Jumat, 07 Maret 2025' },
  { value: 'Sabtu', label: 'Sabtu, 08 Maret 2025' },
  { value: 'Minggu', label: 'Minggu, 09 Maret 2025' },
];

const KODE_OPTIONS = [
  { value: 'Semua', label: 'Semua Armada (K-04, K-07, K-12)' },
  { value: 'K-04', label: 'K-04 • 30KL (Serang – Cilegon)' },
  { value: 'K-07', label: 'K-07 • 16KL (Serang – Anyer)' },
  { value: 'K-12', label: 'K-12 • 24KL (Cilegon – Merak)' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  filterHari,
  setFilterHari,
  filterKode,
  setFilterKode,
  onResetFilter,
  onOpenAddModal,
  summary,
  isLoading,
}) => {
  const isFiltered = filterHari !== 'Semua' || filterKode !== 'Semua';

  return (
    <div id="tanktrack-control-panel" className="bg-slate-900/95 border-b border-slate-800 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Controls: Filters & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Filter Hari */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="filter-hari-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Filter Hari Operasional
              </label>
              <div className="relative">
                <select
                  id="filter-hari-select"
                  value={filterHari}
                  onChange={(e) => setFilterHari(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                >
                  {HARI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Armada */}
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="filter-kode-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                Filter Kode Armada
              </label>
              <div className="relative">
                <select
                  id="filter-kode-select"
                  value={filterKode}
                  onChange={(e) => setFilterKode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                >
                  {KODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <div className="sm:self-end">
                <button
                  id="btn-reset-filter"
                  type="button"
                  onClick={onResetFilter}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-sm font-medium transition-colors"
                  title="Kembalikan filter ke Semua Hari dan Semua Armada"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Button: + Tambah Rute Baru */}
          <div className="flex items-center gap-2 sm:self-end">
            <button
              id="btn-tambah-rute"
              type="button"
              onClick={onOpenAddModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-950/30 ring-1 ring-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Rute Baru</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Ribbon */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-800/80">
            {/* Metric 1: Total Trip */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-400 font-medium block">Total Perjalanan</span>
              <div className="text-base font-bold text-white flex items-baseline gap-1 mt-0.5">
                {summary.total_trip} <span className="text-xs text-slate-400 font-normal">Trip</span>
              </div>
            </div>

            {/* Metric 2: Total Jarak */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-400 font-medium block">Total Jarak Tempuh</span>
              <div className="text-base font-bold text-sky-400 flex items-baseline gap-1 mt-0.5">
                {summary.total_jarak_km.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">km</span>
              </div>
            </div>

            {/* Metric 3: Konsumsi BBM */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-400 font-medium block">Konsumsi Biosolar</span>
              <div className="text-base font-bold text-amber-400 flex items-baseline gap-1 mt-0.5">
                {summary.total_liter.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">Liter</span>
              </div>
            </div>

            {/* Metric 4: Efisiensi Rata-rata */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-400 font-medium block">Rata-rata Efisiensi</span>
              <div className="text-base font-bold text-emerald-400 flex items-baseline gap-1 mt-0.5">
                {summary.rata_rata_km_per_liter} <span className="text-xs text-slate-400 font-normal">km/L</span>
              </div>
            </div>

            {/* Metric 5: BBM Boros */}
            <div className="bg-rose-950/20 border border-rose-800/30 rounded-lg p-2.5">
              <span className="text-[11px] text-rose-300 font-medium block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400 inline" /> BBM Terbuang (Boros)
              </span>
              <div className="text-base font-bold text-rose-400 flex items-baseline gap-1 mt-0.5">
                +{summary.total_liter_boros.toLocaleString('id-ID')} <span className="text-xs text-rose-300/70 font-normal">Liter</span>
              </div>
            </div>

            {/* Metric 6: Total Biaya */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-400 font-medium block">Total Biaya BBM</span>
              <div className="text-base font-bold text-emerald-300 truncate mt-0.5">
                Rp {summary.total_biaya_rp.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
