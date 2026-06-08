// Size volumes coefficients (in cubic meters)
        const sizeCoefs = {
            'A1': 0.08,
            'A2': 0.18,
            'A3': 0.38,
            'A4': 0.68,
            'A5': 1.18
        };

        // Local Storage State
        let logEntries = [];
        let filteredEntries = [];
        let selectedDateFilter = 'All'; // 'All', 'Today', 'Week', 'Month', 'Custom'
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        // Current Form State
        let currentFormItems = [];
        let editingId = null;

        // Initial setup on load
        window.addEventListener('DOMContentLoaded', () => {
            // Load from LocalStorage or seed dummy data
            const saved = localStorage.getItem('woodtrack_penerimaan_log');
            if (saved) {
                logEntries = JSON.parse(saved);
                
                // Migrate legacy flat data format to nested transaction format
                let migrated = false;
                logEntries.forEach(entry => {
                    if (!entry.items) {
                        entry.items = [{
                            jenis: entry.jenis || 'Sengon',
                            grade: entry.grade || 'A',
                            size: entry.size || 'A3',
                            jumlah: entry.jumlah || 0
                        }];
                        delete entry.jenis;
                        delete entry.grade;
                        delete entry.size;
                        delete entry.jumlah;
                        migrated = true;
                    }
                });

                // Auto-seed if empty
                if (logEntries.length === 0) {
                    logEntries = getSeedData();
                    migrated = true;
                }

                if (migrated) {
                    saveToLocalStorage();
                }
            } else {
                logEntries = getSeedData();
                saveToLocalStorage();
            }

            // Init UI
            updateDashboard();
            applyFiltersAndRender();
        });

        // Helper to get log seed data
        function getSeedData() {
            return [
                {
                    id: 1,
                    tanggal: '2026-06-01',
                    supplier: 'CV. Utama Mandiri',
                    surat: 'SJ-2601/SNG/01',
                    catatan: 'Kayu lurus mulus dari supplier Utama',
                    items: [
                        { jenis: 'Sengon', grade: 'A', size: 'A3', jumlah: 50 }
                    ]
                },
                {
                    id: 2,
                    tanggal: '2026-06-01',
                    supplier: 'PT. Kayu Makmur',
                    surat: 'SJ-2601/JAT/04',
                    catatan: 'Kayu jati gelondongan diameter besar',
                    items: [
                        { jenis: 'Jati', grade: 'A', size: 'A5', jumlah: 12 }
                    ]
                },
                {
                    id: 3,
                    tanggal: '2026-06-02',
                    supplier: 'CV. Lestari Alam',
                    surat: 'SJ-2602/MER/11',
                    catatan: 'Penerimaan bertahap area barat',
                    items: [
                        { jenis: 'Meranti', grade: 'B', size: 'A4', jumlah: 35 },
                        { jenis: 'Sengon', grade: 'B', size: 'A3', jumlah: 20 }
                    ]
                },
                {
                    id: 4,
                    tanggal: '2026-06-02',
                    supplier: 'UD. Jaya Sentosa',
                    surat: 'SJ-2602/MAH/09',
                    catatan: 'Agak basah, simpan di gudang C',
                    items: [
                        { jenis: 'Mahoni', grade: 'C', size: 'A2', jumlah: 80 }
                    ]
                },
                {
                    id: 5,
                    tanggal: '2026-06-03',
                    supplier: 'CV. Utama Mandiri',
                    surat: 'SJ-2603/SNG/02',
                    catatan: 'Grade A super',
                    items: [
                        { jenis: 'Sengon', grade: 'A', size: 'A4', jumlah: 45 }
                    ]
                },
                {
                    id: 6,
                    tanggal: '2026-06-03',
                    supplier: 'PT. Hutan Raya',
                    surat: 'SJ-2603/PIN/07',
                    catatan: 'Untuk palet/reject',
                    items: [
                        { jenis: 'Pinus', grade: 'D', size: 'A1', jumlah: 120 },
                        { jenis: 'Mahoni', grade: 'C', size: 'A2', jumlah: 40 }
                    ]
                },
                {
                    id: 7,
                    tanggal: '2026-06-04',
                    supplier: 'CV. Lestari Alam',
                    surat: 'SJ-2604/MER/15',
                    catatan: 'Volume pas',
                    items: [
                        { jenis: 'Meranti', grade: 'B', size: 'A3', jumlah: 40 }
                    ]
                }
            ];
        }

        

        // View Toggling
        function setView(view) {
            const dashboard = document.getElementById('dashboard-view');
            const form = document.getElementById('form-view');
            const headerTitle = document.querySelector('header h1');
            const headerSubtitle = document.querySelector('header p');
            const formTitle = document.querySelector('#form-view h2');
            const formSubtitle = document.querySelector('#form-view p');
            
            if (view === 'form') {
                editingId = null;
                dashboard.classList.add('hidden');
                form.classList.remove('hidden');
                headerTitle.innerText = "Input Penerimaan Log";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Input Baru";
                formTitle.innerText = "Catat Penerimaan Baru";
                formSubtitle.innerText = "Input data pengiriman log per surat jalan dengan multi-item jenis kayu";
                resetFormPage();
            } else {
                editingId = null;
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Penerimaan Log";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan";
            }
        }

        // Reset form to default states
        function resetFormPage() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('form-tanggal').value = today;
            document.getElementById('form-surat').value = '';
            document.getElementById('form-supplier').value = '';
            document.getElementById('form-catatan').value = '';
            
            currentFormItems = [];
            document.getElementById('wood-items-container').innerHTML = '';
            addWoodItemRow();
        }

        // Add wood item row to the form (supports populating data for editing)
        function addWoodItemRow(itemData = null) {
            const tempId = (Date.now() + Math.random()).toString(36).substring(2, 9);
            
            const newItem = {
                tempId: tempId,
                jenis: itemData ? itemData.jenis : '',
                grade: itemData ? itemData.grade : '',
                size: itemData ? itemData.size : '',
                jumlah: itemData ? itemData.jumlah : 0,
                volume: 0.0
            };
            
            currentFormItems.push(newItem);
            
            const container = document.getElementById('wood-items-container');
            const itemCard = document.createElement('div');
            itemCard.id = `item-row-${tempId}`;
            itemCard.className = `glass-card rounded-2xl p-5 relative border border-zinc-100 hover:border-zinc-200 transition-all shadow-sm bg-white space-y-4 anim d1`;
            
            itemCard.innerHTML = `
                <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Item #${currentFormItems.length}</span>
                    <button onclick="removeWoodItemRow('${tempId}')" class="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Hapus Item">
                        <i class="fa-solid fa-trash-can  text-[13px]"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Jenis Kayu *</label>
                        <select id="item-jenis-${tempId}" onchange="updateItemField('${tempId}', 'jenis', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                            <option value="" disabled selected>Pilih Jenis...</option>
                            <option value="Sengon">Sengon</option>
                            <option value="Jati">Jati</option>
                            <option value="Meranti">Meranti</option>
                            <option value="Mahoni">Mahoni</option>
                            <option value="Pinus">Pinus</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Jumlah Batang *</label>
                        <input type="number" id="item-jumlah-${tempId}" oninput="updateItemField('${tempId}', 'jumlah', this.value)" placeholder="Contoh: 25" min="1" class="premium-input">
                    </div>
                </div>
                
                <div class="space-y-1.5">
                    <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Kualitas / Grade *</label>
                    <div class="flex flex-wrap gap-2.5">
                        <div onclick="selectItemGrade('${tempId}', 'A')" id="item-grade-${tempId}-A" class="size-chip w-[130px] flex-shrink-0">
                            <p class="font-extrabold text-[13.5px] text-zinc-800">A</p>
                            <p class="text-[8px] text-zinc-400 font-semibold mt-0.5">Ekspor/Super</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'B')" id="item-grade-${tempId}-B" class="size-chip w-[130px] flex-shrink-0">
                            <p class="font-extrabold text-[13.5px] text-zinc-800">B</p>
                            <p class="text-[8px] text-zinc-400 font-semibold mt-0.5">Lokal Kelas 1</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'C')" id="item-grade-${tempId}-C" class="size-chip w-[130px] flex-shrink-0">
                            <p class="font-extrabold text-[13.5px] text-zinc-800">C</p>
                            <p class="text-[8px] text-zinc-400 font-semibold mt-0.5">Lokal Kelas 2</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'D')" id="item-grade-${tempId}-D" class="size-chip w-[130px] flex-shrink-0">
                            <p class="font-extrabold text-[13.5px] text-zinc-800">D</p>
                            <p class="text-[8px] text-zinc-400 font-semibold mt-0.5">Reject/Palet</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-1.5">
                    <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ukuran Diameter Log *</label>
                    <div class="flex flex-wrap gap-2.5">
                        <div onclick="selectItemSize('${tempId}', 'A1')" id="item-size-${tempId}-A1" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A1</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">10-19 cm</p>
                        </div>
                        <div onclick="selectItemSize('${tempId}', 'A2')" id="item-size-${tempId}-A2" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A2</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">20-29 cm</p>
                        </div>
                        <div onclick="selectItemSize('${tempId}', 'A3')" id="item-size-${tempId}-A3" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A3</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">30-39 cm</p>
                        </div>
                        <div onclick="selectItemSize('${tempId}', 'A4')" id="item-size-${tempId}-A4" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A4</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">40-49 cm</p>
                        </div>
                        <div onclick="selectItemSize('${tempId}', 'A5')" id="item-size-${tempId}-A5" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A5</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">&ge; 50 cm</p>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(itemCard);
            
            // Populate element values if editing
            if (itemData) {
                document.getElementById(`item-jenis-${tempId}`).value = itemData.jenis;
                document.getElementById(`item-jumlah-${tempId}`).value = itemData.jumlah;
                selectItemGrade(tempId, itemData.grade);
                selectItemSize(tempId, itemData.size);
            }
            
            updateFormSummary();
        }

        // Delete wood item row
        function removeWoodItemRow(tempId) {
            if (currentFormItems.length <= 1) {
                showToast('Minimal harus ada 1 item kayu dalam pengiriman!', 'error');
                return;
            }
            
            currentFormItems = currentFormItems.filter(item => item.tempId !== tempId);
            
            const row = document.getElementById(`item-row-${tempId}`);
            if (row) row.remove();
            
            // Recalculate numbering labels
            const labels = document.querySelectorAll('#wood-items-container span.font-mono');
            labels.forEach((label, idx) => {
                label.innerText = `Item #${idx + 1}`;
            });
            
            updateFormSummary();
        }

        // Update single field inside an item row
        function updateItemField(tempId, field, value) {
            const item = currentFormItems.find(item => item.tempId === tempId);
            if (!item) return;
            
            if (field === 'jenis') {
                item.jenis = value;
            } else if (field === 'jumlah') {
                item.jumlah = parseInt(value) || 0;
            }
            
            updateFormSummary();
        }

        // Select grade for a specific item row
        function selectItemGrade(tempId, grade) {
            const item = currentFormItems.find(item => item.tempId === tempId);
            if (!item) return;
            
            item.grade = grade;
            
            const grades = ['A', 'B', 'C', 'D'];
            grades.forEach(g => {
                const el = document.getElementById(`item-grade-${tempId}-${g}`);
                if (el) {
                    if (g === grade) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                }
            });
        }

        // Select size for a specific item row
        function selectItemSize(tempId, size) {
            const item = currentFormItems.find(item => item.tempId === tempId);
            if (!item) return;
            
            item.size = size;
            
            const sizes = ['A1', 'A2', 'A3', 'A4', 'A5'];
            sizes.forEach(s => {
                const el = document.getElementById(`item-size-${tempId}-${s}`);
                if (el) {
                    if (s === size) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                }
            });
            
            updateFormSummary();
        }

        // Aggregate totals for the summary card
        function updateFormSummary() {
            let totalItems = currentFormItems.length;
            let totalBatang = 0;
            let totalVolume = 0;
            
            const tbody = document.getElementById('form-summary-table-body');
            if (tbody) tbody.innerHTML = '';
            
            currentFormItems.forEach((item, index) => {
                totalBatang += item.jumlah;
                const coef = sizeCoefs[item.size] || 0;
                const volume = item.jumlah * coef;
                totalVolume += volume;
                
                if (tbody) {
                    let gradeBadge = '';
                    if (item.grade === 'A') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Grade A</span>';
                    else if (item.grade === 'B') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Grade B</span>';
                    else if (item.grade === 'C') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Grade C</span>';
                    else if (item.grade === 'D') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Grade D</span>';
                    else gradeBadge = '<span class="text-zinc-400 italic">Belum dipilih</span>';
                    
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/50 transition-colors';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-400">${index + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.jenis || '<span class="text-zinc-400 italic">Belum dipilih</span>'}</td>
                        <td class="py-2.5 px-3 text-center">${gradeBadge}</td>
                        <td class="py-2.5 px-3 text-center"><span class="px-1.5 py-0.5 font-bold text-xs bg-zinc-100 text-zinc-650 rounded">${item.size || '-'}</span></td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} btg</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-amber-700">${volume > 0 ? volume.toFixed(2) + ' m³' : '-'}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });
            
            document.getElementById('summary-total-items').innerText = totalItems;
            document.getElementById('summary-total-batang').innerText = totalBatang + ' btg';
            document.getElementById('summary-total-volume').innerText = totalVolume.toFixed(2) + ' m³';
        }

        // LocalStorage save
        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_penerimaan_log', JSON.stringify(logEntries));
        }

        // Add Toast
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

        // Save Batch Entries
        function saveAllItems() {
            const tanggal = document.getElementById('form-tanggal').value;
            const surat = document.getElementById('form-surat').value.trim();
            const supplier = document.getElementById('form-supplier').value.trim();
            const catatan = document.getElementById('form-catatan').value.trim();

            if (!tanggal) {
                showToast('Lengkapi data Tanggal Terima!', 'error');
                return;
            }

            if (currentFormItems.length === 0) {
                showToast('Harap tambahkan minimal 1 item kayu!', 'error');
                return;
            }

            // Validate all items
            for (let i = 0; i < currentFormItems.length; i++) {
                const item = currentFormItems[i];
                if (!item.jenis || !item.grade || !item.size || isNaN(item.jumlah) || item.jumlah <= 0) {
                    showToast(`Lengkapi semua data Item #${i + 1} (Jenis, Grade, Size, Jumlah)!`, 'error');
                    return;
                }
            }

            // Map UI items to standard schema
            const transactionItems = currentFormItems.map(item => ({
                jenis: item.jenis,
                grade: item.grade,
                size: item.size,
                jumlah: item.jumlah
            }));

            if (editingId !== null) {
                // Update Path
                const index = logEntries.findIndex(entry => entry.id === editingId);
                if (index !== -1) {
                    logEntries[index] = {
                        ...logEntries[index],
                        tanggal,
                        supplier: supplier || '-',
                        surat: surat || '-',
                        catatan: catatan || '-',
                        items: transactionItems
                    };
                    showToast('Berhasil memperbarui data penerimaan log!', 'success');
                } else {
                    showToast('Gagal memperbarui: Data tidak ditemukan.', 'error');
                }
            } else {
                // Create Path
                const newEntry = {
                    id: Date.now(),
                    tanggal,
                    supplier: supplier || '-',
                    surat: surat || '-',
                    catatan: catatan || '-',
                    items: transactionItems
                };
                logEntries.unshift(newEntry);
                showToast(`Berhasil menyimpan ${currentFormItems.length} item penerimaan log!`, 'success');
            }

            saveToLocalStorage();
            updateDashboard();
            setDateFilter('All');
            
            setView('dashboard');
        }

        // Delete Entry
        function deleteEntry(id) {
            if (confirm('Apakah Anda yakin ingin menghapus data penerimaan ini?')) {
                logEntries = logEntries.filter(entry => entry.id !== id);
                saveToLocalStorage();
                updateDashboard();
                applyFiltersAndRender();
                showToast('Data penerimaan log berhasil dihapus.', 'success');
            }
        }

        // Detail Modal Handling
        function showDetail(id) {
            const entry = logEntries.find(e => e.id === id);
            if (!entry) return;

            document.getElementById('detail-tanggal').innerText = formatDate(entry.tanggal);
            document.getElementById('detail-surat').innerText = entry.surat || '-';
            document.getElementById('detail-supplier').innerText = entry.supplier || '-';
            document.getElementById('detail-catatan').innerText = entry.catatan || '-';

            const tbody = document.getElementById('detail-table-body');
            tbody.innerHTML = '';

            let totalBatang = 0;
            if (entry.items && Array.isArray(entry.items)) {
                entry.items.forEach((item, idx) => {
                    totalBatang += item.jumlah;

                    let gradeBadge = '';
                    if (item.grade === 'A') gradeBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Grade A</span>';
                    else if (item.grade === 'B') gradeBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Grade B</span>';
                    else if (item.grade === 'C') gradeBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Grade C</span>';
                    else if (item.grade === 'D') gradeBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">Grade D</span>';

                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/80 transition-colors';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-400">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.jenis}</td>
                        <td class="py-2.5 px-3 text-center">${gradeBadge}</td>
                        <td class="py-2.5 px-3 text-center"><span class="px-1.5 py-0.5 font-bold text-xs bg-zinc-100 text-zinc-600 rounded">${item.size}</span></td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} btg</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('detail-total-batang').innerText = totalBatang;
            document.getElementById('detail-modal').classList.add('open');
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.remove('open');
        }

        // Edit Entry Loading
        function editEntry(id) {
            const entry = logEntries.find(e => e.id === id);
            if (!entry) return;

            editingId = id;

            const dashboard = document.getElementById('dashboard-view');
            const form = document.getElementById('form-view');
            const headerTitle = document.querySelector('header h1');
            const headerSubtitle = document.querySelector('header p');
            const formTitle = document.querySelector('#form-view h2');
            const formSubtitle = document.querySelector('#form-view p');

            dashboard.classList.add('hidden');
            form.classList.remove('hidden');
            headerTitle.innerText = "Ubah Penerimaan Log";
            headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Ubah Log";
            formTitle.innerText = "Ubah Penerimaan Log";
            formSubtitle.innerText = "Edit data pengiriman log per surat jalan dengan multi-item jenis kayu";

            // Populate header fields
            document.getElementById('form-tanggal').value = entry.tanggal;
            document.getElementById('form-surat').value = entry.surat === '-' ? '' : entry.surat;
            document.getElementById('form-supplier').value = entry.supplier === '-' ? '' : entry.supplier;
            document.getElementById('form-catatan').value = entry.catatan === '-' ? '' : entry.catatan;

            // Load wood items cards
            currentFormItems = [];
            document.getElementById('wood-items-container').innerHTML = '';

            if (entry.items && entry.items.length > 0) {
                entry.items.forEach(item => {
                    addWoodItemRow(item);
                });
            } else {
                addWoodItemRow();
            }

            updateFormSummary();
        }

        // Update Dashboard Stats Card
        function updateDashboard() {
            let totalBatang = 0;
            const uniqueJenis = new Set();
            const uniqueSurat = new Set();
            let bulanIniCount = 0;

            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

            logEntries.forEach(entry => {
                if (entry.surat && entry.surat !== '-') {
                    uniqueSurat.add(entry.surat.toLowerCase().trim());
                }
                
                let entryBatang = 0;
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        entryBatang += item.jumlah;
                        if (item.jenis) {
                            uniqueJenis.add(item.jenis.toLowerCase().trim());
                        }
                    });
                }
                totalBatang += entryBatang;

                if (entry.tanggal && entry.tanggal.substring(0, 7) === currentMonth) {
                    bulanIniCount += entryBatang;
                }
            });

            document.getElementById('stat-total-batang').innerText = totalBatang;
            document.getElementById('stat-total-surat').innerText = uniqueSurat.size;
            document.getElementById('stat-jenis-kayu').innerText = uniqueJenis.size;
            document.getElementById('stat-bulan-ini').innerText = bulanIniCount;
        }

        // Timezone-safe local date string (YYYY-MM-DD)
        function getLocalDateString(d = new Date()) {
            const offset = d.getTimezoneOffset();
            const local = new Date(d.getTime() - (offset * 60 * 1000));
            return local.toISOString().split('T')[0];
        }

        // Get calendar week (Monday to Sunday) date range
        function getWeekRange() {
            const today = new Date();
            const day = today.getDay(); // 0 is Sunday, 1 is Monday...
            const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
            
            const monday = new Date(today.setDate(diffToMonday));
            monday.setHours(0,0,0,0);
            
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23,59,59,999);
            
            return {
                start: getLocalDateString(monday),
                end: getLocalDateString(sunday)
            };
        }

        // Filters & Search logic
        function setDateFilter(filterType) {
            selectedDateFilter = filterType;
            
            // Update active pill styling
            const pills = document.querySelectorAll('#date-filter-pills .filter-pill');
            pills.forEach(pill => {
                const isMatch = (filterType === 'All' && pill.innerText.includes('Semua')) ||
                                (filterType === 'Today' && pill.innerText.includes('Hari Ini')) ||
                                (filterType === 'Week' && pill.innerText.includes('Minggu Ini')) ||
                                (filterType === 'Month' && pill.innerText.includes('Bulan Ini')) ||
                                (filterType === 'Custom' && pill.innerText.includes('Pilih Tanggal'));
                if (isMatch) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });

            // Toggle custom date range inputs visibility
            const customContainer = document.getElementById('custom-date-container');
            if (filterType === 'Custom') {
                customContainer.classList.remove('hidden');
                customContainer.classList.add('flex');
            } else {
                customContainer.classList.add('hidden');
                customContainer.classList.remove('flex');
                // Reset inputs
                document.getElementById('filter-start-date').value = '';
                document.getElementById('filter-end-date').value = '';
                customStartDate = '';
                customEndDate = '';
            }

            currentPage = 1;
            applyFiltersAndRender();
        }

        function applyCustomDateFilter() {
            customStartDate = document.getElementById('filter-start-date').value;
            customEndDate = document.getElementById('filter-end-date').value;
            currentPage = 1;
            applyFiltersAndRender();
        }

        // Search Input Matcher
        function handleSearch(val) {
            searchQuery = val.toLowerCase().trim();
            currentPage = 1;
            applyFiltersAndRender();
        }

        function applyFiltersAndRender() {
            filteredEntries = logEntries.filter(entry => {
                let matchesDate = true;
                const entryDate = entry.tanggal; // format YYYY-MM-DD
                
                if (selectedDateFilter === 'Today') {
                    const today = getLocalDateString();
                    matchesDate = (entryDate === today);
                } else if (selectedDateFilter === 'Week') {
                    const week = getWeekRange();
                    matchesDate = (entryDate >= week.start && entryDate <= week.end);
                } else if (selectedDateFilter === 'Month') {
                    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
                    matchesDate = (entryDate && entryDate.substring(0, 7) === currentMonth);
                } else if (selectedDateFilter === 'Custom') {
                    if (customStartDate && customEndDate) {
                        matchesDate = (entryDate >= customStartDate && entryDate <= customEndDate);
                    } else if (customStartDate) {
                        matchesDate = (entryDate === customStartDate); // Single specific date!
                    } else if (customEndDate) {
                        matchesDate = (entryDate <= customEndDate);
                    }
                }
                
                const matchesSearch = searchQuery === '' || 
                    (entry.supplier && entry.supplier.toLowerCase().includes(searchQuery)) ||
                    (entry.surat && entry.surat.toLowerCase().includes(searchQuery)) ||
                    (entry.catatan && entry.catatan.toLowerCase().includes(searchQuery)) ||
                    (entry.items && entry.items.some(item => 
                        (item.jenis && item.jenis.toLowerCase().includes(searchQuery)) ||
                        (item.size && item.size.toLowerCase().includes(searchQuery)) ||
                        (item.grade && item.grade.toLowerCase().includes(searchQuery))
                    ));
                return matchesDate && matchesSearch;
            });

            renderTable();
        }

        // Render Table Data
        function renderTable() {
            const tbody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');
            tbody.innerHTML = '';

            if (filteredEntries.length === 0) {
                emptyState.classList.remove('hidden');
                document.getElementById('table-pagination-info').innerText = 'Menampilkan 0-0 dari 0 entries';
                document.getElementById('btn-prev').disabled = true;
                document.getElementById('btn-next').disabled = true;
                return;
            }

            emptyState.classList.add('hidden');

            // Calculate pagination
            const totalItems = filteredEntries.length;
            const totalPages = Math.ceil(totalItems / rowsPerPage);
            
            // Adjust current page if out of bounds
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems} entries`;
            
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = currentPage === totalPages || totalPages === 0;

            const paginatedItems = filteredEntries.slice(startIndex, endIndex);

            paginatedItems.forEach((entry, idx) => {
                const globalIdx = startIndex + idx + 1;
                
                let totalBatang = 0;
                let rincianHTML = '<div class="flex flex-wrap gap-1.5 justify-start">';
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        totalBatang += item.jumlah;
                        
                        let gradeColorClass = 'text-zinc-600 bg-zinc-100 border-zinc-200';
                        if (item.grade === 'A') gradeColorClass = 'text-emerald-700 bg-emerald-50 border-emerald-100/50';
                        else if (item.grade === 'B') gradeColorClass = 'text-blue-700 bg-blue-50 border-blue-100/50';
                        else if (item.grade === 'C') gradeColorClass = 'text-indigo-700 bg-indigo-50 border-indigo-100/50';
                        else if (item.grade === 'D') gradeColorClass = 'text-red-700 bg-red-50 border-red-100/50';

                        rincianHTML += `
                            <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${gradeColorClass}">
                                ${item.jenis} ${item.grade} (${item.size}): ${item.jumlah}
                            </span>
                        `;
                    });
                }
                rincianHTML += '</div>';

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-zinc-50/80 transition-colors border-b border-zinc-100';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center font-semibold text-zinc-400">${globalIdx}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${formatDate(entry.tanggal)}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${entry.supplier || '-'}</td>
                    <td class="py-3.5 px-4 font-mono text-[11.5px] text-zinc-500">${entry.surat || '-'}</td>
                    <td class="py-3.5 px-4">${rincianHTML}</td>
                    <td class="py-3.5 px-4 text-right font-bold text-zinc-800">${totalBatang} btg</td>
                    <td class="py-3.5 px-4 text-zinc-500 truncate max-w-[150px]" title="${entry.catatan || ''}">${entry.catatan || '-'}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="showDetail(${entry.id})" class="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="editEntry(${entry.id})" class="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ubah">
                                <i class="fa-solid fa-pen  text-[13px]"></i>
                            </button>
                            <button onclick="deleteEntry(${entry.id})" class="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Helper date formatter
        function formatDate(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }

        // Page navigation
        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        // Page navigation
        function nextPage() {
            const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Esc to close form or modal
            if (e.key === 'Escape') {
                const detailModal = document.getElementById('detail-modal');
                if (detailModal && detailModal.classList.contains('open')) {
                    closeDetailModal();
                    return;
                }
                const formView = document.getElementById('form-view');
                if (formView && !formView.classList.contains('hidden')) {
                    setView('dashboard');
                }
            }
            // Ctrl + N to open form
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setView('form');
            }
        });