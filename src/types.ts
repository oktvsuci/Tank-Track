export interface TripProperties {
  trip_id: number;
  nama: string;
  kendaraan: string;
  kode_kendaraan: string;
  trayek: string;
  arah: string;
  hari: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  jam_berangkat: number;
  durasi_menit: number;
  kecepatan_rata: number;
  kecepatan_maks: number;
  jumlah_titik: number;
  jarak_km: number;
  liter_total: number;
  liter_jalan: number;
  liter_idle: number;
  menit_idle: number;
  liter_per_100km: number;
  km_per_liter: number;
  biaya_rp: number;
  liter_boros: number;
  biaya_boros_rp: number;
  jenis_bbm: string;
  harga_per_liter: number;
  malam: boolean;
  status_efisiensi?: 'Efisien' | 'Normal' | 'Boros';
}

export interface RouteFeature {
  type: 'Feature';
  properties: TripProperties;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface PointProperties {
  trip_id: number;
  kode_kendaraan?: string;
  trayek?: string;
  jenis: 'Titik Awal' | 'Titik Akhir' | string;
  hari: string;
  tanggal?: string;
  waktu: string;
  jarak_km: number;
  liter_total: number;
  biaya_rp: number;
}

export interface PointFeature {
  type: 'Feature';
  properties: PointProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface GeoJSONRouteCollection {
  type: 'FeatureCollection';
  name: string;
  features: RouteFeature[];
  metadata?: {
    total_trip: number;
    filter_hari: string;
    filter_kode: string;
  };
}

export interface GeoJSONPointCollection {
  type: 'FeatureCollection';
  name: string;
  features: PointFeature[];
  metadata?: {
    total_titik: number;
    filter_hari: string;
    filter_kode: string;
  };
}

export interface AggregateSummary {
  total_trip: number;
  total_jarak_km: number;
  total_liter: number;
  total_biaya_rp: number;
  total_liter_idle: number;
  total_liter_boros: number;
  total_biaya_boros_rp: number;
  rata_rata_km_per_liter: number;
  efisiensi_acuan_standar: number;
  harga_per_liter: number;
  malam: {
    jumlah_trip: number;
    rata_rata_km_per_liter: number;
    total_liter_boros: number;
  };
  siang: {
    jumlah_trip: number;
    rata_rata_km_per_liter: number;
    total_liter_boros: number;
  };
}

export interface SummaryResponse {
  filter: {
    hari: string;
    kode_kendaraan: string;
  };
  agregat: AggregateSummary;
}

export interface NewRouteFormData {
  kode_kendaraan: string;
  trayek: string;
  hari: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  jarak_km: number;
  km_per_liter: number;
  lat_awal: number;
  lng_awal: number;
  lat_akhir: number;
  lng_akhir: number;
  malam: boolean;
}
