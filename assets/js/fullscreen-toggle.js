/**
 * FULLSCREEN TOGGLE
 * Handles fullscreen mode for local project iframes
 */

class FullscreenManager {
    constructor() {
        this.isFullscreen = false;
        this.init();
    }

    /**
     * Initialize fullscreen functionality
     */
    init() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Fullscreen toggle button
        const toggleBtn = document.querySelector('.fullscreen-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // F key to toggle fullscreen
            if (e.key === 'f' || e.key === 'F') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.toggle();
                }
            }

            // Escape key to exit fullscreen
            if (e.key === 'Escape' && this.isFullscreen) {
                e.preventDefault();
                this.exit();
            }
        });
    }

    /**
     * Toggle fullscreen mode
     */
    toggle() {
        if (this.isFullscreen) {
            this.exit();
        } else {
            this.enter();
        }
    }

    /**
     * Enter fullscreen mode
     */
    enter() {
        if (this.isFullscreen) return;

        this.isFullscreen = true;
        document.body.classList.add('fullscreen-active');

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('fullscreenEnter'));
    }

    /**
     * Exit fullscreen mode
     */
    exit() {
        if (!this.isFullscreen) return;

        this.isFullscreen = false;
        document.body.classList.remove('fullscreen-active');

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('fullscreenExit'));
    }

    /**
     * Get current fullscreen state
     */
    getState() {
        return this.isFullscreen;
    }
}

// Auto-initialize
let fullscreenManager = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fullscreenManager = new FullscreenManager();
    });
} else {
    fullscreenManager = new FullscreenManager();
}
