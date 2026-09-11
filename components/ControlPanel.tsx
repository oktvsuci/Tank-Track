'use client';

import React from 'react';
import {
  RotateCcw,
  Plus,
  Truck,
  Calendar,
  AlertCircle,
  Route,
  Gauge,
  Fuel,
  Banknote,
  Moon,
  Sun,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { AggregateSummary } from '../src/types';
import { EFISIENSI_ACUAN_STANDAR } from '../src/config';

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
  { value: 'Semua', label: 'Semua Hari (03–09 Maret 2025)' },
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
  { value: 'K-04', label: 'K-04 (Truk Tangki 30KL • Serang – Cilegon)' },
  { value: 'K-07', label: 'K-07 (Truk Tangki 16KL • Serang – Anyer)' },
  { value: 'K-12', label: 'K-12 (Truk Tangki 24KL • Cilegon – Merak)' },
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

  const efisienPct = summary && summary.total_liter > 0
    ? Math.round(((summary.total_liter - summary.total_liter_boros) / summary.total_liter) * 1000) / 10
    : 86.9;
  const borosPct = summary && summary.total_liter > 0
    ? Math.round((summary.total_liter_boros / summary.total_liter) * 1000) / 10
    : 13.1;

  return (
    <div id="tanktrack-control-panel" className="bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 space-y-4">
        {/* Top Controls: Filter Selectors & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Filter Hari */}
            <div className="flex-1 min-w-[210px]">
              <label
                htmlFor="filter-hari-select"
                className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-2.5 h-2.5" />
                </div>
                Pilih Hari Operasi
              </label>
              <div className="relative">
                <select
                  id="filter-hari-select"
                  value={filterHari}
                  onChange={(e) => setFilterHari(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-white border border-slate-300 hover:border-blue-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
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
            <div className="flex-1 min-w-[230px]">
              <label
                htmlFor="filter-kode-select"
                className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-2.5 h-2.5" />
                </div>
                Pilih Armada Kendaraan
              </label>
              <div className="relative">
                <select
                  id="filter-kode-select"
                  value={filterKode}
                  onChange={(e) => setFilterKode(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-white border border-slate-300 hover:border-emerald-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                  title="Kembalikan semua filter ke kondisi awal"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Simulasi Tambah Rute</span>
            </button>
          </div>
        </div>

        {/* 6 Rich KPI Metric Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            {/* 1. Total Trip */}
            <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Perjalanan</span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Route className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">
                  {summary.total_trip} <span className="text-xs font-normal text-slate-500">Trip</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span className="text-blue-700 font-medium">{summary.siang.total_trip} Siang</span>
                  <span>•</span>
                  <span className="text-indigo-700 font-medium">{summary.malam.total_trip} Malam</span>
                </div>
              </div>
            </div>

            {/* 2. Total Jarak */}
            <div className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jarak Tempuh</span>
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {summary.total_jarak_km.toLocaleString('id-ID')} <span className="text-xs font-sans font-normal text-slate-500">km</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Rata-rata: <strong className="text-slate-700">{summary.total_trip > 0 ? (summary.total_jarak_km / summary.total_trip).toFixed(1) : '0.0'} km/trip</strong>
                </div>
              </div>
            </div>

            {/* 3. Konsumsi BBM */}
            <div className="bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Konsumsi BBM</span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Fuel className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {summary.total_liter.toLocaleString('id-ID')} <span className="text-xs font-sans font-normal text-slate-500">L</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Biosolar B35 bersubsidi
                </div>
              </div>
            </div>

            {/* 4. Rata-rata Efisiensi */}
            <div className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Efisiensi Rata-rata</span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-700 tracking-tight font-mono flex items-baseline gap-1">
                  {summary.rata_rata_km_per_liter} <span className="text-xs font-sans font-normal text-emerald-600">km/L</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>Standar: <strong>{EFISIENSI_ACUAN_STANDAR.toFixed(2)}</strong></span>
                  <span className="text-emerald-700 font-semibold font-mono">
                    {Math.round((summary.rata_rata_km_per_liter / EFISIENSI_ACUAN_STANDAR) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 5. BBM Boros (Macet & Idling) */}
            <div className="bg-rose-50/40 border border-rose-200/80 hover:border-rose-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" /> Boros (Macet)
                </span>
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-rose-700 tracking-tight font-mono">
                  +{summary.total_liter_boros.toLocaleString('id-ID')} <span className="text-xs font-sans font-normal text-rose-600">L</span>
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5 font-medium">
                  Rugi: Rp {summary.total_biaya_boros_rp.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* 6. Total Biaya */}
            <div className="bg-white border border-slate-200 hover:border-violet-300 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Biaya BBM</span>
                <div className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 tracking-tight font-mono">
                  Rp {summary.total_biaya_rp.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Rp {summary.total_jarak_km > 0 ? Math.round(summary.total_biaya_rp / summary.total_jarak_km).toLocaleString('id-ID') : '0'}/km
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visual Efficiency Ratio Bar */}
        {summary && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Rasio Efisiensi Penggunaan Biosolar:
                </span>
                <span className="text-[11px] text-slate-500">
                  {summary.total_liter.toLocaleString('id-ID')} Liter Total
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-blue-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Efisien ({efisienPct}%)
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Terbuang Macet ({borosPct}%)
                </span>
              </div>
            </div>

            {/* Multi-segment Progress bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${efisienPct}%` }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500"
                title={`Efisiensi Terpakai Normal: ${efisienPct}%`}
              ></div>
              <div
                style={{ width: `${borosPct}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`BBM Terbuang Macet: ${borosPct}%`}
              ></div>
            </div>

            {/* Micro Comparison Night vs Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-4 h-4 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Moon className="w-2.5 h-2.5" />
                </div>
                <span>
                  Operasional Malam (Lancar): <strong className="text-indigo-900 font-semibold font-mono">{summary.malam.rata_rata_km_per_liter} km/L</strong> • Pemborosan hanya <strong className="text-slate-700 font-mono">+{summary.malam.total_liter_boros}L</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-4 h-4 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-2.5 h-2.5" />
                </div>
                <span>
                  Operasional Siang (Macet): <strong className="text-amber-900 font-semibold font-mono">{summary.siang.rata_rata_km_per_liter} km/L</strong> • Pemborosan mencapai <strong className="text-rose-700 font-mono">+{summary.siang.total_liter_boros}L</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
