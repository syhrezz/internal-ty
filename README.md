# WoodTrack Pro — System Prototype

Sistem monitoring real-time dan pencatatan operasional kayu (logs, sawtimber, kiln dry, crosscut, kaca) serta inventarisasi stok gudang. Prototype ini dibangun menggunakan arsitektur statis tanpa database/backend (multi-page HTML) dengan desain premium yang responsif.

---

## 📁 Struktur Direktori (Tier 3 — Enterprise)

Proyek ini menggunakan struktur modular untuk mengakomodasi modul skala besar secara rapi dan modular:

```
internal-ty/
│
├── _shared/                       # Komponen & aset bersama
│   ├── components/                # Potongan HTML dinamis (navbar, sidebar, modal, toast)
│   ├── layouts/                   # Template layout standar untuk referensi halaman baru
│   ├── css/                       # main.css (variabel :root) & components.css
│   └── js/                        # main.js (logika global) & utils.js (helper fungsi)
│
├── modules/                       # Folder Utama Halaman berdasarkan Modul
│   ├── inventory/                 # Modul Inventory & Gudang (Saat Ini)
│   │   ├── dashboard/             # Ringkasan / slideshow monitoring TV
│   │   ├── operasional/           # Penerimaan log, sawtimber, crosscut, kaca, dan produksi
│   │   ├── stok/                  # Log stok gudang, sawtimber, bahan baku, & stock opname
│   │   ├── master-data/           # Tabel referensi jenis kayu, grade, ukuran, kaca, pengguna
│   │   └── sistem/                # Jejak audit (system log) & pengaturan profil
│   │
│   ├── purchasing/                # Modul Pembelian (Konsep/Placeholder)
│   ├── ppic/                      # Modul Perencanaan & Kontrol Produksi (Konsep/Placeholder)
│   ├── finance/                   # Modul Keuangan & Accounting (Konsep/Placeholder)
│   └── pos/                       # Modul Kasir / Point of Sales (Konsep/Placeholder)
│
├── data/                          # Data mock berformat JSON (untuk disimulasikan via fetch)
│
├── index.html                     # Entrypoint utama (redirect otomatis ke dashboard inventory)
├── vercel.json                    # Konfigurasi deployment & URL clean routing Vercel
└── README.md                      # Dokumentasi sistem
```

---

## 💡 Prinsip Pengembangan & Penulisan Kode

### 1. DRY (Don't Repeat Yourself)
* **Navbar & Sidebar**: Tidak di-hardcode di tiap halaman. Semua dimuat dinamis dari `_shared/components/` via script `_shared/js/main.js` menggunakan JavaScript fetch API.
* **Layouting**: Memakai variabel CSS `:root` di `_shared/css/main.css` untuk nilai warna global, border, bayangan, dan spacing.

### 2. KISS (Keep It Simple, Stupid)
* Hanya menggunakan Vanilla JS murni. Tanpa bundler, transpiler, Node.js runtime di client, atau framework berat.
* Manipulasi UI ringan diselesaikan dengan pergantian kelas utilitas Tailwind.

### 3. Font Awesome 6.7.2 & Larangan SVG Inline
* Semua ikon wajib memakai tag Font Awesome standard: `<i class="fa-solid fa-icon-name"></i>` dengan versi library terpusat dari CDN.
* Dilarang keras menaruh kode inline `<svg>` di dalam file halaman untuk menjaga kerapian dokumen.

### 4. Data & Gambar Mock
* Setiap halaman memuat data tiruan dari data JSON lokal atau `localStorage`.
* Gambar dan avatar placeholder dihasilkan lewat bantuan `dummyimage.com` melalui helper `getPlaceholderImage()` dari file `utils.js`.

---

## 🛠️ Cara Menjalankan Secara Lokal

Cukup buka file `index.html` di browser Anda (atau jalankan Live Server dari editor VSCode / HTTP server sederhana) untuk menjelajahi prototipe interaktif ini secara lokal.
