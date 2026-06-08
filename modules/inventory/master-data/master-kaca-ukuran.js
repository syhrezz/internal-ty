const defaultData = [
    { id: "1", code: "DIM-1824", nama: "1829 x 2440 mm", panjang: 2440, lebar: 1829, desc: "Ukuran kaca lembaran standard kecil", status: "Aktif" },
    { id: "2", code: "DIM-1830", nama: "1830 x 3050 mm", panjang: 3050, lebar: 1830, desc: "Ukuran kaca medium", status: "Aktif" },
    { id: "3", code: "DIM-2143", nama: "2134 x 3048 mm", panjang: 3048, lebar: 2134, desc: "Ukuran kaca standard sedang", status: "Aktif" },
    { id: "4", code: "DIM-2443", nama: "2440 x 3660 mm", panjang: 3660, lebar: 2440, desc: "Ukuran jumbo sheet kaca proyek besar", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_kaca_ukuran",
    moduleName: "Master Kaca Ukuran",
    itemName: "nama",
    itemNameIndo: "Ukuran Kaca",
    defaultData: defaultData,
    searchFields: ["code", "nama", "desc"],
    statUnit: "ukuran",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        nama: "form-nama",
        panjang: "form-panjang",
        lebar: "form-lebar",
        status: "form-status",
        desc: "form-desc"
    },
    beforeSubmit: (data) => {
        data.panjang = parseInt(data.panjang) || 0;
        data.lebar = parseInt(data.lebar) || 0;
        return data;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900 font-mono">${item.code}</td>
        <td class="py-3 px-4 font-semibold">${item.nama}</td>
        <td class="py-3 px-4 text-center font-medium">${item.panjang} mm</td>
        <td class="py-3 px-4 text-center font-medium">${item.lebar} mm</td>
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