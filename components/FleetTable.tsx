'use client';

import React, { useState } from 'react';
import { RouteFeature } from '../src/types';
import { Truck, Clock, Fuel, Search, ArrowUpDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [sortField, setSortField] = useState<'trip_id' | 'jarak_km' | 'km_per_liter' | 'liter_boros'>('trip_id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = routes.filter((r) => {
    const prop = r.properties;
    const term = searchTerm.toLowerCase();
    return (
      prop.nama.toLowerCase().includes(term) ||
      prop.kode_kendaraan.toLowerCase().includes(term) ||
      prop.trayek.toLowerCase().includes(term) ||
      prop.hari.toLowerCase().includes(term)
    );
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

  return (
    <div id="tanktrack-fleet-table-card" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            Daftar Perjalanan Armada Terfilter ({sorted.length} Trip)
          </h3>
          <p className="text-xs text-slate-400">Klik baris perjalanan untuk menyorot rutenya di peta WebGIS</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari trip, kode armada, trayek..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-[11px] text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 border-b border-slate-700">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('trip_id')}>
                <div className="flex items-center gap-1">
                  Trip <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Armada / Trayek</th>
              <th className="py-2.5 px-3">Waktu</th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('jarak_km')}>
                <div className="flex items-center gap-1">
                  Jarak <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('km_per_liter')}>
                <div className="flex items-center gap-1">
                  Efisiensi <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('liter_boros')}>
                <div className="flex items-center gap-1">
                  BBM Boros <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Biaya BBM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.map((item) => {
              const p = item.properties;
              const isSelected = selectedTripId === p.trip_id;
              const isBoros = p.status_efisiensi === 'Boros' || p.km_per_liter < 2.70;

              return (
                <tr
                  key={p.trip_id}
                  onClick={() => onSelectTrip(p.trip_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-900/30 text-white font-medium border-l-4 border-blue-500'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                    #{p.trip_id}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 font-mono text-blue-400">
                        {p.kode_kendaraan}
                      </span>
                      <span>{p.trayek}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.arah}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="block font-medium text-slate-200">{p.hari}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.jam_mulai} - {p.jam_selesai} ({p.durasi_menit} m)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {p.jarak_km} km
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <span className={isBoros ? 'text-rose-400' : 'text-emerald-400'}>
                        {p.km_per_liter} km/L
                      </span>
                      {isBoros ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">Macet</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Efisien</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {p.liter_boros > 0 ? (
                      <span className="text-rose-400 font-bold">+{p.liter_boros} L</span>
                    ) : (
                      <span className="text-slate-500">0.0 L</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                    Rp {p.biaya_rp.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Tidak ada data perjalanan yang cocok dengan kriteria filter.
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
