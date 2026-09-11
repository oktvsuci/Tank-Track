'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import MapView from '../components/MapView';
import DigitalReceipt from '../components/DigitalReceipt';
import AddRouteModal from '../components/AddRouteModal';
import FleetTable from '../components/FleetTable';
import { RouteFeature, PointFeature, AggregateSummary, GeoJSONRouteCollection, GeoJSONPointCollection, SummaryResponse } from '../src/types';
import { Info, CheckCircle2, Truck, Navigation, TrendingUp, AlertTriangle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function TankTrackDashboard() {
  const [filterHari, setFilterHari] = useState<string>('Semua');
  const [filterKode, setFilterKode] = useState<string>('Semua');
  const [routes, setRoutes] = useState<RouteFeature[]>([]);
  const [points, setPoints] = useState<PointFeature[]>([]);
  const [summary, setSummary] = useState<AggregateSummary | null>(null);
  const [temporaryRoute, setTemporaryRoute] = useState<RouteFeature | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'loading' | 'offline'>('loading');
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch data from API based on active filters
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setServerStatus('loading');
    try {
      const queryParams = new URLSearchParams();
      if (filterHari !== 'Semua') queryParams.append('hari', filterHari);
      if (filterKode !== 'Semua') queryParams.append('kode', filterKode);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [ruteRes, titikRes, ringkasanRes] = await Promise.all([
        fetch(`/api/rute${queryString}`),
        fetch(`/api/titikujung${queryString}`),
        fetch(`/api/ringkasan${queryString}`),
      ]);

      if (!ruteRes.ok || !titikRes.ok || !ringkasanRes.ok) {
        throw new Error('Gagal mengambil data dari API');
      }

      const ruteData: GeoJSONRouteCollection = await ruteRes.json();
      const titikData: GeoJSONPointCollection = await titikRes.json();
      const ringkasanData: SummaryResponse = await ringkasanRes.json();

      setRoutes(ruteData.features || []);
      setPoints(titikData.features || []);
      setSummary(ringkasanData.agregat);
      setServerStatus('online');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setServerStatus('offline');
    } finally {
      setIsLoading(false);
    }
  }, [filterHari, filterKode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle adding temporary dynamic route
  const handleAddRoute = (newRoute: RouteFeature, newPoints: PointFeature[]) => {
    setTemporaryRoute(newRoute);
    setPoints((prev) => [...prev, ...newPoints]);
    setSelectedTripId(newRoute.properties.trip_id);

    // Dynamically update aggregate summary in memory
    if (summary) {
      const updatedTotalTrip = summary.total_trip + 1;
      const updatedTotalJarak = Math.round((summary.total_jarak_km + newRoute.properties.jarak_km) * 100) / 100;
      const updatedTotalLiter = Math.round((summary.total_liter + newRoute.properties.liter_total) * 100) / 100;
      const updatedTotalBiaya = summary.total_biaya_rp + newRoute.properties.biaya_rp;
      const updatedTotalIdle = Math.round((summary.total_liter_idle + newRoute.properties.liter_idle) * 100) / 100;
      const updatedTotalBorosLiter = Math.round((summary.total_liter_boros + newRoute.properties.liter_boros) * 100) / 100;
      const updatedTotalBorosBiaya = summary.total_biaya_boros_rp + newRoute.properties.biaya_boros_rp;
      const updatedRataKmLiter = updatedTotalLiter > 0 ? Math.round((updatedTotalJarak / updatedTotalLiter) * 100) / 100 : 0;
      const updatedMalam = newRoute.properties.malam
        ? { ...summary.malam, jumlah_trip: summary.malam.jumlah_trip + 1 }
        : summary.malam;
      const updatedSiang = newRoute.properties.malam
        ? summary.siang
        : { ...summary.siang, jumlah_trip: summary.siang.jumlah_trip + 1 };

      setSummary({
        ...summary,
        total_trip: updatedTotalTrip,
        total_jarak_km: updatedTotalJarak,
        total_liter: updatedTotalLiter,
        total_biaya_rp: updatedTotalBiaya,
        total_liter_idle: updatedTotalIdle,
        total_liter_boros: updatedTotalBorosLiter,
        total_biaya_boros_rp: updatedTotalBorosBiaya,
        rata_rata_km_per_liter: updatedRataKmLiter,
        malam: updatedMalam,
        siang: updatedSiang,
      });
    }

    setNotification(`Rute baru ${newRoute.properties.nama} berhasil ditampilkan di peta.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetFilter = () => {
    setFilterHari('Semua');
    setFilterKode('Semua');
    setTemporaryRoute(null);
    setSelectedTripId(null);
  };

  const setCorridor = (kode: string) => {
    setFilterKode(kode);
    setSelectedTripId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans print:min-h-0 print:bg-white print:p-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fadeIn print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header Component */}
      <div className="print:hidden">
        <Header
          serverStatus={serverStatus}
          totalTrips={routes.length + (temporaryRoute ? 1 : 0)}
          activeFilterHari={filterHari}
          activeFilterKode={filterKode}
        />
      </div>

      {/* 2. Control Panel Component */}
      <div className="print:hidden">
        <ControlPanel
          filterHari={filterHari}
          setFilterHari={setFilterHari}
          filterKode={filterKode}
          setFilterKode={setFilterKode}
          onResetFilter={handleResetFilter}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          summary={summary}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0">
        {/* Quick Corridor Selection Tabs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Pilih Koridor Trayek:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setCorridor('Semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterKode === 'Semua'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Armada (63 Trip)
            </button>

            <button
              type="button"
              onClick={() => setCorridor('K-04')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterKode === 'K-04'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              K-04 • 30KL (Serang – Cilegon)
            </button>

            <button
              type="button"
              onClick={() => setCorridor('K-07')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterKode === 'K-07'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              K-07 • 16KL (Serang – Anyer)
            </button>

            <button
              type="button"
              onClick={() => setCorridor('K-12')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterKode === 'K-12'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              K-12 • 24KL (Cilegon – Merak)
            </button>
          </div>
        </div>

        {/* Layout Grid: Map (Left) + Digital Receipt (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:w-full">
          {/* Left Column: WebGIS Leaflet Map & Fleet Table */}
          <div className="lg:col-span-8 space-y-6 print:hidden">
            {/* Map Container Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Visualisasi Lintasan Spasial Truk Tangki BBM
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rute diwarnai berdasarkan performa riil (Biru = Normal/Efisien, Merah = Boros akibat Idling & Macet)
                  </p>
                </div>
                {temporaryRoute && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 1 Rute Simulasi
                  </span>
                )}
              </div>

              {/* Leaflet Map Component */}
              <MapView
                routes={routes}
                points={points}
                temporaryRoute={temporaryRoute}
                selectedTripId={selectedTripId}
                onSelectTrip={(id) => setSelectedTripId(id)}
              />
            </div>

            {/* Fleet Data Table */}
            <FleetTable
              routes={temporaryRoute ? [...routes, temporaryRoute] : routes}
              selectedTripId={selectedTripId}
              onSelectTrip={(id) => setSelectedTripId(id)}
            />
          </div>

          {/* Right Column: Digital Receipt & Technical Specs */}
          <div className="lg:col-span-4 space-y-6 print:w-full print:m-0 print:p-0">
            {/* Digital Receipt Card (Struk BBM) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 print:hidden">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Struk Monitoring & Audit BBM
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kalkulasi otomatis berbasis data GPS & telemetri
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                  RESMI
                </span>
              </div>

              <DigitalReceipt
                summary={summary}
                filterHari={filterHari}
                filterKode={filterKode}
              />
            </div>

            {/* Vehicle Technical Parameter Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm text-xs space-y-4 print:hidden">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h4>Rasionalisasi Acuan 3.20 km/L</h4>
              </div>

              <div className="space-y-2.5 text-slate-600 leading-relaxed">
                <p>
                  Mengapa acuan standar <strong className="text-slate-900 font-semibold">3.20 km/Liter</strong> ditetapkan sebagai batas efisiensi armada tangki di Provinsi Banten?
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-slate-900">Beban Muatan Berat (16–30 KL):</strong> Truk tangki membawa muatan seberat 13–25 ton cairan dengan inersia gelombang (*sloshing*) yang menuntut torsi mesin diesel tinggi saat percepatan awal.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-slate-900">Kategori Heavy-Duty 3:</strong> Pada kecepatan stabil 50–60 km/jam tanpa hambatan macet (kondisi subuh/malam), konsumsi ideal truk diesel Euro 4 adalah 3.10–3.40 km/L.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-slate-900">Dampak Kemacetan Industri:</strong> Pada siang hari (Simpang PCI Cilegon & Gerogol), mesin *idling* dan *stop-and-go* menurunkan efisiensi drastis hingga <strong className="text-rose-700 font-mono">2.40–2.65 km/L</strong>.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Fleet Specs Grid */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50/70 rounded-xl p-2.5 border border-blue-200/60">
                  <strong className="text-blue-900 block font-mono text-xs font-bold">K-04</strong>
                  <span className="text-[10px] text-blue-700 font-medium">Tangki 30KL</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Serang – Cilegon</span>
                </div>
                <div className="bg-teal-50/70 rounded-xl p-2.5 border border-teal-200/60">
                  <strong className="text-teal-900 block font-mono text-xs font-bold">K-07</strong>
                  <span className="text-[10px] text-teal-700 font-medium">Tangki 16KL</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Serang – Anyer</span>
                </div>
                <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-200/60">
                  <strong className="text-amber-950 block font-mono text-xs font-bold">K-12</strong>
                  <span className="text-[10px] text-amber-800 font-medium">Tangki 24KL</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Cilegon – Merak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Corridor Profiles Cards (Insight Lapangan Koridor Banten) */}
        <div className="space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Karakteristik & Analisis Efisiensi 3 Koridor Logistik Banten
            </h3>
            <span className="text-xs text-slate-500">Berdasarkan 63 Trip Sepekan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Koridor 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  KORIDOR 1 • K-04 (30KL)
                </span>
                <span className="font-mono text-xs font-bold text-blue-700">~28.5 km</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Serang – Cilegon (Arteri Nasional)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jalur utama distribusi via Jl. Raya Serang-Cilegon. Titik kemacetan terbesar berada di persimpangan PCI (Pondok Cilegon Indah) dan Kramatwatu pada jam makan siang.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Efisiensi Malam: <strong className="text-emerald-700 font-mono">3.18 km/L</strong></span>
                <span className="text-slate-500">Siang: <strong className="text-rose-700 font-mono">2.64 km/L</strong></span>
              </div>
            </div>

            {/* Koridor 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  KORIDOR 2 • K-07 (16KL)
                </span>
                <span className="font-mono text-xs font-bold text-teal-700">~38.2 km</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Serang – Anyer (Pesisir & Wisata)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Melintasi jalur lingkar selatan dan kawasan industri Ciwandan. Beban tangki 16KL lebih lincah di tikungan pesisir, namun terhambat antrean truk kontainer di Ciwandan.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Efisiensi Malam: <strong className="text-emerald-700 font-mono">3.12 km/L</strong></span>
                <span className="text-slate-500">Siang: <strong className="text-rose-700 font-mono">2.70 km/L</strong></span>
              </div>
            </div>

            {/* Koridor 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  KORIDOR 3 • K-12 (24KL)
                </span>
                <span className="font-mono text-xs font-bold text-amber-800">~22.8 km</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Cilegon – Merak (Koridor Pelabuhan)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menghubungkan pusat industri Krakatau Steel ke Pelabuhan Merak via Gerogol. Bottleneck terjadi akibat antrean ferry ASDP Merak dan perlintasan logistik berat.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Efisiensi Malam: <strong className="text-emerald-700 font-mono">3.20 km/L</strong></span>
                <span className="text-slate-500">Siang: <strong className="text-rose-700 font-mono">2.58 km/L</strong></span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TankTrack GIS</span>
            <span className="text-slate-300">•</span>
            <span>Laboratory GIS Week 5</span>
          </div>
          <p className="text-slate-400">
            Sistem Audit GPS Konsumsi Biosolar Armada Tangki Distribusi Bahan Bakar Banten
          </p>
        </div>
      </footer>

      {/* Modal Add Route */}
      <div className="print:hidden">
        <AddRouteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddRoute={handleAddRoute}
        />
      </div>
    </div>
  );
}
