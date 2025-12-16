/**
 * GESTURE HANDLING
 * Touch and swipe gestures for mobile navigation
 */

class GestureHandler {
    constructor(slideEngine) {
        this.slideEngine = slideEngine;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // minimum distance for swipe
        this.container = null;
    }

    /**
     * Initialize gesture handling
     */
    init() {
        this.container = document.getElementById('portfolio-presentation');
        this.setupTouchListeners();
        this.setupMouseListeners();
    }

    /**
     * Setup touch event listeners
     */
    setupTouchListeners() {
        this.container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
    }

    /**
     * Setup mouse drag listeners (for desktop)
     */
    setupMouseListeners() {
        let isMouseDown = false;
        let mouseStartX = 0;

        this.container.addEventListener('mousedown', (e) => {
            // Only for left click
            if (e.button !== 0) return;

            // Don't interfere with clickable elements
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                return;
            }

            isMouseDown = true;
            mouseStartX = e.clientX;
            this.container.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;

            isMouseDown = false;
            this.container.style.cursor = '';

            const mouseEndX = e.clientX;
            const diff = mouseStartX - mouseEndX;

            if (Math.abs(diff) > this.minSwipeDistance) {
                if (diff > 0) {
                    // Swiped left - go to next
                    this.slideEngine.next();
                } else {
                    // Swiped right - go to previous
                    this.slideEngine.prev();
                }
            }
        });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        this.handleSwipe();
    }

    /**
     * Determine swipe direction and navigate
     */
    handleSwipe() {
        const horizontalDiff = this.touchStartX - this.touchEndX;
        const verticalDiff = this.touchStartY - this.touchEndY;

        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
            if (Math.abs(horizontalDiff) > this.minSwipeDistance) {
                if (horizontalDiff > 0) {
                    // Swiped left - go to next slide
                    this.slideEngine.next();
                } else {
                    // Swiped right - go to previous slide
                    this.slideEngine.prev();
                }
            }
        }

        // Reset
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }
}

// Gesture handler will be initialized in main.js
