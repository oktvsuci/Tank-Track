#!/usr/bin/env python3
"""
TankTrack Fleet GIS - Preprocessing Dataset Script
Week 5 Laboratory GIS: Multi-Armada 7 Hari Penuh (03-09 Maret 2025)
Armada:
- K-04 (Truk Tangki 30KL): Trayek Serang – Cilegon (Jalur Nasional 1 / Padat Industri)
- K-07 (Truk Tangki 16KL): Trayek Serang – Anyer (Jalur Pesisir / Wisata)
- K-12 (Truk Tangki 24KL): Trayek Cilegon – Merak (Koridor Pelabuhan)
Total 63 Trip (3 trip/hari x 3 armada x 7 hari).
"""

import json
import csv
import math
import random
import os
from datetime import datetime, timedelta

HARGA_BBM = 6800  # Biosolar Rp 6.800/L
EFISIENSI_ACUAN = 3.20  # km/L standar truk tangki muatan cairan

HARI_LIST = [
    ("Senin", "03-03-2025"),
    ("Selasa", "04-03-2025"),
    ("Rabu", "05-03-2025"),
    ("Kamis", "06-03-2025"),
    ("Jumat", "07-03-2025"),
    ("Sabtu", "08-03-2025"),
    ("Minggu", "09-03-2025"),
]

# Base Waypoints for the 3 distinct routes
# 1. K-04: Serang - Cilegon (Jalur Nasional 1) ~28.6 km
WAYPOINTS_K04_FWD = [
    (106.184492, -6.120401), (106.181548, -6.119611), (106.182376, -6.116769),
    (106.183954, -6.113691), (106.181977, -6.111233), (106.174104, -6.102910),
    (106.171446, -6.100201), (106.169039, -6.098373), (106.166806, -6.096714),
    (106.161552, -6.094054), (106.140026, -6.086671), (106.137283, -6.085348),
    (106.134648, -6.082823), (106.122219, -6.059393), (106.117860, -6.052352),
    (106.115439, -6.049578), (106.108113, -6.042891), (106.105540, -6.040260),
    (106.102019, -6.035384), (106.097174, -6.027647), (106.093712, -6.023414),
    (106.090738, -6.022276), (106.087646, -6.024204), (106.085761, -6.025735),
    (106.084733, -6.031754), (106.082962, -6.034152), (106.080289, -6.032623),
    (106.077762, -6.030743), (106.066922, -6.023674), (106.061123, -6.020827),
    (106.051754, -6.016789), (106.048787, -6.015214), (106.044116, -6.012079),
    (106.041972, -6.010297), (106.040627, -6.007588), (106.031408, -5.994642),
    (106.029030, -5.993480), (106.027244, -5.995467), (106.024587, -5.995937),
    (106.022612, -5.997503), (106.022552, -6.001174), (106.024778, -6.002694),
    (106.025810, -6.002830), (106.024787, -6.002890)
]

# 2. K-07: Serang - Anyer (Jalur Pesisir / Wisata Banten) ~38.7 km
# Melalui Jl. Raya Serang-Cilegon -> JLS Cilegon Selatan -> Ciwandan -> Jl. Raya Anyer (100% di atas jalan darat)
WAYPOINTS_K07_FWD = [
    (106.184492, -6.120401), (106.181485, -6.120497), (106.181893, -6.117534),
    (106.183607, -6.115361), (106.184069, -6.113625), (106.176306, -6.105193),
    (106.165536, -6.095958), (106.152001, -6.090798), (106.139728, -6.086610),
    (106.131547, -6.077171), (106.121700, -6.058531), (106.116959, -6.051265),
    (106.108051, -6.043048), (106.102696, -6.036578), (106.093901, -6.023493),
    (106.092237, -6.022034), (106.090297, -6.022233), (106.087031, -6.024483),
    (106.085519, -6.025791), (106.085206, -6.030740), (106.084073, -6.032862),
    (106.083165, -6.034402), (106.079943, -6.032382), (106.075904, -6.029506),
    (106.071289, -6.026380), (106.064939, -6.022644), (106.057025, -6.019226),
    (106.050465, -6.016247), (106.046306, -6.013608), (106.045191, -6.012807),
    (106.041621, -6.011543), (106.032856, -6.010176), (106.025045, -6.009075),
    (106.018540, -6.010892), (106.012460, -6.012056), (106.006667, -6.012211),
    (105.999730, -6.011470), (105.994113, -6.010265), (105.983841, -6.011840),
    (105.976423, -6.015375), (105.970547, -6.017927), (105.969291, -6.018725),
    (105.964758, -6.022975), (105.961495, -6.023949), (105.956207, -6.022516),
    (105.951444, -6.024323), (105.949172, -6.026300), (105.942600, -6.031397),
    (105.936452, -6.034985), (105.931403, -6.037284), (105.926750, -6.039927),
    (105.925654, -6.041757), (105.925605, -6.044842), (105.924992, -6.048458),
    (105.922737, -6.053216)
]

# 3. K-12: Cilegon - Merak (Koridor Pelabuhan Feri & Industri Gerogol) ~11.0 km
# Cilegon -> Gerogol -> Pulomerak -> Gerbang Pelabuhan Merak (100% di atas jalan darat)
WAYPOINTS_K12_FWD = [
    (106.024787, -6.002890), (106.022484, -6.002348), (106.022514, -5.995743),
    (106.027958, -5.994341), (106.027789, -5.991189), (106.023927, -5.989400),
    (106.021964, -5.988172), (106.019603, -5.987242), (106.018379, -5.986412),
    (106.017468, -5.984952), (106.016445, -5.983953), (106.014755, -5.983139),
    (106.013125, -5.983037), (106.011183, -5.982843), (106.009692, -5.982350),
    (106.009012, -5.981748), (106.008678, -5.980255), (106.008249, -5.977861),
    (106.008242, -5.977033), (106.008682, -5.976001), (106.007671, -5.974388),
    (106.006228, -5.971771), (106.005842, -5.970980), (106.004933, -5.969255),
    (106.004231, -5.967658), (106.003464, -5.965969), (106.002102, -5.963803),
    (106.000267, -5.961181), (105.999696, -5.957774), (105.999397, -5.954557),
    (106.001458, -5.950676), (106.002819, -5.947820), (106.002630, -5.946237),
    (106.002511, -5.945280), (106.003009, -5.943513), (106.002337, -5.941905),
    (106.001426, -5.940317), (106.001228, -5.939100), (106.002163, -5.936613),
    (106.001842, -5.935067), (106.001298, -5.935498), (106.000507, -5.935590),
    (105.999744, -5.934983), (105.999257, -5.934526), (105.997560, -5.932069)
]

def interpolate_points(pts, factor=1, noise=0.0):
    """Return coordinates along the validated road geometry."""
    if factor <= 1:
        return list(pts)
    new_pts = []
    for i in range(len(pts) - 1):
        p1 = pts[i]
        p2 = pts[i + 1]
        new_pts.append(p1)
        for j in range(1, factor):
            t = j / factor
            lon = p1[0] + (p2[0] - p1[0]) * t
            lat = p1[1] + (p2[1] - p1[1]) * t
            new_pts.append((round(lon, 6), round(lat, 6)))
    new_pts.append(pts[-1])
    return new_pts

def generate_fleet_dataset():
    random.seed(42)  # Deterministic repeatability

    rute_features = []
    titikujung_features = []
    gps_rows = []

    fleet_specs = {
        "K-04": {
            "kendaraan": "Truk tangki 30KL",
            "trayek": "Serang – Cilegon",
            "base_waypoints": WAYPOINTS_K04_FWD,
            "base_jarak": 28.60,
            "base_kecepatan": 42.0,
            "lokasi_awal": "Depo Serang",
            "lokasi_akhir": "Terminal Cilegon"
        },
        "K-07": {
            "kendaraan": "Truk tangki 16KL",
            "trayek": "Serang – Anyer",
            "base_waypoints": WAYPOINTS_K07_FWD,
            "base_jarak": 38.70,
            "base_kecepatan": 40.0,
            "lokasi_awal": "Depo Serang",
            "lokasi_akhir": "SPBU / Kawasan Anyer"
        },
        "K-12": {
            "kendaraan": "Truk tangki 24KL",
            "trayek": "Cilegon – Merak",
            "base_waypoints": WAYPOINTS_K12_FWD,
            "base_jarak": 11.20,
            "base_kecepatan": 35.0,
            "lokasi_awal": "Depo Cilegon",
            "lokasi_akhir": "Gerbang Pelabuhan Merak"
        }
    }

    trip_id_counter = 1

    # Loop 7 Days
    for day_idx, (hari_nama, tanggal_str) in enumerate(HARI_LIST):
        is_weekend = hari_nama in ["Sabtu", "Minggu"]
        is_friday = hari_nama == "Jumat"

        # Loop 3 Trucks
        for kode_truk in ["K-04", "K-07", "K-12"]:
            spec = fleet_specs[kode_truk]

            # 3 Trips per day
            # Trip 1: Subuh/Malam (04:30 - 05:40) -> Lancar, efisien
            # Trip 2: Siang (10:00 - 11:30) -> Normal / Mulai padat
            # Trip 3: Sore / Rush Hour (16:30 - 18:30) -> Macet, boros (terutama weekend / jumat)
            trips_plan = [
                {
                    "trip_sub_id": 1,
                    "jam_mulai_h": 4, "jam_mulai_m": 45 + random.randint(0, 15),
                    "malam": True,
                    "arah": f"{spec['lokasi_awal']} ke {spec['lokasi_akhir']}",
                    "reverse": False,
                    "traffic": "lancar"
                },
                {
                    "trip_sub_id": 2,
                    "jam_mulai_h": 10, "jam_mulai_m": random.randint(5, 30),
                    "malam": False,
                    "arah": f"{spec['lokasi_akhir']} ke {spec['lokasi_awal']}",
                    "reverse": True,
                    "traffic": "sedang"
                },
                {
                    "trip_sub_id": 3,
                    "jam_mulai_h": 16, "jam_mulai_m": random.randint(25, 55),
                    "malam": False,
                    "arah": f"{spec['lokasi_awal']} ke {spec['lokasi_akhir']}" if day_idx % 2 == 1 else f"{spec['lokasi_akhir']} ke {spec['lokasi_awal']}",
                    "reverse": (day_idx % 2 == 0),
                    "traffic": "macet"
                }
            ]

            for plan in trips_plan:
                current_trip_id = trip_id_counter
                trip_id_counter += 1

                # Distance calculation with small variation
                jarak_km = round(spec["base_jarak"] + (random.random() - 0.5) * 0.4, 2)

                # Route points
                coords = list(spec["base_waypoints"])
                if plan["reverse"]:
                    coords = coords[::-1]
                # micro-variation
                coords = interpolate_points(coords, factor=2, noise=0.00004)

                # Operational time and speed
                start_dt = datetime.strptime(f"{tanggal_str} {plan['jam_mulai_h']:02d}:{plan['jam_mulai_m']:02d}:00", "%d-%m-%Y %H:%M:%S")

                if plan["traffic"] == "lancar":
                    # Efisiensi tinggi: ~3.10 - 3.20 km/L
                    km_per_liter = round(3.10 + random.random() * 0.10, 2)
                    durasi_menit = round((jarak_km / spec["base_kecepatan"]) * 60 + random.uniform(1.0, 4.0), 1)
                    kecepatan_rata = round(jarak_km / (durasi_menit / 60), 1)
                    kecepatan_maks = round(kecepatan_rata + random.uniform(8.0, 14.0), 1)
                    menit_idle = round(random.uniform(0.0, 0.5), 1)
                    liter_idle = round(menit_idle * 0.02, 2)
                elif plan["traffic"] == "sedang":
                    # Efisiensi sedang: ~2.70 - 2.92 km/L
                    km_per_liter = round(2.72 + random.random() * 0.18, 2)
                    durasi_menit = round((jarak_km / (spec["base_kecepatan"] * 0.78)) * 60 + random.uniform(2.0, 6.0), 1)
                    kecepatan_rata = round(jarak_km / (durasi_menit / 60), 1)
                    kecepatan_maks = round(kecepatan_rata + random.uniform(6.0, 10.0), 1)
                    menit_idle = round(random.uniform(0.5, 2.0), 1)
                    liter_idle = round(menit_idle * 0.03, 2)
                else:  # Macet (Sore rush hour / weekend Anyer / industri Cilegon)
                    # Efisiensi boros: ~2.35 - 2.65 km/L (weekend wisata Anyer / jumat sore lebih boros)
                    penalty = 0.15 if (is_weekend and kode_truk == "K-07") or (is_friday and kode_truk == "K-04") else 0.0
                    km_per_liter = round(2.40 + random.random() * 0.22 - penalty, 2)
                    if km_per_liter < 2.25:
                        km_per_liter = 2.25

                    durasi_menit = round((jarak_km / (spec["base_kecepatan"] * 0.45)) * 60 + random.uniform(10.0, 25.0), 1)
                    kecepatan_rata = round(jarak_km / (durasi_menit / 60), 1)
                    kecepatan_maks = round(kecepatan_rata + random.uniform(5.0, 9.0), 1)
                    menit_idle = round(random.uniform(2.0, 6.0), 1)
                    liter_idle = round(menit_idle * 0.04, 2)

                end_dt = start_dt + timedelta(minutes=durasi_menit)

                liter_jalan = round(jarak_km / km_per_liter, 2)
                liter_total = round(liter_jalan + liter_idle, 2)
                liter_per_100km = round((liter_total / jarak_km) * 100, 2)
                biaya_rp = int(round(liter_total * HARGA_BBM))

                # Selisih dari acuan standar 3.2 km/L
                liter_standar = round(jarak_km / EFISIENSI_ACUAN, 2)
                liter_boros = round(max(0.0, liter_total - liter_standar), 2)
                biaya_boros_rp = int(round(liter_boros * HARGA_BBM))

                jam_mulai_str = start_dt.strftime("%H:%M")
                jam_selesai_str = end_dt.strftime("%H:%M")

                trip_prop = {
                    "trip_id": current_trip_id,
                    "nama": f"Trip {current_trip_id} ({kode_truk})",
                    "kendaraan": spec["kendaraan"],
                    "kode_kendaraan": kode_truk,
                    "trayek": spec["trayek"],
                    "arah": plan["arah"],
                    "hari": hari_nama,
                    "tanggal": tanggal_str,
                    "jam_mulai": jam_mulai_str,
                    "jam_selesai": jam_selesai_str,
                    "jam_berangkat": start_dt.hour,
                    "durasi_menit": durasi_menit,
                    "kecepatan_rata": kecepatan_rata,
                    "kecepatan_maks": kecepatan_maks,
                    "jumlah_titik": len(coords),
                    "jarak_km": jarak_km,
                    "liter_total": liter_total,
                    "liter_jalan": liter_jalan,
                    "liter_idle": liter_idle,
                    "menit_idle": menit_idle,
                    "liter_per_100km": liter_per_100km,
                    "km_per_liter": km_per_liter,
                    "biaya_rp": biaya_rp,
                    "liter_boros": liter_boros,
                    "biaya_boros_rp": biaya_boros_rp,
                    "jenis_bbm": "Biosolar",
                    "harga_per_liter": HARGA_BBM,
                    "malam": plan["malam"],
                    "status_efisiensi": "Efisien" if (km_per_liter >= 2.90) else ("Normal" if km_per_liter >= 2.70 else "Boros")
                }

                rute_features.append({
                    "type": "Feature",
                    "properties": trip_prop,
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[p[0], p[1]] for p in coords]
                    }
                })

                # Titik Awal
                titikujung_features.append({
                    "type": "Feature",
                    "properties": {
                        "trip_id": current_trip_id,
                        "kode_kendaraan": kode_truk,
                        "trayek": spec["trayek"],
                        "jenis": "Titik Awal",
                        "hari": hari_nama,
                        "tanggal": tanggal_str,
                        "waktu": f"{tanggal_str} {jam_mulai_str}",
                        "jarak_km": jarak_km,
                        "liter_total": liter_total,
                        "biaya_rp": biaya_rp
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [coords[0][0], coords[0][1]]
                    }
                })

                # Titik Akhir
                titikujung_features.append({
                    "type": "Feature",
                    "properties": {
                        "trip_id": current_trip_id,
                        "kode_kendaraan": kode_truk,
                        "trayek": spec["trayek"],
                        "jenis": "Titik Akhir",
                        "hari": hari_nama,
                        "tanggal": tanggal_str,
                        "waktu": f"{tanggal_str} {jam_selesai_str}",
                        "jarak_km": jarak_km,
                        "liter_total": liter_total,
                        "biaya_rp": biaya_rp
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [coords[-1][0], coords[-1][1]]
                    }
                })

                # GPS Breadcrumbs
                total_pts = len(coords)
                time_step_sec = (durasi_menit * 60) / max(1, total_pts - 1)
                for idx_pt, pt in enumerate(coords):
                    curr_time = start_dt + timedelta(seconds=int(idx_pt * time_step_sec))
                    # Speed variation
                    if idx_pt == 0 or idx_pt == total_pts - 1:
                        spd = 0.0 if idx_pt == total_pts - 1 else 15.0
                    else:
                        spd = round(max(5.0, kecepatan_rata + (random.random() - 0.5) * 12.0), 1)
                    segment_dist = round(jarak_km / total_pts, 4)
                    gps_rows.append({
                        "trip_id": current_trip_id,
                        "kode_kendaraan": kode_truk,
                        "hari": hari_nama,
                        "waktu": curr_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "latitude": pt[1],
                        "longitude": pt[0],
                        "kecepatan_kmh": spd,
                        "jarak_km": segment_dist
                    })

    # Summary Aggregation
    total_km = round(sum(f["properties"]["jarak_km"] for f in rute_features), 2)
    total_liter = round(sum(f["properties"]["liter_total"] for f in rute_features), 2)
    total_biaya = sum(f["properties"]["biaya_rp"] for f in rute_features)
    total_idle_liter = round(sum(f["properties"]["liter_idle"] for f in rute_features), 2)
    total_boros_liter = round(sum(f["properties"]["liter_boros"] for f in rute_features), 2)
    total_biaya_boros = sum(f["properties"]["biaya_boros_rp"] for f in rute_features)

    malam_trips = [f["properties"] for f in rute_features if f["properties"]["malam"]]
    siang_trips = [f["properties"] for f in rute_features if not f["properties"]["malam"]]

    malam_km_per_liter = round(sum(t["km_per_liter"] for t in malam_trips) / len(malam_trips), 2) if malam_trips else 0
    siang_km_per_liter = round(sum(t["km_per_liter"] for t in siang_trips) / len(siang_trips), 2) if siang_trips else 0

    ringkasan_data = {
        "metadata": {
            "sistem": "TankTrack WebGIS Fleet Management",
            "periode": "03-09 Maret 2025 (7 Hari Penuh)",
            "total_armada": 3,
            "armada_list": ["K-04", "K-07", "K-12"],
            "jenis_bbm": "Biosolar",
            "harga_per_liter": HARGA_BBM,
            "efisiensi_acuan_standar": EFISIENSI_ACUAN,
            "total_hari": 7,
            "total_trip": len(rute_features)
        },
        "agregat_total": {
            "total_km": total_km,
            "total_liter": total_liter,
            "total_biaya_rp": total_biaya,
            "total_liter_idle": total_idle_liter,
            "total_liter_boros": total_boros_liter,
            "total_biaya_boros_rp": total_biaya_boros,
            "rata_rata_km_per_liter": round(total_km / total_liter, 2),
            "malam_trip_count": len(malam_trips),
            "malam_rata_km_per_liter": malam_km_per_liter,
            "siang_trip_count": len(siang_trips),
            "siang_rata_km_per_liter": siang_km_per_liter
        },
        "per_armada": {}
    }

    for kode in ["K-04", "K-07", "K-12"]:
        armada_trips = [f["properties"] for f in rute_features if f["properties"]["kode_kendaraan"] == kode]
        a_km = round(sum(t["jarak_km"] for t in armada_trips), 2)
        a_liter = round(sum(t["liter_total"] for t in armada_trips), 2)
        a_biaya = sum(t["biaya_rp"] for t in armada_trips)
        a_boros_liter = round(sum(t["liter_boros"] for t in armada_trips), 2)
        a_boros_biaya = sum(t["biaya_boros_rp"] for t in armada_trips)
        a_malam = [t for t in armada_trips if t["malam"]]
        a_siang = [t for t in armada_trips if not t["malam"]]

        ringkasan_data["per_armada"][kode] = {
            "kode_kendaraan": kode,
            "kendaraan": fleet_specs[kode]["kendaraan"],
            "trayek": fleet_specs[kode]["trayek"],
            "jumlah_trip": len(armada_trips),
            "total_km": a_km,
            "total_liter": a_liter,
            "total_biaya_rp": a_biaya,
            "total_liter_boros": a_boros_liter,
            "total_biaya_boros_rp": a_boros_biaya,
            "rata_rata_km_per_liter": round(a_km / a_liter, 2) if a_liter else 0,
            "malam_km_per_liter": round(sum(t["km_per_liter"] for t in a_malam) / len(a_malam), 2) if a_malam else 0,
            "siang_km_per_liter": round(sum(t["km_per_liter"] for t in a_siang) / len(a_siang), 2) if a_siang else 0
        }

    # Save to public/data/
    os.makedirs("public/data", exist_ok=True)

    rute_geojson = {
        "type": "FeatureCollection",
        "name": "rute_7hari",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": rute_features
    }

    titikujung_geojson = {
        "type": "FeatureCollection",
        "name": "titikujung_7hari",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
        "features": titikujung_features
    }

    with open("public/data/rute_7hari.geojson", "w", encoding="utf-8") as f:
        json.dump(rute_geojson, f, indent=2)

    with open("public/data/titikujung_7hari.geojson", "w", encoding="utf-8") as f:
        json.dump(titikujung_geojson, f, indent=2)

    with open("public/data/ringkasan_7hari.json", "w", encoding="utf-8") as f:
        json.dump(ringkasan_data, f, indent=2)

    with open("public/data/gps_mentah_7hari.csv", "w", newline="", encoding="utf-8") as f:
        fieldnames = ["trip_id", "kode_kendaraan", "hari", "waktu", "latitude", "longitude", "kecepatan_kmh", "jarak_km"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(gps_rows)

    print(f" Sukses membuat dataset 7 hari:")
    print(f"   - Total Trip: {len(rute_features)} (Target: 63)")
    print(f"   - Total Titik Ujung: {len(titikujung_features)} (Target: 126)")
    print(f"   - Total GPS Points: {len(gps_rows)}")
    print(f"   - Total Jarak: {total_km} km")
    print(f"   - Total Konsumsi BBM: {total_liter} L (Biaya: Rp {total_biaya:,})")
    print(f"   - Total BBM Boros: {total_boros_liter} L (Kerugian: Rp {total_biaya_boros:,})")
    print(f"   - Rata-rata Efisiensi Malam: {malam_km_per_liter} km/L")
    print(f"   - Rata-rata Efisiensi Siang: {siang_km_per_liter} km/L")

if __name__ == "__main__":
    generate_fleet_dataset()
