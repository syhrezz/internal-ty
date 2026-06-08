// Log Volume coefficients
        const sizeCoefs = {
            'A1': 0.08,
            'A2': 0.18,
            'A3': 0.38,
            'A4': 0.68,
            'A5': 1.18
        };

        // Sawtimber Sizes seed
        const defaultSawtimberSizes = [
            { code: '5×10×200', tebal: 5, lebar: 10, panjang: 200, volume: 0.0100 },
            { code: '5×15×200', tebal: 5, lebar: 15, panjang: 200, volume: 0.0150 },
            { code: '7×15×400', tebal: 7, lebar: 15, panjang: 400, volume: 0.0420 },
            { code: '3×7×300', tebal: 3, lebar: 7, panjang: 300, volume: 0.0063 },
            { code: '4×10×400', tebal: 4, lebar: 10, panjang: 400, volume: 0.0160 }
        ];

        // State variables
        let conversions = [];
        let filteredConversions = [];
        let logStock = {}; // Aggregated log stock
        let outputRows = []; // Current new conversion output items
        let selectedDateFilter = 'All';
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            // Load conversions from localStorage or seed
            const savedConversions = localStorage.getItem('woodtrack_log_conversions');
            if (savedConversions) {
                conversions = JSON.parse(savedConversions);
                if (conversions.length === 0) {
                    conversions = getConversionSeedData();
                    saveToLocalStorage();
                }
            } else {
                conversions = getConversionSeedData();
                saveToLocalStorage();
            }

            // Recalculate and update UI
            recalculateLogStock();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        function getConversionSeedData() {
            return [
                {
                    id: 'CONV-20260601-001',
                    tanggal: '2026-06-01',
                    catatan: 'Konversi kayu sengon kualitas ekspor',
                    input: {
                        jenis: 'Sengon',
                        grade: 'A',
                        size: 'A3',
                        jumlah: 10,
                        volume: 3.8
                    },
                    outputs: [
                        {
                            jenis: 'Sengon',
                            grade: 'A',
                            size: '5×15×200',
                            jumlah: 150,
                            volume: 2.25
                        }
                    ],
                    recoveryRate: 59.2
                },
                {
                    id: 'CONV-20260602-002',
                    tanggal: '2026-06-02',
                    catatan: 'Uji coba potongan baru kayu meranti',
                    input: {
                        jenis: 'Meranti',
                        grade: 'B',
                        size: 'A4',
                        jumlah: 5,
                        volume: 3.4
                    },
                    outputs: [
                        {
                            jenis: 'Meranti',
                            grade: 'B',
                            size: '7×15×400',
                            jumlah: 40,
                            volume: 1.68
                        }
                    ],
                    recoveryRate: 49.4
                }
            ];
        }

        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_log_conversions', JSON.stringify(conversions));
        }

        // Recalculate available log stocks from woodtrack_penerimaan_log minus what has been consumed by conversions
        function recalculateLogStock() {
            logStock = {};
            
            // 1. Load received logs
            const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
            rawLogs.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = `${item.jenis}|${item.grade}|${item.size}`;
                        logStock[key] = (logStock[key] || 0) + (parseInt(item.jumlah) || 0);
                    });
                }
            });

            // 2. Load consumed logs from conversions
            conversions.forEach(conv => {
                if (conv.input) {
                    const key = `${conv.input.jenis}|${conv.input.grade}|${conv.input.size}`;
                    logStock[key] = (logStock[key] || 0) - (parseInt(conv.input.jumlah) || 0);
                    if (logStock[key] < 0) logStock[key] = 0;
                }
            });
        }

        function updateDashboardStats() {
            let totalLogConverted = 0;
            let totalSawtimberProduced = 0;
            let totalVolOutput = 0;
            let weightedRendemenSum = 0;
            let totalVolInput = 0;

            conversions.forEach(c => {
                totalLogConverted += parseInt(c.input.jumlah) || 0;
                totalVolInput += parseFloat(c.input.volume) || 0;
                totalVolOutput += parseFloat(c.outputs.reduce((a, b) => a + b.volume, 0)) || 0;
                c.outputs.forEach(o => {
                    totalSawtimberProduced += parseInt(o.jumlah) || 0;
                });
            });

            const avgRendemen = totalVolInput > 0 ? (totalVolOutput / totalVolInput) * 100 : 0;

            document.getElementById('stat-total-log-converted').innerText = totalLogConverted + ' btg';
            document.getElementById('stat-total-sawtimber-produced').innerText = totalSawtimberProduced + ' lbr';
            document.getElementById('stat-avg-rendemen').innerText = avgRendemen.toFixed(1) + '%';
            document.getElementById('stat-total-volume-output').innerText = totalVolOutput.toFixed(2) + ' m³';
        }

        // View management
        function setView(view) {
            const dashboard = document.getElementById('dashboard-view');
            const form = document.getElementById('form-view');
            const headerTitle = document.querySelector('header h1');
            const headerSubtitle = document.querySelector('header p');

            if (view === 'form') {
                dashboard.classList.add('hidden');
                form.classList.remove('hidden');
                headerTitle.innerText = "Input Konversi Log";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Konversi Log &nbsp;·&nbsp; Input Baru";
                resetForm();
            } else {
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Konversi Log";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Konversi";
                recalculateLogStock();
                updateDashboardStats();
                applyFiltersAndRender();
            }
        }

        function resetForm() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('form-tanggal').value = today;
            document.getElementById('form-catatan').value = '';
            document.getElementById('form-input-jumlah').value = '';
            document.getElementById('log-stock-badge').innerText = 'Stok: -';

            generateBatchId();
            recalculateLogStock();
            populateLogSelectOptions();
            
            outputRows = [];
            document.getElementById('outputs-container').innerHTML = '';
            addOutputRow();
            
            calculateVolumesAndRate();
        }

        function generateBatchId() {
            const dateVal = document.getElementById('form-tanggal').value;
            if (!dateVal) return;
            const cleanDate = dateVal.replace(/-/g, '');
            const rand = Math.floor(100 + Math.random() * 900);
            document.getElementById('form-batch-id').value = `CONV-${cleanDate}-${rand}`;
        }

        function populateLogSelectOptions() {
            const select = document.getElementById('form-input-log-select');
            select.innerHTML = '<option value="" disabled selected>Pilih Log...</option>';

            Object.keys(logStock).forEach(key => {
                const stockQty = logStock[key];
                if (stockQty > 0) {
                    const [jenis, grade, size] = key.split('|');
                    const option = document.createElement('option');
                    option.value = key;
                    option.text = `${jenis} - Grade ${grade} - Ukuran ${size} (Tersedia: ${stockQty} btg)`;
                    select.appendChild(option);
                }
            });
        }

        function handleLogSelect() {
            const val = document.getElementById('form-input-log-select').value;
            const badge = document.getElementById('log-stock-badge');
            const inputJumlah = document.getElementById('form-input-jumlah');
            
            if (val) {
                const stockQty = logStock[val];
                badge.innerText = `Stok: ${stockQty}`;
                inputJumlah.max = stockQty;
                inputJumlah.placeholder = `Maks: ${stockQty}`;
            } else {
                badge.innerText = 'Stok: -';
                inputJumlah.removeAttribute('max');
                inputJumlah.placeholder = 'Maks: 0';
            }
            calculateVolumesAndRate();
        }

        // Outputs Management
        function addOutputRow() {
            const tempId = (Date.now() + Math.random()).toString(36).substring(2, 9);
            
            const newRow = {
                tempId,
                size: '',
                grade: 'A',
                jumlah: 0,
                volume: 0
            };
            outputRows.push(newRow);

            const container = document.getElementById('outputs-container');
            const rowDiv = document.createElement('div');
            rowDiv.id = `out-row-${tempId}`;
            rowDiv.className = 'grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 relative';

            // Size Options list
            let sizeOptions = defaultSawtimberSizes.map(s => `<option value="${s.code}">${s.code}</option>`).join('');

            rowDiv.innerHTML = `
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Ukuran Papan *</label>
                    <select onchange="updateOutputField('${tempId}', 'size', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer text-xs">
                        <option value="" disabled selected>Pilih Ukuran...</option>
                        ${sizeOptions}
                    </select>
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Grade *</label>
                    <select onchange="updateOutputField('${tempId}', 'grade', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer text-xs">
                        <option value="A">Grade A (Super)</option>
                        <option value="B">Grade B (Lokal 1)</option>
                        <option value="C">Grade C (Lokal 2)</option>
                        <option value="D">Grade D (Reject)</option>
                    </select>
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kuantitas (Lembar) *</label>
                    <input type="number" oninput="updateOutputField('${tempId}', 'jumlah', this.value)" placeholder="Jumlah lembar" min="1" class="premium-input text-xs">
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex-1 space-y-1.5">
                        <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Volume Estimasi</label>
                        <input type="text" id="vol-display-${tempId}" class="premium-input text-xs bg-zinc-50" value="0.00 m³" readonly>
                    </div>
                    <button onclick="removeOutputRow('${tempId}')" class="mb-0.5 p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" title="Hapus">
                        <i class="fa-solid fa-xmark  text-sm"></i>
                    </button>
                </div>
            `;
            container.appendChild(rowDiv);
        }

        function removeOutputRow(tempId) {
            if (outputRows.length <= 1) {
                showToast('Minimal harus ada 1 output item!', 'error');
                return;
            }
            outputRows = outputRows.filter(r => r.tempId !== tempId);
            const el = document.getElementById(`out-row-${tempId}`);
            if (el) el.remove();
            calculateVolumesAndRate();
        }

        function updateOutputField(tempId, field, val) {
            const row = outputRows.find(r => r.tempId === tempId);
            if (!row) return;

            if (field === 'size') {
                row.size = val;
            } else if (field === 'grade') {
                row.grade = val;
            } else if (field === 'jumlah') {
                row.jumlah = parseInt(val) || 0;
            }

            // Recalculate row volume
            if (row.size && row.jumlah > 0) {
                const sDef = defaultSawtimberSizes.find(s => s.code === row.size);
                if (sDef) {
                    row.volume = sDef.volume * row.jumlah;
                }
            } else {
                row.volume = 0;
            }

            // Update row volume display
            const disp = document.getElementById(`vol-display-${tempId}`);
            if (disp) {
                disp.value = row.volume.toFixed(2) + ' m³';
            }

            calculateVolumesAndRate();
        }

        function calculateVolumesAndRate() {
            let totalInputVol = 0;
            let totalOutputVol = 0;

            // 1. Calculate Input Log Volume
            const logSelectVal = document.getElementById('form-input-log-select').value;
            const jumlahInputVal = parseInt(document.getElementById('form-input-jumlah').value) || 0;

            if (logSelectVal && jumlahInputVal > 0) {
                const [_, __, size] = logSelectVal.split('|');
                const coef = sizeCoefs[size] || 0;
                totalInputVol = coef * jumlahInputVal;
            }

            // 2. Calculate Output Volume
            outputRows.forEach(r => {
                totalOutputVol += r.volume;
            });

            // 3. Update Summary Displays
            document.getElementById('summary-volume-input').innerText = totalInputVol.toFixed(2) + ' m³';
            document.getElementById('summary-volume-output').innerText = totalOutputVol.toFixed(2) + ' m³';

            const rendemen = totalInputVol > 0 ? (totalOutputVol / totalInputVol) * 100 : 0;
            document.getElementById('summary-rendemen').innerText = rendemen.toFixed(1) + '%';

            // 4. Rendemen Status Badge
            const badge = document.getElementById('rendemen-status-badge');
            if (totalInputVol === 0) {
                badge.innerText = 'Menunggu Input';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-100 text-zinc-500';
            } else if (rendemen > 100) {
                badge.innerText = 'Volume Output Melebihi Input (>100%)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-100 text-red-700';
            } else if (rendemen > 70) {
                badge.innerText = 'Rendemen Sangat Tinggi (>70%)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-yellow-100 text-yellow-700';
            } else if (rendemen >= 40) {
                badge.innerText = 'Rendemen Normal (Optimal)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700';
            } else {
                badge.innerText = 'Rendemen Rendah (<40%)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-100 text-amber-700';
            }
        }

        // Save conversion log
        function saveConversion() {
            const batchId = document.getElementById('form-batch-id').value;
            const tanggal = document.getElementById('form-tanggal').value;
            const catatan = document.getElementById('form-catatan').value.trim();
            const logSelectVal = document.getElementById('form-input-log-select').value;
            const jumlahInputVal = parseInt(document.getElementById('form-input-jumlah').value) || 0;

            if (!tanggal) {
                showToast('Lengkapi data Tanggal Konversi!', 'error');
                return;
            }

            if (!logSelectVal) {
                showToast('Harap pilih input raw log!', 'error');
                return;
            }

            if (jumlahInputVal <= 0) {
                showToast('Jumlah log dikonversi harus lebih besar dari 0!', 'error');
                return;
            }

            // Check stock limit
            const stockLimit = logStock[logSelectVal] || 0;
            if (jumlahInputVal > stockLimit) {
                showToast(`Stok tidak mencukupi! Hanya tersedia ${stockLimit} batang.`, 'error');
                return;
            }

            // Validate output rows
            for (let i = 0; i < outputRows.length; i++) {
                const row = outputRows[i];
                if (!row.size || row.jumlah <= 0) {
                    showToast(`Lengkapi semua data output item ke-${i + 1}!`, 'error');
                    return;
                }
            }

            const [jenisInput, gradeInput, sizeInput] = logSelectVal.split('|');
            const coefInput = sizeCoefs[sizeInput] || 0;
            const volumeInput = coefInput * jumlahInputVal;

            let totalOutputVol = 0;
            const outputsMapped = outputRows.map(r => {
                totalOutputVol += r.volume;
                return {
                    jenis: jenisInput, // Keep the same wood type as the input log
                    grade: r.grade,
                    size: r.size,
                    jumlah: r.jumlah,
                    volume: r.volume
                };
            });

            const recoveryRate = volumeInput > 0 ? (totalOutputVol / volumeInput) * 100 : 0;

            if (recoveryRate > 100) {
                showToast('Volume sawtimber output melebihi volume raw log input!', 'error');
                return;
            }

            const newConversion = {
                id: batchId,
                tanggal,
                catatan: catatan || 'Konversi log internal',
                input: {
                    jenis: jenisInput,
                    grade: gradeInput,
                    size: sizeInput,
                    jumlah: jumlahInputVal,
                    volume: volumeInput
                },
                outputs: outputsMapped,
                recoveryRate: parseFloat(recoveryRate.toFixed(1))
            };

            // 1. Save conversion entry
            conversions.unshift(newConversion);
            saveToLocalStorage();

            // 2. Append sawtimber outputs to woodtrack_penerimaan_sawtimber
            const sawtimberReceipts = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
            const newSawtimberReceipt = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                tanggal: tanggal,
                supplier: 'Divisi Sawmill (Internal)',
                surat: batchId,
                catatan: `Hasil konversi log ${jenisInput} Grade ${gradeInput} Size ${sizeInput} (${jumlahInputVal} btg)`,
                items: outputsMapped
            };
            sawtimberReceipts.unshift(newSawtimberReceipt);
            localStorage.setItem('woodtrack_penerimaan_sawtimber', JSON.stringify(sawtimberReceipts));

            showToast('Berhasil memproses konversi log ke sawtimber!');
            setView('dashboard');
        }

        // Delete conversion log
        function deleteConversion(id) {
            if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus proses konversi ini? Raw log akan dikembalikan ke stok, dan output sawtimber akan dihapus dari inventaris.')) return;

            // 1. Remove from conversions list
            conversions = conversions.filter(c => c.id !== id);
            saveToLocalStorage();

            // 2. Remove corresponding entry from woodtrack_penerimaan_sawtimber
            let sawtimberReceipts = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
            sawtimberReceipts = sawtimberReceipts.filter(r => r.surat !== id);
            localStorage.setItem('woodtrack_penerimaan_sawtimber', JSON.stringify(sawtimberReceipts));

            showToast('Berhasil menghapus dan mengembalikan stok log!');
            recalculateLogStock();
            updateDashboardStats();
            applyFiltersAndRender();
        }

        // Filters and Rendering
        function setDateFilter(filter) {
            selectedDateFilter = filter;
            const pills = document.querySelectorAll('#date-filter-pills .filter-pill');
            pills.forEach(p => {
                if (p.innerText.includes(filter === 'All' ? 'Semua' : filter === 'Today' ? 'Hari Ini' : filter === 'Week' ? 'Minggu' : filter === 'Month' ? 'Bulan' : 'Pilih Tanggal')) {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });

            const customContainer = document.getElementById('custom-date-container');
            if (filter === 'Custom') {
                customContainer.classList.remove('hidden');
                customContainer.classList.add('flex');
            } else {
                customContainer.classList.add('hidden');
                customContainer.classList.remove('flex');
                applyFiltersAndRender();
            }
        }

        function applyCustomDateFilter() {
            customStartDate = document.getElementById('filter-start-date').value;
            customEndDate = document.getElementById('filter-end-date').value;
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
            filteredConversions = conversions.filter(c => {
                // 1. Search Query
                const matchesSearch = c.id.toLowerCase().includes(searchQuery) ||
                                      c.input.jenis.toLowerCase().includes(searchQuery) ||
                                      c.catatan.toLowerCase().includes(searchQuery);

                if (!matchesSearch) return false;

                // 2. Date Filter
                if (selectedDateFilter === 'All') return true;

                const cDate = new Date(c.tanggal);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (selectedDateFilter === 'Today') {
                    const cDateStr = c.tanggal;
                    const todayStr = today.toISOString().split('T')[0];
                    return cDateStr === todayStr;
                }

                if (selectedDateFilter === 'Week') {
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    return cDate >= startOfWeek;
                }

                if (selectedDateFilter === 'Month') {
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    return cDate >= startOfMonth;
                }

                if (selectedDateFilter === 'Custom') {
                    if (!customStartDate) return true;
                    const start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                    if (customEndDate) {
                        const end = new Date(customEndDate);
                        end.setHours(23,59,59,999);
                        return cDate >= start && cDate <= end;
                    } else {
                        const cDateStr = c.tanggal;
                        return cDateStr === customStartDate;
                    }
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredConversions.length === 0) {
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
            const endIndex = Math.min(startIndex + rowsPerPage, filteredConversions.length);
            const pageData = filteredConversions.slice(startIndex, endIndex);

            pageData.forEach((c, idx) => {
                const rowNo = startIndex + idx + 1;
                
                // Color code recovery rate badge
                let rateColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (c.recoveryRate < 40) {
                    rateColor = 'bg-amber-50 text-amber-700 border-amber-200';
                } else if (c.recoveryRate > 70) {
                    rateColor = 'bg-violet-50 text-violet-700 border-violet-200';
                }

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${formatIndoDate(c.tanggal)}</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-amber-700 text-xs">${c.id}</td>
                    <td class="py-3.5 px-4">
                        <div class="font-bold text-zinc-800">${c.input.jenis}</div>
                        <div class="text-[11px] text-zinc-400">Grade ${c.input.grade} · Size ${c.input.size} · ${c.input.jumlah} btg (${c.input.volume.toFixed(2)} m³)</div>
                    </td>
                    <td class="py-3.5 px-4">
                        <div class="font-bold text-zinc-800">${c.outputs.length} Ukuran Papan</div>
                        <div class="text-[11px] text-zinc-400">${c.outputs.reduce((a, b) => a + b.jumlah, 0)} lembar (${c.outputs.reduce((a, b) => a + b.volume, 0).toFixed(2)} m³)</div>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                        <span class="inline-block px-2 py-0.5 border text-xs font-bold rounded-lg ${rateColor}">${c.recoveryRate.toFixed(1)}%</span>
                    </td>
                    <td class="py-3.5 px-4 text-zinc-500 max-w-[200px] truncate" title="${c.catatan}">${c.catatan}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openDetailModal('${c.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="deleteConversion('${c.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Pagination Controls
            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredConversions.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredConversions.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredConversions.length) {
                currentPage++;
                renderTable();
            }
        }

        // Modals Management
        function openDetailModal(id) {
            const conv = conversions.find(c => c.id === id);
            if (!conv) return;

            document.getElementById('detail-tanggal').innerText = formatIndoDate(conv.tanggal);
            document.getElementById('detail-batch-id').innerText = conv.id;
            document.getElementById('detail-rendemen').innerText = conv.recoveryRate.toFixed(1) + '%';
            document.getElementById('detail-catatan').innerText = conv.catatan;

            // Input details
            document.getElementById('detail-input-jenis').innerText = conv.input.jenis;
            document.getElementById('detail-input-grade').innerText = 'Grade ' + conv.input.grade;
            document.getElementById('detail-input-size').innerText = 'Ukuran ' + conv.input.size;
            document.getElementById('detail-input-jumlah').innerText = conv.input.jumlah + ' batang';
            document.getElementById('detail-input-volume').innerText = conv.input.volume.toFixed(2) + ' m³';

            // Output details table
            const tbody = document.getElementById('detail-table-body');
            tbody.innerHTML = '';
            
            conv.outputs.forEach(o => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-2.5 px-3 font-semibold text-zinc-800">${o.size}</td>
                    <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 bg-zinc-100 rounded text-[11px] font-bold text-zinc-600">Grade ${o.grade}</span></td>
                    <td class="py-2.5 px-3 text-right font-bold">${o.jumlah} lbr</td>
                    <td class="py-2.5 px-3 text-right text-emerald-600 font-semibold">${o.volume.toFixed(2)} m³</td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('detail-total-output-qty').innerText = conv.outputs.reduce((a, b) => a + b.jumlah, 0);
            document.getElementById('detail-total-output-vol').innerText = conv.outputs.reduce((a, b) => a + b.volume, 0).toFixed(2);

            const modal = document.getElementById('detail-modal');
            modal.classList.add('open');
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.remove('open');
        }

        // Toast
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = `<i class="fa-solid fa-check text-emerald-500"></i>`;
            if (type === 'error') {
                icon = `<i class="fa-solid fa-xmark text-red-500 text-sm"></i>`;
            }

            toast.innerHTML = `
                ${icon}
                <span class="text-zinc-800 font-bold text-xs">${message}</span>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('leaving');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Date formatter helper
        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        }