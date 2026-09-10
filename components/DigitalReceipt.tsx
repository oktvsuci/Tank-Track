'use client';

import React from 'react';
import { Receipt, Fuel, AlertTriangle, CheckCircle2, Clock, Printer, Download, Sparkles } from 'lucide-react';
import { AggregateSummary } from '../src/types';

interface DigitalReceiptProps {
  summary: AggregateSummary | null;
  filterHari: string;
  filterKode: string;
}

export const DigitalReceipt: React.FC<DigitalReceiptProps> = ({
  summary,
  filterHari,
  filterKode,
}) => {
  if (!summary) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        Memuat data kuitansi BBM digital...
      </div>
    );
  }

  const efisiensiSelisih = Math.round((summary.rata_rata_km_per_liter - summary.efisiensi_acuan_standar) * 100) / 100;
  const isOptimal = efisiensiSelisih >= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="tanktrack-digital-receipt-wrapper" className="flex flex-col items-center">
      {/* Thermal Receipt Container */}
      <div
        id="thermal-receipt"
        className="relative w-full max-w-sm bg-amber-50 text-slate-900 font-mono rounded-lg shadow-2xl p-5 border border-amber-200/80 select-text transition-all"
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Jagged Top Paper Effect */}
        <div className="absolute -top-2 left-0 right-0 h-2 bg-amber-50 [mask-image:radial-gradient(circle,transparent_4px,black_4px)] [mask-size:12px_12px] opacity-90"></div>

        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-800">
            <Fuel className="w-5 h-5 text-amber-700" />
            <h3 className="font-extrabold text-base tracking-wider uppercase">PERTAMINA PATRA FLEET</h3>
          </div>
          <p className="text-[11px] text-slate-600 uppercase font-sans">
            Sistem Monitoring & Audit Efisiensi BBM
          </p>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            Depo Koridor Industri Banten (Serang - Cilegon)
          </p>
          <div className="text-[10px] text-slate-500 mt-1 border-t border-slate-300 pt-1">
            <span>NO. STRUK: <strong>TTK-{Date.now().toString().slice(-6)}</strong></span>
            <span className="mx-1">•</span>
            <span>TANGGAL: 03-09 MAR 2025</span>
          </div>
        </div>

        {/* Unit & Filter Badge */}
        <div className="bg-amber-100/70 rounded p-2 mb-3 text-[11px] border border-amber-200">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-600">KODE UNIT / ARMADA:</span>
            <strong className="text-slate-900 font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-xs">
              {filterKode === 'Semua' ? 'MULTI-ARMADA (3 UNIT)' : filterKode}
            </strong>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-600">HARI OPERASIONAL:</span>
            <strong className="text-slate-900 font-semibold">{filterHari.toUpperCase()}</strong>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-600">JENIS BAHAN BAKAR:</span>
            <strong className="text-slate-900">BIOSOLAR (B35)</strong>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-600">TARIF PER LITER:</span>
            <strong className="text-slate-900">Rp {summary.harga_per_liter.toLocaleString('id-ID')} / L</strong>
          </div>
        </div>

        {/* Breakdown Items Table */}
        <div className="space-y-1.5 text-xs border-b-2 border-dashed border-slate-400 pb-3 mb-3">
          <div className="flex justify-between text-[11px] text-slate-500 font-sans border-b border-slate-300 pb-1">
            <span>PARAMETER FLEET</span>
            <span>NILAI DINAMIS</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-slate-700">TOTAL TRIP / PERJALANAN:</span>
            <strong className="font-bold">{summary.total_trip} Trip</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-700">TOTAL JARAK TEMPUH:</span>
            <strong className="font-bold">{summary.total_jarak_km.toLocaleString('id-ID')} km</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-700">KONSUMSI BBM TOTAL:</span>
            <strong className="font-bold text-amber-900">{summary.total_liter.toLocaleString('id-ID')} Liter</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-700">RATA-RATA EFISIENSI:</span>
            <strong className={`font-bold ${isOptimal ? 'text-emerald-700' : 'text-rose-700'}`}>
              {summary.rata_rata_km_per_liter} km/Liter
            </strong>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pl-2">
            <span>• Standar Acuan Logis:</span>
            <span>{summary.efisiensi_acuan_standar.toFixed(2)} km/L</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pl-2">
            <span>• Trip Malam (Lancar):</span>
            <span>{summary.malam.rata_rata_km_per_liter} km/L ({summary.malam.jumlah_trip}x)</span>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pl-2">
            <span>• Trip Siang/Macet:</span>
            <span>{summary.siang.rata_rata_km_per_liter} km/L ({summary.siang.jumlah_trip}x)</span>
          </div>

          {/* Kerugian Boros BBM Section */}
          <div className="mt-2 pt-2 border-t border-dashed border-slate-300 bg-rose-50 -mx-2 px-2 py-1.5 rounded">
            <div className="flex justify-between text-rose-900 font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" />
                ESTIMASI BBM BOROS:
              </span>
              <span>+{summary.total_liter_boros.toLocaleString('id-ID')} L</span>
            </div>
            <div className="flex justify-between text-[11px] text-rose-700 mt-0.5">
              <span>BIAYA BOROS (KERUGIAN):</span>
              <strong>Rp {summary.total_biaya_boros_rp.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </div>

        {/* Total Price Grand Total */}
        <div className="text-center py-2 mb-3 bg-slate-900 text-amber-300 rounded p-2.5">
          <span className="text-[10px] text-slate-400 tracking-wider block font-sans">
            TOTAL BIAYA BBM (INVOICE FLEET)
          </span>
          <div className="text-xl font-extrabold text-amber-400 mt-0.5 tracking-tight">
            Rp {summary.total_biaya_rp.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Status Evaluasi */}
        <div className="mb-4 text-center">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              summary.total_liter_boros < 1.0
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {summary.total_liter_boros < 1.0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Efisiensi Optimal (Mendekati Standar)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Terdeteksi Kemacetan / Engine Idling</span>
              </>
            )}
          </div>
        </div>

        {/* Barcode representation */}
        <div className="text-center border-t border-slate-300 pt-3">
          <div className="h-9 w-4/5 mx-auto bg-slate-900/90 flex items-center justify-center tracking-widest text-[9px] text-slate-100 font-mono rounded-sm select-none">
            ||||| | |||| ||| || |||||| | ||| |||| |
          </div>
          <p className="text-[9px] text-slate-500 mt-1 font-mono tracking-widest">
            *TANKTRACK-GIS-WEEK5-VALIDATED*
          </p>
        </div>

        {/* Serrated Bottom Paper Effect */}
        <div className="absolute -bottom-2 left-0 right-0 h-2 bg-amber-50 [mask-image:radial-gradient(circle,transparent_4px,black_4px)] [mask-size:12px_12px] opacity-90"></div>
      </div>

      {/* Action Button: Print Receipt */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400" />
          <span>Cetak / Ekspor Struk</span>
        </button>
      </div>
    </div>
  );
};

export default DigitalReceipt;
