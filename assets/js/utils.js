/**
 * UTILITY FUNCTIONS
 * Helper functions for the portfolio presentation
 */

// Utility namespace
const Utils = {
    /**
     * Debounce function to limit rate of function execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to ensure function executes at most once per interval
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Load JSON data from a file
     */
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    },

    /**
     * Format date string
     */
    formatDate(dateString) {
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    },

    /**
     * Add animation class to element
     */
    animate(element, animationClass, callback) {
        element.classList.add(animationClass);
        
        const handleAnimationEnd = () => {
            element.classList.remove(animationClass);
            element.removeEventListener('animationend', handleAnimationEnd);
            if (callback) callback();
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
    },

    /**
     * Stagger animation for multiple elements
     */
    staggerAnimate(elements, baseDelay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * baseDelay);
        });
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Clamp a number between min and max
     */
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Get YouTube embed URL from video ID
     */
    getYouTubeEmbedUrl(videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Create element with classes and attributes
     */
    createElement(tag, classes = [], attributes = {}) {
        const element = document.createElement(tag);
        
        if (classes.length > 0) {
            element.classList.add(...classes);
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
