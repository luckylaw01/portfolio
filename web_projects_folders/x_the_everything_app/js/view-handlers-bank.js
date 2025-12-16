/* ===================================
   BANK VIEW HANDLERS
   Banking Services - Loans, Mortgages, Savings, Credit Cards, Insurance
   =================================== */

XApp.prototype.initBankView = function () {
    console.log('Bank view initialized');

    // Initialize bottom navigation
    this.initBottomNav('bank');

    // Display bank balance (same as wallet balance)
    this.displayBankBalance();

    // Load bank products
    this.loadBankProducts();

    // Service handlers
    const loansService = document.getElementById('loansService');
    if (loansService) {
        loansService.addEventListener('click', () => {
            this.showLoansDialog();
        });
    }

    const mortgagesService = document.getElementById('mortgagesService');
    if (mortgagesService) {
        mortgagesService.addEventListener('click', () => {
            this.showMortgagesDialog();
        });
    }

    const savingsService = document.getElementById('savingsService');
    if (savingsService) {
        savingsService.addEventListener('click', () => {
            this.showSavingsDialog();
        });
    }

    const creditCardService = document.getElementById('creditCardService');
    if (creditCardService) {
        creditCardService.addEventListener('click', () => {
            this.showCreditCardDialog();
        });
    }

    const insuranceService = document.getElementById('insuranceService');
    if (insuranceService) {
        insuranceService.addEventListener('click', () => {
            this.showInsuranceDialog();
        });
    }

    // View all products
    const viewAllProducts = document.getElementById('viewAllProducts');
    if (viewAllProducts) {
        viewAllProducts.addEventListener('click', () => {
            this.showAllBankProducts();
        });
    }

    // Info button
    const bankInfoBtn = document.getElementById('bankInfoBtn');
    if (bankInfoBtn) {
        bankInfoBtn.addEventListener('click', () => {
            this.showNotification('Banking services - Loans, mortgages & more!', 'info');
        });
    }
};

XApp.prototype.displayBankBalance = function () {
    const wallets = this.getData('wallets') || {};
    const userWallet = wallets[this.currentUser.id] || { balance: 0 };

    const balanceElement = document.getElementById('bankBalance');
    if (balanceElement) {
        balanceElement.textContent = `$${userWallet.balance.toFixed(2)}`;
    }
};

XApp.prototype.loadBankProducts = function () {
    const bankProducts = this.getData('bankProducts') || {};
    const userProducts = bankProducts[this.currentUser.id] || [];

    const container = document.getElementById('bankProductsContainer');
    if (!container) return;

    if (userProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-products">
                <div class="empty-icon">🏦</div>
                <h3>No active products</h3>
                <p>Apply for banking services to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = userProducts.map(product => {
        let icon = '💰';
        if (product.type === 'loan') icon = '💵';
        if (product.type === 'mortgage') icon = '🏠';
        if (product.type === 'savings') icon = '🏦';
        if (product.type === 'credit_card') icon = '💳';
        if (product.type === 'insurance') icon = '🛡️';

        return `
            <div class="product-item">
                <div class="product-icon">${icon}</div>
                <div class="product-details">
                    <div class="product-name">${product.name}</div>
                    <div class="product-info">${product.info}</div>
                </div>
                <div class="product-amount">
                    <div class="amount-value">$${product.amount.toFixed(2)}</div>
                    <div class="amount-status">${product.status}</div>
                </div>
            </div>
        `;
    }).join('');
};

/* ===================================
   LOANS SERVICE
   =================================== */

XApp.prototype.showLoansDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 340px;">
            <div class="modal-header">
                <h2>Personal Loans</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Loan Options</h3>
                    <p style="color: var(--x-gray); font-size: 14px; line-height: 1.5;">
                        Get approved for loans up to $50,000 with competitive rates starting at 5.99% APR.
                    </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Loan Amount</label>
                    <input type="number" id="loanAmount" placeholder="Enter amount" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="1000" step="100" value="5000" />
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Loan Term (months)</label>
                    <select id="loanTerm" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                        <option value="36" selected>36 months</option>
                        <option value="48">48 months</option>
                        <option value="60">60 months</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Purpose</label>
                    <select id="loanPurpose" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="personal">Personal Use</option>
                        <option value="business">Business</option>
                        <option value="education">Education</option>
                        <option value="medical">Medical</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div id="loanEstimate" style="margin-bottom: 16px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--x-gray);">Monthly Payment</span>
                        <span style="font-weight: 600; color: var(--x-blue);">$152.07</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--x-gray);">Interest Rate</span>
                        <span style="font-weight: 600;">6.99% APR</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--x-gray);">Total Repayment</span>
                        <span style="font-weight: 600;">$5,474.52</span>
                    </div>
                </div>
                
                <button id="applyLoan" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Apply for Loan
                </button>
            </div>
        </div>
    `;

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const applyBtn = dialog.querySelector('#applyLoan');
    const amountInput = dialog.querySelector('#loanAmount');
    const termSelect = dialog.querySelector('#loanTerm');

    const updateEstimate = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const term = parseInt(termSelect.value) || 36;
        const rate = 0.0699 / 12; // Monthly rate
        const payment = amount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
        const total = payment * term;

        dialog.querySelector('#loanEstimate div:nth-child(1) span:last-child').textContent = `$${payment.toFixed(2)}`;
        dialog.querySelector('#loanEstimate div:nth-child(3) span:last-child').textContent = `$${total.toFixed(2)}`;
    };

    amountInput.addEventListener('input', updateEstimate);
    termSelect.addEventListener('change', updateEstimate);

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    applyBtn.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);
        const term = parseInt(termSelect.value);
        const purpose = dialog.querySelector('#loanPurpose').value;

        if (!amount || amount < 1000) {
            this.showNotification('Minimum loan amount is $1,000', 'error');
            return;
        }

        // Add to bank products
        const bankProducts = this.getData('bankProducts') || {};
        if (!bankProducts[this.currentUser.id]) {
            bankProducts[this.currentUser.id] = [];
        }

        bankProducts[this.currentUser.id].push({
            id: Date.now(),
            type: 'loan',
            name: 'Personal Loan',
            info: `${term} months at 6.99% APR`,
            amount: amount,
            status: 'Active',
            term: term,
            purpose: purpose,
            createdAt: new Date().toISOString()
        });

        this.saveData('bankProducts', bankProducts);

        // Add funds to wallet
        const wallets = this.getData('wallets') || {};
        if (!wallets[this.currentUser.id]) {
            wallets[this.currentUser.id] = { balance: 0, transactions: [] };
        }
        wallets[this.currentUser.id].balance += amount;
        wallets[this.currentUser.id].transactions.unshift({
            id: Date.now(),
            type: 'received',
            amount: amount,
            description: 'Loan Disbursement',
            date: new Date().toISOString()
        });
        this.saveData('wallets', wallets);

        this.showNotification(`Loan of $${amount.toFixed(2)} approved!`, 'success');
        dialog.remove();

        // Refresh view
        this.navigation.loadView('bank', false);
    });
};

/* ===================================
   MORTGAGES SERVICE
   =================================== */

XApp.prototype.showMortgagesDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 340px;">
            <div class="modal-header">
                <h2>Home Mortgages</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Mortgage Options</h3>
                    <p style="color: var(--x-gray); font-size: 14px; line-height: 1.5;">
                        Finance your dream home with rates as low as 3.5% APR for qualified buyers.
                    </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Home Price</label>
                    <input type="number" id="homePrice" placeholder="Enter price" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="50000" step="1000" value="300000" />
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Down Payment</label>
                    <input type="number" id="downPayment" placeholder="Enter down payment" 
                           style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;" 
                           min="0" step="1000" value="60000" />
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Loan Term (years)</label>
                    <select id="mortgageTerm" style="width: 100%; padding: 12px; background: var(--x-dark-gray); border: 1px solid var(--x-border); border-radius: 8px; color: var(--x-white); font-size: 16px;">
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="30" selected>30 years</option>
                    </select>
                </div>
                
                <div id="mortgageEstimate" style="margin-bottom: 16px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--x-gray);">Loan Amount</span>
                        <span style="font-weight: 600;">$240,000</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--x-gray);">Monthly Payment</span>
                        <span style="font-weight: 600; color: var(--x-blue);">$1,011.31</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--x-gray);">Interest Rate</span>
                        <span style="font-weight: 600;">3.5% APR</span>
                    </div>
                </div>
                
                <button id="applyMortgage" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Get Pre-Approved
                </button>
            </div>
        </div>
    `;

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const applyBtn = dialog.querySelector('#applyMortgage');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    applyBtn.addEventListener('click', () => {
        this.showNotification('Mortgage application submitted! We\'ll contact you soon.', 'success');
        dialog.remove();
    });
};

/* ===================================
   SAVINGS SERVICE
   =================================== */

XApp.prototype.showSavingsDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 340px;">
            <div class="modal-header">
                <h2>Savings Accounts</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">High-Yield Savings</h3>
                    <p style="color: var(--x-gray); font-size: 14px; line-height: 1.5;">
                        Earn up to 4.5% APY on your savings with no minimum balance required.
                    </p>
                </div>
                
                <div class="service-option" style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 12px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s;" onclick="this.style.borderColor='var(--x-blue)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="font-size: 16px; font-weight: 700;">Basic Savings</h4>
                        <span style="font-size: 20px; font-weight: 700; color: var(--x-blue);">2.5% APY</span>
                    </div>
                    <p style="font-size: 13px; color: var(--x-gray);">No minimum balance • No monthly fees</p>
                </div>
                
                <div class="service-option" style="padding: 16px; background: var(--x-dark-gray); border-radius: 12px; margin-bottom: 12px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s;" onclick="this.style.borderColor='var(--x-blue)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="font-size: 16px; font-weight: 700;">Premium Savings</h4>
                        <span style="font-size: 20px; font-weight: 700; color: var(--x-blue);">4.5% APY</span>
                    </div>
                    <p style="font-size: 13px; color: var(--x-gray);">$1,000 minimum balance • Unlimited transfers</p>
                </div>
                
                <button id="openSavings" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Open Savings Account
                </button>
            </div>
        </div>
    `;

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const openBtn = dialog.querySelector('#openSavings');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    openBtn.addEventListener('click', () => {
        this.showNotification('Savings account opened successfully!', 'success');
        dialog.remove();
    });
};

/* ===================================
   CREDIT CARD SERVICE
   =================================== */

XApp.prototype.showCreditCardDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 340px;">
            <div class="modal-header">
                <h2>Credit Cards</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Premium Credit Cards</h3>
                    <p style="color: var(--x-gray); font-size: 14px; line-height: 1.5;">
                        Get rewarded for every purchase with cashback and travel benefits.
                    </p>
                </div>
                
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin-bottom: 12px;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">X Platinum Card</div>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">**** **** **** 1234</div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>5% Cashback</span>
                        <span>0% APR First Year</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 16px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">Benefits</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 8px 0; border-bottom: 1px solid var(--x-border);">✓ 5% cashback on all purchases</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid var(--x-border);">✓ 0% APR for first 12 months</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid var(--x-border);">✓ Travel insurance included</li>
                        <li style="padding: 8px 0;">✓ No annual fee first year</li>
                    </ul>
                </div>
                
                <button id="applyCard" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Apply Now
                </button>
            </div>
        </div>
    `;

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const applyBtn = dialog.querySelector('#applyCard');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    applyBtn.addEventListener('click', () => {
        this.showNotification('Credit card application submitted!', 'success');
        dialog.remove();
    });
};

/* ===================================
   INSURANCE SERVICE
   =================================== */

XApp.prototype.showInsuranceDialog = function () {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 340px;">
            <div class="modal-header">
                <h2>Insurance</h2>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px;">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Protect What Matters</h3>
                    <p style="color: var(--x-gray); font-size: 14px; line-height: 1.5;">
                        Comprehensive coverage for life, health, auto, and home.
                    </p>
                </div>
                
                <div style="margin-bottom: 12px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">❤️</span>
                        <div style="flex: 1;">
                            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">Life Insurance</h4>
                            <p style="font-size: 13px; color: var(--x-gray);">From $15/month</p>
                        </div>
                        <span style="font-size: 20px;">→</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 12px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">🏥</span>
                        <div style="flex: 1;">
                            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">Health Insurance</h4>
                            <p style="font-size: 13px; color: var(--x-gray);">From $120/month</p>
                        </div>
                        <span style="font-size: 20px;">→</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 12px; padding: 16px; background: var(--x-dark-gray); border-radius: 12px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">🚗</span>
                        <div style="flex: 1;">
                            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">Auto Insurance</h4>
                            <p style="font-size: 13px; color: var(--x-gray);">From $85/month</p>
                        </div>
                        <span style="font-size: 20px;">→</span>
                    </div>
                </div>
                
                <button id="getQuote" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 16px;">
                    Get Free Quote
                </button>
            </div>
        </div>
    `;

    const phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(dialog);

    const closeBtn = dialog.querySelector('.modal-close');
    const quoteBtn = dialog.querySelector('#getQuote');

    closeBtn.addEventListener('click', () => dialog.remove());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });

    quoteBtn.addEventListener('click', () => {
        this.showNotification('Quote request submitted! We\'ll email you shortly.', 'success');
        dialog.remove();
    });
};

XApp.prototype.showAllBankProducts = function () {
    this.loadBankProducts();
    this.showNotification('Showing all your banking products', 'info');
};
