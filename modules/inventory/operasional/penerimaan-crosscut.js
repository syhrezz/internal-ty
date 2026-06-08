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
            // Load entries from localStorage or seed defaults
            const saved = localStorage.getItem('woodtrack_penerimaan_crosscut');
            if (saved) {
                logEntries = JSON.parse(saved);
                
                // Migrate legacy flat data format to nested transaction format
                let migrated = false;
                logEntries.forEach(entry => {
                    if (!entry.items) {
                        entry.items = [{
                            sumber: entry.sumber || 'Sisa pembelahan log Jati',
                            volume: entry.volume || 0.0
                        }];
                        delete entry.sumber;
                        delete entry.volume;
                        migrated = true;
                    }
                });

                // If it only has the old seed data or is empty, we upgrade to the new rich sample data
                const isOldSeed = logEntries.length === 0 || (logEntries.length === 4 && logEntries.every(e => [1, 2, 3, 4].includes(e.id)));
                if (isOldSeed) {
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

        // Helper to get rich sample seed data
        function getSeedData() {
            return [
                {
                    id: 1,
                    tanggal: '2026-06-01',
                    supplier: 'CV. Kayu Mas',
                    surat: 'SJ-2601/CC/01',
                    catatan: 'Kayu jati sisa belahan dari log besar',
                    items: [
                        { sumber: 'Sisa pembelahan log Jati', volume: 4.80 },
                        { sumber: 'Sisa trim ujung log Jati', volume: 1.20 }
                    ]
                },
                {
                    id: 2,
                    tanggal: '2026-06-02',
                    supplier: 'UD. Jaya Abadi',
                    surat: 'SJ-2602/CC/03',
                    catatan: 'Untuk bahan core veneer lapis',
                    items: [
                        { sumber: 'Kupasan Sengon Supplier Adi', volume: 8.50 }
                    ]
                },
                {
                    id: 3,
                    tanggal: '2026-06-03',
                    supplier: 'CV. Lestari Kayu',
                    surat: 'SJ-2603/CC/08',
                    catatan: 'Kualitas sedang',
                    items: [
                        { sumber: 'Sisa potongan Meranti merah', volume: 3.25 },
                        { sumber: 'Ujung log Meranti', volume: 2.10 }
                    ]
                },
                {
                    id: 4,
                    tanggal: '2026-06-04',
                    supplier: 'UD. Jaya Abadi',
                    surat: 'SJ-2604/CC/11',
                    catatan: 'Penerimaan rutin harian',
                    items: [
                        { sumber: 'Sisa kupasan Mahoni', volume: 5.12 },
                        { sumber: 'Serutan tebal Mahoni', volume: 0.85 }
                    ]
                },
                {
                    id: 5,
                    tanggal: '2026-06-04',
                    supplier: 'PT. Rimba Sejahtera',
                    surat: 'SJ-2604/CC/15',
                    catatan: 'Bahan baku industri palet',
                    items: [
                        { sumber: 'Sisa pembelahan Pinus', volume: 6.40 },
                        { sumber: 'Kupasan kayu karet', volume: 3.80 },
                        { sumber: 'Sisa potong Albasia', volume: 2.15 }
                    ]
                },
                {
                    id: 6,
                    tanggal: '2026-06-04',
                    supplier: 'CV. Kayu Mas',
                    surat: 'SJ-2604/CC/18',
                    catatan: 'Sisa sortiran ekspor premium',
                    items: [
                        { sumber: 'Sisa pembelahan log Jati Grade A', volume: 2.75 }
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
                headerTitle.innerText = "Input Penerimaan Crosscut";
                headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Input Baru";
                formTitle.innerText = "Catat Penerimaan Baru";
                formSubtitle.innerText = "Input data pengiriman crosscut per surat jalan dengan multi-item";
                resetFormPage();
            } else {
                editingId = null;
                dashboard.classList.remove('hidden');
                form.classList.add('hidden');
                headerTitle.innerText = "Penerimaan Crosscut";
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

        function getMasterCrosscutOptions() {
            let masterOptions = [];
            try {
                const rawMaster = localStorage.getItem("woodtrack_master_crosscut");
                if (rawMaster) {
                    const parsed = JSON.parse(rawMaster);
                    masterOptions = parsed.filter(item => item.status === "Aktif").map(item => item.sumber);
                }
            } catch (e) {
                console.error(e);
            }
            if (masterOptions.length === 0) {
                masterOptions = [
                    "Maple Premium Sports Floor Face",
                    "Maple Select Sports Floor Face",
                    "Hevea Core Spacer Board",
                    "Sleeper Pinus treated",
                    "Sisa pembelahan log Jati",
                    "Sisa trim ujung log Jati",
                    "Kupasan Sengon Supplier Adi",
                    "Sisa potongan Meranti merah",
                    "Ujung log Meranti",
                    "Sisa kupasan Mahoni"
                ];
            }
            return [...new Set(masterOptions)];
        }

        // Add wood item row to the form (supports populating data for editing)
        function addWoodItemRow(itemData = null) {
            const tempId = (Date.now() + Math.random()).toString(36).substring(2, 9);
            
            const newItem = {
                tempId: tempId,
                sumber: itemData ? itemData.sumber : '',
                volume: itemData ? (itemData.volume || 0.0) : 0.0
            };
            
            currentFormItems.push(newItem);
            
            const container = document.getElementById('wood-items-container');
            const itemCard = document.createElement('div');
            itemCard.id = `item-row-${tempId}`;
            itemCard.className = `glass-card rounded-2xl p-5 relative border border-zinc-100 hover:border-zinc-200 transition-all shadow-sm bg-white space-y-4 anim d1`;
            
            const optionsList = getMasterCrosscutOptions();
            let optionsHtml = `<option value="" disabled selected>Pilih Sumber / Keterangan</option>`;
            optionsList.forEach(opt => {
                optionsHtml += `<option value="${opt}">${opt}</option>`;
            });

            itemCard.innerHTML = `
                <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Item #${currentFormItems.length}</span>
                    <button onclick="removeWoodItemRow('${tempId}')" class="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Hapus Item">
                        <i class="fa-solid fa-trash-can  text-[13px]"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Sumber / Keterangan *</label>
                        <select id="item-sumber-${tempId}" onchange="updateItemField('${tempId}', 'sumber', this.value)" class="premium-input">
                            ${optionsHtml}
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Volume (m³) *</label>
                        <input type="number" id="item-volume-${tempId}" oninput="updateItemField('${tempId}', 'volume', this.value)" step="0.01" min="0.01" placeholder="Masukkan volume (m³)" class="premium-input font-bold text-zinc-800">
                    </div>
                </div>
            `;
            
            container.appendChild(itemCard);
            
            // Populate element values if editing
            if (itemData) {
                const selectEl = document.getElementById(`item-sumber-${tempId}`);
                if (itemData.sumber && ![...selectEl.options].some(opt => opt.value === itemData.sumber)) {
                    const opt = document.createElement('option');
                    opt.value = itemData.sumber;
                    opt.textContent = itemData.sumber;
                    selectEl.appendChild(opt);
                }
                selectEl.value = itemData.sumber;
                document.getElementById(`item-volume-${tempId}`).value = itemData.volume ? itemData.volume.toFixed(2) : '';
            }
            
            updateFormSummary();
        }

        // Delete wood item row
        function removeWoodItemRow(tempId) {
            if (currentFormItems.length <= 1) {
                showToast('Minimal harus ada 1 item crosscut dalam pengiriman!', 'error');
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

            if (field === 'sumber') {
                item.sumber = value;
            } else if (field === 'volume') {
                item.volume = parseFloat(value) || 0.0;
            }

            updateFormSummary();
        }

        // Aggregate totals for the summary card
        function updateFormSummary() {
            let totalItems = currentFormItems.length;
            let totalVolume = 0;
            
            const tbody = document.getElementById('form-summary-table-body');
            if (tbody) tbody.innerHTML = '';
            
            currentFormItems.forEach((item, index) => {
                totalVolume += item.volume;
                
                if (tbody) {
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/50 transition-colors';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-400">${index + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.sumber || '<span class="text-zinc-400 italic">Belum dipilih</span>'}</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-violet-700">${item.volume > 0 ? item.volume.toFixed(2) + ' m³' : '-'}</td>
                    `;
                    tbody.appendChild(tr);
                }
            });
            
            document.getElementById('summary-total-items').innerText = totalItems;
            document.getElementById('summary-total-volume').innerText = totalVolume.toFixed(2) + ' m³';
        }

        // LocalStorage save
        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_penerimaan_crosscut', JSON.stringify(logEntries));
        }

        // Add Toast
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = `<i class="fa-solid fa-check text-violet-500"></i>`;
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
                showToast('Harap tambahkan minimal 1 item crosscut!', 'error');
                return;
            }

            // Validate all items
            for (let i = 0; i < currentFormItems.length; i++) {
                const item = currentFormItems[i];
                if (!item.sumber || isNaN(item.volume) || item.volume <= 0) {
                    showToast(`Lengkapi semua data Item #${i + 1} (Sumber/Keterangan dan Volume)!`, 'error');
                    return;
                }
            }

            // Map UI items to standard schema
            const transactionItems = currentFormItems.map(item => ({
                sumber: item.sumber,
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
                    showToast('Berhasil memperbarui data penerimaan crosscut!', 'success');
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
                showToast(`Berhasil menyimpan ${currentFormItems.length} item penerimaan crosscut!`, 'success');
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
                showToast('Data penerimaan crosscut berhasil dihapus.', 'success');
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

            let totalVolume = 0;
            if (entry.items && Array.isArray(entry.items)) {
                entry.items.forEach((item, idx) => {
                    totalVolume += item.volume || 0.0;

                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-zinc-50/80 transition-colors';
                    tr.innerHTML = `
                        <td class="py-2.5 px-3 text-center font-semibold text-zinc-400">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-bold text-zinc-800">${item.sumber}</td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-violet-700">${item.volume.toFixed(2)} m³</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('detail-total-items').innerText = (entry.items ? entry.items.length : 0);
            document.getElementById('detail-total-volume').innerText = totalVolume.toFixed(2);
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
            headerTitle.innerText = "Ubah Penerimaan Crosscut";
            headerSubtitle.innerHTML = "Operasional &nbsp;·&nbsp; Penerimaan &nbsp;·&nbsp; Ubah Log";
            formTitle.innerText = "Ubah Penerimaan Crosscut";
            formSubtitle.innerText = "Edit data pengiriman crosscut per surat jalan dengan multi-item";

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
            let totalVolume = 0;
            let transactionCount = logEntries.length;
            let bulanIniVolume = 0;

            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

            logEntries.forEach(entry => {
                let entryVolume = 0;
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        entryVolume += (item.volume || 0.0);
                    });
                }
                totalVolume += entryVolume;

                if (entry.tanggal && entry.tanggal.substring(0, 7) === currentMonth) {
                    bulanIniVolume += entryVolume;
                }
            });

            document.getElementById('stat-total-volume').innerText = totalVolume.toFixed(2);
            document.getElementById('stat-transaksi-count').innerText = transactionCount;
            document.getElementById('stat-bulan-ini').innerText = `${bulanIniVolume.toFixed(2)} m³`;
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
                        (item.sumber && item.sumber.toLowerCase().includes(searchQuery)) ||
                        (item.volume && item.volume.toString().includes(searchQuery))
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
                
                let totalVolume = 0;
                let rincianHTML = '<div class="flex flex-wrap gap-1.5 justify-start">';
                if (entry.items && Array.isArray(entry.items)) {
                    entry.items.forEach(item => {
                        totalVolume += (item.volume || 0.0);
                        
                        rincianHTML += `
                            <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border text-violet-700 bg-violet-50 border-violet-100/50">
                                ${item.sumber}: ${item.volume.toFixed(2)} m³
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
                    <td class="py-3.5 px-4 text-right font-extrabold text-violet-700">${totalVolume.toFixed(2)} m³</td>
                    <td class="py-3.5 px-4 text-zinc-500 truncate max-w-[150px]" title="${entry.catatan || ''}">${entry.catatan || '-'}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="showDetail(${entry.id})" class="p-1.5 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="editEntry(${entry.id})" class="p-1.5 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Ubah">
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