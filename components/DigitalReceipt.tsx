'use client';

import React, { useState } from 'react';
import { Fuel, AlertCircle, CheckCircle2, Printer, Copy, Check, ShieldCheck } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  if (!summary) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
        Memuat data audit BBM...
      </div>
    );
  }

  const invoiceNo = `FLT-${summary.total_trip}${String(summary.total_biaya_rp).slice(-4)}`;
  const efisiensiSelisih = Math.round((summary.rata_rata_km_per_liter - summary.efisiensi_acuan_standar) * 100) / 100;
  const isOptimal = efisiensiSelisih >= 0;

  const handleCopyNo = () => {
    navigator.clipboard.writeText(invoiceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="tanktrack-digital-receipt-wrapper" className="flex flex-col items-center w-full">
      {/* Receipt Card with Realistic Styling */}
      <div
        id="thermal-receipt"
        className="w-full bg-white text-slate-800 rounded-2xl shadow-sm border border-slate-200/90 relative overflow-hidden select-text transition-all print:border print:border-slate-300 print:shadow-none print:rounded-xl print:w-[380px] print:max-w-full"
      >
        {/* Top colored receipt tab */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>

        <div className="p-5 space-y-4">
          {/* Official Header */}
          <div className="text-center border-b border-dashed border-slate-200 pb-3.5">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 mb-1.5 ring-1 ring-blue-500/20">
              <Fuel className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wider text-slate-900">
              PERTAMINA PATRA FLEET
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              Sistem Audit & Verifikasi BBM Biosolar
            </p>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
                NO: {invoiceNo}
              </span>
              <button
                type="button"
                onClick={handleCopyNo}
                className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors print:hidden"
                title="Salin Nomor Struk"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Unit & Context Specs */}
          <div className="bg-slate-50/80 rounded-xl p-3 text-xs border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px]">Unit Armada:</span>
              <strong className="text-slate-900 font-semibold">
                {filterKode === 'Semua' ? 'Multi-Armada (K-04, K-07, K-12)' : filterKode}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px]">Periode Hari:</span>
              <strong className="text-slate-900 font-semibold">{filterHari}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px]">Bahan Bakar:</span>
              <span className="text-slate-800 font-mono text-[11px]">
                Biosolar B35 (Rp {summary.harga_per_liter.toLocaleString('id-ID')}/L)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px]">Koridor:</span>
              <span className="text-slate-700 text-[11px] font-medium">Banten Arteri & Kawasan Industri</span>
            </div>
          </div>

          {/* Metric Table */}
          <div className="space-y-2 text-xs border-b border-dashed border-slate-200 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Perjalanan Terdata:</span>
              <strong className="font-mono text-slate-900 font-semibold">{summary.total_trip} Trip</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Jarak Tempuh GPS:</span>
              <strong className="font-mono text-slate-900 font-semibold">{summary.total_jarak_km.toLocaleString('id-ID')} km</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Konsumsi Biosolar:</span>
              <strong className="font-mono text-slate-900 font-semibold">{summary.total_liter.toLocaleString('id-ID')} Liter</strong>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-medium">Efisiensi Rata-rata:</span>
              <strong className={`font-mono text-sm font-bold ${isOptimal ? 'text-emerald-700' : 'text-blue-700'}`}>
                {summary.rata_rata_km_per_liter} <span className="text-xs font-sans font-normal">km/L</span>
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-500">
              <div className="bg-slate-100/70 p-1.5 rounded border border-slate-200/50">
                <span className="block text-[10px] text-slate-400">Standar Acuan:</span>
                <span className="font-mono font-semibold text-slate-700">{summary.efisiensi_acuan_standar.toFixed(2)} km/L</span>
              </div>
              <div className="bg-slate-100/70 p-1.5 rounded border border-slate-200/50">
                <span className="block text-[10px] text-slate-400">Selisih Deviasi:</span>
                <span className={`font-mono font-semibold ${efisiensiSelisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {efisiensiSelisih >= 0 ? `+${efisiensiSelisih}` : efisiensiSelisih} km/L
                </span>
              </div>
            </div>

            {/* Waste Breakdown */}
            {summary.total_liter_boros > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-rose-200 bg-rose-50/60 p-2.5 rounded-xl">
                <div className="flex justify-between text-rose-800 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    BBM Boros (Macet & Idling):
                  </span>
                  <span className="font-mono text-rose-900">+{summary.total_liter_boros.toLocaleString('id-ID')} L</span>
                </div>
                <div className="flex justify-between text-[11px] text-rose-700 mt-1">
                  <span>Biaya Pemborosan:</span>
                  <span className="font-mono font-bold">Rp {summary.total_biaya_boros_rp.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Invoice Total */}
          <div className="text-center py-2.5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold block">
              TOTAL BIAYA BBM DITERBITKAN
            </span>
            <div className="text-xl font-bold font-mono mt-0.5 tracking-tight text-white">
              Rp {summary.total_biaya_rp.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-blue-200 block mt-0.5">
              Tercatat di Jurnal Logistik Banten
            </span>
          </div>

          {/* Stamp & Verification */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TERVALIDASI GPS</span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              PARAF AUDITOR: LORRY-LOG
            </div>
          </div>

          {/* Minimal Barcode Graphic */}
          <div className="text-center border-t border-slate-100 pt-3">
            <div className="h-7 w-4/5 mx-auto bg-slate-100 border border-slate-200 flex items-center justify-center tracking-widest text-[9px] text-slate-600 font-mono rounded select-none">
              ||| | |||| || |||||| | ||| || |||
            </div>
            <p className="text-[9px] text-slate-400 mt-1 font-mono tracking-wider">
              *{invoiceNo}-BANTEN-PATRA*
            </p>
          </div>

          <div className="hidden print:block text-[9px] text-slate-400 text-center pt-2 border-t border-slate-100 font-mono">
            Dokumen Hasil Cetak Resmi Fleet Monitoring TankTrack GIS
          </div>
        </div>
      </div>

      {/* Action Button: Print */}
      <div className="mt-3 flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span>Cetak / Simpan Struk BBM</span>
        </button>
      </div>
    </div>
  );
};

export default DigitalReceipt;
