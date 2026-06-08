// Setup Form Event Override
document.getElementById("data-form").addEventListener("submit", (e) => {
    handleSubmit(e);
});

const defaultUsers = [
    { id: "1", name: "Admin Utama", email: "admin@woodtrack.id", role: "Super Admin", status: "Aktif", password: "admin" },
    { id: "2", name: "Andi Permadi", email: "andi.permadi@woodtrack.id", role: "Supervisor", status: "Aktif", password: "password123" },
    { id: "3", name: "Siti Rahma", email: "siti.rahma@woodtrack.id", role: "Operator", status: "Aktif", password: "password123" }
];

window.handleRoleFilter = (val) => {
    window.roleFilterVal = val;
    window.crudInstance.applyFilters();
};

window.openResetPasswordModal = (id) => {
    const item = window.crudInstance.masterData.find(x => x.id === id);
    if (!item) return;

    document.getElementById("reset-user-id").value = item.id;
    document.getElementById("reset-user-name").value = item.name;
    document.getElementById("reset-new-password").value = "";
    document.getElementById("reset-confirm-password").value = "";
    document.getElementById("reset-password-modal").classList.add("open");
};

window.closeResetPasswordModal = () => {
    document.getElementById("reset-password-modal").classList.remove("open");
};

window.handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById("reset-user-id").value;
    const newPassword = document.getElementById("reset-new-password").value;
    const confirmPassword = document.getElementById("reset-confirm-password").value;

    if (newPassword !== confirmPassword) {
        alert("Konfirmasi password tidak cocok!");
        return;
    }

    const idx = window.crudInstance.masterData.findIndex(x => x.id === id);
    if (idx !== -1) {
        window.crudInstance.masterData[idx].password = newPassword;
        localStorage.setItem(window.crudInstance.storageKey, JSON.stringify(window.crudInstance.masterData));
        if (window.logActivity) {
            window.logActivity("EDIT", "Master Pengguna", `Mereset password pengguna: ${window.crudInstance.masterData[idx].name}`);
        }
        alert(`Password untuk ${window.crudInstance.masterData[idx].name} berhasil di-reset.`);
    }
    window.closeResetPasswordModal();
};

window.crudInstance = new CRUDHelper({
    storageKey: "woodtrack_master_pengguna",
    moduleName: "Master Pengguna",
    itemName: "name",
    itemNameIndo: "Pengguna",
    defaultData: defaultUsers,
    searchFields: ["name", "email"],
    statUnit: "user",
    formFieldMap: {
        id: "edit-id",
        name: "form-name",
        email: "form-email",
        role: "form-role",
        status: "form-status"
    },
    onInit: () => {
        let masterData = JSON.parse(localStorage.getItem("woodtrack_master_pengguna") || "[]");
        let updated = false;
        masterData.forEach(u => {
            if (!u.password) {
                u.password = "password123";
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem("woodtrack_master_pengguna", JSON.stringify(masterData));
        }

        const rform = document.getElementById("reset-password-form");
        if (rform) {
            rform.addEventListener("submit", window.handleResetPasswordSubmit);
        }
    },
    onOpenAdd: () => {
        const passCont = document.getElementById("form-password-container");
        const passInput = document.getElementById("form-password");
        if (passCont) passCont.classList.remove("hidden");
        if (passInput) passInput.setAttribute("required", "true");
    },
    onEdit: (item) => {
        const passCont = document.getElementById("form-password-container");
        const passInput = document.getElementById("form-password");
        if (passCont) passCont.classList.add("hidden");
        if (passInput) passInput.removeAttribute("required");
    },
    customFilter: (item) => {
        const rFilter = window.roleFilterVal || "All";
        return rFilter === "All" || item.role === rFilter;
    },
    beforeSubmit: (data) => {
        const id = document.getElementById("edit-id").value;
        if (!id) {
            data.password = document.getElementById("form-password").value;
        }
        return data;
    },
    logFormatter: (action, item) => {
        return `${action === 'ADD' ? 'Menambahkan' : action === 'EDIT' ? 'Mengubah' : 'Menghapus'} pengguna: ${item.name} (${item.role})`;
    },
    renderRow: (item, globalIndex, statusBadge) => {
        const roleBadge = item.role === "Super Admin" 
            ? `<span class="px-2 py-0.5 bg-purple-50 text-purple-600 font-bold border border-purple-100 rounded text-[10px]">${item.role}</span>`
            : item.role === "Admin"
            ? `<span class="px-2 py-0.5 bg-amber-50 text-amber-600 font-bold border border-amber-100 rounded text-[10px]">${item.role}</span>`
            : item.role === "Supervisor"
            ? `<span class="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold border border-blue-100 rounded text-[10px]">${item.role}</span>`
            : `<span class="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold border border-zinc-200 rounded text-[10px]">${item.role}</span>`;

        return `
            <td class="py-3 px-4 text-center text-zinc-400 font-bold">${globalIndex}</td>
            <td class="py-3 px-4 font-bold text-zinc-900">${item.name}</td>
            <td class="py-3 px-4 font-medium">${item.email}</td>
            <td class="py-3 px-4">${roleBadge}</td>
            <td class="py-3 px-4 text-center">${statusBadge}</td>
            <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="openResetPasswordModal('${item.id}')" class="p-1 text-zinc-400 hover:text-emerald-600 rounded hover:bg-zinc-50 transition-colors" title="Reset Password">
                        <i class="fa-solid fa-key  text-xs"></i>
                    </button>
                    <button onclick="editItem('${item.id}')" class="p-1 text-zinc-400 hover:text-amber-600 rounded hover:bg-zinc-50 transition-colors" title="Edit">
                        <i class="fa-solid fa-pen  text-[13px]"></i>
                    </button>
                    <button onclick="deleteItem('${item.id}')" class="p-1 text-zinc-400 hover:text-rose-600 rounded hover:bg-zinc-50 transition-colors" title="Hapus">
                        <i class="fa-solid fa-trash-can  text-[13px]"></i>
                    </button>
                </div>
            </td>
        `;
    }
});