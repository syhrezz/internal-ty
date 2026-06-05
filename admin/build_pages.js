const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const pages = {
    "penerimaan-log": { "title": "Penerimaan Log", "parent": "Operasional · Penerimaan" },
    "penerimaan-sawtimber": { "title": "Penerimaan Sawtimber", "parent": "Operasional · Penerimaan" },
    "penerimaan-crosscut": { "title": "Penerimaan Crosscut", "parent": "Operasional · Penerimaan" },
    "penerimaan-kaca": { "title": "Penerimaan Kaca", "parent": "Operasional · Penerimaan" },
    "konversi-log": { "title": "Konversi Log", "parent": "Operasional" },
    "konversi-kiln-dry": { "title": "Konversi Kiln Dry", "parent": "Operasional" },
    "proses-produksi": { "title": "Proses Produksi", "parent": "Operasional" },
    "hasil-produksi": { "title": "Hasil Produksi", "parent": "Operasional" },
    "penjualan-produk": { "title": "Penjualan Produk", "parent": "Operasional" },
    "waste-material": { "title": "Waste Material", "parent": "Operasional" },
    "stok-log": { "title": "Stok Log", "parent": "Stok" },
    "stok-sawtimber": { "title": "Stok Sawtimber", "parent": "Stok" },
    "stok-crosscut": { "title": "Stok Crosscut", "parent": "Stok" },
    "stok-bahan-baku": { "title": "Stok Bahan Baku", "parent": "Stok" },
    "stok-product": { "title": "Stok Produk", "parent": "Stok" },
    "stock-opname": { "title": "Stock Opname", "parent": "Stok" },
    "master-jenis-kayu": { "title": "Master Jenis Kayu", "parent": "Master Data" },
    "master-grade": { "title": "Master Grade", "parent": "Master Data · Master Log" },
    "master-ukuran": { "title": "Master Ukuran", "parent": "Master Data · Master Log" },
    "master-ukuran-sw": { "title": "Master Ukuran Sawtimber", "parent": "Master Data" },
    "master-crosscut": { "title": "Master Crosscut", "parent": "Master Data" },
    "master-kaca-tipe-warna": { "title": "Master Kaca Tipe / Warna", "parent": "Master Data · Master Kaca" },
    "master-kaca-tebal": { "title": "Master Kaca Tebal (mm)", "parent": "Master Data · Master Kaca" },
    "master-kaca-ukuran": { "title": "Master Kaca Ukuran Standard", "parent": "Master Data · Master Kaca" },
    "master-kaca-grade": { "title": "Master Kaca Grade", "parent": "Master Data · Master Kaca" },
    "master-bahan-baku": { "title": "Master Ukuran Oven (Dry)", "parent": "Master Data" },
    "master-produk-detail": { "title": "Detail Produk", "parent": "Master Data · Master Produk" },
    "master-produk-kategori": { "title": "Kategori Produk", "parent": "Master Data · Master Produk" },
    "master-pengguna": { "title": "Master Pengguna", "parent": "Master Data" },
    "system-log": { "title": "System Log", "parent": "Sistem" },
};

const navTemplate = `        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

            <a href="index.html" class="nav-item {index_active}" data-title="Dashboard">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span class="sidebar-text">Dashboard</span>
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operasional</p>

            <!-- Penerimaan accordion -->
            <div class="has-submenu-container">
                <button onclick="toggleMenu('penerimaan')" class="nav-item w-full text-left has-submenu" data-title="Penerimaan">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                    <span class="sidebar-text">Penerimaan</span>
                    <svg id="penerimaan-chevron" class="ml-auto w-3.5 h-3.5 chevron {penerimaan_open} text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div id="penerimaan-menu" class="submenu {penerimaan_open} ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                    <a href="penerimaan-log.html" class="submenu-item {penerimaan_log_active}">Penerimaan Log</a>
                    <a href="penerimaan-sawtimber.html" class="submenu-item {penerimaan_sawtimber_active}">Penerimaan Sawtimber</a>
                    <a href="penerimaan-crosscut.html" class="submenu-item {penerimaan_crosscut_active}">Penerimaan Crosscut</a>
                    <a href="penerimaan-kaca.html" class="submenu-item {penerimaan_kaca_active}">Penerimaan Kaca</a>
                </div>
            </div>

            <a href="konversi-log.html" class="nav-item {konversi_log_active}" data-title="Konversi Log">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <span class="sidebar-text">Konversi Log</span>
            </a>

            <a href="konversi-kiln-dry.html" class="nav-item {konversi_kiln_dry_active}" data-title="Konversi Kiln Dry">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20v-6M9 20v-10M6 20v-4M15 20v-8M18 20v-12M21 20V4" />
                    <path d="M3 20h18" />
                </svg>
                <span class="sidebar-text">Konversi Kiln Dry</span>
            </a>

            <a href="proses-produksi.html" class="nav-item {proses_produksi_active}" data-title="Proses Produksi">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M9 14h6" />
                    <path d="M9 18h6" />
                    <path d="M12 10h3" />
                </svg>
                <span class="sidebar-text">Proses Produksi</span>
            </a>

            <a href="hasil-produksi.html" class="nav-item {hasil_produksi_active}" data-title="Hasil Produksi">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span class="sidebar-text">Hasil Produksi</span>
            </a>

            <a href="penjualan-produk.html" class="nav-item {penjualan_produk_active}" data-title="Penjualan Produk">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span class="sidebar-text">Penjualan Produk</span>
            </a>

            <a href="waste-material.html" class="nav-item {waste_material_active}" data-title="Waste Material">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="sidebar-text">Waste Material</span>
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stok</p>

            <a href="stok-log.html" class="nav-item {stok_log_active}" data-title="Stok Log">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span class="sidebar-text">Stok Log</span>
            </a>

            <a href="stok-sawtimber.html" class="nav-item {stok_sawtimber_active}" data-title="Stok Sawtimber">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                <span class="sidebar-text">Stok Sawtimber</span>
            </a>

            <a href="stok-crosscut.html" class="nav-item {stok_crosscut_active}" data-title="Stok Crosscut">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <path d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span class="sidebar-text">Stok Crosscut</span>
            </a>

            <a href="stok-bahan-baku.html" class="nav-item {stok_bahan_baku_active}" data-title="Stok Bahan Baku">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span class="sidebar-text">Stok Bahan Baku</span>
            </a>

            <a href="stok-product.html" class="nav-item {stok_product_active}" data-title="Stok Produk">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span class="sidebar-text">Stok Produk</span>
            </a>

            <a href="stock-opname.html" class="nav-item {stock_opname_active}" data-title="Stock Opname">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span class="sidebar-text">Stock Opname</span>
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Data</p>

            <a href="master-jenis-kayu.html" class="nav-item {master_jenis_kayu_active}" data-title="Master Jenis Kayu">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span class="sidebar-text">Master Jenis Kayu</span>
            </a>

            <!-- Master Log accordion -->
            <div class="has-submenu-container">
                <button onclick="toggleMenu('master_log')" class="nav-item w-full text-left has-submenu" data-title="Master Log">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span class="sidebar-text">Master Log</span>
                    <svg id="master_log-chevron" class="ml-auto w-3.5 h-3.5 chevron {master_log_open} text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div id="master_log-menu" class="submenu {master_log_open} ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                    <a href="master-grade.html" class="submenu-item {master_grade_active}">Master Grade</a>
                    <a href="master-ukuran.html" class="submenu-item {master_ukuran_active}">Master Ukuran</a>
                </div>
            </div>

            <a href="master-ukuran-sw.html" class="nav-item {master_ukuran_sw_active}" data-title="Master Ukuran Sawtimber">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                <span class="sidebar-text">Master Ukuran Sawtimber</span>
            </a>

            <a href="master-crosscut.html" class="nav-item {master_crosscut_active}" data-title="Master Crosscut">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span class="sidebar-text">Master Crosscut</span>
            </a>

            <!-- Master Kaca accordion -->
            <div class="has-submenu-container">
                <button onclick="toggleMenu('master_kaca')" class="nav-item w-full text-left has-submenu" data-title="Master Kaca">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span class="sidebar-text">Master Kaca</span>
                    <svg id="master_kaca-chevron" class="ml-auto w-3.5 h-3.5 chevron {master_kaca_open} text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div id="master_kaca-menu" class="submenu {master_kaca_open} ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                    <a href="master-kaca-tipe-warna.html" class="submenu-item {master_kaca_tipe_warna_active}">Tipe / Warna</a>
                    <a href="master-kaca-tebal.html" class="submenu-item {master_kaca_tebal_active}">Tebal (mm)</a>
                    <a href="master-kaca-ukuran.html" class="submenu-item {master_kaca_ukuran_active}">Ukuran Standard</a>
                    <a href="master-kaca-grade.html" class="submenu-item {master_kaca_grade_active}">Grade</a>
                </div>
            </div>

            <a href="master-bahan-baku.html" class="nav-item {master_bahan_baku_active}" data-title="Master Ukuran Oven (Dry)">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span class="sidebar-text">Master Ukuran Oven (Dry)</span>
            </a>

            <!-- Master Produk accordion -->
            <div class="has-submenu-container">
                <button onclick="toggleMenu('master_produk')" class="nav-item w-full text-left has-submenu" data-title="Master Produk">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span class="sidebar-text">Master Produk</span>
                    <svg id="master_produk-chevron" class="ml-auto w-3.5 h-3.5 chevron {master_produk_open} text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                <div id="master_produk-menu" class="submenu {master_produk_open} ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                    <a href="master-produk-detail.html" class="submenu-item {master_produk_detail_active}">Detail Produk</a>
                    <a href="master-produk-kategori.html" class="submenu-item {master_produk_kategori_active}">Kategori Produk</a>
                </div>
            </div>

            <a href="master-pengguna.html" class="nav-item {master_pengguna_active}" data-title="Master Pengguna">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span class="sidebar-text">Master Pengguna</span>
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem</p>

            <a href="system-log.html" class="nav-item {system_log_active}" data-title="System Log">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span class="sidebar-text">System Log</span>
            </a>

        </nav>`;

const pageTemplate = `<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WoodTrack Pro — {title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: { extend: { fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] } } }
        }
    </script>
    <link rel="stylesheet" href="shared.css">
</head>

<body class="flex h-screen overflow-hidden bg-[#F5F3EF] font-sans">

    <!-- ═══════════════════════════ SIDEBAR ═══════════════════════════ -->
    <aside class="w-[260px] flex-shrink-0 h-full bg-white flex flex-col overflow-hidden" style="border-right:1px solid #F0EDE8;">
        <!-- Logo -->
        <div class="px-5 py-5" style="border-bottom:1px solid #F0EDE8;">
            <a href="index.html" class="flex items-center gap-3" style="text-decoration:none;">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md flex-shrink-0" style="box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="14" width="4" height="6" rx="1" /><rect x="10" y="10" width="4" height="10" rx="1" />
                        <rect x="17" y="12" width="4" height="8" rx="1" /><path d="M5 14V8M12 10V4M19 12V6" /><path d="M3 4h18" />
                    </svg>
                </div>
                <div class="sidebar-text">
                    <p class="font-extrabold text-zinc-900 text-sm leading-tight tracking-tight">WoodTrack</p>
                    <p class="text-[10px] font-bold text-amber-600 uppercase tracking-[0.14em]">Pro Edition</p>
                </div>
            </a>
        </div>
{nav_content}
    </aside>

    <!-- ═══════════════════════════ MAIN ═══════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- TOP BAR -->
        <header class="h-16 bg-white flex items-center justify-between px-6 flex-shrink-0 relative z-30" style="border-bottom:1px solid #F0EDE8;">
            <div class="flex items-center gap-3">
                <button id="sidebar-toggle-btn" class="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all" title="Toggle Sidebar">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div>
                    <h1 class="text-base font-extrabold text-zinc-900 tracking-tight">{title}</h1>
                    <p class="text-[11px] text-zinc-400 mt-0.5">{parent}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div class="hidden sm:flex text-xs font-semibold text-zinc-500 items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl cursor-default hover:bg-zinc-100/80 transition-all select-none">
                    <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span id="live-datetime">-</span>
                </div>
                <div class="hidden sm:block w-px h-6 bg-zinc-100 mx-1"></div>

                <!-- Profile Dropdown -->
                <div class="relative">
                    <div id="profile-menu-button" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-50 cursor-pointer transition-all border border-transparent hover:border-zinc-100">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">A</div>
                        <div class="text-left hidden md:block">
                            <p class="text-xs font-bold text-zinc-800 leading-tight">Admin</p>
                            <p class="text-[10px] text-zinc-400 leading-none mt-0.5">admin@woodtrack.id</p>
                        </div>
                        <svg class="w-3.5 h-3.5 text-zinc-400 hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    <!-- Dropdown -->
                    <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 py-1.5 z-50 origin-top-right transition-all transform scale-95 opacity-0">
                        <a href="pengaturan.html" class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                            <svg class="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Pengaturan
                        </a>
                        <div class="h-px bg-zinc-100 my-1"></div>
                        <a href="#logout" class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Keluar
                        </a>
                    </div>
                </div>
            </div>
        </header>
        <!-- PAGE CONTENT -->
        <div class="flex-1 overflow-y-auto p-6">
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                </div>
                <h2>{title}</h2>
                <p>Halaman ini masih dalam pengembangan.<br>Silakan lengkapi prototype untuk fitur ini.</p>
                <span class="empty-badge">🚧 Prototype</span>
            </div>
        </div>
    </main>

    <script src="shared.js"></script>
</body>
</html>`;

function getNav(activeId) {
    const kwargs = {
        index_active: "",
        penerimaan_open: "",
        penerimaan_log_active: "",
        penerimaan_sawtimber_active: "",
        penerimaan_crosscut_active: "",
        penerimaan_kaca_active: "",
        konversi_log_active: "",
        konversi_kiln_dry_active: "",
        proses_produksi_active: "",
        hasil_produksi_active: "",
        penjualan_produk_active: "",
        waste_material_active: "",
        stok_log_active: "",
        stok_sawtimber_active: "",
        stok_crosscut_active: "",
        stok_bahan_baku_active: "",
        stok_product_active: "",
        stock_opname_active: "",
        master_log_open: "",
        master_jenis_kayu_active: "",
        master_grade_active: "",
        master_ukuran_active: "",
        master_ukuran_sw_active: "",
        master_crosscut_active: "",
        master_kaca_open: "",
        master_kaca_tipe_warna_active: "",
        master_kaca_tebal_active: "",
        master_kaca_ukuran_active: "",
        master_kaca_grade_active: "",
        master_bahan_baku_active: "",
        master_produk_open: "",
        master_produk_detail_active: "",
        master_produk_kategori_active: "",
        master_pengguna_active: "",
        system_log_active: ""
    };

    if (activeId === "index") {
        kwargs.index_active = "active";
    } else if (activeId.startsWith("penerimaan-")) {
        kwargs.penerimaan_open = "open";
        kwargs[activeId.replace(/-/g, '_') + "_active"] = "active";
    } else if (["master-grade", "master-ukuran"].includes(activeId)) {
        kwargs.master_log_open = "open";
        kwargs[activeId.replace(/-/g, '_') + "_active"] = "active";
    } else if (activeId.startsWith("master-kaca-")) {
        kwargs.master_kaca_open = "open";
        kwargs[activeId.replace(/-/g, '_') + "_active"] = "active";
    } else if (activeId.startsWith("master-produk-")) {
        kwargs.master_produk_open = "open";
        kwargs[activeId.replace(/-/g, '_') + "_active"] = "active";
    } else {
        kwargs[activeId.replace(/-/g, '_') + "_active"] = "active";
    }

    let rendered = navTemplate;
    for (const key in kwargs) {
        rendered = rendered.replace(new RegExp(`{${key}}`, 'g'), kwargs[key]);
    }
    return rendered;
}

function updateFileNav(filePath, pageId) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const navRegex = /<!-- Nav -->\s*<nav[\s\S]*?<\/nav>/;
    if (navRegex.test(content)) {
        const newNav = getNav(pageId);
        content = content.replace(navRegex, newNav);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated nav in: ${path.basename(filePath)}`);
    }
}

// Update navbars in all custom/existing html pages in the admin folder
const files = fs.readdirSync(baseDir);
files.forEach(filename => {
    if (filename.endsWith('.html')) {
        const pageId = filename.slice(0, -5);
        updateFileNav(path.join(baseDir, filename), pageId);
    }
});

// Create other missing pages if they don't exist
for (const pageId in pages) {
    const file_path = path.join(baseDir, pageId + ".html");
    let isEmptyState = true;
    if (fs.existsSync(file_path)) {
        const contentCheck = fs.readFileSync(file_path, 'utf8');
        if (!contentCheck.includes("empty-state") && contentCheck.length > 15000) {
            isEmptyState = false;
        }
    }

    if (isEmptyState) {
        const navHtml = getNav(pageId);
        let content = pageTemplate
            .replace(/{title}/g, pages[pageId].title)
            .replace(/{parent}/g, pages[pageId].parent)
            .replace(/{nav_content}/g, navHtml);
        
        fs.writeFileSync(file_path, content, 'utf8');
        console.log(`Created/Updated empty state page: ${pageId}.html`);
    } else {
        console.log(`Skipping custom page generation for: ${pageId}.html`);
    }
}

console.log("All navbars and pages processed successfully.");
