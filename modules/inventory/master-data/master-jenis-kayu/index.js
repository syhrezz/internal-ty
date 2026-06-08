const defaultData = [
    { id: "1", code: "SGN", jenis: "Sengon", desc: "Kayu Sengon (Albasia) berbobot ringan untuk core sawtimber", status: "Aktif" },
    { id: "2", code: "MHN", jenis: "Mahoni", desc: "Kayu Mahoni serat halus untuk furniture premium", status: "Aktif" },
    { id: "3", code: "MRT", jenis: "Meranti", desc: "Kayu Meranti Merah grade konstruksi kuat", status: "Aktif" },
    { id: "4", code: "JAT", jenis: "Jati", desc: "Kayu Jati premium kualitas ekspor awet kelas I", status: "Aktif" },
    { id: "5", code: "PIN", jenis: "Pinus", desc: "Kayu Pinus serat indah untuk dekorasi interior", status: "Non-Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_jenis_kayu",
    moduleName: "Master Jenis Kayu",
    itemName: "jenis",
    itemNameIndo: "Jenis Kayu",
    defaultData: defaultData,
    searchFields: ["code", "jenis", "desc"],
    statUnit: "jenis",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        jenis: "form-jenis",
        status: "form-status",
        desc: "form-desc"
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold">${item.jenis}</td>
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