// News View Handlers

XApp.prototype.initNewsView = function () {
    console.log('Initializing News view');

    // Initialize bottom navigation
    this.initBottomNav('news');

    // Note: Back button is handled globally by navigation.js

    // Generate sample data if needed
    if (!this.getData('x_app_news_articles')) {
        this.generateSampleArticles();
    }

    // Search functionality
    const searchInput = document.getElementById('newsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.filterNews(e.target.value);
        });
    }

    // Category filters
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const category = chip.getAttribute('data-category');
            this.loadNewsByCategory(category);
        });
    });

    // Load initial news
    this.loadTopStories();
    this.loadNewsByCategory('all');
};

XApp.prototype.loadTopStories = function () {
    const container = document.getElementById('topStoriesContainer');
    if (!container) return;

    const articles = this.getData('x_app_news_articles') || [];

    // Get top 1 featured article
    const featured = articles.filter(a => a.featured)[0];

    if (!featured) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += '<div class="featured-article" data-article-id="' + featured.id + '">';
    html += '  <img src="' + featured.image + '" alt="' + featured.title + '" class="featured-article-image" onerror="this.style.display=\'none\'" />';
    html += '  <div class="featured-article-overlay">';
    html += '    <span class="featured-article-category">' + featured.category + '</span>';
    html += '    <h3 class="featured-article-title">' + featured.title + '</h3>';
    html += '    <div class="featured-article-meta">';
    html += '      <span>' + featured.source + '</span>';
    html += '      <span>•</span>';
    html += '      <span>' + this.formatNewsDate(featured.publishedAt) + '</span>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    // Add click handler
    const featuredArticle = container.querySelector('.featured-article');
    if (featuredArticle) {
        featuredArticle.addEventListener('click', () => {
            this.navigation.loadView('article', true, { articleId: featured.id });
        });
    }
};

XApp.prototype.loadNewsByCategory = function (category) {
    const container = document.getElementById('newsArticlesContainer');
    const categoryTitle = document.getElementById('categoryTitle');

    if (!container) return;

    const articles = this.getData('x_app_news_articles') || [];

    let filtered = articles;
    if (category !== 'all') {
        filtered = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    // Update title
    if (categoryTitle) {
        if (category === 'all') {
            categoryTitle.textContent = 'Latest News';
        } else {
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' News';
        }
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-news"><div class="empty-icon">📰</div><h3>No articles found</h3><p>Try a different category</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(article => {
        html += '<div class="news-article" data-article-id="' + article.id + '">';
        html += '  <img src="' + article.image + '" alt="' + article.title + '" class="news-article-image" onerror="this.style.display=\'none\'" />';
        html += '  <div class="news-article-content">';
        html += '    <div class="news-article-category">' + article.category + '</div>';
        html += '    <div class="news-article-title">' + article.title + '</div>';
        html += '    <div class="news-article-excerpt">' + article.excerpt + '</div>';
        html += '    <div class="news-article-meta">';
        html += '      <span class="news-article-source">' + article.source + '</span>';
        html += '      <span>•</span>';
        html += '      <span>' + this.formatNewsDate(article.publishedAt) + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const articleElements = container.querySelectorAll('.news-article');
    articleElements.forEach(element => {
        element.addEventListener('click', () => {
            const articleId = element.getAttribute('data-article-id');
            this.navigation.loadView('article', true, { articleId: articleId });
        });
    });
};

XApp.prototype.filterNews = function (searchTerm) {
    const container = document.getElementById('newsArticlesContainer');
    if (!container) return;

    const articles = this.getData('x_app_news_articles') || [];

    if (!searchTerm.trim()) {
        this.loadNewsByCategory('all');
        return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.excerpt.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-news"><div class="empty-icon">🔍</div><h3>No results found</h3><p>Try different keywords</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(article => {
        html += '<div class="news-article" data-article-id="' + article.id + '">';
        html += '  <img src="' + article.image + '" alt="' + article.title + '" class="news-article-image" onerror="this.style.display=\'none\'" />';
        html += '  <div class="news-article-content">';
        html += '    <div class="news-article-category">' + article.category + '</div>';
        html += '    <div class="news-article-title">' + article.title + '</div>';
        html += '    <div class="news-article-excerpt">' + article.excerpt + '</div>';
        html += '    <div class="news-article-meta">';
        html += '      <span class="news-article-source">' + article.source + '</span>';
        html += '      <span>•</span>';
        html += '      <span>' + this.formatNewsDate(article.publishedAt) + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const articleElements = container.querySelectorAll('.news-article');
    articleElements.forEach(element => {
        element.addEventListener('click', () => {
            const articleId = element.getAttribute('data-article-id');
            this.navigation.loadView('article', true, { articleId: articleId });
        });
    });
};

XApp.prototype.formatNewsDate = function (dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return diffMins + 'm ago';
    } else if (diffHours < 24) {
        return diffHours + 'h ago';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return diffDays + 'd ago';
    } else {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return month + ' ' + day;
    }
};

// Article Detail View
XApp.prototype.initArticleView = function (params) {
    console.log('Initializing Article view', params);

    if (!params || !params.articleId) {
        this.showNotification('Article not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Back button
    const backBtn = document.querySelector('.article-view .back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Load article
    this.loadArticleDetail(params.articleId);
};

XApp.prototype.loadArticleDetail = function (articleId) {
    const container = document.getElementById('articleContainer');
    const relatedContainer = document.getElementById('relatedArticlesContainer');

    if (!container) return;

    const articles = this.getData('x_app_news_articles') || [];
    const article = articles.find(a => a.id === articleId);

    if (!article) {
        this.showNotification('Article not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Check if article is saved
    const savedArticles = this.getSavedArticles();
    const isSaved = savedArticles.includes(articleId);

    let html = '';

    // Article header
    html += '<div class="article-header">';
    html += '  <span class="article-category">' + article.category + '</span>';
    html += '  <h1 class="article-title">' + article.title + '</h1>';
    html += '  <div class="article-meta">';
    html += '    <span class="article-source">' + article.source + '</span>';
    html += '    <span>•</span>';
    html += '    <span>' + this.formatNewsDate(article.publishedAt) + '</span>';
    html += '    <span>•</span>';
    html += '    <span>' + article.readTime + ' min read</span>';
    html += '  </div>';
    html += '</div>';

    // Featured image
    if (article.image) {
        html += '<img src="' + article.image + '" alt="' + article.title + '" class="article-featured-image" onerror="this.style.display=\'none\'" />';
    }

    // Article body
    html += '<div class="article-body">';
    html += '  <div class="article-excerpt">' + article.excerpt + '</div>';
    html += '  <div class="article-content">' + article.content + '</div>';
    html += '</div>';

    // Article actions
    html += '<div class="article-actions">';
    html += '  <button id="saveArticleBtn" class="article-action-btn' + (isSaved ? ' saved' : '') + '">';
    html += '    <span>' + (isSaved ? '✓' : '🔖') + '</span>';
    html += '    <span>' + (isSaved ? 'Saved' : 'Save') + '</span>';
    html += '  </button>';
    html += '  <button id="shareArticleBtn" class="article-action-btn">';
    html += '    <span>↗️</span>';
    html += '    <span>Share</span>';
    html += '  </button>';
    html += '</div>';

    container.innerHTML = html;

    // Save button handler
    const saveBtn = document.getElementById('saveArticleBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            this.toggleSaveArticle(articleId);
        });
    }

    // Share button handler
    const shareBtn = document.getElementById('shareArticleBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            this.showNotification('Share functionality coming soon!', 'info');
        });
    }

    // Load related articles
    this.loadRelatedArticles(article.category, articleId, relatedContainer);
};

XApp.prototype.loadRelatedArticles = function (category, currentArticleId, container) {
    if (!container) return;

    const articles = this.getData('x_app_news_articles') || [];
    const related = articles.filter(a => a.category === category && a.id !== currentArticleId).slice(0, 5);

    if (related.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    related.forEach(article => {
        html += '<div class="related-article" data-article-id="' + article.id + '">';
        html += '  <div class="related-article-title">' + article.title + '</div>';
        html += '  <div class="related-article-meta">';
        html += '    <span>' + article.source + '</span>';
        html += '    <span> • </span>';
        html += '    <span>' + this.formatNewsDate(article.publishedAt) + '</span>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const relatedElements = container.querySelectorAll('.related-article');
    relatedElements.forEach(element => {
        element.addEventListener('click', () => {
            const articleId = element.getAttribute('data-article-id');
            this.navigation.loadView('article', true, { articleId: articleId });
        });
    });
};

XApp.prototype.toggleSaveArticle = function (articleId) {
    if (!this.currentUser) {
        this.showNotification('Please log in to save articles', 'error');
        return;
    }

    let savedArticles = this.getSavedArticles();
    const isSaved = savedArticles.includes(articleId);

    if (isSaved) {
        savedArticles = savedArticles.filter(id => id !== articleId);
        this.showNotification('Article removed from saved', 'success');
    } else {
        savedArticles.push(articleId);
        this.showNotification('Article saved', 'success');
    }

    const allSaved = this.getData('x_app_saved_articles') || {};
    allSaved[this.currentUser.id] = savedArticles;
    this.saveData('x_app_saved_articles', allSaved);

    // Update button
    const saveBtn = document.getElementById('saveArticleBtn');
    if (saveBtn) {
        if (!isSaved) {
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<span>✓</span><span>Saved</span>';
        } else {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<span>🔖</span><span>Save</span>';
        }
    }
};

XApp.prototype.getSavedArticles = function () {
    if (!this.currentUser) return [];

    const allSaved = this.getData('x_app_saved_articles') || {};
    return allSaved[this.currentUser.id] || [];
};

XApp.prototype.generateSampleArticles = function () {
    const articles = [
        {
            id: 'news_1',
            title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning',
            excerpt: 'Researchers announce a significant milestone in artificial intelligence development with a new model that demonstrates unprecedented reasoning capabilities.',
            content: '<p>In a groundbreaking development, scientists at leading AI research labs have unveiled a new artificial intelligence model that demonstrates human-level reasoning across a wide range of complex tasks.</p><p>The model, which builds upon recent advances in neural network architecture and training techniques, has shown remarkable ability to understand context, make logical inferences, and solve problems that previously required human expertise.</p><p>"This represents a significant leap forward in AI capabilities," said Dr. Sarah Chen, lead researcher on the project. "We\'re seeing performance that was unthinkable just a few years ago."</p><p>The implications for industries ranging from healthcare to education are profound, though experts caution that responsible deployment and ethical considerations remain paramount.</p>',
            category: 'Technology',
            source: 'Tech Daily',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            readTime: 5,
            image: 'https://picsum.photos/800/400?random=1',
            featured: true
        },
        {
            id: 'news_2',
            title: 'Global Markets Reach All-Time Highs on Tech Sector Gains',
            excerpt: 'Stock markets around the world hit record levels as technology companies report strong earnings and positive economic indicators boost investor confidence.',
            content: '<p>Major stock indices across the globe reached unprecedented heights today, driven primarily by stellar performance in the technology sector and encouraging economic data.</p><p>The tech-heavy indices led the charge, with several major technology companies reporting earnings that exceeded analyst expectations by wide margins.</p><p>Investors are increasingly optimistic about the economic outlook, citing strong consumer spending, improving employment figures, and ongoing innovation in key industries.</p>',
            category: 'Business',
            source: 'Financial Times',
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            readTime: 4,
            image: 'https://picsum.photos/800/400?random=2',
            featured: false
        },
        {
            id: 'news_3',
            title: 'Championship Finals: Underdogs Stage Incredible Comeback',
            excerpt: 'In a thrilling match that will be remembered for years, the underdog team mounted a historic comeback to claim the championship title.',
            content: '<p>Sports fans witnessed one of the most dramatic championship finals in history as the underdog team overcame a seemingly insurmountable deficit to claim victory.</p><p>Trailing by 20 points in the final quarter, the team refused to give up, staging a remarkable comeback that had fans on their feet.</p><p>The victory marks the franchise\'s first championship in over three decades and cements their place in sporting history.</p>',
            category: 'Sports',
            source: 'Sports Weekly',
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            readTime: 3,
            image: 'https://picsum.photos/800/400?random=3',
            featured: false
        },
        {
            id: 'news_4',
            title: 'New Study Reveals Revolutionary Cancer Treatment Approach',
            excerpt: 'Medical researchers have discovered a novel treatment method that shows unprecedented success rates in clinical trials for multiple cancer types.',
            content: '<p>A groundbreaking study published today reveals a revolutionary approach to cancer treatment that has shown remarkable success in clinical trials.</p><p>The treatment, which targets cancer cells\' metabolic pathways while leaving healthy cells unharmed, represents a significant departure from traditional approaches.</p><p>Patients in the trial showed response rates far exceeding those of conventional treatments, with minimal side effects reported.</p><p>"This could fundamentally change how we approach cancer treatment," noted Dr. Michael Roberts, who led the research team.</p>',
            category: 'Health',
            source: 'Medical Journal',
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            readTime: 6,
            image: 'https://picsum.photos/800/400?random=4',
            featured: false
        },
        {
            id: 'news_5',
            title: 'Record-Breaking Film Dominates Box Office Weekend',
            excerpt: 'The highly anticipated blockbuster shattered opening weekend records, becoming the highest-grossing film debut in cinema history.',
            content: '<p>Movie theaters worldwide saw unprecedented crowds this weekend as the latest blockbuster smashed all previous opening weekend records.</p><p>The film, which has been in development for over five years, exceeded even the most optimistic industry projections with its record-breaking performance.</p><p>Critics and audiences alike have praised the film\'s innovative storytelling and groundbreaking visual effects.</p>',
            category: 'Entertainment',
            source: 'Entertainment Weekly',
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            readTime: 4,
            image: 'https://picsum.photos/800/400?random=5',
            featured: false
        },
        {
            id: 'news_6',
            title: 'Scientists Discover New Species in Deep Ocean Expedition',
            excerpt: 'A team of marine biologists has identified dozens of previously unknown species during a groundbreaking deep-sea exploration mission.',
            content: '<p>An international team of scientists has announced the discovery of numerous new species during a recent deep-sea expedition to unexplored ocean trenches.</p><p>The findings include bizarre creatures adapted to extreme pressure and darkness, providing new insights into how life thrives in Earth\'s most inhospitable environments.</p><p>Researchers say the discoveries highlight how much remains unknown about our planet\'s oceans.</p>',
            category: 'Science',
            source: 'Nature Magazine',
            publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            readTime: 5,
            image: 'https://picsum.photos/800/400?random=6',
            featured: false
        },
        {
            id: 'news_7',
            title: 'Tech Giant Announces Revolutionary Sustainable Energy Initiative',
            excerpt: 'Major technology company commits to ambitious carbon-negative goals with innovative clean energy solutions and massive renewable infrastructure investments.',
            content: '<p>One of the world\'s largest technology companies today unveiled plans for an ambitious sustainable energy initiative that aims to revolutionize corporate environmental responsibility.</p><p>The comprehensive program includes massive investments in renewable energy infrastructure, development of carbon capture technologies, and a commitment to achieve carbon-negative operations within the next decade.</p><p>Industry analysts are calling it the most aggressive corporate climate action plan to date.</p>',
            category: 'Technology',
            source: 'Green Tech News',
            publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            readTime: 5,
            image: 'https://picsum.photos/800/400?random=7',
            featured: false
        },
        {
            id: 'news_8',
            title: 'Startup Valued at $10 Billion After Latest Funding Round',
            excerpt: 'Fast-growing technology startup reaches unicorn status with massive valuation following successful Series D funding round led by major venture capital firms.',
            content: '<p>A rapidly growing startup has achieved a $10 billion valuation following a successful funding round that saw participation from several top-tier venture capital firms.</p><p>The company, which has experienced exponential growth over the past two years, plans to use the new capital to expand into international markets and accelerate product development.</p><p>Investors cite the company\'s innovative approach and strong market position as key factors in their decision to participate.</p>',
            category: 'Business',
            source: 'Startup Daily',
            publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
            readTime: 4,
            image: 'https://picsum.photos/800/400?random=8',
            featured: false
        },
        {
            id: 'news_9',
            title: 'Olympic Athletes Break Multiple World Records in Single Day',
            excerpt: 'An unprecedented day of competition saw five world records fall as athletes delivered extraordinary performances at the international championships.',
            content: '<p>The sporting world witnessed history today as five world records tumbled during an extraordinary day of athletic competition.</p><p>Athletes from multiple countries delivered career-defining performances, pushing the boundaries of human capability in their respective disciplines.</p><p>Sports commentators are calling it one of the greatest single days in track and field history.</p>',
            category: 'Sports',
            source: 'Olympic News',
            publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            readTime: 3,
            image: 'https://picsum.photos/800/400?random=9',
            featured: false
        },
        {
            id: 'news_10',
            title: 'Breakthrough in Alzheimer\'s Research Offers New Hope',
            excerpt: 'Neuroscientists identify key mechanism behind Alzheimer\'s progression, opening doors to potential new treatment approaches for the devastating disease.',
            content: '<p>Researchers have made a significant breakthrough in understanding the mechanisms behind Alzheimer\'s disease, potentially paving the way for more effective treatments.</p><p>The discovery identifies a previously unknown biological pathway that plays a crucial role in the disease\'s progression, offering new targets for therapeutic intervention.</p><p>While clinical applications are still years away, experts say the findings represent a major step forward in the fight against Alzheimer\'s.</p>',
            category: 'Health',
            source: 'Health Science Today',
            publishedAt: new Date(Date.now() - 84 * 60 * 60 * 1000).toISOString(),
            readTime: 6,
            image: 'https://picsum.photos/800/400?random=10',
            featured: false
        },
        {
            id: 'news_11',
            title: 'Award-Winning Director Announces Surprise New Project',
            excerpt: 'Acclaimed filmmaker reveals unexpected collaboration with streaming giant for ambitious limited series exploring untold historical events.',
            content: '<p>In a surprise announcement that has the entertainment industry buzzing, an Academy Award-winning director has revealed plans for a new limited series with a major streaming platform.</p><p>The project, shrouded in secrecy until today, will tackle previously unexplored historical events with the director\'s signature cinematic style.</p><p>Production is set to begin early next year with a star-studded cast already attached to the project.</p>',
            category: 'Entertainment',
            source: 'Hollywood Reporter',
            publishedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
            readTime: 4,
            image: 'https://picsum.photos/800/400?random=11',
            featured: false
        },
        {
            id: 'news_12',
            title: 'Mars Mission Discovers Evidence of Ancient Water Systems',
            excerpt: 'NASA rover uncovers compelling geological evidence suggesting Mars once hosted extensive network of rivers and lakes billions of years ago.',
            content: '<p>NASA scientists analyzing data from the latest Mars rover mission have uncovered compelling evidence of ancient water systems far more extensive than previously believed.</p><p>The geological formations discovered suggest that Mars once featured a complex network of rivers, lakes, and possibly even oceans billions of years ago.</p><p>The findings have profound implications for understanding Mars\' past climate and the potential for ancient microbial life.</p>',
            category: 'Science',
            source: 'Space Exploration Journal',
            publishedAt: new Date(Date.now() - 108 * 60 * 60 * 1000).toISOString(),
            readTime: 5,
            image: 'https://picsum.photos/800/400?random=12',
            featured: false
        }
    ];

    this.saveData('x_app_news_articles', articles);
};
