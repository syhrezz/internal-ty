let currentSlide = 1;
        const totalSlides = 7;
        let slideInterval = null;
        let isRotationActive = false; // Disabled by default in desktop view
        const rotationDuration = 15000; // 15 seconds slide cycle
        let slideTimePassed = 0;
        const tickRate = 100; // 100ms progress ticks

        // Stock tracking variables
        let previousStocks = {
            logs: {},
            sawtimber: {},
            bahanbaku: {},
            products: {},
            crosscut: {}
        };

        window.addEventListener('DOMContentLoaded', () => {
            refreshData();

            // Sync database check every 10 seconds
            setInterval(syncDatabaseCheck, 10000);

            // Initialize play/pause buttons to reflect inactive rotation
            initializePlayButtons();

            // Start slide rotation timer & progress bar (which will just return since rotation is inactive)
            resetSlideTimer();
        });

        // Auto-rotation slides logic
        function resetSlideTimer() {
            if (slideInterval) clearInterval(slideInterval);
            slideTimePassed = 0;
            updateProgressUI();

            if (!isRotationActive) return;

            slideInterval = setInterval(() => {
                slideTimePassed += tickRate;
                if (slideTimePassed >= rotationDuration) {
                    nextSlide();
                } else {
                    updateProgressUI();
                }
            }, tickRate);
        }

        function updateProgressUI() {
            const percent = (slideTimePassed / rotationDuration) * 100;
            const bar = document.getElementById('slide-progress');
            if (bar) bar.style.width = `${percent}%`;

            const secs = Math.ceil((rotationDuration - slideTimePassed) / 1000);
            const countdownText = document.getElementById('countdown-text');
            if (countdownText) countdownText.textContent = `${secs}s`;
        }

        function initializePlayButtons() {
            const tvBtn = document.getElementById('tv-play-btn');
            const deskBtn = document.getElementById('desktop-play-btn');
            const playIcon = `<i class="fa-solid fa-play  text-xs"></i>`;
            const pauseIcon = `<i class="fa-solid fa-pause  text-xs"></i>`;

            const icon = isRotationActive ? pauseIcon : playIcon;
            if (tvBtn) tvBtn.innerHTML = icon;
            if (deskBtn) deskBtn.innerHTML = icon;
        }

        function togglePlay() {
            isRotationActive = !isRotationActive;
            const tvBtn = document.getElementById('tv-play-btn');
            const deskBtn = document.getElementById('desktop-play-btn');

            const pauseIcon = `<i class="fa-solid fa-pause  text-xs"></i>`;
            const playIcon = `<i class="fa-solid fa-play  text-xs"></i>`;

            if (isRotationActive) {
                if (tvBtn) tvBtn.innerHTML = pauseIcon;
                if (deskBtn) deskBtn.innerHTML = pauseIcon;
                resetSlideTimer();
            } else {
                if (tvBtn) tvBtn.innerHTML = playIcon;
                if (deskBtn) deskBtn.innerHTML = playIcon;
                if (slideInterval) clearInterval(slideInterval);
                const bar = document.getElementById('slide-progress');
                if (bar) bar.style.width = '0%';
            }
        }

        function setSlide(slideNum) {
            currentSlide = slideNum;
            if (currentSlide > totalSlides) currentSlide = 1;
            if (currentSlide < 1) currentSlide = totalSlides;

            // Update UI tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                const num = parseInt(btn.getAttribute('data-slide'));
                if (num === currentSlide) {
                    btn.className = "tab-btn px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all bg-white shadow-sm text-zinc-900";
                } else {
                    btn.className = "tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-zinc-400 hover:text-zinc-700";
                }
            });

            // Update TV Indicator
            const indicator = document.getElementById('tv-slide-indicator');
            if (indicator) {
                const labels = ['Ringkasan', 'Raw Logs', 'Sawtimber', 'Oven KD', 'Kaca', 'Crosscut', 'Produk Jadi'];
                indicator.textContent = `${currentSlide} / 7 - ${labels[currentSlide - 1]}`;
            }

            // Show active slide
            document.querySelectorAll('.slide-container').forEach((el, idx) => {
                if (idx + 1 === currentSlide) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });

            // Reset countdown progress
            slideTimePassed = 0;
            resetSlideTimer();
        }

        function nextSlide() {
            setSlide(currentSlide + 1);
        }

        function prevSlide() {
            setSlide(currentSlide - 1);
        }

        function toggleTVMode() {
            document.body.classList.toggle('tv-mode-active');
            const isActive = document.body.classList.contains('tv-mode-active');

            if (isActive) {
                // TV Mode: Start slideshow rotation automatically
                isRotationActive = true;
                initializePlayButtons();
                resetSlideTimer();
                try {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    }
                } catch (e) { console.log('Fullscreen blocked'); }
            } else {
                // Desktop view: Pause rotation
                isRotationActive = false;
                initializePlayButtons();
                if (slideInterval) clearInterval(slideInterval);
                const bar = document.getElementById('slide-progress');
                if (bar) bar.style.width = '0%';
                try {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                } catch (e) { }
            }
        }

        function syncDatabaseCheck() {
            // Automatically aggregate database updates and trigger flashes
            refreshData();
        }

        function refreshData() {
            // Calculate Stock Maps using shared calculators from utils.js
            const logs = window.calculateLogsStock();
            const sawtimber = window.calculateSawtimberStock();
            const bahanBaku = window.calculateBahanBakuStock();
            const crosscut = window.calculateCrosscutStock();
            const products = window.calculateProductsStock();

            // Render Slides UI
            renderSlide1(logs, sawtimber, bahanBaku, crosscut, products);
            renderSlide2(logs);
            renderSlide3(sawtimber);
            renderSlide4(bahanBaku);
            renderSlide5(bahanBaku);
            renderSlide6(crosscut);
            renderSlide7(products);

            // Ticker latest feed updates
            updateTicker();
        }

        /* ── STOCK AGGREGATION CALCULATIONS (Centralized in utils.js) ── */

        /* ── SLIDESHOW RENDERING DETAILS ── */

        // Render Slide 1: Ringkasan Total
        function renderSlide1(logs, sawtimber, bahanBaku, crosscut, products) {
            let totalLogQty = logs.reduce((sum, item) => sum + item.stock, 0);
            let totalLogVol = logs.reduce((sum, item) => sum + item.volume, 0);
            let totalSawQty = sawtimber.reduce((sum, item) => sum + item.stock, 0);
            let totalSawVol = sawtimber.reduce((sum, item) => sum + item.volume, 0);

            let totalKDQty = 0;
            let categoriesSet = new Set();
            bahanBaku.forEach(item => {
                if (item.kategori === 'Papan Kering') {
                    totalKDQty += item.stock;
                    categoriesSet.add(item.spec.split('-')[0].trim());
                }
            });

            let totalKacaQty = bahanBaku.filter(item => item.kategori === 'Kaca').reduce((sum, item) => sum + item.stock, 0);
            let totalCrosscutVol = crosscut.reduce((sum, item) => sum + item.stock, 0);
            let totalProdQty = products.reduce((sum, item) => sum + item.stock, 0);

            // Bind values
            document.getElementById('summary-logs-qty').textContent = `${totalLogQty} btg`;
            document.getElementById('summary-logs-vol').textContent = `Volume: ${totalLogVol.toFixed(2)} m³`;
            document.getElementById('summary-saw-qty').textContent = `${totalSawQty} lbr`;
            document.getElementById('summary-saw-vol').textContent = `Volume: ${totalSawVol.toFixed(2)} m³`;
            document.getElementById('summary-kd-qty').textContent = `${totalKDQty} pcs`;
            document.getElementById('summary-kd-spec').textContent = `${categoriesSet.size} Jenis Kayu KD`;
            document.getElementById('summary-crosscut-vol').textContent = `${totalCrosscutVol.toFixed(2)} m³`;
            document.getElementById('summary-glass-qty').textContent = `${totalKacaQty} lbr`;
            document.getElementById('summary-product-qty').textContent = `${totalProdQty} unit`;
        }

        // Render Slide 2: Log Focus details
        function renderSlide2(data) {
            const container = document.getElementById('grid-logs-focus');
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Log Mentah Kosong.</div>`;
                return;
            }

            // Sort by quantity descending
            data.sort((a, b) => b.stock - a.stock);

            data.forEach(item => {
                const itemKey = `logs-${item.jenis}-${item.grade}-${item.size}`;
                const isUpdated = previousStocks.logs[itemKey] !== undefined && previousStocks.logs[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.logs[itemKey] = item.stock;

                const isCritical = item.stock <= 10;
                const criticalClass = isCritical ? 'critical-alert' : '';

                let typeColor = 'text-amber-800 bg-amber-100 border-amber-200';
                if (item.jenis === 'Sengon') typeColor = 'text-emerald-800 bg-emerald-100 border-emerald-200';
                else if (item.jenis === 'Mahoni') typeColor = 'text-rose-800 bg-rose-100 border-rose-200';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <div class="flex items-center justify-between gap-1.5">
                                <span class="tv-card-title text-sm font-bold text-zinc-950">${item.jenis}</span>
                                <span class="px-1.5 py-0.5 text-[8.5px] font-bold rounded border ${typeColor}">${item.size}</span>
                            </div>
                            <p class="tv-card-subtitle text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-1.5">
                                Grade ${item.grade} · <span class="text-amber-700 font-bold tv-card-volume">${item.volume.toFixed(2)} m³</span>
                            </p>
                        </div>
                        <div class="mt-3 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock} <span class="text-[10px] font-bold text-zinc-400">btg</span></span>
                        </div>
                    </div>`;
            });
        }

        // Render Slide 3: Sawtimber Focus details
        function renderSlide3(data) {
            const container = document.getElementById('grid-saw-focus');
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Sawtimber Kosong.</div>`;
                return;
            }

            // Sort by quantity descending
            data.sort((a, b) => b.stock - a.stock);

            data.forEach(item => {
                const itemKey = `saw-${item.jenis}-${item.grade}-${item.size}`;
                const isUpdated = previousStocks.sawtimber[itemKey] !== undefined && previousStocks.sawtimber[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.sawtimber[itemKey] = item.stock;

                const isCritical = item.stock <= 20;
                const criticalClass = isCritical ? 'critical-alert' : '';

                let typeColor = 'text-amber-800 bg-amber-100 border-amber-200';
                if (item.jenis === 'Sengon') typeColor = 'text-emerald-800 bg-emerald-100 border-emerald-200';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <span class="tv-card-title text-sm font-bold text-zinc-950">${item.jenis}</span>
                            <p class="tv-card-subtitle text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-1.5">
                                Ukuran: <span class="font-mono text-zinc-650">${item.size}</span>
                            </p>
                            <p class="tv-card-subtitle text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                                Grade ${item.grade} · <span class="text-emerald-700 font-bold tv-card-volume">${item.volume.toFixed(3)} m³</span>
                            </p>
                        </div>
                        <div class="mt-3 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock} <span class="text-[10px] font-bold text-zinc-400">lbr</span></span>
                        </div>
                    </div>`;
            });
        }

        // Render Slide 4: Oven KD Focus details
        function renderSlide4(data) {
            const container = document.getElementById('grid-kd-focus');
            container.innerHTML = '';

            const kdData = data.filter(item => item.kategori === 'Papan Kering');

            if (kdData.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Papan Oven KD Kosong.</div>`;
                return;
            }

            // Sort by quantity descending
            kdData.sort((a, b) => b.stock - a.stock);

            kdData.forEach(item => {
                const itemKey = `kd-${item.spec}`;
                const isUpdated = previousStocks.bahanbaku[itemKey] !== undefined && previousStocks.bahanbaku[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.bahanbaku[itemKey] = item.stock;

                const isCritical = item.stock <= 10;
                const criticalClass = isCritical ? 'critical-alert' : '';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <span class="px-1.5 py-0.5 text-[8px] font-bold rounded border bg-teal-50 border-teal-150 text-teal-700">PAPAN KERING Oven KD</span>
                            <h4 class="tv-card-title text-xs font-bold text-zinc-900 mt-2 truncate" title="${item.spec}">${item.spec}</h4>
                        </div>
                        <div class="mt-3.5 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock} <span class="text-[10px] font-bold text-zinc-400">pcs</span></span>
                        </div>
                    </div>`;
            });
        }

        // Render Slide 5: Kaca Lembaran Focus details
        function renderSlide5(bahanBaku) {
            const container = document.getElementById('grid-kaca-focus');
            container.innerHTML = '';

            const glassData = bahanBaku.filter(item => item.kategori === 'Kaca');

            if (glassData.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Kaca Kosong.</div>`;
                return;
            }

            // Sort by quantity descending
            glassData.sort((a, b) => b.stock - a.stock);

            // Render Kaca Cards
            glassData.forEach(item => {
                const itemKey = `glass-${item.spec}`;
                const isUpdated = previousStocks.bahanbaku[itemKey] !== undefined && previousStocks.bahanbaku[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.bahanbaku[itemKey] = item.stock;

                const isCritical = item.stock <= 5;
                const criticalClass = isCritical ? 'critical-alert' : '';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <span class="px-1.5 py-0.5 text-[8px] font-bold rounded border bg-indigo-50 border-indigo-150 text-indigo-700">KACA LEMBARAN</span>
                            <h4 class="tv-card-title text-xs font-bold text-zinc-900 mt-2 truncate" title="${item.spec}">${item.spec}</h4>
                        </div>
                        <div class="mt-3.5 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock} <span class="text-[10px] font-bold text-zinc-400">lbr</span></span>
                        </div>
                    </div>`;
            });
        }

        // Render Slide 6: Crosscut Focus details
        function renderSlide6(crosscut) {
            const container = document.getElementById('grid-crosscut-focus');
            container.innerHTML = '';

            if (crosscut.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Crosscut Kosong.</div>`;
                return;
            }

            // Sort by volume descending
            crosscut.sort((a, b) => b.stock - a.stock);

            // Render Crosscut Cards
            crosscut.forEach(item => {
                const itemKey = `crosscut-${item.spec}`;
                const isUpdated = previousStocks.crosscut[itemKey] !== undefined && previousStocks.crosscut[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.crosscut[itemKey] = item.stock;

                const isCritical = item.stock < 2.0;
                const criticalClass = isCritical ? 'critical-alert' : '';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <span class="px-1.5 py-0.5 text-[8px] font-bold rounded border bg-purple-50 border-purple-150 text-purple-700">CROSSCUT</span>
                            <h4 class="tv-card-title text-xs font-bold text-zinc-900 mt-2 truncate" title="${item.spec}">${item.spec}</h4>
                        </div>
                        <div class="mt-3.5 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock.toFixed(2)} <span class="text-[10px] font-bold text-zinc-400">m³</span></span>
                        </div>
                    </div>`;
            });
        }

        // Render Slide 7: Products Focus details
        function renderSlide7(data) {
            const container = document.getElementById('grid-products-focus');
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = `<div class="col-span-4 py-20 text-center text-zinc-400 text-sm font-bold">Stok Produk Jadi Kosong.</div>`;
                return;
            }

            // Sort by quantity descending
            data.sort((a, b) => b.stock - a.stock);

            data.forEach(item => {
                const itemKey = `prod-${item.nama}-${item.grade}`;
                const isUpdated = previousStocks.products[itemKey] !== undefined && previousStocks.products[itemKey] !== item.stock;
                const changeClass = isUpdated ? 'change-flash' : '';
                previousStocks.products[itemKey] = item.stock;

                const isCritical = item.stock <= 2;
                const criticalClass = isCritical ? 'critical-alert' : '';

                container.innerHTML += `
                    <div class="tv-zoom-card bg-white border border-zinc-200 p-3.5 rounded-xl shadow-sm flex flex-col justify-between ${criticalClass} ${changeClass}">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="px-1.5 py-0.5 text-[8px] font-bold rounded border bg-blue-50 border-blue-150 text-blue-700">PRODUK JADI</span>
                                <span class="px-1 py-0.2 bg-zinc-100 text-zinc-500 rounded text-[8.5px] font-bold uppercase">Grade ${item.grade}</span>
                            </div>
                            <h4 class="tv-card-title text-xs font-bold text-zinc-900 mt-2 truncate">${item.nama}</h4>
                        </div>
                        <div class="mt-3.5 flex justify-end">
                            <span class="tv-card-count text-lg font-extrabold ${isCritical ? 'text-red-600' : 'text-zinc-950'}">${item.stock} <span class="text-[10px] font-bold text-zinc-400">unit</span></span>
                        </div>
                    </div>`;
            });
        }

        // Ticker logic (Removed)
        function updateTicker() { }