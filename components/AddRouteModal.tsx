'use client';

import React, { useState } from 'react';
import { X, Plus, MapPin, Truck, Calendar, Clock, Gauge } from 'lucide-react';
import { RouteFeature, PointFeature } from '../src/types';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoute: (newRoute: RouteFeature, newPoints: PointFeature[]) => void;
}

const PRESET_COORDS = [
  { label: 'Depo Serang (Pusat)', lat: -6.120401, lng: 106.184492 },
  { label: 'Terminal Cilegon (Krakatau)', lat: -6.002890, lng: 106.024787 },
  { label: 'Kawasan Anyer (Jl. Raya Anyer)', lat: -6.053216, lng: 105.922737 },
  { label: 'Gerbang Pelabuhan Merak', lat: -5.932069, lng: 105.997560 },
];

export const AddRouteModal: React.FC<AddRouteModalProps> = ({
  isOpen,
  onClose,
  onAddRoute,
}) => {
  const [kodeKendaraan, setKodeKendaraan] = useState<string>('K-04');
  const [trayek, setTrayek] = useState<string>('Serang – Cilegon (Jalur Cepat Tambahan)');
  const [hari, setHari] = useState<string>('Senin');
  const [tanggal, setTanggal] = useState<string>('03-03-2025');
  const [jamMulai, setJamMulai] = useState<string>('14:00');
  const [durasiMenit, setDurasiMenit] = useState<number>(45);
  const [jarakKm, setJarakKm] = useState<number>(28.5);
  const [kmPerLiter, setKmPerLiter] = useState<number>(2.75);
  const [latAwal, setLatAwal] = useState<number>(-6.120401);
  const [lngAwal, setLngAwal] = useState<number>(106.184492);
  const [latAkhir, setLatAkhir] = useState<number>(-6.002890);
  const [lngAkhir, setLngAkhir] = useState<number>(106.024787);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tripId = Date.now();
    const literJalan = Math.round((jarakKm / kmPerLiter) * 100) / 100;
    const literIdle = kmPerLiter < 2.7 ? 0.35 : 0.05;
    const literTotal = Math.round((literJalan + literIdle) * 100) / 100;
    const biayaRp = Math.round(literTotal * 6800);

    const literIdeal = Math.round((jarakKm / 3.20) * 100) / 100;
    const literBoros = Math.max(0, Math.round((literTotal - literIdeal) * 100) / 100);
    const biayaBorosRp = Math.round(literBoros * 6800);

    // Calculate end time
    const [h, m] = jamMulai.split(':').map(Number);
    const totalMinutes = h * 60 + m + durasiMenit;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const jamSelesai = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // Create intermediate path coordinates between start and end
    const midLat = (latAwal + latAkhir) / 2;
    const midLng = (lngAwal + lngAkhir) / 2;

    const coordinates: [number, number][] = [
      [lngAwal, latAwal],
      [(lngAwal * 2 + midLng) / 3, (latAwal * 2 + midLat) / 3],
      [midLng, midLat],
      [(lngAkhir * 2 + midLng) / 3, (latAkhir * 2 + midLat) / 3],
      [lngAkhir, latAkhir],
    ];

    const newRouteFeature: RouteFeature = {
      type: 'Feature',
      properties: {
        trip_id: tripId,
        nama: `Trip Tambahan (${kodeKendaraan})`,
        kendaraan: kodeKendaraan === 'K-04' ? 'Truk tangki 30KL' : kodeKendaraan === 'K-07' ? 'Truk tangki 16KL' : 'Truk tangki 24KL',
        kode_kendaraan: kodeKendaraan,
        trayek,
        arah: `Depo Awal ke Titik Tujuan`,
        hari,
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        jam_berangkat: h,
        durasi_menit: durasiMenit,
        kecepatan_rata: Math.round((jarakKm / (durasiMenit / 60)) * 10) / 10,
        kecepatan_maks: Math.round(((jarakKm / (durasiMenit / 60)) + 12) * 10) / 10,
        jumlah_titik: coordinates.length,
        jarak_km: jarakKm,
        liter_total: literTotal,
        liter_jalan: literJalan,
        liter_idle: literIdle,
        menit_idle: kmPerLiter < 2.7 ? 2.5 : 0.5,
        liter_per_100km: Math.round((literTotal / jarakKm) * 100 * 100) / 100,
        km_per_liter: kmPerLiter,
        biaya_rp: biayaRp,
        liter_boros: literBoros,
        biaya_boros_rp: biayaBorosRp,
        jenis_bbm: 'Biosolar',
        harga_per_liter: 6800,
        malam: h >= 21 || h <= 5,
        status_efisiensi: kmPerLiter >= 2.90 ? 'Efisien' : kmPerLiter >= 2.70 ? 'Normal' : 'Boros',
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };

    const newPoints: PointFeature[] = [
      {
        type: 'Feature',
        properties: {
          trip_id: tripId,
          kode_kendaraan: kodeKendaraan,
          trayek,
          jenis: 'Titik Awal',
          hari,
          tanggal,
          waktu: `${tanggal} ${jamMulai}`,
          jarak_km: jarakKm,
          liter_total: literTotal,
          biaya_rp: biayaRp,
        },
        geometry: {
          type: 'Point',
          coordinates: [lngAwal, latAwal],
        },
      },
      {
        type: 'Feature',
        properties: {
          trip_id: tripId,
          kode_kendaraan: kodeKendaraan,
          trayek,
          jenis: 'Titik Akhir',
          hari,
          tanggal,
          waktu: `${tanggal} ${jamSelesai}`,
          jarak_km: jarakKm,
          liter_total: literTotal,
          biaya_rp: biayaRp,
        },
        geometry: {
          type: 'Point',
          coordinates: [lngAkhir, latAkhir],
        },
      },
    ];

    onAddRoute(newRouteFeature, newPoints);
    onClose();
  };

  const applyPresetAwal = (index: number) => {
    const p = PRESET_COORDS[index];
    setLatAwal(p.lat);
    setLngAwal(p.lng);
  };

  const applyPresetAkhir = (index: number) => {
    const p = PRESET_COORDS[index];
    setLatAkhir(p.lat);
    setLngAkhir(p.lng);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fadeIn">
      <div
        id="add-route-modal-card"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl text-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="font-semibold text-base text-slate-900">Tambah Rute Operasional Baru</h3>
            <p className="text-xs text-slate-500">Simulasikan rute perjalanan tambahan ke peta WebGIS</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Row 1: Kode Kendaraan & Hari */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Kode Armada Kendaraan
              </label>
              <select
                value={kodeKendaraan}
                onChange={(e) => {
                  const val = e.target.value;
                  setKodeKendaraan(val);
                  if (val === 'K-04') setTrayek('Serang – Cilegon (Jalur Nasional)');
                  else if (val === 'K-07') setTrayek('Serang – Anyer (Pesisir Wisata)');
                  else setTrayek('Cilegon – Merak (Koridor Pelabuhan)');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
              >
                <option value="K-04">K-04 (Truk Tangki 30KL)</option>
                <option value="K-07">K-07 (Truk Tangki 16KL)</option>
                <option value="K-12">K-12 (Truk Tangki 24KL)</option>
                <option value="K-SIM">K-SIM (Truk Tangki Cadangan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Hari Operasional
              </label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>
          </div>

          {/* Trayek */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama Trayek / Koridor</label>
            <input
              type="text"
              value={trayek}
              onChange={(e) => setTrayek(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs"
              required
            />
          </div>

          {/* Row 2: Jam, Durasi, Jarak */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Jam Mulai
              </label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Durasi (Menit)</label>
              <input
                type="number"
                min="10"
                max="240"
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jarak (km)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="300"
                value={jarakKm}
                onChange={(e) => setJarakKm(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          {/* Efisiensi BBM Input */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Estimasi Efisiensi BBM (km / Liter)
              </span>
              <span className={`font-mono text-xs font-semibold ${kmPerLiter >= 2.7 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {kmPerLiter} km/L ({kmPerLiter < 2.7 ? 'Macet / Idling' : 'Efisien'})
              </span>
            </label>
            <input
              type="range"
              min="2.10"
              max="3.40"
              step="0.05"
              value={kmPerLiter}
              onChange={(e) => setKmPerLiter(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>2.10 (Macet Padat)</span>
              <span>Acuan Standar: 3.20 km/L</span>
              <span>3.40 (Lancar Subuh)</span>
            </div>
          </div>

          {/* Koordinat Awal [Lat, Long] */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Titik Awal (Depo)
              </span>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyPresetAwal(0)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                >
                  Depo Serang
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAwal(1)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                >
                  Cilegon
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Latitude</span>
                <input
                  type="number"
                  step="0.000001"
                  value={latAwal}
                  onChange={(e) => setLatAwal(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Longitude</span>
                <input
                  type="number"
                  step="0.000001"
                  value={lngAwal}
                  onChange={(e) => setLngAwal(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Koordinat Akhir [Lat, Long] */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Titik Akhir (Tujuan)
              </span>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyPresetAkhir(1)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                >
                  Cilegon
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAkhir(2)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                >
                  Anyer
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetAkhir(3)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700"
                >
                  Merak
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500">Latitude</span>
                <input
                  type="number"
                  step="0.000001"
                  value={latAkhir}
                  onChange={(e) => setLatAkhir(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Longitude</span>
                <input
                  type="number"
                  step="0.000001"
                  value={lngAkhir}
                  onChange={(e) => setLngAkhir(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98]"
            >
              Simpan & Tampilkan ke Peta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRouteModal;
