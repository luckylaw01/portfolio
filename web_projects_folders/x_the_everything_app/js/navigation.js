/* ===================================
   NAVIGATION SYSTEM
   Single Page Application Router
   =================================== */

class Navigation {
    constructor(app) {
        this.app = app;
        this.views = {}; // Cache for loaded views
        this.currentView = null;
        this.viewHistory = [];
        this.contentContainer = document.getElementById('app-content');
        
        // Update time in status bar
        this.updateStatusTime();
        setInterval(() => this.updateStatusTime(), 60000); // Update every minute
    }
    
    /**
     * Load a view into the app content area
     * @param {string} viewName - Name of the view file (without .html)
     * @param {boolean} addToHistory - Whether to add to navigation history
     * @param {object} data - Optional data to pass to the view
     */
    async loadView(viewName, addToHistory = true, data = null) {
        try {
            // Check if view is already cached
            if (!this.views[viewName]) {
                console.log('Loading view:', viewName);
                const viewPath = `views/${viewName}.html`;
                console.log('Fetching from:', viewPath);
                
                // Try fetch with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(viewPath, { 
                    signal: controller.signal,
                    cache: 'no-cache'
                });
                clearTimeout(timeoutId);
                
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`View ${viewName} not found (${response.status})`);
                }
                this.views[viewName] = await response.text();
                console.log('View loaded successfully:', viewName);
            }
            
            // Update content
            this.contentContainer.innerHTML = this.views[viewName];
            
            // Add transition animation
            this.contentContainer.classList.add('view-transition');
            setTimeout(() => {
                this.contentContainer.classList.remove('view-transition');
            }, 300);
            
            // Add to history
            if (addToHistory && viewName !== this.currentView) {
                this.viewHistory.push(this.currentView);
            }
            
            this.currentView = viewName;
            
            // Initialize view-specific functionality
            this.initializeView(viewName, data);
            
            // Scroll to top
            this.contentContainer.scrollTop = 0;
            
        } catch (error) {
            console.error('Error loading view:', error);
            this.contentContainer.innerHTML = `
                <div class="view" style="padding: 20px; text-align: center;">
                    <h2>Error Loading View</h2>
                    <p style="color: var(--x-gray);">Could not load ${viewName}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Reload App</button>
                </div>
            `;
        }
    }
    
    /**
     * Navigate back to previous view
     */
    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.loadView(previousView, false);
        } else {
            // If no history, go to home
            this.loadView('home', false);
        }
    }
    
    /**
     * Initialize view-specific functionality
     * @param {string} viewName - Name of the view
     * @param {object} data - Optional data passed to the view
     */
    initializeView(viewName, data) {
        // Convert view-name to initViewName format
        const initMethodName = 'init' + viewName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'View';
        
        console.log('Initializing view:', viewName, '-> Method:', initMethodName);
        
        // Call the initialization method if it exists
        if (typeof this.app[initMethodName] === 'function') {
            console.log('Calling', initMethodName);
            this.app[initMethodName](data);
        } else {
            console.warn('Method not found:', initMethodName);
        }
        
        // Attach back button handler to all views
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }
    }
    
    /**
     * Update time in status bar
     */
    updateStatusTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        const timeElement = document.getElementById('statusTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }
    
    /**
     * Clear navigation history
     */
    clearHistory() {
        this.viewHistory = [];
    }
}
