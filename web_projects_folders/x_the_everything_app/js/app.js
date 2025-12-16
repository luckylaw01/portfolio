/* ===================================
   X APP - MAIN APPLICATION CLASS
   Core Logic and Data Management
   =================================== */

class XApp {
    constructor() {
        this.currentUser = null;
        this.navigation = new Navigation(this);
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        console.log('X App initializing...');
        
        // Generate sample data if none exists (first run only)
        const users = this.getData('users');
        const products = this.getData('products');
        if ((!users || users.length === 0) && (!products || products.length === 0)) {
            console.log('No data found, generating sample data...');
            generateSampleData();
        }
        
        // Check if user is already logged in
        const session = this.getSession();
        if (session && session.userId) {
            const users = this.getData('users') || [];
            this.currentUser = users.find(u => u.id === session.userId);
            
            if (this.currentUser) {
                // User is logged in, go to home
                this.navigation.loadView('home');
            } else {
                // Session invalid, clear and show splash
                this.clearSession();
                this.navigation.loadView('splash');
            }
        } else {
            // No session, show splash screen
            this.navigation.loadView('splash');
        }
    }
    
    /* ===================================
       DATA MANAGEMENT (LocalStorage)
       =================================== */
    
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    saveData(key, data) {
        try {
            localStorage.setItem(`x_app_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Retrieved data or null
     */
    getData(key) {
        try {
            const data = localStorage.getItem(`x_app_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }
    
    /**
     * Delete data from localStorage
     * @param {string} key - Storage key
     */
    deleteData(key) {
        localStorage.removeItem(`x_app_${key}`);
    }
    
    /* ===================================
       SESSION MANAGEMENT
       =================================== */
    
    /**
     * Create user session
     * @param {object} user - User object
     */
    createSession(user) {
        const session = {
            userId: user.id,
            createdAt: new Date().toISOString()
        };
        this.saveData('session', session);
        this.currentUser = user;
    }
    
    /**
     * Get current session
     * @returns {object|null} Session object or null
     */
    getSession() {
        return this.getData('session');
    }
    
    /**
     * Clear user session (logout)
     */
    clearSession() {
        this.deleteData('session');
        this.currentUser = null;
    }
    
    /* ===================================
       USER AUTHENTICATION
       =================================== */
    
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {object} Created user or error
     */
    signup(userData) {
        const users = this.getData('users') || [];
        
        // Check if username or email already exists
        const existingUser = users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            return { 
                success: false, 
                error: 'Username or email already exists' 
            };
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name: userData.name,
            username: userData.username,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            bio: '',
            profileImage: '',
            coverImage: '',
            followers: [],
            following: [],
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveData('users', users);
        
        return { success: true, user: newUser };
    }
    
    /**
     * Login user
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {object} Login result
     */
    login(username, password) {
        const users = this.getData('users') || [];
        
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password
        );
        
        if (user) {
            this.createSession(user);
            return { success: true, user };
        }
        
        return { success: false, error: 'Invalid credentials' };
    }
    
    /**
     * Logout current user
     */
    logout() {
        this.clearSession();
        this.navigation.clearHistory();
        this.navigation.loadView('splash', false);
    }
    
    /* ===================================
       UTILITY METHODS
       =================================== */
    
    /**
     * Format date to relative time (e.g., "2h ago")
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);
        
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d`;
        
        // Return formatted date for older posts
        return then.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    /**
     * Format number with K, M notation
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    /**
     * Generate unique ID
     * @returns {number} Unique timestamp-based ID
     */
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.xApp = new XApp();
});
