const defaultData = [
    { id: "1", code: "KURSI", nama: "Kursi", desc: "Berbagai macam jenis kursi (makan, kantor, santai)", status: "Aktif" },
    { id: "2", code: "MEJA", nama: "Meja", desc: "Berbagai macam jenis meja (makan, kerja, tamu)", status: "Aktif" },
    { id: "3", code: "PINTU", nama: "Pintu", desc: "Pintu kayu solid panel & flush", status: "Aktif" },
    { id: "4", code: "KABINET", nama: "Kabinet", desc: "Lemari pakaian, laci drawer, kitchen cabinet", status: "Aktif" },
    { id: "5", code: "PANEL", nama: "Panel", desc: "Decorative wall panel 3D sengon & veneer", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_produk_kategori",
    moduleName: "Kategori Produk",
    itemName: "nama",
    itemNameIndo: "Kategori Produk",
    defaultData: defaultData,
    searchFields: ["code", "nama", "desc"],
    statUnit: "kategori",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        nama: "form-nama",
        status: "form-status",
        desc: "form-desc"
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 font-semibold text-zinc-800">${item.nama}</td>
        <td class="py-3 px-4 text-zinc-500 max-w-[200px] truncate" title="${item.desc || ''}">${item.desc || '-'}</td>
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