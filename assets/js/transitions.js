/**
 * TRANSITIONS
 * Custom JavaScript page transitions for smooth navigation
 */

class TransitionManager {
    constructor() {
        this.activeTransition = null;
        this.transitionDuration = 600; // ms
        this.setupPageTransitions();
    }

    /**
     * Setup page load and unload transitions
     */
    setupPageTransitions() {
        // Page load transition
        window.addEventListener('DOMContentLoaded', () => {
            this.pageEnter();
        });

        // Intercept navigation clicks for smooth transitions
        this.interceptNavigationClicks();
    }

    /**
     * Page enter animation
     */
    pageEnter() {
        const body = document.body;

        // Remove any existing transition classes
        body.classList.remove('page-exiting', 'page-entering');

        // Trigger enter animation
        requestAnimationFrame(() => {
            body.classList.add('page-entering');

            // Remove class after animation
            setTimeout(() => {
                body.classList.remove('page-entering');
            }, this.transitionDuration);
        });
    }

    /**
     * Page exit animation
     */
    pageExit(callback) {
        const body = document.body;

        // Add exit class
        body.classList.add('page-exiting');

        // Execute callback after transition
        setTimeout(() => {
            if (callback) callback();
        }, this.transitionDuration);
    }

    /**
     * Slide transition (horizontal)
     */
    slideTransition(direction = 'right', callback) {
        const overlay = this.createTransitionOverlay();
        overlay.classList.add('transition-slide', `slide-${direction}`);

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Execute callback and cleanup
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }, 100);
        }, this.transitionDuration / 2);
    }

    /**
     * Fade transition
     */
    fadeTransition(callback) {
        const overlay = this.createTransitionOverlay();
        overlay.classList.add('transition-fade');

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Execute callback and cleanup
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }, 100);
        }, this.transitionDuration / 2);
    }

    /**
     * Scale transition
     */
    scaleTransition(callback) {
        const body = document.body;
        body.classList.add('transition-scale-out');

        setTimeout(() => {
            if (callback) callback();
            body.classList.remove('transition-scale-out');
            body.classList.add('transition-scale-in');

            setTimeout(() => {
                body.classList.remove('transition-scale-in');
            }, this.transitionDuration);
        }, this.transitionDuration);
    }

    /**
     * Create transition overlay element
     */
    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        return overlay;
    }

    /**
     * Intercept navigation clicks for smooth transitions
     */
    interceptNavigationClicks() {
        document.addEventListener('click', (e) => {
            // Check if click is on a navigation link
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            // Only intercept internal navigation
            if (href.startsWith('http') || href.startsWith('#')) return;
            if (link.hasAttribute('target')) return;

            // Check if link has transition attribute
            const transitionType = link.getAttribute('data-transition') || 'slide';

            // Prevent default navigation
            e.preventDefault();

            // Perform transition then navigate
            this.performTransition(transitionType, () => {
                window.location.href = href;
            });
        });
    }

    /**
     * Perform specific transition type
     */
    performTransition(type, callback) {
        switch (type) {
            case 'slide':
            case 'slide-right':
                this.slideTransition('right', callback);
                break;
            case 'slide-left':
                this.slideTransition('left', callback);
                break;
            case 'fade':
                this.fadeTransition(callback);
                break;
            case 'scale':
                this.scaleTransition(callback);
                break;
            default:
                this.slideTransition('right', callback);
        }
    }
}

// Initialize transition manager
const transitionManager = new TransitionManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransitionManager;
}
