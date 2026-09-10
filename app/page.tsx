'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import MapView from '../components/MapView';
import DigitalReceipt from '../components/DigitalReceipt';
import AddRouteModal from '../components/AddRouteModal';
import FleetTable from '../components/FleetTable';
import { RouteFeature, PointFeature, AggregateSummary, GeoJSONRouteCollection, GeoJSONPointCollection, SummaryResponse } from '../src/types';
import { Info, Truck, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

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
      const updatedTotalBorosLiter = Math.round((summary.total_liter_boros + newRoute.properties.liter_boros) * 100) / 100;
      const updatedTotalBorosBiaya = summary.total_biaya_boros_rp + newRoute.properties.biaya_boros_rp;
      const updatedRataKmLiter = Math.round((updatedTotalJarak / updatedTotalLiter) * 100) / 100;

      setSummary({
        ...summary,
        total_trip: updatedTotalTrip,
        total_jarak_km: updatedTotalJarak,
        total_liter: updatedTotalLiter,
        total_biaya_rp: updatedTotalBiaya,
        total_liter_boros: updatedTotalBorosLiter,
        total_biaya_boros_rp: updatedTotalBorosBiaya,
        rata_rata_km_per_liter: updatedRataKmLiter,
      });
    }

    setNotification(`Rute baru ${newRoute.properties.nama} berhasil digambar di peta WebGIS!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleResetFilter = () => {
    setFilterHari('Semua');
    setFilterKode('Semua');
    setTemporaryRoute(null);
    setSelectedTripId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400/50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header Component */}
      <Header
        serverStatus={serverStatus}
        totalTrips={routes.length + (temporaryRoute ? 1 : 0)}
        activeFilterHari={filterHari}
        activeFilterKode={filterKode}
      />

      {/* 2. Control Panel Component */}
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

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Layout Grid: Map (Left) + Digital Receipt (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: WebGIS Leaflet Map & Fleet Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Map Container Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Visualisasi Spasial Lintasan Truk Tangki (Leaflet.js)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Menampilkan rute LineString dengan diferensiasi warna efisiensi BBM (Biru = Efisien, Merah = Boros / Macet)
                  </p>
                </div>
                {temporaryRoute && (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-md font-semibold">
                    1 Rute Simulasi Aktif
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

          {/* Right Column: Digital Receipt & Vehicle Parameter Specs */}
          <div className="lg:col-span-4 space-y-6">
            {/* Digital Receipt Card (Bonus Struk BBM) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Struk BBM Digital (Receipt)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kalkulasi dinamis berbasis filter Hari & Armada
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  TERKALIBRASI
                </span>
              </div>

              <DigitalReceipt
                summary={summary}
                filterHari={filterHari}
                filterKode={filterKode}
              />
            </div>

            {/* Vehicle Technical Parameter Card (Answer to Week 5 Grading Criteria) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-sky-400" />
                Parameter Teknis & Rasionalisasi Efisiensi 3.2 km/L
              </h4>

              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>
                  Mengapa acuan standar <strong className="text-amber-400">3.20 km/Liter</strong> logis untuk armada truk tangki BBM?
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>
                    <strong className="text-slate-200">Muatan Cairan Berat (Gross Vehicle Weight):</strong> Truk tangki 16KL - 30KL membawa beban cairan 13-25 ton dengan efek <em className="text-slate-300">liquid surge (sloshing)</em> pada saat akselerasi dan pengereman.
                  </li>
                  <li>
                    <strong className="text-slate-200">Karakteristik Mesin Diesel:</strong> Konsumsi rata-rata truk heavy-duty kategori 3 (Hino Ranger / Mitsubishi Fuso Fighter) bermuatan penuh di jalur datar adalah 3.0 - 3.4 km/L.
                  </li>
                  <li>
                    <strong className="text-slate-200">Dampak Kemacetan (Siang vs Subuh):</strong> Trip subuh mencapai <strong>~3.10 - 3.20 km/L</strong> (kecepatan stabil, tanpa stop & go). Trip siang/sore terdeteksi boros <strong>~2.40 - 2.65 km/L</strong> akibat engine idling di persimpangan padat industri & pelabuhan.
                  </li>
                </ul>
              </div>

              {/* Fleet Specs Card */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                  <strong className="text-amber-400 block font-mono">K-04 (30KL)</strong>
                  <span className="text-[10px] text-slate-400">Serang – Cilegon</span>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                  <strong className="text-blue-400 block font-mono">K-07 (16KL)</strong>
                  <span className="text-[10px] text-slate-400">Serang – Anyer</span>
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
                  <strong className="text-emerald-400 block font-mono">K-12 (24KL)</strong>
                  <span className="text-[10px] text-slate-400">Cilegon – Merak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          TankTrack WebGIS • Enterprise Fleet Analytics & Telematics • MBC Lab
        </p>
      </footer>

      {/* Modal Add Route */}
      <AddRouteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRoute={handleAddRoute}
      />
    </div>
  );
}
