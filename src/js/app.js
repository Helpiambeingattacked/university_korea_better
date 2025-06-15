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
        
        this.currentSort = 'name-asc'; // name-asc, name-desc, rank-asc, rank-desc
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
            const response = await fetch('./src/data/universities.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.universityManager.setUniversities(data);
        } catch (error) {
            throw new Error('Could not load university data from universities.json');
        }
    }

    initializeManagers() {
        this.uiManager.init();
        this.userManager.init();
        this.searchManager.init();
        this.themeManager.init();
        this.setupLanguageToggle();
    }

    setupLanguageToggle() {
        const languageToggle = document.getElementById('languageToggle');
        if (!languageToggle) return;

        let currentLanguage = localStorage.getItem('language') || 'en';
        this.setLanguage(currentLanguage);

        languageToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'ko' : 'en';
            localStorage.setItem('language', currentLanguage);
            this.setLanguage(currentLanguage);
        });

        languageToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                languageToggle.click();
            }
        });
    }

    setLanguage(lang) {
        const languageToggle = document.getElementById('languageToggle');
        if (!languageToggle) return;

        languageToggle.title = lang === 'ko' ? '영어로 전환' : 'Switch to Korean';

        const translations = {
            en: {
                home: 'Home',
                universities: 'Universities',
                about: 'About',
                explore: 'Explore Universities',
                learnMore: 'Learn More',
                universitiesTitle: 'Universities in Korea',
                universitiesSubtitle: 'Discover institutions that shape the future',
                region: 'Region',
                allRegions: 'All Regions',
                type: 'Type',
                allTypes: 'All Types',
                national: 'National',
                private: 'Private',
                specialized: 'Specialized',
                international: 'International',
                reset: 'Reset',
                sortAZ: 'Sort A-Z',
                sortZA: 'Sort Z-A',
                loadMore: 'Load More Universities',
                aboutTitle: 'About Korean Higher Education',
                aboutText: "South Korea's higher education system is recognized globally for its excellence in technology, research, and innovation. With over 400 universities and colleges, Korea offers diverse educational opportunities for international students.",
                research: 'Research Excellence',
                researchText: 'World-class research facilities and cutting-edge technology programs',
                global: 'Global Recognition',
                globalText: 'Internationally accredited degrees and strong industry partnerships',
                culture: 'Cultural Experience',
                cultureText: 'Rich cultural heritage combined with modern innovation',
                quickLinks: 'Quick Links',
                universitiesLink: 'Universities',
                programs: 'Programs',
                admissions: 'Admissions',
                scholarships: 'Scholarships',
                resources: 'Resources',
                ministry: 'Ministry of Education',
                rep: 'University Representative',
                studentGuide: 'Student Guide',
                contactUs: 'Contact Us',
                contact: 'Contact',
                email: 'info@koreanuniversitiesinfo.com',
                phone: '+82 2 1234 5678',
                address: 'Seoul, South Korea',
                loading: 'Loading universities...',
                login: 'Login / Register',
                favorites: 'My Favorites',
                settings: 'Settings',
                repRegister: 'Representative Register',
                admin: 'Admin Panel',
                changePassword: 'Change My Password'
            },
            ko: {
                home: '홈',
                universities: '대학교',
                about: '소개',
                explore: '대학교 탐색',
                learnMore: '더 알아보기',
                universitiesTitle: '대한민국 대학교',
                universitiesSubtitle: '미래를 이끄는 기관을 발견하세요',
                region: '지역',
                allRegions: '전체 지역',
                type: '유형',
                allTypes: '전체 유형',
                national: '국립',
                private: '사립',
                specialized: '특수',
                international: '국제',
                reset: '초기화',
                sortAZ: '가나다순 정렬',
                sortZA: '역순 정렬',
                loadMore: '대학교 더 보기',
                aboutTitle: '한국 고등교육 소개',
                aboutText: '한국의 고등교육은 기술, 연구, 혁신에서 세계적으로 인정받고 있습니다. 400개 이상의 대학과 단과대학이 있어 다양한 교육 기회를 제공합니다.',
                research: '연구 우수성',
                researchText: '세계적 수준의 연구 시설과 첨단 기술 프로그램',
                global: '글로벌 인정',
                globalText: '국제적으로 인증된 학위와 강력한 산업 협력',
                culture: '문화 체험',
                cultureText: '풍부한 문화유산과 현대적 혁신의 결합',
                quickLinks: '바로가기',
                universitiesLink: '대학교',
                programs: '프로그램',
                admissions: '입학',
                scholarships: '장학금',
                resources: '자료실',
                ministry: '교육부',
                rep: '대학 대표자',
                studentGuide: '학생 가이드',
                contactUs: '문의하기',
                contact: '연락처',
                email: 'info@koreanuniversitiesinfo.com',
                phone: '+82 2 1234 5678',
                address: '대한민국 서울',
                loading: '대학교 정보를 불러오는 중...',
                login: '로그인 / 회원가입',
                favorites: '내 즐겨찾기',
                settings: '설정',
                repRegister: '대표자 등록',
                admin: '관리자 패널',
                changePassword: '비밀번호 변경'
            }
        };

        const t = translations[lang];

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks.length >= 3) {
            navLinks[0].querySelector('span').textContent = t.home;
            navLinks[1].querySelector('span').textContent = t.universities;
            navLinks[2].querySelector('span').textContent = t.about;
        }

        // Hero section
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.childNodes[0].textContent = lang === 'ko' ? '당신의 미래를 발견하세요 ' : 'Discover Your Future at ';
        }
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = t.universitiesSubtitle;

        // Hero actions
        const exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) exploreBtn.innerHTML = `<i class="fas fa-compass"></i> ${t.explore}`;
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        if (learnMoreBtn) learnMoreBtn.innerHTML = `<i class="fas fa-play"></i> ${t.learnMore}`;

        // Universities section
        const universitiesTitle = document.querySelector('.section-title');
        if (universitiesTitle) universitiesTitle.textContent = t.universitiesTitle;
        const universitiesSubtitle = document.querySelector('.section-subtitle');
        if (universitiesSubtitle) universitiesSubtitle.textContent = t.universitiesSubtitle;

        // Filters
        const regionLabel = document.querySelector('.filter-label');
        if (regionLabel) regionLabel.textContent = t.region;
        const regionBtns = document.querySelectorAll('#regionFilters .filter-btn');
        if (regionBtns.length > 0) regionBtns[0].textContent = t.allRegions;

        const typeLabels = document.querySelectorAll('.filter-label');
        if (typeLabels.length > 1) typeLabels[1].textContent = t.type;
        const typeBtns = document.querySelectorAll('#typeFilters .filter-btn');
        if (typeBtns.length > 0) typeBtns[0].textContent = t.allTypes;
        if (typeBtns.length > 1) typeBtns[1].textContent = t.national;
        if (typeBtns.length > 2) typeBtns[2].textContent = t.private;
        if (typeBtns.length > 3) typeBtns[3].textContent = t.specialized;
        if (typeBtns.length > 4) typeBtns[4].textContent = t.international;

        // Filter actions
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) resetBtn.innerHTML = `<i class="fas fa-refresh"></i> ${t.reset}`;
        const sortToggle = document.getElementById('sortToggle');
        if (sortToggle) {
            sortToggle.innerHTML = `<i class="fas fa-sort"></i> ${this.currentSort === 'name-asc' ? t.sortAZ : t.sortZA}`;
        }

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> ${t.loadMore}`;

        // About section
        const aboutTitle = document.querySelector('#aboutSection h2');
        if (aboutTitle) aboutTitle.textContent = t.aboutTitle;
        const aboutText = document.querySelector('#aboutSection p');
        if (aboutText) aboutText.textContent = t.aboutText;

        // Features
        const featureCards = document.querySelectorAll('.feature-card');
        if (featureCards.length > 0) {
            featureCards[0].querySelector('h3').textContent = t.research;
            featureCards[0].querySelector('p').textContent = t.researchText;
        }
        if (featureCards.length > 1) {
            featureCards[1].querySelector('h3').textContent = t.global;
            featureCards[1].querySelector('p').textContent = t.globalText;
        }
        if (featureCards.length > 2) {
            featureCards[2].querySelector('h3').textContent = t.culture;
            featureCards[2].querySelector('p').textContent = t.cultureText;
        }

        // Footer
        const quickLinks = document.querySelector('.footer-section ul');
        if (quickLinks) {
            const links = quickLinks.querySelectorAll('li a');
            if (links.length > 0) links[0].textContent = t.universitiesLink;
            if (links.length > 1) links[1].textContent = t.programs;
            if (links.length > 2) links[2].textContent = t.admissions;
            if (links.length > 3) links[3].textContent = t.scholarships;
        }
        const footerSections = document.querySelectorAll('.footer-section h4');
        if (footerSections.length > 0) footerSections[0].textContent = 'Korean Universities Hub';
        if (footerSections.length > 1) footerSections[1].textContent = t.quickLinks;
        if (footerSections.length > 2) footerSections[2].textContent = t.resources;
        if (footerSections.length > 3) footerSections[3].textContent = t.contact;

        // Footer resources
        const resourceLinks = document.querySelectorAll('.footer-section ul');
        if (resourceLinks.length > 1) {
            const resLinks = resourceLinks[1].querySelectorAll('li a');
            if (resLinks.length > 0) resLinks[0].textContent = t.ministry;
            if (resLinks.length > 1) resLinks[1].textContent = t.rep;
            if (resLinks.length > 2) resLinks[2].textContent = t.studentGuide;
            if (resLinks.length > 3) resLinks[3].textContent = t.contactUs;
        }

        // Footer contact
        const contactSection = document.querySelectorAll('.footer-section')[3];
        if (contactSection) {
            const ps = contactSection.querySelectorAll('p');
            if (ps.length > 0) ps[0].innerHTML = `<i class="fas fa-envelope"></i> ${t.email}`;
            if (ps.length > 1) ps[1].innerHTML = `<i class="fas fa-phone"></i> ${t.phone}`;
            if (ps.length > 2) ps[2].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${t.address}`;
        }

        // Loading spinner
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            const p = loadingSpinner.querySelector('p');
            if (p) p.textContent = t.loading;
        }

        // User menu
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.querySelector('span').textContent = t.login;
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) favoritesBtn.querySelector('span').textContent = t.favorites;
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.querySelector('span').textContent = t.settings;
        const repRegisterBtn = document.getElementById('repRegisterBtn');
        if (repRegisterBtn) repRegisterBtn.querySelector('span').textContent = t.repRegister;
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) adminBtn.querySelector('span').textContent = t.admin;
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) changePasswordBtn.textContent = t.changePassword;

        localStorage.setItem('language', lang);
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

        // Sort toggle (A-Z/Z-A)
        document.getElementById('sortToggle')?.addEventListener('click', (e) => {
            this.toggleSort(e.currentTarget);
        });

        // Sort by Rank toggle
        document.getElementById('sortRankToggle')?.addEventListener('click', (e) => {
            this.toggleRankSort(e.currentTarget);
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

            // Add document click listener to close menu when clicking outside
            const closeMenuOnClickAway = (event) => {
                if (
                    !menu.contains(event.target) &&
                    event.target !== btn
                ) {
                    menu.classList.remove('active');
                    document.removeEventListener('mousedown', closeMenuOnClickAway);
                }
            };

            // Only add listener if menu is now open
            if (menu.classList.contains('active')) {
                setTimeout(() => {
                    document.addEventListener('mousedown', closeMenuOnClickAway);
                }, 0);
            }
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
        // Reset rank sort button text
        const rankBtn = document.getElementById('sortRankToggle');
        if (rankBtn) rankBtn.innerHTML = '<i class="fas fa-sort-numeric-down"></i> Sort by Rank';
        this.renderUniversities();
    }

    toggleRankSort(buttonElement) {
        if (this.currentSort === 'rank-asc') {
            this.currentSort = 'rank-desc';
            buttonElement.innerHTML = '<i class="fas fa-sort-numeric-up"></i> Rank High-Low';
        } else {
            this.currentSort = 'rank-asc';
            buttonElement.innerHTML = '<i class="fas fa-sort-numeric-down"></i> Rank Low-High';
        }
        // Reset A-Z sort button text
        const azBtn = document.getElementById('sortToggle');
        if (azBtn) azBtn.innerHTML = '<i class="fas fa-sort"></i> Sort A-Z';
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
            } else if (this.currentSort === 'name-desc') {
                return b.name.localeCompare(a.name);
            } else if (this.currentSort === 'rank-asc') {
                // Sort by rank ascending, fallback to bottom if no rank
                const rankA = a.rank ? parseInt(a.rank) : Number.MAX_SAFE_INTEGER;
                const rankB = b.rank ? parseInt(b.rank) : Number.MAX_SAFE_INTEGER;
                return rankA - rankB;
            } else if (this.currentSort === 'rank-desc') {
                // Sort by rank descending, fallback to bottom if no rank
                const rankA = a.rank ? parseInt(a.rank) : Number.MAX_SAFE_INTEGER;
                const rankB = b.rank ? parseInt(b.rank) : Number.MAX_SAFE_INTEGER;
                return rankB - rankA;
            } else {
                return 0;
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

        // Build Google Maps search URL
        const mapsQuery = encodeURIComponent(`${university.name}, ${university.region}, South Korea`);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

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
                    <a href="${mapsUrl}" target="_blank" class="map-link" title="View on Google Maps" style="margin-left:8px;">
                        <i class="fas fa-map"></i> Map
                    </a>
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