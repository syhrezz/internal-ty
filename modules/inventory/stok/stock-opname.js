let opnameHistory = [];
        let activeOpnameItems = [];
        let selectedOpnameItems = [];

        window.addEventListener('DOMContentLoaded', () => {
            // Load custom script navigation sync
            const nav = document.querySelector('nav');
            if (nav && typeof window.getNav === 'function') {
                nav.innerHTML = window.getNav('stock-opname');
            }

            // Sync datetime clock
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('opname-date').value = today;

            loadOpnameHistory();
            renderHistoryTable();
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
            document.getElementById('opname-category').value = '';
            document.getElementById('opname-notes').value = '';
            document.getElementById('selection-card').classList.add('hidden');
            document.getElementById('selection-checkboxes-container').innerHTML = '';
            document.getElementById('audit-table-card').classList.add('hidden');
            document.getElementById('audit-table-body').innerHTML = '';
            activeOpnameItems = [];
            selectedOpnameItems = [];
        }

        function loadOpnameHistory() {
            const saved = localStorage.getItem('woodtrack_stock_opname');
            if (saved) {
                opnameHistory = JSON.parse(saved);
            } else {
                opnameHistory = [
                    {
                        id: 1717478400000,
                        tanggal: '2026-06-03',
                        kategori: 'Log',
                        auditor: 'Admin',
                        catatan: 'Audit rutin awal bulan Juni',
                        items: [
                            { spec: 'Sengon - Grade A - A3', system: 50, physical: 48, difference: -2, notes: 'Rusak/busuk 2 batang' },
                            { spec: 'Jati - Grade A - A5', system: 12, physical: 12, difference: 0, notes: 'Cocok' }
                        ]
                    },
                    {
                        id: 1717392000000,
                        tanggal: '2026-06-02',
                        kategori: 'Produk',
                        auditor: 'Budi',
                        catatan: 'Re-check stok pintu jati',
                        items: [
                            { spec: 'Pintu Jati Klasik', system: 5, physical: 6, difference: 1, notes: 'Kelebihan input barang jadi' }
                        ]
                    }
                ];
                localStorage.setItem('woodtrack_stock_opname', JSON.stringify(opnameHistory));
            }
        }

        function renderHistoryTable() {
            const body = document.getElementById('history-table-body');
            const empty = document.getElementById('history-empty');
            body.innerHTML = '';

            if (opnameHistory.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            empty.classList.add('hidden');
            opnameHistory.forEach((op, index) => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3 px-4 text-center text-zinc-400 font-bold">${index + 1}</td>
                    <td class="py-3 px-4 font-semibold">${op.tanggal}</td>
                    <td class="py-3 px-4 font-bold text-zinc-800">${op.kategori}</td>
                    <td class="py-3 px-4 text-zinc-500">${op.auditor}</td>
                    <td class="py-3 px-4 text-right font-semibold text-indigo-600">${op.items.length} item</td>
                    <td class="py-3 px-4 text-zinc-400 max-w-[200px] truncate">${op.catatan || '-'}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="viewDetail(${op.id})" class="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-700 font-bold text-[10px] transition-all">Detail</button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }

        // Dynamically compute system stocks for each category
        function loadCategoryItems(category) {
            document.getElementById('audit-table-card').classList.add('hidden');
            document.getElementById('selection-card').classList.add('hidden');
            activeOpnameItems = [];

            if (category === 'Log') {
                // Compute current Log Stock
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
                    const currentStock = Math.max(0, m.received - m.consumed);
                    // Deconstruct spec
                    const parts = m.spec.split(' - ');
                    activeOpnameItems.push({
                        spec: m.spec,
                        meta: { jenis: parts[0], grade: parts[1].replace('Grade ', ''), size: parts[2] },
                        systemStock: currentStock
                    });
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
                    activeOpnameItems.push({
                        spec: m.spec,
                        meta: { jenis: m.spec.split(' - ')[0], grade: m.spec.split(' - ')[1].replace('Grade ', ''), size: m.spec.split(' - ')[2] },
                        systemStock: Math.max(0, m.received - m.consumed)
                    });
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
                    activeOpnameItems.push({
                        spec: m.spec,
                        meta: { jenis: m.spec.split(' - ')[0], grade: m.spec.split(' - ')[1].replace('Grade ', ''), size: m.spec.split(' - ')[2] },
                        systemStock: Math.max(0, m.received - m.consumed)
                    });
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
                    activeOpnameItems.push({
                        spec: m.spec,
                        meta: { type: m.kategori },
                        systemStock: Math.max(0, m.received - m.consumed)
                    });
                });

            } else if (category === 'Produk') {
                const prodLogs = JSON.parse(localStorage.getItem('woodtrack_hasil_produksi_logs') || '[]');
                const salesLogs = JSON.parse(localStorage.getItem('woodtrack_penjualan_produk') || '[]');
                const stockMap = {
                    'Pintu Jati Klasik': { name: 'Pintu Jati Klasik', produced: 0, sold: 0 },
                    'Pintu Kaca Minimalis Jati': { name: 'Pintu Kaca Minimalis Jati', produced: 0, sold: 0 },
                    'Kusen Kayu Meranti': { name: 'Kusen Kayu Meranti', produced: 0, sold: 0 },
                    'Frame Papan Kayu Meranti': { name: 'Frame Papan Kayu Meranti', produced: 0, sold: 0 },
                    'Daun Jendela Sengon': { name: 'Daun Jendela Sengon', produced: 0, sold: 0 }
                };

                prodLogs.forEach(entry => {
                    if (entry.tipe === 'Barang Jadi' && entry.nama) {
                        const key = entry.nama.trim();
                        if (!stockMap[key]) stockMap[key] = { name: key, produced: 0, sold: 0 };
                        stockMap[key].produced += parseInt(entry.jumlah) || 0;
                    }
                });

                salesLogs.forEach(sale => {
                    if (sale.nama) {
                        const key = sale.nama.trim();
                        if (!stockMap[key]) stockMap[key] = { name: key, produced: 0, sold: 0 };
                        stockMap[key].sold += parseInt(sale.jumlah) || 0;
                    }
                });

                Object.values(stockMap).forEach(m => {
                    activeOpnameItems.push({
                        spec: m.name,
                        meta: { name: m.name },
                        systemStock: Math.max(0, m.produced - m.sold)
                    });
                });
            }

            renderChecklist();
        }

        function renderChecklist() {
            const container = document.getElementById('selection-checkboxes-container');
            container.innerHTML = '';
            
            if (activeOpnameItems.length === 0) {
                container.innerHTML = `<div class="col-span-full py-4 text-center text-zinc-400">Tidak ada item terdaftar untuk kategori ini.</div>`;
                document.getElementById('selection-card').classList.remove('hidden');
                return;
            }
            
            activeOpnameItems.forEach((item, index) => {
                const label = document.createElement('label');
                label.className = 'flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-zinc-100/60 cursor-pointer transition-colors text-xs font-semibold text-zinc-700 border border-zinc-200/40 bg-white shadow-sm';
                label.innerHTML = `
                    <input type="checkbox" id="item-chk-${index}" value="${index}" checked class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-zinc-300">
                    <div class="flex-1 min-w-0">
                        <p class="truncate font-bold text-zinc-800">${item.spec}</p>
                        <p class="text-[10px] text-zinc-400 mt-0.5">Stok Sistem: ${item.systemStock}</p>
                    </div>
                `;
                container.appendChild(label);
            });
            
            document.getElementById('selection-card').classList.remove('hidden');
        }

        function toggleAllSelections(select) {
            const checkboxes = document.querySelectorAll('#selection-checkboxes-container input[type="checkbox"]');
            checkboxes.forEach(chk => chk.checked = select);
        }

        function proceedToAuditTable() {
            const checkboxes = document.querySelectorAll('#selection-checkboxes-container input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                showToast('Mohon pilih minimal 1 item untuk diaudit!', 'error');
                return;
            }
            
            selectedOpnameItems = [];
            checkboxes.forEach(chk => {
                const idx = parseInt(chk.value);
                selectedOpnameItems.push({
                    ...activeOpnameItems[idx]
                });
            });
            
            renderFormTable();
            document.getElementById('audit-table-card').classList.remove('hidden');
        }

        function renderFormTable() {
            const body = document.getElementById('audit-table-body');
            body.innerHTML = '';

            if (selectedOpnameItems.length === 0) {
                body.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-zinc-400">Tidak ada item terdaftar untuk kategori ini.</td></tr>`;
                return;
            }

            selectedOpnameItems.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-3 px-4 text-center font-bold text-zinc-400">${index + 1}</td>
                    <td class="py-3 px-4 font-bold text-zinc-800">${item.spec}</td>
                    <td class="py-3 px-4 text-right font-semibold text-zinc-500">${item.systemStock}</td>
                    <td class="py-3 px-4 text-center">
                        <input type="number" id="physical-input-${index}" oninput="calcDifference(${index}, this.value)" min="0" placeholder="Akurasi fisik" class="premium-input text-center w-28 mx-auto">
                    </td>
                    <td class="py-3 px-4 text-right font-extrabold" id="diff-cell-${index}">-</td>
                    <td class="py-3 px-4">
                        <input type="text" id="notes-input-${index}" placeholder="e.g. Lapuk / Penyusutan alam" class="premium-input text-xs">
                    </td>
                `;
                body.appendChild(tr);
            });
        }

        function calcDifference(index, val) {
            const system = selectedOpnameItems[index].systemStock;
            const diffCell = document.getElementById(`diff-cell-${index}`);
            
            if (val === '') {
                diffCell.innerText = '-';
                diffCell.className = 'py-3 px-4 text-right font-extrabold text-zinc-400';
                return;
            }

            const physical = parseInt(val) || 0;
            const diff = physical - system;

            if (diff > 0) {
                diffCell.innerText = `+${diff}`;
                diffCell.className = 'py-3 px-4 text-right font-extrabold text-emerald-600';
            } else if (diff < 0) {
                diffCell.innerText = `${diff}`;
                diffCell.className = 'py-3 px-4 text-right font-extrabold text-rose-600';
            } else {
                diffCell.innerText = '0';
                diffCell.className = 'py-3 px-4 text-right font-extrabold text-zinc-500';
            }
        }

        function submitStockOpname() {
            const category = document.getElementById('opname-category').value;
            const date = document.getElementById('opname-date').value;
            const auditor = document.getElementById('opname-auditor').value.trim();
            const generalNotes = document.getElementById('opname-notes').value.trim();

            if (!category || !date || !auditor) {
                showToast('Mohon lengkapi semua parameter audit (Kategori, Tanggal, Auditor)!', 'error');
                return;
            }

            const auditBatchItems = [];

            // Read inputs
            for (let i = 0; i < selectedOpnameItems.length; i++) {
                const physicalVal = document.getElementById(`physical-input-${i}`).value;
                if (physicalVal === '') {
                    showToast(`Stok fisik untuk item #${i + 1} (${selectedOpnameItems[i].spec}) belum diisi!`, 'error');
                    return;
                }

                const physical = parseInt(physicalVal) || 0;
                const system = selectedOpnameItems[i].systemStock;
                const difference = physical - system;
                const note = document.getElementById(`notes-input-${i}`).value.trim();

                auditBatchItems.push({
                    spec: selectedOpnameItems[i].spec,
                    meta: selectedOpnameItems[i].meta,
                    system,
                    physical,
                    difference,
                    notes: note
                });
            }

            // Perform storage adjustments
            const opnameId = Date.now();
            applyStockAdjustments(category, date, opnameId, auditBatchItems);

            // Record Opname History
            const newAuditReport = {
                id: opnameId,
                tanggal: date,
                kategori: category,
                auditor,
                catatan: generalNotes,
                items: auditBatchItems
            };

            opnameHistory.unshift(newAuditReport);
            localStorage.setItem('woodtrack_stock_opname', JSON.stringify(opnameHistory));

            showToast('Stock Opname berhasil disimpan dan penyesuaian stok diterapkan!');
            loadOpnameHistory();
            renderHistoryTable();
            setView('history');
        }

        function applyStockAdjustments(category, date, opnameId, items) {
            if (category === 'Log') {
                const rawLogs = JSON.parse(localStorage.getItem('woodtrack_penerimaan_log') || '[]');
                items.forEach(item => {
                    if (item.difference !== 0) {
                        // Append adjustment log
                        rawLogs.push({
                            id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                            tanggal: date,
                            supplier: 'Penyesuaian Opname',
                            surat: `OPNAME-${opnameId}`,
                            catatan: item.notes || 'Penyesuaian selisih fisik',
                            items: [{
                                jenis: item.meta.jenis,
                                grade: item.meta.grade,
                                size: item.meta.size,
                                jumlah: item.difference
                            }]
                        });
                    }
                });
                localStorage.setItem('woodtrack_penerimaan_log', JSON.stringify(rawLogs));

            } else if (category === 'Sawtimber') {
                const rawSawtimber = JSON.parse(localStorage.getItem('woodtrack_penerimaan_sawtimber') || '[]');
                items.forEach(item => {
                    if (item.difference !== 0) {
                        rawSawtimber.push({
                            id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                            tanggal: date,
                            supplier: 'Penyesuaian Opname',
                            surat: `OPNAME-${opnameId}`,
                            catatan: item.notes || 'Penyesuaian selisih fisik',
                            items: [{
                                jenis: item.meta.jenis,
                                grade: item.meta.grade,
                                size: item.meta.size,
                                jumlah: item.difference
                            }]
                        });
                    }
                });
                localStorage.setItem('woodtrack_penerimaan_sawtimber', JSON.stringify(rawSawtimber));

            } else if (category === 'Crosscut') {
                const rawCrosscut = JSON.parse(localStorage.getItem('woodtrack_penerimaan_crosscut') || '[]');
                items.forEach(item => {
                    if (item.difference !== 0) {
                        rawCrosscut.push({
                            id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                            tanggal: date,
                            supplier: 'Penyesuaian Opname',
                            surat: `OPNAME-${opnameId}`,
                            catatan: item.notes || 'Penyesuaian selisih fisik',
                            items: [{
                                jenis: item.meta.jenis,
                                grade: item.meta.grade,
                                size: item.meta.size,
                                jumlah: item.difference
                            }]
                        });
                    }
                });
                localStorage.setItem('woodtrack_penerimaan_crosscut', JSON.stringify(rawCrosscut));

            } else if (category === 'BahanBaku') {
                const rawGlass = JSON.parse(localStorage.getItem('woodtrack_penerimaan_kaca') || '[]');
                const dryKiln = JSON.parse(localStorage.getItem('woodtrack_konversi_kiln_dry') || '[]');

                items.forEach(item => {
                    if (item.difference !== 0) {
                        if (item.meta.type === 'Kaca') {
                            // Deconstruct glass spec: e.g. "Polos 5mm - 120x240"
                            const cleanSpec = item.spec.replace('mm', '');
                            const parts = cleanSpec.split(' - ');
                            const firstPart = parts[0].split(' ');
                            const tipe = firstPart[0];
                            const tebal = firstPart[1];
                            const dimensi = parts[1];

                            rawGlass.push({
                                id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                                tanggal: date,
                                supplier: 'Penyesuaian Opname',
                                surat: `OPNAME-${opnameId}`,
                                catatan: item.notes || 'Penyesuaian selisih fisik',
                                items: [{ tipe, tebal, dimensi, jumlah: item.difference }]
                            });
                        } else {
                            // Papan Kering
                            const parts = item.spec.split(' - ');
                            const jenis = parts[0];
                            const size = parts[1];
                            const grade = parts[2].replace('Grade ', '');

                            dryKiln.push({
                                id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                                tanggal: date,
                                output: { jenis, size, grade, jumlah: item.difference },
                                input: null
                            });
                        }
                    }
                });

                localStorage.setItem('woodtrack_penerimaan_kaca', JSON.stringify(rawGlass));
                localStorage.setItem('woodtrack_konversi_kiln_dry', JSON.stringify(dryKiln));

            } else if (category === 'Produk') {
                const prodLogs = JSON.parse(localStorage.getItem('woodtrack_hasil_produksi_logs') || '[]');
                const salesLogs = JSON.parse(localStorage.getItem('woodtrack_penjualan_produk') || '[]');

                items.forEach(item => {
                    if (item.difference !== 0) {
                        if (item.difference > 0) {
                            // Positive adjustment -> append to produced logs
                            prodLogs.push({
                                id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                                tanggal: date,
                                tipe: 'Barang Jadi',
                                nama: item.spec,
                                jumlah: item.difference,
                                keterangan: item.notes || 'Penyesuaian Lebih Opname'
                            });
                        } else {
                            // Negative adjustment -> append to sales log (as checkout loss)
                            salesLogs.push({
                                id: `ADJ-${opnameId}-${Math.floor(Math.random() * 1000)}`,
                                tanggal: date,
                                buyer: 'Audit Opname (Selisih Kurang)',
                                nama: item.spec,
                                jumlah: Math.abs(item.difference),
                                keterangan: item.notes || 'Penyesuaian Kurang Opname'
                            });
                        }
                    }
                });

                localStorage.setItem('woodtrack_hasil_produksi_logs', JSON.stringify(prodLogs));
                localStorage.setItem('woodtrack_penjualan_produk', JSON.stringify(salesLogs));
            }
        }

        function viewDetail(opnameId) {
            const op = opnameHistory.find(x => x.id === opnameId);
            if (!op) return;

            document.getElementById('detail-tanggal').innerText = op.tanggal;
            document.getElementById('detail-kategori').innerText = op.kategori;
            document.getElementById('detail-auditor').innerText = op.auditor;
            document.getElementById('detail-catatan').innerText = op.catatan || '-';

            const body = document.getElementById('detail-table-body');
            body.innerHTML = '';

            op.items.forEach(item => {
                const diffColor = item.difference > 0 ? 'text-emerald-600 font-bold' : item.difference < 0 ? 'text-rose-600 font-bold' : 'text-zinc-500';
                const diffText = item.difference > 0 ? `+${item.difference}` : `${item.difference}`;
                
                const tr = document.createElement('tr');
                tr.className = 'border-b border-zinc-50';
                tr.innerHTML = `
                    <td class="py-2.5 px-3 font-semibold text-zinc-800">${item.spec}</td>
                    <td class="py-2.5 px-3 text-right font-medium text-zinc-400">${item.system}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-zinc-700">${item.physical}</td>
                    <td class="py-2.5 px-3 text-right ${diffColor}">${diffText}</td>
                    <td class="py-2.5 px-3 text-zinc-400 italic">${item.notes || '-'}</td>
                `;
                body.appendChild(tr);
            });

            document.getElementById('detail-modal').classList.add('open');
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
                toast.style.animation = 'slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) reverse';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }