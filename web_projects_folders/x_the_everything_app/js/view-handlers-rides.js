// Rides View Handlers

XApp.prototype.initRidesView = function () {
    console.log('Initializing Rides view');

    // Initialize bottom navigation
    this.initBottomNav('rides');

    // Note: Back button is handled globally by navigation.js

    // Generate sample data if needed
    if (!this.getData('ride_types')) {
        this.generateRideTypes();
    }

    // Load recent trips
    this.loadRecentTrips();

    // Find ride button
    const findRideBtn = document.getElementById('findRideBtn');
    if (findRideBtn) {
        findRideBtn.addEventListener('click', () => {
            this.findRide();
        });
    }

    // Suggestion items
    const suggestionItems = document.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
        item.addEventListener('click', () => {
            const location = item.getAttribute('data-location');
            const dropoffInput = document.getElementById('dropoffLocation');
            if (dropoffInput) {
                let address = '';
                if (location === 'Home') address = '123 Main St, New York';
                else if (location === 'Work') address = '456 Office Blvd, New York';
                else if (location === 'Airport') address = 'JFK International Airport';

                dropoffInput.value = address;
            }
        });
    });
};

XApp.prototype.findRide = function () {
    const pickupInput = document.getElementById('pickupLocation');
    const dropoffInput = document.getElementById('dropoffLocation');

    if (!pickupInput || !dropoffInput) return;

    const pickup = pickupInput.value.trim();
    const dropoff = dropoffInput.value.trim();

    if (!dropoff) {
        this.showNotification('Please enter a destination', 'error');
        return;
    }

    // Show ride options
    this.showRideOptions(pickup, dropoff);
};

XApp.prototype.showRideOptions = function (pickup, dropoff) {
    const rideOptionsContainer = document.getElementById('rideOptionsContainer');
    const rideOptionsList = document.getElementById('rideOptionsList');

    if (!rideOptionsContainer || !rideOptionsList) return;

    const rideTypes = this.getData('ride_types') || [];

    // Calculate estimated time and distance (simulated)
    const distance = (Math.random() * 10 + 2).toFixed(1); // 2-12 km
    const baseTime = Math.ceil(distance * 3); // ~3 min per km

    let html = '';

    rideTypes.forEach(rideType => {
        const eta = baseTime + Math.floor(Math.random() * 5); // Add variation
        const price = this.calculateRidePrice(distance, rideType.baseRate, rideType.perKm);
        const hasSurge = Math.random() > 0.7; // 30% chance of surge
        const surgeMultiplier = hasSurge ? (1.2 + Math.random() * 0.5).toFixed(1) : 1;
        const finalPrice = (price * surgeMultiplier).toFixed(2);

        html += '<div class="ride-option" data-ride-type="' + rideType.id + '" data-price="' + finalPrice + '" data-eta="' + eta + '" data-distance="' + distance + '">';
        html += '  <div class="ride-option-icon">' + rideType.icon + '</div>';
        html += '  <div class="ride-option-info">';
        html += '    <div class="ride-option-name">' + rideType.name + '</div>';
        html += '    <div class="ride-option-details">' + rideType.capacity + ' • ' + rideType.description + '</div>';
        html += '    <div class="ride-option-eta">' + eta + ' min away</div>';
        html += '  </div>';
        html += '  <div class="ride-option-price">';
        html += '    <div class="ride-price">$' + finalPrice + '</div>';
        if (hasSurge) {
            html += '    <div class="ride-surge">' + surgeMultiplier + 'x surge</div>';
        }
        html += '  </div>';
        html += '</div>';
    });

    rideOptionsList.innerHTML = html;
    rideOptionsContainer.style.display = 'block';

    // Add click handlers
    const rideOptions = rideOptionsList.querySelectorAll('.ride-option');
    rideOptions.forEach(option => {
        option.addEventListener('click', () => {
            const rideTypeId = option.getAttribute('data-ride-type');
            const price = option.getAttribute('data-price');
            const eta = option.getAttribute('data-eta');
            const distance = option.getAttribute('data-distance');

            this.navigation.loadView('ride-booking', true, {
                rideTypeId: rideTypeId,
                pickup: pickup,
                dropoff: dropoff,
                price: price,
                eta: eta,
                distance: distance
            });
        });
    });
};

XApp.prototype.calculateRidePrice = function (distance, baseRate, perKm) {
    return baseRate + (distance * perKm);
};

XApp.prototype.loadRecentTrips = function () {
    const container = document.getElementById('recentTripsContainer');
    if (!container) return;

    const currentUser = this.currentUser;
    if (!currentUser) {
        container.innerHTML = '<div class="empty-trips"><div class="empty-icon">🚗</div><h3>No trips yet</h3><p>Your ride history will appear here</p></div>';
        return;
    }

    const allTrips = this.getData('ride_history') || {};
    const userTrips = allTrips[currentUser.id] || [];

    if (userTrips.length === 0) {
        container.innerHTML = '<div class="empty-trips"><div class="empty-icon">🚗</div><h3>No trips yet</h3><p>Your ride history will appear here</p></div>';
        return;
    }

    // Sort by date, most recent first
    const sortedTrips = userTrips.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';
    sortedTrips.slice(0, 5).forEach(trip => {
        const tripDate = new Date(trip.date);
        const formattedDate = this.formatTripDate(tripDate);

        html += '<div class="trip-item" data-trip-id="' + trip.id + '">';
        html += '  <div class="trip-route">';
        html += '    <span class="trip-route-text">' + trip.pickup + '</span>';
        html += '    <span class="trip-route-arrow">→</span>';
        html += '    <span class="trip-route-text">' + trip.dropoff + '</span>';
        html += '  </div>';
        html += '  <div class="trip-meta">';
        html += '    <span class="trip-date">' + formattedDate + '</span>';
        html += '    <span class="trip-price">$' + trip.price + '</span>';
        html += '  </div>';
        html += '</div>';
    });

    container.innerHTML = html;
};

XApp.prototype.formatTripDate = function (date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return diffDays + ' days ago';
    } else {
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return month + ' ' + day;
    }
};

// Ride Booking View
XApp.prototype.initRideBookingView = function (params) {
    console.log('Initializing Ride Booking view', params);

    if (!params || !params.rideTypeId) {
        this.showNotification('Invalid ride selection', 'error');
        this.navigation.goBack();
        return;
    }

    // Back button
    const backBtn = document.querySelector('.ride-booking-view .back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Load ride booking details
    this.loadRideBookingDetails(params);

    // Confirm ride button
    const confirmBtn = document.getElementById('confirmRideBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            this.confirmRide(params);
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBookingBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }
};

XApp.prototype.loadRideBookingDetails = function (params) {
    const tripInfoContainer = document.getElementById('tripInfoContainer');
    const walletBalanceDisplay = document.getElementById('walletBalanceDisplay');

    if (!tripInfoContainer) return;

    const rideTypes = this.getData('ride_types') || [];
    const rideType = rideTypes.find(rt => rt.id === params.rideTypeId);

    if (!rideType) {
        this.showNotification('Ride type not found', 'error');
        return;
    }

    // Display wallet balance
    if (walletBalanceDisplay && this.currentUser) {
        const wallets = this.getData('wallets') || {};
        const userWallet = wallets[this.currentUser.id] || { balance: 0 };
        walletBalanceDisplay.textContent = '$' + userWallet.balance.toFixed(2);
    }

    let html = '';

    // Ride type info
    html += '<div class="ride-type-info">';
    html += '  <div class="ride-type-icon">' + rideType.icon + '</div>';
    html += '  <div class="ride-type-details">';
    html += '    <div class="ride-type-name">' + rideType.name + '</div>';
    html += '    <div class="ride-type-capacity">' + rideType.capacity + '</div>';
    html += '  </div>';
    html += '  <div class="ride-type-price">$' + params.price + '</div>';
    html += '</div>';

    // Route
    html += '<div class="trip-route-display">';
    html += '  <div class="trip-location pickup">';
    html += '    <div class="trip-location-icon">📍</div>';
    html += '    <div class="trip-location-text">' + params.pickup + '</div>';
    html += '  </div>';
    html += '  <div class="trip-location dropoff">';
    html += '    <div class="trip-location-icon">🎯</div>';
    html += '    <div class="trip-location-text">' + params.dropoff + '</div>';
    html += '  </div>';
    html += '</div>';

    // Details
    html += '<div class="trip-detail-row">';
    html += '  <span class="trip-detail-label">Distance</span>';
    html += '  <span class="trip-detail-value">' + params.distance + ' km</span>';
    html += '</div>';

    html += '<div class="trip-detail-row">';
    html += '  <span class="trip-detail-label">Estimated Time</span>';
    html += '  <span class="trip-detail-value">' + params.eta + ' min</span>';
    html += '</div>';

    html += '<div class="trip-detail-row">';
    html += '  <span class="trip-detail-label">Total Fare</span>';
    html += '  <span class="trip-detail-value">$' + params.price + '</span>';
    html += '</div>';

    tripInfoContainer.innerHTML = html;
};

XApp.prototype.confirmRide = function (params) {
    if (!this.currentUser) {
        this.showNotification('Please log in to book a ride', 'error');
        return;
    }

    const price = parseFloat(params.price);

    // Check wallet balance
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0, transactions: [] };

    if (userWallet.balance < price) {
        this.showNotification('Insufficient wallet balance', 'error');
        return;
    }

    // Deduct from wallet
    userWallet.balance -= price;

    // Add transaction
    const transaction = {
        id: 'txn_' + Date.now(),
        type: 'debit',
        amount: price,
        description: 'Ride: ' + params.pickup + ' → ' + params.dropoff,
        date: new Date().toISOString(),
        category: 'rides'
    };

    if (!userWallet.transactions) {
        userWallet.transactions = [];
    }
    userWallet.transactions.unshift(transaction);

    wallets[this.currentUser.id] = userWallet;
    this.saveData('wallets', wallets);

    // Save ride to history
    const allTrips = this.getData('ride_history') || {};
    if (!allTrips[this.currentUser.id]) {
        allTrips[this.currentUser.id] = [];
    }

    const rideTypes = this.getData('ride_types') || [];
    const rideType = rideTypes.find(rt => rt.id === params.rideTypeId);

    const trip = {
        id: 'trip_' + Date.now(),
        pickup: params.pickup,
        dropoff: params.dropoff,
        rideType: rideType ? rideType.name : 'Unknown',
        price: params.price,
        distance: params.distance,
        duration: params.eta,
        date: new Date().toISOString(),
        status: 'completed'
    };

    allTrips[this.currentUser.id].unshift(trip);
    this.saveData('ride_history', allTrips);

    this.showNotification('Ride booked successfully! Your driver is on the way.', 'success');

    // Navigate back to rides view
    setTimeout(() => {
        this.navigation.loadView('rides');
    }, 1500);
};

XApp.prototype.generateRideTypes = function () {
    const rideTypes = [
        {
            id: 'x-standard',
            name: 'X Standard',
            icon: '🚗',
            capacity: 'Up to 4 passengers',
            description: 'Affordable rides',
            baseRate: 3.00,
            perKm: 1.50
        },
        {
            id: 'x-comfort',
            name: 'X Comfort',
            icon: '🚙',
            capacity: 'Up to 4 passengers',
            description: 'Newer cars with extra legroom',
            baseRate: 5.00,
            perKm: 2.00
        },
        {
            id: 'x-xl',
            name: 'X XL',
            icon: '🚐',
            capacity: 'Up to 6 passengers',
            description: 'Larger vehicles for groups',
            baseRate: 6.00,
            perKm: 2.50
        },
        {
            id: 'x-premium',
            name: 'X Premium',
            icon: '🚘',
            capacity: 'Up to 4 passengers',
            description: 'Luxury vehicles',
            baseRate: 10.00,
            perKm: 3.50
        },
        {
            id: 'x-bike',
            name: 'X Bike',
            icon: '🏍️',
            capacity: '1 passenger',
            description: 'Quick and affordable',
            baseRate: 2.00,
            perKm: 0.80
        }
    ];

    this.saveData('ride_types', rideTypes);
};
