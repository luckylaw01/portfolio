// Government Services View Handlers

XApp.prototype.initGovernmentView = function () {
    console.log('Initializing Government Services view');

    // Initialize bottom navigation
    this.initBottomNav('government');

    // Note: Back button is handled globally by navigation.js

    // Generate sample data if needed
    if (!this.getData('government_services')) {
        this.generateGovernmentServices();
    }

    // Search functionality
    const searchInput = document.getElementById('governmentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.filterGovernmentServices(e.target.value);
        });
    }

    // Category filters
    const categoryButtons = document.querySelectorAll('.service-category');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            this.loadServicesByCategory(category);
        });
    });

    // Load initial services
    this.loadServicesByCategory('all');
    this.loadUserApplications();
};

XApp.prototype.loadServicesByCategory = function (category) {
    const container = document.getElementById('servicesContainer');
    const categoryTitle = document.getElementById('servicesCategoryTitle');

    if (!container) return;

    const services = this.getData('government_services') || [];

    let filtered = services;
    if (category !== 'all') {
        filtered = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Update title
    if (categoryTitle) {
        if (category === 'all') {
            categoryTitle.textContent = 'All Services';
        } else {
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Services';
        }
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-applications"><div class="empty-icon">🏛️</div><h3>No services found</h3><p>Try a different category</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(service => {
        html += '<div class="service-item" data-service-id="' + service.id + '">';
        html += '  <div class="service-item-icon">' + service.icon + '</div>';
        html += '  <div class="service-item-info">';
        html += '    <div class="service-item-name">' + service.name + '</div>';
        html += '    <div class="service-item-desc">' + service.description + '</div>';
        html += '    <div class="service-item-meta">';
        html += '      <span class="service-fee">' + (service.fee === 0 ? 'Free' : '$' + service.fee) + '</span>';
        html += '      <span>•</span>';
        html += '      <span class="service-time">' + service.processingTime + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="service-item-arrow">›</div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const serviceItems = container.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceId = item.getAttribute('data-service-id');
            this.navigation.loadView('service-detail', true, { serviceId: serviceId });
        });
    });
};

XApp.prototype.filterGovernmentServices = function (searchTerm) {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    const services = this.getData('government_services') || [];

    if (!searchTerm.trim()) {
        this.loadServicesByCategory('all');
        return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = services.filter(service =>
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-applications"><div class="empty-icon">🔍</div><h3>No services found</h3><p>Try different keywords</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(service => {
        html += '<div class="service-item" data-service-id="' + service.id + '">';
        html += '  <div class="service-item-icon">' + service.icon + '</div>';
        html += '  <div class="service-item-info">';
        html += '    <div class="service-item-name">' + service.name + '</div>';
        html += '    <div class="service-item-desc">' + service.description + '</div>';
        html += '    <div class="service-item-meta">';
        html += '      <span class="service-fee">' + (service.fee === 0 ? 'Free' : '$' + service.fee) + '</span>';
        html += '      <span>•</span>';
        html += '      <span class="service-time">' + service.processingTime + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="service-item-arrow">›</div>';
        html += '</div>';
    });

    container.innerHTML = html;

    // Add click handlers
    const serviceItems = container.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('click', () => {
            const serviceId = item.getAttribute('data-service-id');
            this.navigation.loadView('service-detail', true, { serviceId: serviceId });
        });
    });
};

XApp.prototype.loadUserApplications = function () {
    const container = document.getElementById('applicationsContainer');
    if (!container) return;

    const currentUser = this.currentUser;
    if (!currentUser) {
        container.innerHTML = '<div class="empty-applications"><div class="empty-icon">📋</div><h3>No applications</h3><p>Sign in to view your applications</p></div>';
        return;
    }

    const allApplications = this.getData('government_applications') || {};
    const userApplications = allApplications[currentUser.id] || [];

    if (userApplications.length === 0) {
        container.innerHTML = '<div class="empty-applications"><div class="empty-icon">📋</div><h3>No applications yet</h3><p>Your applications will appear here</p></div>';
        return;
    }

    let html = '';
    userApplications.slice(0, 5).forEach(app => {
        html += '<div class="application-item">';
        html += '  <div class="application-header">';
        html += '    <div class="application-name">' + app.serviceName + '</div>';
        html += '    <span class="application-status ' + app.status + '">' + app.status + '</span>';
        html += '  </div>';
        html += '  <div class="application-id">ID: ' + app.id + '</div>';
        html += '  <div class="application-date">Applied: ' + this.formatApplicationDate(app.appliedDate) + '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
};

XApp.prototype.formatApplicationDate = function (dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return month + ' ' + day + ', ' + year;
};

// Service Detail View
XApp.prototype.initServiceDetailView = function (params) {
    console.log('Initializing Service Detail view', params);

    if (!params || !params.serviceId) {
        this.showNotification('Service not found', 'error');
        this.navigation.goBack();
        return;
    }

    // Back button
    const backBtn = document.querySelector('.service-detail-view .back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    // Load service details
    this.loadServiceDetail(params.serviceId);
};

XApp.prototype.loadServiceDetail = function (serviceId) {
    const container = document.getElementById('serviceDetailContainer');
    if (!container) return;

    const services = this.getData('government_services') || [];
    const service = services.find(s => s.id === serviceId);

    if (!service) {
        this.showNotification('Service not found', 'error');
        this.navigation.goBack();
        return;
    }

    let html = '';

    // Service header
    html += '<div class="service-detail-header">';
    html += '  <div class="service-detail-icon">' + service.icon + '</div>';
    html += '  <h1 class="service-detail-title">' + service.name + '</h1>';
    html += '  <div class="service-detail-category">' + service.category + '</div>';
    html += '</div>';

    // Description
    html += '<div class="service-info-section">';
    html += '  <div class="info-section-title">Description</div>';
    html += '  <div class="info-section-content">' + service.fullDescription + '</div>';
    html += '</div>';

    // Details
    html += '<div class="service-info-section">';
    html += '  <div class="info-section-title">Service Details</div>';
    html += '  <div class="info-row">';
    html += '    <span class="info-label">Processing Time</span>';
    html += '    <span class="info-value">' + service.processingTime + '</span>';
    html += '  </div>';
    html += '  <div class="info-row">';
    html += '    <span class="info-label">Service Fee</span>';
    html += '    <span class="info-value">' + (service.fee === 0 ? 'Free' : '$' + service.fee) + '</span>';
    html += '  </div>';
    html += '  <div class="info-row">';
    html += '    <span class="info-label">Validity</span>';
    html += '    <span class="info-value">' + service.validity + '</span>';
    html += '  </div>';
    html += '</div>';

    // Requirements
    html += '<div class="service-info-section">';
    html += '  <div class="info-section-title">Requirements</div>';
    html += '  <ul class="requirements-list">';
    service.requirements.forEach(req => {
        html += '    <li class="requirement-item"><span class="requirement-text">' + req + '</span></li>';
    });
    html += '  </ul>';
    html += '</div>';

    // Apply button
    html += '<div class="service-actions">';
    html += '  <button id="applyServiceBtn" class="btn-apply-service">Apply for Service</button>';
    html += '</div>';

    container.innerHTML = html;

    // Apply button handler
    const applyBtn = document.getElementById('applyServiceBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            this.applyForService(service);
        });
    }
};

XApp.prototype.applyForService = function (service) {
    if (!this.currentUser) {
        this.showNotification('Please log in to apply for services', 'error');
        return;
    }

    // Check wallet balance for paid services
    if (service.fee > 0) {
        const wallets = this.getData('wallets') || {};
        const userWallet = wallets[this.currentUser.id] || { balance: 0 };

        if (userWallet.balance < service.fee) {
            this.showNotification('Insufficient wallet balance', 'error');
            return;
        }

        // Deduct fee
        userWallet.balance -= service.fee;

        // Add transaction
        const transaction = {
            id: 'txn_' + Date.now(),
            type: 'debit',
            amount: service.fee,
            description: 'Government Service: ' + service.name,
            date: new Date().toISOString(),
            category: 'government'
        };

        if (!userWallet.transactions) {
            userWallet.transactions = [];
        }
        userWallet.transactions.unshift(transaction);

        wallets[this.currentUser.id] = userWallet;
        this.saveData('wallets', wallets);
    }

    // Create application
    const allApplications = this.getData('government_applications') || {};
    if (!allApplications[this.currentUser.id]) {
        allApplications[this.currentUser.id] = [];
    }

    const application = {
        id: 'APP' + Date.now(),
        serviceId: service.id,
        serviceName: service.name,
        appliedDate: new Date().toISOString(),
        status: 'processing',
        fee: service.fee
    };

    allApplications[this.currentUser.id].unshift(application);
    this.saveData('government_applications', allApplications);

    this.showNotification('Application submitted successfully!', 'success');

    setTimeout(() => {
        this.navigation.goBack();
    }, 1500);
};

XApp.prototype.generateGovernmentServices = function () {
    const services = [
        {
            id: 'gov_1',
            name: 'Passport Application',
            icon: '🛂',
            category: 'documents',
            description: 'Apply for new passport or renewal',
            fullDescription: 'Complete passport application service including new passport issuance and renewal. Our streamlined process ensures quick processing and delivery of your travel document.',
            fee: 145,
            processingTime: '4-6 weeks',
            validity: '10 years',
            requirements: [
                'Valid government-issued ID',
                'Proof of citizenship (birth certificate or naturalization certificate)',
                'Passport-sized photographs (2)',
                'Completed application form',
                'Payment of processing fee'
            ]
        },
        {
            id: 'gov_2',
            name: 'Driver\'s License',
            icon: '🚗',
            category: 'permits',
            description: 'New license or renewal application',
            fullDescription: 'Apply for a new driver\'s license or renew your existing license. Includes all license classes from standard to commercial.',
            fee: 35,
            processingTime: '1-2 weeks',
            validity: '5 years',
            requirements: [
                'Proof of identity',
                'Proof of residency',
                'Vision test certificate',
                'Driving test completion (for new license)',
                'Current license (for renewal)'
            ]
        },
        {
            id: 'gov_3',
            name: 'Business License',
            icon: '🏢',
            category: 'permits',
            description: 'Register and license your business',
            fullDescription: 'Obtain official business license to operate legally. Covers various business types from sole proprietorships to corporations.',
            fee: 250,
            processingTime: '2-3 weeks',
            validity: '1 year',
            requirements: [
                'Business plan and description',
                'Proof of business address',
                'Owner identification documents',
                'Tax registration number',
                'Zoning approval (if applicable)'
            ]
        },
        {
            id: 'gov_4',
            name: 'Birth Certificate',
            icon: '👶',
            category: 'documents',
            description: 'Request official birth certificate',
            fullDescription: 'Order certified copies of birth certificates. Available for self or immediate family members with proper authorization.',
            fee: 25,
            processingTime: '5-7 business days',
            validity: 'Permanent',
            requirements: [
                'Valid photo ID',
                'Proof of relationship (if requesting for family)',
                'Birth details (date, place, parents names)',
                'Authorization form (if applicable)'
            ]
        },
        {
            id: 'gov_5',
            name: 'Tax Return Filing',
            icon: '💰',
            category: 'taxes',
            description: 'File annual income tax returns',
            fullDescription: 'Complete income tax filing service with automatic calculation and submission to tax authorities.',
            fee: 0,
            processingTime: 'Instant processing',
            validity: '1 year',
            requirements: [
                'Income statements (W-2, 1099, etc.)',
                'Tax identification number',
                'Previous year tax return',
                'Deduction receipts',
                'Bank account for refund (optional)'
            ]
        },
        {
            id: 'gov_6',
            name: 'Property Tax Payment',
            icon: '🏠',
            category: 'taxes',
            description: 'Pay property tax online',
            fullDescription: 'Convenient online property tax payment system. View current dues, payment history, and make secure payments.',
            fee: 0,
            processingTime: 'Instant',
            validity: '1 year',
            requirements: [
                'Property identification number',
                'Property owner verification',
                'Payment method (wallet, card, or bank)'
            ]
        },
        {
            id: 'gov_7',
            name: 'Health Insurance Card',
            icon: '🏥',
            category: 'health',
            description: 'Apply for government health insurance',
            fullDescription: 'Enrollment in government health insurance program. Provides comprehensive coverage for medical expenses.',
            fee: 50,
            processingTime: '2-3 weeks',
            validity: '1 year',
            requirements: [
                'Proof of identity',
                'Proof of residency',
                'Income verification documents',
                'Social security number',
                'Recent photograph'
            ]
        },
        {
            id: 'gov_8',
            name: 'Marriage Certificate',
            icon: '💍',
            category: 'documents',
            description: 'Request official marriage certificate',
            fullDescription: 'Obtain certified copies of marriage certificates. Required for legal and administrative purposes.',
            fee: 25,
            processingTime: '5-7 business days',
            validity: 'Permanent',
            requirements: [
                'Valid photo ID for both spouses',
                'Marriage details (date, location)',
                'Marriage license number (if available)'
            ]
        },
        {
            id: 'gov_9',
            name: 'Electricity Connection',
            icon: '⚡',
            category: 'utilities',
            description: 'Apply for new electricity connection',
            fullDescription: 'New electricity connection service for residential and commercial properties. Includes meter installation.',
            fee: 75,
            processingTime: '1-2 weeks',
            validity: 'Ongoing',
            requirements: [
                'Property ownership or lease documents',
                'Proof of identity',
                'Property address verification',
                'Load requirement estimate',
                'Site inspection clearance'
            ]
        },
        {
            id: 'gov_10',
            name: 'Water Connection',
            icon: '💧',
            category: 'utilities',
            description: 'Apply for water supply connection',
            fullDescription: 'New water supply connection for residential and commercial use. Includes meter installation and activation.',
            fee: 60,
            processingTime: '1-2 weeks',
            validity: 'Ongoing',
            requirements: [
                'Property documents',
                'Proof of identity',
                'Property tax receipt',
                'Site plan',
                'NOC from property owner (if renting)'
            ]
        },
        {
            id: 'gov_11',
            name: 'Building Permit',
            icon: '🏗️',
            category: 'permits',
            description: 'Construction or renovation permit',
            fullDescription: 'Obtain permits for construction, renovation, or modification of buildings. Ensures compliance with building codes.',
            fee: 500,
            processingTime: '3-4 weeks',
            validity: '1 year',
            requirements: [
                'Architectural plans and drawings',
                'Property ownership documents',
                'Engineer certification',
                'Environmental clearance',
                'Neighbor consent (if applicable)'
            ]
        },
        {
            id: 'gov_12',
            name: 'Vaccination Certificate',
            icon: '💉',
            category: 'health',
            description: 'Digital vaccination record',
            fullDescription: 'Official vaccination certificate with QR code verification. Includes all administered vaccines and boosters.',
            fee: 0,
            processingTime: 'Instant',
            validity: 'Permanent',
            requirements: [
                'Government-issued ID',
                'Vaccination records from healthcare provider',
                'Date and location of vaccination'
            ]
        }
    ];

    this.saveData('government_services', services);
};
