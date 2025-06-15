// UI State and Animation Management
export class UIManager {
    constructor() {
        this.currentSection = 'home';
        this.mobileMenuOpen = false;
        this.notifications = [];
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollEffects();
        this.updateNavOnScroll();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '-70px 0px -70px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNavLink(sectionId);
                }
            });
        }, observerOptions);

        // Observe all main sections
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.observe(section));
    }

    updateActiveNavLink(sectionId) {
        const section = sectionId.replace('Section', '');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });
        this.currentSection = section;
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    updateNavOnScroll() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Add to notifications array
        this.notifications.push(notification);

        return notification;
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" 
                    style="background: none; border: none; color: white; margin-left: auto; cursor: pointer; padding: 0; font-size: 1.2rem;">
                &times;
            </button>
        `;

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);

        // Remove from notifications array
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }

    showModal(content, title = '', actions = []) {
        // Close any existing modal
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) {
            existingModal.parentElement.removeChild(existingModal);
        }

        const modal = this.createModalElement(content, title, actions);
        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        return modal;
    }

    createModalElement(content, title, actions) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--bg-primary);
            border-radius: 1rem;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        let actionsHtml = '';
        if (actions.length > 0) {
            actionsHtml = `
                <div style="padding: 1rem 2rem; border-top: 1px solid var(--border-light); display: flex; gap: 1rem; justify-content: flex-end;">
                    ${actions.map((action, index) => 
                        `<button class="btn ${action.type || 'btn-secondary'}" onclick="window.modalActions[${index}]()">${action.label}</button>`
                    ).join('')}
                </div>
            `;
            
            // Store actions globally for onclick handlers
            window.modalActions = actions.map(action => action.handler);
        }

        modalContent.innerHTML = `
            ${title ? `
                <div style="padding: 2rem 2rem 1rem; border-bottom: 1px solid var(--border-light);">
                    <h3 style="margin: 0; color: var(--text-primary);">${title}</h3>
                </div>
            ` : ''}
            <div style="padding: 2rem;">
                ${content}
            </div>
            ${actionsHtml}
        `;

        modal.appendChild(modalContent);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        // Add active class styles
        modal.classList.add('active');
        const style = document.createElement('style');
        style.textContent = `
            .custom-modal.active {
                opacity: 1 !important;
                visibility: visible !important;
            }
            .custom-modal.active > div {
                transform: scale(1) !important;
            }
        `;
        document.head.appendChild(style);

        return modal;
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.querySelector('div').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
            // Clean up global actions
            delete window.modalActions;
        }, 300);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const navbar = document.querySelector('.navbar');
        
        if (this.mobileMenuOpen) {
            navbar.classList.add('mobile-menu-open');
        } else {
            navbar.classList.remove('mobile-menu-open');
        }
    }

    showLoadingOverlay(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;

        overlay.innerHTML = `
            <div style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-left-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            "></div>
            <p>${message}</p>
        `;

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);
        return overlay;
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    animateCounter(element, target, duration = 2000) {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    slideIn(element, direction = 'left', duration = 300) {
        const translations = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };

        element.style.transform = translations[direction];
        element.style.transition = `transform ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.transform = 'translate(0, 0)';
        });
    }

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    pulse(element, color = '#3b82f6') {
        const originalBackground = element.style.backgroundColor;
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = color;

        setTimeout(() => {
            element.style.backgroundColor = originalBackground;
        }, 300);
    }

    shake(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        
        // Add shake animation if not exists
        if (!document.querySelector('#shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    highlightElement(element, duration = 2000) {
        element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
        element.style.transition = 'box-shadow 0.3s ease';

        setTimeout(() => {
            element.style.boxShadow = '';
        }, duration);
    }

    getCurrentSection() {
        return this.currentSection;
    }

    isMobileMenuOpen() {
        return this.mobileMenuOpen;
    }

    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
        this.notifications = [];
    }
}