import os
import re

base_dir = r"d:\PromptEngineer\new_ty\admin"

pages = {
    "penerimaan-log": {"title": "Penerimaan Log", "parent": "Operasional · Penerimaan"},
    "penerimaan-sawtimber": {"title": "Penerimaan Sawtimber", "parent": "Operasional · Penerimaan"},
    "penerimaan-crosscut": {"title": "Penerimaan Crosscut", "parent": "Operasional · Penerimaan"},
    "penerimaan-kaca": {"title": "Penerimaan Kaca", "parent": "Operasional · Penerimaan"},
    "konversi-log": {"title": "Konversi Log", "parent": "Operasional"},
    "produksi": {"title": "Produksi", "parent": "Operasional"},
    "penjualan-produk": {"title": "Penjualan Produk", "parent": "Operasional"},
    "manajemen-stok": {"title": "Manajemen Stok", "parent": "Inventaris"},
    "data-material": {"title": "Data Material", "parent": "Master Data"},
}

nav_template = """        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

            <a href="index.html" class="nav-item {index_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Dashboard
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Operasional</p>

            <!-- Penerimaan accordion -->
            <div>
                <button onclick="toggleMenu('penerimaan')" class="nav-item w-full text-left">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                    Penerimaan
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

            <a href="konversi-log.html" class="nav-item {konversi_log_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                Konversi Log
            </a>

            <a href="produksi.html" class="nav-item {produksi_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M5.34 6.34L3.93 4.93M12 19v2M12 3V1" />
                </svg>
                Produksi
            </a>

            <a href="penjualan-produk.html" class="nav-item {penjualan_produk_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Penjualan Produk
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Inventaris</p>

            <a href="manajemen-stok.html" class="nav-item {manajemen_stok_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Manajemen Stok
            </a>

            <p class="px-3 pt-4 pb-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Master Data</p>

            <a href="data-material.html" class="nav-item {data_material_active}">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                Data Material
            </a>

        </nav>"""

page_template = """<!DOCTYPE html>
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
        tailwind.config = {{
            theme: {{ extend: {{ fontFamily: {{ sans: ['Plus Jakarta Sans', 'sans-serif'] }} }} }}
        }}
    </script>
    <link rel="stylesheet" href="shared.css">
</head>

<body class="flex h-screen overflow-hidden bg-[#F5F3EF] font-sans">

    <!-- ═══════════════════════════ SIDEBAR ═══════════════════════════ -->
    <aside class="w-60 flex-shrink-0 h-full bg-white flex flex-col overflow-hidden" style="border-right:1px solid #F0EDE8;">
        <!-- Logo -->
        <div class="px-5 py-5" style="border-bottom:1px solid #F0EDE8;">
            <a href="index.html" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="14" width="4" height="6" rx="1" /><rect x="10" y="10" width="4" height="10" rx="1" />
                        <rect x="17" y="12" width="4" height="8" rx="1" /><path d="M5 14V8M12 10V4M19 12V6" /><path d="M3 4h18" />
                    </svg>
                </div>
                <div>
                    <p class="font-extrabold text-zinc-900 text-sm leading-tight tracking-tight">WoodTrack</p>
                    <p class="text-[10px] font-bold text-amber-600 uppercase tracking-[0.12em]">Pro Edition</p>
                </div>
            </a>
        </div>
{nav_content}
        <!-- User profile -->
        <div class="p-3" style="border-top:1px solid #F0EDE8;">
            <div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
                <div class="min-w-0">
                    <p class="text-sm font-bold text-zinc-800 truncate">Admin</p>
                    <p class="text-[11px] text-zinc-400 truncate">admin@woodtrack.id</p>
                </div>
            </div>
        </div>
    </aside>

    <!-- ═══════════════════════════ MAIN ═══════════════════════════ -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- TOP BAR -->
        <header class="h-16 bg-white flex items-center justify-between px-6 flex-shrink-0" style="border-bottom:1px solid #F0EDE8;">
            <div>
                <h1 class="text-base font-extrabold text-zinc-900 tracking-tight">{title}</h1>
                <p class="text-[11px] text-zinc-400 mt-0.5">{parent}</p>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-px h-6 bg-zinc-100 mx-1"></div>
                <button class="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                </button>
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer">A</div>
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

    <script>
        function toggleMenu(id) {{
            const menu = document.getElementById(id + '-menu');
            const chevron = document.getElementById(id + '-chevron');
            menu.classList.toggle('open');
            chevron.classList.toggle('open');
        }}
    </script>
</body>
</html>
"""

def get_nav(active_id):
    kwargs = {
        "index_active": "",
        "penerimaan_open": "",
        "penerimaan_log_active": "",
        "penerimaan_sawtimber_active": "",
        "penerimaan_crosscut_active": "",
        "penerimaan_kaca_active": "",
        "konversi_log_active": "",
        "produksi_active": "",
        "penjualan_produk_active": "",
        "manajemen_stok_active": "",
        "data_material_active": ""
    }
    
    if active_id == "index":
        kwargs["index_active"] = "active"
    elif active_id.startswith("penerimaan-"):
        kwargs["penerimaan_open"] = "open"
        kwargs[active_id.replace('-', '_') + "_active"] = "active"
    else:
        kwargs[active_id.replace('-', '_') + "_active"] = "active"
        
    return nav_template.format(**kwargs)

# 1. Update index.html
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    index_html = f.read()

nav_match = re.search(r'<!-- Nav -->\s*<nav.*?</nav>', index_html, re.DOTALL)
if nav_match:
    index_html = index_html[:nav_match.start()] + get_nav("index") + index_html[nav_match.end():]

# Make sure index.html links back to index.html in Logo wrapper
index_html = index_html.replace('<div class="flex items-center gap-3">', '<a href="index.html" class="flex items-center gap-3" style="text-decoration:none;">', 1)
index_html = index_html.replace('</div>\n                <div>\n                    <p class="font-extrabold', '</div>\n                <div>\n                    <p class="font-extrabold', 1) # Not needed
index_html = index_html.replace('tracking-[0.12em]">Pro Edition</p>\n                </div>\n            </div>', 'tracking-[0.12em]">Pro Edition</p>\n                </div>\n            </a>', 1)

with open(os.path.join(base_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)

# 2. Create other pages
for page_id, info in pages.items():
    nav_html = get_nav(page_id)
    content = page_template.format(
        title=info["title"],
        parent=info["parent"],
        nav_content=nav_html
    )
    with open(os.path.join(base_dir, page_id + ".html"), "w", encoding="utf-8") as f:
        f.write(content)

print("Pages created successfully.")
