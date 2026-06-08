const defaultData = [
    { id: "1", code: "PRD-CH-OAK", nama: "Kursi Makan Oak Premium", category: "Kursi", species: "Oak", dimensi: "48x45x90 cm", status: "Aktif", desc: "Kursi kayu solid oak berkualitas tinggi", img: "" },
    { id: "2", code: "PRD-TBL-DIN", nama: "Meja Makan Minimalis 6 Kursi", category: "Meja", species: "Jati", dimensi: "180x90x75 cm", status: "Aktif", desc: "Meja makan kayu jati berlapis resin", img: "" },
    { id: "3", code: "PRD-DR-TEAK", nama: "Pintu Panel Jati Solid", category: "Pintu", species: "Jati", dimensi: "90x210x4 cm", status: "Aktif", desc: "Pintu utama kayu jati utuh", img: "" },
    { id: "4", code: "PRD-CAB-KIT", nama: "Kabinet Dapur Gantung", category: "Kabinet", species: "Meranti", dimensi: "120x40x80 cm", status: "Aktif", desc: "Kabinet dapur kayu meranti finishing melamin", img: "" },
    { id: "5", code: "PRD-PNL-WALL", nama: "Panel Dinding Kayu Sengon", category: "Panel", species: "Sengon", dimensi: "60x120x1.5 cm", status: "Non-Aktif", desc: "Decorative wall panel 3D sengon", img: "" }
];

window.selectedImageBase64 = "";

window.triggerFileSelect = () => {
    document.getElementById("form-image-file").click();
};

window.handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        window.selectedImageBase64 = event.target.result;
        const img = document.getElementById("image-preview-img");
        const span = document.querySelector("#image-preview-container span");
        const removeBtn = document.getElementById("btn-remove-image");
        img.src = window.selectedImageBase64;
        img.classList.remove("hidden");
        span.classList.add("hidden");
        removeBtn.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
};

window.removeSelectedImage = (e) => {
    if (e) e.stopPropagation();
    window.selectedImageBase64 = "";
    const img = document.getElementById("image-preview-img");
    const span = document.querySelector("#image-preview-container span");
    const removeBtn = document.getElementById("btn-remove-image");
    img.src = "";
    img.classList.add("hidden");
    span.classList.remove("hidden");
    removeBtn.classList.add("hidden");
    document.getElementById("form-image-file").value = "";
};

window.handleCategoryFilter = (val) => {
    window.categoryFilterVal = val;
    window.crudInstance.applyFilters();
};

window.handleSpeciesFilter = (val) => {
    window.speciesFilterVal = val;
    window.crudInstance.applyFilters();
};

window.crudInstance = new CRUDHelper({
    storageKey: "woodtrack_master_produk_detail",
    moduleName: "Master Detail Produk",
    itemName: "nama",
    itemNameIndo: "Detail Produk",
    defaultData: defaultData,
    searchFields: ["code", "nama", "desc"],
    statUnit: "item",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        nama: "form-nama",
        category: "form-category",
        species: "form-species",
        dimensi: "form-dimensi",
        status: "form-status",
        desc: "form-desc"
    },
    onInit: () => {
        // Load dropdown values from categories and species
        const catData = JSON.parse(localStorage.getItem("woodtrack_master_produk_kategori") || "[]");
        let categories = catData.filter(c => c.status === "Aktif").map(c => c.nama);
        if (categories.length === 0) categories = ["Kursi", "Meja", "Pintu", "Kabinet", "Panel"];

        const catFilter = document.getElementById("category-filter");
        const catForm = document.getElementById("form-category");
        if (catFilter) catFilter.innerHTML = '<option value="All">Semua Kategori</option>';
        if (catForm) catForm.innerHTML = '';
        categories.forEach(c => {
            if (catFilter) catFilter.innerHTML += `<option value="${c}">${c}</option>`;
            if (catForm) catForm.innerHTML += `<option value="${c}">${c}</option>`;
        });

        const spData = JSON.parse(localStorage.getItem("woodtrack_master_jenis_kayu") || "[]");
        let speciesList = spData.filter(s => s.status === "Aktif").map(s => s.nama);
        if (speciesList.length === 0) speciesList = ["Jati", "Oak", "Mahoni", "Sengon", "Meranti", "Pinus"];

        const spFilter = document.getElementById("species-filter");
        const spForm = document.getElementById("form-species");
        if (spFilter) spFilter.innerHTML = '<option value="All">Semua Tipe Kayu</option>';
        if (spForm) spForm.innerHTML = '';
        speciesList.forEach(s => {
            if (spFilter) spFilter.innerHTML += `<option value="${s}">${s}</option>`;
            if (spForm) spForm.innerHTML += `<option value="${s}">${s}</option>`;
        });
    },
    onOpenAdd: () => {
        window.removeSelectedImage();
    },
    onEdit: (item) => {
        window.selectedImageBase64 = item.img || "";
        const img = document.getElementById("image-preview-img");
        const span = document.querySelector("#image-preview-container span");
        const removeBtn = document.getElementById("btn-remove-image");
        if (window.selectedImageBase64) {
            img.src = window.selectedImageBase64;
            img.classList.remove("hidden");
            span.classList.add("hidden");
            removeBtn.classList.remove("hidden");
        } else {
            img.src = "";
            img.classList.add("hidden");
            span.classList.remove("hidden");
            removeBtn.classList.add("hidden");
        }
    },
    customFilter: (item) => {
        const catFilter = window.categoryFilterVal || "All";
        const specFilter = window.speciesFilterVal || "All";
        const matchCat = catFilter === "All" || item.category === catFilter;
        const matchSpec = specFilter === "All" || item.species === specFilter;
        return matchCat && matchSpec;
    },
    beforeSubmit: (data) => {
        data.img = window.selectedImageBase64;
        return data;
    },
    logFormatter: (action, item) => {
        const detail = `${item.nama} (${item.code})`;
        return `${action === 'ADD' ? 'Menambahkan' : action === 'EDIT' ? 'Mengubah' : 'Menghapus'} produk: ${detail}`;
    },
    renderRow: (item, globalIndex, statusBadge) => {
        const imgPlaceholder = `<div class="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold font-mono text-[9px] border border-zinc-200 mx-auto select-none uppercase">${item.nama.substring(0,2)}</div>`;
        const imgTag = item.img 
            ? `<div class="w-10 h-10 rounded-lg border border-zinc-200 overflow-hidden mx-auto shadow-sm"><img src="${item.img}" class="w-full h-full object-cover"></div>` 
            : imgPlaceholder;
        return `
            <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
            <td class="py-3 px-4 text-center">${imgTag}</td>
            <td class="py-3 px-4 font-bold text-zinc-900 font-mono">${item.code}</td>
            <td class="py-3 px-4 font-semibold text-zinc-800">${item.nama}</td>
            <td class="py-3 px-4 font-semibold text-zinc-500">${item.category}</td>
            <td class="py-3 px-4 font-semibold text-zinc-500">${item.species || '-'}</td>
            <td class="py-3 px-4 font-medium">${item.dimensi || '-'}</td>
            <td class="py-3 px-4 text-center">${statusBadge}</td>
            <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="editItem('${item.id}')" class="p-1 text-zinc-400 hover:text-amber-600 rounded hover:bg-zinc-50 transition-colors" title="Edit">
                        <i class="fa-solid fa-pen  text-[13px]"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="p-1 text-zinc-400 hover:text-rose-600 rounded hover:bg-zinc-50 transition-colors" title="Hapus">
                        <i class="fa-solid fa-trash-can  text-[13px]"></i>
                    </button>
                </div>
            </td>
        `;
    }
});