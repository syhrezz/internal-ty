// Preset sizes
        const defaultSizes = [
            { code: '5×10×200', tebal: 5, lebar: 10, panjang: 200, volume: 0.0100 },
            { code: '5×15×200', tebal: 5, lebar: 15, panjang: 200, volume: 0.0150 },
            { code: '7×15×400', tebal: 7, lebar: 15, panjang: 400, volume: 0.0420 },
            { code: '3×7×300', tebal: 3, lebar: 7, panjang: 300, volume: 0.0063 },
            { code: '4×10×400', tebal: 4, lebar: 10, panjang: 400, volume: 0.0160 }
        ];

        // State variables
        let sizes = [];
        let ovenBatches = [];
        let filteredBatches = [];
        let sawtimberStock = {};
        let selectedDateFilter = 'All';
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        window.addEventListener('DOMContentLoaded', () => {
            // Load dry sizes from Master Ukuran Oven (Dry)
            const savedSizes = localStorage.getItem('woodtrack_master_bahan_baku');
            if (savedSizes) {
                sizes = JSON.parse(savedSizes).filter(s => s.status === 'Aktif');
            } else {
                sizes = [...defaultSizes];
            }

            // Load oven batches from localStorage
            const saved = localStorage.getItem('woodtrack_konversi_kiln_dry');
            if (saved) {
                ovenBatches = JSON.parse(saved);
                if (ovenBatches.length === 0) {
                    ovenBatches = getSeedData();
                    saveToLocalStorage();
                }
            } else {
                ovenBatches = getSeedData();
                saveToLocalStorage();
            }

            recalculateSawtimberStock();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        function populateSizesDropdown() {
            const select = document.getElementById('form-output-size-select');
            if (select) {
                select.innerHTML = '<option value="" disabled selected>Pilih Ukuran Kering...</option>';
                sizes.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.code;
                    option.text = `${s.code} (${s.volume.toFixed(4)} m³)`;
                    select.appendChild(option);
                });
            }
        }

        function getSeedData() {
            return [
                {
                    id: 'KD-20260601-001',
                    tanggal: '2026-06-01',
                    chamber: 'Chamber 1',
                    duration: 5,
                    catatan: 'Pengeringan kayu sengon papan tebal',
                    input: {
                        jenis: 'Sengon',
                        grade: 'A',
                        size: '5×15×200',
                        jumlah: 100,
                        volume: 1.5
                    },
                    output: {
                        jenis: 'Sengon (KD)',
                        grade: 'A',
                        size: '5×15×200',
                        jumlah: 96,
                        volume: 1.44
                    },
                    yieldRate: 96.0
                }
            ];
        }

        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_konversi_kiln_dry', JSON.stringify(ovenBatches));
        }

        function recalculateSawtimberStock() {
            sawtimberStock = {};

            // 1. Load received sawtimber
            const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
            rawSawtimber.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = `${item.jenis}|${item.grade}|${item.size}`;
                        sawtimberStock[key] = (sawtimberStock[key] || 0) + (parseInt(item.jumlah) || 0);
                    });
                }
            });

            // 2. Subtract consumed sawtimber by oven batches
            ovenBatches.forEach(batch => {
                if (batch.input) {
                    const key = `${batch.input.jenis}|${batch.input.grade}|${batch.input.size}`;
                    sawtimberStock[key] = (sawtimberStock[key] || 0) - (parseInt(batch.input.jumlah) || 0);
                    if (sawtimberStock[key] < 0) sawtimberStock[key] = 0;
                }
            });
        }

        function updateDashboardStats() {
            let totalBatches = ovenBatches.length;
            let totalInputSaw = 0;
            let totalBaku = 0;
            let totalYieldRate = 0;

            ovenBatches.forEach(b => {
                totalInputSaw += parseInt(b.input.jumlah) || 0;
                totalBaku += parseInt(b.output.jumlah) || 0;
                totalYieldRate += b.yieldRate || 0;
            });

            const avgYieldRate = totalBatches > 0 ? (totalYieldRate / totalBatches) : 0;

            document.getElementById('stat-total-batches').innerText = totalBatches;
            document.getElementById('stat-total-input-sawtimber').innerText = totalInputSaw + ' lbr';
            document.getElementById('stat-avg-yield-rate').innerText = avgYieldRate.toFixed(1) + '%';
            document.getElementById('stat-total-bahan-baku').innerText = totalBaku + ' lbr';
        }

        function setView(view) {
            const dashboard = document.getElementById('dashboard-view');
            const form = document.getElementById('form-view');
            const headerTitle = document.querySelector('header h1');
            const headerSubtitle = document.querySelector('header p');

            if (view === 'form') {
                dashboard.classList.add('hidden');
                form.classList.remove('hidden');
                headerTitle.innerText = "Input Oven Batch";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Kiln Dry &nbsp;·&nbsp; Input Baru";
                resetForm();
            } else {
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Konversi Kiln Dry";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Kiln Dry";
                recalculateSawtimberStock();
                updateDashboardStats();
                applyFiltersAndRender();
            }
        }

        function resetForm() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('form-tanggal').value = today;
            document.getElementById('form-duration').value = 5;
            document.getElementById('form-catatan').value = '';
            document.getElementById('form-input-jumlah').value = '';
            document.getElementById('form-output-jumlah').value = '';
            document.getElementById('sawtimber-stock-badge').innerText = 'Stok: -';

            generateBatchId();
            recalculateSawtimberStock();
            populateSawtimberSelectOptions();
            populateSizesDropdown();
            calculateVolumesAndRate();
        }

        function generateBatchId() {
            const dateVal = document.getElementById('form-tanggal').value;
            if (!dateVal) return;
            const cleanDate = dateVal.replace(/-/g, '');
            const rand = Math.floor(100 + Math.random() * 900);
            document.getElementById('form-batch-id').value = `KD-${cleanDate}-${rand}`;
        }

        function populateSawtimberSelectOptions() {
            const select = document.getElementById('form-input-sawtimber-select');
            select.innerHTML = '<option value="" disabled selected>Pilih Sawtimber...</option>';

            Object.keys(sawtimberStock).forEach(key => {
                const stockQty = sawtimberStock[key];
                if (stockQty > 0) {
                    const [jenis, grade, size] = key.split('|');
                    const option = document.createElement('option');
                    option.value = key;
                    option.text = `${jenis} - Grade ${grade} - ${size} (Tersedia: ${stockQty} lbr)`;
                    select.appendChild(option);
                }
            });
        }

        function handleSawtimberSelect() {
            const val = document.getElementById('form-input-sawtimber-select').value;
            const badge = document.getElementById('sawtimber-stock-badge');
            const inputJumlah = document.getElementById('form-input-jumlah');
            const outputSizeSelect = document.getElementById('form-output-size-select');

            if (val) {
                const stockQty = sawtimberStock[val];
                badge.innerText = `Stok: ${stockQty}`;
                inputJumlah.max = stockQty;
                inputJumlah.placeholder = `Maks: ${stockQty}`;
                
                // Pre-select the same size for dry output as a default (user can change it to represent shrinkage)
                const [_, __, size] = val.split('|');
                if (outputSizeSelect) {
                    outputSizeSelect.value = size;
                }
            } else {
                badge.innerText = 'Stok: -';
                inputJumlah.removeAttribute('max');
                inputJumlah.placeholder = 'Maks: 0';
                if (outputSizeSelect) {
                    outputSizeSelect.value = '';
                }
            }
            calculateVolumesAndRate();
        }

        function calculateVolumesAndRate() {
            let totalInputVol = 0;
            let totalOutputVol = 0;

            const sawtimberSelectVal = document.getElementById('form-input-sawtimber-select').value;
            const inputJumlah = parseInt(document.getElementById('form-input-jumlah').value) || 0;
            const outputJumlah = parseInt(document.getElementById('form-output-jumlah').value) || 0;
            const outputSize = document.getElementById('form-output-size-select').value;

            if (sawtimberSelectVal && inputJumlah > 0) {
                const [_, __, size] = sawtimberSelectVal.split('|');
                const sDefInput = sizes.find(s => s.code === size) || defaultSizes.find(s => s.code === size);
                if (sDefInput) {
                    totalInputVol = sDefInput.volume * inputJumlah;
                }
            }

            if (outputSize && outputJumlah > 0) {
                const sDefOutput = sizes.find(s => s.code === outputSize) || defaultSizes.find(s => s.code === outputSize);
                if (sDefOutput) {
                    totalOutputVol = sDefOutput.volume * outputJumlah;
                }
            }

            document.getElementById('summary-volume-input').innerText = totalInputVol.toFixed(4) + ' m³';
            document.getElementById('summary-volume-output').innerText = totalOutputVol.toFixed(4) + ' m³';
            document.getElementById('form-output-volume-display').value = totalOutputVol.toFixed(4) + ' m³';

            const yieldRate = inputJumlah > 0 ? (outputJumlah / inputJumlah) * 100 : 0;
            document.getElementById('summary-yield-rate').innerText = yieldRate.toFixed(1) + '%';

            const badge = document.getElementById('yield-status-badge');
            if (inputJumlah === 0) {
                badge.innerText = 'Menunggu Input';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-100 text-zinc-500';
            } else if (yieldRate > 100) {
                badge.innerText = 'Jumlah Output Melebihi Input (>100%)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-100 text-red-700';
            } else if (yieldRate >= 90) {
                badge.innerText = 'Hasil Oven Bagus (Rendah Kerusakan)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700';
            } else if (yieldRate >= 75) {
                badge.innerText = 'Hasil Oven Cukup (Banyak Pecah/Reject)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-yellow-100 text-yellow-700';
            } else {
                badge.innerText = 'Hasil Oven Buruk (Kerusakan Parah <75%)';
                badge.className = 'inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-100 text-amber-700';
            }
        }

        function saveOvenBatch() {
            const batchId = document.getElementById('form-batch-id').value;
            const tanggal = document.getElementById('form-tanggal').value;
            const chamber = document.getElementById('form-chamber').value;
            const duration = parseInt(document.getElementById('form-duration').value) || 0;
            const catatan = document.getElementById('form-catatan').value.trim();

            const sawtimberSelectVal = document.getElementById('form-input-sawtimber-select').value;
            const inputJumlah = parseInt(document.getElementById('form-input-jumlah').value) || 0;
            const outputJumlah = parseInt(document.getElementById('form-output-jumlah').value) || 0;
            const outputGrade = document.getElementById('form-output-grade').value;
            const outputSize = document.getElementById('form-output-size-select').value;

            if (!tanggal) {
                showToast('Lengkapi data Tanggal Mulai!', 'error');
                return;
            }

            if (!sawtimberSelectVal) {
                showToast('Harap pilih input sawtimber!', 'error');
                return;
            }

            if (!outputSize) {
                showToast('Harap pilih ukuran hasil oven (dry)!', 'error');
                return;
            }

            if (inputJumlah <= 0) {
                showToast('Jumlah sawtimber dioven harus lebih besar dari 0!', 'error');
                return;
            }

            if (outputJumlah <= 0) {
                showToast('Jumlah output bahan baku kering harus lebih besar dari 0!', 'error');
                return;
            }

            const stockLimit = sawtimberStock[sawtimberSelectVal] || 0;
            if (inputJumlah > stockLimit) {
                showToast(`Stok sawtimber tidak mencukupi! Hanya tersedia ${stockLimit} lembar.`, 'error');
                return;
            }

            if (outputJumlah > inputJumlah) {
                showToast('Output kering tidak boleh lebih besar dari input basah!', 'error');
                return;
            }

            const [jenisInput, gradeInput, sizeInput] = sawtimberSelectVal.split('|');
            const sDefInput = sizes.find(s => s.code === sizeInput) || defaultSizes.find(s => s.code === sizeInput);
            const volumeInput = sDefInput ? sDefInput.volume * inputJumlah : 0;
            
            const sDefOutput = sizes.find(s => s.code === outputSize) || defaultSizes.find(s => s.code === outputSize);
            const volumeOutput = sDefOutput ? sDefOutput.volume * outputJumlah : 0;
            const yieldRate = (outputJumlah / inputJumlah) * 100;

            const newBatch = {
                id: batchId,
                tanggal,
                chamber,
                duration,
                catatan: catatan || 'Proses oven KD standar',
                input: {
                    jenis: jenisInput,
                    grade: gradeInput,
                    size: sizeInput,
                    jumlah: inputJumlah,
                    volume: volumeInput
                },
                output: {
                    jenis: `${jenisInput} (KD)`,
                    grade: outputGrade,
                    size: outputSize,
                    jumlah: outputJumlah,
                    volume: volumeOutput
                },
                yieldRate: parseFloat(yieldRate.toFixed(1))
            };

            // 1. Save Oven Batch
            ovenBatches.unshift(newBatch);
            saveToLocalStorage();

            // 2. Persist Dried materials to woodtrack_bahan_baku / woodtrack_penerimaan_crosscut if relevant,
            // or a custom dry stock key. We'll store in woodtrack_konversi_kiln_dry which dynamically deducts
            // from sawtimber stock, which handles calculations properly.

            showToast('Oven batch berhasil disimpan & masuk sebagai Bahan Baku Kering!');
            setView('dashboard');
        }

        function deleteBatch(id) {
            if (!confirm('Apakah Anda yakin ingin membatalkan batch oven ini? Sawtimber basah akan dikembalikan ke inventaris, dan output bahan baku akan dihapus.')) return;

            ovenBatches = ovenBatches.filter(b => b.id !== id);
            saveToLocalStorage();

            showToast('Batch oven berhasil dihapus & stok sawtimber dikembalikan!');
            recalculateSawtimberStock();
            updateDashboardStats();
            applyFiltersAndRender();
        }

        // Filters
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
            filteredBatches = ovenBatches.filter(b => {
                const matchesSearch = b.id.toLowerCase().includes(searchQuery) ||
                                      b.input.jenis.toLowerCase().includes(searchQuery) ||
                                      b.chamber.toLowerCase().includes(searchQuery) ||
                                      b.catatan.toLowerCase().includes(searchQuery);

                if (!matchesSearch) return false;

                if (selectedDateFilter === 'All') return true;

                const bDate = new Date(b.tanggal);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (selectedDateFilter === 'Today') {
                    return b.tanggal === today.toISOString().split('T')[0];
                }

                if (selectedDateFilter === 'Week') {
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    return bDate >= startOfWeek;
                }

                if (selectedDateFilter === 'Month') {
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    return bDate >= startOfMonth;
                }

                if (selectedDateFilter === 'Custom') {
                    if (!customStartDate) return true;
                    const start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                    if (customEndDate) {
                        const end = new Date(customEndDate);
                        end.setHours(23,59,59,999);
                        return bDate >= start && bDate <= end;
                    } else {
                        return b.tanggal === customStartDate;
                    }
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredBatches.length === 0) {
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
            const endIndex = Math.min(startIndex + rowsPerPage, filteredBatches.length);
            const pageData = filteredBatches.slice(startIndex, endIndex);

            pageData.forEach((b, idx) => {
                const rowNo = startIndex + idx + 1;
                
                let yieldColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (b.yieldRate < 75) {
                    yieldColor = 'bg-amber-50 text-amber-700 border-amber-200';
                } else if (b.yieldRate < 90) {
                    yieldColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                }

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${formatIndoDate(b.tanggal)}</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-teal-700 text-xs">${b.id}</td>
                    <td class="py-3.5 px-4"><span class="px-2.5 py-1 bg-zinc-100 font-bold text-zinc-700 text-[11px] rounded-lg">${b.chamber}</span></td>

                    <td class="py-3.5 px-4">
                        <div class="font-bold text-zinc-800">${b.input.jenis}</div>
                        <div class="text-[11px] text-zinc-400">Grade ${b.input.grade} · ${b.input.size} · ${b.input.jumlah} lbr</div>
                    </td>
                    <td class="py-3.5 px-4">
                        <div class="font-bold text-zinc-800">${b.output.jenis}</div>
                        <div class="text-[11px] text-zinc-400">Grade ${b.output.grade} · ${b.output.size} · ${b.output.jumlah} lbr</div>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                        <span class="inline-block px-2 py-0.5 border text-xs font-bold rounded-lg ${yieldColor}">${b.yieldRate.toFixed(1)}%</span>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openDetailModal('${b.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="deleteBatch('${b.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredBatches.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredBatches.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredBatches.length) {
                currentPage++;
                renderTable();
            }
        }

        function openDetailModal(id) {
            const b = ovenBatches.find(x => x.id === id);
            if (!b) return;

            document.getElementById('detail-tanggal').innerText = formatIndoDate(b.tanggal);
            document.getElementById('detail-batch-id').innerText = b.id;
            document.getElementById('detail-chamber').innerText = b.chamber;
            document.getElementById('detail-catatan').innerText = b.catatan;
            document.getElementById('detail-duration').innerText = b.duration;

            document.getElementById('detail-input-jenis').innerText = b.input.jenis;
            document.getElementById('detail-input-grade').innerText = 'Grade ' + b.input.grade;
            document.getElementById('detail-input-size').innerText = b.input.size;
            document.getElementById('detail-input-jumlah').innerText = b.input.jumlah + ' lembar';
            document.getElementById('detail-input-volume').innerText = b.input.volume.toFixed(4) + ' m³';

            document.getElementById('detail-output-jenis').innerText = b.output.jenis;
            document.getElementById('detail-output-grade').innerText = 'Grade ' + b.output.grade;
            document.getElementById('detail-output-jumlah').innerText = b.output.jumlah + ' lembar';
            document.getElementById('detail-output-volume').innerText = b.output.volume.toFixed(4) + ' m³';
            document.getElementById('detail-yield-rate').innerText = b.yieldRate.toFixed(1) + '%';

            const modal = document.getElementById('detail-modal');
            modal.classList.add('open');
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.remove('open');
        }

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

        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        }