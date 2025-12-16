// Video Streaming View Handlers

XApp.prototype.initVideoView = function () {
    console.log('Initializing Video Streaming view');

    // Initialize bottom navigation
    this.initBottomNav('video');

    // Note: Back button is handled globally by navigation.js

    // Generate sample data if needed
    if (!this.getData('x_app_video_content')) {
        this.generateVideoContent();
    }

    // Search functionality
    const searchInput = document.getElementById('videoSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.filterVideoContent(e.target.value);
        });
    }

    // Genre filters
    const genreChips = document.querySelectorAll('.genre-chip');
    genreChips.forEach(chip => {
        chip.addEventListener('click', () => {
            genreChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const genre = chip.getAttribute('data-genre');
            this.loadContentByGenre(genre);
        });
    });

    // Load initial content
    this.loadFeaturedContent();
    this.loadContinueWatching();
    this.loadTrendingContent();
    this.loadMovies();
    this.loadTVShows();
};

XApp.prototype.loadFeaturedContent = function () {
    const container = document.getElementById('featuredContainer');
    if (!container) return;

    const allContent = this.getData('x_app_video_content') || [];
    const featured = allContent.find(c => c.featured);

    if (!featured) {
        container.style.display = 'none';
        return;
    }

    let html = '';
    html += '<div class="featured-item" data-content-id="' + featured.id + '">';
    html += '  <img src="' + featured.backdrop + '" alt="' + featured.title + '" class="featured-backdrop" onerror="this.style.display=\'none\'" />';
    html += '  <div class="featured-overlay">';
    html += '    <h2 class="featured-title">' + featured.title + '</h2>';
    html += '    <div class="featured-meta">';
    html += '      <span class="featured-rating">⭐ ' + featured.rating + '</span>';
    html += '      <span>•</span>';
    html += '      <span>' + featured.year + '</span>';
    html += '      <span>•</span>';
    html += '      <span>' + featured.duration + '</span>';
    html += '    </div>';
    html += '    <p class="featured-description">' + featured.description + '</p>';
    html += '    <div class="featured-actions">';
    html += '      <button class="btn-play" data-content-id="' + featured.id + '">▶ Play</button>';
    html += '      <button class="btn-info" data-content-id="' + featured.id + '">ℹ More Info</button>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;

    // Add click handlers
    const playBtn = container.querySelector('.btn-play');
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const contentId = playBtn.getAttribute('data-content-id');
            this.playVideo(contentId);
        });
    }

    const infoBtn = container.querySelector('.btn-info');
    if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showNotification('More info coming soon!', 'info');
        });
    }
};

XApp.prototype.loadContinueWatching = function () {
    const container = document.getElementById('continueWatchingContainer');
    if (!container) return;

    if (!this.currentUser) {
        container.innerHTML = '<div class="empty-continue"><div class="empty-icon">📺</div><p>Sign in to continue watching</p></div>';
        return;
    }

    const watchHistory = this.getData('x_app_watch_history') || {};
    const userHistory = watchHistory[this.currentUser.id] || [];

    if (userHistory.length === 0) {
        container.innerHTML = '<div class="empty-continue"><div class="empty-icon">📺</div><p>Start watching to see your progress here</p></div>';
        return;
    }

    const allContent = this.getData('x_app_video_content') || [];

    let html = '';
    userHistory.slice(0, 5).forEach(item => {
        const content = allContent.find(c => c.id === item.contentId);
        if (!content) return;

        html += '<div class="continue-item" data-content-id="' + content.id + '">';
        html += '  <div class="continue-thumbnail">';
        html += '    <img src="' + content.thumbnail + '" alt="' + content.title + '" onerror="this.style.display=\'none\'" />';
        html += '    <div class="progress-bar">';
        html += '      <div class="progress-fill" style="width: ' + item.progress + '%"></div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="continue-title">' + content.title + '</div>';
        html += '  <div class="continue-meta">' + Math.round(item.progress) + '% watched</div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const items = container.querySelectorAll('.continue-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const contentId = item.getAttribute('data-content-id');
            this.playVideo(contentId);
        });
    });
};

XApp.prototype.loadTrendingContent = function () {
    const container = document.getElementById('trendingContainer');
    if (!container) return;

    const allContent = this.getData('x_app_video_content') || [];
    const trending = allContent.filter(c => c.trending).slice(0, 10);

    this.renderContentCarousel(container, trending);
};

XApp.prototype.loadMovies = function () {
    const container = document.getElementById('moviesContainer');
    if (!container) return;

    const allContent = this.getData('x_app_video_content') || [];
    const movies = allContent.filter(c => c.type === 'movie').slice(0, 10);

    this.renderContentCarousel(container, movies);
};

XApp.prototype.loadTVShows = function () {
    const container = document.getElementById('showsContainer');
    if (!container) return;

    const allContent = this.getData('x_app_video_content') || [];
    const shows = allContent.filter(c => c.type === 'series').slice(0, 10);

    this.renderContentCarousel(container, shows);
};

XApp.prototype.renderContentCarousel = function (container, content) {
    let html = '';

    content.forEach(item => {
        html += '<div class="content-card" data-content-id="' + item.id + '">';
        html += '  <img src="' + item.poster + '" alt="' + item.title + '" class="content-poster" onerror="this.style.display=\'none\'" />';
        html += '  <div class="content-title">' + item.title + '</div>';
        html += '  <div class="content-rating">⭐ ' + item.rating + '</div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const cards = container.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const contentId = card.getAttribute('data-content-id');
            this.playVideo(contentId);
        });
    });
};

XApp.prototype.loadContentByGenre = function (genre) {
    const trendingContainer = document.getElementById('trendingContainer');
    const moviesContainer = document.getElementById('moviesContainer');
    const showsContainer = document.getElementById('showsContainer');

    const allContent = this.getData('x_app_video_content') || [];

    let filtered = allContent;
    if (genre !== 'all') {
        filtered = allContent.filter(c => c.genre.toLowerCase() === genre.toLowerCase());
    }

    // Update all carousels with filtered content
    if (trendingContainer) {
        this.renderContentCarousel(trendingContainer, filtered.filter(c => c.trending).slice(0, 10));
    }

    if (moviesContainer) {
        this.renderContentCarousel(moviesContainer, filtered.filter(c => c.type === 'movie').slice(0, 10));
    }

    if (showsContainer) {
        this.renderContentCarousel(showsContainer, filtered.filter(c => c.type === 'series').slice(0, 10));
    }
};

XApp.prototype.filterVideoContent = function (searchTerm) {
    if (!searchTerm.trim()) {
        this.loadContentByGenre('all');
        return;
    }

    const allContent = this.getData('x_app_video_content') || [];
    const term = searchTerm.toLowerCase();
    const filtered = allContent.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );

    const trendingContainer = document.getElementById('trendingContainer');
    const moviesContainer = document.getElementById('moviesContainer');
    const showsContainer = document.getElementById('showsContainer');

    if (trendingContainer) {
        this.renderContentCarousel(trendingContainer, filtered.slice(0, 10));
    }

    if (moviesContainer) {
        this.renderContentCarousel(moviesContainer, filtered.filter(c => c.type === 'movie').slice(0, 10));
    }

    if (showsContainer) {
        this.renderContentCarousel(showsContainer, filtered.filter(c => c.type === 'series').slice(0, 10));
    }
};

XApp.prototype.playVideo = function (contentId) {
    this.navigation.loadView('video-player', true, { contentId: contentId });
};

// Video Player View
XApp.prototype.initVideoPlayerView = function (params) {
    console.log('Initializing Video Player view', params);

    if (!params || !params.contentId) {
        this.showNotification('Content not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Back button
    const backBtn = document.querySelector('.video-player-view .back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Load video player
    this.loadVideoPlayer(params.contentId);
};

XApp.prototype.loadVideoPlayer = function (contentId) {
    const container = document.getElementById('videoPlayerContainer');
    if (!container) return;

    const allContent = this.getData('x_app_video_content') || [];
    const content = allContent.find(c => c.id === contentId);

    if (!content) {
        this.showNotification('Content not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Update watch history
    if (this.currentUser) {
        const watchHistory = this.getData('x_app_watch_history') || {};
        if (!watchHistory[this.currentUser.id]) {
            watchHistory[this.currentUser.id] = [];
        }

        // Check if already in history
        const existingIndex = watchHistory[this.currentUser.id].findIndex(h => h.contentId === contentId);
        if (existingIndex >= 0) {
            watchHistory[this.currentUser.id].splice(existingIndex, 1);
        }

        watchHistory[this.currentUser.id].unshift({
            contentId: contentId,
            progress: Math.random() * 60 + 10, // Simulate progress 10-70%
            lastWatched: new Date().toISOString()
        });

        this.saveData('x_app_watch_history', watchHistory);
    }

    let html = '';

    // Player screen
    html += '<div class="player-screen">';
    html += '  <div class="player-placeholder">';
    html += '    <div class="player-icon">▶</div>';
    html += '    <div class="player-text">Video Player Placeholder</div>';
    html += '  </div>';
    html += '  <div class="player-controls">';
    html += '    <div class="progress-container">';
    html += '      <div class="progress-track">';
    html += '        <div class="progress-played" style="width: 0%"></div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="controls-buttons">';
    html += '      <button class="play-pause-btn">▶</button>';
    html += '      <span class="time-display">0:00 / ' + content.duration + '</span>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // Video info
    html += '<div class="video-info">';
    html += '  <h1 class="video-title">' + content.title + '</h1>';
    html += '  <div class="video-meta">';
    html += '    <span class="video-rating">⭐ ' + content.rating + '</span>';
    html += '    <span>•</span>';
    html += '    <span>' + content.year + '</span>';
    html += '    <span>•</span>';
    html += '    <span>' + content.duration + '</span>';
    html += '    <span>•</span>';
    html += '    <span>' + content.genre + '</span>';
    html += '  </div>';
    html += '  <p class="video-description">' + content.description + '</p>';
    html += '</div>';

    // Actions
    html += '<div class="video-actions">';
    html += '  <button class="action-btn" id="likeBtn">';
    html += '    <span>👍</span>';
    html += '    <span>Like</span>';
    html += '  </button>';
    html += '  <button class="action-btn" id="saveBtn">';
    html += '    <span>🔖</span>';
    html += '    <span>Save</span>';
    html += '  </button>';
    html += '  <button class="action-btn" id="shareBtn">';
    html += '    <span>↗️</span>';
    html += '    <span>Share</span>';
    html += '  </button>';
    html += '</div>';

    // Episodes (if series)
    if (content.type === 'series' && content.episodes) {
        html += '<div class="episodes-section">';
        html += '  <h3 class="episodes-title">Episodes</h3>';

        content.episodes.forEach((ep, index) => {
            html += '<div class="episode-item" data-episode="' + index + '">';
            html += '  <div class="episode-header">';
            html += '    <img src="' + content.thumbnail + '" alt="Episode ' + (index + 1) + '" class="episode-thumbnail" onerror="this.style.display=\'none\'" />';
            html += '    <div class="episode-info">';
            html += '      <div class="episode-number">Episode ' + (index + 1) + '</div>';
            html += '      <div class="episode-title">' + ep.title + '</div>';
            html += '      <div class="episode-duration">' + ep.duration + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
        });

        html += '</div>';
    }

    container.innerHTML = html;

    // Action button handlers
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('active');
            this.showNotification(likeBtn.classList.contains('active') ? 'Liked!' : 'Like removed', 'success');
        });
    }

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.classList.toggle('active');
            this.showNotification(saveBtn.classList.contains('active') ? 'Saved to list' : 'Removed from list', 'success');
        });
    }

    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            this.showNotification('Share functionality coming soon!', 'info');
        });
    }
};

XApp.prototype.generateVideoContent = function () {
    const content = [
        {
            id: 'video_1',
            type: 'movie',
            title: 'The Quantum Paradox',
            description: 'A brilliant physicist discovers a way to manipulate time, but faces unexpected consequences that threaten the fabric of reality itself.',
            genre: 'Sci-Fi',
            year: 2024,
            rating: 8.7,
            duration: '2h 25m',
            poster: 'https://picsum.photos/300/450?random=101',
            backdrop: 'https://picsum.photos/800/450?random=201',
            thumbnail: 'https://picsum.photos/800/450?random=301',
            featured: true,
            trending: true
        },
        {
            id: 'video_2',
            type: 'movie',
            title: 'City of Shadows',
            description: 'A detective in a dystopian city uncovers a conspiracy that goes deeper than anyone could imagine.',
            genre: 'Thriller',
            year: 2024,
            rating: 8.2,
            duration: '2h 10m',
            poster: 'https://picsum.photos/300/450?random=102',
            backdrop: 'https://picsum.photos/800/450?random=202',
            thumbnail: 'https://picsum.photos/800/450?random=302',
            featured: false,
            trending: true
        },
        {
            id: 'video_3',
            type: 'series',
            title: 'The Last Mission',
            description: 'An elite team of operatives must prevent a global catastrophe in this action-packed thriller series.',
            genre: 'Action',
            year: 2024,
            rating: 8.9,
            duration: '45m per episode',
            poster: 'https://picsum.photos/300/450?random=103',
            backdrop: 'https://picsum.photos/800/450?random=203',
            thumbnail: 'https://picsum.photos/800/450?random=303',
            featured: false,
            trending: true,
            episodes: [
                { title: 'The Beginning', duration: '48m' },
                { title: 'Revelation', duration: '45m' },
                { title: 'Point of No Return', duration: '52m' },
                { title: 'The Final Stand', duration: '55m' }
            ]
        },
        {
            id: 'video_4',
            type: 'movie',
            title: 'Love in Paris',
            description: 'A heartwarming romantic comedy about two strangers who meet by chance in the City of Love.',
            genre: 'Comedy',
            year: 2024,
            rating: 7.5,
            duration: '1h 55m',
            poster: 'https://picsum.photos/300/450?random=104',
            backdrop: 'https://picsum.photos/800/450?random=204',
            thumbnail: 'https://picsum.photos/800/450?random=304',
            featured: false,
            trending: false
        },
        {
            id: 'video_5',
            type: 'movie',
            title: 'The Silent Echo',
            description: 'A psychological thriller about a woman who starts hearing voices that lead her to uncover dark secrets.',
            genre: 'Thriller',
            year: 2023,
            rating: 8.1,
            duration: '2h 5m',
            poster: 'https://picsum.photos/300/450?random=105',
            backdrop: 'https://picsum.photos/800/450?random=205',
            thumbnail: 'https://picsum.photos/800/450?random=305',
            featured: false,
            trending: true
        },
        {
            id: 'video_6',
            type: 'series',
            title: 'Tech Titans',
            description: 'The rise and fall of a tech startup in Silicon Valley, based on true events.',
            genre: 'Drama',
            year: 2024,
            rating: 8.6,
            duration: '50m per episode',
            poster: 'https://picsum.photos/300/450?random=106',
            backdrop: 'https://picsum.photos/800/450?random=206',
            thumbnail: 'https://picsum.photos/800/450?random=306',
            featured: false,
            trending: false,
            episodes: [
                { title: 'The Pitch', duration: '52m' },
                { title: 'Funding Round', duration: '48m' },
                { title: 'Scaling Up', duration: '50m' },
                { title: 'The Pivot', duration: '55m' }
            ]
        },
        {
            id: 'video_7',
            type: 'documentary',
            title: 'Our Blue Planet',
            description: 'An stunning exploration of Earth\'s oceans and the incredible life beneath the waves.',
            genre: 'Documentary',
            year: 2024,
            rating: 9.1,
            duration: '1h 30m',
            poster: 'https://picsum.photos/300/450?random=107',
            backdrop: 'https://picsum.photos/800/450?random=207',
            thumbnail: 'https://picsum.photos/800/450?random=307',
            featured: false,
            trending: false
        },
        {
            id: 'video_8',
            type: 'movie',
            title: 'Galactic Warriors',
            description: 'An epic space adventure following a group of rebels fighting against an oppressive empire.',
            genre: 'Sci-Fi',
            year: 2023,
            rating: 8.4,
            duration: '2h 30m',
            poster: 'https://picsum.photos/300/450?random=108',
            backdrop: 'https://picsum.photos/800/450?random=208',
            thumbnail: 'https://picsum.photos/800/450?random=308',
            featured: false,
            trending: true
        },
        {
            id: 'video_9',
            type: 'movie',
            title: 'The Last Laugh',
            description: 'A struggling comedian gets one last shot at stardom in this hilarious comedy.',
            genre: 'Comedy',
            year: 2024,
            rating: 7.8,
            duration: '1h 45m',
            poster: 'https://picsum.photos/300/450?random=109',
            backdrop: 'https://picsum.photos/800/450?random=209',
            thumbnail: 'https://picsum.photos/800/450?random=309',
            featured: false,
            trending: false
        },
        {
            id: 'video_10',
            type: 'series',
            title: 'Mystery Manor',
            description: 'Guests at a remote mansion discover they\'re trapped with a killer among them.',
            genre: 'Thriller',
            year: 2024,
            rating: 8.3,
            duration: '42m per episode',
            poster: 'https://picsum.photos/300/450?random=110',
            backdrop: 'https://picsum.photos/800/450?random=210',
            thumbnail: 'https://picsum.photos/800/450?random=310',
            featured: false,
            trending: true,
            episodes: [
                { title: 'Arrival', duration: '45m' },
                { title: 'First Blood', duration: '42m' },
                { title: 'Suspicions', duration: '40m' },
                { title: 'The Truth', duration: '48m' }
            ]
        },
        {
            id: 'video_11',
            type: 'movie',
            title: 'Finding Hope',
            description: 'An emotional drama about a family\'s journey through hardship and redemption.',
            genre: 'Drama',
            year: 2023,
            rating: 8.0,
            duration: '2h 15m',
            poster: 'https://picsum.photos/300/450?random=111',
            backdrop: 'https://picsum.photos/800/450?random=211',
            thumbnail: 'https://picsum.photos/800/450?random=311',
            featured: false,
            trending: false
        },
        {
            id: 'video_12',
            type: 'movie',
            title: 'Adrenaline Rush',
            description: 'Non-stop action as an ex-soldier must save his daughter from international criminals.',
            genre: 'Action',
            year: 2024,
            rating: 7.9,
            duration: '2h 0m',
            poster: 'https://picsum.photos/300/450?random=112',
            backdrop: 'https://picsum.photos/800/450?random=212',
            thumbnail: 'https://picsum.photos/800/450?random=312',
            featured: false,
            trending: true
        }
    ];

    this.saveData('x_app_video_content', content);
};
