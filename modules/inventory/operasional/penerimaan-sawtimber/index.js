// Default size variations (dimensions in cm, volume in m³)
        const defaultSizes = [
            { code: '5×10×200', tebal: 5, lebar: 10, panjang: 200, volume: 0.0100 },
            { code: '5×15×200', tebal: 5, lebar: 15, panjang: 200, volume: 0.0150 },
            { code: '7×15×400', tebal: 7, lebar: 15, panjang: 400, volume: 0.0420 },
            { code: '3×7×300', tebal: 3, lebar: 7, panjang: 300, volume: 0.0063 },
            { code: '4×10×400', tebal: 4, lebar: 10, panjang: 400, volume: 0.0160 }
        ];

        let sizes = [];
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
        let customSizeTriggerTempId = null; // Temp ID of card that launched the modal

        // Initial setup on load
        window.addEventListener('DOMContentLoaded', () => {
            // Load sizes from localStorage or seed defaults
            const savedSizes = localStorage.getItem('woodtrack_sawtimber_sizes');
            if (savedSizes) {
                sizes = JSON.parse(savedSizes);
            } else {
                sizes = [...defaultSizes];
                localStorage.setItem('woodtrack_sawtimber_sizes', JSON.stringify(sizes));
            }

            // Load entries from localStorage or seed defaults
            // Load entries from localStorage or seed defaults
            const savedEntries = localStorage.getItem('woodtrack_penerimaan_sawtimber');
            if (savedEntries) {
                logEntries = JSON.parse(savedEntries);
                
                // Migrate legacy flat data format to nested transaction format
                let migrated = false;
                logEntries.forEach(entry => {
                    if (!entry.items) {
                        entry.items = [{
                            jenis: entry.jenis || 'Sengon',
                            grade: entry.grade || 'A',
                            size: entry.size || '5×15×200',
                            jumlah: entry.jumlah || 0,
                            volume: entry.volume || 0
                        }];
                        delete entry.jenis;
                        delete entry.grade;
                        delete entry.size;
                        delete entry.jumlah;
                        delete entry.volume;
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

        // Helper to get sawtimber seed data
        function getSeedData() {
            return [
                {
                    id: 1,
                    tanggal: '2026-06-01',
                    supplier: 'CV. Lestari Kayu',
                    surat: 'SJ-2601/SNG/12',
                    catatan: 'Sawtimber super mulus',
                    items: [
                        { jenis: 'Sengon', grade: 'A', size: '5×15×200', jumlah: 200, volume: 3.0000 }
                    ]
                },
                {
                    id: 2,
                    tanggal: '2026-06-01',
                    supplier: 'PT. Hutan Makmur',
                    surat: 'SJ-2601/JAT/06',
                    catatan: 'Papan jati tebal lurus',
                    items: [
                        { jenis: 'Jati', grade: 'A', size: '7×15×400', jumlah: 50, volume: 2.1000 }
                    ]
                },
                {
                    id: 3,
                    tanggal: '2026-06-02',
                    supplier: 'CV. Lestari Kayu',
                    surat: 'SJ-2602/MER/19',
                    catatan: 'Meranti merah lurus',
                    items: [
                        { jenis: 'Meranti', grade: 'B', size: '4×10×400', jumlah: 150, volume: 2.4000 }
                    ]
                },
                {
                    id: 4,
                    tanggal: '2026-06-03',
                    supplier: 'UD. Prima Wood',
                    surat: 'SJ-2603/MAH/15',
                    catatan: 'Untuk rangka mebel',
                    items: [
                        { jenis: 'Mahoni', grade: 'C', size: '3×7×300', jumlah: 300, volume: 1.8900 }
                    ]
                },
                {
                    id: 5,
                    tanggal: '2026-06-04',
                    supplier: 'PT. Rimba Raya',
                    surat: 'SJ-2604/PIN/09',
                    catatan: 'Reject untuk palet kemasan',
                    items: [
                        { jenis: 'Pinus', grade: 'D', size: '5×10×200', jumlah: 400, volume: 4.0000 }
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
                headerTitle.innerText = "Input Penerimaan Sawtimber";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Input Baru";
                formTitle.innerText = "Catat Penerimaan Baru";
                formSubtitle.innerText = "Input data pengiriman sawtimber per surat jalan dengan multi-item papan";
                resetFormPage();
            } else {
                editingId = null;
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Penerimaan Sawtimber";
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

        // Get sizes options HTML content
        function getSizeOptionsHTML() {
            let html = '<option value="" disabled selected>Pilih Ukuran...</option>';
            sizes.forEach(s => {
                html += `<option value="${s.code}">${s.code} (${s.volume.toFixed(4)} m³)</option>`;
            });
            return html;
        }

        // Refresh select options in all form cards
        function repopulateAllSizeSelects() {
            currentFormItems.forEach(item => {
                const selectEl = document.getElementById(`item-size-${item.tempId}`);
                if (selectEl) {
                    const currentSelectedVal = selectEl.value;
                    selectEl.innerHTML = getSizeOptionsHTML();
                    if (currentSelectedVal) {
                        selectEl.value = currentSelectedVal;
                    }
                }
            });
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
                volume: itemData ? (itemData.volume || 0.0) : 0.0
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
                        <div class="flex items-center justify-between">
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ukuran Sawtimber *</label>
                            <button type="button" onclick="openCustomSizeModal('${tempId}')" class="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all font-sans">+ Ukuran Baru</button>
                        </div>
                        <select id="item-size-${tempId}" onchange="updateItemField('${tempId}', 'size', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                            ${getSizeOptionsHTML()}
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Jumlah (Lembar) *</label>
                        <input type="number" id="item-jumlah-${tempId}" oninput="updateItemField('${tempId}', 'jumlah', this.value)" placeholder="Contoh: 50" min="1" class="premium-input">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Volume (m³)</label>
                        <input type="text" id="item-volume-${tempId}" readonly placeholder="0.0" class="premium-input bg-zinc-50 text-zinc-500 font-bold border-zinc-200">
                    </div>
                </div>
                
                <div class="space-y-1.5">
                    <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Kualitas / Grade *</label>
                    <div class="flex flex-wrap gap-2.5">
                        <div onclick="selectItemGrade('${tempId}', 'A')" id="item-grade-${tempId}-A" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">A</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">Ekspor/Super</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'B')" id="item-grade-${tempId}-B" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">B</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">Lokal Kelas 1</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'C')" id="item-grade-${tempId}-C" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">C</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">Lokal Kelas 2</p>
                        </div>
                        <div onclick="selectItemGrade('${tempId}', 'D')" id="item-grade-${tempId}-D" class="size-chip w-[100px] flex-shrink-0">
                            <p class="font-extrabold text-xs">D</p>
                            <p class="text-[8px] text-zinc-400 mt-0.5">Reject/Palet</p>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(itemCard);
            
            // Populate element values if editing
            if (itemData) {
                document.getElementById(`item-jenis-${tempId}`).value = itemData.jenis;
                document.getElementById(`item-size-${tempId}`).value = itemData.size;
                document.getElementById(`item-jumlah-${tempId}`).value = itemData.jumlah;
                document.getElementById(`item-volume-${tempId}`).value = itemData.volume ? itemData.volume.toFixed(4) : '';
                selectItemGrade(tempId, itemData.grade);
            }
            
            updateFormSummary();
        }

        // Delete wood item row
        function removeWoodItemRow(tempId) {
            if (currentFormItems.length <= 1) {
                showToast('Minimal harus ada 1 item sawtimber dalam pengiriman!', 'error');
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
                updateItemVolume(tempId);
            } else if (field === 'size') {
                item.size = value;
                updateItemVolume(tempId);
            }

            updateFormSummary();
        }

        // Calculate and update volume for a card
        function updateItemVolume(tempId) {
            const item = currentFormItems.find(i => i.tempId === tempId);
            if (!item) return;

            const sizeObj = sizes.find(s => s.code === item.size);
            const volumeCoef = sizeObj ? sizeObj.volume : 0.0;
            item.volume = item.jumlah * volumeCoef;

            const volInput = document.getElementById(`item-volume-${tempId}`);
            if (volInput) {
                volInput.value = item.volume > 0 ? item.volume.toFixed(4) : '';
            }
        }

        // Select grade for a specific item row
        function selectItemGrade(tempId, grade) {
            const item = currentFormItems.find(i => i.tempId === tempId);
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

        // Custom Size Modal Handling
        function openCustomSizeModal(tempId) {
            customSizeTriggerTempId = tempId;
            document.getElementById('custom-size-modal').classList.add('open');
            document.getElementById('custom-tebal').value = '';
            document.getElementById('custom-lebar').value = '';
            document.getElementById('custom-panjang').value = '';
            document.getElementById('custom-volume-preview').innerText = '0.0 m³';
        }

        function closeCustomSizeModal() {
            document.getElementById('custom-size-modal').classList.remove('open');
            customSizeTriggerTempId = null;
        }

        // Calculate size preview
        function calculateCustomVolume() {
            const tebal = parseFloat(document.getElementById('custom-tebal').value) || 0;
            const lebar = parseFloat(document.getElementById('custom-lebar').value) || 0;
            const panjang = parseFloat(document.getElementById('custom-panjang').value) || 0;
            
            const volume = (tebal * lebar * panjang) / 1000000;
            document.getElementById('custom-volume-preview').innerText = `${volume.toFixed(4)} m³`;
        }

        // Register custom size
        function saveCustomSize() {
            const tebal = parseFloat(document.getElementById('custom-tebal').value);
            const lebar = parseFloat(document.getElementById('custom-lebar').value);
            const panjang = parseFloat(document.getElementById('custom-panjang').value);

            if (!tebal || !lebar || !panjang || tebal <= 0 || lebar <= 0 || panjang <= 0) {
                showToast('Lengkapi dimensi ukuran dengan benar!', 'error');
                return;
            }

            const code = `${tebal}×${lebar}×${panjang}`;
            const volume = (tebal * lebar * panjang) / 1000000;

            const exists = sizes.find(s => s.code === code);
            if (exists) {
                showToast('Ukuran ini sudah terdaftar!', 'error');
                if (customSizeTriggerTempId) {
                    const selectEl = document.getElementById(`item-size-${customSizeTriggerTempId}`);
                    if (selectEl) {
                        selectEl.value = code;
                        updateItemField(customSizeTriggerTempId, 'size', code);
                    }
                }
                closeCustomSizeModal();
                return;
            }

            const newSize = { code, tebal, lebar, panjang, volume };
            sizes.push(newSize);
            localStorage.setItem('woodtrack_sawtimber_sizes', JSON.stringify(sizes));
            
            repopulateAllSizeSelects();
            
            if (customSizeTriggerTempId) {
                const selectEl = document.getElementById(`item-size-${customSizeTriggerTempId}`);
                if (selectEl) {
                    selectEl.value = code;
                    updateItemField(customSizeTriggerTempId, 'size', code);
                }
            }
            
            closeCustomSizeModal();
            showToast('Ukuran baru berhasil didaftarkan!', 'success');
        }

        // Aggregate totals for the summary card
        function updateFormSummary() {
            let totalItems = currentFormItems.length;
            let totalLembar = 0;
            let totalVolume = 0;
            
            const tbody = document.getElementById('form-summary-table-body');
            if (tbody) tbody.innerHTML = '';
            
            currentFormItems.forEach((item, index) => {
                totalLembar += item.jumlah;
                totalVolume += item.volume || 0.0;
                
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
                        <td class="py-2.5 px-3 text-center"><span class="px-1.5 py-0.5 font-bold text-xs bg-zinc-100 text-zinc-655 rounded">${item.size || '-'}</span></td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} lbr</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-emerald-700">${item.volume > 0 ? item.volume.toFixed(4) + ' m³' : '-'}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });
            
            document.getElementById('summary-total-items').innerText = totalItems;
            document.getElementById('summary-total-lembar').innerText = totalLembar + ' lbr';
            document.getElementById('summary-total-volume').innerText = totalVolume.toFixed(4) + ' m³';
        }

        // LocalStorage save
        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_penerimaan_sawtimber', JSON.stringify(logEntries));
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
                showToast('Harap tambahkan minimal 1 item sawtimber!', 'error');
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
                jumlah: item.jumlah,
                volume: item.volume
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
                    showToast('Berhasil memperbarui data penerimaan sawtimber!', 'success');
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
                showToast(`Berhasil menyimpan ${currentFormItems.length} item penerimaan sawtimber!`, 'success');
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
                showToast('Data penerimaan sawtimber berhasil dihapus.', 'success');
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

            let totalLembar = 0;
            let totalVolume = 0;
            if (entry.items && Array.isArray(entry.items)) {
                entry.items.forEach((item, idx) => {
                    totalLembar += item.jumlah;
                    totalVolume += item.volume || 0.0;

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
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} lbr</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-emerald-700">${(item.volume || 0.0).toFixed(1)} m³</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('detail-total-lembar').innerText = totalLembar;
            document.getElementById('detail-total-volume').innerText = totalVolume.toFixed(1);
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
            headerTitle.innerText = "Ubah Penerimaan Sawtimber";
            headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Ubah Log";
            formTitle.innerText = "Ubah Penerimaan Sawtimber";
            formSubtitle.innerText = "Edit data pengiriman sawtimber per surat jalan dengan multi-item papan";

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
            let totalLembar = 0;
            let totalVolume = 0;
            const uniqueUkuran = new Set();
            let bulanIniCount = 0;

            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

            logEntries.forEach(entry => {
                let entryLembar = 0;
                let entryVolume = 0;
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        entryLembar += item.jumlah;
                        entryVolume += (item.volume || 0.0);
                        if (item.size) uniqueUkuran.add(item.size);
                    });
                }
                totalLembar += entryLembar;
                totalVolume += entryVolume;

                if (entry.tanggal && entry.tanggal.substring(0, 7) === currentMonth) {
                    bulanIniCount += entryLembar;
                }
            });

            document.getElementById('stat-total-lembar').innerText = totalLembar;
            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(1);
            document.getElementById('stat-ukuran-variasi').innerText = uniqueUkuran.size;
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

        // Filters & Date Toolbar
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

        // Apply search + date filters
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
                
                let totalLembar = 0;
                let totalVolume = 0;
                let rincianHTML = '<div class="flex flex-wrap gap-1.5 justify-start">';
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        totalLembar += item.jumlah;
                        totalVolume += (item.volume || 0.0);
                        
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
                    <td class="py-3.5 px-4 text-right font-bold text-zinc-800">${totalLembar} lbr</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-emerald-700">${totalVolume.toFixed(1)} m³</td>
                    <td class="py-3.5 px-4 text-zinc-500 truncate max-w-[150px]" title="${entry.catatan || ''}">${entry.catatan || '-'}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="showDetail(${entry.id})" class="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="editEntry(${entry.id})" class="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ubah">
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
                const customSizeModal = document.getElementById('custom-size-modal');
                if (customSizeModal && customSizeModal.classList.contains('open')) {
                    closeCustomSizeModal();
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