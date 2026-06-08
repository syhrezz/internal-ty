// State variables
        let sales = [];
        let filteredSales = [];
        let productionLogs = [];
        let selectedDateFilter = 'All';
        let customStartDate = '';
        let customEndDate = '';
        let searchQuery = '';
        let productFilter = '';
        let currentPage = 1;
        const rowsPerPage = 10;
        let selectedDetailId = '';
        let activeStockLimit = 0;

        // Master Data Products definition
        const MASTER_PRODUCTS = [
            { name: 'Pintu Jati Klasik', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PJT-001' },
            { name: 'Pintu Kaca Minimalis Jati', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&auto=format&fit=crop&q=60', sku: 'SKU-PKM-002' },
            { name: 'Kusen Kayu Meranti', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=80&auto=format&fit=crop&q=60', sku: 'SKU-KKM-003' },
            { name: 'Frame Papan Kayu Meranti', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=80&auto=format&fit=crop&q=60', sku: 'SKU-FPK-004' },
            { name: 'Daun Jendela Sengon', image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=80&auto=format&fit=crop&q=60', sku: 'SKU-DJS-005' }
        ];

        window.addEventListener('DOMContentLoaded', () => {
            // Load production outputs to determine initial stock pool
            loadProductionLogs();

            // Load sales logs
            const savedSales = localStorage.getItem('woodtrack_penjualan_produk');
            if (savedSales) {
                sales = JSON.parse(savedSales);
            } else {
                sales = getSeedSales();
                saveToLocalStorage();
            }

            // Populate filters
            populateProductFilter();

            // Initialize views
            updateDashboardStats();
            applyFiltersAndRender();
        });

        function loadProductionLogs() {
            const savedProduction = localStorage.getItem('woodtrack_hasil_produksi_logs');
            if (savedProduction) {
                productionLogs = JSON.parse(savedProduction);
            } else {
                // Default seed production logs
                productionLogs = [
                    { id: 'OUT-20260601-01', tanggal: '2026-06-01', tipe: 'Barang Jadi', nama: 'Kusen Kayu Meranti', jumlah: 15, keterangan: 'Rakit Selesai - Shift Sore' },
                    { id: 'OUT-20260602-02', tanggal: '2026-06-02', tipe: 'Setengah Jadi', nama: 'Frame Papan Kayu Meranti', jumlah: 25, keterangan: 'Potongan kasar terpasang' },
                    { id: 'OUT-20260603-03', tanggal: '2026-06-03', tipe: 'Barang Jadi', nama: 'Pintu Kaca Minimalis Jati', jumlah: 8, keterangan: 'Sudah dihaluskan & kaca terpasang' },
                    { id: 'OUT-20260603-04', tanggal: '2026-06-03', tipe: 'Barang Jadi', nama: 'Pintu Jati Klasik', jumlah: 12, keterangan: 'Selesai Finishing melamine' }
                ];
                localStorage.setItem('woodtrack_hasil_produksi_logs', JSON.stringify(productionLogs));
            }
        }

        function getSeedSales() {
            return [
                {
                    id: 'INV-20260603-01',
                    tanggal: '2026-06-03',
                    buyer: 'PD. Harapan Jaya',
                    nama: 'Pintu Jati Klasik',
                    jumlah: 3,
                    keterangan: 'Ambil langsung di pabrik'
                },
                {
                    id: 'INV-20260604-01',
                    tanggal: '2026-06-04',
                    buyer: 'Bpk. Hendra Wijaya',
                    nama: 'Pintu Kaca Minimalis Jati',
                    jumlah: 2,
                    keterangan: 'Kirim via ekspedisi pickup'
                }
            ];
        }

        function saveToLocalStorage() {
            localStorage.setItem('woodtrack_penjualan_produk', JSON.stringify(sales));
        }

        // Calculate current stock dynamically
        function calculateProductStock(productName) {
            // Produced (Barang Jadi only)
            let totalProduced = 0;
            productionLogs.forEach(p => {
                if (p.nama === productName && p.tipe === 'Barang Jadi') {
                    totalProduced += parseInt(p.jumlah) || 0;
                }
            });

            // Sold (All recorded sales)
            let totalSold = 0;
            sales.forEach(s => {
                if (s.nama === productName) {
                    totalSold += parseInt(s.jumlah) || 0;
                }
            });

            return Math.max(0, totalProduced - totalSold);
        }

        function populateProductFilter() {
            const filterEl = document.getElementById('filter-product');
            filterEl.innerHTML = '<option value="">Semua Produk</option>';
            MASTER_PRODUCTS.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.name;
                opt.innerText = p.name;
                filterEl.appendChild(opt);
            });
        }

        function updateDashboardStats() {
            const todayStr = new Date().toISOString().split('T')[0];
            let soldToday = 0;
            let totalSold = 0;
            let transactionCount = sales.length;

            sales.forEach(s => {
                totalSold += parseInt(s.jumlah) || 0;
                if (s.tanggal === todayStr) {
                    soldToday += parseInt(s.jumlah) || 0;
                }
            });

            // Calculate overall remaining stock across all products
            let overallRemaining = 0;
            MASTER_PRODUCTS.forEach(p => {
                overallRemaining += calculateProductStock(p.name);
            });

            document.getElementById('stat-sales-count').innerText = transactionCount + ' Transaksi';
            document.getElementById('stat-sold-units').innerText = totalSold + ' unit';
            document.getElementById('stat-sold-today').innerText = soldToday + ' unit';
            document.getElementById('stat-remaining-stock').innerText = overallRemaining + ' unit';
        }

        // Searchable Dropdown events
        function showProductDropdown() {
            const dropdown = document.getElementById('product-dropdown');
            dropdown.classList.remove('hidden');
            renderProductDropdownList(MASTER_PRODUCTS);
        }

        function renderProductDropdownList(items) {
            const dropdown = document.getElementById('product-dropdown');
            dropdown.innerHTML = '';
            
            if (items.length === 0) {
                dropdown.innerHTML = '<div class="p-3 text-xs text-zinc-400 text-center">Produk tidak ditemukan</div>';
                return;
            }

            items.forEach(prod => {
                const currentStock = calculateProductStock(prod.name);
                const itemDiv = document.createElement('div');
                itemDiv.className = `flex items-center gap-3 p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors ${currentStock === 0 ? 'opacity-65' : ''}`;
                itemDiv.onclick = () => selectProduct(prod);
                itemDiv.innerHTML = `
                    <img src="${prod.image}" class="w-10 h-10 object-cover rounded-lg border border-zinc-100 shadow-sm" alt="${prod.name}">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-zinc-800 truncate">${prod.name}</p>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded border bg-zinc-50 text-zinc-500 border-zinc-200">${prod.sku || 'Tanpa SKU'}</span>
                            <span class="text-[9px] font-bold ${currentStock > 0 ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'} px-1.5 py-0.5 rounded">Stok: ${currentStock}</span>
                        </div>
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
            
            document.getElementById('sales-nama').value = val;
            const clearBtn = document.getElementById('clear-product-btn');
            if (val) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');

            const previewCard = document.getElementById('selected-product-preview');
            if (previewCard) previewCard.classList.add('hidden');

            activeStockLimit = 0;
            document.getElementById('helper-stock').innerText = 'Pilih produk terlebih dahulu';
            document.getElementById('helper-stock').className = 'text-[10px] font-bold text-zinc-400';
            validateQtyInput(document.getElementById('sales-jumlah').value);
        }

        function selectProduct(prod) {
            document.getElementById('sales-nama-input').value = prod.name;
            document.getElementById('sales-nama').value = prod.name;
            
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

            const currentStock = calculateProductStock(prod.name);
            activeStockLimit = currentStock;

            const helperStock = document.getElementById('helper-stock');
            helperStock.innerText = `Stok tersedia: ${currentStock} unit`;
            if (currentStock > 0) {
                helperStock.className = 'text-[10px] font-bold text-emerald-600';
            } else {
                helperStock.className = 'text-[10px] font-bold text-rose-500';
            }

            document.getElementById('clear-product-btn').classList.remove('hidden');
            document.getElementById('product-dropdown').classList.add('hidden');

            validateQtyInput(document.getElementById('sales-jumlah').value);
        }

        function clearProductSelection() {
            document.getElementById('sales-nama-input').value = '';
            document.getElementById('sales-nama').value = '';
            document.getElementById('clear-product-btn').classList.add('hidden');

            const previewCard = document.getElementById('selected-product-preview');
            if (previewCard) previewCard.classList.add('hidden');

            activeStockLimit = 0;
            document.getElementById('helper-stock').innerText = 'Pilih produk terlebih dahulu';
            document.getElementById('helper-stock').className = 'text-[10px] font-bold text-zinc-400';
            validateQtyInput(document.getElementById('sales-jumlah').value);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const container = document.getElementById('sales-nama-input');
            const dropdown = document.getElementById('product-dropdown');
            if (container && dropdown && !container.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        function validateQtyInput(val) {
            const qty = parseInt(val) || 0;
            const errorEl = document.getElementById('qty-error');
            const saveBtn = document.getElementById('save-sales-btn');
            const productName = document.getElementById('sales-nama').value;

            if (!productName) {
                errorEl.classList.add('hidden');
                saveBtn.disabled = false;
                return;
            }

            if (qty <= 0) {
                errorEl.innerText = 'Jumlah unit harus lebih besar dari 0';
                errorEl.classList.remove('hidden');
                saveBtn.disabled = true;
                return;
            }

            if (qty > activeStockLimit) {
                errorEl.innerText = `Stok tidak mencukupi! Maksimum penjualan: ${activeStockLimit} unit`;
                errorEl.classList.remove('hidden');
                saveBtn.disabled = true;
            } else {
                errorEl.classList.add('hidden');
                saveBtn.disabled = false;
            }
        }

        // View toggle helpers
        function openFormModal() {
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('form-view').classList.remove('hidden');

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('sales-tanggal').value = today;
            document.getElementById('sales-buyer').value = '';
            document.getElementById('sales-nama').value = '';
            document.getElementById('sales-nama-input').value = '';
            document.getElementById('sales-jumlah').value = '';
            document.getElementById('sales-keterangan').value = '';
            clearProductSelection();
        }

        function closeFormModal() {
            document.getElementById('dashboard-view').classList.remove('hidden');
            document.getElementById('form-view').classList.add('hidden');
        }

        function openDetailView(id) {
            selectedDetailId = id;
            const sale = sales.find(item => item.id === id);
            if (!sale) return;

            document.getElementById('detail-id').innerText = sale.id;
            document.getElementById('detail-buyer').innerText = sale.buyer;
            document.getElementById('detail-nama').innerText = sale.nama;
            document.getElementById('detail-jumlah').innerText = sale.jumlah + ' unit';
            document.getElementById('detail-tanggal').innerText = formatIndoDate(sale.tanggal);
            document.getElementById('detail-keterangan').innerText = sale.keterangan || '-';

            // Find matching product image from MASTER_PRODUCTS
            const prod = MASTER_PRODUCTS.find(p => p.name.trim().toLowerCase() === sale.nama.trim().toLowerCase());
            const detailImg = document.getElementById('detail-image');
            if (detailImg) {
                detailImg.src = (prod && prod.image) ? prod.image : 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&auto=format&fit=crop&q=60';
            }

            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('form-view').classList.add('hidden');
            document.getElementById('detail-view').classList.remove('hidden');
        }

        function closeDetailView() {
            selectedDetailId = '';
            document.getElementById('detail-view').classList.add('hidden');
            document.getElementById('dashboard-view').classList.remove('hidden');
        }

        function saveSalesRecord() {
            const tanggal = document.getElementById('sales-tanggal').value;
            const buyer = document.getElementById('sales-buyer').value.trim();
            const nama = document.getElementById('sales-nama').value.trim();
            const jumlah = parseInt(document.getElementById('sales-jumlah').value) || 0;
            const keterangan = document.getElementById('sales-keterangan').value.trim();

            if (!tanggal || !buyer || !nama || jumlah <= 0) {
                showToast('Lengkapi semua field bertanda * dengan benar!', 'error');
                return;
            }

            if (jumlah > activeStockLimit) {
                showToast('Jumlah melebihi stok yang tersedia!', 'error');
                return;
            }

            const cleanDate = tanggal.replace(/-/g, '');
            const rand = Math.floor(10 + Math.random() * 90);
            const id = `INV-${cleanDate}-${rand}`;

            const newSale = {
                id,
                tanggal,
                buyer,
                nama,
                jumlah,
                keterangan: keterangan || '-'
            };

            sales.unshift(newSale);
            saveToLocalStorage();
            closeFormModal();
            showToast('Transaksi penjualan berhasil direkam!');
            updateDashboardStats();
            applyFiltersAndRender();
        }

        function deleteSalesRecord(id) {
            if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus transaksi penjualan ini? Tindakan ini akan mengembalikan stok produk.')) return;
            
            sales = sales.filter(s => s.id !== id);
            saveToLocalStorage();
            showToast('Transaksi penjualan berhasil dibatalkan & stok dipulihkan.');
            updateDashboardStats();
            applyFiltersAndRender();

            if (selectedDetailId === id) {
                closeDetailView();
            }
        }

        function deleteSalesFromDetail() {
            if (selectedDetailId) {
                deleteSalesRecord(selectedDetailId);
            }
        }

        // Image zooming & preview lightbox
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

        // Filter and Search Actions
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
            productFilter = document.getElementById('filter-product').value;

            filteredSales = sales.filter(s => {
                const matchesSearch = s.buyer.toLowerCase().includes(searchQuery) ||
                                       s.nama.toLowerCase().includes(searchQuery) ||
                                       s.id.toLowerCase().includes(searchQuery);

                if (!matchesSearch) return false;

                if (productFilter && s.nama !== productFilter) return false;

                if (selectedDateFilter === 'All') return true;

                const sDate = new Date(s.tanggal);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (selectedDateFilter === 'Today') {
                    return s.tanggal === today.toISOString().split('T')[0];
                }

                if (selectedDateFilter === 'Week') {
                    const dayOfWeek = today.getDay();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    return sDate >= startOfWeek;
                }

                if (selectedDateFilter === 'Custom') {
                    if (!customStartDate) return true;
                    const start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                    if (customEndDate) {
                        const end = new Date(customEndDate);
                        end.setHours(23,59,59,999);
                        return sDate >= start && sDate <= end;
                    } else {
                        return s.tanggal === customStartDate;
                    }
                }

                return true;
            });
        }

        function renderTable() {
            const tableBody = document.getElementById('table-body');
            const emptyState = document.getElementById('table-empty');

            if (filteredSales.length === 0) {
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
            const endIndex = Math.min(startIndex + rowsPerPage, filteredSales.length);
            const pageData = filteredSales.slice(startIndex, endIndex);

            pageData.forEach((s, idx) => {
                const rowNo = startIndex + idx + 1;
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3.5 px-4 text-center text-zinc-400 font-bold">${rowNo}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${formatIndoDate(s.tanggal)}</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-zinc-600">${s.id}</td>
                    <td class="py-3.5 px-4 font-semibold text-zinc-800">${s.buyer}</td>
                    <td class="py-3.5 px-4 font-bold text-zinc-800">${s.nama}</td>
                    <td class="py-3.5 px-4 text-right font-bold text-indigo-600 text-[14px]">${s.jumlah} unit</td>
                    <td class="py-3.5 px-4 text-zinc-500 font-medium">${s.keterangan}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openDetailView('${s.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Lihat Detail">
                                <i class="fa-solid fa-eye  text-xs"></i>
                            </button>
                            <button onclick="deleteSalesRecord('${s.id}')" class="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Batalkan Penjualan">
                                <i class="fa-solid fa-trash-can  text-[13px]"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.getElementById('table-pagination-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredSales.length} entries`;
            document.getElementById('btn-prev').disabled = currentPage === 1;
            document.getElementById('btn-next').disabled = endIndex >= filteredSales.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if (currentPage * rowsPerPage < filteredSales.length) {
                currentPage++;
                renderTable();
            }
        }

        // Utility formatting
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