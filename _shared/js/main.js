// ── Shared JavaScript for WoodTrack Modular UI/UX ──

// Inlined components HTML to bypass browser CORS blocks on local file:// protocol
const sidebarHtml = `<aside class="w-[260px] flex-shrink-0 h-full bg-white flex flex-col overflow-hidden" style="border-right:1px solid #F0EDE8;">
    <!-- Logo -->
    <div class="px-5 py-5" style="border-bottom:1px solid #F0EDE8;">
        <a href="{root}modules/inventory/dashboard/index.html" class="flex items-center gap-3" style="text-decoration:none;">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md flex-shrink-0" style="box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);">
                <i class="fa-solid fa-chart-simple text-white text-lg"></i>
            </div>
            <div class="sidebar-text">
                <p class="font-extrabold text-zinc-900 text-sm leading-tight tracking-tight">WoodTrack</p>
                <p class="text-[10px] font-bold text-amber-600 uppercase tracking-[0.14em]">Pro Edition</p>
            </div>
        </a>
    </div>

    <!-- Module Switcher -->
    <div class="px-4 pb-3 pt-3 sidebar-text" style="border-bottom:1px solid #F0EDE8;">
        <p class="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">MODUL AKTIF</p>
        <select id="module-switcher" onchange="window.location.href=this.value" class="premium-select w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="{root}modules/inventory/dashboard/index.html" data-module="inventory">📦 Inventory & Gudang</option>
            <option value="{root}modules/purchasing/dashboard/index.html" data-module="purchasing">🛒 Purchasing (Pembelian)</option>
            <option value="{root}modules/ppic/dashboard/index.html" data-module="ppic">⚙️ PPIC (Produksi)</option>
            <option value="{root}modules/finance/dashboard/index.html" data-module="finance">💼 Finance & Accounting</option>
            <option value="{root}modules/pos/dashboard/index.html" data-module="pos">🏪 Point of Sales (POS)</option>
        </select>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {nav_content}
    </nav>
</aside>
`;

const navMenusByModule = {
    inventory: `
        <a href="{root}modules/inventory/dashboard/index.html" class="nav-item" data-title="Dashboard">
            <i class="fa-solid fa-chart-pie w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Dashboard</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operasional</p>

        <!-- Penerimaan Accordion -->
        <div class="has-submenu-container">
            <button onclick="toggleMenu('penerimaan')" class="nav-item w-full text-left has-submenu" data-title="Penerimaan">
                <i class="fa-solid fa-inbox w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
                <span class="sidebar-text">Penerimaan</span>
                <i id="penerimaan-chevron" class="fa-solid fa-chevron-down ml-auto text-[10px] chevron text-zinc-400"></i>
            </button>
            <div id="penerimaan-menu" class="submenu ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                <a href="{root}modules/inventory/operasional/penerimaan-log/index.html" class="submenu-item">Penerimaan Log</a>
                <a href="{root}modules/inventory/operasional/penerimaan-sawtimber/index.html" class="submenu-item">Penerimaan Sawtimber</a>
                <a href="{root}modules/inventory/operasional/penerimaan-crosscut/index.html" class="submenu-item">Penerimaan Crosscut</a>
                <a href="{root}modules/inventory/operasional/penerimaan-kaca/index.html" class="submenu-item">Penerimaan Kaca</a>
            </div>
        </div>

        <a href="{root}modules/inventory/operasional/konversi-log/index.html" class="nav-item" data-title="Konversi Log">
            <i class="fa-solid fa-arrows-spin w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Konversi Log</span>
        </a>

        <a href="{root}modules/inventory/operasional/konversi-kiln-dry/index.html" class="nav-item" data-title="Konversi Kiln Dry">
            <i class="fa-solid fa-fire w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Konversi Kiln Dry</span>
        </a>

        <a href="{root}modules/inventory/operasional/proses-produksi/index.html" class="nav-item" data-title="Proses Produksi">
            <i class="fa-solid fa-industry w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Proses Produksi</span>
        </a>

        <a href="{root}modules/inventory/operasional/hasil-produksi/index.html" class="nav-item" data-title="Hasil Produksi">
            <i class="fa-solid fa-clipboard-check w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Hasil Produksi</span>
        </a>

        <a href="{root}modules/inventory/operasional/penjualan-produk/index.html" class="nav-item" data-title="Penjualan Produk">
            <i class="fa-solid fa-cart-shopping w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Penjualan Produk</span>
        </a>

        <a href="{root}modules/inventory/operasional/waste-material/index.html" class="nav-item" data-title="Waste Material">
            <i class="fa-solid fa-trash-can w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Waste Material</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stok</p>

        <a href="{root}modules/inventory/stok/stok-log/index.html" class="nav-item" data-title="Stok Log">
            <i class="fa-solid fa-tree w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stok Log</span>
        </a>

        <a href="{root}modules/inventory/stok/stok-sawtimber/index.html" class="nav-item" data-title="Stok Sawtimber">
            <i class="fa-solid fa-cubes w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stok Sawtimber</span>
        </a>

        <a href="{root}modules/inventory/stok/stok-crosscut/index.html" class="nav-item" data-title="Stok Crosscut">
            <i class="fa-solid fa-grip-lines w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stok Crosscut</span>
        </a>

        <a href="{root}modules/inventory/stok/stok-bahan-baku/index.html" class="nav-item" data-title="Stok Bahan Baku">
            <i class="fa-solid fa-boxes-stacked w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stok Bahan Baku</span>
        </a>

        <a href="{root}modules/inventory/stok/stok-product/index.html" class="nav-item" data-title="Stok Produk">
            <i class="fa-solid fa-box-open w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stok Produk</span>
        </a>

        <a href="{root}modules/inventory/stok/stock-opname/index.html" class="nav-item" data-title="Stock Opname">
            <i class="fa-solid fa-clipboard-list w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Stock Opname</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Data</p>

        <a href="{root}modules/inventory/master-data/master-jenis-kayu/index.html" class="nav-item" data-title="Master Jenis Kayu">
            <i class="fa-solid fa-tag w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Master Jenis Kayu</span>
        </a>

        <!-- Master Log Accordion -->
        <div class="has-submenu-container">
            <button onclick="toggleMenu('master-log')" class="nav-item w-full text-left has-submenu" data-title="Master Log">
                <i class="fa-solid fa-folder-open w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
                <span class="sidebar-text">Master Log</span>
                <i id="master-log-chevron" class="fa-solid fa-chevron-down ml-auto text-[10px] chevron text-zinc-400"></i>
            </button>
            <div id="master-log-menu" class="submenu ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                <a href="{root}modules/inventory/master-data/master-grade/index.html" class="submenu-item">Master Grade</a>
                <a href="{root}modules/inventory/master-data/master-ukuran/index.html" class="submenu-item">Master Ukuran</a>
            </div>
        </div>

        <a href="{root}modules/inventory/master-data/master-ukuran-sw/index.html" class="nav-item" data-title="Master Ukuran Sawtimber">
            <i class="fa-solid fa-ruler-combined w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Master Ukuran Sawtimber</span>
        </a>

        <a href="{root}modules/inventory/master-data/master-crosscut/index.html" class="nav-item" data-title="Master Crosscut">
            <i class="fa-solid fa-list-check w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Master Crosscut</span>
        </a>

        <!-- Master Kaca Accordion -->
        <div class="has-submenu-container">
            <button onclick="toggleMenu('master-kaca')" class="nav-item w-full text-left has-submenu" data-title="Master Kaca">
                <i class="fa-solid fa-border-all w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
                <span class="sidebar-text">Master Kaca</span>
                <i id="master-kaca-chevron" class="fa-solid fa-chevron-down ml-auto text-[10px] chevron text-zinc-400"></i>
            </button>
            <div id="master-kaca-menu" class="submenu ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                <a href="{root}modules/inventory/master-data/master-kaca-tipe-warna/index.html" class="submenu-item">Tipe / Warna</a>
                <a href="{root}modules/inventory/master-data/master-kaca-tebal/index.html" class="submenu-item">Tebal (mm)</a>
                <a href="{root}modules/inventory/master-data/master-kaca-ukuran/index.html" class="submenu-item">Ukuran Standard</a>
                <a href="{root}modules/inventory/master-data/master-kaca-grade/index.html" class="submenu-item">Grade</a>
            </div>
        </div>

        <a href="{root}modules/inventory/master-data/master-bahan-baku/index.html" class="nav-item" data-title="Master Ukuran Oven (Dry)">
            <i class="fa-solid fa-fire-burner w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Master Ukuran Oven (Dry)</span>
        </a>

        <!-- Master Produk Accordion -->
        <div class="has-submenu-container">
            <button onclick="toggleMenu('master-produk')" class="nav-item w-full text-left has-submenu" data-title="Master Produk">
                <i class="fa-solid fa-tags w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
                <span class="sidebar-text">Master Produk</span>
                <i id="master-produk-chevron" class="fa-solid fa-chevron-down ml-auto text-[10px] chevron text-zinc-400"></i>
            </button>
            <div id="master-produk-menu" class="submenu ml-3 pl-3 mt-1 space-y-0.5" style="border-left:2px solid #F0EDE8;">
                <a href="{root}modules/inventory/master-data/master-produk-detail/index.html" class="submenu-item">Detail Produk</a>
                <a href="{root}modules/inventory/master-data/master-produk-kategori/index.html" class="submenu-item">Kategori Produk</a>
            </div>
        </div>

        <a href="{root}modules/inventory/master-data/master-pengguna/index.html" class="nav-item" data-title="Master Pengguna">
            <i class="fa-solid fa-users w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Master Pengguna</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem</p>

        <a href="{root}modules/inventory/sistem/system-log/index.html" class="nav-item" data-title="System Log">
            <i class="fa-solid fa-file-shield w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">System Log</span>
        </a>
    `,
    purchasing: `
        <a href="{root}modules/purchasing/dashboard/index.html" class="nav-item" data-title="Dashboard">
            <i class="fa-solid fa-chart-pie w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Dashboard</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operasional</p>

        <a href="#" class="nav-item" data-title="Permintaan Pembelian (PR)">
            <i class="fa-solid fa-file-signature w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Permintaan (PR)</span>
        </a>

        <a href="#" class="nav-item" data-title="Order Pembelian (PO)">
            <i class="fa-solid fa-file-invoice-dollar w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Order Pembelian (PO)</span>
        </a>

        <a href="#" class="nav-item" data-title="Penerimaan Barang">
            <i class="fa-solid fa-truck-ramp-box w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Penerimaan Barang</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Data</p>

        <a href="#" class="nav-item" data-title="Daftar Supplier">
            <i class="fa-solid fa-handshake w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Daftar Supplier</span>
        </a>

        <a href="#" class="nav-item" data-title="Harga Bahan Baku">
            <i class="fa-solid fa-tags w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Harga Bahan Baku</span>
        </a>
    `,
    ppic: `
        <a href="{root}modules/ppic/dashboard/index.html" class="nav-item" data-title="Dashboard">
            <i class="fa-solid fa-chart-pie w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Dashboard</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Perencanaan</p>

        <a href="#" class="nav-item" data-title="Jadwal MPS">
            <i class="fa-regular fa-calendar-check w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Jadwal MPS</span>
        </a>

        <a href="#" class="nav-item" data-title="Perintah Kerja (WO)">
            <i class="fa-solid fa-gears w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Perintah Kerja (WO)</span>
        </a>

        <a href="#" class="nav-item" data-title="Kebutuhan Material (MRP)">
            <i class="fa-solid fa-calculator w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Kebutuhan Material</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operasional</p>

        <a href="#" class="nav-item" data-title="Kapasitas Mesin">
            <i class="fa-solid fa-gauge-high w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Kapasitas Mesin</span>
        </a>

        <a href="#" class="nav-item" data-title="Realisasi Produksi">
            <i class="fa-solid fa-business-time w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Realisasi Produksi</span>
        </a>
    `,
    finance: `
        <a href="{root}modules/finance/dashboard/index.html" class="nav-item" data-title="Dashboard">
            <i class="fa-solid fa-chart-pie w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Dashboard</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transaksi</p>

        <a href="#" class="nav-item" data-title="Kas & Bank">
            <i class="fa-solid fa-wallet w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Kas & Bank</span>
        </a>

        <a href="#" class="nav-item" data-title="Pembayaran Supplier">
            <i class="fa-solid fa-money-bill-transfer w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Pembayaran Supplier</span>
        </a>

        <a href="#" class="nav-item" data-title="Tagihan Pelanggan">
            <i class="fa-solid fa-file-invoice w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Tagihan Pelanggan</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Akuntansi</p>

        <a href="#" class="nav-item" data-title="Jurnal Umum">
            <i class="fa-solid fa-book w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Jurnal Umum</span>
        </a>

        <a href="#" class="nav-item" data-title="Buku Besar">
            <i class="fa-solid fa-book-open w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Buku Besar</span>
        </a>

        <a href="#" class="nav-item" data-title="Laporan Keuangan">
            <i class="fa-solid fa-chart-column w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Laporan Keuangan</span>
        </a>
    `,
    pos: `
        <a href="{root}modules/pos/dashboard/index.html" class="nav-item" data-title="Dashboard">
            <i class="fa-solid fa-chart-pie w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Dashboard</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transaksi</p>

        <a href="#" class="nav-item" data-title="Penjualan POS">
            <i class="fa-solid fa-cash-register w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Kasir / Penjualan POS</span>
        </a>

        <a href="#" class="nav-item" data-title="Daftar Transaksi">
            <i class="fa-solid fa-receipt w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Daftar Transaksi</span>
        </a>

        <a href="#" class="nav-item" data-title="Ringkasan Shift">
            <i class="fa-solid fa-clock-rotate-left w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Ringkasan Shift</span>
        </a>

        <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Data</p>

        <a href="#" class="nav-item" data-title="Daftar Pelanggan">
            <i class="fa-solid fa-users-line w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Daftar Pelanggan</span>
        </a>

        <a href="#" class="nav-item" data-title="Diskon & Promo">
            <i class="fa-solid fa-percent w-4 h-4 flex items-center justify-center text-[15px] flex-shrink-0"></i>
            <span class="sidebar-text">Diskon & Promo</span>
        </a>
    `
};

const navbarHtml = `<header class="h-16 bg-white flex items-center justify-between px-6 flex-shrink-0 relative z-30" style="border-bottom:1px solid #F0EDE8;">
    <div class="flex items-center gap-3">
        <button id="sidebar-toggle-btn" class="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all" title="Toggle Sidebar">
            <i class="fa-solid fa-bars text-[17px] leading-none"></i>
        </button>
        <div>
            <h1 id="navbar-title" class="text-base font-extrabold text-zinc-900 tracking-tight"></h1>
            <p id="navbar-subtitle" class="text-[11px] text-zinc-400 mt-0.5"></p>
        </div>
    </div>
    <div class="flex items-center gap-3">
        <div class="text-xs font-semibold text-zinc-500 hidden sm:flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl cursor-default hover:bg-zinc-100/80 transition-all select-none">
            <i class="fa-regular fa-clock text-zinc-400"></i>
            <span id="live-datetime">-</span>
        </div>
        <button id="navbar-tv-btn" onclick="toggleTVMode()" class="hidden px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all items-center gap-2 active:scale-95">
            <i class="fa-solid fa-tv"></i>
            TV MODE
        </button>
        <div class="hidden sm:block w-px h-6 bg-zinc-100 mx-1"></div>

        <!-- Profile Dropdown -->
        <div class="relative">
            <div id="profile-menu-button" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-50 cursor-pointer transition-all border border-transparent hover:border-zinc-100">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-sm" id="avatar-initial">A</div>
                <div class="text-left hidden md:block">
                    <p class="text-xs font-bold text-zinc-800 leading-tight" id="nav-profile-name">Admin</p>
                    <p class="text-[10px] text-zinc-400 leading-none mt-0.5" id="nav-profile-email">admin@woodtrack.id</p>
                </div>
                <i class="fa-solid fa-chevron-down text-zinc-400 text-[9px] hidden md:block"></i>
            </div>
            <!-- Dropdown -->
            <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 py-1.5 z-50 origin-top-right transition-all transform scale-95 opacity-0">
                <a id="profile-settings-link" href="#" class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                    <i class="fa-solid fa-gear text-zinc-400 text-sm"></i>
                    Pengaturan
                </a>
                <div class="h-px bg-zinc-100 my-1"></div>
                <a id="profile-logout-link" href="#logout" class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                    <i class="fa-solid fa-right-from-bracket text-rose-500 text-sm"></i>
                    Keluar
                </a>
            </div>
        </div>
    </div>
</header>
`;
const modalHtml = `<div id="shared-confirm-modal" class="modal-container">
    <div class="modal-backdrop" onclick="closeConfirmModal()"></div>
    <div class="modal-content">
        <h3 id="shared-modal-title" class="text-sm font-bold text-zinc-800 mb-2"></h3>
        <p id="shared-modal-message" class="text-xs text-zinc-500 mb-6 leading-relaxed"></p>
        <div class="flex justify-end gap-3">
            <button onclick="closeConfirmModal()" class="px-5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-xl transition-all">Batal</button>
            <button id="shared-modal-confirm-btn" class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]">Konfirmasi</button>
        </div>
    </div>
</div>
`;
const toastHtml = `<div id="shared-toast-container" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"></div>
`;

// Global toggleMenu to handle accordions in sidebar
window.toggleMenu = function(id) {
    const sidebar = document.querySelector('aside');
    if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
        sidebar.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', 'false');
    }
    const menu = document.getElementById(id + '-menu');
    const chevron = document.getElementById(id + '-chevron');
    if (menu) menu.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Resolve relative path to _shared
    const mainScript = document.querySelector('script[src*="_shared/js/main.js"]');
    let sharedPath = '../../_shared/';
    if (mainScript) {
        const src = mainScript.getAttribute('src');
        const idx = src.indexOf('_shared/');
        if (idx !== -1) {
            sharedPath = src.substring(0, idx + 8);
        }
    }

    // 2. Synchronously insert navbar, sidebar, modal, toast
    const sidebarTarget = document.getElementById('sidebar');
    const navbarTarget = document.getElementById('navbar');

    // Load Sidebar
    if (sidebarTarget) {
        const rootPath = sharedPath + '../';
        
        // Determine active module
        let activeMod = 'inventory'; // default
        const pathParts = window.location.pathname.split('/');
        const modulesIdx = pathParts.indexOf('modules');
        if (modulesIdx !== -1 && pathParts[modulesIdx + 1]) {
            activeMod = pathParts[modulesIdx + 1];
        }

        const navContent = navMenusByModule[activeMod] || navMenusByModule['inventory'];
        const finalSidebarHtml = sidebarHtml.replace('{nav_content}', navContent).split('{root}').join(rootPath);
        sidebarTarget.innerHTML = finalSidebarHtml;
        initSidebar(sharedPath);
    }

    // Load Navbar
    if (navbarTarget) {
        navbarTarget.innerHTML = navbarHtml;
        initNavbar(sharedPath);
    }

    // Load Modal & Toast Containers if not present
    if (!document.getElementById('shared-confirm-modal')) {
        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div.firstElementChild);
    }

    if (!document.getElementById('shared-toast-container')) {
        const div = document.createElement('div');
        div.innerHTML = toastHtml;
        document.body.appendChild(div.firstElementChild);
    }
});

// ── Sidebar Init and Navigation Active Highlighting ──
function initSidebar(sharedPath) {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    // Resolve current path name and highlight link using native URL parsing
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('#')) {
            try {
                const urlObj = new URL(link.href, window.location.href);
                if (urlObj.pathname === window.location.pathname) {
                    link.classList.add('active');
                    
                    // Expand parent menu if it's inside a submenu
                    const submenu = link.closest('.submenu');
                    if (submenu) {
                        submenu.classList.add('open');
                        const container = submenu.closest('.has-submenu-container');
                        if (container) {
                            const btn = container.querySelector('.has-submenu');
                            const chevron = container.querySelector('.chevron');
                            if (btn) btn.classList.add('active');
                            if (chevron) chevron.classList.add('open');
                        }
                    }
                }
            } catch (e) {
                // Ignore parsing errors for custom protocols
            }
        }
    });

    // Handle Module Switcher Active State
    const switcher = document.getElementById('module-switcher');
    if (switcher) {
        const pathParts = window.location.pathname.split('/');
        const modulesIdx = pathParts.indexOf('modules');
        if (modulesIdx !== -1 && pathParts[modulesIdx + 1]) {
            const activeMod = pathParts[modulesIdx + 1];
            const option = switcher.querySelector(`option[data-module="${activeMod}"]`);
            if (option) {
                option.selected = true;
            }
        }
    }

    // Sidebar toggles for Desktop (collapsed) and Mobile
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    let backdrop = document.getElementById('sidebar-mobile-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebar-mobile-backdrop';
        backdrop.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden transition-opacity duration-200 opacity-0';
        document.body.appendChild(backdrop);
    }

    function openMobileSidebar() {
        sidebar.classList.add('mobile-open');
        if (backdrop) {
            backdrop.classList.remove('hidden');
            setTimeout(() => backdrop.classList.add('opacity-100'), 10);
        }
    }

    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            setTimeout(() => backdrop.classList.add('hidden'), 200);
        }
    }

    // Bind event to toggle buttons (from both navbar and local overrides)
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#sidebar-toggle-btn');
        if (toggleBtn) {
            e.stopPropagation();
            if (window.innerWidth < 768) {
                if (sidebar.classList.contains('mobile-open')) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            } else {
                sidebar.classList.toggle('sidebar-collapsed');
                const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
                localStorage.setItem('sidebar-collapsed', isCollapsed);
            }
        }
    });

    backdrop.addEventListener('click', closeMobileSidebar);

    // Close mobile sidebar on link clicks
    const navLinks = sidebar.querySelectorAll('nav a, nav button');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeMobileSidebar();
            }
        });
    });

    // Restore desktop sidebar collapse state
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed && window.innerWidth >= 768) {
        sidebar.classList.add('sidebar-collapsed');
    }
}

// ── Navbar Init (Title, clock, profile dropdown) ──
function initNavbar(sharedPath) {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    // Set page title and subtitle dynamically from main element attributes
    const title = mainElement.getAttribute('data-title') || 'WoodTrack Pro';
    const subtitle = mainElement.getAttribute('data-subtitle') || '';

    const navbarTitle = document.getElementById('navbar-title');
    const navbarSubtitle = document.getElementById('navbar-subtitle');

    if (navbarTitle) navbarTitle.innerHTML = title;
    if (navbarSubtitle) navbarSubtitle.textContent = subtitle;

    // Resolve profile settings link relative path
    const profileSettings = document.getElementById('profile-settings-link');
    if (profileSettings) {
        profileSettings.setAttribute('href', sharedPath + '../modules/inventory/sistem/pengaturan/index.html');
    }

    // Check if on Dashboard index.html to show TV Mode button
    const pathParts = window.location.pathname.split('/');
    const currentModule = pathParts[pathParts.length - 2] || "";
    const pageName = pathParts[pathParts.length - 1] || "";
    const isDashboard = currentModule === 'dashboard' && (pageName === 'index.html' || pageName === '');

    const tvBtn = document.getElementById('navbar-tv-btn');
    if (tvBtn) {
        if (isDashboard) {
            tvBtn.classList.remove('hidden');
            tvBtn.classList.add('flex');
        } else {
            tvBtn.classList.add('hidden');
        }
    }

    // Profile Dropdown Actions
    const profileBtn = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = profileDropdown.classList.contains('hidden');
            if (isHidden) {
                profileDropdown.classList.remove('hidden');
                setTimeout(() => {
                    profileDropdown.classList.remove('opacity-0', 'scale-95');
                    profileDropdown.classList.add('opacity-100', 'scale-100');
                }, 10);
            } else {
                closeDropdown();
            }
        });

        function closeDropdown() {
            profileDropdown.classList.remove('opacity-100', 'scale-100');
            profileDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
            }, 150);
        }

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                if (!profileDropdown.classList.contains('hidden')) {
                    closeDropdown();
                }
            }
        });

        // Sync admin details across pages
        const savedName = localStorage.getItem('admin_name');
        const savedEmail = localStorage.getItem('admin_email');
        if (savedName) {
            const nameEl = profileBtn.querySelector('#nav-profile-name');
            if (nameEl) nameEl.textContent = savedName;
            const avatarEl = profileBtn.querySelector('#avatar-initial');
            if (avatarEl && savedName.length > 0) avatarEl.textContent = savedName.charAt(0).toUpperCase();
        }
        if (savedEmail) {
            const emailEl = profileBtn.querySelector('#nav-profile-email');
            if (emailEl) emailEl.textContent = savedEmail;
        }
    }

    // Digital Clock Updates
    const liveDatetimeEl = document.getElementById('live-datetime');
    const tvLiveDatetimeEl = document.getElementById('tv-live-datetime');

    function updateClock() {
        const now = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const dayName = days[now.getDay()];
        const dateVal = String(now.getDate()).padStart(2, '0');
        const monthName = months[now.getMonth()];
        const yearVal = now.getFullYear();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const clockStr = `${dayName}, ${dateVal} ${monthName} ${yearVal} ${hours}:${minutes}:${seconds}`;
        if (liveDatetimeEl) liveDatetimeEl.textContent = clockStr;
        if (tvLiveDatetimeEl) tvLiveDatetimeEl.textContent = clockStr;
    }

    if (liveDatetimeEl || tvLiveDatetimeEl) {
        updateClock();
        setInterval(updateClock, 1000);
    }
}

// ── Global Reusable Modal Trigger ──
window.showConfirmModal = function(title, message, onConfirm) {
    const modal = document.getElementById('shared-confirm-modal');
    if (!modal) return;
    
    document.getElementById('shared-modal-title').textContent = title;
    document.getElementById('shared-modal-message').textContent = message;
    
    const confirmBtn = document.getElementById('shared-modal-confirm-btn');
    confirmBtn.onclick = () => {
        if (onConfirm) onConfirm();
        closeConfirmModal();
    };
    
    modal.classList.add('open');
};

window.closeConfirmModal = function() {
    const modal = document.getElementById('shared-confirm-modal');
    if (modal) modal.classList.remove('open');
};

// ── Global Reusable Toast Notification ──
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('shared-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}">
            ${type === 'success' ? '✓' : '✗'}
        </div>
        <span class="text-xs font-semibold text-zinc-800">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ── Global Activity Logging ──
window.logActivity = function(action, category, details) {
    try {
        const logs = JSON.parse(localStorage.getItem('woodtrack_system_logs') || '[]');
        const user = localStorage.getItem('admin_name') || 'Admin';
        const timestamp = new Date().toISOString();
        
        logs.unshift({
            id: String(Date.now() + Math.random()),
            timestamp,
            user,
            action,     // 'TAMBAH', 'EDIT', 'HAPUS', etc.
            category,   // 'Master Log', 'Master Sawtimber', etc.
            details
        });
        
        if (logs.length > 500) {
            logs.length = 500;
        }
        
        localStorage.setItem('woodtrack_system_logs', JSON.stringify(logs));
    } catch (e) {
        console.error('Error logging activity:', e);
    }
};
