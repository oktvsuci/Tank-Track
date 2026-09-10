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

    return NextResponse.json({
      type: 'FeatureCollection',
      name: 'rute_filtered',
      crs: geojsonData.crs,
      features: filteredFeatures,
      metadata: {
        total_trip: filteredFeatures.length,
        filter_hari: hari || 'Semua',
        filter_kode: kode || 'Semua',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal memuat rute GeoJSON', details: error.message },
      { status: 500 }
    );
  }
}
