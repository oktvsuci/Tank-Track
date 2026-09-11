'use client';

import React, { useState } from 'react';
import { RouteFeature } from '../src/types';
import { BATAS_EFISIEN_BOROS } from '../src/config';
import { Truck, Clock, Search, ArrowUpDown, Sun, Moon, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface FleetTableProps {
  routes: RouteFeature[];
  selectedTripId: number | null;
  onSelectTrip: (tripId: number) => void;
}

export const FleetTable: React.FC<FleetTableProps> = ({
  routes,
  selectedTripId,
  onSelectTrip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [efficiencyFilter, setEfficiencyFilter] = useState<'all' | 'efficient' | 'wasteful'>('all');
  const [sortField, setSortField] = useState<'trip_id' | 'jarak_km' | 'km_per_liter' | 'liter_boros'>('trip_id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = routes.filter((r) => {
    const prop = r.properties;
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      prop.nama.toLowerCase().includes(term) ||
      prop.kode_kendaraan.toLowerCase().includes(term) ||
      prop.trayek.toLowerCase().includes(term) ||
      prop.hari.toLowerCase().includes(term)
    );

    if (!matchesSearch) return false;

    const isBoros = prop.status_efisiensi === 'Boros' || prop.km_per_liter < BATAS_EFISIEN_BOROS;
    if (efficiencyFilter === 'efficient') return !isBoros;
    if (efficiencyFilter === 'wasteful') return isBoros;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a.properties[sortField];
    const valB = b.properties[sortField];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getFleetBadge = (kode: string) => {
    if (kode === 'K-04') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (kode === 'K-07') {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    } else if (kode === 'K-12') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div id="tanktrack-fleet-table-card" className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      {/* Header, Search & Filter Chips */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
              Daftar Log Riwayat Perjalanan ({sorted.length} Trip)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik salah satu baris perjalanan untuk memfokuskan rute langsung pada peta Leaflet
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari armada, trayek, hari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Efficiency Filter Tabs */}
        <div className="flex items-center gap-2 text-xs flex-wrap pt-1">
          <span className="text-[11px] font-medium text-slate-400">Filter Status:</span>
          <button
            type="button"
            onClick={() => setEfficiencyFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              efficiencyFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({routes.length})
          </button>
          <button
            type="button"
            onClick={() => setEfficiencyFilter('efficient')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              efficiencyFilter === 'efficient'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Efisien / Normal
          </button>
          <button
            type="button"
            onClick={() => setEfficiencyFilter('wasteful')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              efficiencyFilter === 'wasteful'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Boros (Macet)
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-md z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('trip_id')}>
                <div className="flex items-center gap-1">
                  Trip <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Armada & Koridor Trayek</th>
              <th className="py-2.5 px-3">Waktu & Durasi</th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('jarak_km')}>
                <div className="flex items-center gap-1">
                  Jarak <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('km_per_liter')}>
                <div className="flex items-center gap-1">
                  Efisiensi Riil <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('liter_boros')}>
                <div className="flex items-center gap-1">
                  BBM Terbuang <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Biaya Biosolar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((item) => {
              const p = item.properties;
              const isSelected = selectedTripId === p.trip_id;
              const isBoros = p.status_efisiensi === 'Boros' || p.km_per_liter < BATAS_EFISIEN_BOROS;
              const isNight = p.malam;

              return (
                <tr
                  key={p.trip_id}
                  onClick={() => onSelectTrip(p.trip_id)}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 text-slate-900 font-medium border-l-4 border-blue-600 shadow-2xs'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    <span className="flex items-center gap-1">
                      #{p.trip_id}
                      {isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getFleetBadge(p.kode_kendaraan)}`}>
                        {p.kode_kendaraan}
                      </span>
                      <span>{p.trayek}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">{p.arah}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {isNight ? (
                        <span className="p-1 rounded bg-indigo-50 text-indigo-700" title="Trip Malam">
                          <Moon className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-amber-50 text-amber-700" title="Trip Siang">
                          <Sun className="w-3 h-3" />
                        </span>
                      )}
                      <span className="font-medium text-slate-800">{p.hari}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> {p.jam_mulai} - {p.jam_selesai} ({p.durasi_menit}m)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {p.jarak_km} km
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className={`font-bold ${isBoros ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {p.km_per_liter} km/L
                      </span>
                      {isBoros ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-sans font-semibold">
                          Macet
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans font-semibold">
                          Efisien
                        </span>
                      )}
                    </div>
                    {/* Mini visual gauge relative to 3.20 km/L */}
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${isBoros ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.round((p.km_per_liter / 3.4) * 100))}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {p.liter_boros > 0 ? (
                      <div>
                        <span className="text-rose-700 font-bold">+{p.liter_boros} L</span>
                        <span className="block text-[10px] text-rose-500">Rp {p.biaya_boros_rp.toLocaleString('id-ID')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">0.0 L (Sesuai)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Rp {p.biaya_rp.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  Tidak ada data perjalanan yang cocok dengan pencarian atau filter efisiensi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetTable;
