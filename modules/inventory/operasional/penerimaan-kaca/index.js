// Default size variations (dimensions in cm)
        const defaultSizes = [
            { code: '122×183', lebar: 122, panjang: 183 },
            { code: '122×244', lebar: 122, panjang: 244 },
            { code: '152×213', lebar: 152, panjang: 213 },
            { code: '183×244', lebar: 183, panjang: 244 },
            { code: '213×304', lebar: 213, panjang: 304 }
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
        let activeCustomSizeTargetId = null;

        // Helper: Timezone-safe local ISO date string
        function getLocalDateString(d) {
            const offset = d.getTimezoneOffset();
            const localDate = new Date(d.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
        }

        // Helper: Get local week range [Monday, Sunday]
        function getWeekRange() {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
            const monday = new Date(now.setDate(diff));
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);
            return [getLocalDateString(monday), getLocalDateString(sunday)];
        }

        // Initial setup on load
        window.addEventListener('DOMContentLoaded', () => {
            // Load sizes from localStorage or seed defaults
            const savedSizes = localStorage.getItem('woodtrack_glass_sizes');
            if (savedSizes) {
                sizes = JSON.parse(savedSizes);
            } else {
                sizes = [...defaultSizes];
                localStorage.setItem('woodtrack_glass_sizes', JSON.stringify(sizes));
            }

            // Load entries from localStorage or seed defaults
            const savedEntries = localStorage.getItem('woodtrack_penerimaan_kaca');
            if (savedEntries) {
                logEntries = JSON.parse(savedEntries);
                
                // Migrate legacy flat data format to nested transaction format
                let migrated = false;
                logEntries.forEach(entry => {
                    if (!entry.items) {
                        entry.items = [{
                            jenis: entry.jenis || 'Polos / Clear',
                            grade: entry.grade || 'A',
                            tebal: entry.tebal || 5,
                            size: entry.size || '122×244',
                            jumlah: entry.jumlah || 0,
                            luas: entry.luas || 0.0,
                            volume: entry.volume || 0.0
                        }];
                        delete entry.jenis;
                        delete entry.grade;
                        delete entry.tebal;
                        delete entry.size;
                        delete entry.jumlah;
                        delete entry.luas;
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

        // Helper to get glass seed data
        function getSeedData() {
            return [
                {
                    id: 1,
                    tanggal: '2026-06-01',
                    supplier: 'PT. Asahimas Flat Glass',
                    surat: 'SJ-2601/KCA/01',
                    catatan: 'Penerimaan lembaran kaca bening prima mulus',
                    items: [
                        { jenis: 'Polos / Clear', grade: 'A', tebal: 5, size: '122×244', jumlah: 100, luas: 297.68, volume: 1.4884 }
                    ]
                },
                {
                    id: 2,
                    tanggal: '2026-06-01',
                    supplier: 'PT. Mulia Glass',
                    surat: 'SJ-2601/KCA/02',
                    catatan: 'Kaca tempered pesanan khusus sekat kantor',
                    items: [
                        { jenis: 'Tempered', grade: 'A', tebal: 8, size: '183×244', jumlah: 30, luas: 133.96, volume: 1.0716 }
                    ]
                },
                {
                    id: 3,
                    tanggal: '2026-06-02',
                    supplier: 'PT. Asahimas Flat Glass',
                    surat: 'SJ-2602/KCA/08',
                    catatan: 'Baret sangat tipis di sudut pengiriman',
                    items: [
                        { jenis: 'Rayban / Tinted', grade: 'B', tebal: 5, size: '122×244', jumlah: 80, luas: 238.14, volume: 1.1907 }
                    ]
                },
                {
                    id: 4,
                    tanggal: '2026-06-03',
                    supplier: 'PT. Mulia Glass',
                    surat: 'SJ-2603/KCA/04',
                    catatan: 'Kaca es motif buram',
                    items: [
                        { jenis: 'Frosted / Es', grade: 'C', tebal: 3, size: '122×183', jumlah: 150, luas: 334.89, volume: 1.0047 }
                    ]
                },
                {
                    id: 5,
                    tanggal: '2026-06-04',
                    supplier: 'PT. Asahimas Flat Glass',
                    surat: 'SJ-2604/KCA/11',
                    catatan: 'Cermin wastafel dan toilet',
                    items: [
                        { jenis: 'Cermin / Mirror', grade: 'A', tebal: 5, size: '152×213', jumlah: 50, luas: 161.88, volume: 0.8094 }
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
                headerTitle.innerText = "Input Penerimaan Kaca";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Input Baru";
                formTitle.innerText = "Catat Penerimaan Baru";
                formSubtitle.innerText = "Input data pengiriman lembaran kaca per surat jalan dengan multi-item";
                resetFormPage();
            } else {
                editingId = null;
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Penerimaan Kaca";
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

        // Generate size selection options
        function getSizeOptionsHTML() {
            let html = '<option value="" disabled selected>Pilih Ukuran...</option>';
            sizes.forEach(s => {
                const area = (s.lebar * s.panjang) / 10000;
                html += `<option value="${s.code}">${s.code} cm (${area.toFixed(2)} m²)</option>`;
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

        // Add glass item row to the form (supports populating data for editing)
        function addWoodItemRow(itemData = null) {
            const tempId = (Date.now() + Math.random()).toString(36).substring(2, 9);
            
            const standardThicks = [3, 5, 8, 10, 12];
            let isCustomThick = false;
            let thickVal = '';
            
            if (itemData) {
                thickVal = itemData.tebal;
                if (!standardThicks.includes(itemData.tebal)) {
                    isCustomThick = true;
                    thickVal = 'custom';
                }
            }

            const newItem = {
                tempId: tempId,
                jenis: itemData ? itemData.jenis : '',
                grade: itemData ? itemData.grade : '',
                tebal: thickVal,
                tebalIsCustom: isCustomThick,
                customTebal: isCustomThick ? itemData.tebal : 0,
                size: itemData ? itemData.size : '',
                jumlah: itemData ? itemData.jumlah : 0,
                luas: itemData ? (itemData.luas || 0.0) : 0.0,
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
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Column 1: Jenis & Grade -->
                    <div class="space-y-3">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Jenis Kaca *</label>
                            <select id="item-jenis-${tempId}" onchange="updateItemField('${tempId}', 'jenis', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                                <option value="" disabled selected>Pilih Jenis Kaca...</option>
                                <option value="Polos / Clear">Polos / Clear</option>
                                <option value="Rayban / Tinted">Rayban / Tinted</option>
                                <option value="Frosted / Es">Frosted / Es</option>
                                <option value="Tempered">Tempered</option>
                                <option value="Cermin / Mirror">Cermin / Mirror</option>
                                <option value="Low-E">Low-E</option>
                            </select>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Kualitas / Grade *</label>
                            <select id="item-grade-${tempId}" onchange="updateItemField('${tempId}', 'grade', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                                <option value="" disabled selected>Pilih Grade...</option>
                                <option value="A">Grade A (Prima/Mulus)</option>
                                <option value="B">Grade B (Baret Minor)</option>
                                <option value="C">Grade C (Cacat Sudut)</option>
                                <option value="D">Grade D (Reject/Pecah)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Column 2: Ketebalan & Ukuran -->
                    <div class="space-y-3">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ketebalan Kaca *</label>
                            <select id="item-tebal-${tempId}" onchange="updateItemField('${tempId}', 'tebal', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                                <option value="" disabled selected>Pilih Tebal...</option>
                                <option value="3">3 mm</option>
                                <option value="5">5 mm</option>
                                <option value="8">8 mm</option>
                                <option value="10">10 mm</option>
                                <option value="12">12 mm</option>
                                <option value="custom">Kustom / Lainnya</option>
                            </select>
                            <div id="item-tebal-custom-container-${tempId}" class="${isCustomThick ? '' : 'hidden'} mt-1.5 anim">
                                <div class="relative">
                                    <input type="number" id="item-tebal-custom-${tempId}" oninput="updateItemField('${tempId}', 'customTebal', this.value)" placeholder="Masukkan tebal..." class="premium-input pr-12">
                                    <span class="absolute right-4 top-2.5 text-xs font-bold text-zinc-400">mm</span>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ukuran Lembar Kaca *</label>
                                <button type="button" onclick="openCustomSizeModal('${tempId}')" class="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all font-sans">+ Ukuran Baru</button>
                            </div>
                            <select id="item-size-${tempId}" onchange="updateItemField('${tempId}', 'size', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer">
                                ${getSizeOptionsHTML()}
                            </select>
                        </div>
                    </div>

                    <!-- Column 3: Qty & Calculations -->
                    <div class="space-y-3">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Jumlah (Lembar) *</label>
                            <input type="number" id="item-jumlah-${tempId}" oninput="updateItemField('${tempId}', 'jumlah', this.value)" min="1" placeholder="Contoh: 50" class="premium-input font-bold">
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <div class="space-y-1">
                                <span class="text-[9px] font-bold text-zinc-400 block uppercase">Luas (m²)</span>
                                <input type="text" id="item-luas-${tempId}" value="0.00" class="premium-input bg-zinc-50/50 font-bold text-zinc-500 text-xs text-center" readonly>
                            </div>
                            <div class="space-y-1">
                                <span class="text-[9px] font-bold text-zinc-400 block uppercase">Volume (m³)</span>
                                <input type="text" id="item-volume-${tempId}" value="0.0000" class="premium-input bg-zinc-50/50 font-extrabold text-sky-700 text-xs text-center" readonly>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(itemCard);
            
            // Populate values if editing/itemData is present
            if (itemData) {
                document.getElementById(`item-jenis-${tempId}`).value = itemData.jenis;
                document.getElementById(`item-grade-${tempId}`).value = itemData.grade;
                document.getElementById(`item-tebal-${tempId}`).value = newItem.tebal;
                if (isCustomThick) {
                    document.getElementById(`item-tebal-custom-${tempId}`).value = itemData.tebal;
                }
                document.getElementById(`item-size-${tempId}`).value = itemData.size;
                document.getElementById(`item-jumlah-${tempId}`).value = itemData.jumlah;
                
                calculateCardMetrics(tempId);
            }
            
            updateFormSummary();
        }

        // Delete item row
        function removeWoodItemRow(tempId) {
            if (currentFormItems.length <= 1) {
                showToast('Minimal harus ada 1 item kaca dalam pengiriman!', 'error');
                return;
            }
            
            currentFormItems = currentFormItems.filter(item => item.tempId !== tempId);
            const row = document.getElementById(`item-row-${tempId}`);
            if (row) row.remove();
            
            // Re-label card headers
            const labels = document.querySelectorAll('#wood-items-container span.font-mono');
            labels.forEach((label, idx) => {
                label.innerText = `Item #${idx + 1}`;
            });
            
            updateFormSummary();
        }

        // Update single field inside card row
        function updateItemField(tempId, field, value) {
            const item = currentFormItems.find(item => item.tempId === tempId);
            if (!item) return;

            if (field === 'jenis') {
                item.jenis = value;
            } else if (field === 'grade') {
                item.grade = value;
            } else if (field === 'tebal') {
                item.tebal = value;
                const customContainer = document.getElementById(`item-tebal-custom-container-${tempId}`);
                if (value === 'custom') {
                    item.tebalIsCustom = true;
                    if (customContainer) customContainer.classList.remove('hidden');
                } else {
                    item.tebalIsCustom = false;
                    if (customContainer) customContainer.classList.add('hidden');
                }
            } else if (field === 'customTebal') {
                item.customTebal = parseFloat(value) || 0;
            } else if (field === 'size') {
                item.size = value;
            } else if (field === 'jumlah') {
                item.jumlah = parseInt(value) || 0;
            }

            calculateCardMetrics(tempId);
            updateFormSummary();
        }

        // Calculates Area & Volume in real-time per card
        function calculateCardMetrics(tempId) {
            const item = currentFormItems.find(item => item.tempId === tempId);
            if (!item) return;

            const sizeObj = sizes.find(s => s.code === item.size);
            const qty = item.jumlah;
            const thickness = item.tebalIsCustom ? item.customTebal : parseFloat(item.tebal);

            if (!sizeObj || qty <= 0 || isNaN(thickness) || thickness <= 0) {
                item.luas = 0.0;
                item.volume = 0.0;
                const luasInput = document.getElementById(`item-luas-${tempId}`);
                const volInput = document.getElementById(`item-volume-${tempId}`);
                if (luasInput) luasInput.value = '0.00';
                if (volInput) volInput.value = '0.0000';
                return;
            }

            const lebarM = sizeObj.lebar / 100;
            const panjangM = sizeObj.panjang / 100;
            const tebalM = thickness / 1000;

            const totalArea = lebarM * panjangM * qty;
            const totalVolume = tebalM * lebarM * panjangM * qty;

            item.luas = totalArea;
            item.volume = totalVolume;

            const luasInput = document.getElementById(`item-luas-${tempId}`);
            const volInput = document.getElementById(`item-volume-${tempId}`);
            if (luasInput) luasInput.value = totalArea.toFixed(2);
            if (volInput) volInput.value = totalVolume.toFixed(4);
        }

        // Aggregate counts for summary card
        function updateFormSummary() {
            let totalSheets = 0;
            let totalLuas = 0;
            let totalVolume = 0;

            const tbody = document.getElementById('form-summary-table-body');
            if (tbody) tbody.innerHTML = '';

            currentFormItems.forEach((item, index) => {
                totalSheets += item.jumlah;
                totalLuas += item.luas;
                totalVolume += item.volume;
                
                if (tbody) {
                    let gradeBadge = '';
                    if (item.grade === 'A') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Grade A</span>';
                    else if (item.grade === 'B') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Grade B</span>';
                    else if (item.grade === 'C') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Grade C</span>';
                    else if (item.grade === 'D') gradeBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Grade D</span>';
                    else gradeBadge = '<span class="text-zinc-400 italic">Belum dipilih</span>';
                    
                    const thicknessVal = item.tebalIsCustom ? item.customTebal : parseFloat(item.tebal);
                    const thicknessText = isNaN(thicknessVal) ? '-' : thicknessVal + ' mm';
                    
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/50 transition-colors';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-400">${index + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.jenis || '<span class="text-zinc-400 italic">Belum dipilih</span>'}</td>
                        <td class="py-2.5 px-3 text-center">${gradeBadge}</td>
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-650">${thicknessText}</td>
                        <td class="py-2.5 px-3 text-center"><span class="px-1.5 py-0.5 font-bold text-xs bg-zinc-100 text-zinc-655 rounded">${item.size || '-'}</span></td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} lbr</td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-700">${item.luas > 0 ? item.luas.toFixed(2) + ' m²' : '-'}</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-sky-700">${item.volume > 0 ? item.volume.toFixed(4) + ' m³' : '-'}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });

            document.getElementById('summary-total-items').innerText = currentFormItems.length;
            document.getElementById('summary-total-sheets').innerText = totalSheets.toLocaleString('id-ID') + ' lbr';
            document.getElementById('summary-total-luas').innerText = totalLuas.toFixed(2) + ' m²';
            document.getElementById('summary-total-volume').innerText = totalVolume.toFixed(4) + ' m³';
        }

        // Save entire log entries to LocalStorage
        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_penerimaan_kaca', JSON.stringify(logEntries));
        }

        // Add Toast Notification
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = `<i class="fa-solid fa-check text-sky-500"></i>`;
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

        // Save Batch Entries (from form-view to state)
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
                showToast('Harap tambahkan minimal 1 item kaca!', 'error');
                return;
            }

            // Validate all cards
            for (let i = 0; i < currentFormItems.length; i++) {
                const item = currentFormItems[i];
                const thickness = item.tebalIsCustom ? item.customTebal : parseFloat(item.tebal);

                if (!item.jenis.trim() || !item.grade || isNaN(thickness) || thickness <= 0 || !item.size || isNaN(item.jumlah) || item.jumlah <= 0) {
                    showToast(`Lengkapi semua data Item #${i + 1} (Jenis, Grade, Tebal, Ukuran, dan Jumlah)!`, 'error');
                    return;
                }
            }

            // Map UI items to standard schema
            const transactionItems = currentFormItems.map(item => ({
                jenis: item.jenis,
                grade: item.grade,
                tebal: item.tebalIsCustom ? item.customTebal : parseFloat(item.tebal),
                size: item.size,
                jumlah: item.jumlah,
                luas: item.luas,
                volume: item.volume
            }));

            if (editingId !== null) {
                // Update
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
                    showToast('Berhasil memperbarui data penerimaan kaca!', 'success');
                } else {
                    showToast('Gagal memperbarui: Data tidak ditemukan.', 'error');
                }
            } else {
                // Create
                const newEntry = {
                    id: Date.now(),
                    tanggal,
                    supplier: supplier || '-',
                    surat: surat || '-',
                    catatan: catatan || '-',
                    items: transactionItems
                };
                logEntries.unshift(newEntry);
                showToast(`Berhasil menyimpan ${currentFormItems.length} item penerimaan kaca!`, 'success');
            }

            saveToLocalStorage();
            updateDashboard();
            setDateFilter('All');
            setView('dashboard');
        }

        // Delete transaction
        function deleteEntry(id) {
            if (confirm('Apakah Anda yakin ingin menghapus data penerimaan kaca ini?')) {
                logEntries = logEntries.filter(entry => entry.id !== id);
                saveToLocalStorage();
                updateDashboard();
                applyFiltersAndRender();
                showToast('Data penerimaan kaca berhasil dihapus.', 'success');
            }
        }

        // Update Dashboard Stats Cards
        function updateDashboard() {
            let totalLembar = 0;
            let totalLuas = 0;
            let totalVolume = 0;
            let bulanIniCount = 0;

            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

            logEntries.forEach(entry => {
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        totalLembar += item.jumlah;
                        totalLuas += item.luas;
                        totalVolume += item.volume;
                        if (entry.tanggal && entry.tanggal.substring(0, 7) === currentMonth) {
                            bulanIniCount += item.jumlah;
                        }
                    });
                }
            });

            document.getElementById('stat-total-lembar').innerText = totalLembar.toLocaleString('id-ID');
            document.getElementById('stat-total-luas').innerText = totalLuas.toFixed(2).toLocaleString('id-ID');
            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(4).toLocaleString('id-ID');
            document.getElementById('stat-bulan-ini').innerText = bulanIniCount.toLocaleString('id-ID');
        }

        // Date Presets Handler
        function setDateFilter(filter) {
            selectedDateFilter = filter;
            const pills = ['All', 'Today', 'Week', 'Month', 'Custom'];
            pills.forEach(p => {
                const el = document.getElementById(`filter-date-${p}`);
                if (el) {
                    if (p === filter) el.classList.add('active');
                    else el.classList.remove('active');
                }
            });

            const rangeRow = document.getElementById('custom-date-picker-row');
            if (filter === 'Custom') {
                if (rangeRow) rangeRow.classList.remove('hidden');
            } else {
                if (rangeRow) rangeRow.classList.add('hidden');
                currentPage = 1;
                applyFiltersAndRender();
            }
        }

        function handleCustomDateChange() {
            customStartDate = document.getElementById('filter-start-date').value;
            customEndDate = document.getElementById('filter-end-date').value;
            currentPage = 1;
            applyFiltersAndRender();
        }

        function handleSearch(val) {
            searchQuery = val.toLowerCase().trim();
            currentPage = 1;
            applyFiltersAndRender();
        }

        // Filters Engine
        function applyFiltersAndRender() {
            const todayStr = getLocalDateString(new Date());
            const [weekStart, weekEnd] = getWeekRange();
            const currentMonthStr = new Date().toISOString().substring(0, 7);

            filteredEntries = logEntries.filter(entry => {
                // 1. Date Filter
                let matchesDate = true;
                if (selectedDateFilter === 'Today') {
                    matchesDate = (entry.tanggal === todayStr);
                } else if (selectedDateFilter === 'Week') {
                    matchesDate = (entry.tanggal >= weekStart && entry.tanggal <= weekEnd);
                } else if (selectedDateFilter === 'Month') {
                    matchesDate = (entry.tanggal && entry.tanggal.substring(0, 7) === currentMonthStr);
                } else if (selectedDateFilter === 'Custom') {
                    if (customStartDate && customEndDate) {
                        matchesDate = (entry.tanggal >= customStartDate && entry.tanggal <= customEndDate);
                    } else if (customStartDate) {
                        matchesDate = (entry.tanggal === customStartDate);
                    } else if (customEndDate) {
                        matchesDate = (entry.tanggal <= customEndDate);
                    }
                }

                // 2. Search query filter (matches supplier, surat jalan, catatan, and nested item jenis)
                let matchesSearch = true;
                if (searchQuery !== '') {
                    const inHeader = (
                        (entry.supplier && entry.supplier.toLowerCase().includes(searchQuery)) ||
                        (entry.surat && entry.surat.toLowerCase().includes(searchQuery)) ||
                        (entry.catatan && entry.catatan.toLowerCase().includes(searchQuery))
                    );

                    let inItems = false;
                    if (entry.items && Array.isArray(entry.items)) {
                        inItems = entry.items.some(item => 
                            item.jenis.toLowerCase().includes(searchQuery) ||
                            item.size.toLowerCase().includes(searchQuery) ||
                            item.grade.toLowerCase().includes(searchQuery)
                        );
                    }
                    matchesSearch = inHeader || inItems;
                }

                return matchesDate && matchesSearch;
            });

            renderTable();
        }

        // Render history table data
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

            const totalItems = filteredEntries.length;
            const totalPages = Math.ceil(totalItems / rowsPerPage);
            
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
                
                let totalSheets = 0;
                let totalLuas = 0;
                let totalVolume = 0;
                let rincianHTML = '<div class="flex flex-wrap gap-1.5 justify-start">';
                
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        totalSheets += item.jumlah;
                        totalLuas += item.luas;
                        totalVolume += item.volume;

                        let gradeColorClass = 'text-zinc-600 bg-zinc-100 border-zinc-200';
                        if (item.grade === 'A') gradeColorClass = 'text-emerald-700 bg-emerald-50 border-emerald-100/50';
                        else if (item.grade === 'B') gradeColorClass = 'text-blue-700 bg-blue-50 border-blue-100/50';
                        else if (item.grade === 'C') gradeColorClass = 'text-indigo-700 bg-indigo-50 border-indigo-100/50';
                        else if (item.grade === 'D') gradeColorClass = 'text-red-700 bg-red-50 border-red-100/50';

                        rincianHTML += `
                            <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${gradeColorClass}">
                                ${item.jenis} G${item.grade} (${item.tebal}mm, ${item.size}): ${item.jumlah} lbr
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
                    <td class="py-3.5 px-4 text-right font-bold text-zinc-800">${totalSheets.toLocaleString('id-ID')} lbr</td>
                    <td class="py-3.5 px-4 text-right font-bold text-sky-700">${totalLuas.toFixed(2)} m²</td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-sky-800">${totalVolume.toFixed(4)} m³</td>
                    <td class="py-3.5 px-4 text-zinc-500 truncate max-w-[150px]" title="${entry.catatan || ''}">${entry.catatan || '-'}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="showDetail(${entry.id})" class="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="editEntry(${entry.id})" class="p-1.5 text-zinc-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Ubah">
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

        // Helper: Format Date
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
            let totalLuas = 0;
            let totalVolume = 0;

            if (entry.items && Array.isArray(entry.items)) {
                entry.items.forEach((item, idx) => {
                    totalLembar += item.jumlah || 0;
                    totalLuas += item.luas || 0.0;
                    totalVolume += item.volume || 0.0;

                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/80 transition-colors border-b border-zinc-50';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 font-semibold text-zinc-400 text-center">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.jenis}</td>
                        <td class="py-2.5 px-3 text-center"><span class="px-1.5 py-0.5 rounded font-bold text-[10px] bg-sky-50 text-sky-700 border border-sky-100">Grade ${item.grade}</span></td>
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-600">${item.tebal} mm</td>
                        <td class="py-2.5 px-3 text-center font-mono text-zinc-500">${item.size} cm</td>
                        <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${item.jumlah} lbr</td>
                        <td class="py-2.5 px-3 text-right font-bold text-sky-700">${item.luas.toFixed(2)} m²</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-sky-800">${item.volume.toFixed(4)} m³</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('detail-total-items').innerText = entry.items ? entry.items.length : 0;
            document.getElementById('detail-total-sheets').innerText = totalLembar.toLocaleString('id-ID');
            document.getElementById('detail-total-luas').innerText = totalLuas.toFixed(2);
            document.getElementById('detail-total-volume').innerText = totalVolume.toFixed(4);

            document.getElementById('detail-modal').classList.add('open');
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.remove('open');
        }

        // Edit Entry (loads nested cards to form view)
        function editEntry(id) {
            const entry = logEntries.find(e => e.id === id);
            if (!entry) return;

            editingId = id;
            
            // Toggle form view
            const dashboard = document.getElementById('dashboard-view');
            const form = document.getElementById('form-view');
            const headerTitle = document.querySelector('header h1');
            const headerSubtitle = document.querySelector('header p');
            const formTitle = document.querySelector('#form-view h2');
            const formSubtitle = document.querySelector('#form-view p');

            dashboard.classList.add('hidden');
            form.classList.remove('hidden');
            
            headerTitle.innerText = "Ubah Penerimaan Kaca";
            headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Ubah Data";
            formTitle.innerText = "Ubah Data Penerimaan";
            formSubtitle.innerText = `Mengedit pengiriman No. Surat Jalan: ${entry.surat || '-'}`;

            // Populate headers
            document.getElementById('form-tanggal').value = entry.tanggal;
            document.getElementById('form-surat').value = entry.surat === '-' ? '' : entry.surat;
            document.getElementById('form-supplier').value = entry.supplier === '-' ? '' : entry.supplier;
            document.getElementById('form-catatan').value = entry.catatan === '-' ? '' : entry.catatan;

            // Populate items cards
            currentFormItems = [];
            document.getElementById('wood-items-container').innerHTML = '';

            if (entry.items && Array.isArray(entry.items)) {
                entry.items.forEach(item => {
                    addWoodItemRow(item);
                });
            } else {
                addWoodItemRow();
            }

            updateFormSummary();
        }

        // Custom Size Modal Handling
        function openCustomSizeModal(targetCardId = null) {
            activeCustomSizeTargetId = targetCardId;
            document.getElementById('custom-size-modal').classList.add('open');
            document.getElementById('custom-lebar').value = '';
            document.getElementById('custom-panjang').value = '';
            document.getElementById('custom-luas-preview').innerText = '0.00 m²';
        }

        function closeCustomSizeModal() {
            document.getElementById('custom-size-modal').classList.remove('open');
            activeCustomSizeTargetId = null;
        }

        function calculateCustomLuas() {
            const lebar = parseFloat(document.getElementById('custom-lebar').value) || 0;
            const panjang = parseFloat(document.getElementById('custom-panjang').value) || 0;
            const luas = (lebar * panjang) / 10000;
            document.getElementById('custom-luas-preview').innerText = luas > 0 ? luas.toFixed(4) + ' m²' : '0.00 m²';
        }

        function saveCustomSize() {
            const lebar = parseInt(document.getElementById('custom-lebar').value);
            const panjang = parseInt(document.getElementById('custom-panjang').value);

            if (isNaN(lebar) || lebar <= 0 || isNaN(panjang) || panjang <= 0) {
                showToast('Masukkan dimensi panjang dan lebar yang valid!', 'error');
                return;
            }

            const code = `${lebar}×${panjang}`;
            
            // Check if size already exists
            if (!sizes.find(s => s.code === code)) {
                const newSize = { code, lebar, panjang };
                sizes.push(newSize);
                localStorage.setItem('woodtrack_glass_sizes', JSON.stringify(sizes));
                showToast(`Ukuran ${code} cm berhasil ditambahkan.`);
            }

            repopulateAllSizeSelects();

            // Auto-select size for target card if launched from a card
            if (activeCustomSizeTargetId) {
                const selectEl = document.getElementById(`item-size-${activeCustomSizeTargetId}`);
                if (selectEl) {
                    selectEl.value = code;
                    updateItemField(activeCustomSizeTargetId, 'size', code);
                }
            }

            closeCustomSizeModal();
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setView('dashboard');
                closeDetailModal();
                closeCustomSizeModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setView('form');
            }
        });