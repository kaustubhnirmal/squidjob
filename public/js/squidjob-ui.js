/**
 * SquidJob UI JavaScript
 * Interactive functionality for the SquidJob Tender Management System
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initSidebar();
        initProfileDropdown();
        initNotifications();
        initModals();
        initTooltips();
        initAnimations();
    });

    /**
     * Sidebar Navigation
     */
    function initSidebar() {
        const navSections = document.querySelectorAll('.nav-section');
        
        navSections.forEach(section => {
            const title = section.querySelector('.nav-section-title');
            const items = section.querySelector('.nav-items');
            const icon = section.querySelector('.nav-section-icon');
            
            if (title && items) {
                title.addEventListener('click', function() {
                    const isCollapsed = section.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        section.classList.remove('collapsed');
                        items.style.maxHeight = items.scrollHeight + 'px';
                    } else {
                        section.classList.add('collapsed');
                        items.style.maxHeight = '0';
                    }
                });
                
                // Set initial max-height for open sections
                if (!section.classList.contains('collapsed')) {
                    items.style.maxHeight = items.scrollHeight + 'px';
                }
            }
        });

        // Handle active nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.href === window.location.href) {
                link.classList.add('active');
                
                // Ensure parent section is expanded
                const section = link.closest('.nav-section');
                if (section && section.classList.contains('collapsed')) {
                    section.classList.remove('collapsed');
                    const items = section.querySelector('.nav-items');
                    if (items) {
                        items.style.maxHeight = items.scrollHeight + 'px';
                    }
                }
            }
        });
    }

    /**
     * Profile Dropdown
     */
    function initProfileDropdown() {
        const profileBtn = document.getElementById('profileBtn');
        const profileMenu = document.getElementById('profileMenu');
        
        if (profileBtn && profileMenu) {
            profileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleDropdown(profileMenu);
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!profileBtn.contains(e.target)) {
                    closeDropdown(profileMenu);
                }
            });
        }
    }

    /**
     * Notifications
     */
    function initNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationBadge = document.querySelector('.notification-badge');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                // Toggle notification panel or redirect to notifications page
                window.location.href = '/notifications';
            });
        }

        // Check for new notifications periodically
        checkNotifications();
        setInterval(checkNotifications, 30000); // Check every 30 seconds
    }

    /**
     * Check for new notifications
     */
    function checkNotifications() {
        if (typeof window.csrfToken === 'undefined') return;
        
        fetch('/api/notifications/count', {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': window.csrfToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                if (data.count > 0) {
                    badge.style.display = 'block';
                    badge.textContent = data.count > 99 ? '99+' : data.count;
                } else {
                    badge.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.log('Notification check failed:', error);
        });
    }

    /**
     * Modal System
     */
    function initModals() {
        // Modal triggers
        document.addEventListener('click', function(e) {
            if (e.target.matches('[data-modal-target]')) {
                const modalId = e.target.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                if (modal) {
                    openModal(modal);
                }
            }
            
            if (e.target.matches('[data-modal-close]') || e.target.closest('[data-modal-close]')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            }
        });

        // Close modal on backdrop click
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    closeModal(openModal);
                }
            }
        });
    }

    /**
     * Tooltips
     */
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }

    /**
     * Animations
     */
    function initAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.card, .stat-card, .tender-card');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Utility Functions
     */
    function toggleDropdown(dropdown) {
        const isVisible = dropdown.style.display === 'block';
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu !== dropdown) {
                closeDropdown(menu);
            }
        });
        
        if (isVisible) {
            closeDropdown(dropdown);
        } else {
            openDropdown(dropdown);
        }
    }

    function openDropdown(dropdown) {
        dropdown.style.display = 'block';
        dropdown.classList.add('show');
        
        // Position dropdown
        positionDropdown(dropdown);
    }

    function closeDropdown(dropdown) {
        dropdown.style.display = 'none';
        dropdown.classList.remove('show');
    }

    function positionDropdown(dropdown) {
        const trigger = dropdown.previousElementSibling || dropdown.parentElement.querySelector('[data-dropdown-trigger]');
        if (!trigger) return;
        
        const triggerRect = trigger.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Reset positioning
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.left = '';
        dropdown.style.right = '';
        
        // Vertical positioning
        if (triggerRect.bottom + dropdownRect.height > viewportHeight) {
            dropdown.style.bottom = (viewportHeight - triggerRect.top) + 'px';
        } else {
            dropdown.style.top = triggerRect.bottom + 'px';
        }
        
        // Horizontal positioning
        if (triggerRect.right - dropdownRect.width < 0) {
            dropdown.style.left = triggerRect.left + 'px';
        } else {
            dropdown.style.right = (viewportWidth - triggerRect.right) + 'px';
        }
    }

    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const focusableElement = modal.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            setTimeout(() => focusableElement.focus(), 100);
        }
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showTooltip(e) {
        const element = e.target;
        const title = element.getAttribute('title');
        if (!title) return;
        
        // Remove title to prevent default tooltip
        element.setAttribute('data-original-title', title);
        element.removeAttribute('title');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = title;
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.whiteSpace = 'nowrap';
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
        tooltip.style.top = (rect.top - tooltipRect.height - 5) + 'px';
        
        // Store reference for cleanup
        element._tooltip = tooltip;
    }

    function hideTooltip(e) {
        const element = e.target;
        const originalTitle = element.getAttribute('data-original-title');
        
        if (originalTitle) {
            element.setAttribute('title', originalTitle);
            element.removeAttribute('data-original-title');
        }
        
        if (element._tooltip) {
            document.body.removeChild(element._tooltip);
            delete element._tooltip;
        }
    }

    /**
     * Form Utilities
     */
    window.SquidJobUI = {
        // Show loading state on button
        showButtonLoading: function(button, text = 'Loading...') {
            if (!button) return;
            
            button.disabled = true;
            button.setAttribute('data-original-text', button.innerHTML);
            button.innerHTML = '<i class="spinner"></i> ' + text;
        },
        
        // Hide loading state on button
        hideButtonLoading: function(button) {
            if (!button) return;
            
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        },
        
        // Show toast notification
        showToast: function(message, type = 'info', duration = 5000) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-message">${message}</span>
                    <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Add toast styles if not already present
            if (!document.getElementById('toast-styles')) {
                const styles = document.createElement('style');
                styles.id = 'toast-styles';
                styles.textContent = `
                    .toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        z-index: 1000;
                        min-width: 300px;
                        animation: slideInRight 0.3s ease;
                    }
                    .toast-info { border-left: 4px solid #3b82f6; }
                    .toast-success { border-left: 4px solid #10b981; }
                    .toast-warning { border-left: 4px solid #f59e0b; }
                    .toast-error { border-left: 4px solid #ef4444; }
                    .toast-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                    }
                    .toast-message {
                        flex: 1;
                        font-size: 14px;
                        color: #374151;
                    }
                    .toast-close {
                        background: none;
                        border: none;
                        color: #9ca3af;
                        cursor: pointer;
                        padding: 4px;
                        margin-left: 12px;
                    }
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(styles);
            }
            
            document.body.appendChild(toast);
            
            // Auto remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, duration);
            }
        },
        
        // Confirm dialog
        confirm: function(message, callback) {
            const confirmed = window.confirm(message);
            if (confirmed && typeof callback === 'function') {
                callback();
            }
            return confirmed;
        }
    };

    /**
     * Global error handler for AJAX requests
     */
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        if (event.reason && event.reason.status === 401) {
            window.location.href = '/login';
        }
    });

})();

/**
 * Additional utility functions for specific components
 */

// Toggle password visibility
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input && button) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }
}

// Auto-resize textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Initialize auto-resize for all textareas
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('textarea[data-auto-resize]');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        
        // Initial resize
        autoResizeTextarea(textarea);
    });
});

// File upload preview
function previewFile(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    
    if (file && preview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">`;
            } else {
                preview.innerHTML = `<div class="file-preview"><i class="fas fa-file"></i> ${file.name}</div>`;
            }
        };
        
        reader.readAsDataURL(file);
    }
}

// Copy to clipboard
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            window.SquidJobUI.showToast(successMessage, 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        window.SquidJobUI.showToast(successMessage, 'success');
    }
}