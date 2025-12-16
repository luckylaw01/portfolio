/**
 * MENU SYSTEM
 * Artistic menu overlay with project cards
 */

class MenuManager {
    constructor() {
        this.isOpen = false;
        this.menuElement = null;
        this.menuButton = null;
        this.projects = [];
        this.init();
    }

    /**
     * Initialize menu system
     */
    async init() {
        await this.loadProjects();
        this.createMenuButton();
        this.createMenuOverlay();
        this.setupEventListeners();
    }

    /**
     * Load projects from JSON
     */
    async loadProjects() {
        try {
            // Determine correct path to projects.json based on current location
            const isInSlidesFolder = window.location.pathname.includes('/slides/');
            const projectsPath = isInSlidesFolder ? '../projects.json' : './projects.json';

            const response = await fetch(projectsPath);
            const data = await response.json();
            this.projects = [
                { id: 'intro', name: 'Introduction', category: 'About', url: 'index.html' },
                ...data.projects.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    url: `slides/${p.id}.html`
                }))
            ];
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    /**
     * Create menu button
     */
    createMenuButton() {
        this.menuButton = document.createElement('button');
        this.menuButton.id = 'menu-button';
        this.menuButton.className = 'menu-btn glass';
        this.menuButton.setAttribute('aria-label', 'Open menu');
        this.menuButton.innerHTML = `
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span class="menu-text">Projects</span>
        `;

        document.body.appendChild(this.menuButton);
    }

    /**
     * Create menu overlay
     */
    createMenuOverlay() {
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'menu-overlay';
        this.menuElement.className = 'menu-overlay';

        this.menuElement.innerHTML = `
            <div class="menu-header">
                <h2 class="menu-title gradient-text">All Projects</h2>
                <button class="menu-close" aria-label="Close menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="menu-grid" id="menu-grid"></div>
        `;

        document.body.appendChild(this.menuElement);

        // Populate grid
        this.populateGrid();
    }

    /**
     * Populate project grid
     */
    populateGrid() {
        const grid = document.getElementById('menu-grid');
        if (!grid) return;

        // Determine if we're in slides folder
        const isInSlidesFolder = window.location.pathname.includes('/slides/');

        this.projects.forEach((project, index) => {
            const card = document.createElement('a');

            // Calculate correct URL based on current location
            let cardUrl = project.url;
            if (isInSlidesFolder) {
                // If we're in slides folder and clicking on intro, go up
                if (project.id === 'intro') {
                    cardUrl = '../' + project.url;
                } else {
                    // Going to another slide in same folder
                    cardUrl = project.id + '.html';
                }
            }
            // If we're at root, use the url as-is

            card.href = cardUrl;
            card.className = 'project-card glass hover-lift stagger-item';
            card.setAttribute('data-transition', 'slide');
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
                <div class="card-number">${String(index + 1).padStart(2, '0')}</div>
                <div class="card-content">
                    <div class="card-category">${project.category}</div>
                    <h3 class="card-title">${project.name}</h3>
                </div>
                <div class="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Menu button click
        this.menuButton.addEventListener('click', () => this.open());

        // Close button click
        const closeBtn = this.menuElement.querySelector('.menu-close');
        closeBtn.addEventListener('click', () => this.close());

        // Overlay click (close)
        this.menuElement.addEventListener('click', (e) => {
            if (e.target === this.menuElement) {
                this.close();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // 'M' key to toggle menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.toggle();
                }
            }
        });
    }

    /**
     * Open menu
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.menuElement.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Animate cards
        setTimeout(() => {
            const cards = this.menuElement.querySelectorAll('.stagger-item');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate');
                }, index * 50);
            });
        }, 100);
    }

    /**
     * Close menu
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.menuElement.classList.remove('active');
        document.body.style.overflow = '';

        // Reset animations
        const cards = this.menuElement.querySelectorAll('.stagger-item');
        cards.forEach(card => card.classList.remove('animate'));
    }

    /**
     * Toggle menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Initialize menu manager
let menuManager = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        menuManager = new MenuManager();
    });
} else {
    menuManager = new MenuManager();
}
