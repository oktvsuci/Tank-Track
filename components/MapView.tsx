'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteFeature, PointFeature } from '../src/types';
import { Layers, Map as MapIcon, Maximize2, Compass, Eye, EyeOff } from 'lucide-react';

interface MapViewProps {
  routes: RouteFeature[];
  points: PointFeature[];
  temporaryRoute?: RouteFeature | null;
  selectedTripId?: number | null;
  onSelectTrip?: (tripId: number) => void;
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

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default view: Banten corridor (Serang - Cilegon)
      const map = L.map(mapContainerRef.current, {
        center: [-6.06, 106.07],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Basemap tile
      const initialTile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
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
      // Clean up when unmounting
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

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
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

      // Leaflet uses [lat, lng]
      const latLngs: [number, number][] = coords.map(([lng, lat]) => [lat, lng]);
      latLngs.forEach((latLng) => bounds.extend(latLng));

      const prop = feature.properties;
      const isBoros = (prop.status_efisiensi === 'Boros') || (prop.km_per_liter < 2.70) || (prop.liter_boros > 2.0);
      const isSelected = selectedTripId === prop.trip_id;

      // Color coding: Blue (#2563eb) for Normal/Efficient, Red (#e11d48) for Boros/Macet
      const routeColor = prop.status_efisiensi === 'Efisien'
        ? '#2563eb'
        : isBoros
        ? '#e11d48'
        : '#0284c7';

      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.82,
        dashArray: feature.properties.nama.includes('Simulasi') ? '6, 8' : undefined,
      });

      // Hover tooltip
      polyline.bindTooltip(
        `<strong>${prop.nama}</strong><br/>${prop.kode_kendaraan} • ${prop.km_per_liter} km/L`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );

      // Popup detail as requested
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 250px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #0f172a;">${prop.nama}</strong>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background-color: ${
              isBoros ? '#ffe4e6; color: #be123c' : '#dbeafe; color: #1d4ed8'
            };">
              ${isBoros ? 'Boros / Macet' : 'Efisien'}
            </span>
          </div>

          <div style="font-size: 12px; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;">
            <div><span style="color: #64748b;">Kode Armada:</span><br/><strong>${prop.kode_kendaraan}</strong></div>
            <div><span style="color: #64748b;">Jenis Truk:</span><br/><strong>${prop.kendaraan}</strong></div>
            <div style="grid-column: 1 / -1;"><span style="color: #64748b;">Trayek:</span><br/><strong>${prop.trayek}</strong></div>
            <div><span style="color: #64748b;">Waktu:</span><br/>${prop.hari}, ${prop.jam_mulai} - ${prop.jam_selesai}</div>
            <div><span style="color: #64748b;">Jarak:</span><br/><strong>${prop.jarak_km} km</strong></div>
            <div><span style="color: #64748b;">Konsumsi BBM:</span><br/><strong>${prop.liter_total} L</strong></div>
            <div><span style="color: #64748b;">Efisiensi BBM:</span><br/><strong style="color: ${isBoros ? '#e11d48' : '#059669'}">${prop.km_per_liter} km/L</strong></div>
            <div><span style="color: #64748b;">BBM Terbuang:</span><br/><span style="color: ${prop.liter_boros > 0 ? '#e11d48' : '#64748b'}">+${prop.liter_boros} L</span></div>
            <div><span style="color: #64748b;">Total Biaya:</span><br/><strong style="color: #0f172a;">Rp ${prop.biaya_rp.toLocaleString('id-ID')}</strong></div>
            <div style="grid-column: 1 / -1; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b;">
              Standar Acuan: 3.20 km/L (Biosolar Rp 6.800/L)
            </div>
          </div>
        </div>
      `;

      polyline.bindPopup(popupHtml, { maxWidth: 320 });

      polyline.on('click', () => {
        if (onSelectTrip) onSelectTrip(prop.trip_id);
      });

      routesGroup.addLayer(polyline);
    });

    // Render Start (Depo) and End (Tujuan/SPBU) Markers
    if (showPoints) {
      points.forEach((pt) => {
        const [lng, lat] = pt.geometry.coordinates;
        bounds.extend([lat, lng]);
        const prop = pt.properties;
        const isDepo = prop.jenis === 'Titik Awal';

        const markerHtml = isDepo
          ? `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`
          : `<div style="background-color: #f43f5e; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`;

        const customIcon = L.divIcon({
          className: 'tanktrack-marker-icon',
          html: markerHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        const pointPopup = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px; font-size: 12px;">
            <div style="font-weight: 700; color: ${isDepo ? '#059669' : '#e11d48'}; margin-bottom: 4px;">
              ${prop.jenis} (Trip ${prop.trip_id})
            </div>
            <div><strong>Waktu:</strong> ${prop.waktu}</div>
            <div><strong>Hari:</strong> ${prop.hari}</div>
            ${prop.kode_kendaraan ? `<div><strong>Armada:</strong> ${prop.kode_kendaraan}</div>` : ''}
            <div><strong>Jarak Trip:</strong> ${prop.jarak_km} km</div>
            <div><strong>BBM:</strong> ${prop.liter_total} L</div>
          </div>
        `;

        marker.bindPopup(pointPopup);
        pointsGroup.addLayer(marker);
      });
    }

    // Auto-fit bounds if routes exist
    if (bounds.isValid() && allRoutesToRender.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [routes, points, temporaryRoute, selectedTripId, showPoints, onSelectTrip]);

  return (
    <div id="tanktrack-map-container" className="relative w-full h-[540px] md:h-[620px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      {/* Actual Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* Basemap Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1.5 shadow-lg flex items-center gap-1 text-xs">
          <Layers className="w-3.5 h-3.5 text-amber-400 ml-1 mr-0.5" />
          <button
            type="button"
            onClick={() => setBasemap('carto-light')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              basemap === 'carto-light'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Carto Light
          </button>
          <button
            type="button"
            onClick={() => setBasemap('osm')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              basemap === 'osm'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            OSM
          </button>
          <button
            type="button"
            onClick={() => setBasemap('carto-dark')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              basemap === 'carto-dark'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Dark
          </button>
        </div>

        {/* Toggle Markers */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-lg flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setShowPoints(!showPoints)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium transition-colors"
          >
            {showPoints ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showPoints ? 'Sembunyikan Titik Depo/Tujuan' : 'Tampilkan Titik Depo/Tujuan'}</span>
          </button>
        </div>
      </div>

      {/* Floating Legend Bottom-Right as required */}
      {showLegend && (
        <div
          id="map-legend"
          className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3 shadow-xl max-w-xs text-xs text-slate-200"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Legenda Peta WebGIS
            </span>
            <button
              type="button"
              onClick={() => setShowLegend(false)}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              Tutup
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-1.5 bg-[#2563eb] rounded-full shadow-sm"></div>
              <span>Trip Efisien / Normal (≥ 2.70 km/L)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-1.5 bg-[#e11d48] rounded-full shadow-sm"></div>
              <span>Trip Boros / Macet (&lt; 2.70 km/L)</span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0"></div>
              <span>Titik Awal (Depo / Pangkalan)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 border border-white shrink-0"></div>
              <span>Titik Akhir (Tujuan / SPBU / Pelabuhan)</span>
            </div>

            {temporaryRoute && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-amber-300">
                <div className="w-5 h-1.5 border-b-2 border-dashed border-amber-400"></div>
                <span>Rute Tambahan Sementara</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!showLegend && (
        <button
          type="button"
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 right-4 z-20 bg-slate-900/90 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white shadow-md font-medium"
        >
          Tampilkan Legenda
        </button>
      )}
    </div>
  );
};

export default MapView;
