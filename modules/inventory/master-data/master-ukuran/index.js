const defaultData = [
    { id: "1", code: "A1", size: "A1 (10-19 cm)", minVal: 10, maxVal: 19, desc: "Diameter kecil kelas log rakyat", status: "Aktif" },
    { id: "2", code: "A2", size: "A2 (20-29 cm)", minVal: 20, maxVal: 29, desc: "Diameter sedang standard core", status: "Aktif" },
    { id: "3", code: "A3", size: "A3 (30-39 cm)", minVal: 30, maxVal: 39, desc: "Diameter besar untuk sawtimber papan", status: "Aktif" },
    { id: "4", code: "A4", size: "A4 (40-49 cm)", minVal: 40, maxVal: 49, desc: "Diameter besar premium", status: "Aktif" },
    { id: "5", code: "A5", size: "A5 (>= 50 cm)", minVal: 50, maxVal: 999, desc: "Diameter super jumbo premium", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_ukuran",
    moduleName: "Master Ukuran Log",
    itemName: "size",
    itemNameIndo: "Ukuran Log",
    defaultData: defaultData,
    searchFields: ["code", "size", "desc"],
    statUnit: "ukuran",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        size: "form-size",
        minVal: "form-min",
        maxVal: "form-max",
        status: "form-status",
        desc: "form-desc"
    },
    beforeSubmit: (data) => {
        data.minVal = parseInt(data.minVal) || 0;
        data.maxVal = parseInt(data.maxVal) || 0;
        return data;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold">${item.size}</td>
        <td class="py-3 px-4 text-center font-medium text-zinc-600">${item.minVal} cm</td>
        <td class="py-3 px-4 text-center font-medium text-zinc-600">${item.maxVal >= 999 ? '>= 50' : item.maxVal + ' cm'}</td>
        <td class="py-3 px-4 max-w-[250px] truncate text-zinc-500" title="${item.desc || ''}">${item.desc || '-'}</td>
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