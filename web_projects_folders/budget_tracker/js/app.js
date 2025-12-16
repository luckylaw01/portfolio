/* ═══════════════════════════════════════════════════════════════════════════
   BUDGET TRACKER - Core Application Logic
   ═══════════════════════════════════════════════════════════════════════════ */

class BudgetTrackerApp {
    constructor() {
        this.navigation = new Navigation();
        this.currentUser = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('BudgetTracker: Initializing app...');

        // Initialize navigation
        if (!this.navigation.init()) {
            console.error('BudgetTracker: Failed to initialize navigation');
            return;
        }

        // Start status bar clock
        this.startClock();

        // Check for existing session
        this.checkSession();

        this.isInitialized = true;
        console.log('BudgetTracker: App initialized successfully');
    }

    /**
     * Start the status bar clock
     */
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 60000); // Update every minute
    }

    /**
     * Update status bar time
     */
    updateClock() {
        const timeElement = document.getElementById('statusTime');
        if (timeElement) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }

    /**
     * Check for existing user session
     */
    checkSession() {
        const session = this.getData('session');
        
        if (session && session.userId) {
            // Validate session (check if not expired - 24 hours)
            const sessionAge = Date.now() - session.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (sessionAge < maxAge) {
                // Load user data
                const users = this.getData('users') || [];
                this.currentUser = users.find(u => u.id === session.userId);

                if (this.currentUser) {
                    console.log('BudgetTracker: Session restored for', this.currentUser.name);
                    this.navigation.loadView('dashboard', false);
                    return;
                }
            }

            // Session invalid, clear it
            this.clearSession();
        }

        // No valid session, show splash/onboarding
        this.navigation.loadView('splash', false);
    }

    /**
     * Create a new user session
     * @param {object} user - User object
     */
    createSession(user) {
        this.currentUser = user;
        this.saveData('session', {
            userId: user.id,
            timestamp: Date.now()
        });
        console.log('BudgetTracker: Session created for', user.name);
    }

    /**
     * Clear current session
     */
    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('budget_session');
        console.log('BudgetTracker: Session cleared');
    }

    /**
     * Logout user
     */
    logout() {
        this.clearSession();
        this.navigation.clearHistory();
        this.navigation.loadView('login', false);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA MANAGEMENT - LocalStorage Operations
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    saveData(key, data) {
        try {
            localStorage.setItem(`budget_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('BudgetTracker: Error saving data', error);
            return false;
        }
    }

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    getData(key) {
        try {
            const data = localStorage.getItem(`budget_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('BudgetTracker: Error reading data', error);
            return null;
        }
    }

    /**
     * Delete data from localStorage
     * @param {string} key - Storage key
     */
    deleteData(key) {
        localStorage.removeItem(`budget_${key}`);
    }

    /**
     * Clear all app data
     */
    clearAllData() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('budget_'));
        keys.forEach(k => localStorage.removeItem(k));
        console.log('BudgetTracker: All data cleared');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Format currency value
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: KSh)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'KSh') {
        const formatted = Math.abs(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${currency} ${formatted}`;
    }

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type: 'short', 'long', 'time'
     * @returns {string} Formatted date string
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        switch (format) {
            case 'long':
                return d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'time':
                return d.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'short':
            default:
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
        }
    }

    /**
     * Generate unique ID
     * @returns {number} Unique timestamp-based ID
     */
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Type: 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        `;

        // Add to app content
        const appContent = document.getElementById('app-content');
        appContent.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Validate form data
     * @param {object} data - Form data object
     * @param {object} rules - Validation rules
     * @returns {object} { isValid: boolean, errors: object }
     */
    validateForm(data, rules) {
        const errors = {};

        for (const field in rules) {
            const value = data[field];
            const fieldRules = rules[field];

            if (fieldRules.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${fieldRules.label || field} is required`;
                continue;
            }

            if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
                errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
            }

            if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors[field] = `${fieldRules.label || field} must be less than ${fieldRules.maxLength} characters`;
            }

            if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors[field] = fieldRules.patternMessage || `${fieldRules.label || field} is invalid`;
            }

            if (value && fieldRules.min && parseFloat(value) < fieldRules.min) {
                errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.min}`;
            }

            if (value && fieldRules.max && parseFloat(value) > fieldRules.max) {
                errors[field] = `${fieldRules.label || field} must be less than ${fieldRules.max}`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Initialize App on DOM Ready
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    window.app = new BudgetTrackerApp();
    window.app.init();
});
