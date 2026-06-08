// Preset sizes
        const defaultSizes = [
            { code: '5×10×200', tebal: 5, lebar: 10, panjang: 200, volume: 0.0100 },
            { code: '5×15×200', tebal: 5, lebar: 15, panjang: 200, volume: 0.0150 },
            { code: '7×15×400', tebal: 7, lebar: 15, panjang: 400, volume: 0.0420 },
            { code: '3×7×300', tebal: 3, lebar: 7, panjang: 300, volume: 0.0063 },
            { code: '4×10×400', tebal: 4, lebar: 10, panjang: 400, volume: 0.0160 }
        ];

        // State Variables
        let sizes = [];
        let stockData = [];
        let filteredStock = [];
        let woodFilter = 'All';
        let gradeFilter = 'All';
        let sizeFilter = 'All';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            // Load sizes
            const savedSizes = localStorage.getItem('woodtrack_sawtimber_sizes');
            sizes = savedSizes ? JSON.parse(savedSizes) : [...defaultSizes];
            
            populateSizesDropdown();
            loadStockSawtimber();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        function populateSizesDropdown() {
            const select = document.getElementById('size-filter');
            select.innerHTML = '<option value="All">Semua Ukuran Papan</option>';
            sizes.forEach(s => {
                const option = document.createElement('option');
                option.value = s.code;
                option.text = s.code;
                select.appendChild(option);
            });
        }

        // Compute current stock dynamically
        function loadStockSawtimber() {
            stockData = window.calculateSawtimberStock();
        }

        // Metrics calculations
        function updateDashboardStats() {
            let totalVolume = 0;
            let totalQty = 0;
            const uniqueWoodTypes = new Set();
            let alertKategori = 0;

            stockData.forEach(item => {
                totalVolume += item.volume;
                totalQty += item.stock;
                uniqueWoodTypes.add(item.jenis);

                // Alert if stock of active items falls below threshold
                if (item.stock > 0 && item.stock <= 20) {
                    alertKategori++;
                }
            });

            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(2) + ' m³';
            document.getElementById('stat-total-qty').innerText = totalQty + ' lembar';
            document.getElementById('stat-wood-types').innerText = uniqueWoodTypes.size + ' jenis';
            document.getElementById('stat-alerts').innerText = alertKategori + ' Kategori';
        }

        // Filter Actions
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

        function applyFiltersAndRender() {
            currentPage = 1;
            filterData();
            renderTable();
        }

        function filterData() {
            filteredStock = stockData.filter(item => {
                if (woodFilter !== 'All' && item.jenis !== woodFilter) return false;
                if (gradeFilter !== 'All' && item.grade !== gradeFilter) return false;
                if (sizeFilter !== 'All' && item.size !== sizeFilter) return false;

                const matchesSearch = item.jenis.toLowerCase().includes(searchQuery) ||
                                      item.grade.toLowerCase().includes(searchQuery) ||
                                      item.size.toLowerCase().includes(searchQuery);

                return matchesSearch;
            });

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

                let statusBadge = '';
                if (item.stock === 0) {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Habis</span>';
                } else if (item.stock <= 20) {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Stok Kritis</span>';
                } else {
                    statusBadge = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Tersedia</span>';
                }

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
                    <td class="py-3.5 px-4 text-right font-medium text-zinc-400">${item.received} lbr</td>
                    <td class="py-3.5 px-4 text-right font-medium text-zinc-400">${item.consumed} lbr</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-zinc-900">${item.stock} lbr</td>
                    <td class="py-3.5 px-4 text-right font-bold text-amber-700">${item.volume.toFixed(4)} m³</td>
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

        // History modal
        function openHistoryModal(jenis, grade, size) {
            document.getElementById('modal-title').innerText = `Riwayat Sawtimber: ${jenis} · Grade ${grade} · Size ${size}`;

            const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
            const ovenBatches = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');

            let totalReceived = 0;
            let totalConsumed = 0;
            const history = [];

            // 1. Gather Masuk (Incoming logs)
            rawSawtimber.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        if (item.jenis === jenis && item.grade === grade && item.size === size) {
                            totalReceived += parseInt(item.jumlah) || 0;
                            history.push({
                                tanggal: entry.tanggal,
                                tipe: 'MASUK',
                                ref: entry.surat || 'SJ-' + entry.id,
                                qty: parseInt(item.jumlah) || 0,
                                note: entry.catatan || (entry.supplier ? `Supplier: ${entry.supplier}` : 'Hasil produksi gergaji')
                            });
                        }
                    });
                }
            });

            // 2. Gather Keluar (Oven Kiln Dry inputs)
            ovenBatches.forEach(batch => {
                if (batch.input && batch.input.jenis === jenis && batch.input.grade === grade && batch.input.size === size) {
                    totalConsumed += parseInt(batch.input.jumlah) || 0;
                    history.push({
                        tanggal: batch.tanggal,
                        tipe: 'KELUAR',
                        ref: batch.id,
                        qty: parseInt(batch.input.jumlah) || 0,
                        note: `Kiln Dry Chamber: ${batch.chamber}`
                    });
                }
            });

            history.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            document.getElementById('hist-total-received').innerText = `${totalReceived} lbr`;
            document.getElementById('hist-total-consumed').innerText = `${totalConsumed} lbr`;
            document.getElementById('hist-current-stock').innerText = `${Math.max(0, totalReceived - totalConsumed)} lbr`;

            const tbody = document.getElementById('history-table-body');
            tbody.innerHTML = '';

            if (history.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-zinc-400">Belum ada riwayat transaksi</td></tr>`;
            } else {
                history.forEach(h => {
                    const typeBadge = h.tipe === 'MASUK' 
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Penerimaan</span>'
                        : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">Oven Oven</span>';

                    const qtyText = h.tipe === 'MASUK'
                        ? `<span class="text-emerald-600 font-extrabold">+${h.qty} lbr</span>`
                        : `<span class="text-red-600 font-extrabold">-${h.qty} lbr</span>`;

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