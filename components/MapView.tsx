'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteFeature, PointFeature } from '../src/types';
import { Layers, Compass, Eye, EyeOff, Maximize2, MapPin, X, Info } from 'lucide-react';

interface MapViewProps {
  routes: RouteFeature[];
  points: PointFeature[];
  temporaryRoute?: RouteFeature | null;
  selectedTripId?: number | null;
  onSelectTrip?: (tripId: number | null) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  routes,
  points,
  temporaryRoute,
  selectedTripId,
  onSelectTrip,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pointsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [basemap, setBasemap] = useState<'carto-light' | 'osm' | 'carto-dark'>('carto-light');
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Fit bounds helper
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allRoutesToRender = temporaryRoute ? [...routes, temporaryRoute] : routes;
    const bounds = L.latLngBounds([]);

    allRoutesToRender.forEach((feature) => {
      feature.geometry.coordinates?.forEach(([lng, lat]) => bounds.extend([lat, lng]));
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    } else {
      map.setView([-6.06, 106.07], 11);
    }
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-6.06, 106.07],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Carto Light as default for natural clean white style
      const initialTile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      tileLayerRef.current = initialTile;

      const routesGroup = L.layerGroup().addTo(map);
      const pointsGroup = L.layerGroup().addTo(map);

      routesLayerGroupRef.current = routesGroup;
      pointsLayerGroupRef.current = pointsGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    let attr = '&copy; CARTO, &copy; OpenStreetMap';

    if (basemap === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenStreetMap contributors';
    } else if (basemap === 'carto-dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attr = '&copy; CARTO';
    }

    const newTile = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [basemap]);

  // Update Routes and Points Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = routesLayerGroupRef.current;
    const pointsGroup = pointsLayerGroupRef.current;

    if (!map || !routesGroup || !pointsGroup) return;

    routesGroup.clearLayers();
    pointsGroup.clearLayers();

    const allRoutesToRender = temporaryRoute ? [...routes, temporaryRoute] : routes;
    const bounds = L.latLngBounds([]);

    // Render Routes
    allRoutesToRender.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      if (!coords || coords.length === 0) return;

      const latLngs: [number, number][] = coords.map(([lng, lat]) => [lat, lng]);
      latLngs.forEach((latLng) => bounds.extend(latLng));

      const prop = feature.properties;
      const isBoros = (prop.status_efisiensi === 'Boros') || (prop.km_per_liter < 2.70) || (prop.liter_boros > 2.0);
      const isSelected = selectedTripId === prop.trip_id;

      // Color coding:
      // Normal/Efficient: Vibrant blue (#2563eb)
      // Boros: Crimson red (#e11d48)
      // Selected: Deep dark stroke with higher weight
      const routeColor = isSelected
        ? '#0f172a'
        : isBoros
        ? '#e11d48'
        : '#2563eb';

      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: isSelected ? 6 : isBoros ? 4 : 3.5,
        opacity: isSelected ? 1 : 0.85,
        dashArray: feature.properties.nama.includes('Simulasi') ? '6, 6' : undefined,
      });

      // Hover tooltip
      polyline.bindTooltip(
        `<div style="font-family: system-ui, sans-serif; font-size: 11px;">
          <strong>${prop.nama}</strong><br/>
          <span>${prop.kode_kendaraan} • ${prop.hari} ${prop.jam_mulai}</span><br/>
          <span style="color: ${isBoros ? '#e11d48' : '#2563eb'}; font-weight: 600;">
            ${prop.km_per_liter} km/L (${isBoros ? 'Boros Macet' : 'Efisien'})
          </span>
        </div>`,
        { sticky: true }
      );

      // Clean Popup detail
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 250px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 13px; color: #0f172a;">${prop.nama}</strong>
            <span style="font-size: 10px; padding: 2px 7px; border-radius: 9999px; font-weight: 700; background-color: ${
              isBoros ? '#ffe4e6; color: #be123c' : '#dbeafe; color: #1d4ed8'
            };">
              ${isBoros ? 'BOROS MACET' : 'EFISIEN'}
            </span>
          </div>

          <div style="font-size: 12px; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px;">
            <div><span style="color: #64748b; font-size: 10px;">Armada:</span><br/><strong>${prop.kode_kendaraan}</strong> (${prop.kendaraan})</div>
            <div><span style="color: #64748b; font-size: 10px;">Jadwal:</span><br/><strong>${prop.hari}</strong>, ${prop.jam_mulai} - ${prop.jam_selesai}</div>
            <div style="grid-column: 1 / -1;"><span style="color: #64748b; font-size: 10px;">Trayek:</span><br/><strong>${prop.trayek}</strong></div>
            <div><span style="color: #64748b; font-size: 10px;">Jarak Tempuh:</span><br/><strong>${prop.jarak_km} km</strong></div>
            <div><span style="color: #64748b; font-size: 10px;">BBM Terpakai:</span><br/><strong>${prop.liter_total} L</strong></div>
            <div><span style="color: #64748b; font-size: 10px;">Efisiensi Riil:</span><br/><strong style="color: ${isBoros ? '#e11d48' : '#059669'}">${prop.km_per_liter} km/L</strong></div>
            <div><span style="color: #64748b; font-size: 10px;">BBM Terbuang Macet:</span><br/><strong style="color: ${prop.liter_boros > 0 ? '#e11d48' : '#64748b'}">+${prop.liter_boros} L</strong></div>
            <div style="grid-column: 1 / -1; padding-top: 4px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 11px;">Total Biaya BBM:</span>
              <strong style="color: #0f172a; font-size: 13px;">Rp ${prop.biaya_rp.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </div>
      `;

      polyline.bindPopup(popupHtml, { maxWidth: 300 });

      polyline.on('click', () => {
        if (onSelectTrip) onSelectTrip(prop.trip_id);
      });

      routesGroup.addLayer(polyline);
    });

    // Render Start and End Markers
    if (showPoints) {
      points.forEach((pt) => {
        const [lng, lat] = pt.geometry.coordinates;
        bounds.extend([lat, lng]);
        const prop = pt.properties;
        const isDepo = prop.jenis === 'Titik Awal';

        const markerHtml = isDepo
          ? `<div style="background-color: #059669; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`
          : `<div style="background-color: #e11d48; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`;

        const customIcon = L.divIcon({
          className: 'tanktrack-marker-icon',
          html: markerHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        const pointPopup = `
          <div style="font-family: system-ui, sans-serif; min-width: 170px; font-size: 12px;">
            <div style="font-weight: 700; color: ${isDepo ? '#059669' : '#e11d48'}; margin-bottom: 3px;">
              ${prop.jenis}
            </div>
            <div><strong>Waktu:</strong> ${prop.waktu}</div>
            <div><strong>Hari:</strong> ${prop.hari}</div>
            ${prop.kode_kendaraan ? `<div><strong>Armada:</strong> ${prop.kode_kendaraan}</div>` : ''}
            <div><strong>Jarak:</strong> ${prop.jarak_km} km</div>
          </div>
        `;

        marker.bindPopup(pointPopup);
        pointsGroup.addLayer(marker);
      });
    }

    // Initial fit bounds
    if (bounds.isValid() && allRoutesToRender.length > 0) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
    }
  }, [routes, points, temporaryRoute, selectedTripId, showPoints, onSelectTrip]);

  // Selected route object
  const selectedRoute = [...routes, ...(temporaryRoute ? [temporaryRoute] : [])].find(
    (r) => r.properties.trip_id === selectedTripId
  );

  return (
    <div id="tanktrack-map-container" className="relative w-full h-[520px] md:h-[620px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm">
      {/* Actual Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Trip Floating Banner */}
      {selectedRoute && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-25 bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-3 text-xs max-w-lg w-[90%] sm:w-auto animate-fadeIn">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></div>
          <div className="flex-1 truncate">
            <span className="font-bold text-slate-900">{selectedRoute.properties.nama}</span>
            <span className="text-slate-500 mx-1.5">•</span>
            <span className="text-slate-700">{selectedRoute.properties.hari} ({selectedRoute.properties.jam_mulai})</span>
            <span className="text-slate-500 mx-1.5">•</span>
            <span className={`font-semibold ${selectedRoute.properties.km_per_liter >= 2.7 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {selectedRoute.properties.km_per_liter} km/L
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTrip && onSelectTrip(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            title="Tutup sorotan trip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* Basemap Switcher */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-sm flex items-center gap-1 text-xs">
          <div className="px-2 py-1 flex items-center gap-1 text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline text-[11px]">Lapisan:</span>
          </div>
          <button
            type="button"
            onClick={() => setBasemap('carto-light')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === 'carto-light'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Terang
          </button>
          <button
            type="button"
            onClick={() => setBasemap('osm')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === 'osm'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            OSM
          </button>
          <button
            type="button"
            onClick={() => setBasemap('carto-dark')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === 'carto-dark'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Gelap
          </button>
        </div>

        {/* Action Buttons: Toggle Markers & Fit Bounds */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPoints(!showPoints)}
            className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-semibold transition-all flex items-center gap-1.5"
          >
            {showPoints ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{showPoints ? 'Titik Depo Aktif' : 'Titik Depo Tersembunyi'}</span>
          </button>

          <button
            type="button"
            onClick={handleFitBounds}
            className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-sm text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-semibold transition-all flex items-center gap-1.5"
            title="Pusatkan Peta & Tampilkan Seluruh Rute"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Pusatkan</span>
          </button>
        </div>
      </div>

      {/* Floating Legend Bottom-Right */}
      {showLegend && (
        <div
          id="map-legend"
          className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-md max-w-xs text-xs text-slate-700 animate-fadeIn"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Compass className="w-4 h-4 text-blue-600" />
              Legenda Jalur WebGIS
            </span>
            <button
              type="button"
              onClick={() => setShowLegend(false)}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-1.5 bg-[#2563eb] rounded-full shadow-2xs"></div>
              <span className="font-medium text-slate-800">Trip Normal / Efisien (&ge; 2.70 km/L)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-5 h-1.5 bg-[#e11d48] rounded-full shadow-2xs"></div>
              <span className="font-medium text-slate-800">Trip Boros / Macet (&lt; 2.70 km/L)</span>
            </div>

            <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
              <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-xs shrink-0"></div>
              <span>Titik Awal (Depo Serang)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-xs shrink-0"></div>
              <span>Titik Akhir (SPBU / Pelabuhan Merak)</span>
            </div>

            {temporaryRoute && (
              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 text-slate-800">
                <div className="w-5 h-1 border-b-2 border-dashed border-slate-800"></div>
                <span className="font-semibold text-blue-700">Rute Tambahan (Simulasi)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!showLegend && (
        <button
          type="button"
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-800 hover:text-slate-900 shadow-md font-semibold transition-all hover:bg-slate-50 flex items-center gap-1.5"
        >
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Tampilkan Legenda</span>
        </button>
      )}
    </div>
  );
};

export default MapView;
