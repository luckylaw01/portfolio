/**
 * SLIDE ENGINE
 * Core engine for managing slides and transitions
 */

class SlideEngine {
    constructor() {
        this.slides = [];
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.slidesWrapper = null;
        this.projectsData = null;
    }

    /**
     * Initialize the slide engine
     */
    async init() {
        this.slidesWrapper = document.getElementById('slides-wrapper');

        // Load projects data
        this.projectsData = await Utils.loadJSON('./projects.json');

        if (!this.projectsData) {
            console.error('Failed to load projects data');
            return false;
        }

        // Build slides
        this.buildSlides();

        // Show first slide
        this.showSlide(0);

        return true;
    }

    /**
     * Build all slides from data
     */
    buildSlides() {
        // Clear existing slides
        this.slidesWrapper.innerHTML = '';
        this.slides = [];

        // Create intro slide
        const introSlide = this.createIntroSlide(this.projectsData.intro);
        this.slidesWrapper.appendChild(introSlide);
        this.slides.push(introSlide);

        // Create project slides
        this.projectsData.projects.forEach(project => {
            const projectSlide = this.createProjectSlide(project);
            this.slidesWrapper.appendChild(projectSlide);
            this.slides.push(projectSlide);
        });

        // Update total slides count
        this.updateSlideCounter();
    }

    /**
     * Create intro slide
     */
    createIntroSlide(introData) {
        const slide = Utils.createElement('div', ['slide', 'slide-intro']);

        slide.innerHTML = `
            <div class="slide-content">
                <div class="stagger-item">
                    <img src="${introData.avatar}" alt="${introData.name}" class="intro-avatar">
                </div>
                <h1 class="intro-name stagger-item">${introData.name}</h1>
                <p class="intro-title stagger-item">${introData.title}</p>
                <p class="intro-bio stagger-item">${introData.bio}</p>
            </div>
        `;

        return slide;
    }

    /**
     * Create project slide based on type
     */
    createProjectSlide(project) {
        switch (project.type) {
            case 'web-hosted':
                return this.createWebHostedSlide(project);
            case 'web-local':
                return this.createWebLocalSlide(project);
            case 'image':
                return this.createImageSlide(project);
            case 'video':
                return this.createVideoSlide(project);
            case '3d':
                return this.create3DSlide(project);
            default:
                console.warn(`Unknown project type: ${project.type}`);
                return this.createWebHostedSlide(project);
        }
    }

    /**
     * Create hosted web project slide
     */
    createWebHostedSlide(project) {
        const slide = Utils.createElement('div', ['slide', 'slide-web-hosted']);

        const techTags = project.technologies
            ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
            : '';

        slide.innerHTML = `
            <div class="slide-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
                <div class="project-info">
                    <div class="project-category stagger-item">${project.category}</div>
                    <h2 class="project-name stagger-item">${project.name}</h2>
                    <p class="project-date stagger-item">${Utils.formatDate(project.date)}</p>
                    <p class="project-description stagger-item">${project.description}</p>
                    <div class="project-story stagger-item">
                        <strong>Story:</strong> ${project.story}
                    </div>
                    <div class="project-technologies stagger-item">
                        ${techTags}
                    </div>
                    <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link stagger-item">
                        Visit Website
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                </div>
                <div class="project-preview stagger-item">
                    <img src="${project.screenshot}" alt="${project.name}" class="project-screenshot">
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Create local web project slide
     */
    createWebLocalSlide(project) {
        const slide = Utils.createElement('div', ['slide', 'slide-web-local']);

        const techTags = project.technologies
            ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
            : '';

        slide.innerHTML = `
            <div class="slide-content">
                <div class="local-web-header">
                    <div class="project-info" style="max-width: 60%;">
                        <div class="project-category stagger-item">${project.category}</div>
                        <h2 class="project-name stagger-item">${project.name}</h2>
                        <p class="project-date stagger-item">${Utils.formatDate(project.date)}</p>
                        <p class="project-description stagger-item">${project.description}</p>
                        <div class="project-story stagger-item">
                            <strong>Story:</strong> ${project.story}
                        </div>
                        <div class="project-technologies stagger-item">
                            ${techTags}
                        </div>
                    </div>
                </div>
                <div class="local-web-embed stagger-item">
                    <iframe src="${project.localPath}/${project.entryFile}" class="local-web-iframe" title="${project.name}"></iframe>
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Create image project slide
     */
    createImageSlide(project) {
        const slide = Utils.createElement('div', ['slide', 'slide-image']);

        const tools = project.tools
            ? project.tools.map(tool => `<span class="tech-tag">${tool}</span>`).join('')
            : '';

        slide.innerHTML = `
            <div class="slide-content" style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: center;">
                <div class="image-preview stagger-item">
                    <img src="${project.imagePath}" alt="${project.name}" class="project-image">
                </div>
                <div class="project-info">
                    <div class="project-category stagger-item">${project.category}</div>
                    <h2 class="project-name stagger-item">${project.name}</h2>
                    <p class="project-date stagger-item">${Utils.formatDate(project.date)}</p>
                    <p class="project-description stagger-item">${project.description}</p>
                    <div class="project-story stagger-item">
                        <strong>Story:</strong> ${project.story}
                    </div>
                    <div class="project-technologies stagger-item">
                        ${tools}
                    </div>
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Create video project slide
     */
    createVideoSlide(project) {
        const slide = Utils.createElement('div', ['slide', 'slide-video']);

        const tools = project.tools
            ? project.tools.map(tool => `<span class="tech-tag">${tool}</span>`).join('')
            : '';

        const embedUrl = Utils.getYouTubeEmbedUrl(project.youtubeId);

        slide.innerHTML = `
            <div class="slide-content" style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: center;">
                <div class="video-embed stagger-item">
                    <iframe src="${embedUrl}" class="video-iframe" title="${project.name}" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
                <div class="project-info">
                    <div class="project-category stagger-item">${project.category}</div>
                    <h2 class="project-name stagger-item">${project.name}</h2>
                    <p class="project-date stagger-item">${Utils.formatDate(project.date)}</p>
                    <p class="project-description stagger-item">${project.description}</p>
                    <div class="project-story stagger-item">
                        <strong>Story:</strong> ${project.story}
                    </div>
                    <div class="project-technologies stagger-item">
                        ${tools}
                    </div>
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Create 3D project slide
     */
    create3DSlide(project) {
        const slide = Utils.createElement('div', ['slide', 'slide-3d']);

        const tools = project.tools
            ? project.tools.map(tool => `<span class="tech-tag">${tool}</span>`).join('')
            : '';

        slide.innerHTML = `
            <div class="slide-content" style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem; align-items: center;">
                <div class="image-preview stagger-item">
                    <img src="${project.imagePath}" alt="${project.name}" class="project-image">
                </div>
                <div class="project-info">
                    <div class="project-category stagger-item">${project.category}</div>
                    <h2 class="project-name stagger-item">${project.name}</h2>
                    <p class="project-date stagger-item">${Utils.formatDate(project.date)}</p>
                    <p class="project-description stagger-item">${project.description}</p>
                    <div class="project-story stagger-item">
                        <strong>Story:</strong> ${project.story}
                    </div>
                    <div class="project-technologies stagger-item">
                        ${tools}
                    </div>
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Show specific slide
     */
    showSlide(index, direction = 'next') {
        if (this.isTransitioning) return;

        const targetIndex = Utils.clamp(index, 0, this.slides.length - 1);

        if (targetIndex === this.currentIndex) return;

        this.isTransitioning = true;

        // Update index
        const previousIndex = this.currentIndex;
        this.currentIndex = targetIndex;

        // Calculate transform
        const offset = -this.currentIndex * 100;
        this.slidesWrapper.style.transform = `translateX(${offset}vw)`;

        // Animate stagger items in new slide
        setTimeout(() => {
            const newSlide = this.slides[this.currentIndex];
            const staggerItems = newSlide.querySelectorAll('.stagger-item');
            Utils.staggerAnimate(Array.from(staggerItems));
        }, 300);

        // Update UI
        this.updateSlideCounter();
        this.updatePaginationDots();

        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    /**
     * Go to next slide
     */
    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.showSlide(this.currentIndex + 1, 'next');
        }
    }

    /**
     * Go to previous slide
     */
    prev() {
        if (this.currentIndex > 0) {
            this.showSlide(this.currentIndex - 1, 'prev');
        }
    }

    /**
     * Update slide counter display
     */
    updateSlideCounter() {
        const currentSlideEl = document.getElementById('current-slide');
        const totalSlidesEl = document.getElementById('total-slides');

        if (currentSlideEl && totalSlidesEl) {
            currentSlideEl.textContent = this.currentIndex + 1;
            totalSlidesEl.textContent = this.slides.length;
        }
    }

    /**
     * Update pagination dots
     */
    updatePaginationDots() {
        const dotsContainer = document.getElementById('pagination-dots');

        // Create dots if not exists
        if (dotsContainer.children.length === 0) {
            this.slides.forEach((_, index) => {
                const dot = Utils.createElement('div', ['pagination-dot']);
                dot.addEventListener('click', () => this.showSlide(index));
                dotsContainer.appendChild(dot);
            });
        }

        // Update active state
        const dots = dotsContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    /**
     * Get total number of slides
     */
    getTotalSlides() {
        return this.slides.length;
    }

    /**
     * Get current slide index
     */
    getCurrentIndex() {
        return this.currentIndex;
    }
}

// Create global instance
const slideEngine = new SlideEngine();
