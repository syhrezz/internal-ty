// State variables
        let requests = [];
        let filteredRequests = [];
        let activeMaterials = []; // Current new request's materials selection
        let selectedDateFilter = 'All';
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let statusFilter = '';
        let currentPage = 1;
        const rowsPerPage = 10;

        // Inventory Stock Pool loaded from localStorage
        let logsStock = {};
        let sawtimberStock = {};
        let glassStock = {};
        let crosscutStock = {};

        window.addEventListener('DOMContentLoaded', () => {
            // Load production data
            const savedRequests = localStorage.getItem('woodtrack_produksi_requests');
            if (savedRequests) {
                requests = JSON.parse(savedRequests);
                if (requests.length === 0) {
                    requests = getSeedRequests();
                    saveToLocalStorage();
                }
            } else {
                requests = getSeedRequests();
                saveToLocalStorage();
            }

            // Sync database inventory stock
            loadInventoryStock();
            updateDashboardStats();
            applyFiltersAndRender();
        });

        function getSeedRequests() {
            return [
                {
                    id: 'REQ-20260601-001',
                    tanggal: '2026-06-01',
                    catatan: 'Produksi Papan Kering Jati batch A',
                    status: 'Diambil',
                    materials: [
                        { kategori: 'Log', spec: 'Jati - Grade A - Size A3', jumlah: 8 }
                    ],
                    outputs: []
                },
                {
                    id: 'REQ-20260602-002',
                    tanggal: '2026-06-02',
                    catatan: 'Rencana produksi pintu kaca minimalis',
                    status: 'Diambil',
                    materials: [
                        { kategori: 'Sawtimber', spec: 'Meranti - 5×15×200 - Grade A', jumlah: 25 },
                        { kategori: 'Kaca', spec: 'Clear 5mm - 122×244', jumlah: 10 }
                    ],
                    outputs: []
                },
                {
                    id: 'REQ-20260604-003',
                    tanggal: '2026-06-04',
                    catatan: 'Permintaan pick bahan baku darurat',
                    status: 'Diajukan',
                    materials: [
                        { kategori: 'Log', spec: 'Sengon - Grade B - Size A2', jumlah: 15 }
                    ],
                    outputs: []
                }
            ];
        }

        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_produksi_requests', JSON.stringify(requests));
        }

        function loadInventoryStock() {
            // Load logs stock
            logsStock = {};
            const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
            rawLogs.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = `${item.jenis} - Grade ${item.grade} - Size ${item.size}`;
                        logsStock[key] = (logsStock[key] || 0) + (parseInt(item.jumlah) || 0);
                    });
                }
            });

            // Load sawtimber stock
            sawtimberStock = {};
            const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
            rawSawtimber.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = `${item.jenis} - ${item.size} - Grade ${item.grade}`;
                        sawtimberStock[key] = (sawtimberStock[key] || 0) + (parseInt(item.jumlah) || 0);
                    });
                }
            });

            // Load glass stock
            glassStock = {};
            const rawGlass = JSON.parse(localStorage.getItem('woodtrack_penerimaan_kaca') || '[]');
            rawGlass.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = `${item.tipe} ${item.tebal}mm - ${item.dimensi}`;
                        glassStock[key] = (glassStock[key] || 0) + (parseInt(item.jumlah) || 0);
                    });
                }
            });

            // Load crosscut stock
            crosscutStock = {};
            const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');
            rawCrosscut.forEach(entry => {
                if (entry.items) {
                    entry.items.forEach(item => {
                        const key = item.sumber;
                        crosscutStock[key] = (crosscutStock[key] || 0) + (parseFloat(item.volume) || 0);
                    });
                }
            });
        }

        function updateDashboardStats() {
            let totalRequests = requests.length;
            let pickupsToday = 0;
            let logsPicked = 0;
            let sawtimberPicked = 0;

            const todayStr = new Date().toISOString().split('T')[0];

            requests.forEach(r => {
                if (r.tanggal === todayStr) {
                    pickupsToday++;
                }

                if (r.materials) {
                    r.materials.forEach(m => {
                        if (m.kategori === 'Log') {
                            logsPicked += parseInt(m.jumlah) || 0;
                        } else if (m.kategori === 'Sawtimber') {
                            sawtimberPicked += parseInt(m.jumlah) || 0;
                        }
                    });
                }
            });

            document.getElementById('stat-pending-pick').innerText = totalRequests + ' Request';
            document.getElementById('stat-pickups-today').innerText = pickupsToday + ' Pickup';
            document.getElementById('stat-logs-picked').innerText = logsPicked + ' pcs';
            document.getElementById('stat-sawtimber-picked').innerText = sawtimberPicked + ' pcs';
        }

        // View switcher
        function openRequestModal() {
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('form-view').classList.remove('hidden');
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('req-tanggal').value = today;
            document.getElementById('req-catatan').value = '';
            
            generateRequestId();
            activeMaterials = [];
            document.getElementById('material-rows-container').innerHTML = '';
            addMaterialRow();
        }

        function closeRequestModal() {
            document.getElementById('dashboard-view').classList.remove('hidden');
            document.getElementById('form-view').classList.add('hidden');
        }

        function generateRequestId() {
            const dateVal = document.getElementById('req-tanggal').value;
            if (!dateVal) return;
            const cleanDate = dateVal.replace(/-/g, '');
            const rand = Math.floor(100 + Math.random() * 900);
            document.getElementById('req-id').value = `REQ-${cleanDate}-${rand}`;
        }

        // Dynamic Material rows picker
        function addMaterialRow() {
            const tempId = (Date.now() + Math.random()).toString(36).substring(2, 9);
            
            const newRow = {
                tempId,
                kategori: '',
                spec: '',
                jumlah: 0
            };
            activeMaterials.push(newRow);

            const container = document.getElementById('material-rows-container');
            const rowDiv = document.createElement('div');
            rowDiv.id = `req-row-${tempId}`;
            rowDiv.className = 'grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 relative';

            rowDiv.innerHTML = `
                <div class="md:col-span-3 space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kategori Bahan *</label>
                    <select onchange="updateKategori('${tempId}', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer text-xs">
                        <option value="" disabled selected>Pilih Kategori...</option>
                        <option value="Log">Wood Log (Bulat)</option>
                        <option value="Sawtimber">Sawtimber (Papan)</option>
                        <option value="Crosscut">Crosscut (Sisa Belahan/Kupasan)</option>
                        <option value="Kaca">Kaca (Glass)</option>
                    </select>
                </div>
                <div class="md:col-span-5 space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pilih Material *</label>
                    <select id="spec-select-${tempId}" disabled onchange="updateMaterialField('${tempId}', 'spec', this.value)" class="premium-input bg-[#FDFDFD] cursor-pointer text-xs">
                        <option value="" disabled selected>Pilih Kategori Terlebih Dahulu...</option>
                    </select>
                </div>
                <div class="md:col-span-3 space-y-1.5">
                    <label class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Jumlah Diambil *</label>
                    <div class="flex gap-2">
                        <input type="number" oninput="updateMaterialField('${tempId}', 'jumlah', this.value)" placeholder="Kuantitas" min="1" class="premium-input text-xs">
                        <span id="stock-badge-${tempId}" class="px-2 py-2 bg-zinc-100 text-zinc-700 font-bold text-[10px] rounded-lg flex items-center justify-center whitespace-nowrap min-w-[70px]">Stok: -</span>
                    </div>
                </div>
                <div class="md:col-span-1 flex justify-end">
                    <button onclick="removeMaterialRow('${tempId}')" class="p-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" title="Hapus">
                        <i class="fa-solid fa-xmark  text-sm"></i>
                    </button>
                </div>
            `;
            container.appendChild(rowDiv);
        }

        function removeMaterialRow(tempId) {
            if (activeMaterials.length <= 1) {
                showToast('Minimal harus ada 1 material item!', 'error');
                return;
            }
            activeMaterials = activeMaterials.filter(r => r.tempId !== tempId);
            const el = document.getElementById(`req-row-${tempId}`);
            if (el) el.remove();
        }

        function updateKategori(tempId, kat) {
            const row = activeMaterials.find(r => r.tempId === tempId);
            if (!row) return;
            row.kategori = kat;
            row.spec = '';
            row.jumlah = 0;

            const specSelect = document.getElementById(`spec-select-${tempId}`);
            const stockBadge = document.getElementById(`stock-badge-${tempId}`);
            specSelect.disabled = false;
            specSelect.innerHTML = '<option value="" disabled selected>Pilih Spesifikasi...</option>';
            stockBadge.innerText = 'Stok: -';

            let pool = {};
            if (kat === 'Log') pool = logsStock;
            else if (kat === 'Sawtimber') pool = sawtimberStock;
            else if (kat === 'Crosscut') pool = crosscutStock;
            else if (kat === 'Kaca') pool = glassStock;

            Object.keys(pool).forEach(key => {
                const stock = pool[key];
                if (stock > 0) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.text = `${key} (Sedia: ${stock})`;
                    specSelect.appendChild(option);
                }
            });
        }

        function updateMaterialField(tempId, field, val) {
            const row = activeMaterials.find(r => r.tempId === tempId);
            if (!row) return;

            if (field === 'spec') {
                row.spec = val;
                const stockBadge = document.getElementById(`stock-badge-${tempId}`);
                let stock = 0;
                if (row.kategori === 'Log') stock = logsStock[val] || 0;
                else if (row.kategori === 'Sawtimber') stock = sawtimberStock[val] || 0;
                else if (row.kategori === 'Crosscut') stock = crosscutStock[val] || 0;
                else if (row.kategori === 'Kaca') stock = glassStock[val] || 0;
                
                if (row.kategori === 'Crosscut') {
                    stockBadge.innerText = `Stok: ${stock.toFixed(2)} m³`;
                } else {
                    stockBadge.innerText = `Stok: ${stock} pcs`;
                }
            } else if (field === 'jumlah') {
                row.jumlah = parseInt(val) || 0;
            }
        }

        function saveProductionRequest() {
            const reqId = document.getElementById('req-id').value;
            const tanggal = document.getElementById('req-tanggal').value;
            const catatan = document.getElementById('req-catatan').value.trim();

            if (!tanggal) {
                showToast('Lengkapi data Tanggal Request!', 'error');
                return;
            }

            for (let i = 0; i < activeMaterials.length; i++) {
                const r = activeMaterials[i];
                if (!r.kategori || !r.spec || r.jumlah <= 0) {
                    showToast(`Lengkapi item ke-${i+1} dengan benar!`, 'error');
                    return;
                }
                let limit = 0;
                if (r.kategori === 'Log') limit = logsStock[r.spec] || 0;
                else if (r.kategori === 'Sawtimber') limit = sawtimberStock[r.spec] || 0;
                else if (r.kategori === 'Crosscut') limit = crosscutStock[r.spec] || 0;
                else if (r.kategori === 'Kaca') limit = glassStock[r.spec] || 0;

                if (parseFloat(r.jumlah) > limit) {
                    showToast(`Jumlah untuk ${r.spec} melebihi stok yang tersedia (${r.kategori === 'Crosscut' ? limit.toFixed(2) + ' m³' : limit + ' pcs'})!`, 'error');
                    return;
                }
            }

            const newReq = {
                id: reqId,
                tanggal,
                catatan: catatan || 'Pengambilan bahan baku produksi',
                status: 'Diajukan',
                materials: activeMaterials.map(r => ({
                    kategori: r.kategori,
                    spec: r.spec,
                    jumlah: r.kategori === 'Crosscut' ? parseFloat(r.jumlah) || 0.0 : parseInt(r.jumlah) || 0
                })),
                outputs: []
            };

            requests.unshift(newReq);
            saveToLocalStorage();
            closeRequestModal();
            showToast('Request pick bahan baku berhasil direkam!');
            loadInventoryStock();
            updateDashboardStats();
            applyFiltersAndRender();
        }



        // Details Modal
        function openDetailModal(id) {
            const r = requests.find(req => req.id === id);
            if (!r) return;

            document.getElementById('detail-tanggal').innerText = formatIndoDate(r.tanggal);
            document.getElementById('detail-batch-id').innerText = r.id;
            document.getElementById('detail-catatan').innerText = r.catatan;

            const mBody = document.getElementById('detail-materials-body');
            mBody.innerHTML = '';
            r.materials.forEach(m => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-2.5 px-3"><span class="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold text-zinc-600">${m.kategori}</span></td>
                    <td class="py-2.5 px-3 font-semibold text-zinc-800">${m.spec}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-zinc-800">${m.jumlah} pcs</td>
                `;
                mBody.appendChild(tr);
            });

            const modal = document.getElementById('detail-modal');
            modal.classList.add('open');
        }

        function closeDetailModal() {
            document.getElementById('detail-modal').classList.remove('open');
        }

        function deleteRequest(id) {
            if (!confirm('Apakah Anda yakin ingin membatalkan & menghapus data batch request produksi ini?')) return;
            requests = requests.filter(r => r.id !== id);
            saveToLocalStorage();
            showToast('Batch request produksi berhasil dihapus!');
            loadInventoryStock();
            updateDashboardStats();
            applyFiltersAndRender();
        }

        // Filters and Formatting
        function setDateFilter(filter) {
            selectedDateFilter = filter;
            const pills = document.querySelectorAll('#date-filter-pills .filter-pill');
            pills.forEach(p => {
                if (p.innerText.includes(filter === 'All' ? 'Semua' : filter === 'Today' ? 'Hari Ini' : filter === 'Week' ? 'Minggu' : 'Pilih Tanggal')) {
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
            filteredRequests = requests.filter(r => {
                let materialsText = r.materials.map(m => m.spec).join(' ').toLowerCase();
                const matchesSearch = r.id.toLowerCase().includes(searchQuery) ||
                                       r.catatan.toLowerCase().includes(searchQuery) ||
                                       materialsText.includes(searchQuery);

                if (!matchesSearch) return false;



                if (selectedDateFilter === 'All') return true;

                const rDate = new Date(r.tanggal);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (selectedDateFilter === 'Today') {
                    const rDateStr = r.tanggal;
                    const todayStr = today.toISOString().split('T')[0];
                    return rDateStr === todayStr;
                }

                if (selectedDateFilter === 'Week') {
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    return rDate >= startOfWeek;
                }

                if (selectedDateFilter === 'Custom') {
                    if (!customStartDate) return true;
                    const start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                    if (customEndDate) {
                        const end = new Date(customEndDate);
                        end.setHours(23,59,59,999);
                        return rDate >= start && rDate <= end;
                    } else {
                        return r.tanggal === customStartDate;
                    }
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredRequests.length === 0) {
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
            const endIndex = Math.min(startIndex + rowsPerPage, filteredRequests.length);
            const pageData = filteredRequests.slice(startIndex, endIndex);

            pageData.forEach((r, idx) => {
                const rowNo = startIndex + idx + 1;

                let materialsHtml = r.materials.map(m => `
                    <div class="text-[12px] text-zinc-700 font-semibold flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        ${m.spec} <span class="text-zinc-400 font-bold">(${m.jumlah} pcs)</span>
                    </div>
                `).join('');

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${formatIndoDate(r.tanggal)}</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-amber-700 text-xs">${r.id}</td>
                    <td class="py-3.5 px-4 space-y-0.5">${materialsHtml}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openDetailModal('${r.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-all" title="Detail & History">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>

                            <button onclick="deleteRequest('${r.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredRequests.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredRequests.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredRequests.length) {
                currentPage++;
                renderTable();
            }
        }

        // Utils
        function formatIndoDate(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
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
                <span class="text-xs font-bold text-zinc-800">${message}</span>
            `;
            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('leaving');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3500);
        }