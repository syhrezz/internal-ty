/**
 * CRUDHelper - Vanilla JS Helper for managing simple CRUD operations with localStorage
 * Supports filters, search, paginated rendering, add/edit modals, confirmation, logging.
 */
class CRUDHelper {
    constructor(config) {
        this.storageKey = config.storageKey;
        this.moduleName = config.moduleName;
        this.itemName = config.itemName; // key property name, e.g. "grade"
        this.itemNameIndo = config.itemNameIndo || config.itemName;
        this.defaultData = config.defaultData || [];
        this.rowsPerPage = config.rowsPerPage || 10;
        this.searchFields = config.searchFields || ["code", "desc"];
        this.renderRow = config.renderRow;
        this.statUnit = config.statUnit || "item";
        this.formFieldMap = config.formFieldMap || {};
        
        // Hooks
        this.onInit = config.onInit || null;
        this.onOpenAdd = config.onOpenAdd || null;
        this.onEdit = config.onEdit || null;
        this.onCloseModal = config.onCloseModal || null;
        this.beforeSubmit = config.beforeSubmit || ((data) => data);
        this.customFilter = config.customFilter || (() => true);
        
        this.logFormatter = config.logFormatter || ((action, item) => {
            const keyVal = item[this.itemName] || '';
            const detail = item.code ? `${item.code} (${keyVal})` : keyVal;
            const actionText = action === 'ADD' ? 'Menambahkan' : action === 'EDIT' ? 'Mengubah' : 'Menghapus';
            return `${actionText} ${this.itemNameIndo.toLowerCase()}: ${detail}`;
        });
        
        this.masterData = [];
        this.filteredData = [];
        this.statusFilter = "All";
        this.searchQuery = "";
        this.currentPage = 1;

        // Auto-initialize when DOM is ready
        if (document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.defaultData));
        }
        
        if (this.onInit) {
            this.onInit();
        }
        
        this.loadData();
        this.bindEvents();
    }

    loadData() {
        this.masterData = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
        this.applyFilters();
    }

    updateStats() {
        const total = this.masterData.length;
        const active = this.masterData.filter(x => x.status === "Aktif").length;
        const inactive = total - active;

        const elTotal = document.getElementById("stat-total");
        const elActive = document.getElementById("stat-active");
        const elInactive = document.getElementById("stat-inactive");

        if (elTotal) elTotal.textContent = `${total} ${this.statUnit}`;
        if (elActive) elActive.textContent = `${active} ${this.statUnit}`;
        if (elInactive) elInactive.textContent = `${inactive} ${this.statUnit}`;
    }

    applyFilters() {
        this.filteredData = this.masterData.filter(item => {
            const matchStatus = this.statusFilter === "All" || item.status === this.statusFilter;
            const matchSearch = this.searchQuery === "" || this.searchFields.some(field => {
                const val = item[field];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(this.searchQuery.toLowerCase());
            });
            const matchCustom = this.customFilter(item);
            return matchStatus && matchSearch && matchCustom;
        });
        
        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    }

    renderTable() {
        const tbody = document.getElementById("table-body");
        const emptyState = document.getElementById("table-empty");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (this.filteredData.length === 0) {
            if (emptyState) emptyState.classList.remove("hidden");
            const info = document.getElementById("table-pagination-info");
            if (info) info.textContent = "Menampilkan 0-0 dari 0 entries";
            
            const btnPrev = document.getElementById("btn-prev");
            const btnNext = document.getElementById("btn-next");
            if (btnPrev) btnPrev.disabled = true;
            if (btnNext) btnNext.disabled = true;
            return;
        }
        if (emptyState) emptyState.classList.add("hidden");

        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = Math.min(start + this.rowsPerPage, this.filteredData.length);
        const pageItems = this.filteredData.slice(start, end);

        pageItems.forEach((item, idx) => {
            const globalIndex = start + idx + 1;
            const statusBadge = item.status === "Aktif" 
                ? `<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Aktif</span>`
                : `<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">Non-Aktif</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = this.renderRow(item, globalIndex, statusBadge);
            tbody.appendChild(tr);
        });

        const info = document.getElementById("table-pagination-info");
        if (info) info.textContent = `Menampilkan ${start + 1}-${end} dari ${this.filteredData.length} entries`;

        const btnPrev = document.getElementById("btn-prev");
        const btnNext = document.getElementById("btn-next");
        if (btnPrev) btnPrev.disabled = this.currentPage === 1;
        if (btnNext) btnNext.disabled = end >= this.filteredData.length;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    }

    nextPage() {
        if ((this.currentPage * this.rowsPerPage) < this.filteredData.length) {
            this.currentPage++;
            this.renderTable();
        }
    }

    handleStatusFilter(val) {
        this.statusFilter = val;
        this.applyFilters();
    }

    handleSearch(val) {
        this.searchQuery = val;
        this.applyFilters();
    }

    openAddModal() {
        const titleEl = document.getElementById("modal-title");
        if (titleEl) titleEl.textContent = `Tambah ${this.itemNameIndo}`;
        const editIdEl = document.getElementById(this.formFieldMap.id);
        if (editIdEl) editIdEl.value = "";
        
        const formEl = document.getElementById("data-form");
        if (formEl) formEl.reset();

        if (this.onOpenAdd) {
            this.onOpenAdd();
        }

        const modalEl = document.getElementById("form-modal");
        if (modalEl) modalEl.classList.add("open");
    }

    editItem(id) {
        const item = this.masterData.find(x => x.id === id);
        if (!item) return;

        const titleEl = document.getElementById("modal-title");
        if (titleEl) titleEl.textContent = `Edit ${this.itemNameIndo}`;

        // Fill form fields
        for (const [key, elementId] of Object.entries(this.formFieldMap)) {
            const el = document.getElementById(elementId);
            if (el) {
                el.value = item[key] !== undefined && item[key] !== null ? item[key] : "";
            }
        }

        if (this.onEdit) {
            this.onEdit(item);
        }

        const modalEl = document.getElementById("form-modal");
        if (modalEl) modalEl.classList.add("open");
    }

    closeModal() {
        if (this.onCloseModal) {
            this.onCloseModal();
        }
        const modalEl = document.getElementById("form-modal");
        if (modalEl) modalEl.classList.remove("open");
    }

    handleSubmit(e) {
        if (e) e.preventDefault();
        const idMapId = this.formFieldMap.id;
        const id = document.getElementById(idMapId).value;

        // Construct item object from form fields
        let itemData = {};
        for (const [key, elementId] of Object.entries(this.formFieldMap)) {
            if (key === "id") continue;
            const el = document.getElementById(elementId);
            if (el) {
                let val = el.value.trim();
                // If the field is capitalized code
                if (key === "code") {
                    val = val.toUpperCase();
                }
                itemData[key] = val;
            }
        }

        // Apply beforeSubmit transformation (e.g. parseFloat/parseInt)
        itemData = this.beforeSubmit(itemData);

        if (id) {
            const idx = this.masterData.findIndex(x => x.id === id);
            if (idx !== -1) {
                this.masterData[idx] = { ...this.masterData[idx], ...itemData };
            }
            if (window.logActivity) {
                window.logActivity("EDIT", this.moduleName, this.logFormatter("EDIT", { id, ...itemData }));
            }
        } else {
            const newId = String(Date.now());
            this.masterData.push({ id: newId, ...itemData });
            if (window.logActivity) {
                window.logActivity("TAMBAH", this.moduleName, this.logFormatter("ADD", { id: newId, ...itemData }));
            }
        }

        localStorage.setItem(this.storageKey, JSON.stringify(this.masterData));
        this.loadData();
        this.closeModal();
    }

    deleteItem(id) {
        const item = this.masterData.find(x => x.id === id);
        if (!item) return;
        const confirmName = item[this.itemName] || item.code || "";
        if (confirm(`Apakah Anda yakin ingin menghapus ${this.itemNameIndo.toLowerCase()} ${confirmName}?`)) {
            this.masterData = this.masterData.filter(x => x.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(this.masterData));
            if (window.logActivity) {
                window.logActivity("HAPUS", this.moduleName, this.logFormatter("DELETE", item));
            }
            this.loadData();
        }
    }

    bindEvents() {
        // Expose functions globally to window so that inline event attributes (onclick/onsubmit) work
        window.editItem = (id) => this.editItem(id);
        window.deleteItem = (id) => this.deleteItem(id);
        window.prevPage = () => this.prevPage();
        window.nextPage = () => this.nextPage();
        window.handleSearch = (val) => this.handleSearch(val);
        window.handleStatusFilter = (val) => this.handleStatusFilter(val);
        window.openAddModal = () => this.openAddModal();
        window.closeModal = () => this.closeModal();
        window.handleSubmit = (e) => this.handleSubmit(e);
    }
}
window.CRUDHelper = CRUDHelper;
