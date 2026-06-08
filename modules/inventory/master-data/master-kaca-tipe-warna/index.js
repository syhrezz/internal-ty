const defaultData = [
    { id: "1", code: "CLR", warna: "Clear / Polos", desc: "Kaca bening transparan biasa tanpa zat pewarna", status: "Aktif" },
    { id: "2", code: "RBN-DARK", warna: "Dark Grey (Riben)", desc: "Kaca riben abu-abu gelap penolak panas matahari", status: "Aktif" },
    { id: "3", code: "RBN-BRZ", warna: "Bronze (Riben Coklat)", desc: "Kaca riben coklat bronze untuk estetika facade mewah", status: "Aktif" },
    { id: "4", code: "FRST", warna: "Frosted (Buram)", desc: "Kaca es buram untuk kamar mandi / partisi privat", status: "Aktif" },
    { id: "5", code: "MIR-SLV", warna: "Silver Mirror (Cermin)", desc: "Kaca cermin reflektif perak standard", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_kaca_tipe_warna",
    moduleName: "Master Kaca Tipe Warna",
    itemName: "warna",
    itemNameIndo: "Tipe Warna Kaca",
    defaultData: defaultData,
    searchFields: ["code", "warna", "desc"],
    statUnit: "tipe",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        warna: "form-warna",
        status: "form-status",
        desc: "form-desc"
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold">${item.warna}</td>
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