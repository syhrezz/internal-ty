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
    // ── Dynamic URL Resolution for Server Deployments (e.g., Vercel) ──
    const isLocalFile = window.location.protocol === 'file:';
    if (!isLocalFile) {
        const linksToResolve = document.querySelectorAll('aside a, #profile-dropdown a');
        linksToResolve.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#')) {
                // Strip any leading ./ or / and prefix with /admin/
                const cleanHref = href.replace(/^\.?\/?(admin\/)?/, '');
                link.setAttribute('href', '/admin/' + cleanHref);
            }
        });
    }

    // ── Sidebar Toggle Functionality ──
    const sidebar = document.querySelector('aside');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    // Create mobile backdrop if not present
    let backdrop = document.getElementById('sidebar-mobile-backdrop');
    if (!backdrop && sidebar) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebar-mobile-backdrop';
        backdrop.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden transition-opacity duration-200 opacity-0';
        document.body.appendChild(backdrop);
    }
    
    function openMobileSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('mobile-open');
        if (backdrop) {
            backdrop.classList.remove('hidden');
            setTimeout(() => {
                backdrop.classList.add('opacity-100');
            }, 10);
        }
    }
    
    function closeMobileSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('mobile-open');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            setTimeout(() => {
                backdrop.classList.add('hidden');
            }, 200);
        }
    }
    
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.innerWidth < 768) {
                if (sidebar.classList.contains('mobile-open')) {
                    closeMobileSidebar();
                } else {
                    openMobileSidebar();
                }
            } else {
                sidebar.classList.toggle('sidebar-collapsed');
                const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
                localStorage.setItem('sidebar-collapsed', isCollapsed);
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMobileSidebar);
    }

    // Close mobile sidebar when clicking on a navigation/submenu link on mobile
    const navLinks = document.querySelectorAll('aside nav a, aside nav button');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeMobileSidebar();
            }
        });
    });

    // Restore sidebar state from localStorage on load (desktop only)
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed && sidebar && window.innerWidth >= 768) {
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

// Global function to log user actions across the system
window.logActivity = function(action, category, details) {
    try {
        const logs = JSON.parse(localStorage.getItem('woodtrack_system_logs') || '[]');
        const user = localStorage.getItem('admin_name') || 'Admin';
        const timestamp = new Date().toISOString();
        
        logs.unshift({
            id: String(Date.now() + Math.random()),
            timestamp,
            user,
            action,     // 'TAMBAH', 'EDIT', 'HAPUS', etc.
            category,   // 'Master Log', 'Master Sawtimber', etc.
            details
        });
        
        // Cap logs at 500 entries to manage localStorage space
        if (logs.length > 500) {
            logs.length = 500;
        }
        
        localStorage.setItem('woodtrack_system_logs', JSON.stringify(logs));
    } catch (e) {
        console.error('Error logging activity:', e);
    }
};
