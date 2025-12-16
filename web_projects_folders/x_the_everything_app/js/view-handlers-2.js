/* ===================================
   VIEW HANDLERS - Part 2
   Posts, Messages, and Additional Views
   =================================== */

/* ===================================
   FEED MANAGEMENT
   =================================== */

XApp.prototype.loadFeed = function () {
    const posts = this.getData('posts') || [];
    const feedContainer = document.getElementById('feedContainer');

    if (!feedContainer) return;

    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (sortedPosts.length === 0) {
        feedContainer.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--x-gray);">
                <p style="font-size: 18px; margin-bottom: 8px;">Welcome to X!</p>
                <p style="font-size: 14px;">No posts yet. Create your first post to get started.</p>
            </div>
        `;
        return;
    }

    feedContainer.innerHTML = sortedPosts.map(post => this.renderPost(post)).join('');

    // Attach event listeners to posts
    this.attachPostEventListeners();
};

XApp.prototype.loadFollowingFeed = function () {
    const posts = this.getData('posts') || [];
    const feedContainer = document.getElementById('feedContainer');

    if (!feedContainer) return;

    // Filter posts from users that current user follows
    const followingPosts = posts.filter(post =>
        this.currentUser.following.includes(post.userId)
    );

    if (followingPosts.length === 0) {
        feedContainer.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--x-gray);">
                <p style="font-size: 18px; margin-bottom: 8px;">No posts from people you follow</p>
                <p style="font-size: 14px;">Follow more people to see their posts here.</p>
            </div>
        `;
        return;
    }

    const sortedPosts = followingPosts.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    feedContainer.innerHTML = sortedPosts.map(post => this.renderPost(post)).join('');
    this.attachPostEventListeners();
};

XApp.prototype.loadUserPosts = function (userId) {
    const posts = this.getData('posts') || [];
    const userPosts = posts.filter(p => p.userId === userId);
    const postsContainer = document.getElementById('userPostsContainer');

    if (!postsContainer) return;

    if (userPosts.length === 0) {
        postsContainer.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--x-gray);">
                <p>No posts yet</p>
            </div>
        `;
        return;
    }

    const sortedPosts = userPosts.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    postsContainer.innerHTML = sortedPosts.map(post => this.renderPost(post)).join('');
    this.attachPostEventListeners();
};

XApp.prototype.renderPost = function (post) {
    const user = this.getUserById(post.userId);
    if (!user) return '';

    const isLiked = post.likes.includes(this.currentUser.id);
    const isRetweeted = post.retweets.includes(this.currentUser.id);

    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">
                    ${user.profileImage ? `<img src="${user.profileImage}" alt="${user.name}">` : '👤'}
                </div>
                <div class="post-user-info">
                    <div class="post-name">${user.name}${user.verified ? ' <span style="color: var(--x-blue);">✓</span>' : ''}</div>
                    <div class="post-username">@${user.username} · ${this.formatRelativeTime(post.createdAt)}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
            <div class="post-actions">
                <button class="post-action-btn reply-btn" data-post-id="${post.id}">
                    💬 <span>${post.replies.length > 0 ? this.formatNumber(post.replies.length) : ''}</span>
                </button>
                <button class="post-action-btn retweet-btn ${isRetweeted ? 'active' : ''}" data-post-id="${post.id}">
                    🔁 <span>${post.retweets.length > 0 ? this.formatNumber(post.retweets.length) : ''}</span>
                </button>
                <button class="post-action-btn like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                    ${isLiked ? '❤️' : '🤍'} <span>${post.likes.length > 0 ? this.formatNumber(post.likes.length) : ''}</span>
                </button>
                <button class="post-action-btn share-btn" data-post-id="${post.id}">
                    📤
                </button>
            </div>
        </div>
    `;
};

XApp.prototype.attachPostEventListeners = function () {
    // Click on post to view details
    document.querySelectorAll('.post').forEach(postEl => {
        postEl.addEventListener('click', (e) => {
            // Don't navigate if clicking on action buttons
            if (e.target.closest('.post-action-btn')) {
                return;
            }
            const postId = parseInt(postEl.dataset.postId);
            this.navigation.loadView('post-detail', true, { postId });
        });
    });

    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            this.toggleLike(postId);
        });
    });

    // Retweet buttons
    document.querySelectorAll('.retweet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            this.toggleRetweet(postId);
        });
    });

    // Reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.dataset.postId);
            this.navigation.loadView('post-detail', true, { postId });
        });
    });
};

/* ===================================
   POST INTERACTIONS
   =================================== */

XApp.prototype.toggleLike = function (postId) {
    const posts = this.getData('posts') || [];
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    const userIndex = post.likes.indexOf(this.currentUser.id);

    if (userIndex > -1) {
        post.likes.splice(userIndex, 1);
    } else {
        post.likes.push(this.currentUser.id);
    }

    this.saveData('posts', posts);

    // Reload current view context
    if (this.navigation.currentView === 'home') {
        this.loadFeed();
    }
};

XApp.prototype.toggleRetweet = function (postId) {
    const posts = this.getData('posts') || [];
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    const userIndex = post.retweets.indexOf(this.currentUser.id);

    if (userIndex > -1) {
        post.retweets.splice(userIndex, 1);
        this.showNotification('Retweet removed', 'info');
    } else {
        post.retweets.push(this.currentUser.id);
        this.showNotification('Retweeted!', 'success');
    }

    this.saveData('posts', posts);

    // Reload current view context
    if (this.navigation.currentView === 'home') {
        this.loadFeed();
    }
};

/* ===================================
   COMPOSE VIEW
   =================================== */

XApp.prototype.initComposeView = function (data) {
    console.log('Compose view initialized');

    const composeForm = document.getElementById('composeForm');
    const postInput = document.getElementById('postInput');
    const charCount = document.getElementById('charCount');

    // Character counter
    if (postInput && charCount) {
        postInput.addEventListener('input', () => {
            const length = postInput.value.length;
            charCount.textContent = `${length}/280`;
            charCount.style.color = length > 280 ? 'var(--x-red)' : 'var(--x-gray)';
        });
    }

    // Form submission
    if (composeForm) {
        composeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const content = postInput.value.trim();

            if (!content) {
                this.showNotification('Please write something', 'error');
                return;
            }

            if (content.length > 280) {
                this.showNotification('Post is too long', 'error');
                return;
            }

            const posts = this.getData('posts') || [];

            const newPost = {
                id: this.generateId(),
                userId: this.currentUser.id,
                content: content,
                image: null,
                likes: [],
                retweets: [],
                replies: [],
                createdAt: new Date().toISOString()
            };

            posts.push(newPost);
            this.saveData('posts', posts);

            this.showNotification('Posted!', 'success');
            this.navigation.loadView('home');
        });
    }
};

/* ===================================
   POST DETAIL VIEW
   =================================== */

XApp.prototype.initPostDetailView = function (data) {
    console.log('Post detail view initialized');

    if (!data || !data.postId) {
        this.showNotification('Post not found', 'error');
        this.navigation.goBack();
        return;
    }

    const posts = this.getData('posts') || [];
    const post = posts.find(p => p.id === data.postId);

    if (!post) {
        this.showNotification('Post not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Render main post
    const mainPostContainer = document.getElementById('mainPostContainer');
    if (mainPostContainer) {
        mainPostContainer.innerHTML = this.renderMainPost(post);
    }

    // Load replies
    this.loadReplies(post.id);

    // Reply input character counter
    const replyInput = document.getElementById('replyInput');
    const replyCharCount = document.getElementById('replyCharCount');

    if (replyInput && replyCharCount) {
        replyInput.addEventListener('input', () => {
            const length = replyInput.value.length;
            replyCharCount.textContent = `${length}/280`;
            replyCharCount.style.color = length > 280 ? 'var(--x-red)' : 'var(--x-gray)';
        });
    }

    // Reply button
    const replyBtn = document.getElementById('replyBtn');
    if (replyBtn) {
        replyBtn.addEventListener('click', () => {
            const content = replyInput.value.trim();

            if (!content) {
                this.showNotification('Please write something', 'error');
                return;
            }

            if (content.length > 280) {
                this.showNotification('Reply is too long', 'error');
                return;
            }

            this.addReply(post.id, content);
            replyInput.value = '';
            replyCharCount.textContent = '0/280';
        });
    }

    // Attach event listeners to post actions
    this.attachPostDetailEventListeners(post.id);
};

XApp.prototype.renderMainPost = function (post) {
    const user = this.getUserById(post.userId);
    if (!user) return '';

    const isLiked = post.likes.includes(this.currentUser.id);
    const isRetweeted = post.retweets.includes(this.currentUser.id);

    return `
        <div class="main-post">
            <div class="post-header">
                <div class="post-avatar">
                    ${user.profileImage ? `<img src="${user.profileImage}" alt="${user.name}">` : '👤'}
                </div>
                <div class="post-user-info">
                    <div class="post-name">${user.name}${user.verified ? ' <span style="color: var(--x-blue);">✓</span>' : ''}</div>
                    <div class="post-username">@${user.username}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
            <div class="post-meta">${new Date(post.createdAt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })}</div>
            <div class="post-stats">
                ${post.retweets.length > 0 ? `<div class="stat-item"><span class="stat-number">${this.formatNumber(post.retweets.length)}</span> <span class="stat-label">Retweets</span></div>` : ''}
                ${post.likes.length > 0 ? `<div class="stat-item"><span class="stat-number">${this.formatNumber(post.likes.length)}</span> <span class="stat-label">Likes</span></div>` : ''}
            </div>
            <div class="post-actions">
                <button class="post-action-btn reply-btn" data-post-id="${post.id}">
                    💬 <span>${post.replies.length > 0 ? this.formatNumber(post.replies.length) : ''}</span>
                </button>
                <button class="post-action-btn retweet-btn ${isRetweeted ? 'active' : ''}" data-post-id="${post.id}">
                    🔁 <span>${post.retweets.length > 0 ? this.formatNumber(post.retweets.length) : ''}</span>
                </button>
                <button class="post-action-btn like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                    ${isLiked ? '❤️' : '🤍'} <span>${post.likes.length > 0 ? this.formatNumber(post.likes.length) : ''}</span>
                </button>
                <button class="post-action-btn share-btn" data-post-id="${post.id}">
                    📤
                </button>
            </div>
        </div>
    `;
};

XApp.prototype.loadReplies = function (postId) {
    const posts = this.getData('posts') || [];
    const post = posts.find(p => p.id === postId);
    const repliesContainer = document.getElementById('repliesContainer');

    if (!post || !repliesContainer) return;

    if (post.replies.length === 0) {
        repliesContainer.innerHTML = `
            <div class="empty-replies">
                <h3>No replies yet</h3>
                <p>Be the first to reply!</p>
            </div>
        `;
        return;
    }

    repliesContainer.innerHTML = post.replies.map(reply => {
        const user = this.getUserById(reply.userId);
        if (!user) return '';

        return `
            <div class="reply-item">
                <div class="reply-avatar">
                    ${user.profileImage ? `<img src="${user.profileImage}" alt="${user.name}">` : '👤'}
                </div>
                <div class="reply-content-wrapper">
                    <div class="reply-user-info">
                        <span class="reply-name">${user.name}${user.verified ? ' <span style="color: var(--x-blue);">✓</span>' : ''}</span>
                        <span class="reply-username">@${user.username} · ${this.formatRelativeTime(reply.createdAt)}</span>
                    </div>
                    <div class="reply-text">${reply.content}</div>
                </div>
            </div>
        `;
    }).join('');
};

XApp.prototype.addReply = function (postId, content) {
    const posts = this.getData('posts') || [];
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    const newReply = {
        id: this.generateId(),
        userId: this.currentUser.id,
        content: content,
        createdAt: new Date().toISOString()
    };

    post.replies.push(newReply);
    this.saveData('posts', posts);

    this.showNotification('Reply posted!', 'success');
    this.loadReplies(postId);

    // Update the main post display
    const mainPostContainer = document.getElementById('mainPostContainer');
    if (mainPostContainer) {
        mainPostContainer.innerHTML = this.renderMainPost(post);
        this.attachPostDetailEventListeners(postId);
    }
};

XApp.prototype.attachPostDetailEventListeners = function (postId) {
    // Like button
    const likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            this.toggleLike(postId);
            const posts = this.getData('posts') || [];
            const post = posts.find(p => p.id === postId);
            if (post) {
                const mainPostContainer = document.getElementById('mainPostContainer');
                if (mainPostContainer) {
                    mainPostContainer.innerHTML = this.renderMainPost(post);
                    this.attachPostDetailEventListeners(postId);
                }
            }
        });
    }

    // Retweet button
    const retweetBtn = document.querySelector('.retweet-btn');
    if (retweetBtn) {
        retweetBtn.addEventListener('click', () => {
            this.toggleRetweet(postId);
            const posts = this.getData('posts') || [];
            const post = posts.find(p => p.id === postId);
            if (post) {
                const mainPostContainer = document.getElementById('mainPostContainer');
                if (mainPostContainer) {
                    mainPostContainer.innerHTML = this.renderMainPost(post);
                    this.attachPostDetailEventListeners(postId);
                }
            }
        });
    }
};

/* ===================================
   HELPER METHODS
   =================================== */

XApp.prototype.getUserById = function (userId) {
    const users = this.getData('users') || [];
    return users.find(u => u.id === userId);
};

/* ===================================
   EXPLORE VIEW
   =================================== */

XApp.prototype.initExploreView = function () {
    console.log('Explore view initialized');
    this.initBottomNav('explore');

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const trendingSection = document.getElementById('trendingSection');

    // Search functionality
    if (searchInput) {
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            // Clear previous timeout
            clearTimeout(searchTimeout);

            if (query.length === 0) {
                // Show trending, hide results
                searchResults.style.display = 'none';
                trendingSection.style.display = 'block';
                return;
            }

            // Debounce search
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Clear search on focus if empty
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length === 0) {
                searchResults.style.display = 'none';
                trendingSection.style.display = 'block';
            }
        });
    }

    // Trend click handlers
    const trendItems = document.querySelectorAll('.trend-item');
    trendItems.forEach(item => {
        item.addEventListener('click', () => {
            const hashtag = item.dataset.hashtag;
            if (hashtag) {
                searchInput.value = '#' + hashtag;
                this.performSearch('#' + hashtag);
            }
        });
    });
};

XApp.prototype.performSearch = function (query) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const trendingSection = document.getElementById('trendingSection');

    if (!searchResults || !searchResultsContainer) return;

    // Show search results, hide trending
    searchResults.style.display = 'block';
    trendingSection.style.display = 'none';

    const users = this.getData('users') || [];
    const posts = this.getData('posts') || [];

    const lowerQuery = query.toLowerCase();

    // Search users
    const matchingUsers = users.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        (user.bio && user.bio.toLowerCase().includes(lowerQuery))
    );

    // Search posts
    const matchingPosts = posts.filter(post =>
        post.content.toLowerCase().includes(lowerQuery)
    );

    // Render results
    let resultsHTML = '';

    if (matchingUsers.length === 0 && matchingPosts.length === 0) {
        resultsHTML = `
            <div class="no-results">
                <p style="font-size: 18px; margin-bottom: 8px;">No results for "${query}"</p>
                <p style="font-size: 14px;">Try searching for something else</p>
            </div>
        `;
    } else {
        // Show users first
        if (matchingUsers.length > 0) {
            resultsHTML += matchingUsers.map(user => `
                <div class="search-results-item" data-user-id="${user.id}">
                    <div class="search-result-type">Account</div>
                    <div class="search-result-name">${user.name}${user.verified ? ' <span style="color: var(--x-blue);">✓</span>' : ''}</div>
                    <div class="search-result-username">@${user.username}</div>
                </div>
            `).join('');
        }

        // Show posts
        if (matchingPosts.length > 0) {
            resultsHTML += matchingPosts.map(post => {
                const user = this.getUserById(post.userId);
                if (!user) return '';

                return `
                    <div class="search-results-item post-result" data-post-id="${post.id}">
                        <div class="search-result-type">Post</div>
                        <div class="search-result-name">${user.name} <span style="color: var(--x-gray); font-weight: normal;">@${user.username}</span></div>
                        <div style="margin-top: 4px; font-size: 15px;">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
                    </div>
                `;
            }).join('');
        }
    }

    searchResultsContainer.innerHTML = resultsHTML;

    // Add click handlers to results
    document.querySelectorAll('.search-results-item[data-user-id]').forEach(item => {
        item.addEventListener('click', () => {
            const userId = parseInt(item.dataset.userId);
            this.navigation.loadView('profile', true, { userId });
        });
    });

    document.querySelectorAll('.post-result[data-post-id]').forEach(item => {
        item.addEventListener('click', () => {
            const postId = parseInt(item.dataset.postId);
            this.navigation.loadView('post-detail', true, { postId });
        });
    });
};

/* ===================================
   MESSAGES VIEW
   =================================== */

XApp.prototype.initMessagesView = function () {
    console.log('Messages view initialized');
    this.initBottomNav('messages');

    const messageSearchInput = document.getElementById('messageSearchInput');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const startMessageBtn = document.getElementById('startMessageBtn');

    // Load conversations
    this.loadConversations();

    // Search messages
    if (messageSearchInput) {
        let searchTimeout;
        messageSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterConversations(e.target.value);
            }, 300);
        });
    }

    // New message button
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', () => {
            this.showNewMessageDialog();
        });
    }

    if (startMessageBtn) {
        startMessageBtn.addEventListener('click', () => {
            this.showNewMessageDialog();
        });
    }
};

XApp.prototype.loadConversations = function () {
    const conversations = this.getData('conversations') || [];
    const messagesList = document.getElementById('messagesList');
    const messagesEmpty = document.getElementById('messagesEmpty');

    if (!messagesList) return;

    // Filter conversations for current user
    const userConversations = conversations.filter(conv =>
        conv.participants.includes(this.currentUser.id)
    );

    if (userConversations.length === 0) {
        messagesList.innerHTML = '';
        if (messagesEmpty) messagesEmpty.style.display = 'block';
        return;
    }

    if (messagesEmpty) messagesEmpty.style.display = 'none';

    // Sort by last message time
    userConversations.sort((a, b) =>
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    messagesList.innerHTML = userConversations.map(conv => {
        const otherUserId = conv.participants.find(id => id !== this.currentUser.id);
        const otherUser = this.getUserById(otherUserId);

        if (!otherUser) return '';

        const unreadClass = conv.unread ? 'unread' : '';

        return `
            <div class="message-item ${unreadClass}" data-conversation-id="${conv.id}">
                <div class="message-avatar">
                    ${otherUser.profileImage ? `<img src="${otherUser.profileImage}" alt="${otherUser.name}">` : '👤'}
                </div>
                <div class="message-info">
                    <div class="message-header">
                        <span class="message-name">${otherUser.name}</span>
                        <span class="message-time">${this.formatRelativeTime(conv.lastMessageTime)}</span>
                    </div>
                    <div class="message-preview ${conv.unread ? 'unread' : ''}">${conv.lastMessage}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = parseInt(item.dataset.conversationId);
            this.navigation.loadView('conversation', true, { conversationId });
        });
    });
};

XApp.prototype.filterConversations = function (query) {
    const conversations = this.getData('conversations') || [];
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
        this.loadConversations();
        return;
    }

    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    const userConversations = conversations.filter(conv => {
        const otherUserId = conv.participants.find(id => id !== this.currentUser.id);
        const otherUser = this.getUserById(otherUserId);

        return otherUser && (
            otherUser.name.toLowerCase().includes(lowerQuery) ||
            otherUser.username.toLowerCase().includes(lowerQuery) ||
            conv.lastMessage.toLowerCase().includes(lowerQuery)
        );
    });

    if (userConversations.length === 0) {
        messagesList.innerHTML = `
            <div class="no-results" style="padding: 40px 20px; text-align: center; color: var(--x-gray);">
                <p>No conversations found</p>
            </div>
        `;
        return;
    }

    messagesList.innerHTML = userConversations.map(conv => {
        const otherUserId = conv.participants.find(id => id !== this.currentUser.id);
        const otherUser = this.getUserById(otherUserId);

        if (!otherUser) return '';

        return `
            <div class="message-item" data-conversation-id="${conv.id}">
                <div class="message-avatar">👤</div>
                <div class="message-info">
                    <div class="message-header">
                        <span class="message-name">${otherUser.name}</span>
                        <span class="message-time">${this.formatRelativeTime(conv.lastMessageTime)}</span>
                    </div>
                    <div class="message-preview">${conv.lastMessage}</div>
                </div>
            </div>
        `;
    }).join('');

    // Re-add click handlers
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const conversationId = parseInt(item.dataset.conversationId);
            this.navigation.loadView('conversation', true, { conversationId });
        });
    });
};

XApp.prototype.showNewMessageDialog = function () {
    const users = this.getData('users') || [];
    const otherUsers = users.filter(u => u.id !== this.currentUser.id);

    if (otherUsers.length === 0) {
        this.showNotification('No other users to message', 'info');
        return;
    }

    // Create a simple modal with user list
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 400px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 16px; border-bottom: 1px solid var(--x-border); display: flex; align-items: center; justify-content: space-between;">
                <h3 style="font-size: 20px; font-weight: 700;">New message</h3>
                <button class="modal-close" style="background: transparent; border: none; color: var(--x-white); font-size: 24px; cursor: pointer; padding: 4px;">✕</button>
            </div>
            <div style="overflow-y: auto; flex: 1;">
                ${otherUsers.map(user => `
                    <div class="user-select-item" data-user-id="${user.id}" style="padding: 12px 16px; border-bottom: 1px solid var(--x-border); cursor: pointer; transition: background 0.2s;">
                        <div style="font-weight: 700; font-size: 15px;">${user.name}${user.verified ? ' <span style="color: var(--x-blue);">✓</span>' : ''}</div>
                        <div style="color: var(--x-gray); font-size: 14px;">@${user.username}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;

    document.body.appendChild(modal);

    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // User selection
    modal.querySelectorAll('.user-select-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = 'var(--x-hover)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
            const userId = parseInt(item.dataset.userId);
            modal.remove();
            this.startConversation(userId);
        });
    });
};

XApp.prototype.startConversation = function (otherUserId) {
    const conversations = this.getData('conversations') || [];

    // Check if conversation already exists
    let conversation = conversations.find(conv =>
        conv.participants.includes(this.currentUser.id) &&
        conv.participants.includes(otherUserId)
    );

    if (!conversation) {
        // Create new conversation
        conversation = {
            id: this.generateId(),
            participants: [this.currentUser.id, otherUserId],
            messages: [],
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unread: false
        };
        conversations.push(conversation);
        this.saveData('conversations', conversations);
    }

    this.navigation.loadView('conversation', true, { conversationId: conversation.id });
};

/* ===================================
   CONVERSATION VIEW
   =================================== */

XApp.prototype.initConversationView = function (data) {
    console.log('Conversation view initialized');

    if (!data || !data.conversationId) {
        this.showNotification('Conversation not found', 'error');
        this.navigation.goBack();
        return;
    }

    const conversations = this.getData('conversations') || [];
    const conversation = conversations.find(c => c.id === data.conversationId);

    if (!conversation) {
        this.showNotification('Conversation not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Get other user
    const otherUserId = conversation.participants.find(id => id !== this.currentUser.id);
    const otherUser = this.getUserById(otherUserId);

    if (!otherUser) {
        this.showNotification('User not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Update header
    document.getElementById('conversationName').textContent = otherUser.name;
    document.getElementById('conversationUsername').textContent = `@${otherUser.username}`;

    // Load messages
    this.loadConversationMessages(conversation);

    // Message input
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    if (messageInput && sendMessageBtn) {
        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        });

        // Send message
        const sendMessage = () => {
            const content = messageInput.value.trim();
            if (!content) return;

            this.sendMessage(conversation.id, content);
            messageInput.value = '';
            messageInput.style.height = 'auto';
        };

        sendMessageBtn.addEventListener('click', sendMessage);

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
};

XApp.prototype.loadConversationMessages = function (conversation) {
    const messagesContainer = document.getElementById('conversationMessages');
    if (!messagesContainer) return;

    if (conversation.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="conversation-empty">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = conversation.messages.map(msg => {
        const isSent = msg.senderId === this.currentUser.id;
        const className = isSent ? 'message-sent' : 'message-received';

        return `
            <div class="message-bubble ${className}">
                <div>${msg.content}</div>
                <div class="message-time">${this.formatRelativeTime(msg.timestamp)}</div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

XApp.prototype.sendMessage = function (conversationId, content) {
    const conversations = this.getData('conversations') || [];
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) return;

    const newMessage = {
        id: this.generateId(),
        senderId: this.currentUser.id,
        content: content,
        timestamp: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = content;
    conversation.lastMessageTime = newMessage.timestamp;

    this.saveData('conversations', conversations);

    // Reload messages
    this.loadConversationMessages(conversation);
};

/* ===================================
   EVERYTHING VIEW (Super App Hub)
   =================================== */

XApp.prototype.initEverythingView = function () {
    console.log('Everything view initialized');
    this.initBottomNav('everything');

    // Initialize user wallet if not exists
    this.initializeWallet();

    // Load balance and transactions
    this.loadBalance();
    this.loadTransactions();

    // Settings button handler
    const settingsBtn = document.getElementById('everythingSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            this.navigation.loadView('everything-settings');
        });
    }

    // Button handlers
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    const sendMoneyBtn = document.getElementById('sendMoneyBtn');

    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => this.showAddMoneyDialog());
    }

    if (sendMoneyBtn) {
        sendMoneyBtn.addEventListener('click', () => this.showSendMoneyDialog());
    }

    // Feature card handlers
    const paymentsFeature = document.getElementById('paymentsFeature');
    const shopFeature = document.getElementById('shopFeature');
    const bankFeature = document.getElementById('bankFeature');
    const jobsFeature = document.getElementById('jobsFeature');
    const eventsFeature = document.getElementById('eventsFeature');
    const foodFeature = document.getElementById('foodFeature');
    const ridesFeature = document.getElementById('ridesFeature');
    const newsFeature = document.getElementById('newsFeature');
    const governmentFeature = document.getElementById('governmentFeature');
    const videoFeature = document.getElementById('videoFeature');

    if (paymentsFeature) {
        paymentsFeature.addEventListener('click', () => {
            this.navigation.loadView('payments');
        });
    }

    if (shopFeature) {
        shopFeature.addEventListener('click', () => {
            this.navigation.loadView('shop');
        });
    }

    if (bankFeature) {
        bankFeature.addEventListener('click', () => {
            this.navigation.loadView('bank');
        });
    }

    if (jobsFeature) {
        jobsFeature.addEventListener('click', () => {
            this.navigation.loadView('jobs');
        });
    }

    if (eventsFeature) {
        eventsFeature.addEventListener('click', () => {
            this.navigation.loadView('events');
        });
    }

    if (foodFeature) {
        foodFeature.addEventListener('click', () => {
            this.navigation.loadView('food');
        });
    }

    if (ridesFeature) {
        ridesFeature.addEventListener('click', () => {
            this.navigation.loadView('rides');
        });
    }

    if (newsFeature) {
        newsFeature.addEventListener('click', () => {
            this.navigation.loadView('news');
        });
    }

    if (governmentFeature) {
        governmentFeature.addEventListener('click', () => {
            this.navigation.loadView('government');
        });
    }

    if (videoFeature) {
        videoFeature.addEventListener('click', () => {
            this.navigation.loadView('video');
        });
    }
};

/* ===================================
   EVERYTHING SETTINGS VIEW
   =================================== */

XApp.prototype.initEverythingSettingsView = function () {
    console.log('Everything Settings view initialized');

    // Back button handler
    const backBtn = document.querySelector('.everything-settings-view .back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Load current settings
    this.loadEverythingSettings();

    // Toggle switches
    const autoReloadToggle = document.getElementById('autoReloadToggle');
    if (autoReloadToggle) {
        autoReloadToggle.addEventListener('change', (e) => {
            this.toggleSetting('autoReload', e.target.checked);
        });
    }

    const locationToggle = document.getElementById('locationToggle');
    if (locationToggle) {
        locationToggle.addEventListener('change', (e) => {
            this.toggleSetting('locationServices', e.target.checked);
        });
    }

    const biometricToggle = document.getElementById('biometricToggle');
    if (biometricToggle) {
        biometricToggle.addEventListener('change', (e) => {
            this.toggleSetting('biometricAuth', e.target.checked);
        });
    }

    // Clear cache button
    const clearCacheBtn = document.querySelector('#clearCache .btn-clear');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            this.clearAppCache();
        });
    }

    // Clickable settings items with functionality
    const managePaymentMethods = document.getElementById('managePaymentMethods');
    if (managePaymentMethods) {
        managePaymentMethods.addEventListener('click', () => {
            this.showPaymentMethodsDialog();
        });
    }

    const transactionLimits = document.getElementById('transactionLimits');
    if (transactionLimits) {
        transactionLimits.addEventListener('click', () => {
            this.showTransactionLimitsDialog();
        });
    }

    const notifications = document.getElementById('notifications');
    if (notifications) {
        notifications.addEventListener('click', () => {
            this.showNotificationsDialog();
        });
    }

    const twoFactorAuth = document.getElementById('twoFactorAuth');
    if (twoFactorAuth) {
        twoFactorAuth.addEventListener('click', () => {
            this.showTwoFactorDialog();
        });
    }

    const language = document.getElementById('language');
    if (language) {
        language.addEventListener('click', () => {
            this.showLanguageDialog();
        });
    }

    const currency = document.getElementById('currency');
    if (currency) {
        currency.addEventListener('click', () => {
            this.showCurrencyDialog();
        });
    }

    const helpCenter = document.getElementById('helpCenter');
    if (helpCenter) {
        helpCenter.addEventListener('click', () => {
            this.showHelpCenterDialog();
        });
    }

    const contactSupport = document.getElementById('contactSupport');
    if (contactSupport) {
        contactSupport.addEventListener('click', () => {
            this.showContactSupportDialog();
        });
    }

    const reportProblem = document.getElementById('reportProblem');
    if (reportProblem) {
        reportProblem.addEventListener('click', () => {
            this.showReportProblemDialog();
        });
    }

    const termsOfService = document.getElementById('termsOfService');
    if (termsOfService) {
        termsOfService.addEventListener('click', () => {
            this.showTermsOfServiceDialog();
        });
    }

    const privacyPolicy = document.getElementById('privacyPolicy');
    if (privacyPolicy) {
        privacyPolicy.addEventListener('click', () => {
            this.showPrivacyPolicyDialog();
        });
    }

    // Settings without dialogs (coming soon)
    const comingSoonSettings = ['defaultFeatures', 'privacySettings', 'cacheSettings', 'downloadQuality'];
    comingSoonSettings.forEach(settingId => {
        const element = document.getElementById(settingId);
        if (element) {
            element.addEventListener('click', () => {
                this.showNotification('This setting is coming soon!', 'info');
            });
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutAccount');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            this.showLogoutConfirmation();
        });
    }

    // Delete account
    const deleteBtn = document.getElementById('deleteAccount');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            this.showDeleteAccountConfirmation();
        });
    }
};

XApp.prototype.loadEverythingSettings = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {
        autoReload: false,
        locationServices: true,
        biometricAuth: false
    };

    // Set toggle states
    const autoReloadToggle = document.getElementById('autoReloadToggle');
    if (autoReloadToggle) {
        autoReloadToggle.checked = userSettings.autoReload;
    }

    const locationToggle = document.getElementById('locationToggle');
    if (locationToggle) {
        locationToggle.checked = userSettings.locationServices;
    }

    const biometricToggle = document.getElementById('biometricToggle');
    if (biometricToggle) {
        biometricToggle.checked = userSettings.biometricAuth;
    }
};

XApp.prototype.toggleSetting = function (settingName, value) {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    if (!settings[this.currentUser.id]) {
        settings[this.currentUser.id] = {};
    }

    settings[this.currentUser.id][settingName] = value;
    this.saveData('x_app_settings', settings);

    const settingLabels = {
        autoReload: 'Auto-Reload',
        locationServices: 'Location Services',
        biometricAuth: 'Biometric Authentication'
    };

    this.showNotification(
        settingLabels[settingName] + ' ' + (value ? 'enabled' : 'disabled'),
        'success'
    );
};

XApp.prototype.clearAppCache = function () {
    // In a real app, this would clear cached images, data, etc.
    // For this demo, we'll just show a notification
    this.showNotification('Cache cleared successfully!', 'success');
};

XApp.prototype.showLogoutConfirmation = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-content" style="max-width: 340px;">' +
        '<h3 style="margin-bottom: 12px;">Log Out?</h3>' +
        '<p style="color: var(--x-gray); margin-bottom: 24px;">Are you sure you want to log out of your account?</p>' +
        '<div style="display: flex; gap: 12px;">' +
        '<button id="cancelLogout" class="btn btn-outline" style="flex: 1;">Cancel</button>' +
        '<button id="confirmLogout" class="btn btn-primary" style="flex: 1; background: var(--x-red);">Log Out</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    document.getElementById('cancelLogout').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('confirmLogout').addEventListener('click', () => {
        document.body.removeChild(modal);
        this.logout();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

XApp.prototype.showDeleteAccountConfirmation = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-content" style="max-width: 340px;">' +
        '<h3 style="margin-bottom: 12px; color: var(--x-red);">Delete Account?</h3>' +
        '<p style="color: var(--x-gray); margin-bottom: 24px;">This action cannot be undone. All your data will be permanently deleted.</p>' +
        '<div style="display: flex; gap: 12px;">' +
        '<button id="cancelDelete" class="btn btn-outline" style="flex: 1;">Cancel</button>' +
        '<button id="confirmDelete" class="btn btn-primary" style="flex: 1; background: var(--x-red);">Delete</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        document.body.removeChild(modal);
        this.deleteAccount();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};



XApp.prototype.deleteAccount = function () {
    if (!this.currentUser) return;

    // In a real app, this would delete all user data
    // For demo, we'll just log out
    this.showNotification('Account deletion initiated', 'success');
    this.logout();
};

// Payment Methods Dialog
XApp.prototype.showPaymentMethodsDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const wallets = this.getData('x_app_wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0 };

    let html = '<div class="modal-content" style="max-width: 340px;">';
    html += '<h3 style="margin-bottom: 16px;">Payment Methods</h3>';
    html += '<div style="margin-bottom: 20px;">';
    html += '  <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 12px;">';
    html += '    <div style="display: flex; align-items: center; gap: 12px;">';
    html += '      <div style="font-size: 28px;">💳</div>';
    html += '      <div style="flex: 1;">';
    html += '        <div style="font-weight: 700; margin-bottom: 4px;">X Wallet</div>';
    html += '        <div style="color: var(--x-gray); font-size: 13px;">Primary payment method</div>';
    html += '      </div>';
    html += '      <div style="font-size: 16px; font-weight: 700; color: var(--x-green);">$' + userWallet.balance.toFixed(2) + '</div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; opacity: 0.6;">';
    html += '    <div style="display: flex; align-items: center; gap: 12px;">';
    html += '      <div style="font-size: 28px;">🏦</div>';
    html += '      <div style="flex: 1;">';
    html += '        <div style="font-weight: 700; margin-bottom: 4px;">Bank Account</div>';
    html += '        <div style="color: var(--x-gray); font-size: 13px;">Not linked</div>';
    html += '      </div>';
    html += '      <div style="font-size: 12px; color: var(--x-blue); font-weight: 600;">Link</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    html += '<button id="closePaymentMethods" class="btn btn-primary" style="width: 100%;">Done</button>';
    html += '</div>';

    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById('closePaymentMethods').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

// Transaction Limits Dialog
XApp.prototype.showTransactionLimitsDialog = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {};
    const dailyLimit = userSettings.dailyLimit || 1000;
    const singleLimit = userSettings.singleLimit || 500;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px;">';
    html += '<h3 style="margin-bottom: 16px;">Transaction Limits</h3>';
    html += '<div style="margin-bottom: 20px;">';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Daily Limit ($)</label>';
    html += '    <input type="number" id="dailyLimitInput" value="' + dailyLimit + '" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />';
    html += '  </div>';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Single Transaction Limit ($)</label>';
    html += '    <input type="number" id="singleLimitInput" value="' + singleLimit + '" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />';
    html += '  </div>';
    html += '</div>';
    html += '<div style="display: flex; gap: 12px;">';
    html += '  <button id="cancelLimits" class="btn btn-outline" style="flex: 1;">Cancel</button>';
    html += '  <button id="saveLimits" class="btn btn-primary" style="flex: 1;">Save</button>';
    html += '</div>';
    html += '</div>';

    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById('cancelLimits').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('saveLimits').addEventListener('click', () => {
        const dailyLimit = parseFloat(document.getElementById('dailyLimitInput').value);
        const singleLimit = parseFloat(document.getElementById('singleLimitInput').value);

        if (dailyLimit < singleLimit) {
            this.showNotification('Daily limit must be greater than single transaction limit', 'error');
            return;
        }

        if (!settings[this.currentUser.id]) {
            settings[this.currentUser.id] = {};
        }
        settings[this.currentUser.id].dailyLimit = dailyLimit;
        settings[this.currentUser.id].singleLimit = singleLimit;
        this.saveData('x_app_settings', settings);

        this.showNotification('Transaction limits updated', 'success');
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

// Notifications Dialog
XApp.prototype.showNotificationsDialog = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {};
    const notifSettings = userSettings.notifications || {
        transactions: true,
        promotions: true,
        updates: true,
        security: true
    };

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px;">';
    html += '<h3 style="margin-bottom: 16px;">Notification Preferences</h3>';
    html += '<div style="margin-bottom: 20px;">';

    const notifTypes = [
        { key: 'transactions', label: 'Transaction Alerts', desc: 'Get notified about payments' },
        { key: 'promotions', label: 'Promotions & Offers', desc: 'Special deals and discounts' },
        { key: 'updates', label: 'App Updates', desc: 'New features and improvements' },
        { key: 'security', label: 'Security Alerts', desc: 'Account security notifications' }
    ];

    notifTypes.forEach(notif => {
        html += '<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--x-border);">';
        html += '  <div>';
        html += '    <div style="font-weight: 600; margin-bottom: 2px;">' + notif.label + '</div>';
        html += '    <div style="font-size: 12px; color: var(--x-gray);">' + notif.desc + '</div>';
        html += '  </div>';
        html += '  <input type="checkbox" id="notif_' + notif.key + '" ' + (notifSettings[notif.key] ? 'checked' : '') + ' style="width: 20px; height: 20px;" />';
        html += '</div>';
    });

    html += '</div>';
    html += '<div style="display: flex; gap: 12px;">';
    html += '  <button id="cancelNotif" class="btn btn-outline" style="flex: 1;">Cancel</button>';
    html += '  <button id="saveNotif" class="btn btn-primary" style="flex: 1;">Save</button>';
    html += '</div>';
    html += '</div>';

    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById('cancelNotif').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('saveNotif').addEventListener('click', () => {
        const newNotifSettings = {
            transactions: document.getElementById('notif_transactions').checked,
            promotions: document.getElementById('notif_promotions').checked,
            updates: document.getElementById('notif_updates').checked,
            security: document.getElementById('notif_security').checked
        };

        if (!settings[this.currentUser.id]) {
            settings[this.currentUser.id] = {};
        }
        settings[this.currentUser.id].notifications = newNotifSettings;
        this.saveData('x_app_settings', settings);

        this.showNotification('Notification preferences updated', 'success');
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

// Two Factor Auth Dialog
XApp.prototype.showTwoFactorDialog = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {};
    const twoFactorEnabled = userSettings.twoFactorEnabled || false;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px;">';
    html += '<h3 style="margin-bottom: 16px;">Two-Factor Authentication</h3>';
    html += '<p style="color: var(--x-gray); margin-bottom: 20px;">Add an extra layer of security to your account by requiring a verification code in addition to your password.</p>';
    html += '<div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 20px;">';
    html += '  <div style="display: flex; align-items: center; justify-content: space-between;">';
    html += '    <div>';
    html += '      <div style="font-weight: 700; margin-bottom: 4px;">Status</div>';
    html += '      <div style="font-size: 13px; color: ' + (twoFactorEnabled ? 'var(--x-green)' : 'var(--x-gray)') + ';">' + (twoFactorEnabled ? 'Enabled' : 'Disabled') + '</div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
    html += '<div style="display: flex; gap: 12px;">';
    html += '  <button id="close2FA" class="btn btn-outline" style="flex: 1;">Close</button>';
    html += '  <button id="toggle2FA" class="btn btn-primary" style="flex: 1;">' + (twoFactorEnabled ? 'Disable' : 'Enable') + '</button>';
    html += '</div>';
    html += '</div>';

    modal.innerHTML = html;
    document.body.appendChild(modal);

    document.getElementById('close2FA').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('toggle2FA').addEventListener('click', () => {
        if (!settings[this.currentUser.id]) {
            settings[this.currentUser.id] = {};
        }
        settings[this.currentUser.id].twoFactorEnabled = !twoFactorEnabled;
        this.saveData('x_app_settings', settings);

        this.showNotification('Two-factor authentication ' + (twoFactorEnabled ? 'disabled' : 'enabled'), 'success');
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
};

// Language Dialog
XApp.prototype.showLanguageDialog = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {};
    const currentLanguage = userSettings.language || 'en-US';

    const languages = [
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'pt', name: 'Português' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'ar', name: 'العربية' }
    ];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Select Language</h3>';
    html += '<div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">';

    languages.forEach(lang => {
        const isSelected = lang.code === currentLanguage;
        html += '<div class="language-option" data-lang="' + lang.code + '" style="padding: 14px; border-bottom: 1px solid var(--x-border); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s;">';
        html += '  <span style="font-weight: ' + (isSelected ? '700' : '400') + ';">' + lang.name + '</span>';
        if (isSelected) {
            html += '  <span style="color: var(--x-blue);">✓</span>';
        }
        html += '</div>';
    });

    html += '</div>';
    html += '<button id="closeLanguage" class="btn btn-primary" style="width: 100%;">Done</button>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    // Add hover effect
    const languageOptions = modal.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.style.background = 'var(--x-hover)';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        option.addEventListener('click', () => {
            const langCode = option.getAttribute('data-lang');
            if (!settings[this.currentUser.id]) {
                settings[this.currentUser.id] = {};
            }
            settings[this.currentUser.id].language = langCode;
            this.saveData('x_app_settings', settings);

            const langName = languages.find(l => l.code === langCode).name;
            this.showNotification('Language changed to ' + langName, 'success');
            modal.remove();

            // Update the language setting display
            setTimeout(() => {
                const langSetting = document.querySelector('#language .setting-desc');
                if (langSetting) {
                    langSetting.textContent = langName;
                }
            }, 100);
        });
    });

    document.getElementById('closeLanguage').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Currency Dialog
XApp.prototype.showCurrencyDialog = function () {
    if (!this.currentUser) return;

    const settings = this.getData('x_app_settings') || {};
    const userSettings = settings[this.currentUser.id] || {};
    const currentCurrency = userSettings.currency || 'USD';

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
        { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
    ];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Select Currency</h3>';
    html += '<div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">';

    currencies.forEach(curr => {
        const isSelected = curr.code === currentCurrency;
        html += '<div class="currency-option" data-currency="' + curr.code + '" style="padding: 14px; border-bottom: 1px solid var(--x-border); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.2s;">';
        html += '  <div>';
        html += '    <span style="font-weight: ' + (isSelected ? '700' : '600') + ';">' + curr.name + '</span>';
        html += '    <span style="color: var(--x-gray); margin-left: 8px; font-size: 13px;">(' + curr.symbol + ')</span>';
        html += '  </div>';
        if (isSelected) {
            html += '  <span style="color: var(--x-blue);">✓</span>';
        }
        html += '</div>';
    });

    html += '</div>';
    html += '<button id="closeCurrency" class="btn btn-primary" style="width: 100%;">Done</button>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    // Add hover effect and click handler
    const currencyOptions = modal.querySelectorAll('.currency-option');
    currencyOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.style.background = 'var(--x-hover)';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        option.addEventListener('click', () => {
            const currCode = option.getAttribute('data-currency');
            if (!settings[this.currentUser.id]) {
                settings[this.currentUser.id] = {};
            }
            settings[this.currentUser.id].currency = currCode;
            this.saveData('x_app_settings', settings);

            const currency = currencies.find(c => c.code === currCode);
            this.showNotification('Currency changed to ' + currency.code, 'success');
            modal.remove();

            // Update the currency setting display
            setTimeout(() => {
                const currSetting = document.querySelector('#currency .setting-desc');
                if (currSetting) {
                    currSetting.textContent = currency.code + ' (' + currency.symbol + ')';
                }
            }, 100);
        });
    });

    document.getElementById('closeCurrency').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Help Center Dialog
XApp.prototype.showHelpCenterDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Help Center</h3>';
    html += '<div style="margin-bottom: 20px;">';

    const helpTopics = [
        { icon: '💰', title: 'Making Payments', desc: 'How to send and receive money' },
        { icon: '🛒', title: 'Shopping', desc: 'Browse and purchase products' },
        { icon: '🏦', title: 'Bank Services', desc: 'Loans and financial services' },
        { icon: '💼', title: 'Job Applications', desc: 'Find and apply for jobs' },
        { icon: '🔒', title: 'Account Security', desc: 'Keep your account safe' },
        { icon: '❓', title: 'General FAQs', desc: 'Common questions and answers' }
    ];

    helpTopics.forEach(topic => {
        html += '<div style="padding: 12px; background: var(--x-dark-gray); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s;" class="help-topic">';
        html += '  <div style="display: flex; align-items: center; gap: 12px;">';
        html += '    <div style="font-size: 24px;">' + topic.icon + '</div>';
        html += '    <div>';
        html += '      <div style="font-weight: 700; margin-bottom: 2px;">' + topic.title + '</div>';
        html += '      <div style="font-size: 12px; color: var(--x-gray);">' + topic.desc + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    });

    html += '</div>';
    html += '<button id="closeHelp" class="btn btn-primary" style="width: 100%;">Close</button>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    // Add hover effects
    const helpTopicElements = modal.querySelectorAll('.help-topic');
    helpTopicElements.forEach(topic => {
        topic.addEventListener('mouseenter', () => {
            topic.style.background = 'var(--x-hover)';
        });
        topic.addEventListener('mouseleave', () => {
            topic.style.background = 'var(--x-dark-gray)';
        });
        topic.addEventListener('click', () => {
            this.showNotification('Help article coming soon!', 'info');
        });
    });

    document.getElementById('closeHelp').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Contact Support Dialog
XApp.prototype.showContactSupportDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Contact Support</h3>';
    html += '<div style="margin-bottom: 20px;">';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Category</label>';
    html += '    <select id="supportCategory" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;">';
    html += '      <option>Payment Issue</option>';
    html += '      <option>Account Problem</option>';
    html += '      <option>Technical Support</option>';
    html += '      <option>Feature Request</option>';
    html += '      <option>Other</option>';
    html += '    </select>';
    html += '  </div>';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Message</label>';
    html += '    <textarea id="supportMessage" placeholder="Describe your issue..." style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px; min-height: 100px; resize: vertical;"></textarea>';
    html += '  </div>';
    html += '</div>';
    html += '<div style="display: flex; gap: 12px;">';
    html += '  <button id="cancelSupport" class="btn btn-outline" style="flex: 1;">Cancel</button>';
    html += '  <button id="sendSupport" class="btn btn-primary" style="flex: 1;">Send</button>';
    html += '</div>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    document.getElementById('cancelSupport').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('sendSupport').addEventListener('click', () => {
        const message = document.getElementById('supportMessage').value.trim();
        if (!message) {
            this.showNotification('Please enter a message', 'error');
            return;
        }

        this.showNotification('Support ticket submitted. We\'ll respond within 24 hours.', 'success');
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Report Problem Dialog
XApp.prototype.showReportProblemDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Report a Problem</h3>';
    html += '<div style="margin-bottom: 20px;">';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Problem Type</label>';
    html += '    <select id="problemType" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;">';
    html += '      <option>Bug or Error</option>';
    html += '      <option>Performance Issue</option>';
    html += '      <option>Feature Not Working</option>';
    html += '      <option>Security Concern</option>';
    html += '      <option>Other</option>';
    html += '    </select>';
    html += '  </div>';
    html += '  <div style="margin-bottom: 16px;">';
    html += '    <label style="display: block; font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Description</label>';
    html += '    <textarea id="problemDescription" placeholder="Please describe the problem in detail..." style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px; min-height: 100px; resize: vertical;"></textarea>';
    html += '  </div>';
    html += '</div>';
    html += '<div style="display: flex; gap: 12px;">';
    html += '  <button id="cancelReport" class="btn btn-outline" style="flex: 1;">Cancel</button>';
    html += '  <button id="submitReport" class="btn btn-primary" style="flex: 1;">Submit</button>';
    html += '</div>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    document.getElementById('cancelReport').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('submitReport').addEventListener('click', () => {
        const description = document.getElementById('problemDescription').value.trim();
        if (!description) {
            this.showNotification('Please describe the problem', 'error');
            return;
        }

        this.showNotification('Problem report submitted. Thank you for your feedback!', 'success');
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Terms of Service Dialog
XApp.prototype.showTermsOfServiceDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; max-height: 70vh; display: flex; flex-direction: column; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Terms of Service</h3>';
    html += '<div style="flex: 1; overflow-y: auto; margin-bottom: 20px; color: var(--x-gray); font-size: 14px; line-height: 1.6; padding-right: 8px;">';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">1. Acceptance of Terms</strong></p>';
    html += '<p style="margin-bottom: 16px;">By accessing and using X - The Everything App, you accept and agree to be bound by the terms and provision of this agreement.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">2. Use License</strong></p>';
    html += '<p style="margin-bottom: 16px;">Permission is granted to temporarily use the services for personal, non-commercial transitory viewing only.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">3. Account Security</strong></p>';
    html += '<p style="margin-bottom: 16px;">You are responsible for maintaining the confidentiality of your account and password.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">4. Financial Transactions</strong></p>';
    html += '<p style="margin-bottom: 16px;">All financial transactions are subject to our payment processing terms and applicable fees.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">5. Prohibited Uses</strong></p>';
    html += '<p style="margin-bottom: 16px;">You may not use our services for any illegal or unauthorized purpose.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">6. Modifications</strong></p>';
    html += '<p style="margin-bottom: 16px;">We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modifications.</p>';
    html += '</div>';
    html += '<button id="closeTerms" class="btn btn-primary" style="width: 100%;">Close</button>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    document.getElementById('closeTerms').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Privacy Policy Dialog
XApp.prototype.showPrivacyPolicyDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let html = '<div class="modal-content" style="max-width: 340px; max-height: 70vh; display: flex; flex-direction: column; padding: 20px;">';
    html += '<h3 style="margin-bottom: 16px;">Privacy Policy</h3>';
    html += '<div style="flex: 1; overflow-y: auto; margin-bottom: 20px; color: var(--x-gray); font-size: 14px; line-height: 1.6; padding-right: 8px;">';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Information We Collect</strong></p>';
    html += '<p style="margin-bottom: 16px;">We collect information you provide directly to us, including account information, transaction data, and usage information.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">How We Use Your Information</strong></p>';
    html += '<p style="margin-bottom: 16px;">We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Data Security</strong></p>';
    html += '<p style="margin-bottom: 16px;">We implement appropriate security measures to protect your personal information from unauthorized access.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Data Sharing</strong></p>';
    html += '<p style="margin-bottom: 16px;">We do not sell your personal information. We may share data with service providers who assist in our operations.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Your Rights</strong></p>';
    html += '<p style="margin-bottom: 16px;">You have the right to access, correct, or delete your personal information at any time.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Cookies</strong></p>';
    html += '<p style="margin-bottom: 16px;">We use local storage to enhance user experience and remember your preferences.</p>';
    html += '<p style="margin-bottom: 12px;"><strong style="color: var(--x-white);">Contact Us</strong></p>';
    html += '<p style="margin-bottom: 16px;">If you have questions about this Privacy Policy, please contact our support team.</p>';
    html += '</div>';
    html += '<button id="closePrivacy" class="btn btn-primary" style="width: 100%;">Close</button>';
    html += '</div>';

    modal.innerHTML = html;
    const phoneScreen = document.querySelector('.phone-screen');
    (phoneScreen || document.body).appendChild(modal);

    document.getElementById('closePrivacy').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

/* ===================================
   PAYMENTS VIEW (Legacy - kept for compatibility)
   =================================== */

/* ===================================
   SHOP VIEW
   =================================== */

XApp.prototype.initShopView = function () {
    console.log('Shop view initialized');

    // Load products
    this.loadProducts();

    // Update cart badge
    this.updateCartBadge();

    // Search functionality
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterProducts(e.target.value);
            }, 300);
        });
    }

    // Category filters
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            categoryChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            this.filterProductsByCategory(e.target.dataset.category);
        });
    });

    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            this.navigation.loadView('cart');
        });
    }
};

XApp.prototype.loadProducts = function (category = 'all', searchQuery = '') {
    const products = this.getData('products') || [];
    const productsGrid = document.getElementById('productsGrid');

    if (!productsGrid) return;

    let filteredProducts = products;

    // Filter by category
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-shop" style="grid-column: 1 / -1;">
                <div class="empty-icon">🛍️</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toLocaleString()}</div>
                <div class="product-rating">⭐ ${product.rating} (${product.reviews})</div>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');

    // Add click handlers
    productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(card.dataset.productId);
                this.navigation.loadView('product-detail', true, { productId });
            }
        });
    });

    productsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (product && product.inStock) {
                this.addToCart(productId);
            }
        });
    });
};

XApp.prototype.filterProducts = function (searchQuery) {
    const categoryChip = document.querySelector('.category-chip.active');
    const category = categoryChip ? categoryChip.dataset.category : 'all';
    this.loadProducts(category, searchQuery);
};

XApp.prototype.filterProductsByCategory = function (category) {
    const searchInput = document.getElementById('shopSearchInput');
    const searchQuery = searchInput ? searchInput.value : '';
    this.loadProducts(category, searchQuery);
};

XApp.prototype.addToCart = function (productId, quantity = 1) {
    let cart = this.getData('cart') || {};

    if (!cart[this.currentUser.id]) {
        cart[this.currentUser.id] = [];
    }

    const userCart = cart[this.currentUser.id];
    const existingItem = userCart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        userCart.push({
            productId,
            quantity
        });
    }

    this.saveData('cart', cart);
    this.updateCartBadge();
    this.showNotification('Added to cart', 'success');
};

XApp.prototype.updateCartBadge = function () {
    const cart = this.getData('cart') || {};
    const userCart = cart[this.currentUser.id] || [];
    const totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);

    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
};

/* ===================================
   PRODUCT DETAIL VIEW
   =================================== */

XApp.prototype.initProductDetailView = function () {
    console.log('Product detail view initialized');

    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const productId = parseInt(urlParams.get('productId'));

    if (!productId) {
        this.navigation.loadView('shop');
        return;
    }

    this.loadProductDetail(productId);
    this.updateCartBadge();

    // Back button
    const backBtn = document.getElementById('productDetailBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.loadView('shop');
        });
    }

    // Cart button
    const cartBtn = document.getElementById('productCartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            this.navigation.loadView('cart');
        });
    }
};

XApp.prototype.loadProductDetail = function (productId) {
    const products = this.getData('products') || [];
    const product = products.find(p => p.id === productId);
    const container = document.getElementById('productDetailContent');

    if (!container || !product) return;

    container.innerHTML = `
        <div class="product-detail-content">
            <div class="product-detail-image">${product.icon}</div>
            <div class="product-detail-info">
                <h2 class="product-detail-name">${product.name}</h2>
                <div class="product-detail-rating">
                    ⭐ ${product.rating} (${product.reviews} reviews)
                </div>
                <div class="product-detail-price">$${product.price.toLocaleString()}</div>
                <p class="product-detail-description">${product.description}</p>
                
                <div class="product-quantity">
                    <label>Quantity</label>
                    <div class="quantity-control">
                        <button class="quantity-btn" id="decreaseQty">−</button>
                        <span class="quantity-value" id="quantityValue">1</span>
                        <button class="quantity-btn" id="increaseQty">+</button>
                    </div>
                </div>
                
                <div class="product-detail-actions">
                    <button class="btn btn-outline" id="buyNowBtn">Buy Now</button>
                    <button class="btn btn-primary" id="addToCartDetailBtn">Add to Cart</button>
                </div>
            </div>
        </div>
    `;

    let quantity = 1;

    const quantityValue = document.getElementById('quantityValue');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const addToCartBtn = document.getElementById('addToCartDetailBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityValue.textContent = quantity;
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            if (quantity < 99) {
                quantity++;
                quantityValue.textContent = quantity;
            }
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (product.inStock) {
                this.addToCart(productId, quantity);
            } else {
                this.showNotification('Product out of stock', 'error');
            }
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            if (product.inStock) {
                this.addToCart(productId, quantity);
                this.navigation.loadView('cart');
            } else {
                this.showNotification('Product out of stock', 'error');
            }
        });
    }
};

/* ===================================
   CART VIEW
   =================================== */

XApp.prototype.initCartView = function () {
    console.log('Cart view initialized');

    this.loadCart();

    // Back button
    const backBtn = document.getElementById('cartBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.clearCart();
            }
        });
    }
};

XApp.prototype.loadCart = function () {
    const cart = this.getData('cart') || {};
    const userCart = cart[this.currentUser.id] || [];
    const products = this.getData('products') || [];

    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (!cartItems || !cartSummary) return;

    if (userCart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <button class="btn btn-primary" id="startShoppingBtn">Start Shopping</button>
            </div>
        `;
        cartSummary.innerHTML = '';

        // Add event listener for start shopping button
        const startShoppingBtn = document.getElementById('startShoppingBtn');
        if (startShoppingBtn) {
            startShoppingBtn.addEventListener('click', () => {
                this.navigation.loadView('shop');
            });
        }

        return;
    }

    // Calculate totals
    let subtotal = 0;
    const cartItemsHtml = userCart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="cart-item" data-product-id="${product.id}">
                <div class="cart-item-image">${product.icon}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">$${product.price.toLocaleString()}</div>
                    <div class="cart-item-quantity">
                        <button class="cart-qty-btn decrease-qty" data-product-id="${product.id}">−</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-btn increase-qty" data-product-id="${product.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-product-id="${product.id}">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    cartItems.innerHTML = cartItemsHtml;

    cartSummary.innerHTML = `
        <div class="cart-summary-row">
            <span>Subtotal</span>
            <span class="amount">$${subtotal.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row">
            <span>Tax</span>
            <span class="amount">$${tax.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row">
            <span>Shipping</span>
            <span class="amount">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="cart-summary-row total">
            <span>Total</span>
            <span class="amount">$${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
    `;

    // Add event listeners
    cartItems.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            this.updateCartQuantity(productId, 1);
        });
    });

    cartItems.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            this.updateCartQuantity(productId, -1);
        });
    });

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            this.removeFromCart(productId);
        });
    });

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            this.checkout(total);
        });
    }
};

XApp.prototype.updateCartQuantity = function (productId, change) {
    const cart = this.getData('cart') || {};
    const userCart = cart[this.currentUser.id] || [];
    const item = userCart.find(i => i.productId === productId);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.saveData('cart', cart);
        this.loadCart();
        this.updateCartBadge();
    }
};

XApp.prototype.removeFromCart = function (productId) {
    const cart = this.getData('cart') || {};
    const userCart = cart[this.currentUser.id] || [];
    cart[this.currentUser.id] = userCart.filter(item => item.productId !== productId);
    this.saveData('cart', cart);
    this.loadCart();
    this.updateCartBadge();
    this.showNotification('Removed from cart', 'success');
};

XApp.prototype.clearCart = function () {
    const cart = this.getData('cart') || {};
    cart[this.currentUser.id] = [];
    this.saveData('cart', cart);
    this.loadCart();
    this.updateCartBadge();
    this.showNotification('Cart cleared', 'success');
};

XApp.prototype.checkout = function (total) {
    const wallets = this.getData('wallets') || {};
    const wallet = wallets[this.currentUser.id];

    if (!wallet || wallet.balance < total) {
        this.showNotification('Insufficient balance. Please add money to your wallet.', 'error');
        setTimeout(() => {
            this.navigation.loadView('everything');
        }, 2000);
        return;
    }

    // Deduct from balance
    wallet.balance -= total;
    wallet.transactions.push({
        id: this.generateId(),
        type: 'sent',
        amount: total,
        description: 'Shopping purchase',
        timestamp: new Date().toISOString()
    });

    this.saveData('wallets', wallets);

    // Clear cart
    this.clearCart();

    this.showNotification('Order placed successfully! 🎉', 'success');

    setTimeout(() => {
        this.navigation.loadView('everything');
    }, 1500);
};

XApp.prototype.initializeWallet = function () {
    let wallets = this.getData('wallets') || {};

    if (!wallets[this.currentUser.id]) {
        wallets[this.currentUser.id] = {
            balance: 0,
            transactions: []
        };
        this.saveData('wallets', wallets);
    }
};

XApp.prototype.loadBalance = function () {
    const wallets = this.getData('wallets') || {};
    const wallet = wallets[this.currentUser.id] || { balance: 0 };

    const balanceElement = document.getElementById('balanceAmount');
    if (balanceElement) {
        balanceElement.textContent = `$${wallet.balance.toFixed(2)}`;
    }
};

XApp.prototype.loadTransactions = function () {
    const wallets = this.getData('wallets') || {};
    const wallet = wallets[this.currentUser.id] || { transactions: [] };
    const transactionsContainer = document.getElementById('transactionsContainer');

    if (!transactionsContainer) return;

    if (wallet.transactions.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="empty-transactions">
                <div class="empty-icon">💰</div>
                <h3>No transactions yet</h3>
                <p>Your payment history will appear here</p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    const sortedTransactions = wallet.transactions.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Show only recent 10
    const recentTransactions = sortedTransactions.slice(0, 10);

    transactionsContainer.innerHTML = recentTransactions.map(tx => {
        const isSent = tx.type === 'sent';
        const iconClass = isSent ? 'sent' : 'received';
        const amountClass = isSent ? 'sent' : 'received';
        const icon = isSent ? '↑' : '↓';
        const prefix = isSent ? '-' : '+';

        let displayName = tx.description;
        if (tx.recipientId || tx.senderId) {
            const otherId = tx.recipientId || tx.senderId;
            const otherUser = this.getUserById(otherId);
            if (otherUser) {
                displayName = isSent ? `To ${otherUser.name}` : `From ${otherUser.name}`;
            }
        }

        return `
            <div class="transaction-item">
                <div class="transaction-icon ${iconClass}">
                    ${icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${displayName}</div>
                    <div class="transaction-date">${this.formatRelativeTime(tx.timestamp)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${prefix}$${tx.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
};

XApp.prototype.showAddMoneyDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 24px; max-width: 400px;">
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px;">Add Money</h3>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Amount</label>
                <input type="number" id="addMoneyAmount" placeholder="0.00" min="1" step="0.01" 
                    style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 18px;" />
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="btn btn-outline" id="cancelAddMoney" style="flex: 1;">Cancel</button>
                <button class="btn btn-primary" id="confirmAddMoney" style="flex: 1;">Add Money</button>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelAddMoney').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('#confirmAddMoney').addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('addMoneyAmount').value);
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        this.addMoney(amount);
        modal.remove();
    });

    // Focus input
    setTimeout(() => document.getElementById('addMoneyAmount').focus(), 100);
};

XApp.prototype.showSendMoneyDialog = function () {
    const users = this.getData('users') || [];
    const otherUsers = users.filter(u => u.id !== this.currentUser.id);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 400px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--x-border);">
                <h3 style="font-size: 20px; font-weight: 700;">Send Money</h3>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Select Recipient</label>
                    <select id="recipientSelect" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;">
                        <option value="">Choose a user...</option>
                        ${otherUsers.map(u => `<option value="${u.id}">${u.name} (@${u.username})</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Amount</label>
                    <input type="number" id="sendMoneyAmount" placeholder="0.00" min="1" step="0.01" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 18px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Note (optional)</label>
                    <input type="text" id="sendMoneyNote" placeholder="What's this for?" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="btn btn-outline" id="cancelSendMoney" style="flex: 1;">Cancel</button>
                    <button class="btn btn-primary" id="confirmSendMoney" style="flex: 1;">Send</button>
                </div>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelSendMoney').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('#confirmSendMoney').addEventListener('click', () => {
        const recipientId = parseInt(document.getElementById('recipientSelect').value);
        const amount = parseFloat(document.getElementById('sendMoneyAmount').value);
        const note = document.getElementById('sendMoneyNote').value.trim();

        if (!recipientId) {
            this.showNotification('Please select a recipient', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        this.sendMoney(recipientId, amount, note);
        modal.remove();
    });
};

XApp.prototype.addMoney = function (amount) {
    const wallets = this.getData('wallets') || {};
    const wallet = wallets[this.currentUser.id];

    wallet.balance += amount;
    wallet.transactions.push({
        id: this.generateId(),
        type: 'received',
        amount: amount,
        description: 'Added to wallet',
        timestamp: new Date().toISOString()
    });

    this.saveData('wallets', wallets);
    this.loadBalance();
    this.loadTransactions();
    this.showNotification(`Added $${amount.toFixed(2)} to your wallet`, 'success');
};

XApp.prototype.sendMoney = function (recipientId, amount, note) {
    const wallets = this.getData('wallets') || {};
    const senderWallet = wallets[this.currentUser.id];

    // Check balance
    if (senderWallet.balance < amount) {
        this.showNotification('Insufficient balance', 'error');
        return;
    }

    // Initialize recipient wallet if needed
    if (!wallets[recipientId]) {
        wallets[recipientId] = { balance: 0, transactions: [] };
    }

    const recipientWallet = wallets[recipientId];
    const recipient = this.getUserById(recipientId);

    // Deduct from sender
    senderWallet.balance -= amount;
    senderWallet.transactions.push({
        id: this.generateId(),
        type: 'sent',
        amount: amount,
        recipientId: recipientId,
        description: note || `To ${recipient.name}`,
        timestamp: new Date().toISOString()
    });

    // Add to recipient
    recipientWallet.balance += amount;
    recipientWallet.transactions.push({
        id: this.generateId(),
        type: 'received',
        amount: amount,
        senderId: this.currentUser.id,
        description: note || `From ${this.currentUser.name}`,
        timestamp: new Date().toISOString()
    });

    this.saveData('wallets', wallets);
    this.loadBalance();
    this.loadTransactions();
    this.showNotification(`Sent $${amount.toFixed(2)} to ${recipient.name}`, 'success');
};

/* ===================================
   SETTINGS VIEW
   =================================== */

XApp.prototype.initSettingsView = function () {
    console.log('Settings view initialized');

    // Load user preferences
    this.loadUserPreferences();

    // Edit Profile
    const editProfileItem = document.getElementById('editProfileItem');
    if (editProfileItem) {
        editProfileItem.addEventListener('click', () => {
            this.showEditProfileDialog();
        });
    }

    // Change Password
    const changePasswordItem = document.getElementById('changePasswordItem');
    if (changePasswordItem) {
        changePasswordItem.addEventListener('click', () => {
            this.showChangePasswordDialog();
        });
    }

    // Privacy & Safety
    const privacySafetyItem = document.getElementById('privacySafetyItem');
    if (privacySafetyItem) {
        privacySafetyItem.addEventListener('click', () => {
            this.showPrivacySafetyDialog();
        });
    }

    // Notifications Toggle
    const notificationsToggle = document.getElementById('notificationsToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            this.saveUserPreference('notifications', e.target.checked);
            this.showNotification(
                e.target.checked ? 'Notifications enabled' : 'Notifications disabled',
                'success'
            );
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            this.saveUserPreference('darkMode', e.target.checked);
            this.showNotification(
                e.target.checked ? 'Dark mode enabled' : 'Dark mode disabled',
                'success'
            );
        });
    }

    // About Items
    const termsItem = document.getElementById('termsItem');
    if (termsItem) {
        termsItem.addEventListener('click', () => {
            this.showInfoDialog('Terms of Service', 'Welcome to X - The Everything App. By using our services, you agree to these terms...');
        });
    }

    const privacyPolicyItem = document.getElementById('privacyPolicyItem');
    if (privacyPolicyItem) {
        privacyPolicyItem.addEventListener('click', () => {
            this.showInfoDialog('Privacy Policy', 'Your privacy is important to us. This policy explains how we collect and use your data...');
        });
    }

    const helpCenterItem = document.getElementById('helpCenterItem');
    if (helpCenterItem) {
        helpCenterItem.addEventListener('click', () => {
            this.showInfoDialog('Help Center', 'Need help? Contact us at support@x.com or visit our help center online.');
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });
    }
};

XApp.prototype.loadUserPreferences = function () {
    const preferences = this.getData('preferences') || {};
    const userPrefs = preferences[this.currentUser.id] || {
        notifications: true,
        darkMode: true
    };

    const notificationsToggle = document.getElementById('notificationsToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (notificationsToggle) notificationsToggle.checked = userPrefs.notifications;
    if (darkModeToggle) darkModeToggle.checked = userPrefs.darkMode;
};

XApp.prototype.saveUserPreference = function (key, value) {
    const preferences = this.getData('preferences') || {};
    if (!preferences[this.currentUser.id]) {
        preferences[this.currentUser.id] = {};
    }
    preferences[this.currentUser.id][key] = value;
    this.saveData('preferences', preferences);
};

XApp.prototype.showEditProfileDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 500px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--x-border);">
                <h3 style="font-size: 20px; font-weight: 700;">Edit Profile</h3>
            </div>
            <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Name</label>
                    <input type="text" id="editName" value="${this.currentUser.name}" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Username</label>
                    <input type="text" id="editUsername" value="${this.currentUser.username}" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Bio</label>
                    <textarea id="editBio" rows="3" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px; resize: vertical;">${this.currentUser.bio || ''}</textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="btn btn-outline" id="cancelEditProfile" style="flex: 1;">Cancel</button>
                    <button class="btn btn-primary" id="saveEditProfile" style="flex: 1;">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelEditProfile').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('#saveEditProfile').addEventListener('click', () => {
        const name = document.getElementById('editName').value.trim();
        const username = document.getElementById('editUsername').value.trim();
        const bio = document.getElementById('editBio').value.trim();

        if (!name || !username) {
            this.showNotification('Name and username are required', 'error');
            return;
        }

        // Update user data
        const users = this.getData('users') || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].name = name;
            users[userIndex].username = username;
            users[userIndex].bio = bio;
            this.saveData('users', users);
            this.currentUser = users[userIndex];
            this.showNotification('Profile updated successfully', 'success');
            modal.remove();

            // Reload profile view if on profile
            if (this.navigation.currentView === 'profile') {
                this.navigation.loadView('profile', false);
            }
        }
    });
};

XApp.prototype.showChangePasswordDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 400px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--x-border);">
                <h3 style="font-size: 20px; font-weight: 700;">Change Password</h3>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Current Password</label>
                    <input type="password" id="currentPassword" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">New Password</label>
                    <input type="password" id="newPassword" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px; color: var(--x-gray);">Confirm New Password</label>
                    <input type="password" id="confirmPassword" 
                        style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 15px;" />
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="btn btn-outline" id="cancelChangePassword" style="flex: 1;">Cancel</button>
                    <button class="btn btn-primary" id="saveChangePassword" style="flex: 1;">Change Password</button>
                </div>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    modal.querySelector('#cancelChangePassword').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    modal.querySelector('#saveChangePassword').addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('All fields are required', 'error');
            return;
        }

        if (currentPassword !== this.currentUser.password) {
            this.showNotification('Current password is incorrect', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        // Update password
        const users = this.getData('users') || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            this.saveData('users', users);
            this.currentUser = users[userIndex];
            this.showNotification('Password changed successfully', 'success');
            modal.remove();
        }
    });
};

XApp.prototype.showPrivacySafetyDialog = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 400px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--x-border);">
                <h3 style="font-size: 20px; font-weight: 700;">Privacy & Safety</h3>
            </div>
            <div style="padding: 20px;">
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--x-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Private Account</div>
                            <div style="font-size: 13px; color: var(--x-gray);">Only approved followers can see your posts</div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="privateAccountToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--x-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Hide Activity Status</div>
                            <div style="font-size: 13px; color: var(--x-gray);">Don't show when you're online</div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="hideActivityToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--x-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Protect Your Posts</div>
                            <div style="font-size: 13px; color: var(--x-gray);">Require approval for tags and mentions</div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" id="protectPostsToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <button class="btn btn-primary" id="closePrivacyDialog" style="width: 100%; margin-top: 16px;">Done</button>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    // Load privacy settings
    const preferences = this.getData('preferences') || {};
    const userPrefs = preferences[this.currentUser.id] || {};

    modal.querySelector('#privateAccountToggle').checked = userPrefs.privateAccount || false;
    modal.querySelector('#hideActivityToggle').checked = userPrefs.hideActivity || false;
    modal.querySelector('#protectPostsToggle').checked = userPrefs.protectPosts || false;

    // Save handlers
    modal.querySelector('#privateAccountToggle').addEventListener('change', (e) => {
        this.saveUserPreference('privateAccount', e.target.checked);
    });

    modal.querySelector('#hideActivityToggle').addEventListener('change', (e) => {
        this.saveUserPreference('hideActivity', e.target.checked);
    });

    modal.querySelector('#protectPostsToggle').addEventListener('change', (e) => {
        this.saveUserPreference('protectPosts', e.target.checked);
    });

    modal.querySelector('#closePrivacyDialog').addEventListener('click', () => {
        this.showNotification('Privacy settings updated', 'success');
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

XApp.prototype.showInfoDialog = function (title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="background: var(--x-black); border: 1px solid var(--x-border); border-radius: 16px; padding: 0; max-width: 400px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid var(--x-border);">
                <h3 style="font-size: 20px; font-weight: 700;">${title}</h3>
            </div>
            <div style="padding: 20px;">
                <p style="color: var(--x-gray); line-height: 1.6; margin-bottom: 20px;">${content}</p>
                <button class="btn btn-primary" id="closeInfoDialog" style="width: 100%;">Close</button>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7); display: flex;
        align-items: center; justify-content: center;
        z-index: 10000; padding: 20px;
    `;

    document.body.appendChild(modal);

    modal.querySelector('#closeInfoDialog').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};
