// Search and Suggestion Management
export class SearchManager {
    constructor() {
        this.searchHistory = this.loadSearchHistory();
        this.popularSearches = ['Seoul', 'KAIST', 'National', 'Private', 'Technology'];
        this.recentSearches = [];
        this.searchResults = [];
    }

    init() {
        this.setupSearchAutocomplete();
    }

    setupSearchAutocomplete() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;

        // Debounce search input
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearchInput(e.target.value);
            }, 300);
        });

        // Handle search on Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });
    }

    handleSearchInput(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const suggestions = this.generateSuggestions(query);
        this.showSuggestions(suggestions);
    }

    generateSuggestions(query) {
        const suggestions = {
            universities: [],
            categories: [],
            recent: [],
            popular: []
        };

        // Get universities from global app if available
        if (window.app && window.app.universityManager) {
            const universities = window.app.universityManager.getUniversities();
            
            // University name suggestions
            suggestions.universities = universities
                .filter(uni => uni.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
                .map(uni => ({
                    type: 'university',
                    text: uni.name,
                    subtitle: `${uni.type} • ${uni.region}`,
                    data: uni
                }));

            // Category suggestions (regions, types)
            const regions = [...new Set(universities.map(uni => uni.region))]
                .filter(region => region.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 3)
                .map(region => ({
                    type: 'region',
                    text: region,
                    subtitle: 'Region',
                    data: { region }
                }));

            const types = [...new Set(universities.map(uni => uni.type))]
                .filter(type => type.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 3)
                .map(type => ({
                    type: 'type',
                    text: type,
                    subtitle: 'University Type',
                    data: { type }
                }));

            suggestions.categories = [...regions, ...types];
        }

        // Recent searches
        suggestions.recent = this.recentSearches
            .filter(search => search.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .map(search => ({
                type: 'recent',
                text: search,
                subtitle: 'Recent search',
                data: { query: search }
            }));

        // Popular searches
        suggestions.popular = this.popularSearches
            .filter(search => search.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .map(search => ({
                type: 'popular',
                text: search,
                subtitle: 'Popular search',
                data: { query: search }
            }));

        return suggestions;
    }

    showSuggestions(suggestions) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'block';

        const allSuggestions = [
            ...suggestions.universities,
            ...suggestions.categories,
            ...suggestions.recent,
            ...suggestions.popular
        ];

        if (allSuggestions.length === 0) {
            container.innerHTML = '<div class="suggestion-item" style="padding: 1rem; text-align: center; color: var(--text-secondary);">No suggestions found</div>';
            return;
        }

        allSuggestions.forEach(suggestion => {
            const item = this.createSuggestionItem(suggestion);
            container.appendChild(item);
        });

        // Add styles for suggestions
        this.addSuggestionStyles();
    }

    createSuggestionItem(suggestion) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const icon = this.getSuggestionIcon(suggestion.type);
        
        item.innerHTML = `
            <div class="suggestion-content">
                <div class="suggestion-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="suggestion-text">
                    <div class="suggestion-title">${suggestion.text}</div>
                    <div class="suggestion-subtitle">${suggestion.subtitle}</div>
                </div>
            </div>
        `;

        // Add click handler
        item.addEventListener('click', () => {
            this.selectSuggestion(suggestion);
        });

        return item;
    }

    getSuggestionIcon(type) {
        const icons = {
            university: 'fas fa-university',
            region: 'fas fa-map-marker-alt',
            type: 'fas fa-tag',
            recent: 'fas fa-history',
            popular: 'fas fa-fire'
        };
        return icons[type] || 'fas fa-search';
    }

    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('globalSearch');
        
        // Update search input
        if (searchInput) {
            searchInput.value = suggestion.text;
        }

        // Perform the search
        this.performSearch(suggestion.text, suggestion);
        
        // Hide suggestions
        this.hideSuggestions();
        
        // Add to recent searches
        this.addToRecentSearches(suggestion.text);
    }

    performSearch(query, suggestion = null) {
        if (!query.trim()) return;

        // Add to search history
        this.addToSearchHistory(query);

        // Close search overlay
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
        }

        // Navigate to universities section
        if (window.app && window.app.navigateToSection) {
            window.app.navigateToSection('universities');
        }

        // Apply search filter
        if (window.app && window.app.handleSearch) {
            window.app.handleSearch(query);
        }

        // If it's a specific type suggestion, apply appropriate filters
        if (suggestion) {
            if (suggestion.type === 'region' && window.app && window.app.applyFilter) {
                // Find the region filter button and click it
                const regionBtn = document.querySelector(`[data-filter="${suggestion.text}"][data-type="region"]`);
                if (regionBtn) {
                    window.app.applyFilter('region', suggestion.text, regionBtn);
                }
            } else if (suggestion.type === 'type' && window.app && window.app.applyFilter) {
                // Find the type filter button and click it
                const typeBtn = document.querySelector(`[data-filter="${suggestion.text}"][data-type="type"]`);
                if (typeBtn) {
                    window.app.applyFilter('type', suggestion.text, typeBtn);
                }
            }
        }

        // Dispatch search event
        window.dispatchEvent(new CustomEvent('searchPerformed', {
            detail: { query, suggestion }
        }));
    }

    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    addSuggestionStyles() {
        if (document.getElementById('suggestionStyles')) return;

        const style = document.createElement('style');
        style.id = 'suggestionStyles';
        style.textContent = `
            .suggestion-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid var(--border-light);
            }
            
            .suggestion-item:hover {
                background-color: var(--bg-tertiary);
            }
            
            .suggestion-item:last-child {
                border-bottom: none;
            }
            
            .suggestion-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .suggestion-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-tertiary);
                border-radius: 50%;
                color: var(--color-primary);
                flex-shrink: 0;
            }
            
            .suggestion-text {
                flex: 1;
                min-width: 0;
            }
            
            .suggestion-title {
                font-weight: 500;
                color: var(--text-primary);
                margin-bottom: 0.125rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .suggestion-subtitle {
                font-size: 0.875rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        `;
        document.head.appendChild(style);
    }

    addToSearchHistory(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        // Remove if already exists
        const existingIndex = this.searchHistory.indexOf(trimmedQuery);
        if (existingIndex > -1) {
            this.searchHistory.splice(existingIndex, 1);
        }

        // Add to beginning
        this.searchHistory.unshift(trimmedQuery);

        // Keep only last 50 searches
        this.searchHistory = this.searchHistory.slice(0, 50);

        // Save to localStorage
        this.saveSearchHistory();
    }

    addToRecentSearches(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        // Remove if already exists
        const existingIndex = this.recentSearches.indexOf(trimmedQuery);
        if (existingIndex > -1) {
            this.recentSearches.splice(existingIndex, 1);
        }

        // Add to beginning
        this.recentSearches.unshift(trimmedQuery);

        // Keep only last 10 recent searches
        this.recentSearches = this.recentSearches.slice(0, 10);
    }

    getSearchSuggestions(query, universities) {
        if (!query || query.length < 2) return [];

        const suggestions = [];
        const lowercaseQuery = query.toLowerCase();

        // University name matches
        universities.forEach(uni => {
            if (uni.name.toLowerCase().includes(lowercaseQuery)) {
                suggestions.push({
                    type: 'university',
                    text: uni.name,
                    highlight: this.highlightMatch(uni.name, query),
                    data: uni
                });
            }
        });

        // Region matches
        const regions = [...new Set(universities.map(uni => uni.region))]
            .filter(region => region.toLowerCase().includes(lowercaseQuery))
            .map(region => ({
                type: 'region',
                text: `Universities in ${region}`,
                highlight: this.highlightMatch(region, query),
                data: { region }
            }));

        // Type matches
        const types = [...new Set(universities.map(uni => uni.type))]
            .filter(type => type.toLowerCase().includes(lowercaseQuery))
            .map(type => ({
                type: 'type',
                text: `${type} Universities`,
                highlight: this.highlightMatch(type, query),
                data: { type }
            }));

        return [...suggestions.slice(0, 5), ...regions.slice(0, 3), ...types.slice(0, 3)];
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    clearRecentSearches() {
        this.recentSearches = [];
    }

    getSearchHistory() {
        return [...this.searchHistory];
    }

    getRecentSearches() {
        return [...this.recentSearches];
    }

    getPopularSearches() {
        return [...this.popularSearches];
    }

    updatePopularSearches(searches) {
        this.popularSearches = searches;
    }

    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    getSearchStats() {
        return {
            totalSearches: this.searchHistory.length,
            recentSearches: this.recentSearches.length,
            mostSearched: this.getMostSearchedTerms(),
            searchHistory: this.searchHistory.slice(0, 10) // Last 10 searches
        };
    }

    getMostSearchedTerms() {
        const frequency = {};
        this.searchHistory.forEach(term => {
            frequency[term] = (frequency[term] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([term, count]) => ({ term, count }));
    }

    // Advanced search functionality
    advancedSearch(criteria) {
        const { 
            query = '', 
            region = 'all', 
            type = 'all', 
            hasWebsite = null,
            hasDescription = null 
        } = criteria;

        if (!window.app || !window.app.universityManager) return [];

        let results = window.app.universityManager.getUniversities();

        // Apply text search
        if (query) {
            results = results.filter(uni => {
                const searchText = [
                    uni.name,
                    uni.region,
                    uni.type,
                    uni.description || ''
                ].join(' ').toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        }

        // Apply region filter
        if (region !== 'all') {
            results = results.filter(uni => uni.region === region);
        }

        // Apply type filter
        if (type !== 'all') {
            results = results.filter(uni => uni.type === type);
        }

        // Apply website filter
        if (hasWebsite !== null) {
            results = results.filter(uni => 
                hasWebsite ? !!uni.website : !uni.website
            );
        }

        // Apply description filter
        if (hasDescription !== null) {
            results = results.filter(uni => 
                hasDescription ? !!uni.description : !uni.description
            );
        }

        return results;
    }
}