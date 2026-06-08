// Master Data Products definition
        const MASTER_PRODUCTS = [
            { name: 'Pintu Jati Klasik', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PJT-001' },
            { name: 'Pintu Kaca Minimalis Jati', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PKM-002' },
            { name: 'Kusen Kayu Meranti', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=80&auto=format&fit=crop&q=60', sku: 'SKU-KKM-003' },
            { name: 'Frame Papan Kayu Meranti', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=80&auto=format&fit=crop&q=60', sku: 'SKU-FPK-004' },
            { name: 'Daun Jendela Sengon', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=80&auto=format&fit=crop&q=60', sku: 'SKU-DJS-005' }
        ];

        // State Variables
        let stockData = [];
        let filteredStock = [];
        let productFilter = 'All';
        let statusFilter = 'All';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            loadStockProducts();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        // Wood type dropdown is statically populated

        // Calculate product stocks dynamically
        function loadStockProducts() {
            const prodLogs = JSON.parse(localStorage.getItem('woodtrack_hasil_produksi_logs') || '[]');
            const salesLogs = JSON.parse(localStorage.getItem('woodtrack_penjualan_produk') || '[]');

            const stockMap = {};

            // Initialize all master data products in stock map
            MASTER_PRODUCTS.forEach(prod => {
                stockMap[prod.name] = {
                    name: prod.name,
                    sku: prod.sku,
                    image: prod.image,
                    produced: 0,
                    sold: 0,
                    stock: 0
                };
            });

            // 1. Add incoming produced products (only tipe === 'Barang Jadi')
            prodLogs.forEach(entry => {
                if (entry.tipe === 'Barang Jadi' && entry.nama) {
                    const key = entry.nama.trim();
                    if (!stockMap[key]) {
                        stockMap[key] = {
                            name: key,
                            sku: 'SKU-CUSTOM',
                            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=80&auto=format&fit=crop&q=60',
                            produced: 0,
                            sold: 0,
                            stock: 0
                        };
                    }
                    stockMap[key].produced += parseInt(entry.jumlah) || 0;
                }
            });

            // 2. Subtract outgoing sold products from sales
            salesLogs.forEach(sale => {
                if (sale.nama) {
                    const key = sale.nama.trim();
                    if (!stockMap[key]) {
                        stockMap[key] = {
                            name: key,
                            sku: 'SKU-CUSTOM',
                            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=80&auto=format&fit=crop&q=60',
                            produced: 0,
                            sold: 0,
                            stock: 0
                        };
                    }
                    stockMap[key].sold += parseInt(sale.jumlah) || 0;
                }
            });

            // 3. Compute final available stock balances
            stockData = Object.values(stockMap).map(item => {
                const stockLeft = Math.max(0, item.produced - item.sold);
                return {
                    ...item,
                    stock: stockLeft
                };
            });
        }

        // Metrics calculations
        function updateDashboardStats() {
            let totalStock = 0;
            let totalSold = 0;
            let alertsCount = 0;

            stockData.forEach(item => {
                totalStock += item.stock;
                totalSold += item.sold;

                // Alerts if stock is critical (<= 3 units)
                if (item.stock <= 3) {
                    alertsCount++;
                }
            });

            document.getElementById('stat-total-stock').innerText = totalStock + ' unit';
            document.getElementById('stat-total-sold').innerText = totalSold + ' unit';
            document.getElementById('stat-total-models').innerText = MASTER_PRODUCTS.length + ' Model';
            document.getElementById('stat-alerts').innerText = alertsCount + ' Produk';
        }

        // Filter Actions
        function handleProductFilter(val) {
            productFilter = val;
            applyFiltersAndRender();
        }

        function handleStatusFilter(val) {
            statusFilter = val;
            applyFiltersAndRender();
        }

        function handleSearch(val) {
            searchQuery = val.toLowerCase().trim();
            applyFiltersAndRender();
        }

        function applyFiltersAndRender() {
            currentPage = 1;
            filterData();
            renderTable();
        }

        function filterData() {
            filteredStock = stockData.filter(item => {
                // Filter by wood type in product name
                if (productFilter !== 'All') {
                    if (!item.name.toLowerCase().includes(productFilter.toLowerCase())) {
                        return false;
                    }
                }

                // Filter by stock status
                if (statusFilter !== 'All') {
                    if (statusFilter === 'Ready' && item.stock <= 3) return false;
                    if (statusFilter === 'Critical' && (item.stock === 0 || item.stock > 3)) return false;
                    if (statusFilter === 'Out' && item.stock > 0) return false;
                }

                // Filter by search query
                if (searchQuery) {
                    return item.name.toLowerCase().includes(searchQuery) || item.sku.toLowerCase().includes(searchQuery);
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredStock.length === 0) {
                tableBody.innerHTML = '';
                emptyState.classList.remove('hidden');
                document.getElementById('table-pagination-info').innerText = 'Menampilkan 0-0 dari 0 entries';
                document.getElementById('btn-prev').disabled = true;
                document.getElementById('btn-next').disabled = true;
                return;
            }

            emptyState.classList.add('hidden');
            tableBody.innerHTML = '';

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredStock.length);
            const pageData = filteredStock.slice(startIndex, endIndex);

            pageData.forEach((item, idx) => {
                const rowNo = startIndex + idx + 1;

                // Status Badge
                let statusBadge = '';
                if (item.stock === 0) {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-rose-50 text-rose-700 border-rose-100">Habis</span>';
                } else if (item.stock <= 3) {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-100">Kritis</span>';
                } else {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100">Ready Stock</span>';
                }

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="relative group w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 shadow-sm mx-auto cursor-pointer" onclick="openLightbox('${item.image}')" title="Zoom Visual">
                            <img src="${item.image}" class="w-full h-full object-cover" alt="${item.name}">
                            <div class="absolute inset-0 bg-black/45 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </div>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${item.name}</td>
                    <td class="py-3.5 px-4 font-mono font-semibold text-zinc-500 text-xs">${item.sku}</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.produced} unit</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.sold} unit</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-indigo-700">${item.stock} unit</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-center">
                        <button onclick="viewHistory('${item.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-[11px] rounded-lg border border-zinc-200/60 transition-all select-none hover:border-zinc-300">Detail</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Pagination text
            document.getElementById('table-pagination-info').innerText = 
                `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredStock.length} entries`;

            // Pagination buttons status
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = currentPage * rowsPerPage >= filteredStock.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredStock.length) {
                currentPage++;
                renderTable();
            }
        }

        // Detail activity logs logic
        function viewHistory(name) {
            const prodLogs = JSON.parse(localStorage.getItem('woodtrack_hasil_produksi_logs') || '[]');
            const salesLogs = JSON.parse(localStorage.getItem('woodtrack_penjualan_produk') || '[]');

            const historyList = [];

            // 1. Gather production logs
            prodLogs.forEach(entry => {
                if (entry.tipe === 'Barang Jadi' && entry.nama.trim() === name) {
                    historyList.push({
                        tanggal: entry.tanggal,
                        tipe: 'Masuk',
                        ref: entry.id,
                        qty: parseInt(entry.jumlah) || 0,
                        detail: `Produksi: ${entry.keterangan || '-'}`
                    });
                }
            });

            // 2. Gather sales logs
            salesLogs.forEach(sale => {
                if (sale.nama.trim() === name) {
                    historyList.push({
                        tanggal: sale.tanggal,
                        tipe: 'Keluar',
                        ref: sale.id,
                        qty: parseInt(sale.jumlah) || 0,
                        detail: `Terjual ke ${sale.buyer || '-'}: ${sale.keterangan || '-'}`
                    });
                }
            });

            // Sort history by date descending
            historyList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            // Populate Modal Summary values
            const stockItem = stockData.find(item => item.name === name) || { produced: 0, sold: 0, stock: 0 };
            document.getElementById('hist-total-produced').innerText = stockItem.produced + ' unit';
            document.getElementById('hist-total-sold').innerText = stockItem.sold + ' unit';
            document.getElementById('hist-current-stock').innerText = stockItem.stock + ' unit';

            // Populate Modal Table
            const body = document.getElementById('history-table-body');
            body.innerHTML = '';

            if (historyList.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-zinc-400">Tidak ada riwayat mutasi produk.</td></tr>';
            } else {
                historyList.forEach(hist => {
                    const typeBadge = hist.tipe === 'Masuk' 
                        ? '<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold">Produksi</span>'
                        : '<span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">Penjualan</span>';
                    
                    const qtyColor = hist.tipe === 'Masuk' ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold';
                    const qtyPrefix = hist.tipe === 'Masuk' ? '+' : '-';

                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-zinc-50';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 font-semibold">${formatIndoDate(hist.tanggal)}</td>
                        <td class="py-2.5 px-3 text-center">${typeBadge}</td>
                        <td class="py-2.5 px-3 font-mono text-zinc-500 font-semibold">${hist.ref}</td>
                        <td class="py-2.5 px-3 text-right ${qtyColor}">${qtyPrefix}${hist.qty} unit</td>
                        <td class="py-2.5 px-3 text-zinc-500">${hist.detail}</td>
                    `;
                    body.appendChild(tr);
                });
            }

            document.getElementById('modal-title').innerText = `Riwayat: ${name}`;
            document.getElementById('history-modal').classList.add('open');
        }

        function closeHistoryModal() {
            document.getElementById('history-modal').classList.remove('open');
        }

        // Lightbox helpers
        function openLightbox(src) {
            const lightbox = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');
            if (lightbox && lightboxImg) {
                lightboxImg.src = src;
                lightbox.classList.remove('hidden');
                setTimeout(() => {
                    const relativeDiv = lightbox.querySelector('.relative');
                    if (relativeDiv) {
                        relativeDiv.classList.remove('scale-95');
                        relativeDiv.classList.add('scale-100');
                    }
                }, 10);
            }
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox-modal');
            if (lightbox) {
                const relativeDiv = lightbox.querySelector('.relative');
                if (relativeDiv) {
                    relativeDiv.classList.remove('scale-100');
                    relativeDiv.classList.add('scale-95');
                }
                setTimeout(() => {
                    lightbox.classList.add('hidden');
                }, 150);
            }
        }

        // Helpers
        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }