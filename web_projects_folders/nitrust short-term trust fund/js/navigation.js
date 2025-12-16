// Navigation and routing logic
class Navigation {
    constructor() {
        this.views = {};
        this.currentView = null;
        this.viewHistory = [];
        this.contentContainer = document.getElementById('app-content');
    }

    async loadView(viewName, addToHistory = true) {
        try {
            // Load view HTML if not cached
            if (!this.views[viewName]) {
                const response = await fetch(`views/${viewName}.html`);
                this.views[viewName] = await response.text();
            }

            // Add current view to history
            if (addToHistory && this.currentView) {
                this.viewHistory.push(this.currentView);
            }

            // Update content
            this.contentContainer.innerHTML = this.views[viewName];
            this.currentView = viewName;

            // Add transition effect
            this.contentContainer.classList.add('view-transition');
            setTimeout(() => {
                this.contentContainer.classList.remove('view-transition');
            }, 300);

            // Trigger view-specific initialization after DOM is updated
            setTimeout(() => {
                this.initializeView(viewName);
            }, 50);

        } catch (error) {
            console.error('Error loading view:', error);
        }
    }

    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.loadView(previousView, false);
        }
    }

    initializeView(viewName) {
        // Call view-specific initialization
        const initMethod = `init${viewName.charAt(0).toUpperCase() + viewName.slice(1).replace(/-./g, x => x[1].toUpperCase())}View`;
        if (typeof window.app[initMethod] === 'function') {
            window.app[initMethod]();
        }
    }
}
