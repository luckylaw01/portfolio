/* ===================================
   PAYMENT VIEW HANDLERS
   Payment, Wallet, and Transaction Management
   =================================== */

XApp.prototype.initPaymentsView = function () {
    console.log('Payments view initialized');

    // Initialize bottom navigation
    this.initBottomNav('payments');

    // Display wallet balance
    this.displayWalletBalance();

    // Load transactions
    this.loadTransactions();

    // Add Money button
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => {
            this.showAddMoneyDialog();
        });
    }

    // Send Money button (top)
    const sendMoneyBtn = document.getElementById('sendMoneyBtn');
    if (sendMoneyBtn) {
        sendMoneyBtn.addEventListener('click', () => {
            this.showSendMoneyDialog();
        });
    }

    // Send Money action card
    const sendMoneyAction = document.getElementById('sendMoneyAction');
    if (sendMoneyAction) {
        sendMoneyAction.addEventListener('click', () => {
            this.showSendMoneyDialog();
        });
    }

    // Request Money action
    const requestMoneyAction = document.getElementById('requestMoneyAction');
    if (requestMoneyAction) {
        requestMoneyAction.addEventListener('click', () => {
            this.showRequestMoneyDialog();
        });
    }

    // Shop action
    const shopAction = document.getElementById('shopAction');
    if (shopAction) {
        shopAction.addEventListener('click', () => {
            this.navigation.loadView('shop');
        });
    }

    // Invest action
    const investAction = document.getElementById('investAction');
    if (investAction) {
        investAction.addEventListener('click', () => {
            this.navigation.loadView('invest');
        });
    }

    // View all transactions
    const viewAllTransactions = document.getElementById('viewAllTransactions');
    if (viewAllTransactions) {
        viewAllTransactions.addEventListener('click', () => {
            this.showAllTransactions();
        });
    }

    // Payment settings
    const paymentSettingsBtn = document.getElementById('paymentSettingsBtn');
    if (paymentSettingsBtn) {
        paymentSettingsBtn.addEventListener('click', () => {
            this.showPaymentSettings();
        });
    }
};

XApp.prototype.displayWalletBalance = function () {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0 };

    const balanceElement = document.getElementById('balanceAmount');
    if (balanceElement) {
        balanceElement.textContent = `$${userWallet.balance.toFixed(2)}`;
    }
};

XApp.prototype.loadTransactions = function (limit = 5) {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { transactions: [] };
    const transactions = userWallet.transactions || [];

    const container = document.getElementById('transactionsContainer');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-transactions">
                <div class="empty-icon">💳</div>
                <h3>No transactions yet</h3>
                <p>Your payment history will appear here</p>
            </div>
        `;
        return;
    }

    // Sort by date (most recent first)
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    // Display limited transactions
    const displayTransactions = sortedTransactions.slice(0, limit);

    container.innerHTML = displayTransactions.map(txn => {
        const isSent = txn.type === 'sent' || txn.type === 'payment';
        const icon = isSent ? '📤' : '📥';
        const iconClass = isSent ? 'sent' : 'received';
        const amountClass = isSent ? 'sent' : 'received';
        const amountPrefix = isSent ? '-' : '+';

        return `
            <div class="transaction-item">
                <div class="transaction-icon ${iconClass}">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-name">${txn.description}</div>
                    <div class="transaction-date">${this.formatRelativeTime(txn.date)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}$${Math.abs(txn.amount).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
};

XApp.prototype.showAddMoneyDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Add Money</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Amount</label>
                    <input type="number" id="addMoneyAmount" placeholder="Enter amount" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="1" step="0.01" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Payment Method</label>
                    <select id="paymentMethod" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </div>
                <button id="confirmAddMoney" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Add Money
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const confirmBtn = dialog.querySelector('#confirmAddMoney');
    const amountInput = dialog.querySelector('#addMoneyAmount');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    confirmBtn.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        // Add money to wallet
        const wallets = this.getData('wallets') || {};
        if (!wallets[this.currentUser.id]) {
            wallets[this.currentUser.id] = { balance: 0, transactions: [] };
        }

        wallets[this.currentUser.id].balance += amount;
        wallets[this.currentUser.id].transactions.unshift({
            id: Date.now(),
            type: 'received',
            amount: amount,
            description: 'Money Added',
            date: new Date().toISOString()
        });

        this.saveData('wallets', wallets);

        this.showNotification(`$${amount.toFixed(2)} added successfully!`, 'success');
        dialog.remove();

        // Refresh display
        this.displayWalletBalance();
        this.loadTransactions();
    });

    amountInput.focus();
};

XApp.prototype.showSendMoneyDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    const users = this.getData('users') || [];
    const otherUsers = users.filter(u => u.id !== this.currentUser.id);

    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Send Money</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Recipient</label>
                    <select id="recipient" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="">Select recipient</option>
                        ${otherUsers.map(u => `<option value="${u.id}">@${u.username} (${u.name})</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Amount</label>
                    <input type="number" id="sendAmount" placeholder="Enter amount" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="0.01" step="0.01" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Note (Optional)</label>
                    <input type="text" id="sendNote" placeholder="What's this for?" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" />
                </div>
                <button id="confirmSendMoney" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Send Money
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const confirmBtn = dialog.querySelector('#confirmSendMoney');
    const recipientSelect = dialog.querySelector('#recipient');
    const amountInput = dialog.querySelector('#sendAmount');
    const noteInput = dialog.querySelector('#sendNote');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    confirmBtn.addEventListener('click', () => {
        const recipientId = parseInt(recipientSelect.value);
        const amount = parseFloat(amountInput.value);
        const note = noteInput.value || 'Payment';

        if (!recipientId) {
            this.showNotification('Please select a recipient', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const wallets = this.getData('wallets') || {};
        const senderWallet = wallets[this.currentUser.id] || { balance: 0, transactions: [] };

        if (senderWallet.balance < amount) {
            this.showNotification('Insufficient balance', 'error');
            return;
        }

        const recipient = this.getUserById(recipientId);

        // Deduct from sender
        wallets[this.currentUser.id].balance -= amount;
        wallets[this.currentUser.id].transactions.unshift({
            id: Date.now(),
            type: 'sent',
            amount: amount,
            description: `Sent to @${recipient.username}`,
            note: note,
            date: new Date().toISOString()
        });

        // Add to recipient
        if (!wallets[recipientId]) {
            wallets[recipientId] = { balance: 0, transactions: [] };
        }
        wallets[recipientId].balance += amount;
        wallets[recipientId].transactions.unshift({
            id: Date.now(),
            type: 'received',
            amount: amount,
            description: `Received from @${this.currentUser.username}`,
            note: note,
            date: new Date().toISOString()
        });

        this.saveData('wallets', wallets);

        this.showNotification(`$${amount.toFixed(2)} sent to @${recipient.username}`, 'success');
        dialog.remove();

        // Refresh display
        this.displayWalletBalance();
        this.loadTransactions();
    });
};

XApp.prototype.showRequestMoneyDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    const users = this.getData('users') || [];
    const otherUsers = users.filter(u => u.id !== this.currentUser.id);

    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Request Money</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">From</label>
                    <select id="requestFrom" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="">Select person</option>
                        ${otherUsers.map(u => `<option value="${u.id}">@${u.username} (${u.name})</option>`).join('')}
                    </select>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Amount</label>
                    <input type="number" id="requestAmount" placeholder="Enter amount" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="0.01" step="0.01" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Reason</label>
                    <input type="text" id="requestReason" placeholder="What's this for?" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" />
                </div>
                <button id="confirmRequestMoney" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Send Request
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const confirmBtn = dialog.querySelector('#confirmRequestMoney');
    const fromSelect = dialog.querySelector('#requestFrom');
    const amountInput = dialog.querySelector('#requestAmount');
    const reasonInput = dialog.querySelector('#requestReason');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    confirmBtn.addEventListener('click', () => {
        const fromUserId = parseInt(fromSelect.value);
        const amount = parseFloat(amountInput.value);
        const reason = reasonInput.value || 'Payment request';

        if (!fromUserId) {
            this.showNotification('Please select a person', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const fromUser = this.getUserById(fromUserId);

        // In a real app, this would send a notification to the user
        this.showNotification(`Request sent to @${fromUser.username} for $${amount.toFixed(2)}`, 'success');
        dialog.remove();
    });
};

XApp.prototype.showAllTransactions = function () {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { transactions: [] };
    const transactions = userWallet.transactions || [];

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="position: sticky; top: 0; background: var(--x-black); z-index: 1;">
                <h2>All Transactions</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                ${transactions.length === 0 ? `
                    <div style="padding: 60px 40px; text-align: center;">
                        <div style="font-size: 60px; margin-bottom: 16px;">💳</div>
                        <h3 style="font-size: 18px; margin-bottom: 8px;">No transactions yet</h3>
                        <p style="color: var(--x-gray); font-size: 14px;">Your payment history will appear here</p>
                    </div>
                ` : transactions.map(txn => {
        const isSent = txn.type === 'sent' || txn.type === 'payment';
        const icon = isSent ? '📤' : '📥';
        const iconClass = isSent ? 'sent' : 'received';
        const amountClass = isSent ? 'sent' : 'received';
        const amountPrefix = isSent ? '-' : '+';

        return `
                        <div class="transaction-item">
                            <div class="transaction-icon ${iconClass}">${icon}</div>
                            <div class="transaction-details">
                                <div class="transaction-name">${txn.description}</div>
                                <div class="transaction-date">${this.formatRelativeTime(txn.date)}</div>
                                ${txn.note ? `<div style="font-size: 12px; color: var(--x-gray); margin-top: 2px;">${txn.note}</div>` : ''}
                            </div>
                            <div class="transaction-amount ${amountClass}">
                                ${amountPrefix}$${Math.abs(txn.amount).toFixed(2)}
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });
};

XApp.prototype.showPaymentSettings = function () {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0, transactions: [] };

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header" style="position: sticky; top: 0; background: var(--x-black); z-index: 1;">
                <h2>Payment Settings</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <!-- Account Info -->
                <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 16px;">
                    <h3 style="font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">Payment Account</h3>
                    <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">@${this.currentUser.username}</div>
                    <div style="font-size: 14px; color: var(--x-gray);">Account ID: ${this.currentUser.id}</div>
                </div>
                
                <!-- QR Code -->
                <div style="padding: 20px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 16px; text-align: center;">
                    <h3 style="font-size: 14px; color: var(--x-gray); margin-bottom: 12px;">Your Payment QR Code</h3>
                    <div style="background: white; width: 200px; height: 200px; margin: 0 auto 12px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 80px;">
                        📱
                    </div>
                    <button class="btn btn-outline" style="width: 100%;" onclick="app.showNotification('QR Code saved!', 'success')">
                        Save QR Code
                    </button>
                </div>
                
                <!-- Payment Methods -->
                <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Payment Methods</h3>
                    <button class="btn btn-outline" style="width: 100%; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 12px;" onclick="app.showNotification('Add payment method coming soon!', 'info')">
                        <span style="font-size: 20px;">💳</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">Add Card</div>
                            <div style="font-size: 12px; color: var(--x-gray);">Credit or Debit Card</div>
                        </div>
                        <span style="font-size: 20px;">+</span>
                    </button>
                    <button class="btn btn-outline" style="width: 100%; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 12px;" onclick="app.showNotification('Add bank account coming soon!', 'info')">
                        <span style="font-size: 20px;">🏦</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">Add Bank Account</div>
                            <div style="font-size: 12px; color: var(--x-gray);">Link your bank</div>
                        </div>
                        <span style="font-size: 20px;">+</span>
                    </button>
                </div>
                
                <!-- Security -->
                <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Security</h3>
                    <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 4px;">Require PIN for payments</div>
                            <div style="font-size: 12px; color: var(--x-gray);">Add extra security</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="requirePinToggle">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <button class="btn btn-outline" style="width: 100%;" onclick="app.showNotification('Change PIN coming soon!', 'info')">
                        Change Payment PIN
                    </button>
                </div>
                
                <!-- Transaction Limits -->
                <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Limits</h3>
                    <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--x-gray);">Daily limit</span>
                            <span style="font-weight: 600;">$10,000</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--x-gray);">Per transaction</span>
                            <span style="font-weight: 600;">$5,000</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--x-gray);">Monthly limit</span>
                            <span style="font-weight: 600;">$50,000</span>
                        </div>
                    </div>
                </div>
                
                <!-- Stats -->
                <div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 16px;">
                    <h3 style="font-size: 14px; color: var(--x-gray); margin-bottom: 12px;">Statistics</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Total Transactions</span>
                        <span style="font-weight: 600;">${userWallet.transactions.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Member Since</span>
                        <span style="font-weight: 600;">${new Date(this.currentUser.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });
};

/* ===================================
   INVEST VIEW
   =================================== */

XApp.prototype.initInvestView = function () {
    console.log('Invest view initialized');

    // Initialize bottom navigation
    this.initBottomNav('invest');

    // Sample market data
    const stocks = [
        { symbol: 'TSLA', name: 'Tesla', icon: '🚗', price: 242.84, change: 5.23, changePercent: 2.2 },
        { symbol: 'AAPL', name: 'Apple', icon: '🍎', price: 189.95, change: -1.12, changePercent: -0.6 },
        { symbol: 'GOOGL', name: 'Alphabet', icon: '🔍', price: 141.80, change: 3.45, changePercent: 2.5 },
        { symbol: 'MSFT', name: 'Microsoft', icon: '💻', price: 378.91, change: 2.15, changePercent: 0.6 },
        { symbol: 'AMZN', name: 'Amazon', icon: '📦', price: 151.94, change: -0.89, changePercent: -0.6 },
        { symbol: 'NVDA', name: 'NVIDIA', icon: '🎮', price: 495.22, change: 12.34, changePercent: 2.6 }
    ];

    const crypto = [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 44250.50, change: 1250.30, changePercent: 2.9 },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 2340.75, change: -45.20, changePercent: -1.9 },
        { symbol: 'DOGE', name: 'Dogecoin', icon: '🐕', price: 0.089, change: 0.002, changePercent: 2.3 }
    ];

    // Load portfolio data
    const portfolio = this.getData('portfolio') || { holdings: [], totalInvested: 0 };
    const portfolioValue = this.calculatePortfolioValue(portfolio, stocks, crypto);

    // Display portfolio stats
    document.getElementById('portfolioValue').textContent = '$' + portfolioValue.toFixed(2);
    document.getElementById('totalInvested').textContent = '$' + portfolio.totalInvested.toFixed(2);

    const totalReturn = portfolioValue - portfolio.totalInvested;
    const returnPercent = portfolio.totalInvested > 0 ? (totalReturn / portfolio.totalInvested * 100) : 0;

    document.getElementById('totalReturn').textContent = '$' + totalReturn.toFixed(2);
    document.getElementById('portfolioChange').textContent =
        (totalReturn >= 0 ? '+' : '') + '$' + totalReturn.toFixed(2) + ' (' + returnPercent.toFixed(2) + '%)';
    document.getElementById('portfolioChange').style.color = totalReturn >= 0 ? 'var(--x-green)' : 'var(--x-red)';

    // Load stocks
    this.loadStocks(stocks);

    // Load crypto
    this.loadCrypto(crypto);

    // Buy stocks button
    const buyStocksBtn = document.getElementById('buyStocksBtn');
    if (buyStocksBtn) {
        buyStocksBtn.addEventListener('click', () => {
            this.showNotification('Select an asset from the list below', 'info');
        });
    }

    // View portfolio button
    const viewPortfolioBtn = document.getElementById('viewPortfolioBtn');
    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', () => {
            this.showPortfolioDialog(portfolio, stocks, crypto);
        });
    }

    // Info button
    const investInfoBtn = document.getElementById('investInfoBtn');
    if (investInfoBtn) {
        investInfoBtn.addEventListener('click', () => {
            this.showNotification('Investment feature - Trade stocks & crypto!', 'info');
        });
    }
};

XApp.prototype.calculatePortfolioValue = function (portfolio, stocks, crypto) {
    let total = 0;
    portfolio.holdings.forEach(holding => {
        const asset = [...stocks, ...crypto].find(a => a.symbol === holding.symbol);
        if (asset) {
            total += holding.quantity * asset.price;
        }
    });
    return total;
};

XApp.prototype.loadStocks = function (stocks) {
    const container = document.getElementById('stocksContainer');
    if (!container) return;

    container.innerHTML = stocks.map(stock => {
        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeSign = stock.change >= 0 ? '+' : '';

        return '<div class="stock-item" data-symbol="' + stock.symbol + '">' +
            '<div class="stock-icon">' + stock.icon + '</div>' +
            '<div class="stock-details">' +
            '<div class="stock-name">' + stock.name + '</div>' +
            '<div class="stock-symbol">' + stock.symbol + '</div>' +
            '</div>' +
            '<div class="stock-price">' +
            '<div class="price-amount">$' + stock.price.toFixed(2) + '</div>' +
            '<div class="price-change ' + changeClass + '">' +
            changeSign + stock.changePercent.toFixed(2) + '%' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');

    // Add click handlers
    container.querySelectorAll('.stock-item').forEach(item => {
        item.addEventListener('click', () => {
            const symbol = item.dataset.symbol;
            const stock = stocks.find(s => s.symbol === symbol);
            this.showAssetDetail(stock, 'stock');
        });
    });
};

XApp.prototype.loadCrypto = function (crypto) {
    const container = document.getElementById('cryptoContainer');
    if (!container) return;

    container.innerHTML = crypto.map(coin => {
        const changeClass = coin.change >= 0 ? 'positive' : 'negative';
        const changeSign = coin.change >= 0 ? '+' : '';

        return '<div class="crypto-item" data-symbol="' + coin.symbol + '">' +
            '<div class="crypto-icon">' + coin.icon + '</div>' +
            '<div class="crypto-details">' +
            '<div class="crypto-name">' + coin.name + '</div>' +
            '<div class="crypto-symbol">' + coin.symbol + '</div>' +
            '</div>' +
            '<div class="crypto-price">' +
            '<div class="price-amount">$' + coin.price.toFixed(2) + '</div>' +
            '<div class="price-change ' + changeClass + '">' +
            changeSign + coin.changePercent.toFixed(2) + '%' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');

    // Add click handlers
    container.querySelectorAll('.crypto-item').forEach(item => {
        item.addEventListener('click', () => {
            const symbol = item.dataset.symbol;
            const coin = crypto.find(c => c.symbol === symbol);
            this.showAssetDetail(coin, 'crypto');
        });
    });
};

XApp.prototype.showAssetDetail = function (asset, type) {
    const portfolio = this.getData('portfolio') || { holdings: [], totalInvested: 0 };
    const holding = portfolio.holdings.find(h => h.symbol === asset.symbol);

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    const changeColor = asset.change >= 0 ? 'var(--x-green)' : 'var(--x-red)';
    const changeSign = asset.change >= 0 ? '+' : '';

    let holdingHtml = '';
    if (holding) {
        holdingHtml = '<div style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 16px;">' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
            '<span style="color: var(--x-gray);">Your Holdings</span>' +
            '<span style="font-weight: 600;">' + holding.quantity + ' ' + asset.symbol + '</span>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between;">' +
            '<span style="color: var(--x-gray);">Value</span>' +
            '<span style="font-weight: 600; color: var(--x-blue);">$' + (holding.quantity * asset.price).toFixed(2) + '</span>' +
            '</div>' +
            '</div>';
    }

    dialog.innerHTML = '<div class="modal-content" style="max-width: 400px;">' +
        '<div class="modal-header">' +
        '<h2>' + asset.icon + ' ' + asset.name + '</h2>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="text-align: center; padding: 20px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 16px;">' +
        '<div style="font-size: 14px; color: var(--x-gray); margin-bottom: 8px;">' + asset.symbol + '</div>' +
        '<div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">$' + asset.price.toFixed(2) + '</div>' +
        '<div style="font-size: 16px; color: ' + changeColor + ';">' +
        changeSign + asset.change.toFixed(2) + ' (' + asset.changePercent.toFixed(2) + '%)' +
        '</div>' +
        '</div>' +
        holdingHtml +
        '<div style="display: flex; gap: 12px;">' +
        '<button id="buyAssetBtn" class="btn btn-primary" style="flex: 1;">Buy</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    const buyBtn = dialog.querySelector('#buyAssetBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            dialog.remove();
            this.showBuyAssetDialog(asset);
        });
    }
};

XApp.prototype.showBuyAssetDialog = function (asset) {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0 };

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = '<div class="modal-content" style="max-width: 400px;">' +
        '<div class="modal-header">' +
        '<h2>Buy ' + asset.symbol + '</h2>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div style="margin-bottom: 16px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
        '<span style="color: var(--x-gray);">Price per unit</span>' +
        '<span style="font-weight: 600;">$' + asset.price.toFixed(2) + '</span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between;">' +
        '<span style="color: var(--x-gray);">Available balance</span>' +
        '<span style="font-weight: 600; color: var(--x-blue);">$' + userWallet.balance.toFixed(2) + '</span>' +
        '</div>' +
        '</div>' +
        '<div style="margin-bottom: 16px;">' +
        '<label style="display: block; margin-bottom: 8px; font-weight: 600;">Quantity</label>' +
        '<input type="number" id="buyQuantity" placeholder="Enter quantity" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" min="0.001" step="0.001" value="1" />' +
        '</div>' +
        '<div id="totalCost" style="margin-bottom: 16px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px; text-align: center;">' +
        '<div style="font-size: 14px; color: var(--x-gray); margin-bottom: 4px;">Total Cost</div>' +
        '<div style="font-size: 24px; font-weight: 700; color: var(--x-blue);">$' + asset.price.toFixed(2) + '</div>' +
        '</div>' +
        '<button id="confirmBuy" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">Confirm Purchase</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const quantityInput = dialog.querySelector('#buyQuantity');
    const totalCostDiv = dialog.querySelector('#totalCost div:last-child');
    const confirmBtn = dialog.querySelector('#confirmBuy');

    quantityInput.addEventListener('input', () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const total = quantity * asset.price;
        totalCostDiv.textContent = '$' + total.toFixed(2);
    });

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    confirmBtn.addEventListener('click', () => {
        const quantity = parseFloat(quantityInput.value);
        const totalCost = quantity * asset.price;

        if (!quantity || quantity <= 0) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }

        if (userWallet.balance < totalCost) {
            this.showNotification('Insufficient balance', 'error');
            return;
        }

        // Deduct from wallet
        wallets[this.currentUser.id].balance -= totalCost;
        wallets[this.currentUser.id].transactions.unshift({
            id: Date.now(),
            type: 'payment',
            amount: totalCost,
            description: 'Bought ' + quantity + ' ' + asset.symbol,
            date: new Date().toISOString()
        });
        this.saveData('wallets', wallets);

        // Add to portfolio
        const portfolio = this.getData('portfolio') || { holdings: [], totalInvested: 0 };
        const existingHolding = portfolio.holdings.find(h => h.symbol === asset.symbol);

        if (existingHolding) {
            existingHolding.quantity += quantity;
            existingHolding.avgPrice = ((existingHolding.avgPrice * (existingHolding.quantity - quantity)) + (asset.price * quantity)) / existingHolding.quantity;
        } else {
            portfolio.holdings.push({
                symbol: asset.symbol,
                name: asset.name,
                quantity: quantity,
                avgPrice: asset.price
            });
        }

        portfolio.totalInvested += totalCost;
        this.saveData('portfolio', portfolio);

        this.showNotification('Bought ' + quantity + ' ' + asset.symbol + ' for $' + totalCost.toFixed(2), 'success');
        dialog.remove();

        // Refresh view
        this.navigation.loadView('invest', false);
    });
};

XApp.prototype.showPortfolioDialog = function (portfolio, stocks, crypto) {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';

    let holdingsHtml;
    if (portfolio.holdings.length === 0) {
        holdingsHtml = '<div style="padding: 60px 20px; text-align: center;">' +
            '<div style="font-size: 60px; margin-bottom: 16px;">📊</div>' +
            '<h3 style="font-size: 18px; margin-bottom: 8px;">No holdings yet</h3>' +
            '<p style="color: var(--x-gray); font-size: 14px;">Start investing to build your portfolio</p>' +
            '</div>';
    } else {
        holdingsHtml = portfolio.holdings.map(holding => {
            const asset = [...stocks, ...crypto].find(a => a.symbol === holding.symbol);
            if (!asset) return '';

            const currentValue = holding.quantity * asset.price;
            const investedValue = holding.quantity * holding.avgPrice;
            const profit = currentValue - investedValue;
            const profitPercent = (profit / investedValue * 100);
            const profitColor = profit >= 0 ? 'var(--x-green)' : 'var(--x-red)';
            const profitSign = profit >= 0 ? '+' : '';

            return '<div style="padding: 16px; border-bottom: 1px solid var(--x-border);">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
                '<div>' +
                '<div style="font-weight: 600;">' + asset.name + ' (' + asset.symbol + ')</div>' +
                '<div style="font-size: 13px; color: var(--x-gray);">' + holding.quantity + ' @ $' + holding.avgPrice.toFixed(2) + '</div>' +
                '</div>' +
                '<div style="text-align: right;">' +
                '<div style="font-weight: 600;">$' + currentValue.toFixed(2) + '</div>' +
                '<div style="font-size: 13px; color: ' + profitColor + ';">' +
                profitSign + '$' + profit.toFixed(2) + ' (' + profitPercent.toFixed(2) + '%)' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    dialog.innerHTML = '<div class="modal-content" style="max-width: 340px; max-height: 80vh; overflow-y: auto;">' +
        '<div class="modal-header">' +
        '<h2>My Portfolio</h2>' +
        '<button class="modal-close">×</button>' +
        '</div>' +
        '<div class="modal-body" style="padding: 0;">' +
        holdingsHtml +
        '</div>' +
        '</div>';

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });
};
