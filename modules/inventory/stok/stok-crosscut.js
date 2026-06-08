// State variables
        let stockData = [];
        let filteredStock = [];
        let woodFilter = 'All';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            loadStockCrosscut();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        // Compute current stock dynamically
        function loadStockCrosscut() {
            stockData = window.calculateCrosscutStock();
        }

        // Dashboard stats calculations
        function updateDashboardStats() {
            let totalVolume = 0;
            let criticalCount = 0;
            const uniqueWoodTypes = new Set();
            const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');

            stockData.forEach(item => {
                totalVolume += item.stock;
                
                // Track critical items (stock below threshold of 2.0 m3)
                if (item.stock > 0 && item.stock < 2.0) {
                    criticalCount++;
                }

                // Detect wood types from sumber string
                const match = item.sumber.match(/(Jati|Sengon|Meranti|Mahoni|Pinus)/i);
                if (match) {
                    uniqueWoodTypes.add(match[0]);
                } else {
                    uniqueWoodTypes.add('Lainnya');
                }
            });

            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(2) + ' m³';
            document.getElementById('stat-total-entries').innerText = rawCrosscut.length + ' Transaksi';
            document.getElementById('stat-unique-sources').innerText = uniqueWoodTypes.size + ' Jenis';
            document.getElementById('stat-alerts').innerText = criticalCount + ' Sumber';
        }

        // Filter Actions
        function handleWoodFilter(val) {
            woodFilter = val;
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
                // Filter by wood type
                if (woodFilter !== 'All') {
                    if (!item.sumber.toLowerCase().includes(woodFilter.toLowerCase())) {
                        return false;
                    }
                }

                // Filter by search query
                if (searchQuery) {
                    return item.sumber.toLowerCase().includes(searchQuery);
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
                
                // Determine Status Badge
                let statusBadge = '';
                if (item.stock === 0) {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-rose-50 text-rose-700 border-rose-100">Habis</span>';
                } else if (item.stock < 2.0) {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-100">Kritis</span>';
                } else {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100">Aman</span>';
                }

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${item.sumber}</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.received.toFixed(2)} m³</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.consumed.toFixed(2)} m³</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-amber-700">${item.stock.toFixed(2)} m³</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-center">
                        <button onclick="viewHistory('${item.sumber.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-[11px] rounded-lg border border-zinc-200/60 transition-all select-none hover:border-zinc-300">Detail</button>
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

        // Mutasi history logic inside modal
        function viewHistory(sumber) {
            const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');
            const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');

            const historyList = [];

            // 1. Collect receipt transactions
            rawCrosscut.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        if (item.sumber.trim() === sumber) {
                            historyList.push({
                                tanggal: entry.tanggal,
                                tipe: 'Masuk',
                                ref: entry.surat || `TRX-CC-${entry.id}`,
                                volume: parseFloat(item.volume) || 0.0,
                                detail: `Penerimaan supplier: ${entry.supplier || 'N/A'}`
                            });
                        }
                    });
                }
            });

            // 2. Collect production consumptions
            prodRequests.forEach(req => {
                if (req.materials) {
                    req.materials.forEach(mat => {
                        if (mat.kategori === 'Crosscut' && mat.spec.trim() === sumber) {
                            historyList.push({
                                tanggal: req.tanggal,
                                tipe: 'Keluar',
                                ref: req.id,
                                volume: parseFloat(mat.jumlah) || 0.0,
                                detail: `Produksi: ${req.catatan || 'Pengambilan pabrik'}`
                            });
                        }
                    });
                }
            });

            // Sort history by date descending
            historyList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            // Populate Modal Summary values
            const stockItem = stockData.find(item => item.sumber === sumber) || { received: 0, consumed: 0, stock: 0 };
            document.getElementById('hist-total-received').innerText = stockItem.received.toFixed(2) + ' m³';
            document.getElementById('hist-total-consumed').innerText = stockItem.consumed.toFixed(2) + ' m³';
            document.getElementById('hist-current-stock').innerText = stockItem.stock.toFixed(2) + ' m³';

            // Populate Modal Table
            const body = document.getElementById('history-table-body');
            body.innerHTML = '';

            if (historyList.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-zinc-400">Tidak ada riwayat mutasi.</td></tr>';
            } else {
                historyList.forEach(hist => {
                    const typeBadge = hist.tipe === 'Masuk' 
                        ? '<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold">Masuk</span>'
                        : '<span class="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold">Keluar</span>';
                    
                    const volColor = hist.tipe === 'Masuk' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold';
                    const volPrefix = hist.tipe === 'Masuk' ? '+' : '-';

                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-zinc-50';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 font-semibold">${formatIndoDate(hist.tanggal)}</td>
                        <td class="py-2.5 px-3 text-center">${typeBadge}</td>
                        <td class="py-2.5 px-3 font-mono text-zinc-500 font-semibold">${hist.ref}</td>
                        <td class="py-2.5 px-3 text-right ${volColor}">${volPrefix}${hist.volume.toFixed(2)} m³</td>
                        <td class="py-2.5 px-3 text-zinc-500">${hist.detail}</td>
                    `;
                    body.appendChild(tr);
                });
            }

            document.getElementById('modal-title').innerText = `Riwayat: ${sumber}`;
            document.getElementById('history-modal').classList.add('open');
        }

        function closeHistoryModal() {
            document.getElementById('history-modal').classList.remove('open');
        }

        // Helpers
        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }