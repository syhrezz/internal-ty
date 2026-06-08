// State variables
        let outputs = [];
        let filteredOutputs = [];
        let selectedDateFilter = 'All';
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let typeFilter = '';
        let currentPage = 1;
        const rowsPerPage = 10;
        let selectedDetailId = '';

        window.addEventListener('DOMContentLoaded', () => {
            const savedOutputs = localStorage.getItem('woodtrack_hasil_produksi_logs');
            if (savedOutputs) {
                outputs = JSON.parse(savedOutputs);
                if (outputs.length === 0) {
                    outputs = getSeedOutputs();
                    saveToLocalStorage();
                }
            } else {
                outputs = getSeedOutputs();
                saveToLocalStorage();
            }

            updateDashboardStats();
            applyFiltersAndRender();
        });

        function getSeedOutputs() {
            return [
                {
                    id: 'OUT-20260601-01',
                    tanggal: '2026-06-01',
                    tipe: 'Barang Jadi',
                    nama: 'Kusen Pintu Jati',
                    jumlah: 10,
                    keterangan: 'Rakit Selesai - Shift Sore'
                },
                {
                    id: 'OUT-20260602-02',
                    tanggal: '2026-06-02',
                    tipe: 'Setengah Jadi',
                    nama: 'Frame Papan Kayu Meranti',
                    jumlah: 25,
                    keterangan: 'Potongan kasar terpasang'
                },
                {
                    id: 'OUT-20260603-03',
                    tanggal: '2026-06-03',
                    tipe: 'Barang Jadi',
                    nama: 'Pintu Kaca Minimalis Jati',
                    jumlah: 5,
                    keterangan: 'Sudah dihaluskan & kaca terpasang'
                }
            ];
        }

        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_hasil_produksi_logs', JSON.stringify(outputs));
        }

        function updateDashboardStats() {
            let outputsToday = 0;
            let finishedTotal = 0;
            let halfFinishedTotal = 0;
            let uniqueProductsSet = new Set();

            const todayStr = new Date().toISOString().split('T')[0];

            outputs.forEach(o => {
                if (o.tanggal === todayStr) {
                    outputsToday++;
                }

                if (o.tipe === 'Barang Jadi') {
                    finishedTotal += parseInt(o.jumlah) || 0;
                } else if (o.tipe === 'Setengah Jadi') {
                    halfFinishedTotal += parseInt(o.jumlah) || 0;
                }

                if (o.nama) {
                    uniqueProductsSet.add(o.nama.trim().toLowerCase());
                }
            });

            document.getElementById('stat-outputs-today').innerText = outputsToday + ' Entry';
            document.getElementById('stat-finished-total').innerText = finishedTotal + ' unit';
            document.getElementById('stat-half-finished-total').innerText = halfFinishedTotal + ' unit';
            document.getElementById('stat-unique-products').innerText = uniqueProductsSet.size + ' Jenis';
        }

        // Master Data Products definition
        const MASTER_PRODUCTS = [
            { name: 'Pintu Jati Klasik', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PJT-001' },
            { name: 'Pintu Kaca Minimalis Jati', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PKM-002' },
            { name: 'Kusen Kayu Meranti', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=80&auto=format&fit=crop&q=60', sku: 'SKU-KKM-003' },
            { name: 'Frame Papan Kayu Meranti', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=80&auto=format&fit=crop&q=60', sku: 'SKU-FPK-004' },
            { name: 'Daun Jendela Sengon', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=80&auto=format&fit=crop&q=60', sku: 'SKU-DJS-005' }
        ];

        // Searchable Dropdown events
        function showProductDropdown() {
            const dropdown = document.getElementById('product-dropdown');
            dropdown.classList.remove('hidden');
            renderProductDropdownList(MASTER_PRODUCTS);
        }

        function hideProductDropdown() {
            setTimeout(() => {
                document.getElementById('product-dropdown').classList.add('hidden');
            }, 200);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.getElementById('out-nama-input');
            const dropdown = document.getElementById('product-dropdown');
            if (container && dropdown && !container.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        function renderProductDropdownList(items) {
            const dropdown = document.getElementById('product-dropdown');
            dropdown.innerHTML = '';
            
            if (items.length === 0) {
                dropdown.innerHTML = '<div class="p-3 text-xs text-zinc-400 text-center">Produk tidak ditemukan</div>';
                return;
            }

            items.forEach(prod => {
                const skuText = prod.sku ? `SKU: ${prod.sku}` : 'Tanpa SKU';
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex items-center gap-3 p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors';
                itemDiv.onclick = () => selectProduct(prod);
                itemDiv.innerHTML = `
                    <img src="${prod.image}" class="w-10 h-10 object-cover rounded-lg border border-zinc-100 shadow-sm" alt="${prod.name}">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-zinc-800 truncate">${prod.name}</p>
                        <span class="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-md border bg-zinc-100 text-zinc-500 border-zinc-200">${skuText}</span>
                    </div>
                `;
                dropdown.appendChild(itemDiv);
            });
        }

        function filterProductDropdown(val) {
            const query = val.toLowerCase().trim();
            const filtered = MASTER_PRODUCTS.filter(p => 
                p.name.toLowerCase().includes(query) || 
                (p.sku && p.sku.toLowerCase().includes(query))
            );
            renderProductDropdownList(filtered);
            
            // Allow manual text typing as fallback
            document.getElementById('out-nama').value = val;
            const clearBtn = document.getElementById('clear-product-btn');
            if (val) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');

            // Hide preview card since user is typing
            const previewCard = document.getElementById('selected-product-preview');
            if (previewCard) {
                previewCard.classList.add('hidden');
            }
        }

        function selectProduct(prod) {
            document.getElementById('out-nama-input').value = prod.name;
            document.getElementById('out-nama').value = prod.name;
            
            // Show preview card and populate elements
            const previewCard = document.getElementById('selected-product-preview');
            const previewImg = document.getElementById('selected-product-img');
            const previewName = document.getElementById('selected-product-name');
            const previewSku = document.getElementById('selected-product-sku');
            if (previewCard && previewImg && previewName) {
                previewImg.src = prod.image || '';
                previewName.innerText = prod.name;
                if (previewSku) {
                    previewSku.innerText = prod.sku ? `SKU: ${prod.sku}` : 'Tanpa SKU';
                }
                previewCard.classList.remove('hidden');
            }

            document.getElementById('clear-product-btn').classList.remove('hidden');
            document.getElementById('product-dropdown').classList.add('hidden');
        }

        function clearProductSelection() {
            document.getElementById('out-nama-input').value = '';
            document.getElementById('out-nama').value = '';
            document.getElementById('clear-product-btn').classList.add('hidden');

            // Hide preview card
            const previewCard = document.getElementById('selected-product-preview');
            if (previewCard) {
                previewCard.classList.add('hidden');
            }
        }

        // View switcher
        function openOutputModal() {
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('form-view').classList.remove('hidden');

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('out-tanggal').value = today;
            document.getElementById('out-type').value = 'Barang Jadi';
            document.getElementById('out-nama').value = '';
            document.getElementById('out-nama-input').value = '';
            document.getElementById('out-jumlah').value = '';
            document.getElementById('out-keterangan').value = '';
            document.getElementById('clear-product-btn').classList.add('hidden');

            // Clear product preview card
            const previewCard = document.getElementById('selected-product-preview');
            if (previewCard) {
                previewCard.classList.add('hidden');
            }
        }

        function closeOutputModal() {
            document.getElementById('dashboard-view').classList.remove('hidden');
            document.getElementById('form-view').classList.add('hidden');
        }

        // Lightbox functions
        function previewSelectedImage() {
            const imgEl = document.getElementById('selected-product-img');
            const lightbox = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');
            if (imgEl && imgEl.src && lightbox && lightboxImg) {
                lightboxImg.src = imgEl.src;
                lightbox.classList.remove('hidden');
                setTimeout(() => {
                    const relativeDiv = lightbox.querySelector('.relative');
                    if (relativeDiv) {
                        relativeDiv.classList.remove('scale-95');
                        relativeDiv.classList.add('scale-100');
                    }
                }, 10);
            }
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox-modal');
            if (lightbox) {
                const relativeDiv = lightbox.querySelector('.relative');
                if (relativeDiv) {
                    relativeDiv.classList.remove('scale-100');
                    relativeDiv.classList.add('scale-95');
                }
                setTimeout(() => {
                    lightbox.classList.add('hidden');
                }, 150);
            }
        }

        function saveProductionOutput() {
            const tanggal = document.getElementById('out-tanggal').value;
            const tipe = document.getElementById('out-type').value;
            const nama = document.getElementById('out-nama').value.trim();
            const jumlah = parseInt(document.getElementById('out-jumlah').value) || 0;
            const keterangan = document.getElementById('out-keterangan').value.trim();

            if (!tanggal || !nama || jumlah <= 0) {
                showToast('Lengkapi semua field bertanda * dengan benar!', 'error');
                return;
            }

            const cleanDate = tanggal.replace(/-/g, '');
            const rand = Math.floor(10 + Math.random() * 90);
            const id = `OUT-${cleanDate}-${rand}`;

            const newLog = {
                id,
                tanggal,
                tipe,
                nama,
                jumlah,
                keterangan: keterangan || '-'
            };

            outputs.unshift(newLog);
            saveToLocalStorage();
            closeOutputModal();
            showToast('Hasil produksi berhasil direkam!');
            updateDashboardStats();
            applyFiltersAndRender();
        }

        function changeToFinishedProduct(id) {
            const o = outputs.find(item => item.id === id);
            if (!o) return;
            o.tipe = 'Barang Jadi';
            o.keterangan = o.keterangan === '-' ? 'Dirakit ke Barang Jadi' : o.keterangan + ' (Dirakit ke Barang Jadi)';
            saveToLocalStorage();
            showToast(`Status '${o.name}' berhasil diubah ke Barang Jadi!`);
            updateDashboardStats();
            applyFiltersAndRender();
        }

        function deleteOutput(id) {
            if (!confirm('Apakah Anda yakin ingin menghapus data hasil produksi ini?')) return;
            outputs = outputs.filter(o => o.id !== id);
            saveToLocalStorage();
            showToast('Hasil produksi berhasil dihapus!');
            updateDashboardStats();
            applyFiltersAndRender();
            
            // If the deleted output is currently viewed in detail page, close the detail page
            if (selectedDetailId === id) {
                closeDetailView();
            }
        }

        // Details page implementation functions
        function openDetailView(id) {
            selectedDetailId = id;
            const o = outputs.find(item => item.id === id);
            if (!o) return;

            document.getElementById('detail-id').innerText = o.id;
            document.getElementById('detail-nama').innerText = o.nama;
            document.getElementById('detail-jumlah').innerText = o.jumlah + ' unit';
            document.getElementById('detail-tanggal').innerText = formatIndoDate(o.tanggal);
            document.getElementById('detail-keterangan').innerText = o.keterangan || '-';

            // Find matching product image from MASTER_PRODUCTS
            const prod = MASTER_PRODUCTS.find(p => p.name.trim().toLowerCase() === o.nama.trim().toLowerCase());
            const detailImg = document.getElementById('detail-image');
            if (detailImg) {
                detailImg.src = (prod && prod.image) ? prod.image : 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&auto=format&fit=crop&q=60';
            }

            // Render type badge
            const typeBadge = document.getElementById('detail-tipe-badge');
            if (typeBadge) {
                typeBadge.innerText = o.tipe;
                if (o.tipe === 'Barang Jadi') {
                    typeBadge.className = 'inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200';
                    document.getElementById('detail-action-panel').classList.add('hidden');
                    document.getElementById('detail-completed-panel').classList.remove('hidden');
                } else {
                    typeBadge.className = 'inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-200';
                    document.getElementById('detail-action-panel').classList.remove('hidden');
                    document.getElementById('detail-completed-panel').classList.add('hidden');
                }
            }

            // Toggle views
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('form-view').classList.add('hidden');
            document.getElementById('detail-view').classList.remove('hidden');
        }

        function closeDetailView() {
            selectedDetailId = '';
            document.getElementById('detail-view').classList.add('hidden');
            document.getElementById('dashboard-view').classList.remove('hidden');
        }

        function deleteOutputFromDetail() {
            if (selectedDetailId) {
                deleteOutput(selectedDetailId);
            }
        }

        function triggerUpgradeConfirmation() {
            const modal = document.getElementById('confirm-upgrade-modal');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => {
                    const relativeDiv = modal.querySelector('.relative');
                    if (relativeDiv) {
                        relativeDiv.classList.remove('scale-95');
                        relativeDiv.classList.add('scale-100');
                    }
                }, 10);
            }
        }

        function closeUpgradeConfirmation() {
            const modal = document.getElementById('confirm-upgrade-modal');
            if (modal) {
                const relativeDiv = modal.querySelector('.relative');
                if (relativeDiv) {
                    relativeDiv.classList.remove('scale-100');
                    relativeDiv.classList.add('scale-95');
                }
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 150);
            }
        }

        function confirmUpgradeStatus() {
            if (selectedDetailId) {
                changeToFinishedProduct(selectedDetailId);
                closeUpgradeConfirmation();
                openDetailView(selectedDetailId); // refresh detail page contents & state
            }
        }

        function previewDetailImage() {
            const imgEl = document.getElementById('detail-image');
            const lightbox = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');
            if (imgEl && imgEl.src && lightbox && lightboxImg) {
                lightboxImg.src = imgEl.src;
                lightbox.classList.remove('hidden');
                setTimeout(() => {
                    const relativeDiv = lightbox.querySelector('.relative');
                    if (relativeDiv) {
                        relativeDiv.classList.remove('scale-95');
                        relativeDiv.classList.add('scale-100');
                    }
                }, 10);
            }
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
            typeFilter = document.getElementById('filter-type').value;

            filteredOutputs = outputs.filter(o => {
                const matchesSearch = o.nama.toLowerCase().includes(searchQuery) ||
                                       o.keterangan.toLowerCase().includes(searchQuery);

                if (!matchesSearch) return false;

                if (typeFilter && o.tipe !== typeFilter) return false;

                if (selectedDateFilter === 'All') return true;

                const rDate = new Date(o.tanggal);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (selectedDateFilter === 'Today') {
                    const rDateStr = o.tanggal;
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
                        return o.tanggal === customStartDate;
                    }
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredOutputs.length === 0) {
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
            const endIndex = Math.min(startIndex + rowsPerPage, filteredOutputs.length);
            const pageData = filteredOutputs.slice(startIndex, endIndex);

            pageData.forEach((o, idx) => {
                const rowNo = startIndex + idx + 1;
                
                const typeColor = o.tipe === 'Barang Jadi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                const typeBadge = `<span class="inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border ${typeColor}">${o.tipe}</span>`;

                const actionBtns = `
                    <button onclick="openDetailView('${o.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Lihat Detail">
                        <i class="fa-solid fa-eye  text-xs"></i>
                    </button>
                `;

                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${formatIndoDate(o.tanggal)}</td>
                    <td class="py-3.5 px-4">${typeBadge}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${o.nama}</td>
                    <td class="py-3.5 px-4 text-right font-bold text-zinc-800 text-[14px]">${o.jumlah} unit</td>
                    <td class="py-3.5 px-4 text-zinc-500 font-medium">${o.keterangan}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            ${actionBtns}
                            <button onclick="deleteOutput('${o.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredOutputs.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredOutputs.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredOutputs.length) {
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