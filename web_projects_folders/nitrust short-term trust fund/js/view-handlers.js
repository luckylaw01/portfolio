// View Initializers - Part 1: Authentication Views

NiTrustApp.prototype.initSplashView = function() {
    // Splash view doesn't need event handlers
};

NiTrustApp.prototype.initOnboardingView = function() {
    const form = document.getElementById('signupForm');
    const goToLogin = document.getElementById('goToLogin');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('signupPhone').value;
        const email = document.getElementById('signupEmail').value;
        const name = document.getElementById('signupName').value;
        const pin = document.getElementById('signupPin').value;
        const pinConfirm = document.getElementById('signupPinConfirm').value;

        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            alert('PIN must be 4 digits');
            return;
        }

        if (pin !== pinConfirm) {
            alert('PINs do not match');
            return;
        }

        if (this.signup(phone, email, name, pin)) {
            this.createSession(phone);
            alert('Account created successfully!');
            this.navigation.loadView('dashboard');
        }
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigation.loadView('login');
    });
};

NiTrustApp.prototype.initLoginView = function() {
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinKeys = document.querySelectorAll('.pin-key');
    const goToSignup = document.getElementById('goToSignup');
    let pinValue = '';

    const updatePinDisplay = () => {
        pinDots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < pinValue.length);
        });
    };

    pinKeys.forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.dataset.key;

            if (keyValue === 'delete') {
                pinValue = pinValue.slice(0, -1);
            } else if (keyValue && pinValue.length < 4) {
                pinValue += keyValue;
            }

            updatePinDisplay();

            if (pinValue.length === 4) {
                setTimeout(() => {
                    if (this.login(pinValue)) {
                        this.navigation.loadView('dashboard');
                    } else {
                        alert('Incorrect PIN');
                        pinValue = '';
                        updatePinDisplay();
                    }
                }, 200);
            }
        });
    });

    goToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigation.loadView('onboarding');
    });
};

NiTrustApp.prototype.initDashboardView = function() {
    // Update user greeting
    document.getElementById('userName').textContent = this.currentUser.name.split(' ')[0];

    // Get user funds
    const funds = this.getUserFunds();
    const activeFunds = funds.filter(f => f.status === 'active');

    // Calculate total balance
    const totalBalance = funds.reduce((sum, f) => sum + (f.remainingBalance || 0), 0);
    document.getElementById('totalBalance').textContent = totalBalance.toLocaleString();
    document.getElementById('activeFunds').textContent = activeFunds.length;

    // Get next payout
    if (activeFunds.length > 0) {
        const nextPayout = activeFunds
            .map(f => new Date(f.nextPayoutDate))
            .sort((a, b) => a - b)[0];
        const days = Math.ceil((nextPayout - new Date()) / (1000 * 60 * 60 * 24));
        document.getElementById('nextPayout').textContent = days === 0 ? 'Today' : `${days}d`;
    }

    // Render funds list
    const fundsList = document.getElementById('fundsList');
    if (funds.length === 0) {
        fundsList.innerHTML = `
            <div class="empty-state">
                <p>No trust funds yet</p>
                <p class="empty-subtitle">Create your first trust fund to get started</p>
            </div>
        `;
    } else {
        fundsList.innerHTML = funds.map(fund => {
            const beneficiary = fund.beneficiaryType === 'self' ? 'Personal' : 
                this.getDependentById(fund.dependentId)?.name || 'Dependent';
            return `
                <div class="fund-card" data-fund-id="${fund.id}">
                    <div class="fund-card-header">
                        <h4>${fund.fundName}</h4>
                        <span class="badge badge-${fund.status}">${fund.status}</span>
                    </div>
                    <div class="fund-card-body">
                        <p class="fund-beneficiary">${beneficiary}</p>
                        <div class="fund-stats">
                            <div>
                                <span class="label">Balance</span>
                                <span class="value">KSh ${fund.remainingBalance.toLocaleString()}</span>
                            </div>
                            <div>
                                <span class="label">Payout</span>
                                <span class="value">KSh ${fund.payoutAmount.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers to fund cards
        document.querySelectorAll('.fund-card').forEach(card => {
            card.addEventListener('click', () => {
                this.currentFund = parseInt(card.dataset.fundId);
                this.navigation.loadView('fund-details');
            });
        });
    }

    // Event listeners
    const settingsBtn = document.getElementById('settingsBtn');
    const createFundBtn = document.getElementById('createFundBtn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            this.navigation.loadView('settings');
        });
    }

    if (createFundBtn) {
        createFundBtn.addEventListener('click', () => {
            this.navigation.loadView('create-fund');
        });
    }

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            this.navigation.loadView(view);
        });
    });
};

NiTrustApp.prototype.initCreateFundView = function() {
    const form = document.getElementById('createFundForm');
    const beneficiaryType = document.getElementById('beneficiaryType');
    const dependentSelectGroup = document.getElementById('dependentSelectGroup');
    const dependentSelect = document.getElementById('dependentSelect');
    const depositAmount = document.getElementById('depositAmount');
    const fundDuration = document.getElementById('fundDuration');
    const payoutFrequency = document.getElementById('payoutFrequency');

    // Load dependents
    const dependents = this.getUserDependents();
    dependents.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep.id;
        option.textContent = `${dep.name} (${dep.relationship})`;
        dependentSelect.appendChild(option);
    });

    // Show/hide dependent select
    beneficiaryType.addEventListener('change', () => {
        dependentSelectGroup.style.display = 
            beneficiaryType.value === 'dependent' ? 'block' : 'none';
    });

    // Update calculations on input
    const updateCalculations = () => {
        const amount = parseFloat(depositAmount.value) || 0;
        const duration = parseInt(fundDuration.value);
        const frequency = payoutFrequency.value;

        if (amount > 0) {
            const { payoutAmount, numberOfPayouts } = this.calculatePayout(amount, duration, frequency);
            document.getElementById('payoutAmount').textContent = `KSh ${payoutAmount.toFixed(2)}`;
            document.getElementById('numberOfPayouts').textContent = numberOfPayouts;
            
            const firstPayout = new Date();
            const freqDays = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
            firstPayout.setDate(firstPayout.getDate() + freqDays[frequency]);
            document.getElementById('firstPayoutDate').textContent = firstPayout.toLocaleDateString();
            
            // Calculate charges
            const charges = window.MpesaCharges.calculateTotalCharges(payoutAmount, numberOfPayouts, amount);
            document.getElementById('fundAmountDisplay').textContent = `KSh ${amount.toLocaleString()}`;
            document.getElementById('mpesaCharges').textContent = `KSh ${charges.mpesaCharges.toFixed(2)}`;
            document.getElementById('serviceCharge').textContent = `KSh ${charges.serviceCharge.toFixed(2)}`;
            document.getElementById('totalCharges').textContent = `KSh ${charges.totalCharges.toFixed(2)}`;
            document.getElementById('grandTotal').textContent = `KSh ${charges.grandTotal.toFixed(2)}`;
        }
    };

    depositAmount.addEventListener('input', updateCalculations);
    fundDuration.addEventListener('change', updateCalculations);
    payoutFrequency.addEventListener('change', updateCalculations);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fundData = {
            fundName: document.getElementById('fundName').value,
            beneficiaryType: beneficiaryType.value,
            dependentId: beneficiaryType.value === 'dependent' ? parseInt(dependentSelect.value) : null,
            depositAmount: parseFloat(depositAmount.value),
            fundDuration: parseInt(fundDuration.value),
            payoutFrequency: payoutFrequency.value
        };

        const { payoutAmount, numberOfPayouts } = this.calculatePayout(
            fundData.depositAmount,
            fundData.fundDuration,
            fundData.payoutFrequency
        );

        fundData.payoutAmount = payoutAmount;
        fundData.numberOfPayouts = numberOfPayouts;
        
        // Calculate charges
        const charges = window.MpesaCharges.calculateTotalCharges(payoutAmount, numberOfPayouts, fundData.depositAmount);
        fundData.mpesaCharges = charges.mpesaCharges;
        fundData.serviceCharge = charges.serviceCharge;
        fundData.totalCharges = charges.totalCharges;
        fundData.totalDeposit = charges.grandTotal;

        // Confirm with user
        const confirmMsg = `You will deposit KSh ${charges.grandTotal.toFixed(2)} which includes:\n\n` +
            `Fund Amount: KSh ${fundData.depositAmount.toLocaleString()}\n` +
            `M-Pesa Fees: KSh ${charges.mpesaCharges.toFixed(2)}\n` +
            `Service Charge: KSh ${charges.serviceCharge.toFixed(2)}\n\n` +
            `Continue?`;
        
        if (confirm(confirmMsg)) {
            this.createFund(fundData);
            alert('Trust fund created successfully! Please complete the M-Pesa payment.');
            this.navigation.loadView('dashboard');
        }
    });

    document.getElementById('backToDashboard').addEventListener('click', () => {
        this.navigation.goBack();
    });
};

NiTrustApp.prototype.initFundDetailsView = function() {
    const fund = this.getFundById(this.currentFund);
    if (!fund) {
        this.navigation.loadView('dashboard');
        return;
    }

    // Update fund details
    document.getElementById('fundDetailName').textContent = fund.fundName;
    document.getElementById('fundBalance').textContent = fund.remainingBalance.toLocaleString();
    
    const beneficiary = fund.beneficiaryType === 'self' ? 'Self' : 
        this.getDependentById(fund.dependentId)?.name || 'Unknown';
    document.getElementById('fundBeneficiary').textContent = beneficiary;
    
    document.getElementById('fundStatusBadge').textContent = fund.status;
    document.getElementById('fundStatusBadge').className = `status-badge status-${fund.status}`;
    
    document.getElementById('fundPayoutAmount').textContent = `KSh ${fund.payoutAmount.toFixed(2)}`;
    document.getElementById('fundFrequency').textContent = fund.payoutFrequency;
    document.getElementById('fundNextPayout').textContent = new Date(fund.nextPayoutDate).toLocaleDateString();
    document.getElementById('fundPayoutsLeft').textContent = fund.numberOfPayouts - fund.payoutsMade;
    document.getElementById('fundCreatedDate').textContent = new Date(fund.createdAt).toLocaleDateString();
    
    const endDate = new Date(fund.createdAt);
    endDate.setDate(endDate.getDate() + fund.fundDuration);
    document.getElementById('fundEndDate').textContent = endDate.toLocaleDateString();

    // Load transactions
    const transactions = this.getFundTransactions(fund.id);
    const transactionsList = document.getElementById('fundTransactions');
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-subtitle">No transactions yet</p>';
    } else {
        transactionsList.innerHTML = transactions.slice(0, 5).map(t => `
            <div class="transaction-item">
                <div>
                    <span class="transaction-type">${t.type}</span>
                    <span class="transaction-desc">${t.description}</span>
                </div>
                <span class="transaction-amount ${t.type === 'deposit' ? 'positive' : 'negative'}">
                    ${t.type === 'deposit' ? '+' : '-'}KSh ${t.amount.toFixed(2)}
                </span>
            </div>
        `).join('');
    }

    // Event listeners
    const pauseBtn = document.getElementById('pauseFundBtn');
    pauseBtn.textContent = fund.status === 'paused' ? '▶️ Resume' : '⏸️ Pause';
    pauseBtn.addEventListener('click', () => {
        if (fund.status === 'paused') {
            this.resumeFund(fund.id);
            alert('Fund resumed');
        } else {
            this.pauseFund(fund.id);
            alert('Fund paused');
        }
        this.navigation.loadView('fund-details');
    });

    document.getElementById('withdrawFundBtn').addEventListener('click', () => {
        if (this.withdrawEarly(fund.id)) {
            this.navigation.loadView('dashboard');
        }
    });

    document.getElementById('cancelFundBtn').addEventListener('click', () => {
        if (this.cancelFund(fund.id)) {
            this.navigation.loadView('dashboard');
        }
    });

    document.getElementById('backFromFund').addEventListener('click', () => {
        this.navigation.goBack();
    });
};
