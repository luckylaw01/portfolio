// Food Delivery View Handler
XApp.prototype.initFoodView = function () {
    console.log('Initializing food view');

    // Initialize bottom navigation
    this.initBottomNav('food');

    // Note: Back button is handled globally by navigation.js

    // Initialize restaurants data if not exists
    if (!this.getData('restaurants')) {
        this.saveData('restaurants', this.generateSampleRestaurants());
    }

    // Initialize food cart
    if (!this.getData('foodCart')) {
        this.saveData('foodCart', { items: [], total: 0 });
    }

    // Setup search
    const searchInput = document.getElementById('foodSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            this.filterRestaurants();
        });
    }

    // Setup cart button
    const cartBtn = document.getElementById('foodCartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            this.showFoodCart();
        });
    }

    // Setup category chips
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.filterRestaurants(chip.dataset.category);
        });
    });

    // Load restaurants
    this.loadRestaurants();
};

XApp.prototype.loadRestaurants = function (category = 'all') {
    const container = document.getElementById('restaurantListingsContainer');
    if (!container) return;

    let restaurants = this.getData('restaurants') || [];

    // Apply category filter
    if (category !== 'all') {
        restaurants = restaurants.filter(restaurant =>
            restaurant.categories.includes(category)
        );
    }

    if (restaurants.length === 0) {
        container.innerHTML = '<div class="empty-restaurants"><div class="empty-icon">🍽️</div><h3>No restaurants found</h3><p>Try a different category</p></div>';
        return;
    }

    container.innerHTML = restaurants.map(restaurant => this.renderRestaurantCard(restaurant)).join('');

    // Add click handlers
    const restaurantCards = container.querySelectorAll('.restaurant-card');
    restaurantCards.forEach(card => {
        card.addEventListener('click', () => {
            const restaurantId = card.dataset.restaurantId;
            this.navigation.loadView('restaurant-detail', true, { restaurantId: restaurantId });
        });
    });
};

XApp.prototype.renderRestaurantCard = function (restaurant) {
    const freeDeliveryBadge = restaurant.freeDelivery ? '<span class="restaurant-badge free-delivery">Free Delivery</span>' : '';
    const promoBadge = restaurant.promo ? '<span class="restaurant-badge promo">' + restaurant.promo + '</span>' : '';

    return '<div class="restaurant-card" data-restaurant-id="' + restaurant.id + '">' +
        '<div class="restaurant-image">' + restaurant.icon + '</div>' +
        '<div class="restaurant-header">' +
        '<div class="restaurant-info">' +
        '<div class="restaurant-name">' + restaurant.name + '</div>' +
        '<div class="restaurant-cuisine">' + restaurant.cuisine + '</div>' +
        '</div>' +
        '<div class="restaurant-rating">' +
        '<span class="rating-star">⭐</span>' +
        '<span>' + restaurant.rating + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="restaurant-meta">' +
        '<div class="restaurant-meta-item">🚗 ' + restaurant.deliveryTime + '</div>' +
        '<div class="restaurant-meta-item">💰 $' + restaurant.deliveryFee + ' fee</div>' +
        '<div class="restaurant-meta-item">📦 $' + restaurant.minOrder + ' min</div>' +
        '</div>' +
        '<div class="restaurant-badges">' +
        freeDeliveryBadge +
        promoBadge +
        '</div>' +
        '</div>';
};

XApp.prototype.filterRestaurants = function (category) {
    const searchInput = document.getElementById('foodSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let restaurants = this.getData('restaurants') || [];

    // Apply category filter
    if (category && category !== 'all') {
        restaurants = restaurants.filter(restaurant =>
            restaurant.categories.includes(category)
        );
    }

    // Apply search filter
    if (searchTerm) {
        restaurants = restaurants.filter(restaurant => {
            return restaurant.name.toLowerCase().includes(searchTerm) ||
                restaurant.cuisine.toLowerCase().includes(searchTerm) ||
                restaurant.categories.some(cat => cat.toLowerCase().includes(searchTerm));
        });
    }

    const container = document.getElementById('restaurantListingsContainer');
    if (!container) return;

    if (restaurants.length === 0) {
        container.innerHTML = '<div class="empty-restaurants"><div class="empty-icon">🍽️</div><h3>No restaurants found</h3><p>Try adjusting your search</p></div>';
        return;
    }

    container.innerHTML = restaurants.map(restaurant => this.renderRestaurantCard(restaurant)).join('');

    // Add click handlers
    const restaurantCards = container.querySelectorAll('.restaurant-card');
    restaurantCards.forEach(card => {
        card.addEventListener('click', () => {
            const restaurantId = card.dataset.restaurantId;
            this.navigation.loadView('restaurant-detail', true, { restaurantId: restaurantId });
        });
    });
};

// Restaurant Detail View Handler
XApp.prototype.initRestaurantDetailView = function (params) {
    console.log('Initializing restaurant detail view');

    // Initialize bottom navigation
    this.initBottomNav('food');

    // Setup back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.navigation.goBack();
        });
    }

    const restaurantId = params?.restaurantId;
    if (!restaurantId) {
        this.navigation.loadView('food');
        return;
    }

    const restaurants = this.getData('restaurants') || [];
    const restaurant = restaurants.find(r => r.id === restaurantId);

    if (!restaurant) {
        this.navigation.loadView('food');
        return;
    }

    const container = document.getElementById('restaurantDetailContent');
    if (!container) return;

    container.innerHTML = this.renderRestaurantDetail(restaurant);

    // Setup menu item add buttons
    const addButtons = container.querySelectorAll('.menu-item-add');
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = btn.dataset.itemId;
            this.addToFoodCart(restaurant, itemId);
        });
    });

    // Setup view cart button
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', () => {
            this.showFoodCart();
        });
    }

    // Update cart button if cart has items
    this.updateCartButton();
};

XApp.prototype.renderRestaurantDetail = function (restaurant) {
    let html = '<div class="restaurant-detail-header">' +
        '<div class="restaurant-detail-image">' + restaurant.icon + '</div>' +
        '<div class="restaurant-detail-name">' + restaurant.name + '</div>' +
        '<div class="restaurant-detail-cuisine">' + restaurant.cuisine + '</div>' +
        '<div class="restaurant-detail-meta">' +
        '<div>⭐ ' + restaurant.rating + '</div>' +
        '<div>🚗 ' + restaurant.deliveryTime + '</div>' +
        '<div>💰 $' + restaurant.deliveryFee + ' fee</div>' +
        '</div>' +
        '</div>';

    // Render menu by category
    const menuByCategory = {};
    restaurant.menu.forEach(item => {
        if (!menuByCategory[item.category]) {
            menuByCategory[item.category] = [];
        }
        menuByCategory[item.category].push(item);
    });

    Object.keys(menuByCategory).forEach(category => {
        html += '<div class="menu-section">' +
            '<div class="menu-section-title">' + category + '</div>' +
            '<div class="menu-items">';

        menuByCategory[category].forEach(item => {
            html += '<div class="menu-item">' +
                '<div class="menu-item-image">' + item.icon + '</div>' +
                '<div class="menu-item-info">' +
                '<div class="menu-item-name">' + item.name + '</div>' +
                '<div class="menu-item-description">' + item.description + '</div>' +
                '<div class="menu-item-footer">' +
                '<div class="menu-item-price">$' + item.price.toFixed(2) + '</div>' +
                '<button class="menu-item-add" data-item-id="' + item.id + '">+</button>' +
                '</div>' +
                '</div>' +
                '</div>';
        });

        html += '</div></div>';
    });

    return html;
};

XApp.prototype.addToFoodCart = function (restaurant, itemId) {
    const item = restaurant.menu.find(m => m.id === itemId);
    if (!item) return;

    const cart = this.getData('foodCart') || { items: [], total: 0 };

    // Check if item already in cart
    const existingItem = cart.items.find(i => i.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: item.id,
            name: item.name,
            price: item.price,
            icon: item.icon,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            quantity: 1
        });
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    this.saveData('foodCart', cart);
    this.showNotification('Added to cart');
    this.updateCartButton();
};

XApp.prototype.updateCartButton = function () {
    const cart = this.getData('foodCart') || { items: [], total: 0 };

    // Remove existing cart button
    const existingBtn = document.getElementById('floatingCartBtn');
    if (existingBtn) {
        existingBtn.remove();
    }

    if (cart.items.length > 0) {
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const btn = document.createElement('button');
        btn.id = 'floatingCartBtn';
        btn.className = 'food-cart-button';
        btn.innerHTML = '<span>View Cart</span><span class="cart-count">' + totalItems + '</span><span>$' + cart.total.toFixed(2) + '</span>';
        btn.addEventListener('click', () => {
            this.showFoodCart();
        });
        document.body.appendChild(btn);
    }
};

XApp.prototype.showFoodCart = function () {
    const cart = this.getData('foodCart') || { items: [], total: 0 };

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    let itemsHtml = '';
    if (cart.items.length === 0) {
        itemsHtml = '<div style="padding: 40px; text-align: center; color: var(--x-gray);">Your cart is empty</div>';
    } else {
        itemsHtml = cart.items.map(item => {
            return '<div style="padding: 12px; border-bottom: 1px solid var(--x-border); display: flex; gap: 12px; align-items: center;">' +
                '<div style="font-size: 32px;">' + item.icon + '</div>' +
                '<div style="flex: 1;">' +
                '<div style="font-weight: 600;">' + item.name + '</div>' +
                '<div style="font-size: 13px; color: var(--x-gray);">' + item.restaurantName + '</div>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<button class="cart-item-decrease" data-item-id="' + item.id + '" style="width: 28px; height: 28px; border-radius: 50%; background: var(--x-dark-gray); border: 1px solid var(--x-border); color: var(--x-white); cursor: pointer;">-</button>' +
                '<span style="font-weight: 600; min-width: 20px; text-align: center;">' + item.quantity + '</span>' +
                '<button class="cart-item-increase" data-item-id="' + item.id + '" style="width: 28px; height: 28px; border-radius: 50%; background: var(--x-blue); border: none; color: var(--x-white); cursor: pointer;">+</button>' +
                '</div>' +
                '<div style="font-weight: 700; color: var(--x-blue);">$' + (item.price * item.quantity).toFixed(2) + '</div>' +
                '</div>';
        }).join('');
    }

    dialog.innerHTML = '<div class="modal-content" style="max-width: 400px;">' +
        '<div class="modal-header">' +
        '<h3>Your Cart</h3>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body" style="padding: 0; max-height: 400px; overflow-y: auto;">' +
        itemsHtml +
        '</div>' +
        (cart.items.length > 0 ? '<div style="padding: 16px; border-top: 1px solid var(--x-border);">' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 18px; font-weight: 700;">' +
            '<span>Total</span>' +
            '<span style="color: var(--x-blue);">$' + cart.total.toFixed(2) + '</span>' +
            '</div>' +
            '<button id="checkoutBtn" style="width: 100%; background: var(--x-blue); color: var(--x-white); border: none; padding: 14px; border-radius: 24px; font-size: 15px; font-weight: 700; cursor: pointer;">Checkout</button>' +
            '</div>' : '') +
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

    // Decrease quantity buttons
    const decreaseButtons = dialog.querySelectorAll('.cart-item-decrease');
    decreaseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.itemId;
            this.updateCartItemQuantity(itemId, -1);
            document.body.removeChild(dialog);
            this.showFoodCart();
        });
    });

    // Increase quantity buttons
    const increaseButtons = dialog.querySelectorAll('.cart-item-increase');
    increaseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.itemId;
            this.updateCartItemQuantity(itemId, 1);
            document.body.removeChild(dialog);
            this.showFoodCart();
        });
    });

    // Checkout button
    const checkoutBtn = dialog.querySelector('#checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            this.processFoodCheckout();
            document.body.removeChild(dialog);
        });
    }
};

XApp.prototype.updateCartItemQuantity = function (itemId, change) {
    const cart = this.getData('foodCart') || { items: [], total: 0 };
    const item = cart.items.find(i => i.id === itemId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart.items = cart.items.filter(i => i.id !== itemId);
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    this.saveData('foodCart', cart);
    this.updateCartButton();
};

XApp.prototype.processFoodCheckout = function () {
    const cart = this.getData('foodCart') || { items: [], total: 0 };

    if (cart.items.length === 0) return;

    // Deduct from wallet
    const wallets = this.getData('wallets') || {};
    if (!this.currentUser) {
        this.showNotification('Please log in to checkout', 'error');
        return;
    }
    const userWallet = wallets[this.currentUser.id];

    if (!userWallet || userWallet.balance < cart.total) {
        this.showNotification('Insufficient balance', 'error');
        return;
    }

    userWallet.balance -= cart.total;
    userWallet.transactions.unshift({
        id: Date.now(),
        type: 'payment',
        amount: cart.total,
        description: 'Food delivery order',
        date: new Date().toISOString()
    });

    this.saveData('wallets', wallets);

    // Clear cart
    this.saveData('foodCart', { items: [], total: 0 });
    this.updateCartButton();

    this.showNotification('Order placed successfully! Estimated delivery: 30-45 min', 'success');
};

// Generate Sample Restaurants
XApp.prototype.generateSampleRestaurants = function () {
    return [
        {
            id: 'rest1',
            name: 'Pizza Palace',
            icon: '🍕',
            cuisine: 'Italian, Pizza',
            rating: 4.8,
            deliveryTime: '25-35 min',
            deliveryFee: 2.99,
            minOrder: 15,
            freeDelivery: false,
            promo: '20% OFF',
            categories: ['pizza', 'all'],
            menu: [
                { id: 'item1', category: 'Pizza', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and basil', price: 12.99, icon: '🍕' },
                { id: 'item2', category: 'Pizza', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and cheese', price: 14.99, icon: '🍕' },
                { id: 'item3', category: 'Sides', name: 'Garlic Bread', description: 'Fresh baked with garlic butter', price: 5.99, icon: '🥖' },
                { id: 'item4', category: 'Drinks', name: 'Soda', description: 'Coke, Sprite, or Fanta', price: 2.50, icon: '🥤' }
            ]
        },
        {
            id: 'rest2',
            name: 'Burger House',
            icon: '🍔',
            cuisine: 'American, Burgers',
            rating: 4.6,
            deliveryTime: '20-30 min',
            deliveryFee: 0,
            minOrder: 10,
            freeDelivery: true,
            promo: '',
            categories: ['burger', 'all'],
            menu: [
                { id: 'item5', category: 'Burgers', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion', price: 9.99, icon: '🍔' },
                { id: 'item6', category: 'Burgers', name: 'Cheeseburger', description: 'Double cheese, special sauce', price: 11.99, icon: '🍔' },
                { id: 'item7', category: 'Sides', name: 'French Fries', description: 'Crispy golden fries', price: 4.99, icon: '🍟' },
                { id: 'item8', category: 'Drinks', name: 'Milkshake', description: 'Vanilla, chocolate, or strawberry', price: 5.50, icon: '🥤' }
            ]
        },
        {
            id: 'rest3',
            name: 'Sushi Express',
            icon: '🍣',
            cuisine: 'Japanese, Sushi',
            rating: 4.9,
            deliveryTime: '30-40 min',
            deliveryFee: 3.99,
            minOrder: 20,
            freeDelivery: false,
            promo: '',
            categories: ['sushi', 'asian', 'all'],
            menu: [
                { id: 'item9', category: 'Rolls', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, icon: '🍣' },
                { id: 'item10', category: 'Rolls', name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo', price: 10.99, icon: '🍣' },
                { id: 'item11', category: 'Sashimi', name: 'Salmon Sashimi', description: '6 pieces of fresh salmon', price: 15.99, icon: '🍣' },
                { id: 'item12', category: 'Drinks', name: 'Green Tea', description: 'Hot or iced', price: 3.00, icon: '🍵' }
            ]
        },
        {
            id: 'rest4',
            name: 'Poke Bowl Paradise',
            icon: '🥗',
            cuisine: 'Hawaiian, Healthy',
            rating: 4.7,
            deliveryTime: '25-35 min',
            deliveryFee: 2.50,
            minOrder: 12,
            freeDelivery: false,
            promo: 'Free Drink',
            categories: ['healthy', 'asian', 'all'],
            menu: [
                { id: 'item13', category: 'Bowls', name: 'Classic Poke Bowl', description: 'Tuna, rice, avocado, edamame', price: 13.99, icon: '🥗' },
                { id: 'item14', category: 'Bowls', name: 'Salmon Poke Bowl', description: 'Salmon, quinoa, mango, cucumber', price: 14.99, icon: '🥗' },
                { id: 'item15', category: 'Sides', name: 'Seaweed Salad', description: 'Fresh seaweed with sesame', price: 5.99, icon: '🥗' }
            ]
        },
        {
            id: 'rest5',
            name: 'Sweet Treats Bakery',
            icon: '🍰',
            cuisine: 'Bakery, Desserts',
            rating: 4.9,
            deliveryTime: '15-25 min',
            deliveryFee: 1.99,
            minOrder: 8,
            freeDelivery: false,
            promo: '',
            categories: ['dessert', 'all'],
            menu: [
                { id: 'item16', category: 'Cakes', name: 'Chocolate Cake', description: 'Rich chocolate ganache', price: 6.99, icon: '🍰' },
                { id: 'item17', category: 'Cakes', name: 'Cheesecake', description: 'New York style', price: 7.99, icon: '🍰' },
                { id: 'item18', category: 'Pastries', name: 'Croissant', description: 'Buttery and flaky', price: 3.99, icon: '🥐' },
                { id: 'item19', category: 'Drinks', name: 'Coffee', description: 'Espresso, latte, or cappuccino', price: 4.50, icon: '☕' }
            ]
        },
        {
            id: 'rest6',
            name: 'Dragon Wok',
            icon: '🥡',
            cuisine: 'Chinese, Asian',
            rating: 4.5,
            deliveryTime: '30-40 min',
            deliveryFee: 2.99,
            minOrder: 15,
            freeDelivery: false,
            promo: '15% OFF',
            categories: ['asian', 'all'],
            menu: [
                { id: 'item20', category: 'Main', name: 'Orange Chicken', description: 'Sweet and tangy chicken', price: 11.99, icon: '🍗' },
                { id: 'item21', category: 'Main', name: 'Beef & Broccoli', description: 'Tender beef with fresh broccoli', price: 12.99, icon: '🥩' },
                { id: 'item22', category: 'Sides', name: 'Fried Rice', description: 'Egg fried rice', price: 6.99, icon: '🍚' },
                { id: 'item23', category: 'Appetizers', name: 'Spring Rolls', description: '4 vegetable spring rolls', price: 5.99, icon: '🥟' }
            ]
        }
    ];
};
