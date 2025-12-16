// View Initializers - Part 2: Dependents, Transactions, Settings

NiTrustApp.prototype.initDependentsView = function() {
    const dependents = this.getUserDependents();
    const dependentsList = document.getElementById('dependentsList');

    if (dependents.length === 0) {
        dependentsList.innerHTML = `
            <div class="empty-state">
                <p>No dependents added</p>
                <p class="empty-subtitle">Add dependents to create funds for them</p>
            </div>
        `;
    } else {
        dependentsList.innerHTML = dependents.map(dep => `
            <div class="dependent-card">
                <div class="dependent-avatar">${dep.name.charAt(0).toUpperCase()}</div>
                <div class="dependent-info">
                    <h4>${dep.name}</h4>
                    <p>${dep.relationship}</p>
                    <p class="dependent-phone">${dep.provider === 'mpesa' ? 'M-Pesa' : 'Airtel'}: ${dep.phone}</p>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('addDependentBtn').addEventListener('click', () => {
        this.navigation.loadView('add-dependent');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            this.navigation.loadView(view);
        });
    });
};

NiTrustApp.prototype.initAddDependentView = function() {
    const form = document.getElementById('addDependentForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const dependentData = {
            name: document.getElementById('dependentName').value,
            relationship: document.getElementById('dependentRelationship').value,
            provider: document.getElementById('dependentProvider').value,
            phone: document.getElementById('dependentPhone').value
        };

        this.addDependent(dependentData);
        alert('Dependent added successfully!');
        this.navigation.loadView('dependents');
    });

    document.getElementById('backToDependents').addEventListener('click', () => {
        this.navigation.goBack();
    });
};

NiTrustApp.prototype.initTransactionsView = function() {
    const transactions = this.getUserTransactions();
    const transactionsList = document.getElementById('transactionsList');
    let currentFilter = 'all';

    const renderTransactions = (filter = 'all') => {
        const filtered = filter === 'all' ? transactions : 
            transactions.filter(t => t.type === filter);

        if (filtered.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <p>No transactions yet</p>
                    <p class="empty-subtitle">Your transaction history will appear here</p>
                </div>
            `;
        } else {
            transactionsList.innerHTML = filtered.map(t => {
                const fund = this.getFundById(t.fundId);
                return `
                    <div class="transaction-item">
                        <div class="transaction-details">
                            <span class="transaction-type">${t.type.toUpperCase()}</span>
                            <span class="transaction-fund">${fund?.fundName || 'Unknown Fund'}</span>
                            <span class="transaction-desc">${t.description}</span>
                            <span class="transaction-date">${new Date(t.timestamp).toLocaleString()}</span>
                        </div>
                        <span class="transaction-amount ${t.type === 'deposit' ? 'positive' : 'negative'}">
                            ${t.type === 'deposit' ? '+' : '-'}KSh ${t.amount.toFixed(2)}
                        </span>
                    </div>
                `;
            }).join('');
        }
    };

    renderTransactions();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderTransactions(currentFilter);
        });
    });

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            this.navigation.loadView(view);
        });
    });
};

NiTrustApp.prototype.initSettingsView = function() {
    // Display user info
    document.getElementById('settingsName').textContent = this.currentUser.name;
    document.getElementById('settingsPhone').textContent = this.currentUser.phone;
    document.getElementById('settingsEmail').textContent = this.currentUser.email || 'Not provided';

    document.getElementById('changePinBtn').addEventListener('click', () => {
        const newPin = prompt('Enter new 4-digit PIN:');
        if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
            const confirmPin = prompt('Confirm new PIN:');
            if (newPin === confirmPin) {
                const users = this.getData('users') || [];
                const userIndex = users.findIndex(u => u.id === this.currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].pin = newPin;
                    this.saveData('users', users);
                    this.currentUser.pin = newPin;
                    alert('PIN changed successfully!');
                }
            } else {
                alert('PINs do not match');
            }
        } else {
            alert('Invalid PIN. Must be 4 digits.');
        }
    });

    document.getElementById('simulateDayBtn').addEventListener('click', () => {
        if (confirm('This will simulate 1 day passing and process any due payouts. Continue?')) {
            const funds = this.getUserFunds();
            let payoutsProcessed = 0;
            
            funds.forEach(fund => {
                if (fund.status === 'active') {
                    // Move next payout date back by 1 day to simulate time passing
                    const nextPayout = new Date(fund.nextPayoutDate);
                    nextPayout.setDate(nextPayout.getDate() - 1);
                    this.updateFund(fund.id, {
                        nextPayoutDate: nextPayout.toISOString()
                    });
                }
            });
            
            // Trigger payout processing
            if (window.payoutSimulator) {
                window.payoutSimulator.checkAndProcessPayouts();
            }
            
            alert('Time simulation complete! Check your funds for any processed payouts.');
            this.navigation.loadView('dashboard');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            this.logout();
        }
    });

    document.getElementById('backFromSettings').addEventListener('click', () => {
        this.navigation.goBack();
    });
};
