// Events View Handler
XApp.prototype.initEventsView = function () {
    console.log('Initializing events view');

    // Initialize bottom navigation
    this.initBottomNav('events');

    // Note: Back button is handled globally by navigation.js

    // Initialize events data if not exists
    if (!this.getData('events')) {
        this.saveData('events', this.generateSampleEvents());
    }

    // Initialize user event registrations
    const currentUser = this.getData('currentUser');
    if (!this.getData('eventRegistrations')) {
        this.saveData('eventRegistrations', {});
    }

    if (!this.getData('interestedEvents')) {
        this.saveData('interestedEvents', {});
    }

    // Setup search
    const searchInput = document.getElementById('eventSearchInput');
    const searchBtn = document.getElementById('eventsSearchBtn');
    const filterBtn = document.getElementById('filterEventsBtn');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            this.filterEvents();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.focus();
            }
        });
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            this.showEventFiltersDialog();
        });
    }

    // Setup filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.filterEvents(chip.dataset.filter);
        });
    });

    // Load events
    this.loadEvents();
};

XApp.prototype.loadEvents = function (filter = 'all') {
    const container = document.getElementById('eventListingsContainer');
    if (!container) return;

    let events = this.getData('events') || [];
    const now = new Date();

    // Apply filter
    if (filter !== 'all') {
        events = events.filter(event => {
            const eventDate = new Date(event.date);
            if (filter === 'today') {
                return eventDate.toDateString() === now.toDateString();
            }
            if (filter === 'this-week') {
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= now && eventDate <= weekFromNow;
            }
            if (filter === 'online') return event.isOnline;
            if (filter === 'free') return event.isFree;
            return true;
        });
    }

    if (events.length === 0) {
        container.innerHTML = '<div class="empty-events"><div class="empty-icon">🎉</div><h3>No events found</h3><p>Try adjusting your filters</p></div>';
        return;
    }

    container.innerHTML = events.map(event => this.renderEventCard(event)).join('');

    // Add click handlers
    const eventCards = container.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            this.navigation.loadView('event-detail', true, { eventId: eventId });
        });
    });
};

XApp.prototype.renderEventCard = function (event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    const dateBadgeClass = isToday ? 'today' : 'upcoming';
    const dateText = this.formatEventDate(event.date);

    const freeTag = event.isFree ? '<span class="event-tag free">Free</span>' : '';
    const onlineTag = event.isOnline ? '<span class="event-tag online">Online</span>' : '';
    const priceText = event.isFree ? 'Free' : event.price;
    const priceClass = event.isFree ? 'free' : '';

    return '<div class="event-card" data-event-id="' + event.id + '">' +
        '<div class="event-image">' + event.icon + '</div>' +
        '<div class="event-date-badge ' + dateBadgeClass + '">' + dateText + '</div>' +
        '<div class="event-title">' + event.title + '</div>' +
        '<div class="event-meta">' +
        '<div class="event-meta-item">' +
        '<span class="event-meta-icon">📅</span>' +
        '<span>' + this.formatEventDateTime(event.date, event.time) + '</span>' +
        '</div>' +
        '<div class="event-meta-item">' +
        '<span class="event-meta-icon">📍</span>' +
        '<span>' + event.location + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="event-description">' + event.description + '</div>' +
        '<div class="event-tags">' +
        freeTag +
        onlineTag +
        event.tags.map(tag => '<span class="event-tag">' + tag + '</span>').join('') +
        '</div>' +
        '<div class="event-footer">' +
        '<div class="event-attendees">' + event.attendees + ' attending</div>' +
        '<div class="event-price ' + priceClass + '">' + priceText + '</div>' +
        '</div>' +
        '</div>';
};

XApp.prototype.filterEvents = function (filterType) {
    const searchInput = document.getElementById('eventSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let events = this.getData('events') || [];
    const now = new Date();

    // Apply type filter
    if (filterType && filterType !== 'all') {
        events = events.filter(event => {
            const eventDate = new Date(event.date);
            if (filterType === 'today') {
                return eventDate.toDateString() === now.toDateString();
            }
            if (filterType === 'this-week') {
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= now && eventDate <= weekFromNow;
            }
            if (filterType === 'online') return event.isOnline;
            if (filterType === 'free') return event.isFree;
            return true;
        });
    }

    // Apply search filter
    if (searchTerm) {
        events = events.filter(event => {
            return event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm) ||
                event.location.toLowerCase().includes(searchTerm) ||
                event.organizer.toLowerCase().includes(searchTerm);
        });
    }

    const container = document.getElementById('eventListingsContainer');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '<div class="empty-events"><div class="empty-icon">🎉</div><h3>No events found</h3><p>Try adjusting your search or filters</p></div>';
        return;
    }

    container.innerHTML = events.map(event => this.renderEventCard(event)).join('');

    // Add click handlers
    const eventCards = container.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            this.navigation.loadView('event-detail', true, { eventId: eventId });
        });
    });
};

XApp.prototype.formatEventDate = function (dateString) {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return 'Today';
    }

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }

    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

XApp.prototype.formatEventDateTime = function (dateString, timeString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options) + ' at ' + timeString;
};

XApp.prototype.showEventFiltersDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    dialog.innerHTML = '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h3>Event Filters</h3>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Category</label>' +
        '<select id="filterCategory" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">All Categories</option>' +
        '<option value="music">Music</option>' +
        '<option value="tech">Tech</option>' +
        '<option value="business">Business</option>' +
        '<option value="sports">Sports</option>' +
        '<option value="arts">Arts & Culture</option>' +
        '<option value="food">Food & Drink</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Date Range</label>' +
        '<select id="filterDateRange" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">Any Time</option>' +
        '<option value="today">Today</option>' +
        '<option value="tomorrow">Tomorrow</option>' +
        '<option value="this-week">This Week</option>' +
        '<option value="this-month">This Month</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Price</label>' +
        '<select id="filterPrice" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white);">' +
        '<option value="">Any Price</option>' +
        '<option value="free">Free</option>' +
        '<option value="paid">Paid</option>' +
        '</select>' +
        '</div>' +
        '<button id="applyFiltersBtn" style="width: 100%; background: var(--x-blue); color: var(--x-white); border: none; padding: 14px; border-radius: 24px; font-size: 15px; font-weight: 700; cursor: pointer;">Apply Filters</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            document.body.removeChild(dialog);
        }
    });

    const applyBtn = dialog.querySelector('#applyFiltersBtn');
    applyBtn.addEventListener('click', () => {
        this.showNotification('Filters applied');
        document.body.removeChild(dialog);
    });
};

// Event Detail View Handler
XApp.prototype.initEventDetailView = function (params) {
    console.log('Initializing event detail view');

    // Initialize bottom navigation
    this.initBottomNav('events');

    // Setup back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    const eventId = params?.eventId;
    if (!eventId) {
        this.navigation.loadView('events');
        return;
    }

    const events = this.getData('events') || [];
    const event = events.find(e => e.id === eventId);

    if (!event) {
        this.navigation.loadView('events');
        return;
    }

    const container = document.getElementById('eventDetailContent');
    if (!container) return;

    const currentUser = this.getData('currentUser');
    const registrations = this.getData('eventRegistrations') || {};
    const interested = this.getData('interestedEvents') || {};
    const isRegistered = registrations[currentUser]?.includes(eventId);
    const isInterested = interested[currentUser]?.includes(eventId);

    container.innerHTML = this.renderEventDetail(event, isRegistered, isInterested);

    // Setup register button
    const registerBtn = document.getElementById('registerEventBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            this.toggleEventRegistration(event.id);
        });
    }

    // Setup interested button
    const interestedBtn = document.getElementById('interestedEventBtn');
    if (interestedBtn) {
        interestedBtn.addEventListener('click', () => {
            this.toggleEventInterest(event.id);
        });
    }

    // Setup share button
    const shareBtn = document.getElementById('shareEventBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            this.showNotification('Share link copied to clipboard');
        });
    }
};

XApp.prototype.renderEventDetail = function (event, isRegistered, isInterested) {
    const freeTag = event.isFree ? '<span class="event-tag free">Free</span>' : '';
    const onlineTag = event.isOnline ? '<span class="event-tag online">Online</span>' : '';
    const registerText = isRegistered ? 'Registered ✓' : 'Register Now';
    const registerClass = isRegistered ? 'registered' : '';
    const interestedIcon = isInterested ? '⭐' : '☆';
    const interestedClass = isInterested ? 'active' : '';
    const priceText = event.isFree ? 'Free' : event.price;

    return '<div class="event-detail-image">' + event.icon + '</div>' +
        '<div class="event-detail-content">' +
        '<div class="event-detail-date">' + this.formatEventDate(event.date) + '</div>' +
        '<div class="event-detail-title">' + event.title + '</div>' +
        '<div class="event-detail-meta">' +
        '<div class="event-detail-meta-item">' +
        '<span class="event-detail-meta-icon">📅</span>' +
        '<div class="event-detail-meta-text">' +
        '<div class="event-detail-meta-label">Date & Time</div>' +
        '<div class="event-detail-meta-value">' + this.formatEventDateTime(event.date, event.time) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="event-detail-meta-item">' +
        '<span class="event-detail-meta-icon">📍</span>' +
        '<div class="event-detail-meta-text">' +
        '<div class="event-detail-meta-label">Location</div>' +
        '<div class="event-detail-meta-value">' + event.location + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="event-detail-meta-item">' +
        '<span class="event-detail-meta-icon">💰</span>' +
        '<div class="event-detail-meta-text">' +
        '<div class="event-detail-meta-label">Price</div>' +
        '<div class="event-detail-meta-value">' + priceText + '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="event-detail-section">' +
        '<h3>About This Event</h3>' +
        '<p>' + event.description + '</p>' +
        '<p>' + event.fullDescription + '</p>' +
        '</div>' +
        '<div class="event-detail-tags">' +
        freeTag +
        onlineTag +
        event.tags.map(tag => '<span class="event-tag">' + tag + '</span>').join('') +
        '</div>' +
        '<div class="event-organizer">' +
        '<div class="event-organizer-avatar">' + event.organizerIcon + '</div>' +
        '<div class="event-organizer-info">' +
        '<div class="event-organizer-label">Organized by</div>' +
        '<div class="event-organizer-name">' + event.organizer + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="event-attendees-section">' +
        '<div class="event-attendees-header">' +
        '<div class="event-attendees-count">' + event.attendees + ' people attending</div>' +
        '</div>' +
        '<div class="event-attendees-avatars">' +
        '<div class="attendee-avatar">👤</div>' +
        '<div class="attendee-avatar">👤</div>' +
        '<div class="attendee-avatar">👤</div>' +
        '<div class="attendee-avatar">👤</div>' +
        '<div class="attendee-avatar">👤</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="event-actions">' +
        '<button id="registerEventBtn" class="btn-register ' + registerClass + '">' + registerText + '</button>' +
        '<button id="interestedEventBtn" class="btn-interested ' + interestedClass + '">' + interestedIcon + '</button>' +
        '</div>';
};

XApp.prototype.toggleEventRegistration = function (eventId) {
    const currentUser = this.getData('currentUser');
    const registrations = this.getData('eventRegistrations') || {};

    if (!registrations[currentUser]) {
        registrations[currentUser] = [];
    }

    const index = registrations[currentUser].indexOf(eventId);
    if (index > -1) {
        registrations[currentUser].splice(index, 1);
        this.showNotification('Registration cancelled');
    } else {
        registrations[currentUser].push(eventId);
        this.showNotification('Successfully registered!');
    }

    this.saveData('eventRegistrations', registrations);

    // Update button
    const registerBtn = document.getElementById('registerEventBtn');
    if (registerBtn) {
        if (index > -1) {
            registerBtn.classList.remove('registered');
            registerBtn.textContent = 'Register Now';
        } else {
            registerBtn.classList.add('registered');
            registerBtn.textContent = 'Registered ✓';
        }
    }
};

XApp.prototype.toggleEventInterest = function (eventId) {
    const currentUser = this.getData('currentUser');
    const interested = this.getData('interestedEvents') || {};

    if (!interested[currentUser]) {
        interested[currentUser] = [];
    }

    const index = interested[currentUser].indexOf(eventId);
    if (index > -1) {
        interested[currentUser].splice(index, 1);
        this.showNotification('Removed from interested');
    } else {
        interested[currentUser].push(eventId);
        this.showNotification('Added to interested');
    }

    this.saveData('interestedEvents', interested);

    // Update button
    const interestedBtn = document.getElementById('interestedEventBtn');
    if (interestedBtn) {
        if (index > -1) {
            interestedBtn.classList.remove('active');
            interestedBtn.textContent = '☆';
        } else {
            interestedBtn.classList.add('active');
            interestedBtn.textContent = '⭐';
        }
    }
};

// Generate Sample Events
XApp.prototype.generateSampleEvents = function () {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
        {
            id: 'event1',
            title: 'Tech Summit 2025',
            icon: '💻',
            date: tomorrow.toISOString().split('T')[0],
            time: '9:00 AM',
            location: 'San Francisco Convention Center',
            isOnline: false,
            isFree: false,
            price: '$299',
            description: 'Join industry leaders for a day of innovation and networking at the premier tech conference of the year.',
            fullDescription: 'The Tech Summit brings together the brightest minds in technology for keynotes, workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and cloud computing.',
            organizer: 'Tech Events Inc.',
            organizerIcon: '🏢',
            attendees: 1250,
            tags: ['Technology', 'Networking', 'Conference']
        },
        {
            id: 'event2',
            title: 'Live Jazz Night',
            icon: '🎷',
            date: today.toISOString().split('T')[0],
            time: '8:00 PM',
            location: 'Blue Note Jazz Club, NYC',
            isOnline: false,
            isFree: false,
            price: '$45',
            description: 'An evening of smooth jazz featuring renowned artists and local talent.',
            fullDescription: 'Experience the magic of live jazz with performances from award-winning musicians. Enjoy craft cocktails and a sophisticated atmosphere at one of NYC\'s most iconic jazz venues.',
            organizer: 'Blue Note Entertainment',
            organizerIcon: '🎵',
            attendees: 180,
            tags: ['Music', 'Jazz', 'Nightlife']
        },
        {
            id: 'event3',
            title: 'Community Yoga & Wellness',
            icon: '🧘',
            date: tomorrow.toISOString().split('T')[0],
            time: '7:00 AM',
            location: 'Central Park, New York',
            isOnline: false,
            isFree: true,
            price: 'Free',
            description: 'Free outdoor yoga session for all levels. Bring your mat and join our community!',
            fullDescription: 'Start your day with mindfulness and movement. Our certified instructors will guide you through a rejuvenating yoga flow suitable for all experience levels. All are welcome!',
            organizer: 'NYC Wellness Community',
            organizerIcon: '🌿',
            attendees: 320,
            tags: ['Wellness', 'Yoga', 'Outdoors']
        },
        {
            id: 'event4',
            title: 'Startup Pitch Competition',
            icon: '🚀',
            date: nextWeek.toISOString().split('T')[0],
            time: '2:00 PM',
            location: 'Online via Zoom',
            isOnline: true,
            isFree: true,
            price: 'Free',
            description: 'Watch innovative startups pitch their ideas to leading venture capitalists.',
            fullDescription: 'The ultimate platform for early-stage startups to showcase their vision. Top 10 finalists will compete for $100K in funding. Network with investors and entrepreneurs from around the world.',
            organizer: 'Startup Accelerator',
            organizerIcon: '💡',
            attendees: 890,
            tags: ['Business', 'Startups', 'Virtual']
        },
        {
            id: 'event5',
            title: 'Food & Wine Festival',
            icon: '🍷',
            date: nextWeek.toISOString().split('T')[0],
            time: '12:00 PM',
            location: 'Napa Valley, CA',
            isOnline: false,
            isFree: false,
            price: '$150',
            description: 'Taste premium wines and gourmet dishes from world-class chefs and vintners.',
            fullDescription: 'Indulge in a curated selection of wines from local vineyards paired with artisanal cuisine. Meet the winemakers, attend cooking demonstrations, and enjoy live entertainment.',
            organizer: 'Napa Culinary Association',
            organizerIcon: '👨‍🍳',
            attendees: 450,
            tags: ['Food', 'Wine', 'Festival']
        },
        {
            id: 'event6',
            title: 'Marathon Training Workshop',
            icon: '🏃',
            date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '6:00 AM',
            location: 'Riverside Park Track',
            isOnline: false,
            isFree: true,
            price: 'Free',
            description: 'Professional coaching session for marathon preparation. All fitness levels welcome!',
            fullDescription: 'Join our experienced running coaches for technique training, injury prevention tips, and nutrition advice. Whether you\'re training for your first marathon or your tenth, we\'ll help you reach your goals.',
            organizer: 'City Runners Club',
            organizerIcon: '⚡',
            attendees: 215,
            tags: ['Sports', 'Running', 'Fitness']
        },
        {
            id: 'event7',
            title: 'Digital Art Exhibition',
            icon: '🎨',
            date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '6:00 PM',
            location: 'Modern Art Museum, LA',
            isOnline: false,
            isFree: false,
            price: '$25',
            description: 'Explore the intersection of technology and creativity with NFT artists and digital creators.',
            fullDescription: 'An immersive experience showcasing cutting-edge digital art, NFT collections, and interactive installations. Meet the artists and learn about the future of art in the digital age.',
            organizer: 'Digital Arts Collective',
            organizerIcon: '🖼️',
            attendees: 380,
            tags: ['Art', 'NFT', 'Digital']
        },
        {
            id: 'event8',
            title: 'Coding Bootcamp: Python Basics',
            icon: '🐍',
            date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '10:00 AM',
            location: 'Online via Google Meet',
            isOnline: true,
            isFree: true,
            price: 'Free',
            description: 'Learn Python programming from scratch in this hands-on workshop for beginners.',
            fullDescription: 'A comprehensive 4-hour workshop covering Python fundamentals, data structures, and practical applications. Perfect for absolute beginners or those looking to refresh their skills.',
            organizer: 'Code Academy Online',
            organizerIcon: '📚',
            attendees: 620,
            tags: ['Education', 'Programming', 'Virtual']
        }
    ];
};
