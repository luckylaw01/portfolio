/* ═══════════════════════════════════════════════════════════════════════════
   VIEW HANDLERS - Event Handlers for Each View
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// SPLASH VIEW
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initSplashView = function() {
    console.log('ViewHandler: Initializing Splash view');
    
    // Auto-navigate after 2 seconds
    setTimeout(() => {
        // Check if user exists
        const users = this.getData('users') || [];
        
        if (users.length > 0) {
            // User exists, go to login
            this.navigation.loadView('login', false);
        } else {
            // No user, go to onboarding
            this.navigation.loadView('onboarding', false);
        }
    }, 2000);
};

// ═══════════════════════════════════════════════════════════════════════════
// ONBOARDING VIEW
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initOnboardingView = function() {
    console.log('ViewHandler: Initializing Onboarding view');
    
    const form = document.getElementById('onboardingForm');
    const nameInput = document.getElementById('userName');
    const pinInputs = document.querySelectorAll('.pin-input');

    if (!form) return;

    // Setup PIN input behavior
    this.setupPinInputs(pinInputs);

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const pin = Array.from(pinInputs).map(input => input.value).join('');

        // Validate
        const validation = this.validateForm(
            { name, pin },
            {
                name: { required: true, label: 'Name', minLength: 2 },
                pin: { required: true, label: 'PIN', minLength: 4, maxLength: 4 }
            }
        );

        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            this.showToast(firstError, 'error');
            return;
        }

        // Create user
        const user = {
            id: this.generateId(),
            name: name,
            pin: pin,
            createdAt: new Date().toISOString()
        };

        // Save user
        const users = this.getData('users') || [];
        users.push(user);
        this.saveData('users', users);

        // Initialize default categories
        this.initializeDefaultCategories(user.id);

        // Create session and go to dashboard
        this.createSession(user);
        this.showToast('Account created successfully!', 'success');
        this.navigation.loadView('dashboard', false);
    });
};

/**
 * Initialize default expense/income categories for new user
 */
BudgetTrackerApp.prototype.initializeDefaultCategories = function(userId) {
    const defaultCategories = [
        // Expense categories
        { id: this.generateId(), userId, name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#FF6B6B' },
        { id: this.generateId(), userId, name: 'Transport', type: 'expense', icon: '🚗', color: '#4ECDC4' },
        { id: this.generateId(), userId, name: 'Shopping', type: 'expense', icon: '🛍️', color: '#45B7D1' },
        { id: this.generateId(), userId, name: 'Bills & Utilities', type: 'expense', icon: '💡', color: '#96CEB4' },
        { id: this.generateId(), userId, name: 'Entertainment', type: 'expense', icon: '🎬', color: '#DDA0DD' },
        { id: this.generateId(), userId, name: 'Health', type: 'expense', icon: '💊', color: '#98D8C8' },
        { id: this.generateId(), userId, name: 'Education', type: 'expense', icon: '📚', color: '#F7DC6F' },
        { id: this.generateId(), userId, name: 'Other', type: 'expense', icon: '📦', color: '#BDC3C7' },
        // Income categories
        { id: this.generateId(), userId, name: 'Salary', type: 'income', icon: '💰', color: '#2ECC71' },
        { id: this.generateId(), userId, name: 'Freelance', type: 'income', icon: '💻', color: '#3498DB' },
        { id: this.generateId(), userId, name: 'Business', type: 'income', icon: '🏢', color: '#9B59B6' },
        { id: this.generateId(), userId, name: 'Investments', type: 'income', icon: '📈', color: '#1ABC9C' },
        { id: this.generateId(), userId, name: 'Gifts', type: 'income', icon: '🎁', color: '#E74C3C' },
        { id: this.generateId(), userId, name: 'Other Income', type: 'income', icon: '💵', color: '#F39C12' }
    ];

    this.saveData('categories', defaultCategories);
    console.log('ViewHandler: Default categories initialized');
};

/**
 * Setup PIN input behavior (auto-focus next, backspace handling)
 */
BudgetTrackerApp.prototype.setupPinInputs = function(pinInputs) {
    pinInputs.forEach((input, index) => {
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Auto-focus next input
            if (e.target.value && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinInputs[index - 1].focus();
            }
        });

        // Select on focus
        input.addEventListener('focus', () => {
            input.select();
        });
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN VIEW
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initLoginView = function() {
    console.log('ViewHandler: Initializing Login view');
    
    const pinDisplay = document.getElementById('pinDisplay');
    const numpadButtons = document.querySelectorAll('.numpad-btn');
    const userNameElement = document.getElementById('loginUserName');
    const forgotPinBtn = document.getElementById('forgotPinBtn');
    
    let enteredPin = '';
    const maxPinLength = 4;

    // Get user name
    const users = this.getData('users') || [];
    if (users.length > 0 && userNameElement) {
        userNameElement.textContent = users[0].name;
    }

    // Update PIN display dots
    const updatePinDisplay = () => {
        if (pinDisplay) {
            const dots = pinDisplay.querySelectorAll('.pin-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('filled', index < enteredPin.length);
            });
        }
    };

    // Handle forgot PIN
    if (forgotPinBtn) {
        forgotPinBtn.addEventListener('click', () => {
            if (confirm('Reset app data? This will clear ALL your data (transactions, budgets, categories) and allow you to create a new account.\n\nThis cannot be undone!')) {
                // Clear all data
                localStorage.removeItem('budget_users');
                localStorage.removeItem('budget_transactions');
                localStorage.removeItem('budget_categories');
                localStorage.removeItem('budget_budgets');
                localStorage.removeItem('budget_session');
                localStorage.removeItem('budget_settings');
                
                this.showToast('App reset. Please set up again.', 'success');
                this.navigation.loadView('onboarding', false);
            }
        });
    }

    // Handle numpad button clicks
    numpadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            
            if (value === 'delete') {
                // Delete last digit
                enteredPin = enteredPin.slice(0, -1);
                updatePinDisplay();
            } else if (value === 'clear') {
                // Clear all
                enteredPin = '';
                updatePinDisplay();
            } else if (enteredPin.length < maxPinLength) {
                // Add digit
                enteredPin += value;
                updatePinDisplay();

                // Check PIN when complete
                if (enteredPin.length === maxPinLength) {
                    this.verifyPin(enteredPin);
                }
            }
        });
    });
};

/**
 * Verify entered PIN
 */
BudgetTrackerApp.prototype.verifyPin = function(pin) {
    const users = this.getData('users') || [];
    const user = users.find(u => u.pin === pin);

    if (user) {
        this.createSession(user);
        this.showToast(`Welcome back, ${user.name}!`, 'success');
        this.navigation.loadView('dashboard', false);
    } else {
        this.showToast('Incorrect PIN', 'error');
        // Clear PIN display
        setTimeout(() => {
            const dots = document.querySelectorAll('.pin-dot');
            dots.forEach(dot => dot.classList.remove('filled'));
        }, 300);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initDashboardView = function() {
    console.log('ViewHandler: Initializing Dashboard view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    // Display user name
    const userNameElement = document.getElementById('dashboardUserName');
    if (userNameElement) {
        userNameElement.textContent = this.currentUser.name;
    }

    // Calculate and display totals
    this.updateDashboardTotals();

    // Load recent transactions
    this.loadRecentTransactions();

    // Setup bottom navigation
    this.setupBottomNav();

    // Setup quick action buttons
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');

    if (addIncomeBtn) {
        addIncomeBtn.addEventListener('click', () => {
            this.navigation.loadView('add-transaction', true, { type: 'income' });
        });
    }

    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            this.navigation.loadView('add-transaction', true, { type: 'expense' });
        });
    }

    // View all transactions button
    const viewAllBtn = document.getElementById('viewAllTransactions');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            this.navigation.loadView('transactions');
        });
    }

    // View reports button
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', () => {
            this.navigation.loadView('reports');
        });
    }
};

/**
 * Update dashboard totals (balance, income, expenses)
 */
BudgetTrackerApp.prototype.updateDashboardTotals = function() {
    const transactions = this.getUserTransactions();
    
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    // Update DOM
    const balanceElement = document.getElementById('totalBalance');
    const incomeElement = document.getElementById('totalIncome');
    const expenseElement = document.getElementById('totalExpenses');

    if (balanceElement) balanceElement.textContent = this.formatCurrency(balance);
    if (incomeElement) incomeElement.textContent = this.formatCurrency(totalIncome);
    if (expenseElement) expenseElement.textContent = this.formatCurrency(totalExpenses);
};

/**
 * Get current user's transactions
 */
BudgetTrackerApp.prototype.getUserTransactions = function() {
    const transactions = this.getData('transactions') || [];
    return transactions.filter(t => t.userId === this.currentUser?.id);
};

/**
 * Get current user's categories
 */
BudgetTrackerApp.prototype.getUserCategories = function(type = null) {
    const categories = this.getData('categories') || [];
    let userCategories = categories.filter(c => c.userId === this.currentUser?.id);
    
    if (type) {
        userCategories = userCategories.filter(c => c.type === type);
    }
    
    return userCategories;
};

/**
 * Load recent transactions for dashboard
 */
BudgetTrackerApp.prototype.loadRecentTransactions = function() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const transactions = this.getUserTransactions()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet</p>
                <p class="text-muted">Add your first transaction to get started</p>
            </div>
        `;
        return;
    }

    const categories = this.getData('categories') || [];

    container.innerHTML = transactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId) || { icon: '📦', name: 'Other' };
        const isExpense = t.type === 'expense';
        
        return `
            <div class="transaction-item" data-id="${t.id}">
                <div class="transaction-icon" style="background: ${category.color || '#ccc'}">
                    ${category.icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${t.description || category.name}</div>
                    <div class="transaction-date">${this.formatDate(t.date)}</div>
                </div>
                <div class="transaction-amount ${isExpense ? 'expense' : 'income'}">
                    ${isExpense ? '-' : '+'}${this.formatCurrency(t.amount)}
                </div>
            </div>
        `;
    }).join('');
};

/**
 * Setup bottom navigation
 */
BudgetTrackerApp.prototype.setupBottomNav = function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view && view !== this.navigation.getCurrentView()) {
                this.navigation.loadView(view);
                
                // Update active state
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// Placeholder init functions for other views (to be implemented in later phases)
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initAddTransactionView = function(params) {
    console.log('ViewHandler: Initializing Add Transaction view', params);

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    const form = document.getElementById('transactionForm');
    const amountInput = document.getElementById('transactionAmount');
    const dateInput = document.getElementById('transactionDate');
    const descriptionInput = document.getElementById('transactionDescription');
    const categoryGrid = document.getElementById('categoryGrid');
    const expenseTypeBtn = document.getElementById('expenseTypeBtn');
    const incomeTypeBtn = document.getElementById('incomeTypeBtn');
    const titleElement = document.getElementById('addTransactionTitle');

    let selectedType = params.type || 'expense';
    let selectedCategoryId = null;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Update title based on type
    const updateTitle = () => {
        if (titleElement) {
            titleElement.textContent = selectedType === 'income' ? 'Add Income' : 'Add Expense';
        }
    };

    // Load categories for selected type
    const loadCategories = () => {
        const categories = this.getUserCategories(selectedType);
        
        categoryGrid.innerHTML = categories.map(cat => `
            <div class="category-item" data-id="${cat.id}">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </div>
        `).join('');

        // Attach click handlers
        categoryGrid.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                categoryGrid.querySelectorAll('.category-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                selectedCategoryId = item.dataset.id;
            });
        });

        // Select first category by default
        const firstCategory = categoryGrid.querySelector('.category-item');
        if (firstCategory) {
            firstCategory.classList.add('selected');
            selectedCategoryId = firstCategory.dataset.id;
        }
    };

    // Set initial type from params
    if (selectedType === 'income') {
        expenseTypeBtn.classList.remove('active');
        incomeTypeBtn.classList.add('active');
    }
    updateTitle();
    loadCategories();

    // Type toggle handlers
    expenseTypeBtn.addEventListener('click', () => {
        selectedType = 'expense';
        expenseTypeBtn.classList.add('active');
        incomeTypeBtn.classList.remove('active');
        updateTitle();
        loadCategories();
    });

    incomeTypeBtn.addEventListener('click', () => {
        selectedType = 'income';
        incomeTypeBtn.classList.add('active');
        expenseTypeBtn.classList.remove('active');
        updateTitle();
        loadCategories();
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const amount = parseFloat(amountInput.value);
        const date = dateInput.value;
        const description = descriptionInput.value.trim();

        // Validate
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }

        if (!selectedCategoryId) {
            this.showToast('Please select a category', 'error');
            return;
        }

        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }

        // Create transaction
        const transaction = {
            id: this.generateId(),
            userId: this.currentUser.id,
            type: selectedType,
            amount: amount,
            categoryId: selectedCategoryId,
            date: date,
            description: description,
            createdAt: new Date().toISOString()
        };

        // Save transaction
        const transactions = this.getData('transactions') || [];
        transactions.push(transaction);
        this.saveData('transactions', transactions);

        // Show success and go back
        this.showToast(
            `${selectedType === 'income' ? 'Income' : 'Expense'} added successfully!`, 
            'success'
        );
        this.navigation.loadView('dashboard', false);
    });

    // Focus amount input
    amountInput.focus();
};

BudgetTrackerApp.prototype.initTransactionsView = function() {
    console.log('ViewHandler: Initializing Transactions view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    const container = document.getElementById('transactionsContainer');
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('.filter-tab');

    let currentFilter = 'all';
    let searchQuery = '';

    // Render transactions
    const renderTransactions = () => {
        let transactions = this.getUserTransactions();

        // Apply filter
        if (currentFilter !== 'all') {
            transactions = transactions.filter(t => t.type === currentFilter);
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const categories = this.getData('categories') || [];
            
            transactions = transactions.filter(t => {
                const category = categories.find(c => c.id === t.categoryId);
                const categoryName = category ? category.name.toLowerCase() : '';
                const description = (t.description || '').toLowerCase();
                return categoryName.includes(query) || description.includes(query);
            });
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="transactions-empty">
                    <div class="transactions-empty-icon">📋</div>
                    <h3>No transactions found</h3>
                    <p>${searchQuery ? 'Try a different search term' : 'Add your first transaction to get started'}</p>
                </div>
            `;
            return;
        }

        // Group by date
        const grouped = {};
        transactions.forEach(t => {
            const dateKey = t.date;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(t);
        });

        const categories = this.getData('categories') || [];

        container.innerHTML = Object.entries(grouped).map(([date, items]) => `
            <div class="date-group">
                <div class="date-header">${this.formatDate(date, 'long')}</div>
                <div class="date-transactions">
                    ${items.map(t => {
                        const category = categories.find(c => c.id === t.categoryId) || { icon: '📦', name: 'Other' };
                        const isExpense = t.type === 'expense';
                        return `
                            <div class="transaction-item" data-id="${t.id}">
                                <div class="transaction-icon" style="background: ${category.color || '#ccc'}">
                                    ${category.icon}
                                </div>
                                <div class="transaction-details">
                                    <div class="transaction-name">${t.description || category.name}</div>
                                    <div class="transaction-date">${category.name}</div>
                                </div>
                                <div class="transaction-amount ${isExpense ? 'expense' : 'income'}">
                                    ${isExpense ? '-' : '+'}${this.formatCurrency(t.amount)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');

        // Attach click handlers for transaction items (for future edit/delete)
        container.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('click', () => {
                const transactionId = item.dataset.id;
                // TODO: Show transaction details/edit modal
                console.log('Transaction clicked:', transactionId);
            });
        });
    };

    // Initial render
    renderTransactions();

    // Search handler
    const debouncedSearch = this.debounce((query) => {
        searchQuery = query;
        renderTransactions();
    }, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Filter tab handlers
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderTransactions();
        });
    });

    // Setup bottom nav
    this.setupBottomNav();
};

BudgetTrackerApp.prototype.initCategoriesView = function() {
    console.log('ViewHandler: Initializing Categories view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    const container = document.getElementById('categoriesContainer');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const categoryForm = document.getElementById('categoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryTypeInput = document.getElementById('categoryType');
    const categoryIdInput = document.getElementById('categoryId');
    const iconPicker = document.getElementById('iconPicker');
    const colorPicker = document.getElementById('colorPicker');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');

    let currentType = 'expense';
    let selectedIcon = '🍔';
    let selectedColor = '#FF6B6B';

    // Get spending per category
    const getCategorySpending = (categoryId) => {
        const transactions = this.getUserTransactions();
        return transactions
            .filter(t => t.categoryId === categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    // Get transaction count per category
    const getCategoryTransactionCount = (categoryId) => {
        const transactions = this.getUserTransactions();
        return transactions.filter(t => t.categoryId === categoryId).length;
    };

    // Render categories
    const renderCategories = () => {
        const categories = this.getUserCategories(currentType);

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="categories-empty">
                    <div class="categories-empty-icon">📁</div>
                    <h3>No ${currentType} categories</h3>
                    <p>Tap + to add a new category</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(cat => {
            const count = getCategoryTransactionCount(cat.id);
            const total = getCategorySpending(cat.id);
            return `
                <div class="category-card" data-id="${cat.id}">
                    <div class="category-card-icon" style="background: ${cat.color}20; color: ${cat.color}">
                        ${cat.icon}
                    </div>
                    <div class="category-card-info">
                        <div class="category-card-name">${cat.name}</div>
                        <div class="category-card-stats">
                            ${count} transaction${count !== 1 ? 's' : ''} • ${this.formatCurrency(total)}
                        </div>
                    </div>
                    <div class="category-card-actions">
                        <button class="category-action-btn edit" data-id="${cat.id}" title="Edit">✏️</button>
                        <button class="category-action-btn delete" data-id="${cat.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach edit handlers
        container.querySelectorAll('.category-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.id;
                openEditModal(categoryId);
            });
        });

        // Attach delete handlers
        container.querySelectorAll('.category-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryId = btn.dataset.id;
                deleteCategory(categoryId);
            });
        });
    };

    // Open modal for adding new category
    const openAddModal = () => {
        modalTitle.textContent = 'Add Category';
        categoryNameInput.value = '';
        categoryIdInput.value = '';
        categoryTypeInput.value = currentType;
        
        // Reset selections
        selectedIcon = '🍔';
        selectedColor = '#FF6B6B';
        iconPicker.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.icon === selectedIcon);
        });
        colorPicker.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === selectedColor);
        });

        modal.classList.remove('hidden');
        categoryNameInput.focus();
    };

    // Open modal for editing category
    const openEditModal = (categoryId) => {
        const categories = this.getData('categories') || [];
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) return;

        modalTitle.textContent = 'Edit Category';
        categoryNameInput.value = category.name;
        categoryIdInput.value = category.id;
        categoryTypeInput.value = category.type;
        
        selectedIcon = category.icon;
        selectedColor = category.color;
        
        iconPicker.querySelectorAll('.icon-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.icon === selectedIcon);
        });
        colorPicker.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === selectedColor);
        });

        modal.classList.remove('hidden');
        categoryNameInput.focus();
    };

    // Close modal
    const closeModal = () => {
        modal.classList.add('hidden');
    };

    // Delete category
    const deleteCategory = (categoryId) => {
        const categories = this.getData('categories') || [];
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) return;

        // Check if category has transactions
        const transactionCount = getCategoryTransactionCount(categoryId);
        
        if (transactionCount > 0) {
            this.showToast(`Cannot delete: ${transactionCount} transaction(s) use this category`, 'error');
            return;
        }

        // Confirm deletion
        if (confirm(`Delete "${category.name}" category?`)) {
            const filtered = categories.filter(c => c.id !== categoryId);
            this.saveData('categories', filtered);
            this.showToast('Category deleted', 'success');
            renderCategories();
        }
    };

    // Icon picker handlers
    iconPicker.querySelectorAll('.icon-option').forEach(opt => {
        opt.addEventListener('click', () => {
            iconPicker.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedIcon = opt.dataset.icon;
        });
    });

    // Color picker handlers
    colorPicker.querySelectorAll('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            colorPicker.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedColor = opt.dataset.color;
        });
    });

    // Tab handlers
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            renderCategories();
        });
    });

    // Add button handler
    addCategoryBtn.addEventListener('click', openAddModal);

    // Modal close handlers
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = categoryNameInput.value.trim();
        const type = categoryTypeInput.value;
        const editId = categoryIdInput.value;

        if (!name) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        const categories = this.getData('categories') || [];

        if (editId) {
            // Update existing category
            const index = categories.findIndex(c => c.id === editId);
            if (index !== -1) {
                categories[index] = {
                    ...categories[index],
                    name: name,
                    icon: selectedIcon,
                    color: selectedColor
                };
                this.saveData('categories', categories);
                this.showToast('Category updated', 'success');
            }
        } else {
            // Add new category
            const newCategory = {
                id: this.generateId(),
                userId: this.currentUser.id,
                name: name,
                type: type,
                icon: selectedIcon,
                color: selectedColor
            };
            categories.push(newCategory);
            this.saveData('categories', categories);
            this.showToast('Category added', 'success');
        }

        closeModal();
        renderCategories();
    });

    // Initial render
    renderCategories();

    // Setup bottom nav
    this.setupBottomNav();
};

BudgetTrackerApp.prototype.initBudgetsView = function() {
    console.log('ViewHandler: Initializing Budgets view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    const container = document.getElementById('budgetsContainer');
    const addBudgetBtn = document.getElementById('addBudgetBtn');
    const modal = document.getElementById('budgetModal');
    const modalTitle = document.getElementById('budgetModalTitle');
    const budgetForm = document.getElementById('budgetForm');
    const budgetCategorySelect = document.getElementById('budgetCategory');
    const budgetAmountInput = document.getElementById('budgetAmount');
    const budgetIdInput = document.getElementById('budgetId');
    const closeBudgetModalBtn = document.getElementById('closeBudgetModalBtn');
    const cancelBudgetModalBtn = document.getElementById('cancelBudgetModalBtn');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const monthLabel = document.getElementById('currentMonthLabel');

    // Current viewing month
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Update month label
    const updateMonthLabel = () => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    };

    // Get spending for a category in current month
    const getCategoryMonthSpending = (categoryId) => {
        const transactions = this.getUserTransactions();
        return transactions
            .filter(t => {
                if (t.categoryId !== categoryId || t.type !== 'expense') return false;
                const tDate = new Date(t.date);
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    };

    // Get user budgets
    const getUserBudgets = () => {
        const budgets = this.getData('budgets') || [];
        return budgets.filter(b => b.userId === this.currentUser.id);
    };

    // Update summary section
    const updateSummary = () => {
        const budgets = getUserBudgets();
        let totalBudget = 0;
        let totalSpent = 0;

        budgets.forEach(b => {
            totalBudget += b.amount;
            totalSpent += getCategoryMonthSpending(b.categoryId);
        });

        const remaining = totalBudget - totalSpent;
        const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

        document.getElementById('totalBudget').textContent = this.formatCurrency(totalBudget);
        document.getElementById('totalSpent').textContent = this.formatCurrency(totalSpent);
        document.getElementById('totalRemaining').textContent = this.formatCurrency(remaining);

        const progressFill = document.getElementById('overallProgress');
        progressFill.style.width = `${percentage}%`;
        progressFill.className = 'progress-fill';
        if (percentage >= 100) {
            progressFill.classList.add('danger');
        } else if (percentage >= 80) {
            progressFill.classList.add('warning');
        }

        document.getElementById('overallProgressText').textContent = `${Math.round(percentage)}% used`;
    };

    // Render budgets
    const renderBudgets = () => {
        const budgets = getUserBudgets();
        const categories = this.getData('categories') || [];

        updateSummary();

        if (budgets.length === 0) {
            container.innerHTML = `
                <div class="budgets-empty">
                    <div class="budgets-empty-icon">📊</div>
                    <h3>No budgets yet</h3>
                    <p>Set spending limits for your categories</p>
                    <button class="btn btn-primary" id="emptyAddBudgetBtn">Add Budget</button>
                </div>
            `;
            
            const emptyAddBtn = document.getElementById('emptyAddBudgetBtn');
            if (emptyAddBtn) {
                emptyAddBtn.addEventListener('click', openAddModal);
            }
            return;
        }

        container.innerHTML = budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId) || { 
                icon: '📦', 
                name: 'Unknown', 
                color: '#ccc' 
            };
            const spent = getCategoryMonthSpending(budget.categoryId);
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;

            let progressClass = '';
            if (percentage >= 100) {
                progressClass = 'danger';
            } else if (percentage >= 80) {
                progressClass = 'warning';
            }

            return `
                <div class="budget-card" data-id="${budget.id}">
                    <div class="budget-card-header">
                        <div class="budget-category-icon" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon}
                        </div>
                        <div class="budget-category-info">
                            <div class="budget-category-name">${category.name}</div>
                            <div class="budget-category-amount">${this.formatCurrency(budget.amount)} / month</div>
                        </div>
                        <div class="budget-actions">
                            <button class="budget-action-btn edit" data-id="${budget.id}">✏️</button>
                            <button class="budget-action-btn delete" data-id="${budget.id}">🗑️</button>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar">
                            <div class="budget-progress-fill ${progressClass}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="budget-stats">
                        <span class="budget-spent">${this.formatCurrency(spent)} spent</span>
                        <span class="budget-remaining ${remaining >= 0 ? 'positive' : 'negative'}">
                            ${remaining >= 0 ? this.formatCurrency(remaining) + ' left' : this.formatCurrency(Math.abs(remaining)) + ' over'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        // Attach edit handlers
        container.querySelectorAll('.budget-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(btn.dataset.id);
            });
        });

        // Attach delete handlers
        container.querySelectorAll('.budget-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBudget(btn.dataset.id);
            });
        });
    };

    // Load categories into select
    const loadCategoryOptions = (excludeIds = []) => {
        const categories = this.getUserCategories('expense');
        const budgets = getUserBudgets();
        const budgetedCategoryIds = budgets.map(b => b.categoryId);

        budgetCategorySelect.innerHTML = '<option value="">Select a category</option>' +
            categories
                .filter(c => !budgetedCategoryIds.includes(c.id) || excludeIds.includes(c.id))
                .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
                .join('');
    };

    // Open add modal
    const openAddModal = () => {
        modalTitle.textContent = 'Set Budget';
        budgetIdInput.value = '';
        budgetAmountInput.value = '';
        loadCategoryOptions();
        budgetCategorySelect.value = '';
        modal.classList.remove('hidden');
    };

    // Open edit modal
    const openEditModal = (budgetId) => {
        const budgets = getUserBudgets();
        const budget = budgets.find(b => b.id === budgetId);
        
        if (!budget) return;

        modalTitle.textContent = 'Edit Budget';
        budgetIdInput.value = budget.id;
        budgetAmountInput.value = budget.amount;
        loadCategoryOptions([budget.categoryId]);
        budgetCategorySelect.value = budget.categoryId;
        modal.classList.remove('hidden');
    };

    // Close modal
    const closeModal = () => {
        modal.classList.add('hidden');
    };

    // Delete budget
    const deleteBudget = (budgetId) => {
        if (confirm('Delete this budget?')) {
            const budgets = this.getData('budgets') || [];
            const filtered = budgets.filter(b => b.id !== budgetId);
            this.saveData('budgets', filtered);
            this.showToast('Budget deleted', 'success');
            renderBudgets();
        }
    };

    // Month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthLabel();
        renderBudgets();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthLabel();
        renderBudgets();
    });

    // Add button handler
    addBudgetBtn.addEventListener('click', openAddModal);

    // Modal close handlers
    closeBudgetModalBtn.addEventListener('click', closeModal);
    cancelBudgetModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const categoryId = budgetCategorySelect.value;
        const amount = parseFloat(budgetAmountInput.value);
        const editId = budgetIdInput.value;

        if (!categoryId) {
            this.showToast('Please select a category', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }

        const budgets = this.getData('budgets') || [];

        if (editId) {
            // Update existing budget
            const index = budgets.findIndex(b => b.id === editId);
            if (index !== -1) {
                budgets[index] = {
                    ...budgets[index],
                    categoryId: categoryId,
                    amount: amount
                };
                this.saveData('budgets', budgets);
                this.showToast('Budget updated', 'success');
            }
        } else {
            // Add new budget
            const newBudget = {
                id: this.generateId(),
                userId: this.currentUser.id,
                categoryId: categoryId,
                amount: amount,
                createdAt: new Date().toISOString()
            };
            budgets.push(newBudget);
            this.saveData('budgets', budgets);
            this.showToast('Budget added', 'success');
        }

        closeModal();
        renderBudgets();
    });

    // Initial render
    updateMonthLabel();
    renderBudgets();

    // Setup bottom nav
    this.setupBottomNav();
};

BudgetTrackerApp.prototype.initSettingsView = function() {
    console.log('ViewHandler: Initializing Settings view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    // Display user info
    const userNameElement = document.getElementById('settingsUserName');
    const memberSinceElement = document.getElementById('memberSince');

    if (userNameElement) {
        userNameElement.textContent = this.currentUser.name;
    }

    if (memberSinceElement && this.currentUser.createdAt) {
        const date = new Date(this.currentUser.createdAt);
        memberSinceElement.textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    }

    // Categories button
    const categoriesBtn = document.getElementById('categoriesBtn');
    if (categoriesBtn) {
        categoriesBtn.addEventListener('click', () => {
            this.navigation.loadView('categories');
        });
    }

    // Export data button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            this.exportData();
        });
    }

    // Clear data button
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
                if (confirm('This will delete ALL transactions, categories, and budgets. Continue?')) {
                    this.clearAllData();
                    this.showToast('All data cleared', 'success');
                    this.navigation.loadView('splash', false);
                }
            }
        });
    }

    // Change PIN button
    const changePinBtn = document.getElementById('changePinBtn');
    if (changePinBtn) {
        changePinBtn.addEventListener('click', () => {
            this.showToast('Change PIN - Coming soon!', 'info');
        });
    }

    // Currency button
    const currencyBtn = document.getElementById('currencyBtn');
    if (currencyBtn) {
        currencyBtn.addEventListener('click', () => {
            this.showToast('Currency settings - Coming soon!', 'info');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
                this.showToast('Logged out successfully', 'success');
            }
        });
    }

    // Setup bottom nav
    this.setupBottomNav();
};

/**
 * Export user data as JSON file
 */
BudgetTrackerApp.prototype.exportData = function() {
    const data = {
        user: this.currentUser,
        transactions: this.getUserTransactions(),
        categories: this.getUserCategories(),
        budgets: this.getData('budgets') || [],
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Data exported successfully', 'success');
};

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS VIEW
// ═══════════════════════════════════════════════════════════════════════════

BudgetTrackerApp.prototype.initReportsView = function() {
    console.log('ViewHandler: Initializing Reports view');

    if (!this.currentUser) {
        this.navigation.loadView('login', false);
        return;
    }

    const periodBtns = document.querySelectorAll('.period-btn');
    const exportBtn = document.getElementById('exportReportBtn');

    let currentPeriod = 'week';

    // Get date range based on period
    const getDateRange = (period) => {
        const now = new Date();
        const end = new Date(now);
        let start = new Date(now);

        switch (period) {
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - 1);
                break;
        }

        return { start, end };
    };

    // Filter transactions by date range
    const getFilteredTransactions = (period) => {
        const { start, end } = getDateRange(period);
        const transactions = this.getUserTransactions();
        
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });
    };

    // Update summary stats
    const updateSummary = (transactions) => {
        let income = 0;
        let expenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expenses += t.amount;
            }
        });

        const balance = income - expenses;

        document.getElementById('reportIncome').textContent = this.formatCurrency(income);
        document.getElementById('reportExpenses').textContent = this.formatCurrency(expenses);
        document.getElementById('reportBalance').textContent = this.formatCurrency(balance);
    };

    // Render pie chart (expenses by category)
    const renderPieChart = (transactions) => {
        const container = document.getElementById('pieChart');
        const legend = document.getElementById('pieChartLegend');
        const categories = this.getData('categories') || [];
        
        // Calculate expenses by category
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenseTransactions.forEach(t => {
            if (!categoryTotals[t.categoryId]) {
                categoryTotals[t.categoryId] = 0;
            }
            categoryTotals[t.categoryId] += t.amount;
        });

        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            container.innerHTML = '<div class="pie-chart-empty">No expenses</div>';
            legend.innerHTML = '';
            return;
        }

        // Create conic gradient for pie chart
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        let gradientParts = [];
        let currentAngle = 0;

        sortedCategories.forEach(([catId, amount]) => {
            const category = categories.find(c => c.id === catId) || { color: '#ccc' };
            const percentage = (amount / total) * 100;
            const endAngle = currentAngle + percentage;
            gradientParts.push(`${category.color} ${currentAngle}% ${endAngle}%`);
            currentAngle = endAngle;
        });

        container.style.background = `conic-gradient(${gradientParts.join(', ')})`;
        container.innerHTML = '';

        // Create legend
        legend.innerHTML = sortedCategories.map(([catId, amount]) => {
            const category = categories.find(c => c.id === catId) || { icon: '📦', name: 'Other', color: '#ccc' };
            const percentage = ((amount / total) * 100).toFixed(0);
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${category.color}"></div>
                    <span class="legend-label">${category.icon} ${category.name}</span>
                    <span class="legend-value">${percentage}%</span>
                </div>
            `;
        }).join('');
    };

    // Render bar chart (income vs expenses)
    const renderBarChart = (transactions) => {
        const container = document.getElementById('barChartContainer');
        
        let income = 0;
        let expenses = 0;

        transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expenses += t.amount;
            }
        });

        const maxValue = Math.max(income, expenses, 1);
        const incomeHeight = (income / maxValue) * 100;
        const expenseHeight = (expenses / maxValue) * 100;

        container.innerHTML = `
            <div class="bar-group">
                <div class="bar-value">${this.formatCurrency(income)}</div>
                <div class="bar-wrapper">
                    <div class="bar income" style="height: ${incomeHeight}px"></div>
                </div>
                <div class="bar-label">Income</div>
            </div>
            <div class="bar-group">
                <div class="bar-value">${this.formatCurrency(expenses)}</div>
                <div class="bar-wrapper">
                    <div class="bar expense" style="height: ${expenseHeight}px"></div>
                </div>
                <div class="bar-label">Expenses</div>
            </div>
        `;
    };

    // Render line chart (spending trend)
    const renderLineChart = (transactions, period) => {
        const container = document.getElementById('lineChartContainer');
        
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        if (expenseTransactions.length === 0) {
            container.innerHTML = '<div class="line-chart-empty">No spending data</div>';
            return;
        }

        // Group by day/week/month depending on period
        const grouped = {};
        expenseTransactions.forEach(t => {
            const date = new Date(t.date);
            let key;
            if (period === 'year') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = t.date;
            }
            if (!grouped[key]) grouped[key] = 0;
            grouped[key] += t.amount;
        });

        const sortedKeys = Object.keys(grouped).sort();
        const values = sortedKeys.map(k => grouped[k]);
        const maxVal = Math.max(...values, 1);

        // Create SVG line chart
        const width = 280;
        const height = 120;
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const points = values.map((val, i) => {
            const x = padding + (i / Math.max(values.length - 1, 1)) * chartWidth;
            const y = height - padding - (val / maxVal) * chartHeight;
            return { x, y, val };
        });

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

        container.innerHTML = `
            <svg class="line-chart-svg" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#E74C3C;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#E74C3C;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="${areaD}" fill="url(#areaGradient)" />
                <path d="${pathD}" fill="none" stroke="#E74C3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#E74C3C" />`).join('')}
            </svg>
        `;
    };

    // Render top spending categories
    const renderTopCategories = (transactions) => {
        const container = document.getElementById('topCategories');
        const categories = this.getData('categories') || [];
        
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        expenseTransactions.forEach(t => {
            if (!categoryTotals[t.categoryId]) {
                categoryTotals[t.categoryId] = 0;
            }
            categoryTotals[t.categoryId] += t.amount;
        });

        const sorted = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sorted.length === 0) {
            container.innerHTML = '<div class="reports-empty">No spending data</div>';
            return;
        }

        const maxAmount = sorted[0][1];

        container.innerHTML = sorted.map(([catId, amount], index) => {
            const category = categories.find(c => c.id === catId) || { icon: '📦', name: 'Other', color: '#ccc' };
            const percentage = (amount / maxAmount) * 100;
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';

            return `
                <div class="top-category-item">
                    <div class="top-category-rank ${rankClass}">${index + 1}</div>
                    <span class="top-category-icon">${category.icon}</span>
                    <div class="top-category-info">
                        <div class="top-category-name">${category.name}</div>
                        <div class="top-category-bar">
                            <div class="top-category-fill" style="width: ${percentage}%; background: ${category.color}"></div>
                        </div>
                    </div>
                    <span class="top-category-amount">${this.formatCurrency(amount)}</span>
                </div>
            `;
        }).join('');
    };

    // Update all charts
    const updateReports = () => {
        const transactions = getFilteredTransactions(currentPeriod);
        updateSummary(transactions);
        renderPieChart(transactions);
        renderBarChart(transactions);
        renderLineChart(transactions, currentPeriod);
        renderTopCategories(transactions);
    };

    // Period button handlers
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            updateReports();
        });
    });

    // Export button handler
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            this.exportReportAsCSV(currentPeriod);
        });
    }

    // Initial render
    updateReports();

    // Setup bottom nav
    this.setupBottomNav();
};

/**
 * Export report data as CSV
 */
BudgetTrackerApp.prototype.exportReportAsCSV = function(period) {
    const transactions = this.getUserTransactions();
    const categories = this.getData('categories') || [];
    
    if (transactions.length === 0) {
        this.showToast('No data to export', 'error');
        return;
    }

    // Create CSV content
    let csv = 'Date,Type,Category,Description,Amount\n';
    
    transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(t => {
            const category = categories.find(c => c.id === t.categoryId);
            const categoryName = category ? category.name : 'Other';
            const row = [
                t.date,
                t.type,
                categoryName,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                t.amount.toFixed(2)
            ];
            csv += row.join(',') + '\n';
        });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Report exported as CSV', 'success');
};
