// User Authentication and Profile Management
export class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.favorites = this.loadFavorites();
        this.isLoggedIn = false;
    }

    init() {
        this.checkExistingSession();
        this.setupLoginModal();
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                this.updateUserUI();
            } catch (error) {
                console.error('Error loading saved user session:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }

    setupLoginModal() {
        // Create login modal HTML if it doesn't exist
        if (!document.getElementById('loginModal')) {
            this.createLoginModal();
        }
    }

    createLoginModal() {
        const modalHTML = `
            <div id="loginModal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-container" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3 class="modal-title" id="loginModalTitle">Login</h3>
                        <button class="modal-close" id="closeLoginModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <form id="loginForm">
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label for="loginUsername" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Username</label>
                                <input type="text" id="loginUsername" required 
                                       style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                            </div>
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <label for="loginPassword" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
                                <input type="password" id="loginPassword" required 
                                       style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                            </div>
                            <div class="form-group" id="registerFields" style="display: none;">
                                <div style="margin-bottom: 1rem;">
                                    <label for="loginEmail" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
                                    <input type="email" id="loginEmail" 
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label for="loginFullName" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Full Name</label>
                                    <input type="text" id="loginFullName" 
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label for="registerRole" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Role</label>
                                    <select id="registerRole" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                                        <option value="user" selected>User</option>
                                        <option value="university_representative">University Representative</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label for="registerUniversity" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">University</label>
                                    <input type="text" id="registerUniversity" placeholder="University Name" 
                                           style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-light); border-radius: 0.5rem; font-size: 1rem;">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" id="loginSubmitBtn">
                                Login
                            </button>
                        </form>
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span id="toggleAuthText">Don't have an account?</span>
                            <button type="button" id="toggleAuthMode" style="background: none; border: none; color: var(--color-primary); font-weight: 500; cursor: pointer; text-decoration: underline;">
                                Sign Up
                            </button>
                        </div>
                        <div id="loginMessage" style="text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 0.375rem; display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupLoginModalEvents();
    }

    setupLoginModalEvents() {
        const modal = document.getElementById('loginModal');
        const closeBtn = document.getElementById('closeLoginModal');
        const overlay = modal.querySelector('.modal-overlay');
        const form = document.getElementById('loginForm');
        const toggleBtn = document.getElementById('toggleAuthMode');

        // Close modal events
        closeBtn.addEventListener('click', () => this.hideLoginModal());
        overlay.addEventListener('click', () => this.hideLoginModal());

        // Form submission
        form.addEventListener('submit', (e) => this.handleLoginSubmit(e));

        // Toggle between login and register
        toggleBtn.addEventListener('click', () => this.toggleAuthMode());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hideLoginModal();
            }
        });
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.add('active');
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('active');
        this.resetLoginForm();
    }

    toggleAuthMode() {
        const registerFields = document.getElementById('registerFields');
        const toggleText = document.getElementById('toggleAuthText');
        const toggleBtn = document.getElementById('toggleAuthMode');
        const submitBtn = document.getElementById('loginSubmitBtn');
        const modalTitle = document.getElementById('loginModalTitle');
        const emailField = document.getElementById('loginEmail');
        const fullNameField = document.getElementById('loginFullName');

        const isLogin = registerFields.style.display === 'none';

        if (isLogin) {
            // Switch to register mode
            registerFields.style.display = 'block';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Login';
            submitBtn.textContent = 'Register';
            modalTitle.textContent = 'Register';
            emailField.required = true;
            fullNameField.required = true;
        } else {
            // Switch to login mode
            registerFields.style.display = 'none';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Sign Up';
            submitBtn.textContent = 'Login';
            modalTitle.textContent = 'Login';
            emailField.required = false;
            fullNameField.required = false;
        }
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const isRegisterMode = document.getElementById('registerFields').style.display !== 'none';

        if (isRegisterMode) {
            this.handleRegister(username, password);
        } else {
            this.handleLogin(username, password);
        }
    }

    handleRegister(username, password) {
        const email = document.getElementById('loginEmail').value.trim();
        const fullName = document.getElementById('loginFullName').value.trim();
        const roleSelect = document.getElementById('registerRole');
        const selectedRole = roleSelect ? roleSelect.value : 'user';
        const universitySelect = document.getElementById('registerUniversity');
        const selectedUniversity = universitySelect ? universitySelect.value : null;

        // Validation
        if (username.length < 3) {
            this.showLoginMessage('Username must be at least 3 characters long.', 'error');
            return;
        }

        if (password.length < 6) {
            this.showLoginMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showLoginMessage('Username already exists. Please choose another.', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showLoginMessage('Email already registered. Please use another email.', 'error');
            return;
        }

        // Create new user
        const newUser = {
            username,
            password: this.hashPassword(password),
            email,
            fullName,
            role: selectedRole,
            university: selectedRole === 'university_representative' ? selectedUniversity : null,
            joinDate: new Date().toISOString(),
            favorites: [],
            preferences: {
                theme: 'light',
                notifications: true
            }
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto login after registration
        this.loginUser(newUser);
        this.showLoginMessage('Registration successful! Welcome!', 'success');
        setTimeout(() => this.hideLoginModal(), 1500);
    }

    handleLogin(username, password) {
        // Check for admin login
        if (username === 'admin' && password === 'admin') {
            this.loginUser({
                username: 'admin',
                fullName: 'Administrator',
                email: 'admin@koreanuniversities.com',
                role: 'admin',
                joinDate: new Date().toISOString()
            });
            this.showLoginMessage('Admin login successful!', 'success');
            setTimeout(() => this.hideLoginModal(), 1500);
            return;
        }

        // Check regular users
        const user = this.users.find(u => u.username === username);
        
        if (!user) {
            this.showLoginMessage('User not found. Please check your username.', 'error');
            return;
        }

        if (user.password !== this.hashPassword(password)) {
            this.showLoginMessage('Incorrect password. Please try again.', 'error');
            return;
        }

        // Successful login
        this.loginUser(user);
        this.showLoginMessage('Login successful!', 'success');
        setTimeout(() => this.hideLoginModal(), 1500);
    }

    loginUser(user) {
        this.currentUser = { ...user };
        delete this.currentUser.password; // Don't store password in session
        this.isLoggedIn = true;
        
        // Save session
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Load user's favorites
        this.favorites = user.favorites || [];
        this.saveFavorites();
        
        this.updateUserUI();
        this.dispatchLoginEvent();
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.favorites = [];
        
        // Clear session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userFavorites');
        
        this.updateUserUI();
        this.dispatchLogoutEvent();
    }

    updateUserUI() {
        const userName = document.getElementById('userName');
        const userStatus = document.getElementById('userStatus');
        const loginBtn = document.getElementById('loginBtn');
        const adminBtn = document.getElementById('adminBtn');

        if (this.isLoggedIn && this.currentUser) {
            if (userName) userName.textContent = this.currentUser.fullName || this.currentUser.username;
            if (userStatus) userStatus.textContent = 'Logged in';
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
                loginBtn.onclick = () => this.logout();
            }
            
            // Show admin button if admin
            if (adminBtn) {
                if (this.isAdmin() || this.isRepresentative()) {
                    adminBtn.style.display = 'block';
                } else {
                    adminBtn.style.display = 'none';
                }
            }
        } else {
            if (userName) userName.textContent = 'Guest User';
            if (userStatus) userStatus.textContent = 'Not logged in';
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login / Register</span>';
                loginBtn.onclick = () => this.showLoginModal();
            }
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    showLoginMessage(message, type) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        // Style based on type
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#10b981';
            messageDiv.style.color = 'white';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#ef4444';
            messageDiv.style.color = 'white';
        }
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    resetLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) form.reset();
        
        const messageDiv = document.getElementById('loginMessage');
        if (messageDiv) messageDiv.style.display = 'none';
        
        // Reset to login mode
        const registerFields = document.getElementById('registerFields');
        if (registerFields && registerFields.style.display !== 'none') {
            this.toggleAuthMode();
        }
    }

    // Favorites management
    addFavorite(universityName) {
        if (!this.favorites.includes(universityName)) {
            this.favorites.push(universityName);
            this.saveFavorites();
            this.updateUserFavorites();
            return true;
        }
        return false;
    }

    removeFavorite(universityName) {
        const index = this.favorites.indexOf(universityName);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.updateUserFavorites();
            return true;
        }
        return false;
    }

    isFavorite(universityName) {
        return this.favorites.includes(universityName);
    }

    getFavorites() {
        return [...this.favorites];
    }

    updateUserFavorites() {
        if (this.currentUser && this.isLoggedIn) {
            const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
            if (userIndex > -1) {
                this.users[userIndex].favorites = [...this.favorites];
                this.saveUsers();
            }
        }
    }

    // Data persistence
    loadUsers() {
        try {
            const saved = localStorage.getItem('registeredUsers');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('registeredUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('userFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('userFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    // Utility methods
    hashPassword(password) {
        // Simple hash function for demo purposes
        // In production, use proper password hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    dispatchLoginEvent() {
        window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: this.currentUser }
        }));
    }

    dispatchLogoutEvent() {
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    // Getters
    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    isAdmin() {
        return this.isLoggedIn && this.currentUser && this.currentUser.role === 'admin';
    }
    isRepresentative() {
        return this.isLoggedIn && this.currentUser && this.currentUser.role === 'university_representative';
    }
    isUser() {
        return this.isLoggedIn && this.currentUser && this.currentUser.role === 'user';
    }
    isGuest() {
        return !this.isLoggedIn;
    }

    // User profile methods
    updateProfile(updates) {
        if (!this.isLoggedIn) return false;

        const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex > -1) {
            // Update user in users array
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            
            // Update current user session
            this.currentUser = { ...this.currentUser, ...updates };
            delete this.currentUser.password;
            
            // Save changes
            this.saveUsers();
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.updateUserUI();
            return true;
        }
        return false;
    }

    deleteAccount() {
        if (!this.isLoggedIn) return false;

        const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);
            this.saveUsers();
            this.logout();
            return true;
        }
        return false;
    }

    getUserStats() {
        if (!this.isLoggedIn) return null;

        return {
            username: this.currentUser.username,
            fullName: this.currentUser.fullName,
            email: this.currentUser.email,
            joinDate: this.currentUser.joinDate,
            favoritesCount: this.favorites.length,
            role: this.currentUser.role
        };
    }
}