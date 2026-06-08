        // State Variables
        let stockData = [];
        let filteredStock = [];
        let woodFilter = 'All';
        let gradeFilter = 'All';
        let sizeFilter = 'All';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            loadStockLogs();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        // Compute current log stock using shared helper from utils.js
        function loadStockLogs() {
            stockData = window.calculateLogsStock();
        }

        // Calculate and display metrics
        function updateDashboardStats() {
            let totalVolume = 0;
            let totalQty = 0;
            const uniqueWoodTypes = new Set();
            let alertKategori = 0;

            stockData.forEach(item => {
                totalVolume += item.volume;
                totalQty += item.stock;
                uniqueWoodTypes.add(item.jenis);
                
                // Alert if stock is low (< 10) but still has log stock configuration
                if (item.stock > 0 && item.stock <= 10) {
                    alertKategori++;
                }
            });

            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(2) + ' m³';
            document.getElementById('stat-total-qty').innerText = totalQty + ' batang';
            document.getElementById('stat-wood-types').innerText = uniqueWoodTypes.size + ' jenis';
            document.getElementById('stat-alerts').innerText = alertKategori + ' Kategori';
        }

        // Filter handlers
        function handleWoodFilter(val) {
            woodFilter = val;
            applyFiltersAndRender();
        }

        function handleGradeFilter(val) {
            gradeFilter = val;
            applyFiltersAndRender();
        }

        function handleSizeFilter(val) {
            sizeFilter = val;
            applyFiltersAndRender();
        }

        function handleSearch(val) {
            searchQuery = val.toLowerCase().trim();
            applyFiltersAndRender();
        }

        // Filtering & Rendering logic
        function applyFiltersAndRender() {
            currentPage = 1;
            filterData();
            renderTable();
        }

        function filterData() {
            filteredStock = stockData.filter(item => {
                // Wood filter
                if (woodFilter !== 'All' && item.jenis !== woodFilter) return false;

                // Grade filter
                if (gradeFilter !== 'All' && item.grade !== gradeFilter) return false;

                // Size filter
                if (sizeFilter !== 'All' && item.size !== sizeFilter) return false;

                // Search query
                const matchesSearch = item.jenis.toLowerCase().includes(searchQuery) ||
                                      item.grade.toLowerCase().includes(searchQuery) ||
                                      item.size.toLowerCase().includes(searchQuery);

                return matchesSearch;
            });

            // Sort so high stocks are displayed first
            filteredStock.sort((a, b) => b.stock - a.stock);
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

                // Set status badge and colors
                let statusBadge = '';
                if (item.stock === 0) {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Habis</span>';
                } else if (item.stock <= 10) {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Stok Rendah</span>';
                } else {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Tersedia</span>';
                }

                // Dynamic icon color based on wood type
                let woodIconColor = 'text-amber-600 bg-amber-50';
                if (item.jenis === 'Sengon') woodIconColor = 'text-emerald-600 bg-emerald-50';
                else if (item.jenis === 'Mahoni') woodIconColor = 'text-rose-600 bg-rose-50';
                else if (item.jenis === 'Jati') woodIconColor = 'text-amber-800 bg-amber-100';

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50 hover:bg-[#FEFCFA] transition-colors';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] ${woodIconColor}">
                                ${item.jenis.charAt(0)}
                            </div>
                            <span class="font-extrabold text-zinc-950">${item.jenis}</span>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                        <span class="inline-block px-2.5 py-0.5 border border-zinc-200 rounded-lg text-xs font-bold bg-zinc-50 text-zinc-600">Grade ${item.grade}</span>
                    </td>
                    <td class="py-3.5 px-4 text-center font-mono font-bold text-zinc-600">${item.size}</td>
                    <td class="py-3.5 px-4 text-right font-medium text-zinc-400">${item.received} btg</td>
                    <td class="py-3.5 px-4 text-right font-medium text-zinc-400">${item.consumed} btg</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-zinc-900">${item.stock} btg</td>
                    <td class="py-3.5 px-4 text-right font-bold text-amber-700">${item.volume.toFixed(2)} m³</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-center">
                        <button onclick="openHistoryModal('${item.jenis}', '${item.grade}', '${item.size}')" class="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/10 transition-all font-bold text-[11px] inline-flex items-center gap-1">
                            <i class="fa-solid fa-clock-rotate-left  text-[11px]"></i>
                            Riwayat
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Pagination UI
            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredStock.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredStock.length;
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

        // History Modal handling
        function openHistoryModal(jenis, grade, size) {
            document.getElementById('modal-title').innerText = `Riwayat Log: ${jenis} · Grade ${grade} · Size ${size}`;
            
            const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
            const conversions = JSON.parse(localStorage.getItem('woodtrack_log_conversions') || '[]');
            
            let totalReceived = 0;
            let totalConsumed = 0;
            const history = [];

            // 1. Gather all received logs of this type/grade/size
            rawLogs.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        if (item.jenis === jenis && item.grade === grade && item.size === size) {
                            totalReceived += parseInt(item.jumlah) || 0;
                            history.push({
                                tanggal: entry.tanggal,
                                tipe: 'MASUK',
                                ref: entry.surat || 'SJ-' + entry.id,
                                qty: parseInt(item.jumlah) || 0,
                                note: entry.supplier ? `Supplier: ${entry.supplier}` : entry.catatan
                            });
                        }
                    });
                }
            });

            // 2. Gather all conversions of this type/grade/size
            conversions.forEach(conv => {
                if (conv.input && conv.input.jenis === jenis && conv.input.grade === grade && conv.input.size === size) {
                    totalConsumed += parseInt(conv.input.jumlah) || 0;
                    history.push({
                        tanggal: conv.tanggal,
                        tipe: 'KELUAR',
                        ref: conv.id,
                        qty: parseInt(conv.input.jumlah) || 0,
                        note: conv.catatan || 'Dikonversi ke Sawtimber'
                    });
                }
            });

            // Sort history by date descending
            history.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            // Set stats
            document.getElementById('hist-total-received').innerText = `${totalReceived} btg`;
            document.getElementById('hist-total-consumed').innerText = `${totalConsumed} btg`;
            document.getElementById('hist-current-stock').innerText = `${Math.max(0, totalReceived - totalConsumed)} btg`;

            // Render table
            const tbody = document.getElementById('history-table-body');
            tbody.innerHTML = '';

            if (history.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-400">Belum ada riwayat transaksi</td></tr>`;
            } else {
                history.forEach(h => {
                    const typeBadge = h.tipe === 'MASUK' 
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Kayu Masuk</span>'
                        : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">Kayu Keluar</span>';
                    
                    const qtyText = h.tipe === 'MASUK'
                        ? `<span class="text-emerald-600 font-extrabold">+${h.qty} btg</span>`
                        : `<span class="text-red-600 font-extrabold">-${h.qty} btg</span>`;

                    const tr = document.createElement('tr');
                    tr.className = 'border-b border-zinc-50 hover:bg-[#FEFCFA]';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 font-semibold text-zinc-800">${formatIndoDate(h.tanggal)}</td>
                        <td class="py-2.5 px-3 text-center">${typeBadge}</td>
                        <td class="py-2.5 px-3 font-mono font-bold text-zinc-700 text-[11px]">${h.ref}</td>
                        <td class="py-2.5 px-3 text-right">${qtyText}</td>
                        <td class="py-2.5 px-3 text-zinc-500 max-w-[220px] truncate" title="${h.note}">${h.note || '-'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('history-modal').classList.add('open');
        }

        function closeHistoryModal() {
            document.getElementById('history-modal').classList.remove('open');
        }

        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        }