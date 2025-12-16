/**
 * MAIN APPLICATION
 * Initialize and orchestrate all components
 */

// Global instances
let navigation = null;
let gestureHandler = null;

/**
 * Initialize the portfolio presentation
 */
async function initPortfolio() {
    try {
        // Show loading state (optional)
        showLoading();

        // Initialize slide engine
        const success = await slideEngine.init();

        if (!success) {
            throw new Error('Failed to initialize slide engine');
        }

        // Initialize navigation
        navigation = new Navigation(slideEngine);
        navigation.init();

        // Initialize gesture handler
        gestureHandler = new GestureHandler(slideEngine);
        gestureHandler.init();

        // Hide loading state
        hideLoading();

        // Animate first slide elements
        animateCurrentSlide();

        console.log('Portfolio initialized successfully!');
    } catch (error) {
        console.error('Error initializing portfolio:', error);
        showError('Failed to load portfolio. Please refresh the page.');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    // You can add a loading spinner here if needed
    console.log('Loading portfolio...');
}

/**
 * Hide loading state
 */
function hideLoading() {
    console.log('Portfolio loaded!');
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.1);
        border: 2px solid #ff0000;
        color: #ffffff;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        z-index: 9999;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

/**
 * Animate elements in current slide
 */
function animateCurrentSlide() {
    const currentSlide = slideEngine.slides[slideEngine.currentIndex];
    if (!currentSlide) return;

    const staggerItems = currentSlide.querySelectorAll('.stagger-item');
    Utils.staggerAnimate(Array.from(staggerItems));
}

/**
 * Handle window resize
 */
const handleResize = Utils.debounce(() => {
    // Recalculate slide positions if needed
    const offset = -slideEngine.currentIndex * 100;
    slideEngine.slidesWrapper.style.transform = `translateX(${offset}vw)`;
}, 250);

/**
 * Setup event listeners
 */
function setupEventListeners() {
    window.addEventListener('resize', handleResize);
}

/**
 * Cleanup function
 */
function cleanup() {
    window.removeEventListener('resize', handleResize);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPortfolio();
        setupEventListeners();
    });
} else {
    // DOM already loaded
    initPortfolio();
    setupEventListeners();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
