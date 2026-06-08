const defaultData = [
    { id: "1", code: "A", grade: "Grade A", desc: "Kualitas terbaik, lurus bebas mata kayu mati & retak", status: "Aktif" },
    { id: "2", code: "B", grade: "Grade B", desc: "Kualitas menengah, toleransi sedikit mata kayu sehat", status: "Aktif" },
    { id: "3", code: "C", grade: "Grade C", desc: "Kualitas standar lokal konstruksi ringan", status: "Aktif" },
    { id: "4", code: "D", grade: "Grade D", desc: "Grade terendah untuk bahan core blockboard", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_grade",
    moduleName: "Master Grade",
    itemName: "grade",
    itemNameIndo: "Grade",
    defaultData: defaultData,
    searchFields: ["code", "grade", "desc"],
    statUnit: "grade",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        grade: "form-grade",
        status: "form-status",
        desc: "form-desc"
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold">${item.grade}</td>
        <td class="py-3 px-4 max-w-[300px] truncate text-zinc-500" title="${item.desc || ''}">${item.desc || '-'}</td>
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