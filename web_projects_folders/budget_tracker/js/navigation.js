/* ═══════════════════════════════════════════════════════════════════════════
   NAVIGATION SYSTEM - View Routing & Loading
   ═══════════════════════════════════════════════════════════════════════════ */

class Navigation {
    constructor() {
        this.views = {};                    // Cache for loaded views
        this.currentView = null;            // Track active view name
        this.viewHistory = [];              // Navigation history stack
        this.contentContainer = null;       // DOM container for views
        this.isLoading = false;             // Prevent double-loading
        this.transitionDuration = 300;      // Animation duration in ms
    }

    /**
     * Initialize the navigation system
     */
    init() {
        this.contentContainer = document.getElementById('app-content');
        if (!this.contentContainer) {
            console.error('Navigation: Could not find #app-content container');
            return false;
        }
        console.log('Navigation: Initialized successfully');
        return true;
    }

    /**
     * Load a view by name
     * @param {string} viewName - Name of the view (without .html extension)
     * @param {boolean} addToHistory - Whether to add to navigation history
     * @param {object} params - Optional parameters to pass to the view
     */
    async loadView(viewName, addToHistory = true, params = {}) {
        // Prevent loading if already loading or same view
        if (this.isLoading) {
            console.log('Navigation: Already loading a view');
            return;
        }

        if (this.currentView === viewName && Object.keys(params).length === 0) {
            console.log('Navigation: View already active');
            return;
        }

        this.isLoading = true;
        console.log(`Navigation: Loading view "${viewName}"`);

        try {
            // Fetch view HTML (from cache or network)
            let viewHTML = await this.fetchView(viewName);
            
            if (!viewHTML) {
                throw new Error(`Failed to load view: ${viewName}`);
            }

            // Add current view to history before switching
            if (addToHistory && this.currentView) {
                this.viewHistory.push(this.currentView);
            }

            // Apply transition out
            await this.transitionOut();

            // Update container content
            this.contentContainer.innerHTML = viewHTML;

            // Update current view
            this.currentView = viewName;

            // Store params for view initialization
            this.currentParams = params;

            // Apply transition in
            await this.transitionIn();

            // Initialize view-specific logic
            this.initializeView(viewName, params);

            console.log(`Navigation: View "${viewName}" loaded successfully`);

        } catch (error) {
            console.error('Navigation: Error loading view', error);
            this.showError(viewName);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetch view HTML from cache or network
     * @param {string} viewName - Name of the view
     * @returns {string} HTML content
     */
    async fetchView(viewName) {
        // Check cache first
        if (this.views[viewName]) {
            console.log(`Navigation: Using cached view "${viewName}"`);
            return this.views[viewName];
        }

        // Fetch from network
        try {
            const response = await fetch(`views/${viewName}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();
            
            // Cache the view
            this.views[viewName] = html;
            console.log(`Navigation: Cached view "${viewName}"`);
            
            return html;

        } catch (error) {
            console.error(`Navigation: Failed to fetch "${viewName}"`, error);
            return null;
        }
    }

    /**
     * Navigate back to previous view
     */
    goBack() {
        if (this.viewHistory.length === 0) {
            console.log('Navigation: No history to go back to');
            return false;
        }

        const previousView = this.viewHistory.pop();
        console.log(`Navigation: Going back to "${previousView}"`);
        
        // Load previous view without adding to history
        this.loadView(previousView, false);
        return true;
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.viewHistory = [];
        console.log('Navigation: History cleared');
    }

    /**
     * Transition out animation
     */
    transitionOut() {
        return new Promise(resolve => {
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.transform = 'translateX(-20px)';
            setTimeout(resolve, this.transitionDuration / 2);
        });
    }

    /**
     * Transition in animation
     */
    transitionIn() {
        return new Promise(resolve => {
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.transform = 'translateX(20px)';
            
            // Force reflow
            this.contentContainer.offsetHeight;
            
            // Apply transition
            this.contentContainer.style.transition = `opacity ${this.transitionDuration}ms ease, transform ${this.transitionDuration}ms ease`;
            this.contentContainer.style.opacity = '1';
            this.contentContainer.style.transform = 'translateX(0)';
            
            setTimeout(resolve, this.transitionDuration);
        });
    }

    /**
     * Initialize view-specific logic after loading
     * @param {string} viewName - Name of the view
     * @param {object} params - Parameters passed to the view
     */
    initializeView(viewName, params) {
        // Convert kebab-case to camelCase for function name
        // e.g., "add-transaction" -> "initAddTransactionView"
        const functionName = 'init' + viewName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'View';

        // Check if app has the init function
        if (window.app && typeof window.app[functionName] === 'function') {
            console.log(`Navigation: Calling ${functionName}()`);
            window.app[functionName](params);
        } else {
            console.log(`Navigation: No init function found for "${viewName}"`);
        }

        // Attach back button handlers
        this.attachBackButtons();

        // Update status bar time
        this.updateStatusTime();
    }

    /**
     * Attach click handlers to all back buttons in current view
     */
    attachBackButtons() {
        const backButtons = this.contentContainer.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        });
    }

    /**
     * Update status bar time
     */
    updateStatusTime() {
        const timeElement = document.getElementById('statusTime');
        if (timeElement) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }

    /**
     * Show error view when loading fails
     * @param {string} viewName - Name of the view that failed
     */
    showError(viewName) {
        this.contentContainer.innerHTML = `
            <div class="view error-view">
                <div class="error-content">
                    <div class="error-icon">❌</div>
                    <h2>Oops!</h2>
                    <p>Could not load "${viewName}"</p>
                    <button class="btn btn-primary" onclick="window.app.navigation.goBack()">
                        Go Back
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Preload views for faster navigation
     * @param {string[]} viewNames - Array of view names to preload
     */
    async preloadViews(viewNames) {
        console.log('Navigation: Preloading views...', viewNames);
        const promises = viewNames.map(name => this.fetchView(name));
        await Promise.all(promises);
        console.log('Navigation: Preloading complete');
    }

    /**
     * Check if a view is cached
     * @param {string} viewName - Name of the view
     * @returns {boolean}
     */
    isViewCached(viewName) {
        return !!this.views[viewName];
    }

    /**
     * Get current view name
     * @returns {string}
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Get navigation history
     * @returns {string[]}
     */
    getHistory() {
        return [...this.viewHistory];
    }
}

// Export for use in app.js
window.Navigation = Navigation;
