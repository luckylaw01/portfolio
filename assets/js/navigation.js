/**
 * NAVIGATION
 * Handle navigation controls (buttons, keyboard, pagination)
 */

class Navigation {
    constructor(slideEngine) {
        this.slideEngine = slideEngine;
        this.prevBtn = null;
        this.nextBtn = null;
    }

    /**
     * Initialize navigation
     */
    init() {
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');

        this.setupButtonListeners();
        this.setupKeyboardListeners();
        this.updateButtonStates();
    }

    /**
     * Setup button click listeners
     */
    setupButtonListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.slideEngine.prev();
            this.updateButtonStates();
        });

        this.nextBtn.addEventListener('click', () => {
            this.slideEngine.next();
            this.updateButtonStates();
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Prevent navigation if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.slideEngine.prev();
                    this.updateButtonStates();
                    break;

                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Space bar
                    e.preventDefault();
                    this.slideEngine.next();
                    this.updateButtonStates();
                    break;

                case 'Home':
                    e.preventDefault();
                    this.slideEngine.showSlide(0);
                    this.updateButtonStates();
                    break;

                case 'End':
                    e.preventDefault();
                    this.slideEngine.showSlide(this.slideEngine.getTotalSlides() - 1);
                    this.updateButtonStates();
                    break;
            }
        });
    }

    /**
     * Update button states (disabled/enabled)
     */
    updateButtonStates() {
        const currentIndex = this.slideEngine.getCurrentIndex();
        const totalSlides = this.slideEngine.getTotalSlides();

        // Update previous button
        if (currentIndex === 0) {
            this.prevBtn.classList.add('disabled');
            this.prevBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.prevBtn.classList.remove('disabled');
            this.prevBtn.setAttribute('aria-disabled', 'false');
        }

        // Update next button
        if (currentIndex === totalSlides - 1) {
            this.nextBtn.classList.add('disabled');
            this.nextBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.nextBtn.classList.remove('disabled');
            this.nextBtn.setAttribute('aria-disabled', 'false');
        }
    }
}

// Navigation will be initialized in main.js
