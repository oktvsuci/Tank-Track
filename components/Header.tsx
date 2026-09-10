'use client';

import React from 'react';
import { Fuel, Truck, Calendar, MapPin, Activity, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  serverStatus: 'online' | 'loading' | 'offline';
  totalTrips: number;
  activeFilterHari: string;
  activeFilterKode: string;
}

export const Header: React.FC<HeaderProps> = ({
  serverStatus,
  totalTrips,
  activeFilterHari,
  activeFilterKode,
}) => {
  return (
    <header id="tanktrack-header" className="bg-white border-b border-slate-200/90 text-slate-900 sticky top-0 z-30 shadow-xs">
      {/* Top micro-accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-slate-900 text-white flex items-center justify-center shadow-sm ring-2 ring-blue-500/20 shrink-0">
              <Fuel className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  TankTrack <span className="text-blue-600 font-extrabold">GIS</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Fleet Intelligence
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  Week 5 Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Monitoring BBM Biosolar Mobil Tangki</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3 h-3 text-emerald-600" /> Koridor Banten: Serang – Cilegon – Merak – Anyer
                </span>
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                {serverStatus === 'online' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    serverStatus === 'online'
                      ? 'bg-emerald-500'
                      : serverStatus === 'loading'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="text-[11px] font-medium text-slate-700">
                {serverStatus === 'online' ? 'GPS Feed Aktif' : serverStatus === 'loading' ? 'Memuat Data...' : 'Offline'}
              </span>
            </div>

            {/* Filter Armada Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-900 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px]">
                Armada: <strong className="font-semibold text-blue-950">{activeFilterKode}</strong>
              </span>
            </div>

            {/* Filter Hari Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">
                Hari: <strong className="font-semibold text-slate-900">{activeFilterHari}</strong>
              </span>
              <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ml-0.5">
                {totalTrips} Trip
              </span>
            </div>

            {/* Biosolar Price Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-900 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Biosolar: <strong className="font-mono">Rp 6.800/L</strong></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
