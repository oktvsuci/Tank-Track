# TankTrack GIS - Fleet Fuel Efficiency System
> **Sistem WebGIS Fleet Management, Tracking & Analisis Efisiensi BBM Mobil Tangki Multi-Armada**  
> Penugasan Week 5 Laboratory GIS — Full-Stack Next.js / React + Tailwind CSS + Leaflet.js

---

## 1. Deskripsi Konsep & Pemenuhan Kriteria Penilaian Week 5

**TankTrack GIS** adalah aplikasi sistem informasi geografis berbasis web (*WebGIS*) yang dirancang khusus untuk memonitor pergerakan armada truk tangki BBM (Biosolar), menganalisis konsumsi bahan bakar real-time, dan mengidentifikasi anomali pemborosan BBM (*fuel waste*) akibat kemacetan lalu lintas dan *engine idling*.

### Ringkasan Fitur Unggulan:
1. **Multi-Armada & Lintasan Unik (7 Hari Penuh, 63 Trip):**
   - **K-04 (Truk Tangki 30KL):** Trayek Serang – Cilegon (Jalur Nasional 1 / Koridor Industri Utama)
   - **K-07 (Truk Tangki 16KL):** Trayek Serang – Anyer (Jalur Pesisir / Wisata Banten)
   - **K-12 (Truk Tangki 24KL):** Trayek Cilegon – Merak (Koridor Pelabuhan Feri Selat Sunda)
2. **Visualisasi Spasial Dinamis (Leaflet.js):**
   - Rute LineString dengan warna interaktif:
     - **Biru (`#2563eb`):** Trip Efisien / Normal ($\ge 2.70$ km/L, lancar subuh/malam).
     - **Merah (`#e11d48`):** Trip Boros / Terjebak Macet ($< 2.70$ km/L, rush hour siang/sore & weekend).
   - Marker **Titik Awal (Depo Hijau)** dan **Titik Akhir (Tujuan/SPBU Merah)**.
   - Pilihan multi-basemap (CartoDB Positron, OpenStreetMap, CartoDB Dark).
3. **Poin Bonus Struk BBM Digital (`DigitalReceipt`):**
   - Kuitansi bahan bakar bergaya *thermal receipt* dengan kalkulasi metrik dinamis (Total km, Total Liter, Estimasi BBM Terbuang, Total Biaya Rp, dan status evaluasi).
4. **Form Penambahan Rute Dinamis (`AddRouteModal`):**
   - Form modal untuk menambahkan rute baru secara instan dan langsung digambar ke peta WebGIS.
5. **Data Table Perjalanan (`FleetTable`):**
   - Tabel interaktif dengan fitur sortir kolom, pencarian, dan klik untuk *highlight* rute di peta.

---

## 2. Parameter Teknis Kendaraan: Mengapa Efisiensi 3.20 km/L Logis?

Di dalam industri logistik bahan bakar minyak (BBM), acuan efisiensi **3.20 km/Liter** untuk truk tangki merupakan standar industri yang logis dan realistis karena:

1. **Beban Muatan Cairan Berat (*Liquid Surge & Sloshing Effect*):**
   - Truk tangki 16KL hingga 30KL memiliki *Gross Vehicle Weight* (GVW) mencapai 24 hingga 36 ton.
   - Karakteristik cairan dinamis di dalam kompartemen tangki menghasilkan gaya inersia gelombang (*sloshing*) setiap kali kendaraan berakselerasi dan mengerem, membutuhkan tenaga putaran mesin (torsi) yang lebih besar dibandingkan muatan barang padat biasa.
2. **Karakteristik Mesin Truk Kategori 3 Heavy-Duty:**
   - Mesin diesel turbodiesel 7.5L - 11L (seperti Hino Ranger 500 / Mitsubishi Fuso Fighter) dalam kondisi muatan penuh (*laden*) pada jalan arteri nasional datar memiliki konsumsi rata-rata acuan **3.0 - 3.4 km/Liter**.
3. **Diferensiasi Jam Operasional (Malam vs Siang):**
   - **Trip Malam/Subuh (04:30 - 05:30):** Bebas macet, *engine idling* 0 menit, kecepatan konstan, efisiensi mencapai **~3.10 - 3.20 km/Liter**.
   - **Trip Siang/Sore (16:30 - 18:30):** Terjebak kemacetan persimpangan industri Cilegon, wisata Anyer, dan bottleneck antrean dermaga Merak. *Engine idling* 2-6 menit menurunkan efisiensi menjadi **~2.35 - 2.65 km/Liter** (terdeteksi boros).

---

## 3. Dataset Preprocessing (`preprocess.py`)

File mentah 1 hari ditransformasi menjadi dataset 7 hari penuh (Senin - Minggu, 03-09 Maret 2025) menggunakan script Python:

```bash
# Menjalankan script preprocessing
python3 preprocess.py
```

### Output File di folder `public/data/`:
- `public/data/rute_7hari.geojson` (63 Trip LineString lengkap dengan properti kecepatan, liter, biaya, status efisiensi)
- `public/data/titikujung_7hari.geojson` (126 Titik Depo & Tujuan SPBU)
- `public/data/ringkasan_7hari.json` (Agregat statistik total & per armada)
- `public/data/gps_mentah_7hari.csv` (3.717 baris rekam jejak koordinat GPS per 30 detik)

---

## 4. Arsitektur Route Handlers / API Endpoints

Aplikasi menyediakan REST API Endpoint sesuai standar Next.js App Router:

| Endpoint | Parameter Query | Deskripsi |
| :--- | :--- | :--- |
| `GET /api/rute` | `?hari={Senin..Minggu}&kode={K-04..K-12}` | Mengembalikan GeoJSON rute LineString terfilter |
| `GET /api/titikujung` | `?hari={Senin..Minggu}&kode={K-04..K-12}` | Mengembalikan GeoJSON titik awal & akhir terfilter |
| `GET /api/ringkasan` | `?hari={Senin..Minggu}&kode={K-04..K-12}` | Menghitung kalkulasi dinamis agregat biaya, liter boros, & efisiensi |
| `GET /api/health` | - | Status kesehatan server |

---

## 5. Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- Node.js versi 18+ atau 20+
- Python 3.8+

### Langkah-langkah:
```bash
# 1. Clone repository
git clone https://github.com/username/tanktrack-gis.git
cd tanktrack-gis

# 2. Install dependencies
npm install

# 3. Jalankan preprocessing dataset (opsional jika sudah tersedia di public/data/)
python3 preprocess.py

# 4. Jalankan Development Server
npm run dev
```

Aplikasi dapat dibuka di browser pada URL: `http://localhost:3000`

---

## 6. Panduan Deployment ke Vercel / Netlify

### A. Deploy ke Vercel:
1. Push project ini ke repository GitHub.
2. Buka [Vercel Dashboard](https://vercel.com/) dan pilih **Add New Project**.
3. Import repository GitHub project TankTrack.
4. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
5. Klik tombol **Deploy**.

### B. Deploy ke Netlify:
File konfigurasi `netlify.toml` sudah disediakan di root folder:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```
1. Buka [Netlify Dashboard](https://app.netlify.com/) -> **Add new site** -> **Import an existing project**.
2. Hubungkan ke repository GitHub.
3. Netlify akan membaca `netlify.toml` secara otomatis.
4. Klik **Deploy TankTrack GIS**.

---

## 7. Teknologi yang Digunakan
- **Frontend & UI:** Next.js 15 / React 19, TypeScript, Tailwind CSS v4, Lucide React
- **WebGIS Engine:** Leaflet.js, OpenStreetMap, CartoDB Positron
- **Backend / Routing:** Next.js App Router (`app/api/`) & Express.js middleware
- **Data Engineering:** Python 3 (GeoJSON, CSV, Math & DateTime Aggregation)
