/* ===================================
   VIEW HANDLERS - Part 1
   Authentication and Main Views
   =================================== */

/* ===================================
   SPLASH SCREEN
   =================================== */

XApp.prototype.initSplashView = function() {
    console.log('Splash view initialized');
    
    // Auto-navigate to login after 2 seconds
    setTimeout(() => {
        this.navigation.loadView('login');
    }, 2000);
};

/* ===================================
   LOGIN VIEW
   =================================== */

XApp.prototype.initLoginView = function() {
    console.log('Login view initialized');
    
    const loginForm = document.getElementById('loginForm');
    const signupLink = document.getElementById('signupLink');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            const result = this.login(username, password);
            
            if (result.success) {
                this.showNotification('Login successful!', 'success');
                this.navigation.loadView('home');
            } else {
                this.showNotification(result.error, 'error');
            }
        });
    }
    
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigation.loadView('signup');
        });
    }
};

/* ===================================
   SIGNUP VIEW
   =================================== */

XApp.prototype.initSignupView = function() {
    console.log('Signup view initialized');
    
    const signupForm = document.getElementById('signupForm');
    const loginLink = document.getElementById('loginLink');
    
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!name || !username || !email || !password) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showNotification('Please enter a valid email', 'error');
                return;
            }
            
            // Username validation (alphanumeric and underscores only)
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                this.showNotification('Username can only contain letters, numbers, and underscores', 'error');
                return;
            }
            
            const result = this.signup({ name, username, email, password });
            
            if (result.success) {
                this.showNotification('Account created successfully!', 'success');
                this.createSession(result.user);
                this.navigation.loadView('home');
            } else {
                this.showNotification(result.error, 'error');
            }
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigation.loadView('login');
        });
    }
};

/* ===================================
   HOME FEED VIEW
   =================================== */

XApp.prototype.initHomeView = function() {
    console.log('Home view initialized');
    
    this.initBottomNav('home');
    
    // Load and display posts
    this.loadFeed();
    
    // Compose button
    const composeBtn = document.getElementById('composeBtn');
    if (composeBtn) {
        composeBtn.addEventListener('click', () => {
            this.navigation.loadView('compose');
        });
    }
    
    // Feed tabs
    const feedTabs = document.querySelectorAll('.feed-tab');
    feedTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            feedTabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');
            
            const tabType = tab.dataset.tab;
            if (tabType === 'following') {
                this.loadFollowingFeed();
            } else {
                this.loadFeed();
            }
        });
    });
};

/* ===================================
   PROFILE VIEW
   =================================== */

XApp.prototype.initProfileView = function(data) {
    console.log('Profile view initialized');
    
    this.initBottomNav('profile');
    
    const user = data && data.userId 
        ? this.getUserById(data.userId) 
        : this.currentUser;
    
    if (!user) {
        this.showNotification('User not found', 'error');
        this.navigation.goBack();
        return;
    }
    
    // Store current profile user for tab switching
    this.currentProfileUser = user;
    
    // Display user info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileBio').textContent = user.bio || 'No bio yet';
    document.getElementById('followersCount').textContent = this.formatNumber(user.followers.length);
    document.getElementById('followingCount').textContent = this.formatNumber(user.following.length);
    
    // Settings button (only for own profile)
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        if (user.id === this.currentUser.id) {
            settingsBtn.style.display = 'block';
            settingsBtn.addEventListener('click', () => {
                this.navigation.loadView('settings');
            });
        } else {
            settingsBtn.style.display = 'none';
        }
    }
    
    // Edit Profile button (only for own profile)
    const editProfileBtn = document.querySelector('.btn-edit-profile');
    if (editProfileBtn) {
        if (user.id === this.currentUser.id) {
            editProfileBtn.style.display = 'block';
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfileDialog();
            });
        } else {
            editProfileBtn.style.display = 'none';
        }
    }
    
    // Profile tabs
    const tabBtns = document.querySelectorAll('.profile-tabs .tab-btn');
    tabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabBtns.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabType = tab.dataset.tab;
            this.loadProfileTab(tabType, user.id);
        });
    });
    
    // Load initial tab (posts)
    this.loadProfileTab('posts', user.id);
};

XApp.prototype.loadProfileTab = function(tabType, userId) {
    const container = document.getElementById('userPostsContainer');
    if (!container) return;
    
    const allPosts = this.getData('posts') || [];
    
    switch(tabType) {
        case 'posts':
            this.loadUserPosts(userId);
            break;
            
        case 'replies':
            const replies = allPosts.filter(post => 
                post.userId === userId && post.replyTo
            );
            this.renderPostsInContainer(replies, container);
            break;
            
        case 'media':
            const mediaPosts = allPosts.filter(post => 
                post.userId === userId && post.image
            );
            this.renderPostsInContainer(mediaPosts, container);
            break;
            
        case 'likes':
            const likedPosts = allPosts.filter(post => 
                post.likes && post.likes.includes(userId)
            );
            this.renderPostsInContainer(likedPosts, container);
            break;
    }
};

XApp.prototype.renderPostsInContainer = function(posts, container) {
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 60px 40px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 16px;">📭</div>
                <h3 style="font-size: 18px; margin-bottom: 8px;">No posts here</h3>
                <p style="color: var(--x-gray); font-size: 14px;">Nothing to see yet</p>
            </div>
        `;
        return;
    }
    
    // Sort by date
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = posts.map(post => {
        const user = this.getUserById(post.userId);
        if (!user) return '';
        
        const isLiked = post.likes.includes(this.currentUser.id);
        const isRetweeted = post.retweets.includes(this.currentUser.id);
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">${user.profileImage || '👤'}</div>
                    <div class="post-user-info">
                        <div class="post-name">
                            ${user.name}
                            ${user.verified ? '<span style="color: var(--x-blue);">✓</span>' : ''}
                            <span class="post-username">@${user.username} · ${this.formatRelativeTime(post.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image" /></div>` : ''}
                <div class="post-actions">
                    <button class="post-action-btn reply-btn" data-post-id="${post.id}">
                        💬 <span>${post.replies.length || ''}</span>
                    </button>
                    <button class="post-action-btn retweet-btn ${isRetweeted ? 'active' : ''}" data-post-id="${post.id}">
                        🔁 <span>${post.retweets.length || ''}</span>
                    </button>
                    <button class="post-action-btn like-btn ${isLiked ? 'active' : ''}" data-post-id="${post.id}">
                        ${isLiked ? '❤️' : '🤍'} <span>${post.likes.length || ''}</span>
                    </button>
                    <button class="post-action-btn share-btn" data-post-id="${post.id}">
                        📤
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners
    this.attachPostEventListeners();
};

/* ===================================
   NOTIFICATION HELPER
   =================================== */

XApp.prototype.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#F4212E' : type === 'success' ? '#00BA7C' : '#1D9BF0'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

/* ===================================
   BOTTOM NAVIGATION HELPER
   =================================== */

XApp.prototype.initBottomNav = function(activeView) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        // Remove active class from all
        item.classList.remove('active');
        
        // Add active class to current view
        if (item.dataset.view === activeView) {
            item.classList.add('active');
        }
        
        // Add click handler
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            if (viewName && viewName !== this.navigation.currentView) {
                this.navigation.loadView(viewName);
            }
        });
    });
};

/* ===================================
   SETTINGS VIEW
   =================================== */

XApp.prototype.initSettingsView = function() {
    console.log('Settings view initialized');
    
    // Load user preferences
    this.loadUserPreferences();
    
    // Edit Profile
    const editProfileItem = document.getElementById('editProfileItem');
    console.log('editProfileItem:', editProfileItem);
    if (editProfileItem) {
        editProfileItem.addEventListener('click', () => {
            console.log('Edit profile clicked');
            this.showEditProfileDialog();
        });
    }
    
    // Change Password
    const changePasswordItem = document.getElementById('changePasswordItem');
    console.log('changePasswordItem:', changePasswordItem);
    if (changePasswordItem) {
        changePasswordItem.addEventListener('click', () => {
            console.log('Change password clicked');
            this.showChangePasswordDialog();
        });
    }
    
    // Privacy & Safety
    const privacySafetyItem = document.getElementById('privacySafetyItem');
    console.log('privacySafetyItem:', privacySafetyItem);
    if (privacySafetyItem) {
        privacySafetyItem.addEventListener('click', () => {
            console.log('Privacy & safety clicked');
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

XApp.prototype.loadUserPreferences = function() {
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

XApp.prototype.saveUserPreference = function(key, value) {
    const preferences = this.getData('preferences') || {};
    if (!preferences[this.currentUser.id]) {
        preferences[this.currentUser.id] = {};
    }
    preferences[this.currentUser.id][key] = value;
    this.saveData('preferences', preferences);
};

XApp.prototype.showEditProfileDialog = function() {
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

XApp.prototype.showChangePasswordDialog = function() {
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

XApp.prototype.showPrivacySafetyDialog = function() {
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

XApp.prototype.showInfoDialog = function(title, content) {
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

