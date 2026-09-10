import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hari = searchParams.get('hari');
    const kode = searchParams.get('kode');

    const filePath = path.join(process.cwd(), 'public', 'data', 'rute_7hari.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const geojsonData = JSON.parse(fileContent);

    let filteredFeatures = geojsonData.features || [];

    if (hari && hari !== 'semua' && hari !== 'Semua') {
      filteredFeatures = filteredFeatures.filter(
        (f: any) => f.properties?.hari?.toLowerCase() === hari.toLowerCase()
      );
    }

    if (kode && kode !== 'semua' && kode !== 'Semua') {
      filteredFeatures = filteredFeatures.filter(
        (f: any) => f.properties?.kode_kendaraan?.toLowerCase() === kode.toLowerCase()
      );
    }

    const totalJarak = Math.round(
      filteredFeatures.reduce((acc: number, f: any) => acc + (f.properties?.jarak_km || 0), 0) * 100
    ) / 100;

    const totalLiter = Math.round(
      filteredFeatures.reduce((acc: number, f: any) => acc + (f.properties?.liter_total || 0), 0) * 100
    ) / 100;

    const totalBiaya = filteredFeatures.reduce(
      (acc: number, f: any) => acc + (f.properties?.biaya_rp || 0),
      0
    );

    const totalLiterIdle = Math.round(
      filteredFeatures.reduce((acc: number, f: any) => acc + (f.properties?.liter_idle || 0), 0) * 100
    ) / 100;

    const totalLiterBoros = Math.round(
      filteredFeatures.reduce((acc: number, f: any) => acc + (f.properties?.liter_boros || 0), 0) * 100
    ) / 100;

    const totalBiayaBoros = filteredFeatures.reduce(
      (acc: number, f: any) => acc + (f.properties?.biaya_boros_rp || 0),
      0
    );

    const malamTrips = filteredFeatures.filter((f: any) => f.properties?.malam);
    const siangTrips = filteredFeatures.filter((f: any) => !f.properties?.malam);

    const malamKmLiter = malamTrips.length > 0
      ? Math.round((malamTrips.reduce((acc: number, f: any) => acc + (f.properties?.km_per_liter || 0), 0) / malamTrips.length) * 100) / 100
      : 0;

    const siangKmLiter = siangTrips.length > 0
      ? Math.round((siangTrips.reduce((acc: number, f: any) => acc + (f.properties?.km_per_liter || 0), 0) / siangTrips.length) * 100) / 100
      : 0;

    const rataKmLiter = totalLiter > 0
      ? Math.round((totalJarak / totalLiter) * 100) / 100
      : 0;

    return NextResponse.json({
      filter: {
        hari: hari || 'Semua',
        kode_kendaraan: kode || 'Semua',
      },
      agregat: {
        total_trip: filteredFeatures.length,
        total_jarak_km: totalJarak,
        total_liter: totalLiter,
        total_biaya_rp: totalBiaya,
        total_liter_idle: totalLiterIdle,
        total_liter_boros: totalLiterBoros,
        total_biaya_boros_rp: totalBiayaBoros,
        rata_rata_km_per_liter: rataKmLiter,
        efisiensi_acuan_standar: 3.2,
        harga_per_liter: 6800,
        malam: {
          jumlah_trip: malamTrips.length,
          rata_rata_km_per_liter: malamKmLiter,
        },
        siang: {
          jumlah_trip: siangTrips.length,
          rata_rata_km_per_liter: siangKmLiter,
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengalkulasi ringkasan metrik', details: error.message },
      { status: 500 }
    );
  }
}
