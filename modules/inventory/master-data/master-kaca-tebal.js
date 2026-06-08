const defaultData = [
    { id: "1", code: "THK-3", tebal: 3.0, desc: "Tebal kaca 3mm untuk jendela kecil", status: "Aktif" },
    { id: "2", code: "THK-5", tebal: 5.0, desc: "Tebal kaca 5mm standard mebel / jendela", status: "Aktif" },
    { id: "3", code: "THK-8", tebal: 8.0, desc: "Tebal kaca 8mm pembatas / sekat", status: "Aktif" },
    { id: "4", code: "THK-10", tebal: 10.0, desc: "Tebal kaca 10mm tempered door / shower screen", status: "Aktif" },
    { id: "5", code: "THK-12", tebal: 12.0, desc: "Tebal kaca 12mm premium structural glass", status: "Aktif" }
];

new CRUDHelper({
    storageKey: "woodtrack_master_kaca_tebal",
    moduleName: "Master Kaca Tebal",
    itemName: "tebal",
    itemNameIndo: "Tebal Kaca",
    defaultData: defaultData,
    searchFields: ["code", "tebal", "desc"],
    statUnit: "item",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        tebal: "form-tebal",
        status: "form-status",
        desc: "form-desc"
    },
    beforeSubmit: (data) => {
        data.tebal = parseFloat(data.tebal) || 0;
        return data;
    },
    logFormatter: (action, item) => {
        const detail = `${item.code} (${item.tebal} mm)`;
        return `${action === 'ADD' ? 'Menambahkan' : action === 'EDIT' ? 'Mengubah' : 'Menghapus'} tebal kaca: ${detail}`;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900">${item.code}</td>
        <td class="py-3 px-4 text-center font-bold">${parseFloat(item.tebal).toFixed(1)} mm</td>
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