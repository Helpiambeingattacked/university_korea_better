import { UniversityManager } from './university-manager.js';
import { UIManager } from './ui-manager.js';
import { UserManager } from './user-manager.js';
import { SearchManager } from './search-manager.js';
import { ThemeManager } from './theme-manager.js';

class App {
    constructor() {
        this.universityManager = new UniversityManager();
        this.uiManager = new UIManager();
        this.userManager = new UserManager();
        this.searchManager = new SearchManager();
        this.themeManager = new ThemeManager();
        
        this.currentFilters = {
            region: 'all',
            type: 'all',
            search: ''
        };
        
        this.currentSort = 'name-asc';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        this.init();
    }

    async init() {
        try {
            this.showLoading(true);
            await this.loadUniversities();
            this.setupEventListeners();
            this.initializeManagers();
            this.renderUniversities();
            this.animateStats();
            this.showLoading(false);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load university data. Please refresh the page.');
            this.showLoading(false);
        }
    }

    async loadUniversities() {
        // Check for local edits first
        const localData = localStorage.getItem('universities');
        if (localData) {
            this.universityManager.setUniversities(JSON.parse(localData));
            return;
        }

        try {
            const response = await fetch('./src/data/universities_auto.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.universityManager.setUniversities(data);
        } catch (error) {
            // Fallback to main universities.json
            try {
                const response = await fetch('./src/data/universities.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.universityManager.setUniversities(data);
            } catch (fallbackError) {
                throw new Error('Could not load university data from any source');
            }
        }
    }

    initializeManagers() {
        this.uiManager.init();
        this.userManager.init();
        this.searchManager.init();
        this.themeManager.init();
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigationListeners();
        
        // Search
        this.setupSearchListeners();
        
        // Filters
        this.setupFilterListeners();
        
        // User interactions
        this.setupUserListeners();
        
        // Theme toggle
        this.setupThemeListeners();
        
        // Mobile menu
        this.setupMobileMenuListeners();
        
        // Modal
        this.setupModalListeners();
    }

    setupNavigationListeners() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Hero buttons
        document.getElementById('exploreBtn')?.addEventListener('click', () => {
            this.navigateToSection('universities');
        });

        document.getElementById('learnMoreBtn')?.addEventListener('click', () => {
            this.navigateToSection('about');
        });
    }

    setupSearchListeners() {
        const searchToggle = document.getElementById('searchToggle');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchClose = document.getElementById('searchClose');
        const globalSearch = document.getElementById('globalSearch');

        searchToggle?.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            globalSearch.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchOverlay?.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });

        globalSearch?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Escape key to close search
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    setupFilterListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = btn.dataset.type;
                const filterValue = btn.dataset.filter;
                this.applyFilter(filterType, filterValue, btn);
            });
        });

        // Reset filters
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Sort toggle
        document.getElementById('sortToggle')?.addEventListener('click', (e) => {
            this.toggleSort(e.currentTarget);
        });

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreUniversities();
        });
    }

    setupUserListeners() {
        // Reset Filters
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Sort Toggle
        document.getElementById('sortToggle')?.addEventListener('click', (e) => {
            this.toggleSort(e.currentTarget);
        });

        // Removed redundant Theme Toggle event listener here to avoid double toggling
        // Theme Toggle event listener is already set up in theme-manager.js

        // Search Toggle
        document.getElementById('searchToggle')?.addEventListener('click', () => {
            document.getElementById('searchOverlay').classList.add('active');
            document.getElementById('globalSearch').focus();
        });

        // Search Close
        document.getElementById('searchClose')?.addEventListener('click', () => {
            document.getElementById('searchOverlay').classList.remove('active');
        });

        // User Menu Toggle
        document.getElementById('userMenuToggle')?.addEventListener('click', (e) => {
            const menu = document.getElementById('userMenu');
            const btn = e.currentTarget;
            const rect = btn.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = `${rect.bottom + 8}px`; // 8px gap below the button
            menu.style.right = `${window.innerWidth - rect.right}px`;
            menu.classList.toggle('active');
        });

        // Favorites Button
        document.getElementById('favoritesBtn')?.addEventListener('click', () => {
            this.showFavorites();
        });

        // Settings Button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Admin Panel Button
        document.getElementById('adminBtn')?.addEventListener('click', () => {
            this.showAdminPanel();
        });

        // Login Button
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.userManager.showLoginModal();
        });

        // Representative Register Button
        document.getElementById('repRegisterBtn')?.addEventListener('click', () => {
            this.showRepRegisterModal();
        });

        // Change Password Button (in dropdown/profile)
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            // Only allow if logged in
            if (this.userManager.isLoggedIn) {
                this.showChangePasswordModal();
            } else {
                this.uiManager.showModal('<p>Please log in to change your password.</p>', 'Not Logged In');
            }
        });
    }

    setupThemeListeners() {
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.themeManager.toggle();
        });
    }

    setupMobileMenuListeners() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        mobileMenuToggle?.addEventListener('click', () => {
            // Mobile menu implementation
            console.log('Mobile menu clicked');
        });
    }

    setupModalListeners() {
        const modal = document.getElementById('universityModal');
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');

        modalClose?.addEventListener('click', () => {
            this.closeModal();
        });

        modalOverlay?.addEventListener('click', () => {
            this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    navigateToSection(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Show/hide sections
        const sections = ['homeSection', 'universitiesSection', 'aboutSection'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleSearch(query) {
        this.currentFilters.search = query.toLowerCase();
        this.currentPage = 1;
        this.renderUniversities();
        
        // Show suggestions
        this.searchManager.showSuggestions(query, this.universityManager.getUniversities());
    }

    applyFilter(filterType, filterValue, buttonElement) {
        // Update filter state
        this.currentFilters[filterType] = filterValue;
        this.currentPage = 1;

        // Update UI
        const filterGroup = buttonElement.parentElement;
        filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Re-render universities
        this.renderUniversities();
    }

    resetFilters() {
        this.currentFilters = {
            region: 'all',
            type: 'all',
            search: ''
        };
        this.currentPage = 1;

        // Reset UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });

        // Clear search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.value = '';
        }

        this.renderUniversities();
    }

    toggleSort(buttonElement) {
        if (this.currentSort === 'name-asc') {
            this.currentSort = 'name-desc';
            buttonElement.innerHTML = '<i class="fas fa-sort"></i> Sort Z-A';
        } else {
            this.currentSort = 'name-asc';
            buttonElement.innerHTML = '<i class="fas fa-sort"></i> Sort A-Z';
        }
        
        this.renderUniversities();
    }

    renderUniversities() {
        const universities = this.getFilteredUniversities();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageUniversities = universities.slice(0, endIndex);

        const grid = document.getElementById('universityGrid');
        if (!grid) return;

        // Clear grid
        grid.innerHTML = '';

        // Render universities
        pageUniversities.forEach(university => {
            const card = this.createUniversityCard(university);
            grid.appendChild(card);
        });

        // Update load more button
        this.updateLoadMoreButton(universities.length, endIndex);

        // Animate cards
        this.animateCards();
    }

    getFilteredUniversities() {
        let universities = this.universityManager.getUniversities();

        // Apply filters
        universities = universities.filter(uni => {
            const matchesRegion = this.currentFilters.region === 'all' || 
                                 uni.region === this.currentFilters.region;
            const matchesType = this.currentFilters.type === 'all' || 
                               uni.type === this.currentFilters.type;
            const matchesSearch = this.currentFilters.search === '' ||
                                 uni.name.toLowerCase().includes(this.currentFilters.search) ||
                                 uni.region.toLowerCase().includes(this.currentFilters.search) ||
                                 (uni.description && uni.description.toLowerCase().includes(this.currentFilters.search));

            return matchesRegion && matchesType && matchesSearch;
        });

        // Apply sorting
        universities.sort((a, b) => {
            if (this.currentSort === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

        return universities;
    }

    createUniversityCard(university) {
        const card = document.createElement('div');
        card.className = 'university-card';
        card.setAttribute('data-university', university.name);

        const favoriteStatus = this.userManager.isFavorite(university.name);
        const logoSrc = this.getUniversityLogo(university);

        card.innerHTML = `
            <div class="card-header">
                <div class="university-logo">
                    ${logoSrc ? `<img src="${logoSrc}" alt="${university.name} logo">` : 
                      `<i class="fas fa-university"></i>`}
                </div>
            </div>
            <div class="card-content">
                <h3 class="university-name">${university.name}</h3>
                <span class="university-type">${university.type}</span>
                <div class="university-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${university.region}</span>
                </div>
                <p class="university-description">
                    ${university.description || 'Prestigious university in South Korea offering excellent education and research opportunities.'}
                </p>
                <div class="card-actions">
                    <button class="favorite-btn ${favoriteStatus ? 'active' : ''}" 
                            data-university="${university.name}"
                            title="${favoriteStatus ? 'Remove from favorites' : 'Add to favorites'}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="learn-more-btn" data-university="${university.name}">
                        Learn More
                    </button>
                </div>
            </div>
        `;

        // Event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                this.showUniversityModal(university);
            }
        });

        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(university.name, favoriteBtn);
        });

        const learnMoreBtn = card.querySelector('.learn-more-btn');
        learnMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showUniversityModal(university);
        });

        // Add Edit button for admin
        if (this.userManager.isAdmin && this.userManager.isAdmin()) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-warning edit-university-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditUniversityModal(university);
            });
            card.querySelector('.card-actions').appendChild(editBtn);
        }

        return card;
    }

    getUniversityLogo(university) {
        if (university.image) {
            if (university.image.startsWith('http')) {
                return university.image;
            } else if (!university.image.includes('google.com/search')) {
                return `./src/assets/images/${university.image}`;
            }
        }
        return null;
    }

    showUniversityModal(university) {
        const modal = document.getElementById('universityModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = university.name;
        
        modalContent.innerHTML = `
            <div class="modal-university-details">
                <div class="modal-university-header">
                    <div class="modal-university-logo">
                        ${this.getUniversityLogo(university) ? 
                          `<img src="${this.getUniversityLogo(university)}" alt="${university.name} logo">` :
                          `<i class="fas fa-university"></i>`}
                    </div>
                    <div class="modal-university-info">
                        <h4>${university.name}</h4>
                        <p><strong>Type:</strong> ${university.type}</p>
                        <p><strong>Location:</strong> ${university.region}</p>
                        ${university.website ? `<p><strong>Website:</strong> <a href="${university.website}" target="_blank">${university.website}</a></p>` : ''}
                    </div>
                </div>
                <div class="modal-university-description">
                    <h5>About</h5>
                    <p>${university.description || 'This prestigious university in South Korea offers excellent education and research opportunities across various fields of study.'}</p>
                </div>
                <div class="modal-university-actions">
                    <button class="btn btn-primary" onclick="window.open('${university.website || '#'}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                        Visit Website
                    </button>
                    <button class="btn btn-secondary favorite-modal-btn ${this.userManager.isFavorite(university.name) ? 'active' : ''}" 
                            data-university="${university.name}">
                        <i class="fas fa-heart"></i>
                        ${this.userManager.isFavorite(university.name) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `;

        // Add styles for modal content
        const style = document.createElement('style');
        style.textContent = `
            .modal-university-header {
                display: flex;
                gap: var(--space-lg);
                margin-bottom: var(--space-xl);
                align-items: center;
            }
            .modal-university-logo {
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-secondary);
                border-radius: var(--radius-lg);
            }
            .modal-university-logo img {
                width: 60px;
                height: 60px;
                object-fit: contain;
                border-radius: var(--radius-md);
            }
            .modal-university-logo i {
                font-size: 2rem;
                color: var(--color-primary);
            }
            .modal-university-info h4 {
                margin-bottom: var(--space-sm);
                color: var(--color-primary);
            }
            .modal-university-info p {
                margin-bottom: var(--space-xs);
                color: var(--text-secondary);
            }
            .modal-university-description {
                margin-bottom: var(--space-xl);
            }
            .modal-university-description h5 {
                margin-bottom: var(--space-md);
                color: var(--text-primary);
            }
            .modal-university-actions {
                display: flex;
                gap: var(--space-md);
                flex-wrap: wrap;
            }
            .favorite-modal-btn.active {
                background: var(--color-accent);
                color: var(--text-white);
            }
        `;
        document.head.appendChild(style);

        // Event listener for favorite button in modal
        const favoriteModalBtn = modalContent.querySelector('.favorite-modal-btn');
        favoriteModalBtn?.addEventListener('click', () => {
            this.toggleFavorite(university.name, favoriteModalBtn);
            // Update button text
            const isNowFavorite = this.userManager.isFavorite(university.name);
            favoriteModalBtn.innerHTML = `
                <i class="fas fa-heart"></i>
                ${isNowFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            `;
            favoriteModalBtn.classList.toggle('active', isNowFavorite);
        });

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('universityModal');
        modal.classList.remove('active');
    }

    toggleFavorite(universityName, buttonElement) {
        const isCurrentlyFavorite = this.userManager.isFavorite(universityName);
        
        if (isCurrentlyFavorite) {
            this.userManager.removeFavorite(universityName);
            buttonElement.classList.remove('active');
            buttonElement.title = 'Add to favorites';
        } else {
            this.userManager.addFavorite(universityName);
            buttonElement.classList.add('active');
            buttonElement.title = 'Remove from favorites';
        }

        // Update other instances of this button
        document.querySelectorAll(`[data-university="${universityName}"]`).forEach(btn => {
            if (btn.classList.contains('favorite-btn')) {
                btn.classList.toggle('active', !isCurrentlyFavorite);
            }
        });
    }

    updateLoadMoreButton(totalResults, currentlyShown) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (totalResults > currentlyShown) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.textContent = `Load More (${totalResults - currentlyShown} remaining)`;
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    loadMoreUniversities() {
        this.currentPage++;
        this.renderUniversities();
    }

    animateCards() {
        const cards = document.querySelectorAll('.university-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let current = 0;
            const increment = target / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current);
            }, 50);
        });
    }

    showLoading(show) {
        const loader = document.getElementById('loadingSpinner');
        if (show) {
            loader.classList.add('active');
        } else {
            loader.classList.remove('active');
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-accent);
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showFavorites() {
        const favorites = this.userManager.getFavorites();
        if (!favorites || favorites.length === 0) {
            this.uiManager.showModal('No favorites added yet!', 'Favorites');
            return;
        }
        // Filter and show only favorite universities
        const favoriteUniversities = this.universityManager.getUniversities()
            .filter(uni => favorites.includes(uni.name));
        if (favoriteUniversities.length === 0) {
            this.uiManager.showModal('No favorites found in the current data.', 'Favorites');
            return;
        }
        // Render a modal with favorite universities
        const content = favoriteUniversities.map(uni => `
            <div style="margin-bottom:1rem;">
                <strong>${uni.name}</strong> (${uni.region}, ${uni.type})
                <br>
                <button class="btn btn-sm btn-primary" onclick="window.app.showUniversityModal(window.app.universityManager.getUniversityByName('${uni.name.replace(/'/g, "\\'")}'))">Details</button>
            </div>
        `).join('');
        this.uiManager.showModal(content, 'Your Favorites');
    }

    // Show settings modal
    showSettings() {
        // You can expand this with real settings later
        this.uiManager.showModal(`
            <div>
                <p>Theme: <strong>${this.themeManager.getCurrentTheme?.() || 'N/A'}</strong></p>
                <button class="btn btn-outline" onclick="window.app.themeManager.toggle()">Toggle Theme</button>
            </div>
        `, 'Settings');
    }

    // Show admin panel modal
    showAdminPanel() {
    let content = `<div><h4>Admin Panel</h4>`;
    if (this.userManager.isAdmin()) {
        content += `
            <button class="btn btn-info" id="adminStatsBtn" style="margin-bottom:1rem;">
                <i class="fas fa-chart-bar"></i> Statistics
            </button>
            <button class="btn btn-warning" id="adminUniversitiesBtn" style="margin-bottom:1rem;">
                <i class="fas fa-university"></i> Edit Universities
            </button>
        `;
    }
    if (this.userManager.isRepresentative()) {
        content += `
            <button class="btn btn-warning" id="repEditUniBtn" style="margin-bottom:1rem;">
                <i class="fas fa-university"></i> Edit My University
            </button>
        `;
    }
    content += `<div id="adminPanelContent"></div></div>`;
    this.uiManager.showModal(content, 'Admin Panel');

    setTimeout(() => {
        if (this.userManager.isAdmin()) {
            document.getElementById('adminStatsBtn')?.addEventListener('click', () => this.showAdminUserStats());
            document.getElementById('adminUniversitiesBtn')?.addEventListener('click', () => this.renderUniversities());
        }
        if (this.userManager.isRepresentative()) {
            document.getElementById('repEditUniBtn')?.addEventListener('click', () => {
                const uniName = this.userManager.currentUser.university;
                const uni = this.universityManager.getUniversityByName(uniName);
                if (uni) {
                    this.showEditUniversityModal(uni, true); // true = rep mode
                } else {
                    this.uiManager.showModal('<p>Your university was not found.</p>', 'Error');
                }
            });
        }
    }, 100);
}

    showLoginModal() {
    }

    showRepRegisterModal() {
        const universities = this.universityManager.getUniversities();
        const uniOptions = universities.map(uni => `<option value="${uni.name}">${uni.name}</option>`).join('');
        this.uiManager.showModal(`
            <form id="repRegisterForm">
                <h3>University Representative Registration</h3>
                <input type="text" id="repName" placeholder="Your Name" required class="form-control" style="margin-bottom:8px;">
                <input type="email" id="repEmail" placeholder="Email" required class="form-control" style="margin-bottom:8px;">
                <select id="repUniversity" required class="form-control" style="margin-bottom:8px;">
                    <option value="">Select University</option>
                    ${uniOptions}
                </select>
                <button type="submit" class="btn btn-success">Register</button>
            </form>
        `, 'Representative Registration');

        setTimeout(() => {
            document.getElementById('repRegisterForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('repName').value.trim();
                const email = document.getElementById('repEmail').value.trim();
                const university = document.getElementById('repUniversity').value.trim();

                if (!name || !email || !university) {
                    this.uiManager.showModal('<p>Please fill in all fields.</p>', 'Error');
                    return;
                }

                // Create university representative user
                const userManager = this.userManager;
                if (userManager.users.find(u => u.email === email)) {
                    this.uiManager.showModal('<p>Email already registered. Please use another email.</p>', 'Error');
                    return;
                }

                const username = email.split('@')[0];
                const password = 'changeme'; // Default password, user should change later

                const newUser = {
                    username,
                    password: userManager.hashPassword(password),
                    email,
                    fullName: name,
                    role: 'university_representative',
                    university,
                    joinDate: new Date().toISOString(),
                    favorites: [],
                    preferences: {
                        theme: 'light',
                        notifications: true
                    }
                };

                userManager.users.push(newUser);
                userManager.saveUsers();

                this.uiManager.showModal(`<p>Thank you, ${name}! Your registration for ${university} has been received. Your username is <strong>${username}</strong> and your temporary password is <strong>${password}</strong>. Please log in and change your password.</p>`, 'Registration Success');
            });
        }, 100);
    }

    showEditUniversityModal(university, repMode = false) {
        // If repMode, disable name/type/region fields
        const isRep = repMode || (this.userManager.isRepresentative() && this.userManager.currentUser.university === university.name);
        const disabled = isRep ? 'disabled' : '';
        const formHtml = `
            <form id="editUniversityForm">
                <div>
                    <label>Name</label>
                    <input type="text" id="editUniName" value="${university.name}" required class="form-control" ${disabled}>
                </div>
                <div>
                    <label>Type</label>
                    <input type="text" id="editUniType" value="${university.type}" required class="form-control" ${disabled}>
                </div>
                <div>
                    <label>Region</label>
                    <input type="text" id="editUniRegion" value="${university.region}" required class="form-control" ${disabled}>
                </div>
                <div>
                    <label>Description</label>
                    <textarea id="editUniDescription" class="form-control">${university.description || ''}</textarea>
                </div>
                <div>
                    <label>Image URL</label>
                    <input type="text" id="editUniImage" value="${university.image || ''}" class="form-control">
                </div>
                <div>
                    <label>Website</label>
                    <input type="text" id="editUniWebsite" value="${university.website || ''}" class="form-control">
                </div>
                <button type="submit" class="btn btn-success">Save Changes</button>
            </form>
        `;
        this.uiManager.showModal(formHtml, `Edit University: ${university.name}`);

        setTimeout(() => {
            document.getElementById('editUniversityForm').addEventListener('submit', (e) => {
                e.preventDefault();
                // Only allow save if admin or rep for this university
                if (this.userManager.isAdmin() || isRep) {
                    this.saveUniversityEdits(university.name);
                } else {
                    this.uiManager.showModal('<p>You do not have permission to edit this university.</p>', 'Permission Denied');
                }
            });
        }, 100);
    }

    saveUniversityEdits(originalName, repMode) {
        const updated = {
            name: document.getElementById('editUniName').value.trim(),
            type: document.getElementById('editUniType').value.trim(),
            region: document.getElementById('editUniRegion').value.trim(),
            description: document.getElementById('editUniDescription').value.trim(),
            image: document.getElementById('editUniImage').value.trim(),
            website: document.getElementById('editUniWebsite').value.trim()
        };

        // Update in university manager
        this.universityManager.updateUniversity(originalName, updated);

        // Save to localStorage (simulate DB update)
        localStorage.setItem('universities', JSON.stringify(this.universityManager.getUniversities()));

        this.uiManager.showModal('<p>University updated successfully!</p>', 'Success');
        this.renderUniversities();
    }

    updateUserUI(username) {
        // Update UI to show user is logged in (implement as needed)
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.innerHTML = `<span>Welcome, ${username}</span>`;
        }
    }

    showAdminUserStats() {
        const users = this.userManager.users;
        if (!users || users.length === 0) {
            document.getElementById('adminPanelContent').innerHTML = '<p>No users found.</p>';
            return;
        }

        let table = `
            <table class="admin-table" style="width:100%;margin-bottom:1rem;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>University</th>
                        <th>Favorites</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach((user, idx) => {
            table += `
                <tr data-user-index="${idx}">
                    <td><input type="text" value="${user.username}" class="admin-edit" data-field="username"></td>
                    <td><input type="text" value="${user.fullName || ''}" class="admin-edit" data-field="fullName"></td>
                    <td><input type="email" value="${user.email}" class="admin-edit" data-field="email"></td>
                    <td>
                        <select class="admin-edit" data-field="role">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="university_representative" ${user.role === 'university_representative' ? 'selected' : ''}>Representative</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td><input type="text" value="${user.university || ''}" class="admin-edit" data-field="university"></td>
                    <td>${(user.favorites || []).length}</td>
                    <td>
                        <button class="btn btn-success btn-sm admin-save-user" data-index="${idx}">Save</button>
                    </td>
                </tr>
            `;
        });

        table += '</tbody></table>';

        document.getElementById('adminPanelContent').innerHTML = table;

        // Add save handlers
        document.querySelectorAll('.admin-save-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const row = document.querySelector(`tr[data-user-index="${idx}"]`);
                const inputs = row.querySelectorAll('.admin-edit');
                const updated = {};
                inputs.forEach(input => {
                    if (input.tagName === 'SELECT') {
                        updated[input.dataset.field] = input.value;
                    } else {
                        updated[input.dataset.field] = input.value.trim();
                    }
                });
                this.userManager.users[idx] = { ...this.userManager.users[idx], ...updated };
                this.userManager.saveUsers();
                this.uiManager.showNotification('User updated!', 'success');
                this.showAdminUserStats(); // Refresh table
            });
        });
    }

    showChangePasswordModal() {
        this.uiManager.showModal(`
            <form id="changePasswordForm">
                <div>
                    <label>Current Password</label>
                    <input type="password" id="currentPassword" required class="form-control">
                </div>
                <div>
                    <label>New Password</label>
                    <input type="password" id="newPassword" required class="form-control">
                </div>
                <div>
                    <label>Confirm New Password</label>
                    <input type="password" id="confirmNewPassword" required class="form-control">
                </div>
                <button type="submit" class="btn btn-success">Change Password</button>
            </form>
        `, 'Change Password');

        setTimeout(() => {
            document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChangePassword();
            });
        }, 100);
    }

    handleChangePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        // Get current user
        const user = this.userManager.currentUser;
        const allUsers = this.userManager.users;
        const userIndex = allUsers.findIndex(u => u.username === user.username);

        if (userIndex === -1) {
            this.uiManager.showModal('<p>User not found.</p>', 'Error');
            return;
        }

        // Check current password
        if (allUsers[userIndex].password !== this.userManager.hashPassword(current)) {
            this.uiManager.showModal('<p>Current password is incorrect.</p>', 'Error');
            return;
        }

        // Validate new password
        if (newPass.length < 6) {
            this.uiManager.showModal('<p>New password must be at least 6 characters.</p>', 'Error');
            return;
        }
        if (newPass !== confirm) {
            this.uiManager.showModal('<p>New passwords do not match.</p>', 'Error');
            return;
        }

        // Save new password
        allUsers[userIndex].password = this.userManager.hashPassword(newPass);
        this.userManager.saveUsers();
        this.uiManager.showModal('<p>Password changed successfully!</p>', 'Success');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;