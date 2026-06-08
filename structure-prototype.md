# Prototype System — Panduan Struktur & Prinsip
> Stack: Tailwind 4 · Font Awesome 7 · dummyimage.com
> Sifat: Local, statis, multi-page HTML, tidak ada backend

---

## Konteks Proyek

File ini adalah **sumber kebenaran tunggal** untuk AI yang mengerjakan prototype ini.
Semua keputusan struktur, penamaan, dan penulisan kode harus mengacu ke sini.

Prototype ini dibuat oleh **konseptor** (bukan programmer), lalu dikerjakan oleh **programmer** yang mendapat delegasi per modul. AI harus mengikuti pola ini — jangan membuat keputusan struktur sendiri di luar yang sudah didefinisikan di sini.

---

## Prinsip Dasar

### DRY — Don't Repeat Yourself
> Kalau sesuatu ditulis dua kali, berarti ada yang salah.

Penerapan di proyek ini:
- Navbar, sidebar, modal → satu file di `_shared/components/`, dipanggil semua halaman
- Warna, ukuran, spacing → satu tempat di `_shared/css/main.css` bagian `:root`
- Fungsi bantu (format angka, URL gambar) → satu tempat di `_shared/js/utils.js`
- Data dummy → satu file JSON di `data/`, di-fetch saat dibutuhkan

❌ Jangan copy-paste navbar ke setiap halaman
❌ Jangan hardcode warna hex langsung di HTML
❌ Jangan tulis fungsi yang sama di dua file berbeda

---

### KISS — Keep It Simple, Stupid
> Pilih solusi paling sederhana yang bisa menyelesaikan masalah.

Penerapan di proyek ini:
- Gunakan HTML biasa, bukan framework JS (tidak ada React, Vue, dsb)
- Interaksi UI cukup dengan class toggle via vanilla JS
- Tidak ada build process, tidak ada bundler, buka file HTML langsung di browser
- Kalau bisa diselesaikan Tailwind class, jangan buat CSS baru

❌ Jangan buat abstraksi yang belum dibutuhkan
❌ Jangan pakai library berat untuk hal yang bisa dilakukan 3 baris JS
❌ Jangan buat sistem routing, ini multi-page bukan SPA

---

## Folder Tree

Pilih struktur sesuai skala proyek. Jangan gunakan struktur yang lebih kompleks dari yang dibutuhkan (KISS).

---

### Tier 1 — Admin Panel Sederhana
> Cocok untuk: satu sistem, satu modul, halaman tidak banyak

```
prototype/
│
├── _shared/
│   ├── components/
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── modal.html
│   │   └── toast.html
│   ├── layouts/
│   │   ├── default.html         ← Navbar + sidebar
│   │   ├── auth.html            ← Tengah layar, tanpa sidebar
│   │   └── print.html           ← Blank, untuk cetak
│   ├── css/
│   │   ├── main.css
│   │   └── components.css
│   └── js/
│       ├── main.js
│       └── utils.js
│
├── pages/
│   ├── dashboard.html           ← Dashboard satu-satunya modul ini
│   ├── users.html
│   ├── users-detail.html
│   └── login.html
│
└── data/
    └── users.json
```

---

### Tier 2 — Multi Modul (2–4 Modul)
> Cocok untuk: sistem dengan beberapa modul yang dikerjakan tim kecil

```
prototype/
│
├── _shared/
│   ├── components/
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── modal.html
│   │   └── toast.html
│   ├── layouts/
│   │   ├── default.html
│   │   ├── auth.html
│   │   └── print.html
│   ├── css/
│   │   ├── main.css
│   │   └── components.css
│   └── js/
│       ├── main.js
│       └── utils.js
│
├── modules/
│   ├── purchasing/
│   │   ├── components/
│   │   ├── dashboard.html       ← Ringkasan purchasing
│   │   ├── index.html
│   │   └── detail.html
│   └── finance/
│       ├── components/
│       ├── dashboard.html       ← Ringkasan finance
│       ├── index.html
│       └── report.html
│
└── data/
    ├── products.json
    └── transactions.json
```

---

### Tier 3 — Enterprise (5+ Modul)
> Cocok untuk: sistem besar, banyak programmer, modul kompleks

```
prototype/
│
├── _shared/
│   ├── components/
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── modal.html
│   │   └── toast.html
│   ├── layouts/
│   │   ├── default.html
│   │   ├── auth.html
│   │   └── print.html
│   ├── css/
│   │   ├── main.css
│   │   └── components.css
│   └── js/
│       ├── main.js
│       └── utils.js
│
├── modules/
│   ├── inventory/               ← Modul Inventory & Gudang (Saat Ini)
│   │   ├── dashboard/
│   │   │   └── index.html       ← Ringkasan total & TV Mode slideshow
│   │   ├── operasional/
│   │   │   ├── penerimaan-log.html
│   │   │   └── ...
│   │   ├── stok/
│   │   │   ├── stok-log.html
│   │   │   └── ...
│   │   ├── master-data/
│   │   │   ├── master-jenis-kayu.html
│   │   │   └── ...
│   │   └── sistem/
│   │       ├── system-log.html
│   │       └── pengaturan.html
│   │
│   ├── purchasing/              ← Modul Pembelian (Placeholder Terstruktur)
│   │   └── dashboard/
│   │       └── index.html
│   │
│   ├── ppic/                    ← Modul Perencanaan & Kontrol Produksi (Placeholder)
│   │   └── dashboard/
│   │       └── index.html
│   │
│   ├── finance/                 ← Modul Keuangan & Accounting (Placeholder)
│   │   └── dashboard/
│   │       └── index.html
│   │
│   └── pos/                     ← Modul Kasir / Point of Sales (Placeholder)
│       └── dashboard/
│           └── index.html
│
└── data/
    ├── users.json
    ├── products.json
    └── transactions.json
```

---

## Zona

| Zona        | Fungsi                                                             |
|-------------|--------------------------------------------------------------------|
| `_shared/`  | Dipakai semua halaman — jangan diubah sembarangan, koordinasi dulu |
| `modules/`  | Konten halaman per modul — bebas dikerjakan sesuai pembagian kerja |
| `pages/`    | Khusus Tier 1 — sama seperti `modules/` tapi tanpa pengelompokan  |
| `data/`     | Mock JSON — boleh tambah file baru, jangan ubah yang sudah ada     |

---

## Anatomi Satu File Halaman

```html
halaman.html
│
├── <head>
│   ├── CDN Tailwind 4
│   ├── CDN Font Awesome 7
│   └── ../../_shared/css/main.css
│
├── <body>
│   ├── <div id="navbar">        ← Diisi main.js dari _shared/components/navbar.html
│   ├── <div id="sidebar">       ← Diisi main.js dari _shared/components/sidebar.html
│   │
│   └── <main>                   ← Konten unik halaman ini, ditulis di sini
│
└── <script src="../../_shared/js/main.js">
```

> Setiap halaman hanya load `main.js` dan `main.css` dari `_shared/`.
> Tidak ada script atau style lain kecuali benar-benar spesifik halaman itu.

---

## Komponen Lokal vs Shared

| Kondisi                                       | Taruh di mana                   |
|-----------------------------------------------|---------------------------------|
| Komponen dipakai di lebih dari satu modul     | `_shared/components/`           |
| Komponen hanya dipakai di satu modul          | `modules/nama-modul/components/`|

---

## Aturan Penulisan Kode

### HTML
- Satu file = satu halaman, tidak ada halaman yang digabung
- Gunakan komentar `<!-- SECTION: nama -->` untuk memisahkan blok konten
- Atribut urutan: `id` → `class` → `data-*` → lainnya

### Tailwind
- Semua styling pakai Tailwind class langsung di HTML
- Warna yang tidak ada di Tailwind → pakai CSS Variable, bukan hardcode hex
- Jangan buat class CSS baru kalau Tailwind sudah bisa menangani

### Font Awesome 7
- Semua icon dari Font Awesome, tidak dari sumber lain
- Tulis lengkap: `<i class="fa-solid fa-user"></i>`
- Beri `aria-hidden="true"` pada icon yang dekoratif
- ⚠️ **DILARANG membuat SVG inline** — SVG buatan AI menghabiskan banyak token, sulit dibaca, dan tidak konsisten. Selalu ganti dengan Font Awesome icon yang setara

### Gambar Dummy
- Semua gambar placeholder dari `https://dummyimage.com/`
- Format URL: `https://dummyimage.com/{w}x{h}/{bg-hex}/{fg-hex}&text={label}`
- Gunakan fungsi helper dari `utils.js`, jangan tulis URL panjang langsung di HTML

### JavaScript
- Vanilla JS saja, tidak ada library kecuali yang sudah didefinisikan
- Interaksi UI (toggle class, show/hide) → tulis di `main.js`
- Fungsi yang dipakai lebih dari satu tempat → pindah ke `utils.js`
- Jangan manipulasi DOM dengan string panjang, gunakan `innerHTML` hanya untuk inject komponen

### Data Mock
- Data dummy disimpan di `data/*.json`, di-fetch via `fetch()`
- Jangan hardcode array data langsung di dalam file HTML atau JS halaman

---

## `_shared/css/main.css` — Sesedikit Mungkin

Hanya berisi CSS Variables dan animasi global:

```css
:root {
  --color-primary:   ...;
  --color-surface:   ...;
  --sidebar-width:   ...;
  --navbar-height:   ...;
  --radius:          ...;
  --shadow:          ...;
}
```

Tidak ada class komponen di sini. Tidak ada style per-halaman di sini.

---

## Penamaan File & Folder

| Jenis            | Format           | Contoh                     |
|------------------|------------------|----------------------------|
| File HTML        | kebab-case       | `purchase-order.html`      |
| File JS / CSS    | kebab-case       | `main.js`, `utils.js`      |
| File JSON        | kebab-case       | `purchase-orders.json`     |
| Folder modul     | kebab-case       | `purchasing/`, `warehouse/`|
| ID di HTML       | kebab-case       | `id="modal-confirm"`       |
| Class custom CSS | kebab-case       | `.sidebar-item`            |

---

## Cara Baca untuk AI / Programmer

```
Mau tambah halaman baru?           →  buat file di modules/nama-modul/
Mau tambah komponen lokal?         →  modules/nama-modul/components/
Mau pakai komponen shared?         →  lihat _shared/components/, jangan edit
Mau ubah tampilan navbar/sidebar?  →  tanya konseptor, ada di _shared/
Mau ubah warna / token global?     →  tanya konseptor, ada di _shared/css/main.css
Butuh data dummy?                  →  fetch dari data/nama-file.json
Butuh gambar dummy?                →  pakai fungsi dari utils.js atau URL dummyimage.com
```

---

## Yang Tidak Boleh Dilakukan AI

- ❌ Membuat file di luar struktur yang sudah didefinisikan
- ❌ Mengubah file di `_shared/` tanpa instruksi eksplisit
- ❌ Menambah library atau CDN baru tanpa persetujuan
- ❌ Membuat sistem routing / SPA
- ❌ Menulis logika bisnis atau kalkulasi data — ini hanya prototype visual
- ❌ Menggunakan framework JS (React, Vue, Alpine, dsb)
- ❌ Membuat CSS class baru kalau Tailwind sudah bisa menangani
- ❌ **Membuat SVG inline** — boros token, tidak konsisten, sulit di-maintain. Gunakan Font Awesome
