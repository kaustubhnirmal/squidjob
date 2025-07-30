/**
 * SquidJob Landing Page JavaScript
 * Modal functionality, animations, and interactions
 */

// Global variables
let isModalOpen = false;
let animationObserver = null;
let statsAnimated = false;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize components
    initializeModal();
    initializeNavigation();
    initializeAnimations();
    initializeCounters();
    initializeFormValidation();
    initializeMobileMenu();
    initializeScrollEffects();
    
    // Performance monitoring
    monitorPerformance();
    
    console.log('SquidJob Landing Page initialized successfully');
}

/**
 * Modal functionality
 */
function initializeModal() {
    const modal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    
    if (!modal || !loginForm) return;
    
    // Open modal when Sign In buttons are clicked
    document.querySelectorAll('.btn-outline, .btn-primary').forEach(btn => {
        if (btn.textContent.includes('Sign In') || btn.textContent.includes('Get Started')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginModal();
            });
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLoginModal();
        }
    });
    
    // Close modal when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeLoginModal();
        }
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Password toggle functionality
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }
}

/**
 * Open login modal
 */
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    isModalOpen = true;
    
    // Focus on username field after animation
    setTimeout(() => {
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    }, 300);
    
    // Add modal open class for animations
    modal.classList.add('modal-open');
}

/**
 * Close login modal
 */
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    isModalOpen = false;
    
    // Remove modal open class
    modal.classList.remove('modal-open');
    
    // Clear any error states
    clearFormErrors();
}

/**
 * Toggle password visibility
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle svg');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        toggleIcon.innerHTML = `
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        `;
    }
}

/**
 * Handle login form submission
 */
function handleLogin() {
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('.btn-primary');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    const errors = validateLoginForm(username, password);
    if (errors.length > 0) {
        displayFormErrors(errors);
        return;
    }
    
    // Show loading state
    showLoadingState(submitBtn);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('email', username);
    formData.append('password', password);
    formData.append('remember', remember ? 'on' : '');
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    
    // Submit form
    fetch('auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data && data.success) {
            // Successful login
            showSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = data.redirect || 'dashboard.php';
            }, 1500);
        } else {
            // Login failed
            hideLoadingState(submitBtn);
            displayFormErrors([data.message || 'Login failed. Please try again.']);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        hideLoadingState(submitBtn);
        displayFormErrors(['An error occurred. Please try again.']);
    });
}

/**
 * Validate login form
 */
function validateLoginForm(username, password) {
    const errors = [];
    
    if (!username.trim()) {
        errors.push('Email is required');
    } else if (!isValidEmail(username)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password.trim()) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display form errors
 */
function displayFormErrors(errors) {
    // Remove existing error messages
    clearFormErrors();
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'form-errors';
    errorContainer.style.cssText = `
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
    `;
    
    // Add errors
    errors.forEach(error => {
        const errorItem = document.createElement('div');
        errorItem.textContent = error;
        errorContainer.appendChild(errorItem);
    });
    
    // Insert error container
    const form = document.getElementById('loginForm');
    form.insertBefore(errorContainer, form.firstChild);
}

/**
 * Clear form errors
 */
function clearFormErrors() {
    const existingErrors = document.querySelector('.form-errors');
    if (existingErrors) {
        existingErrors.remove();
    }
}

/**
 * Show loading state
 */
function showLoadingState(button) {
    const originalText = button.innerHTML;
    button.dataset.originalText = originalText;
    button.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
        </svg>
        Signing In...
    `;
    button.disabled = true;
    
    // Add spinner animation
    const spinner = button.querySelector('.spinner');
    if (spinner) {
        spinner.style.animation = 'spin 1s linear infinite';
    }
}

/**
 * Hide loading state
 */
function hideLoadingState(button) {
    const originalText = button.dataset.originalText;
    if (originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const successContainer = document.createElement('div');
    successContainer.className = 'form-success';
    successContainer.style.cssText = `
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        text-align: center;
    `;
    successContainer.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(successContainer, form.firstChild);
}

/**
 * Initialize smooth scrolling navigation
 */
function initializeNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

/**
 * Initialize mobile menu
 */
function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('nav');
    
    if (!mobileToggle || !nav) return;
    
    mobileToggle.addEventListener('click', function() {
        nav.classList.toggle('mobile-open');
        mobileToggle.classList.toggle('active');
        
        // Toggle body scroll
        if (nav.classList.contains('mobile-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close mobile menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('mobile-open');
            mobileToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

/**
 * Initialize animations and intersection observer
 */
function initializeAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger counter animation for stats
                if (entry.target.classList.contains('stats-bar') && !statsAnimated) {
                    animateCounters();
                    statsAnimated = true;
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        '.feature-card, .step-item, .stats-bar, .section-header'
    );
    
    elementsToAnimate.forEach(el => {
        animationObserver.observe(el);
    });
}

/**
 * Initialize counter animations
 */
function initializeCounters() {
    // This will be triggered by intersection observer
}

/**
 * Animate counter numbers
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, '')) || 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = formatNumber(Math.floor(current));
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = formatNumber(target);
            }
        };
        
        // Add suffix back if it exists
        const originalText = counter.textContent;
        const suffix = originalText.replace(/[\d,]/g, '');
        
        const formatNumber = (num) => {
            return num.toLocaleString() + suffix;
        };
        
        updateCounter();
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.type === 'email') {
        if (!value) {
            isValid = false;
            errorMessage = 'Email is required';
        } else if (!isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    } else if (field.type === 'password') {
        if (!value) {
            isValid = false;
            errorMessage = 'Password is required';
        } else if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
    `;
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
    field.style.borderColor = '#dc2626';
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
}

/**
 * Initialize scroll effects
 */
function initializeScrollEffects() {
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const octopus = document.querySelector('.octopus-mascot img');
    
    if (!hero || !octopus) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (scrolled < hero.offsetHeight) {
            octopus.style.transform = `translateY(${rate}px)`;
        }
    });
}

/**
 * Play demo function (placeholder)
 */
function playDemo() {
    // This would typically open a video modal or redirect to a demo page
    alert('Demo video would play here. This is a placeholder for the actual demo functionality.');
}

/**
 * Performance monitoring
 */
function monitorPerformance() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            // Log performance metrics
            if (loadTime > 3000) {
                console.warn('Page load time exceeds 3 seconds');
            }
        }
    });
    
    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`LCP: ${lastEntry.startTime}ms`);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
}

/**
 * Utility functions
 */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Global functions for HTML onclick handlers
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.togglePassword = togglePassword;
window.playDemo = playDemo;

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openLoginModal,
        closeLoginModal,
        togglePassword,
        playDemo
    };
}