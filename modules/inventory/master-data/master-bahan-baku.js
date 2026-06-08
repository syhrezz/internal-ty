const defaultData = [
    { id: "1", code: '5×10×200', tebal: 5, lebar: 10, panjang: 200, volume: 0.0100, status: "Aktif", desc: "Ukuran standar hasil oven 5x10x200 cm" },
    { id: "2", code: '5×15×200', tebal: 5, lebar: 15, panjang: 200, volume: 0.0150, status: "Aktif", desc: "Ukuran standar hasil oven 5x15x200 cm" },
    { id: "3", code: '7×15×400', tebal: 7, lebar: 15, panjang: 400, volume: 0.0420, status: "Aktif", desc: "Papan kering tebal 7x15 cm panjang 4 meter" },
    { id: "4", code: '3×7×300', tebal: 3, lebar: 7, panjang: 300, volume: 0.0063, status: "Aktif", desc: "Papan kering tebal 3x7 cm panjang 3 meter" },
    { id: "5", code: '4×10×400', tebal: 4, lebar: 10, panjang: 400, volume: 0.0160, status: "Aktif", desc: "Papan kering tebal 4x10 cm panjang 4 meter" }
];

window.autoCalculateVolume = () => {
    const tebal = parseFloat(document.getElementById("form-tebal").value) || 0;
    const lebar = parseFloat(document.getElementById("form-lebar").value) || 0;
    const panjang = parseFloat(document.getElementById("form-panjang").value) || 0;
    const volume = (tebal * lebar * panjang) / 1000000;
    document.getElementById("form-volume").value = volume.toFixed(4);
};

new CRUDHelper({
    storageKey: "woodtrack_master_bahan_baku",
    moduleName: "Master Ukuran Oven (Dry)",
    itemName: "code",
    itemNameIndo: "Ukuran Oven (Dry)",
    defaultData: defaultData,
    searchFields: ["code", "desc"],
    statUnit: "ukuran",
    formFieldMap: {
        id: "edit-id",
        code: "form-code",
        tebal: "form-tebal",
        lebar: "form-lebar",
        panjang: "form-panjang",
        volume: "form-volume",
        status: "form-status",
        desc: "form-desc"
    },
    onInit: () => {
        const existing = localStorage.getItem("woodtrack_master_bahan_baku");
        let parsed = [];
        try { parsed = JSON.parse(existing || "[]"); } catch(e) {}
        const isOldSchema = parsed.length > 0 && (parsed[0].category !== undefined || parsed[0].tebal === undefined);
        if (!existing || isOldSchema) {
            localStorage.setItem("woodtrack_master_bahan_baku", JSON.stringify(defaultData));
        }
    },
    onOpenAdd: () => {
        document.getElementById("form-volume").value = "0.0000";
    },
    onEdit: (item) => {
        document.getElementById("form-volume").value = parseFloat(item.volume || 0).toFixed(4);
    },
    beforeSubmit: (data) => {
        data.tebal = parseFloat(data.tebal) || 0;
        data.lebar = parseFloat(data.lebar) || 0;
        data.panjang = parseFloat(data.panjang) || 0;
        data.volume = (data.tebal * data.lebar * data.panjang) / 1000000;
        return data;
    },
    renderRow: (item, globalIndex, statusBadge) => `
        <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
        <td class="py-3 px-4 font-bold text-zinc-900 font-mono">${item.code}</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.tebal || 0).toFixed(1)} cm</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.lebar || 0).toFixed(1)} cm</td>
        <td class="py-3 px-4 text-center font-medium">${parseFloat(item.panjang || 0).toFixed(1)} cm</td>
        <td class="py-3 px-4 text-right font-mono font-semibold text-zinc-800">${parseFloat(item.volume || 0).toFixed(4)} m³</td>
        <td class="py-3 px-4 text-zinc-500 truncate max-w-[200px]" title="${item.desc || ''}">${item.desc || '-'}</td>
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