// State variables
        let stockData = [];
        let filteredStock = [];
        let categoryFilter = 'All';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            loadStockBahanBaku();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        // Compute stocks dynamically
        function loadStockBahanBaku() {
            stockData = window.calculateBahanBakuStock();
        }

        // Dashboard statistics
        function updateDashboardStats() {
            let totalBoards = 0;
            let totalGlass = 0;
            let criticalCount = 0;

            stockData.forEach(item => {
                if (item.kategori === 'Papan Kering') {
                    totalBoards += item.stock;
                } else if (item.kategori === 'Kaca') {
                    totalGlass += item.stock;
                }

                if (item.stock <= 5) {
                    criticalCount++;
                }
            });

            document.getElementById('stat-total-boards').innerText = totalBoards + ' pcs';
            document.getElementById('stat-total-glass').innerText = totalGlass + ' lembar';
            document.getElementById('stat-total-types').innerText = stockData.length + ' Spesifikasi';
            document.getElementById('stat-alerts').innerText = criticalCount + ' Item';
        }

        // Filters Handling
        function handleCategoryFilter(val) {
            categoryFilter = val;
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
                // Category filter
                if (categoryFilter !== 'All') {
                    if (categoryFilter === 'Sawtimber' && item.kategori !== 'Papan Kering') return false;
                    if (categoryFilter === 'Glass' && item.kategori !== 'Kaca') return false;
                }

                // Search query
                if (searchQuery) {
                    return item.spec.toLowerCase().includes(searchQuery) || item.kategori.toLowerCase().includes(searchQuery);
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
                } else if (item.stock <= 5) {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-100">Kritis</span>';
                } else {
                    statusBadge = '<span class="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100">Aman</span>';
                }

                // Category Tag UI
                const categoryTag = item.kategori === 'Kaca' 
                    ? '<span class="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg">Kaca Lembaran</span>'
                    : '<span class="px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 font-bold text-[10px] rounded-lg">Papan Kering (KD)</span>';

                const unit = item.kategori === 'Kaca' ? 'lembar' : 'pcs';

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4">${categoryTag}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${item.spec}</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.received} ${unit}</td>
                    <td class="py-3.5 px-4 text-right font-semibold text-zinc-600">${item.consumed} ${unit}</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-amber-700">${item.stock} ${unit}</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-center">
                        <button onclick="viewHistory('${item.spec.replace(/'/g, "\\'")}', '${item.kategori}')" class="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-[11px] rounded-lg border border-zinc-200/60 transition-all select-none hover:border-zinc-300">Detail</button>
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

        // Details Modal History logic
        function viewHistory(spec, kategori) {
            const rawGlass = JSON.parse(localStorage.getItem('woodtrack_penerimaan_kaca') || '[]');
            const dryKiln = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
            const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');

            const historyList = [];

            if (kategori === 'Kaca') {
                // Collect incoming glass
                rawGlass.forEach(entry => {
                    if (entry.items) {
                        entry.items.forEach(item => {
                            const itemSpec = `${item.tipe} ${item.tebal}mm - ${item.dimensi}`;
                            if (itemSpec === spec) {
                                historyList.push({
                                    tanggal: entry.tanggal,
                                    tipe: 'Masuk',
                                    ref: entry.surat || `TRX-GL-${entry.id}`,
                                    qty: parseInt(item.jumlah) || 0,
                                    detail: `Penerimaan supplier: ${entry.supplier || 'N/A'}`
                                });
                            }
                        });
                    }
                });
            } else {
                // Collect kiln dry outputs
                dryKiln.forEach(batch => {
                    if (batch.output) {
                        const itemSpec = `${batch.output.jenis} - ${batch.output.size} - Grade ${batch.output.grade}`;
                        if (itemSpec === spec) {
                            historyList.push({
                                    tanggal: batch.tanggal,
                                    tipe: 'Masuk',
                                    ref: batch.id,
                                    qty: parseInt(batch.output.jumlah) || 0,
                                    detail: `Hasil Oven Kiln Dry (Chamber: ${batch.chamber})`
                            });
                        }
                    }
                });
            }

            // Collect production pickups
            prodRequests.forEach(req => {
                if (req.materials) {
                    req.materials.forEach(mat => {
                        if (mat.spec === spec) {
                            historyList.push({
                                tanggal: req.tanggal,
                                tipe: 'Keluar',
                                ref: req.id,
                                qty: parseInt(mat.jumlah) || 0,
                                detail: `Produksi: ${req.catatan || 'Pengambilan pabrik'}`
                            });
                        }
                    });
                }
            });

            // Sort by date descending
            historyList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            // Summary values
            const stockItem = stockData.find(item => item.spec === spec) || { received: 0, consumed: 0, stock: 0 };
            const unit = kategori === 'Kaca' ? 'lembar' : 'pcs';
            document.getElementById('hist-total-received').innerText = stockItem.received + ' ' + unit;
            document.getElementById('hist-total-consumed').innerText = stockItem.consumed + ' ' + unit;
            document.getElementById('hist-current-stock').innerText = stockItem.stock + ' ' + unit;

            // Populate Modal Table
            const body = document.getElementById('history-table-body');
            body.innerHTML = '';

            if (historyList.length === 0) {
                body.innerHTML = '<tr><td colspan="5" class="py-6 text-center text-zinc-400">Tidak ada riwayat mutasi bahan baku.</td></tr>';
            } else {
                historyList.forEach(hist => {
                    const typeBadge = hist.tipe === 'Masuk' 
                        ? '<span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold">Masuk</span>'
                        : '<span class="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-bold">Keluar</span>';
                    
                    const qtyColor = hist.tipe === 'Masuk' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold';
                    const qtyPrefix = hist.tipe === 'Masuk' ? '+' : '-';

                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-zinc-50';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 font-semibold">${formatIndoDate(hist.tanggal)}</td>
                        <td class="py-2.5 px-3 text-center">${typeBadge}</td>
                        <td class="py-2.5 px-3 font-mono text-zinc-500 font-semibold">${hist.ref}</td>
                        <td class="py-2.5 px-3 text-right ${qtyColor}">${qtyPrefix}${hist.qty} ${unit}</td>
                        <td class="py-2.5 px-3 text-zinc-500">${hist.detail}</td>
                    `;
                    body.appendChild(tr);
                });
            }

            document.getElementById('modal-title').innerText = `Riwayat: ${spec}`;
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