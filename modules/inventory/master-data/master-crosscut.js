const defaultData = [
    { id: "1", code: "CRS-MAP-2257", sumber: "Maple Premium Sports Floor Face", jenis: "Maple", tebal: 22, lebar: 57, panjang: 180.0, toleransi: 1, grade: "Select Floor", status: "Aktif", desc: "Top layer solid flooring board untuk lapangan basket" },
    { id: "2", code: "CRS-MAP-2283", sumber: "Maple Select Sports Floor Face", jenis: "Maple", tebal: 22, lebar: 83, panjang: 180.0, toleransi: 1, grade: "Select Floor", status: "Aktif", desc: "Top layer wide board solid flooring" },
    { id: "3", code: "CRS-HEV-2570", sumber: "Hevea Core Spacer Board", jenis: "Hevea", tebal: 25, lebar: 70, panjang: 120.0, toleransi: 2, grade: "Subfloor Core", status: "Aktif", desc: "Subfloor core spacer rubberwood" },
    { id: "4", code: "CRS-PIN-5010", sumber: "Sleeper Pinus treated", jenis: "Pinus", tebal: 50, lebar: 100, panjang: 200.0, toleransi: 3, grade: "Subfloor Core", status: "Aktif", desc: "Sleeper bantalan subfloor pine" },
    { id: "5", code: "CRS-SGN-120", sumber: "Kupasan Sengon Core", jenis: "Sengon", tebal: 15, lebar: 90, panjang: 120.0, toleransi: 5, grade: "Grade B", status: "Non-Aktif", desc: "Bahan core backing standard" }
];

window.crudInstance = new CRUDHelper({
    storageKey: "woodtrack_master_crosscut",
    moduleName: "Master Crosscut",
    itemName: "sumber",
    itemNameIndo: "Master Crosscut",
    defaultData: defaultData,
    searchFields: ["code", "sumber", "jenis", "grade"],
    statUnit: "item",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        sumber: "form-sumber",
        jenis: "form-jenis",
        grade: "form-grade",
        tebal: "form-tebal",
        lebar: "form-lebar",
        panjang: "form-panjang",
        toleransi: "form-toleransi",
        status: "form-status",
        desc: "form-desc"
    },
    onInit: () => {
        let masterData = JSON.parse(localStorage.getItem("woodtrack_master_crosscut") || "[]");
        let migrated = false;
        masterData.forEach(item => {
            if (item.sumber === undefined) {
                item.sumber = item.desc || "Sisa potongan";
                migrated = true;
            }
            if (item.tebal === undefined) {
                item.tebal = 20;
                migrated = true;
            }
            if (item.lebar === undefined) {
                item.lebar = 80;
                migrated = true;
            }
        });
        if (migrated) {
            localStorage.setItem("woodtrack_master_crosscut", JSON.stringify(masterData));
        }

        window.handleWoodFilter = (val) => {
            window.woodFilterVal = val;
            window.crudInstance.applyFilters();
        };
    },
    customFilter: (item) => {
        const woodFilter = window.woodFilterVal || "All";
        return woodFilter === "All" || item.jenis === woodFilter;
    },
    beforeSubmit: (data) => {
        data.tebal = parseFloat(data.tebal) || 0;
        data.lebar = parseFloat(data.lebar) || 0;
        data.panjang = parseFloat(data.panjang) || 0;
        data.toleransi = parseInt(data.toleransi) || 0;
        return data;
    },
    logFormatter: (action, item) => {
        const detail = `${item.code} (${item.sumber}, ${item.jenis}, ${item.tebal}x${item.lebar}x${item.panjang}cm)`;
        return `${action === 'ADD' ? 'Menambahkan' : action === 'EDIT' ? 'Mengubah' : 'Menghapus'} spesifikasi crosscut: ${detail}`;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold text-zinc-800">${item.sumber}</td>
        <td class="py-3 px-4 font-semibold">${item.jenis}</td>
        <td class="py-3 px-4 text-center font-medium">${item.tebal}</td>
        <td class="py-3 px-4 text-center font-medium">${item.lebar}</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.panjang).toFixed(1)}</td>
        <td class="py-3 px-4 text-center font-medium">± ${item.toleransi}</td>
        <td class="py-3 px-4 font-semibold text-zinc-600">${item.grade}</td>
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
    `
});