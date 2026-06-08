let wasteHistory = [];
        let availableMaterials = [];

        window.addEventListener('DOMContentLoaded', () => {
            const nav = document.querySelector('nav');
            if (nav && typeof window.getNav === 'function') {
                nav.innerHTML = window.getNav('waste-material');
            }

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('waste-date').value = today;

            loadWasteHistory();
            renderWasteTable();
        });

        function setView(view) {
            const hView = document.getElementById('history-view');
            const fView = document.getElementById('form-view');
            if (view === 'form') {
                hView.classList.add('hidden');
                fView.classList.remove('hidden');
                resetForm();
            } else {
                hView.classList.remove('hidden');
                fView.classList.add('hidden');
            }
        }

        function resetForm() {
            document.getElementById('waste-category').value = '';
            const itemSelect = document.getElementById('waste-material-item');
            itemSelect.innerHTML = `<option value="" disabled selected>Pilih Kategori Terlebih Dahulu...</option>`;
            itemSelect.disabled = true;
            document.getElementById('waste-qty').value = '';
            document.getElementById('waste-reason').value = '';
            document.getElementById('waste-details').value = '';
        }

        function loadWasteHistory() {
            const saved = localStorage.getItem('woodtrack_waste_material');
            if (saved) {
                wasteHistory = JSON.parse(saved);
            } else {
                wasteHistory = [
                    {
                        id: 1717478400000,
                        tanggal: '2026-06-03',
                        kategori: 'BahanBaku',
                        spec: 'Polos 5mm - 120x240',
                        jumlah: 4,
                        alasan: 'Pecah / Belah',
                        details: 'Pecah saat bongkar muat dari truk armada'
                    },
                    {
                        id: 1717392000000,
                        tanggal: '2026-06-02',
                        kategori: 'Log',
                        spec: 'Sengon - Grade B - A3',
                        jumlah: 2,
                        alasan: 'Busuk / Lapuk',
                        details: 'Menyusut lapuk di area penimbunan terbuka'
                    }
                ];
                localStorage.setItem('woodtrack_waste_material', JSON.stringify(wasteHistory));
            }
        }

        function renderWasteTable() {
            const body = document.getElementById('waste-table-body');
            const empty = document.getElementById('waste-empty');
            body.innerHTML = '';

            if (wasteHistory.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            empty.classList.add('hidden');
            wasteHistory.forEach((ws, index) => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3 px-4 text-center text-zinc-400 font-bold">${index + 1}</td>
                    <td class="py-3 px-4 font-semibold">${ws.tanggal}</td>
                    <td class="py-3 px-4 font-bold text-zinc-600">${ws.kategori}</td>
                    <td class="py-3 px-4 font-bold text-zinc-800">${ws.spec}</td>
                    <td class="py-3 px-4 text-right font-extrabold text-rose-600">-${ws.jumlah} unit</td>
                    <td class="py-3 px-4 text-zinc-500">${ws.alasan} ${ws.details ? ' — ' + ws.details : ''}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="deleteWasteRecord(${ws.id})" class="text-rose-600 hover:text-rose-800 font-bold text-[10px] hover:bg-rose-50 p-1.5 rounded-lg transition-colors">Hapus</button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }

        function loadCategoryMaterials(category) {
            const itemSelect = document.getElementById('waste-material-item');
            itemSelect.innerHTML = `<option value="" disabled selected>Memuat Item...</option>`;
            itemSelect.disabled = false;
            availableMaterials = [];

            // Fetch stocks of chosen category
            if (category === 'Log') {
                const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
                const conversions = JSON.parse(localStorage.getItem('woodtrack_log_conversions') || '[]');
                const stockMap = {};

                rawLogs.forEach(entry => {
                    if (entry.items) {
                        entry.items.forEach(item => {
                            const spec = `${item.jenis} - Grade ${item.grade} - ${item.size}`;
                            if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                            stockMap[spec].received += parseInt(item.jumlah) || 0;
                        });
                    }
                });

                conversions.forEach(conv => {
                    if (conv.input) {
                        const spec = `${conv.input.jenis} - Grade ${conv.input.grade} - ${conv.input.size}`;
                        if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                        stockMap[spec].consumed += parseInt(conv.input.jumlah) || 0;
                    }
                });

                Object.values(stockMap).forEach(m => {
                    const current = Math.max(0, m.received - m.consumed);
                    if (current > 0) {
                        availableMaterials.push({ spec: m.spec, stock: current, meta: { jenis: m.spec.split(' - ')[0], grade: m.spec.split(' - ')[1].replace('Grade ', ''), size: m.spec.split(' - ')[2] } });
                    }
                });

            } else if (category === 'Sawtimber') {
                const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
                const ovenBatches = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
                const stockMap = {};

                rawSawtimber.forEach(entry => {
                    if (entry.items) {
                        entry.items.forEach(item => {
                            const spec = `${item.jenis} - Grade ${item.grade} - ${item.size}`;
                            if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                            stockMap[spec].received += parseInt(item.jumlah) || 0;
                        });
                    }
                });

                ovenBatches.forEach(batch => {
                    if (batch.inputs) {
                        batch.inputs.forEach(input => {
                            const spec = `${input.jenis} - Grade ${input.grade} - ${input.size}`;
                            if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                            stockMap[spec].consumed += parseInt(input.jumlah) || 0;
                        });
                    }
                });

                Object.values(stockMap).forEach(m => {
                    const current = Math.max(0, m.received - m.consumed);
                    if (current > 0) {
                        availableMaterials.push({ spec: m.spec, stock: current, meta: { jenis: m.spec.split(' - ')[0], grade: m.spec.split(' - ')[1].replace('Grade ', ''), size: m.spec.split(' - ')[2] } });
                    }
                });

            } else if (category === 'Crosscut') {
                const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');
                const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
                const stockMap = {};

                rawCrosscut.forEach(entry => {
                    if (entry.items) {
                        entry.items.forEach(item => {
                            const spec = `${item.jenis} - Grade ${item.grade} - ${item.size}`;
                            if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                            stockMap[spec].received += parseInt(item.jumlah) || 0;
                        });
                    }
                });

                prodRequests.forEach(req => {
                    if (req.materials) {
                        req.materials.forEach(mat => {
                            if (mat.kategori === 'Crosscut') {
                                const spec = mat.spec;
                                if (!stockMap[spec]) stockMap[spec] = { spec, received: 0, consumed: 0 };
                                stockMap[spec].consumed += parseInt(mat.jumlah) || 0;
                            }
                        });
                    }
                });

                Object.values(stockMap).forEach(m => {
                    const current = Math.max(0, m.received - m.consumed);
                    if (current > 0) {
                        availableMaterials.push({ spec: m.spec, stock: current, meta: { jenis: m.spec.split(' - ')[0], grade: m.spec.split(' - ')[1].replace('Grade ', ''), size: m.spec.split(' - ')[2] } });
                    }
                });

            } else if (category === 'BahanBaku') {
                const rawGlass = JSON.parse(localStorage.getItem('woodtrack_penerimaan_kaca') || '[]');
                const dryKiln = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
                const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
                const stockMap = {};

                rawGlass.forEach(entry => {
                    if (entry.items) {
                        entry.items.forEach(item => {
                            const spec = `${item.tipe} ${item.tebal}mm - ${item.dimensi}`;
                            if (!stockMap[spec]) stockMap[spec] = { spec, kategori: 'Kaca', received: 0, consumed: 0 };
                            stockMap[spec].received += parseInt(item.jumlah) || 0;
                        });
                    }
                });

                dryKiln.forEach(batch => {
                    if (batch.output) {
                        const spec = `${batch.output.jenis} - ${batch.output.size} - Grade ${batch.output.grade}`;
                        if (!stockMap[spec]) stockMap[spec] = { spec, kategori: 'Papan Kering', received: 0, consumed: 0 };
                        stockMap[spec].received += parseInt(batch.output.jumlah) || 0;
                    }
                });

                prodRequests.forEach(req => {
                    if (req.materials) {
                        req.materials.forEach(mat => {
                            if (mat.kategori === 'Kaca' || mat.kategori === 'Sawtimber') {
                                const spec = mat.spec;
                                if (stockMap[spec]) {
                                    stockMap[spec].consumed += parseInt(mat.jumlah) || 0;
                                }
                            }
                        });
                    }
                });

                Object.values(stockMap).forEach(m => {
                    const current = Math.max(0, m.received - m.consumed);
                    if (current > 0) {
                        availableMaterials.push({ spec: m.spec, stock: current, meta: { type: m.kategori } });
                    }
                });
            }

            // Populate select
            itemSelect.innerHTML = `<option value="" disabled selected>Pilih Item...</option>`;
            if (availableMaterials.length === 0) {
                itemSelect.innerHTML = `<option value="" disabled>Stok Kategori Ini Kosong</option>`;
                itemSelect.disabled = true;
            } else {
                availableMaterials.forEach((item, index) => {
                    itemSelect.innerHTML += `<option value="${index}">${item.spec} (Tersedia: ${item.stock} unit)</option>`;
                });
            }
        }

        function submitWasteMaterial() {
            const category = document.getElementById('waste-category').value;
            const itemIndex = document.getElementById('waste-material-item').value;
            const date = document.getElementById('waste-date').value;
            const qtyVal = document.getElementById('waste-qty').value;
            const reason = document.getElementById('waste-reason').value;
            const details = document.getElementById('waste-details').value.trim();

            if (!category || itemIndex === '' || !date || !qtyVal || !reason) {
                showToast('Mohon lengkapi seluruh field berbintang *!', 'error');
                return;
            }

            const qty = parseInt(qtyVal) || 0;
            const chosenItem = availableMaterials[itemIndex];

            if (qty <= 0) {
                showToast('Jumlah terbuang harus lebih besar dari 0!', 'error');
                return;
            }

            if (qty > chosenItem.stock) {
                showToast(`Stok tidak mencukupi! Hanya tersedia ${chosenItem.stock} unit.`, 'error');
                return;
            }

            const recordId = Date.now();

            // Deduct from stock logic
            applyWasteDeduction(category, chosenItem, qty, date, recordId, reason);

            // Record to history
            const newRecord = {
                id: recordId,
                tanggal: date,
                kategori: category,
                spec: chosenItem.spec,
                jumlah: qty,
                alasan: reason,
                details
            };

            wasteHistory.unshift(newRecord);
            localStorage.setItem('woodtrack_waste_material', JSON.stringify(wasteHistory));

            showToast('Limbah/Bahan rusak berhasil dicatat!');
            loadWasteHistory();
            renderWasteTable();
            setView('history');
        }

        function applyWasteDeduction(category, item, qty, date, recordId, reason) {
            if (category === 'Log') {
                const conversions = JSON.parse(localStorage.getItem('woodtrack_log_conversions') || '[]');
                conversions.push({
                    id: `WST-${recordId}`,
                    tanggal: date,
                    input: {
                        jenis: item.meta.jenis,
                        grade: item.meta.grade,
                        size: item.meta.size,
                        jumlah: qty
                    },
                    outputs: [],
                    catatan: `Waste: ${reason}`
                });
                localStorage.setItem('woodtrack_log_conversions', JSON.stringify(conversions));

            } else if (category === 'Sawtimber') {
                const ovenBatches = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
                ovenBatches.push({
                    id: `WST-${recordId}`,
                    tanggal: date,
                    inputs: [{
                        jenis: item.meta.jenis,
                        grade: item.meta.grade,
                        size: item.meta.size,
                        jumlah: qty
                    }],
                    output: null,
                    catatan: `Waste: ${reason}`
                });
                localStorage.setItem('woodtrack_konversi_kiln_dry', JSON.stringify(ovenBatches));

            } else if (category === 'Crosscut' || (category === 'BahanBaku' && item.meta.type === 'Papan Kering')) {
                const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
                prodRequests.push({
                    id: `WST-${recordId}`,
                    tanggal: date,
                    kategori: category === 'Crosscut' ? 'Crosscut' : 'Sawtimber',
                    materials: [{
                        spec: item.spec,
                        kategori: category === 'Crosscut' ? 'Crosscut' : 'Sawtimber',
                        jumlah: qty
                    }],
                    keterangan: `Bahan Rusak: ${reason}`
                });
                localStorage.setItem('woodtrack_produksi_requests', JSON.stringify(prodRequests));

            } else if (category === 'BahanBaku' && item.meta.type === 'Kaca') {
                const prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
                prodRequests.push({
                    id: `WST-${recordId}`,
                    tanggal: date,
                    kategori: 'Kaca',
                    materials: [{
                        spec: item.spec,
                        kategori: 'Kaca',
                        jumlah: qty
                    }],
                    keterangan: `Kaca Pecah/Rusak: ${reason}`
                });
                localStorage.setItem('woodtrack_produksi_requests', JSON.stringify(prodRequests));
            }
        }

        function deleteWasteRecord(id) {
            if (confirm('Apakah Anda yakin ingin membatalkan dan menghapus catatan waste ini? Stok akan dikembalikan.')) {
                // Find record
                const rec = wasteHistory.find(x => x.id === id);
                if (!rec) return;

                // Reverse deduction
                reverseWasteDeduction(rec);

                wasteHistory = wasteHistory.filter(x => x.id !== id);
                localStorage.setItem('woodtrack_waste_material', JSON.stringify(wasteHistory));
                showToast('Catatan waste dibatalkan dan dihapus.');
                loadWasteHistory();
                renderWasteTable();
            }
        }

        function reverseWasteDeduction(rec) {
            const targetId = `WST-${rec.id}`;

            if (rec.kategori === 'Log') {
                let conversions = JSON.parse(localStorage.getItem('woodtrack_log_conversions') || '[]');
                conversions = conversions.filter(x => x.id !== targetId);
                localStorage.setItem('woodtrack_log_conversions', JSON.stringify(conversions));

            } else if (rec.kategori === 'Sawtimber') {
                let ovenBatches = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');
                ovenBatches = ovenBatches.filter(x => x.id !== targetId);
                localStorage.setItem('woodtrack_konversi_kiln_dry', JSON.stringify(ovenBatches));

            } else if (rec.kategori === 'Crosscut' || rec.kategori === 'BahanBaku') {
                let prodRequests = JSON.parse(localStorage.getItem('woodtrack_produksi_requests') || '[]');
                prodRequests = prodRequests.filter(x => x.id !== targetId);
                localStorage.setItem('woodtrack_produksi_requests', JSON.stringify(prodRequests));
            }
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
                toast.style.animation = 'slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) reverse';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }