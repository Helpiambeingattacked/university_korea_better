// Theme and Appearance Management
export class ThemeManager {
    constructor() {
        this.currentTheme = this.loadSavedTheme();
        this.systemPreference = this.getSystemPreference();
        this.themeChangeCallbacks = [];
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.watchSystemPreference();
        this.updateThemeIcon();
    }

    loadSavedTheme() {
        try {
            const saved = localStorage.getItem('theme');
            if (saved && ['light', 'dark', 'auto'].includes(saved)) {
                return saved;
            }
        } catch (error) {
            console.error('Error loading saved theme:', error);
        }
        return 'auto'; // Default to auto
    }

    getSystemPreference() {
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }

    // Removed duplicate getEffectiveTheme method to avoid confusion
    // Only one getEffectiveTheme method remains below


    applyTheme(theme) {
        const effectiveTheme = theme === 'auto' ? this.systemPreference : theme;
        const root = document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        // Add new theme class
        root.classList.add(effectiveTheme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);
        
        // Dispatch theme change event
        this.dispatchThemeChange(effectiveTheme);
        
        // Execute callbacks
        this.themeChangeCallbacks.forEach(callback => {
            try {
                callback(effectiveTheme);
            } catch (error) {
                console.error('Error in theme change callback:', error);
            }
        });
    }

    updateMetaThemeColor(theme) {
        let themeColorContent = theme === 'dark' ? '#0f172a' : '#ffffff';
        
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColorContent;
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            this.toggle();
        });

        // Add keyboard support
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;

        console.log('Toggle theme from', this.currentTheme, 'to', themes[nextIndex]);
        
        this.setTheme(themes[nextIndex]);
        this.showThemeChangeNotification(themes[nextIndex]);
    }

    setTheme(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }

        console.log('Setting theme to', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.applyTheme(theme);
        this.updateThemeIcon();
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (!icon) return;

        const effectiveTheme = this.getEffectiveTheme();
        const icons = {
            light: 'fas fa-sun',
            dark: 'fas fa-moon',
            auto: 'fas fa-circle-half-stroke'
        };

        // Remove only theme-related icon classes
        icon.classList.remove('fas', 'fa-sun', 'fa-moon', 'fa-circle-half-stroke');

        // Add new icon class
        icon.classList.add(...icons[this.currentTheme].split(' '));

        // Update title
        const titles = {
            light: 'Switch to Dark Mode',
            dark: 'Switch to Auto Mode',
            auto: 'Switch to Light Mode'
        };
        themeToggle.title = titles[this.currentTheme] || 'Toggle Theme';
    }

    watchSystemPreference() {
        if (!window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            this.systemPreference = e.matches ? 'dark' : 'light';
            
            // Only apply if current theme is auto
            if (this.currentTheme === 'auto') {
                this.applyTheme('auto');
            }
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } 
        // Older browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
        }
    }

    showThemeChangeNotification(theme) {
        // Remove any existing notification first
        const existing = document.querySelector('.theme-notification');
        if (existing) {
            existing.parentElement.removeChild(existing);
        }

        const messages = {
            light: 'Switched to Light Mode',
            dark: 'Switched to Dark Mode',
            auto: 'Switched to Auto Mode (follows system preference)'
        };

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-light);
            z-index: 9999;
            font-size: 0.875rem;
            font-weight: 500;
            transform: translateX(400px);
            transition: transform 0.3s ease, opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        const icon = this.getThemeIcon(theme);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${messages[theme]}</span>
        `;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';

            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    getThemeIcon(theme) {
        const icons = {
            light: 'fas fa-sun',
            dark: 'fas fa-moon',
            auto: 'fas fa-circle-half-stroke'
        };
        return icons[theme] || icons.auto;
    }

    dispatchThemeChange(effectiveTheme) {
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { 
                theme: this.currentTheme,
                effectiveTheme: effectiveTheme
            }
        }));
    }

    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.themeChangeCallbacks.push(callback);
        }
    }

    removeThemeChangeCallback(callback) {
        const index = this.themeChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.themeChangeCallbacks.splice(index, 1);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getEffectiveTheme() {
        return this.currentTheme === 'auto' ? this.systemPreference : this.currentTheme;
    }

    isSystemDarkMode() {
        return this.systemPreference === 'dark';
    }

    // Theme utilities
    createThemeCustomProperties() {
        const themes = {
            light: {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8fafc',
                '--bg-tertiary': '#f1f5f9',
                '--text-primary': '#1f2937',
                '--text-secondary': '#6b7280',
                '--text-tertiary': '#9ca3af',
                '--border-light': '#e5e7eb',
                '--border-medium': '#d1d5db',
                '--border-dark': '#9ca3af'
            },
            dark: {
                '--bg-primary': '#0f172a',
                '--bg-secondary': '#1e293b',
                '--bg-tertiary': '#334155',
                '--text-primary': '#f8fafc',
                '--text-secondary': '#cbd5e1',
                '--text-tertiary': '#94a3b8',
                '--border-light': '#334155',
                '--border-medium': '#475569',
                '--border-dark': '#64748b'
            }
        };

        return themes;
    }

    applyCustomTheme(customProperties) {
        const root = document.documentElement;
        
        Object.entries(customProperties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    resetToDefaultTheme() {
        const root = document.documentElement;
        
        // Remove any custom properties that might have been set
        const customProps = [
            '--bg-primary', '--bg-secondary', '--bg-tertiary',
            '--text-primary', '--text-secondary', '--text-tertiary',
            '--border-light', '--border-medium', '--border-dark'
        ];
        
        customProps.forEach(prop => {
            root.style.removeProperty(prop);
        });
        
        // Reapply current theme
        this.applyTheme(this.currentTheme);
    }

    exportThemeSettings() {
        return {
            currentTheme: this.currentTheme,
            systemPreference: this.systemPreference,
            effectiveTheme: this.getEffectiveTheme(),
            timestamp: new Date().toISOString()
        };
    }

    importThemeSettings(settings) {
        if (settings && settings.currentTheme) {
            this.setTheme(settings.currentTheme);
            return true;
        }
        return false;
    }

    // Accessibility helpers
    respectsReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    respectsHighContrast() {
        return window.matchMedia && 
               window.matchMedia('(prefers-contrast: high)').matches;
    }

    applyAccessibilityEnhancements() {
        const root = document.documentElement;
        
        if (this.respectsReducedMotion()) {
            root.style.setProperty('--transition-fast', '0ms');
            root.style.setProperty('--transition-normal', '0ms');
            root.style.setProperty('--transition-slow', '0ms');
        }
        
        if (this.respectsHighContrast()) {
            // Enhance contrast in high contrast mode
            if (this.getEffectiveTheme() === 'dark') {
                root.style.setProperty('--text-primary', '#ffffff');
                root.style.setProperty('--border-light', '#ffffff');
            } else {
                root.style.setProperty('--text-primary', '#000000');
                root.style.setProperty('--border-light', '#000000');
            }
        }
    }
}