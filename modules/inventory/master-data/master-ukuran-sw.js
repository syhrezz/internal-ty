const defaultData = [
    { id: "1", code: "SWT-3X10", tebal: 3.0, lebar: 10.0, panjang: 200, desc: "Papan sawtimber tebal 3 lebar 10 panjang 2 meter", status: "Aktif" },
    { id: "2", code: "SWT-5X10", tebal: 5.0, lebar: 10.0, panjang: 200, desc: "Kaso balok sawtimber tebal 5 lebar 10 panjang 2 meter", status: "Aktif" },
    { id: "3", code: "SWT-3X15", tebal: 3.0, lebar: 15.0, panjang: 300, desc: "Papan lebar 15 cm panjang 3 meter", status: "Aktif" },
    { id: "4", code: "SWT-4X20", tebal: 4.0, lebar: 20.0, panjang: 250, desc: "Papan jati lebar 20 cm panjang 2.5 meter", status: "Aktif" },
    { id: "5", code: "SWT-5X5", tebal: 5.0, lebar: 5.0, panjang: 200, desc: "Kaso pinus 5x5 cm panjang 2 meter", status: "Non-Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_ukuran_sw",
    moduleName: "Master Ukuran Sawtimber",
    itemName: "code",
    itemNameIndo: "Ukuran Sawtimber",
    defaultData: defaultData,
    searchFields: ["code", "desc"],
    statUnit: "ukuran",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        tebal: "form-tebal",
        lebar: "form-lebar",
        panjang: "form-panjang",
        status: "form-status",
        desc: "form-desc"
    },
    beforeSubmit: (data) => {
        data.tebal = parseFloat(data.tebal) || 0;
        data.lebar = parseFloat(data.lebar) || 0;
        data.panjang = parseFloat(data.panjang) || 0;
        return data;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.tebal).toFixed(1)} cm</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.lebar).toFixed(1)} cm</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.panjang).toFixed(1)} cm</td>
        <td class="py-3 px-4 max-w-[200px] truncate text-zinc-500" title="${item.desc || ''}">${item.desc || '-'}</td>
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