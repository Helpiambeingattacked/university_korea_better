// Main Application Module
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
            this.toggleSort(e.target);
        });

        // Load more
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreUniversities();
        });
    }

    setupUserListeners() {
        const userMenuToggle = document.getElementById('userMenuToggle');
        const userMenu = document.getElementById('userMenu');

        userMenuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });

        userMenu?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // User menu items
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.userManager.showLoginModal();
        });

        document.getElementById('favoritesBtn')?.addEventListener('click', () => {
            this.showFavorites();
        });

        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('adminBtn')?.addEventListener('click', () => {
            this.showAdminPanel();
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
        if (favorites.length === 0) {
            this.showError('No favorites added yet!');
            return;
        }

        // Filter universities to show only favorites
        this.currentFilters = {
            region: 'all',
            type: 'all',
            search: ''
        };

        // Custom filter for favorites
        const favoriteUniversities = this.universityManager.getUniversities()
            .filter(uni => favorites.includes(uni.name));

        // Temporarily override the filtered universities
        const originalGetFiltered = this.getFilteredUniversities.bind(this);
        this.getFilteredUniversities = () => favoriteUniversities;

        this.navigateToSection('universities');
        this.renderUniversities();

        // Restore original filter function after a delay
        setTimeout(() => {
            this.getFilteredUniversities = originalGetFiltered;
        }, 1000);
    }

    showSettings() {
        console.log('Settings modal not implemented yet');
    }

    showAdminPanel() {
        console.log('Admin panel not implemented yet');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

export default App;