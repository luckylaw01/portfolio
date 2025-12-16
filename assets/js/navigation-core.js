/**
 * NAVIGATION CORE
 * Handles navigation between slides with smooth transitions
 */

class NavigationCore {
    constructor() {
        this.slides = [];
        this.currentIndex = 0;
        this.isTransitioning = false;

        // Calculate base URL correctly whether we're in root or slides folder
        const path = window.location.pathname;
        const isInSlidesFolder = path.includes('/slides/');
        this.baseUrl = isInSlidesFolder
            ? window.location.origin + path.substring(0, path.lastIndexOf('/slides/')) + '/'
            : window.location.origin + window.location.pathname.replace('index.html', '');

        this.init();
    }

    /**
     * Initialize navigation system
     */
    async init() {
        await this.initSlides();
        this.loadCurrentSlide();
        this.setupEventListeners();
        this.setupNavigationButtons();
        this.updateSlideCounter();
    }

    /**
     * Initialize slide order from projects.json
     */
    async initSlides() {
        try {
            // Determine correct path to projects.json based on current location
            const isInSlidesFolder = window.location.pathname.includes('/slides/');
            const projectsPath = isInSlidesFolder ? '../projects.json' : './projects.json';

            const response = await fetch(projectsPath);
            const data = await response.json();

            // Build slide list
            this.slides = [
                { id: 'intro', name: 'Introduction', url: 'index.html' }
            ];

            // Add project slides
            data.projects.forEach(project => {
                this.slides.push({
                    id: project.id,
                    name: project.name,
                    url: `slides/${project.id}.html`
                });
            });

            // Determine current slide from URL
            this.currentIndex = this.getCurrentSlideIndex();

        } catch (error) {
            console.error('Error loading slides:', error);
        }
    }

    /**
     * Get current slide index from URL
     */
    getCurrentSlideIndex() {
        const path = window.location.pathname;

        // Check if we're on index.html or root
        if (path.endsWith('index.html') || path.endsWith('/')) {
            return 0;
        }

        // Extract slide ID from path
        const match = path.match(/slides\/([^.]+)\.html/);
        if (match) {
            const slideId = match[1];
            const index = this.slides.findIndex(s => s.id === slideId);
            return index !== -1 ? index : 0;
        }

        return 0;
    }

    /**
     * Load current slide data
     */
    loadCurrentSlide() {
        const currentSlide = this.slides[this.currentIndex];
        if (currentSlide) {
            // Update page title
            document.title = `${currentSlide.name} | Lawrence Munyaka`;

            // Dispatch custom event for slide load
            window.dispatchEvent(new CustomEvent('slideLoaded', {
                detail: {
                    slide: currentSlide,
                    index: this.currentIndex,
                    total: this.slides.length
                }
            }));
        }
    }

    /**
     * Navigate to next slide
     */
    next() {
        if (this.isTransitioning) return;
        if (this.currentIndex >= this.slides.length - 1) return;

        this.navigateTo(this.currentIndex + 1);
    }

    /**
     * Navigate to previous slide
     */
    prev() {
        if (this.isTransitioning) return;
        if (this.currentIndex <= 0) return;

        this.navigateTo(this.currentIndex - 1);
    }

    /**
     * Navigate to specific slide
     */
    navigateTo(index) {
        if (this.isTransitioning) return;
        if (index < 0 || index >= this.slides.length) return;
        if (index === this.currentIndex) return;

        this.isTransitioning = true;
        const targetSlide = this.slides[index];
        const direction = index > this.currentIndex ? 'next' : 'prev';

        // Dispatch navigation event
        window.dispatchEvent(new CustomEvent('slideNavigate', {
            detail: {
                from: this.currentIndex,
                to: index,
                direction: direction,
                slide: targetSlide
            }
        }));

        // Build correct URL based on current location
        const path = window.location.pathname;
        const isInSlidesFolder = path.includes('/slides/');
        let targetUrl = targetSlide.url;

        // If we're in slides folder and going to intro, go up one level
        if (isInSlidesFolder && targetSlide.id === 'intro') {
            targetUrl = '../' + targetSlide.url;
        }
        // If we're at intro and going to a slide, use relative path
        else if (!isInSlidesFolder && targetSlide.id !== 'intro') {
            targetUrl = targetSlide.url;
        }
        // If we're in slides folder going to another slide, use just filename
        else if (isInSlidesFolder && targetSlide.id !== 'intro') {
            targetUrl = targetSlide.id + '.html';
        }

        // Perform transition then navigate
        this.performTransition(direction, () => {
            window.location.href = targetUrl;
        });
    }

    /**
     * Perform transition animation
     */
    performTransition(direction, callback) {
        // Add transition class to body
        document.body.classList.add('page-transitioning', `transition-${direction}`);

        // Wait for transition to complete
        setTimeout(() => {
            if (callback) callback();
            this.isTransitioning = false;
        }, 600);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't intercept if user is in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.next();
                    break;

                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.prev();
                    break;

                case 'Home':
                    e.preventDefault();
                    this.navigateTo(0);
                    break;

                case 'End':
                    e.preventDefault();
                    this.navigateTo(this.slides.length - 1);
                    break;
            }
        });

        // Prevent default browser back/forward during transition
        window.addEventListener('popstate', (e) => {
            if (this.isTransitioning) {
                e.preventDefault();
            }
        });
    }

    /**
     * Get navigation buttons and set up click handlers
     */
    setupNavigationButtons() {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
            prevBtn.disabled = this.currentIndex === 0;
            prevBtn.classList.toggle('disabled', this.currentIndex === 0);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
            nextBtn.disabled = this.currentIndex === this.slides.length - 1;
            nextBtn.classList.toggle('disabled', this.currentIndex === this.slides.length - 1);
        }
    }

    /**
     * Get slide counter element and update
     */
    updateSlideCounter() {
        const counter = document.getElementById('slide-counter');
        if (counter) {
            counter.innerHTML = `
                <span class="current">${this.currentIndex + 1}</span>
                <span class="separator">/</span>
                <span class="total">${this.slides.length}</span>
            `;
        }
    }

    /**
     * Get total slides
     */
    getTotalSlides() {
        return this.slides.length;
    }

    /**
     * Get current slide info
     */
    getCurrentSlide() {
        return this.slides[this.currentIndex];
    }

    /**
     * Get all slides
     */
    getAllSlides() {
        return this.slides;
    }
}

// Auto-initialize on DOM ready
let navigationCore = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        navigationCore = new NavigationCore();
    });
} else {
    navigationCore = new NavigationCore();
}
