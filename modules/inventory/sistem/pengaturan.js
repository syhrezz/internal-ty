// Seed settings on load
        window.addEventListener('DOMContentLoaded', () => {
            const savedName = localStorage.getItem('admin_name') || 'Admin';
            const savedEmail = localStorage.getItem('admin_email') || 'admin@woodtrack.id';
            
            document.getElementById('admin-name').value = savedName;
            document.getElementById('admin-email').value = savedEmail;
            
            // Sync current profile tags
            updateProfileUI(savedName, savedEmail);
        });

        function updateProfileUI(name, email) {
            const nameEl = document.getElementById('nav-profile-name');
            const emailEl = document.getElementById('nav-profile-email');
            const avatarEl = document.getElementById('avatar-initial');
            
            if (nameEl) nameEl.textContent = name;
            if (emailEl) emailEl.textContent = email;
            if (avatarEl && name.length > 0) avatarEl.textContent = name.charAt(0).toUpperCase();
        }

        

        function saveSettings() {
            const name = document.getElementById('admin-name').value.trim();
            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-password').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;

            if (!name || !email) {
                showToast('Nama Lengkap dan Email tidak boleh kosong.', 'error');
                return;
            }

            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    showToast('Konfirmasi password tidak cocok.', 'error');
                    return;
                }
                if (password.length < 6) {
                    showToast('Password minimal harus 6 karakter.', 'error');
                    return;
                }
            }

            // Save to localStorage
            localStorage.setItem('admin_name', name);
            localStorage.setItem('admin_email', email);
            if (password) {
                localStorage.setItem('admin_password', password);
            }

            // Update UI elements in settings page
            updateProfileUI(name, email);
            
            showToast('Pengaturan profil berhasil disimpan!');

            // Optional: reset password fields
            document.getElementById('admin-password').value = '';
            document.getElementById('admin-confirm-password').value = '';
        }