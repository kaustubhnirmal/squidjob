/**
 * SquidJob Dashboard JavaScript
 * Interactive functionality for dashboard components
 * Handles sidebar, widgets, real-time updates, and user interactions
 */

class SquidJobDashboard {
    constructor() {
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.widgets = new Map();
        this.updateIntervals = new Map();
        this.csrfToken = null;
        
        this.init();
    }
    
    /**
     * Initialize dashboard functionality
     */
    init() {
        this.initElements();
        this.initSidebar();
        this.initWidgets();
        this.initSearch();
        this.initNotifications();
        this.initProfile();
        this.initCSRF();
        this.startAutoUpdates();
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    /**
     * Initialize DOM elements
     */
    initElements() {
        this.sidebar = document.querySelector('.squidjob-sidebar');
        this.sidebarOverlay = document.querySelector('.squidjob-sidebar-overlay');
        this.dashboard = document.querySelector('.squidjob-dashboard');
        this.header = document.querySelector('.squidjob-header');
        this.main = document.querySelector('.squidjob-main');
    }
    
    /**
     * Initialize sidebar functionality
     */
    initSidebar() {
        // Sidebar toggle button
        const toggleBtn = document.querySelector('.squidjob-sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.toggleSidebar.bind(this));
        }
        
        // Mobile toggle button
        const mobileToggle = document.querySelector('.squidjob-header-mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', this.toggleMobileSidebar.bind(this));
        }
        
        // Sidebar overlay (mobile)
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', this.closeMobileSidebar.bind(this));
        }
        
        // Navigation links
        const navLinks = document.querySelectorAll('.squidjob-sidebar-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
        
        // Load sidebar state from localStorage
        this.loadSidebarState();
    }
    
    /**
     * Toggle sidebar collapse/expand
     */
    toggleSidebar() {
        if (this.sidebar && this.dashboard) {
            this.sidebar.classList.toggle('collapsed');
            this.dashboard.classList.toggle('sidebar-collapsed');
            
            // Save state to localStorage
            const isCollapsed = this.sidebar.classList.contains('collapsed');
            localStorage.setItem('squidjob-sidebar-collapsed', isCollapsed);
            
            // Trigger resize event for widgets
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        }
    }
    
    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        if (this.sidebar && this.sidebarOverlay) {
            this.sidebar.classList.toggle('mobile-open');
            this.sidebarOverlay.classList.toggle('active');
            
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = this.sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        }
    }
    
    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        if (this.sidebar && this.sidebarOverlay) {
            this.sidebar.classList.remove('mobile-open');
            this.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Load sidebar state from localStorage
     */
    loadSidebarState() {
        const isCollapsed = localStorage.getItem('squidjob-sidebar-collapsed') === 'true';
        if (isCollapsed && this.sidebar && this.dashboard) {
            this.sidebar.classList.add('collapsed');
            this.dashboard.classList.add('sidebar-collapsed');
        }
    }
    
    /**
     * Handle navigation link clicks
     */
    handleNavClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // Remove active class from all links
        document.querySelectorAll('.squidjob-sidebar-nav-link').forEach(l => {
            l.classList.remove('active');
        });
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Close mobile sidebar if open
        if (window.innerWidth <= 1024) {
            this.closeMobileSidebar();
        }
        
        // Handle AJAX navigation if needed
        if (href && href.startsWith('#')) {
            event.preventDefault();
            this.loadPage(href.substring(1));
        }
    }
    
    /**
     * Initialize widgets
     */
    initWidgets() {
        // Statistics cards with counters
        this.initStatCounters();
        
        // Recent tenders widget
        this.initRecentTenders();
        
        // Activities timeline
        this.initActivitiesTimeline();
        
        // Deadline countdown
        this.initDeadlineCountdown();
        
        // Quick actions
        this.initQuickActions();
        
        // Widget refresh buttons
        this.initWidgetRefresh();
    }
    
    /**
     * Initialize animated stat counters
     */
    initStatCounters() {
        const statCards = document.querySelectorAll('.squidjob-stat-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const valueElement = entry.target.querySelector('.squidjob-stat-card-value');
                    if (valueElement && !valueElement.dataset.animated) {
                        this.animateCounter(valueElement);
                        valueElement.dataset.animated = 'true';
                    }
                }
            });
        }, { threshold: 0.5 });
        
        statCards.forEach(card => observer.observe(card));
    }
    
    /**
     * Animate counter from 0 to target value
     */
    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = this.formatNumber(Math.floor(current));
        }, 16);
    }
    
    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Initialize recent tenders widget
     */
    initRecentTenders() {
        const widget = document.querySelector('[data-widget="recent-tenders"]');
        if (widget) {
            this.widgets.set('recent-tenders', {
                element: widget,
                updateUrl: '/api/dashboard/recent-tenders',
                updateInterval: 30000 // 30 seconds
            });
        }
    }
    
    /**
     * Initialize activities timeline
     */
    initActivitiesTimeline() {
        const widget = document.querySelector('[data-widget="activities"]');
        if (widget) {
            this.widgets.set('activities', {
                element: widget,
                updateUrl: '/api/dashboard/activities',
                updateInterval: 60000 // 1 minute
            });
        }
    }
    
    /**
     * Initialize deadline countdown
     */
    initDeadlineCountdown() {
        const countdownElements = document.querySelectorAll('[data-countdown]');
        
        countdownElements.forEach(element => {
            const deadline = new Date(element.dataset.countdown);
            this.startCountdown(element, deadline);
        });
    }
    
    /**
     * Start countdown timer
     */
    startCountdown(element, deadline) {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = deadline.getTime() - now;
            
            if (distance < 0) {
                clearInterval(timer);
                element.innerHTML = '<span class="squidjob-status squidjob-status-error">Expired</span>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            let countdownText = '';
            if (days > 0) {
                countdownText = `${days}d ${hours}h ${minutes}m`;
            } else if (hours > 0) {
                countdownText = `${hours}h ${minutes}m ${seconds}s`;
            } else {
                countdownText = `${minutes}m ${seconds}s`;
            }
            
            // Color coding based on time remaining
            let statusClass = 'squidjob-status-success';
            if (days < 1) statusClass = 'squidjob-status-warning';
            if (hours < 2) statusClass = 'squidjob-status-error';
            
            element.innerHTML = `<span class="squidjob-status ${statusClass}">${countdownText}</span>`;
        }, 1000);
    }
    
    /**
     * Initialize quick actions
     */
    initQuickActions() {
        const quickActions = document.querySelectorAll('[data-quick-action]');
        
        quickActions.forEach(action => {
            action.addEventListener('click', this.handleQuickAction.bind(this));
        });
    }
    
    /**
     * Handle quick action clicks
     */
    handleQuickAction(event) {
        const button = event.currentTarget;
        const action = button.dataset.quickAction;
        
        // Add loading state
        button.classList.add('loading');
        button.disabled = true;
        
        // Simulate action (replace with actual API calls)
        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;
            
            // Show success notification
            this.showNotification(`${action} completed successfully!`, 'success');
        }, 1000);
    }
    
    /**
     * Initialize widget refresh functionality
     */
    initWidgetRefresh() {
        const refreshButtons = document.querySelectorAll('.squidjob-widget-action[data-action="refresh"]');
        
        refreshButtons.forEach(button => {
            button.addEventListener('click', this.refreshWidget.bind(this));
        });
    }
    
    /**
     * Refresh individual widget
     */
    async refreshWidget(event) {
        const button = event.currentTarget;
        const widget = button.closest('.squidjob-widget');
        const widgetId = widget.dataset.widget;
        
        if (!widgetId || !this.widgets.has(widgetId)) return;
        
        const widgetConfig = this.widgets.get(widgetId);
        
        // Add loading state
        button.classList.add('loading');
        widget.classList.add('loading');
        
        try {
            await this.updateWidget(widgetId, widgetConfig);
        } catch (error) {
            console.error('Widget refresh failed:', error);
            this.showNotification('Failed to refresh widget', 'error');
        } finally {
            button.classList.remove('loading');
            widget.classList.remove('loading');
        }
    }
    
    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.querySelector('.squidjob-header-search input');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (event) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(event.target.value);
                }, 300);
            });
            
            searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.performSearch(event.target.value);
                }
            });
        }
    }
    
    /**
     * Perform search
     */
    async performSearch(query) {
        if (query.length < 2) return;
        
        try {
            const response = await this.apiCall('/api/search', {
                method: 'POST',
                body: JSON.stringify({ query }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Handle search results (implement as needed)
            console.log('Search results:', response);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }
    
    /**
     * Initialize notifications
     */
    initNotifications() {
        const notificationBtn = document.querySelector('.squidjob-header-notifications');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', this.toggleNotifications.bind(this));
        }
        
        // Check for new notifications periodically
        setInterval(this.checkNotifications.bind(this), 60000); // 1 minute
    }
    
    /**
     * Toggle notifications dropdown
     */
    toggleNotifications() {
        // Implement notifications dropdown
        console.log('Toggle notifications');
    }
    
    /**
     * Check for new notifications
     */
    async checkNotifications() {
        try {
            const response = await this.apiCall('/api/notifications/count');
            const badge = document.querySelector('.squidjob-header-notifications-badge');
            
            if (response.count > 0) {
                if (badge) {
                    badge.style.display = 'block';
                }
            } else {
                if (badge) {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }
    
    /**
     * Initialize profile dropdown
     */
    initProfile() {
        const profileBtn = document.querySelector('.squidjob-header-profile');
        if (profileBtn) {
            profileBtn.addEventListener('click', this.toggleProfile.bind(this));
        }
    }
    
    /**
     * Toggle profile dropdown
     */
    toggleProfile() {
        // Implement profile dropdown
        console.log('Toggle profile');
    }
    
    /**
     * Initialize CSRF token
     */
    initCSRF() {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            this.csrfToken = csrfMeta.getAttribute('content');
        }
    }
    
    /**
     * Start auto-updates for widgets
     */
    startAutoUpdates() {
        this.widgets.forEach((config, widgetId) => {
            if (config.updateInterval) {
                const interval = setInterval(() => {
                    this.updateWidget(widgetId, config);
                }, config.updateInterval);
                
                this.updateIntervals.set(widgetId, interval);
            }
        });
    }
    
    /**
     * Update widget data
     */
    async updateWidget(widgetId, config) {
        try {
            const response = await this.apiCall(config.updateUrl);
            const widgetBody = config.element.querySelector('.squidjob-widget-body');
            
            if (widgetBody && response.html) {
                widgetBody.innerHTML = response.html;
                
                // Re-initialize any interactive elements
                this.initWidgetInteractions(config.element);
            }
        } catch (error) {
            console.error(`Failed to update widget ${widgetId}:`, error);
        }
    }
    
    /**
     * Initialize interactions within a widget
     */
    initWidgetInteractions(widget) {
        // Re-initialize countdowns
        const countdowns = widget.querySelectorAll('[data-countdown]');
        countdowns.forEach(element => {
            const deadline = new Date(element.dataset.countdown);
            this.startCountdown(element, deadline);
        });
        
        // Re-initialize other interactive elements as needed
    }
    
    /**
     * Make API call with CSRF protection
     */
    async apiCall(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        };
        
        if (this.csrfToken) {
            defaultOptions.headers['X-CSRF-TOKEN'] = this.csrfToken;
        }
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `squidjob-notification squidjob-notification-${type}`;
        notification.innerHTML = `
            <div class="squidjob-notification-content">
                <span class="squidjob-notification-message">${message}</span>
                <button class="squidjob-notification-close">&times;</button>
            </div>
        `;
        
        // Add to page
        let container = document.querySelector('.squidjob-notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'squidjob-notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.squidjob-notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }
    
    /**
     * Remove notification
     */
    removeNotification(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile sidebar on desktop
        if (window.innerWidth > 1024) {
            this.closeMobileSidebar();
        }
        
        // Trigger widget resize events
        this.widgets.forEach((config) => {
            const event = new CustomEvent('widgetResize', {
                detail: { widget: config.element }
            });
            config.element.dispatchEvent(event);
        });
    }
    
    /**
     * Handle visibility change (tab focus/blur)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause updates when tab is not visible
            this.updateIntervals.forEach((interval) => {
                clearInterval(interval);
            });
        } else {
            // Resume updates when tab becomes visible
            this.startAutoUpdates();
        }
    }
    
    /**
     * Load page content via AJAX
     */
    async loadPage(page) {
        try {
            const response = await this.apiCall(`/api/pages/${page}`);
            
            if (response.html) {
                this.main.innerHTML = response.html;
                
                // Re-initialize page-specific functionality
                this.initWidgets();
            }
        } catch (error) {
            console.error('Failed to load page:', error);
            this.showNotification('Failed to load page', 'error');
        }
    }
    
    /**
     * Cleanup on page unload
     */
    destroy() {
        // Clear all intervals
        this.updateIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.squidJobDashboard = new SquidJobDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.squidJobDashboard) {
        window.squidJobDashboard.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SquidJobDashboard;
}