'use client';

import React from 'react';
import { Fuel, Radio, Truck, Calendar, ShieldCheck, MapPin } from 'lucide-react';

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
    <header id="tanktrack-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sm:px-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
            <Fuel className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                TankTrack GIS
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold tracking-normal">
                  v1.0 Week 5 Lab
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span>Sistem Tracking & Analisis Efisiensi BBM Mobil Tangki Multi-Armada</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-400" /> Koridor Banten (Serang - Cilegon - Merak - Anyer)
              </span>
            </p>
          </div>
        </div>

        {/* Server & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
          {/* Server Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  serverStatus === 'online'
                    ? 'bg-emerald-400'
                    : serverStatus === 'loading'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
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
            <span className="text-slate-300 font-medium">
              API Status: {serverStatus === 'online' ? 'Online (Next/Express)' : serverStatus === 'loading' ? 'Syncing...' : 'Disconnected'}
            </span>
          </div>

          {/* Active Fleet & Filter indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Armada: <strong className="text-white">{activeFilterKode}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Hari: <strong className="text-white">{activeFilterHari}</strong></span>
            <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.5 rounded ml-1 font-mono">
              {totalTrips} Trip
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
