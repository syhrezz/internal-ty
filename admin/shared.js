// ── Shared JavaScript for WoodTrack Admin UI/UX ──

// Global toggleMenu override to handle auto-expanding collapsed sidebar
window.toggleMenu = function(id) {
    const sidebar = document.querySelector('aside');
    if (sidebar && sidebar.classList.contains('sidebar-collapsed')) {
        sidebar.classList.remove('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', 'false');
    }
    const menu = document.getElementById(id + '-menu');
    const chevron = document.getElementById(id + '-chevron');
    if (menu) menu.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
};

document.addEventListener('DOMContentLoaded', () => {
    // ── Sidebar Toggle Functionality ──
    const sidebar = document.querySelector('aside');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('sidebar-collapsed');
            const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
            localStorage.setItem('sidebar-collapsed', isCollapsed);
        });
    }

    // Restore sidebar state from localStorage on load
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed && sidebar) {
        sidebar.classList.add('sidebar-collapsed');
    }

    // ── Profile Dropdown Functionality ──
    const profileBtn = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = profileDropdown.classList.contains('hidden');
            if (isHidden) {
                // Open dropdown
                profileDropdown.classList.remove('hidden');
                // Trigger transition
                setTimeout(() => {
                    profileDropdown.classList.remove('opacity-0', 'scale-95');
                    profileDropdown.classList.add('opacity-100', 'scale-100');
                }, 10);
            } else {
                // Close dropdown
                closeDropdown();
            }
        });

        function closeDropdown() {
            profileDropdown.classList.remove('opacity-100', 'scale-100');
            profileDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
            }, 150);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                if (!profileDropdown.classList.contains('hidden')) {
                    closeDropdown();
                }
            }
        });

        // Sync profile details across pages
        const savedName = localStorage.getItem('admin_name');
        const savedEmail = localStorage.getItem('admin_email');
        if (savedName) {
            const nameEl = profileBtn.querySelector('.text-left p:first-child');
            if (nameEl) nameEl.textContent = savedName;
            const avatarEl = profileBtn.querySelector('div');
            if (avatarEl && savedName.length > 0) avatarEl.textContent = savedName.charAt(0).toUpperCase();
        }
        if (savedEmail) {
            const emailEl = profileBtn.querySelector('.text-left p:last-child');
            if (emailEl) emailEl.textContent = savedEmail;
        }
    }

    // ── Live Datetime Clock Functionality ──
    const liveDatetimeEl = document.getElementById('live-datetime');
    if (liveDatetimeEl) {
        function updateClock() {
            const now = new Date();
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            
            const dayName = days[now.getDay()];
            const dateVal = String(now.getDate()).padStart(2, '0');
            const monthName = months[now.getMonth()];
            const yearVal = now.getFullYear();
            
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            liveDatetimeEl.textContent = `${dayName}, ${dateVal} ${monthName} ${yearVal} ${hours}:${minutes}:${seconds}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }
});
