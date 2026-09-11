import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { HARGA_BBM_PER_LITER, EFISIENSI_ACUAN_STANDAR } from './src/config';

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TankTrack WebGIS Fleet Fuel Efficiency System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Helper to load GeoJSON
function loadGeoJSON(fileName: string) {
  const filePath = path.join(process.cwd(), 'public', 'data', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${fileName} belum dibuat. Jalankan preprocess.py terlebih dahulu.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// API 1: /api/rute
app.get('/api/rute', (req, res) => {
  try {
    const hari = req.query.hari as string | undefined;
    const kode = req.query.kode as string | undefined;

    const geojson = loadGeoJSON('rute_7hari.geojson');
    let features = geojson.features || [];

    if (hari && hari.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.hari?.toLowerCase() === hari.toLowerCase()
      );
    }

    if (kode && kode.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.kode_kendaraan?.toLowerCase() === kode.toLowerCase()
      );
    }

    res.json({
      type: 'FeatureCollection',
      name: 'rute_filtered',
      crs: geojson.crs,
      features,
      metadata: {
        total_trip: features.length,
        filter_hari: hari || 'Semua',
        filter_kode: kode || 'Semua',
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memuat rute GeoJSON', details: error.message });
  }
});

// API 2: /api/titikujung
app.get('/api/titikujung', (req, res) => {
  try {
    const hari = req.query.hari as string | undefined;
    const kode = req.query.kode as string | undefined;

    const geojson = loadGeoJSON('titikujung_7hari.geojson');
    let features = geojson.features || [];

    if (hari && hari.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.hari?.toLowerCase() === hari.toLowerCase()
      );
    }

    if (kode && kode.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.kode_kendaraan?.toLowerCase() === kode.toLowerCase()
      );
    }

    res.json({
      type: 'FeatureCollection',
      name: 'titikujung_filtered',
      crs: geojson.crs,
      features,
      metadata: {
        total_titik: features.length,
        filter_hari: hari || 'Semua',
        filter_kode: kode || 'Semua',
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memuat titik ujung GeoJSON', details: error.message });
  }
});

// API 3: /api/ringkasan
app.get('/api/ringkasan', (req, res) => {
  try {
    const hari = req.query.hari as string | undefined;
    const kode = req.query.kode as string | undefined;

    const geojson = loadGeoJSON('rute_7hari.geojson');
    let features = geojson.features || [];

    if (hari && hari.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.hari?.toLowerCase() === hari.toLowerCase()
      );
    }

    if (kode && kode.toLowerCase() !== 'semua') {
      features = features.filter(
        (f: any) => f.properties?.kode_kendaraan?.toLowerCase() === kode.toLowerCase()
      );
    }

    const totalJarak = Math.round(
      features.reduce((acc: number, f: any) => acc + (f.properties?.jarak_km || 0), 0) * 100
    ) / 100;

    const totalLiter = Math.round(
      features.reduce((acc: number, f: any) => acc + (f.properties?.liter_total || 0), 0) * 100
    ) / 100;

    const totalBiaya = features.reduce(
      (acc: number, f: any) => acc + (f.properties?.biaya_rp || 0),
      0
    );

    const totalLiterIdle = Math.round(
      features.reduce((acc: number, f: any) => acc + (f.properties?.liter_idle || 0), 0) * 100
    ) / 100;

    const totalLiterBoros = Math.round(
      features.reduce((acc: number, f: any) => acc + (f.properties?.liter_boros || 0), 0) * 100
    ) / 100;

    const totalBiayaBoros = features.reduce(
      (acc: number, f: any) => acc + (f.properties?.biaya_boros_rp || 0),
      0
    );

    const malamTrips = features.filter((f: any) => f.properties?.malam);
    const siangTrips = features.filter((f: any) => !f.properties?.malam);

    const malamKmLiter = malamTrips.length > 0
      ? Math.round((malamTrips.reduce((acc: number, f: any) => acc + (f.properties?.km_per_liter || 0), 0) / malamTrips.length) * 100) / 100
      : 0;

    const siangKmLiter = siangTrips.length > 0
      ? Math.round((siangTrips.reduce((acc: number, f: any) => acc + (f.properties?.km_per_liter || 0), 0) / siangTrips.length) * 100) / 100
      : 0;

    const malamBoros = Math.round(
      malamTrips.reduce((acc: number, f: any) => acc + (f.properties?.liter_boros || 0), 0) * 100
    ) / 100;

    const siangBoros = Math.round(
      siangTrips.reduce((acc: number, f: any) => acc + (f.properties?.liter_boros || 0), 0) * 100
    ) / 100;

    const rataKmLiter = totalLiter > 0
      ? Math.round((totalJarak / totalLiter) * 100) / 100
      : 0;

    res.json({
      filter: {
        hari: hari || 'Semua',
        kode_kendaraan: kode || 'Semua',
      },
      agregat: {
        total_trip: features.length,
        total_jarak_km: totalJarak,
        total_liter: totalLiter,
        total_biaya_rp: totalBiaya,
        total_liter_idle: totalLiterIdle,
        total_liter_boros: totalLiterBoros,
        total_biaya_boros_rp: totalBiayaBoros,
        rata_rata_km_per_liter: rataKmLiter,
        efisiensi_acuan_standar: EFISIENSI_ACUAN_STANDAR,
        harga_per_liter: HARGA_BBM_PER_LITER,
        malam: {
          jumlah_trip: malamTrips.length,
          rata_rata_km_per_liter: malamKmLiter,
          total_liter_boros: malamBoros,
        },
        siang: {
          jumlah_trip: siangTrips.length,
          rata_rata_km_per_liter: siangKmLiter,
          total_liter_boros: siangBoros,
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal mengalkulasi ringkasan metrik', details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TankTrack GIS Server running on port ${PORT}`);
  });
}

startServer();
