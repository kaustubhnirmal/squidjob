/**
 * Tender Management JavaScript
 * SquidJob Tender Management System
 * 
 * Enhanced functionality for tender management interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize notification system
    initializeNotifications();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize confirmation dialogs
    initializeConfirmations();
});

/**
 * Initialize notification system for real-time updates
 */
function initializeNotifications() {
    // Check for new tender notifications
    if (typeof window.userId !== 'undefined') {
        setInterval(checkTenderNotifications, 30000); // Check every 30 seconds
    }
}

/**
 * Check for new tender-related notifications
 */
function checkTenderNotifications() {
    fetch('/api/notifications/tenders', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': window.csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.notifications.length > 0) {
            updateNotificationBadge(data.count);
            updateNotificationDropdown(data.notifications);
        }
    })
    .catch(error => {
        console.error('Error checking notifications:', error);
    });
}

/**
 * Update notification badge count
 */
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-count');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Update notification dropdown content
 */
function updateNotificationDropdown(notifications) {
    const notificationList = document.querySelector('.notification-list');
    if (notificationList && notifications.length > 0) {
        notificationList.innerHTML = notifications.map(notification => `
            <div class="dropdown-item-text p-3 border-bottom">
                <div class="d-flex align-items-start">
                    <i class="fas fa-${getNotificationIcon(notification.type)} text-primary me-2 mt-1"></i>
                    <div class="flex-grow-1">
                        <div class="fw-semibold">${notification.title}</div>
                        <div class="text-muted small">${notification.message}</div>
                        <div class="text-muted small">${formatTimeAgo(notification.created_at)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Get appropriate icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        'tender_created': 'file-contract',
        'tender_updated': 'edit',
        'bid_submitted': 'hand-paper',
        'bid_accepted': 'check-circle',
        'bid_rejected': 'times-circle',
        'deadline_reminder': 'clock',
        'document_uploaded': 'file-upload'
    };
    return icons[type] || 'bell';
}

/**
 * Initialize enhanced search functionality
 */
function initializeSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let searchTimeout;
        
        // Add search suggestions
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2) {
                    fetchSearchSuggestions(this.value);
                } else {
                    hideSearchSuggestions();
                }
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target)) {
                hideSearchSuggestions();
            }
        });
    }
}

/**
 * Fetch search suggestions
 */
function fetchSearchSuggestions(query) {
    fetch(`/api/tenders/search-suggestions?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': window.csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.suggestions.length > 0) {
            showSearchSuggestions(data.suggestions);
        } else {
            hideSearchSuggestions();
        }
    })
    .catch(error => {
        console.error('Error fetching search suggestions:', error);
    });
}

/**
 * Show search suggestions dropdown
 */
function showSearchSuggestions(suggestions) {
    const searchInput = document.querySelector('input[name="search"]');
    let suggestionsDropdown = document.getElementById('searchSuggestions');
    
    if (!suggestionsDropdown) {
        suggestionsDropdown = document.createElement('div');
        suggestionsDropdown.id = 'searchSuggestions';
        suggestionsDropdown.className = 'position-absolute bg-white border rounded shadow-sm w-100';
        suggestionsDropdown.style.cssText = 'top: 100%; left: 0; z-index: 1000; max-height: 300px; overflow-y: auto;';
        searchInput.parentNode.style.position = 'relative';
        searchInput.parentNode.appendChild(suggestionsDropdown);
    }
    
    suggestionsDropdown.innerHTML = suggestions.map(suggestion => `
        <div class="p-2 border-bottom suggestion-item" style="cursor: pointer;" 
             onclick="selectSuggestion('${suggestion.title}', '${suggestion.url}')">
            <div class="fw-semibold">${suggestion.title}</div>
            <div class="text-muted small">${suggestion.organization} • ${suggestion.category}</div>
        </div>
    `).join('');
    
    suggestionsDropdown.style.display = 'block';
}

/**
 * Hide search suggestions dropdown
 */
function hideSearchSuggestions() {
    const suggestionsDropdown = document.getElementById('searchSuggestions');
    if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
    }
}

/**
 * Select a search suggestion
 */
function selectSuggestion(title, url) {
    window.location.href = url;
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize confirmation dialogs
 */
function initializeConfirmations() {
    // Add confirmation to delete buttons
    document.querySelectorAll('[data-confirm]').forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.dataset.confirm || 'Are you sure?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Format time ago string
 */
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to toast container or create one
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove from DOM after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

/**
 * Export functions for global use
 */
window.TenderManagement = {
    showToast,
    updateNotificationBadge,
    formatTimeAgo
};