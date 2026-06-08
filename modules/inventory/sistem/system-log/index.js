// Mock default system logs to render on empty load
        const mockLogs = [
            { id: "m1", timestamp: new Date(Date.now() - 50000).toISOString(), user: "Admin", action: "TAMBAH", category: "Master Pengguna", details: "Menambahkan pengguna baru: Siti Rahma (Operator)" },
            { id: "m2", timestamp: new Date(Date.now() - 360000).toISOString(), user: "Admin", action: "EDIT", category: "Master Log", details: "Mengubah spesifikasi log: JAT-001 (Jati, Grade A)" },
            { id: "m3", timestamp: new Date(Date.now() - 1200000).toISOString(), user: "Admin", action: "TAMBAH", category: "Penerimaan Log", details: "Mencatat penerimaan log masuk sebanyak 15 pcs dari Supplier CV Abadi" },
            { id: "m4", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Admin", action: "HAPUS", category: "Master Kaca", details: "Menghapus ukuran kaca: KAC-120 (Tebal 12mm)" },
            { id: "m5", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "Admin", action: "LOGIN", category: "Keamanan", details: "Pengguna Admin berhasil masuk ke sistem" }
        ];

        let logsData = [];
        let filteredLogs = [];
        let actionFilter = "All";
        let categoryFilter = "All";
        let searchQuery = "";
        let currentPage = 1;
        const rowsPerPage = 15;

        window.addEventListener("DOMContentLoaded", () => {
            if (!localStorage.getItem("woodtrack_system_logs")) {
                localStorage.setItem("woodtrack_system_logs", JSON.stringify(mockLogs));
            }
            loadLogs();
            populateCategoryFilter();
        });

        function loadLogs() {
            logsData = JSON.parse(localStorage.getItem("woodtrack_system_logs") || "[]");
            applyFilters();
        }

        function populateCategoryFilter() {
            const categories = new Set(logsData.map(log => log.category));
            const select = document.getElementById("category-filter");
            select.innerHTML = '<option value="All">Semua Fitur</option>';
            categories.forEach(cat => {
                if (cat) {
                    const opt = document.createElement("option");
                    opt.value = cat;
                    opt.textContent = cat;
                    select.appendChild(opt);
                }
            });
            select.value = categoryFilter;
        }

        function updateStats() {
            const total = logsData.length;
            const todayStr = new Date().toDateString();
            const todayCount = logsData.filter(log => new Date(log.timestamp).toDateString() === todayStr).length;
            const deleteCount = logsData.filter(log => log.action === "HAPUS").length;
            const uniqueUsers = new Set(logsData.map(log => log.user)).size;

            document.getElementById("stat-total-logs").textContent = `${total} log`;
            document.getElementById("stat-today-logs").textContent = `${todayCount} log`;
            document.getElementById("stat-delete-logs").textContent = `${deleteCount} log`;
            document.getElementById("stat-active-users").textContent = `${uniqueUsers} user`;
        }

        function applyFilters() {
            filteredLogs = logsData.filter(log => {
                const matchAction = actionFilter === "All" || log.action === actionFilter;
                const matchCategory = categoryFilter === "All" || log.category === categoryFilter;
                const matchSearch = searchQuery === "" || 
                    (log.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (log.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (log.category || "").toLowerCase().includes(searchQuery.toLowerCase());
                return matchAction && matchCategory && matchSearch;
            });

            currentPage = 1;
            renderTable();
            updateStats();
        }

        function renderTable() {
            const tbody = document.getElementById("table-body");
            const emptyState = document.getElementById("table-empty");
            tbody.innerHTML = "";

            if (filteredLogs.length === 0) {
                emptyState.classList.remove("hidden");
                document.getElementById("table-pagination-info").textContent = "Menampilkan 0-0 dari 0 entries";
                return;
            }
            emptyState.classList.add("hidden");

            const start = (currentPage - 1) * rowsPerPage;
            const end = Math.min(start + rowsPerPage, filteredLogs.length);
            const pageItems = filteredLogs.slice(start, end);

            pageItems.forEach((log, idx) => {
                const globalIndex = start + idx + 1;
                
                // Color formatting for action badges
                let actionBadge = "";
                if (log.action === "TAMBAH") {
                    actionBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">TAMBAH</span>`;
                } else if (log.action === "EDIT") {
                    actionBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">EDIT</span>`;
                } else if (log.action === "HAPUS") {
                    actionBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">HAPUS</span>`;
                } else {
                    actionBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">${log.action}</span>`;
                }

                // Format timestamp
                const dateObj = new Date(log.timestamp);
                const formatTime = dateObj.toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric'
                }) + ' - ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
                    <td class="py-3 px-4 font-medium text-zinc-500 whitespace-nowrap">${formatTime}</td>
                    <td class="py-3 px-4 font-bold text-zinc-800">${log.user}</td>
                    <td class="py-3 px-4 text-center">${actionBadge}</td>
                    <td class="py-3 px-4 font-semibold text-zinc-700">${log.category}</td>
                    <td class="py-3 px-4 font-medium text-zinc-600 leading-relaxed">${log.details}</td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById("table-pagination-info").textContent = `Menampilkan ${start + 1}-${end} dari ${filteredLogs.length} entries`;
            document.getElementById("btn-prev").disabled = currentPage === 1;
            document.getElementById("btn-next").disabled = end >= filteredLogs.length;
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        }

        function nextPage() {
            if ((currentPage * rowsPerPage) < filteredLogs.length) {
                currentPage++;
                renderTable();
            }
        }

        function handleSearch(val) {
            searchQuery = val;
            applyFilters();
        }

        function handleActionFilter(val) {
            actionFilter = val;
            applyFilters();
        }

        function handleCategoryFilter(val) {
            categoryFilter = val;
            applyFilters();
        }

        function resetFilters() {
            searchQuery = "";
            actionFilter = "All";
            categoryFilter = "All";
            document.querySelectorAll(".search-input").forEach(el => el.value = "");
            document.querySelectorAll(".premium-select").forEach(el => el.value = "All");
            applyFilters();
        }

        // CSV Export
        function exportCSV() {
            if (filteredLogs.length === 0) {
                alert("Tidak ada data log untuk diekspor!");
                return;
            }
            let csvContent = "data:text/csv;charset=utf-8,Waktu Kejadian,Pengguna,Aksi,Fitur Sistem,Audit Detail\n";
            filteredLogs.forEach(log => {
                const dateStr = new Date(log.timestamp).toISOString();
                const row = [
                    `"${dateStr}"`,
                    `"${log.user}"`,
                    `"${log.action}"`,
                    `"${log.category}"`,
                    `"${log.details.replace(/"/g, '""')}"`
                ].join(",");
                csvContent += row + "\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `woodtrack_system_activity_logs_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Clear Logs Modals
        function openClearModal() {
            document.getElementById("confirm-input").value = "";
            document.getElementById("clear-modal").classList.add("open");
        }

        function closeClearModal() {
            document.getElementById("clear-modal").classList.remove("open");
        }

        function confirmClearLogs() {
            const input = document.getElementById("confirm-input").value.trim();
            if (input === "BERSIHKAN") {
                localStorage.setItem("woodtrack_system_logs", JSON.stringify([]));
                loadLogs();
                populateCategoryFilter();
                closeClearModal();
                alert("Seluruh system audit log berhasil dibersihkan.");
            } else {
                alert("Konfirmasi tidak cocok! Silakan ketik 'BERSIHKAN' dengan benar.");
            }
        }