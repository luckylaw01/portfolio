// Main application logic
class NiTrustApp {
    constructor() {
        this.navigation = new Navigation();
        this.currentUser = null;
        this.currentFund = null;
        this.init();
    }

    init() {
        // Check if user is logged in
        const session = this.getSession();
        if (session) {
            this.currentUser = this.getUserData(session.phone);
            if (this.currentUser) {
                this.navigation.loadView('dashboard');
            } else {
                this.clearSession();
                this.showWelcome();
            }
        } else {
            this.showWelcome();
        }
    }

    showWelcome() {
        this.navigation.loadView('splash');
        setTimeout(() => {
            // Check if any users exist
            const users = this.getData('users') || [];
            if (users.length > 0) {
                this.navigation.loadView('login');
            } else {
                this.navigation.loadView('onboarding');
            }
        }, 2000);
    }

    // LocalStorage Data Management
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Session Management
    createSession(phone) {
        this.saveData('session', { phone, timestamp: Date.now() });
    }

    getSession() {
        return this.getData('session');
    }

    clearSession() {
        localStorage.removeItem('session');
    }

    // User Management
    createUser(userData) {
        const users = this.getData('users') || [];
        users.push({
            ...userData,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        this.saveData('users', users);
    }

    getUserData(phone) {
        const users = this.getData('users') || [];
        return users.find(u => u.phone === phone);
    }

    // Authentication
    signup(phone, email, name, pin) {
        const users = this.getData('users') || [];
        if (users.find(u => u.phone === phone)) {
            alert('Phone number already registered');
            return false;
        }
        this.createUser({ phone, email, name, pin });
        return true;
    }

    login(pin) {
        // Try to find user with this PIN
        const users = this.getData('users') || [];
        const user = users.find(u => u.pin === pin);
        
        if (user) {
            this.currentUser = user;
            this.createSession(user.phone);
            return true;
        }
        return false;
    }

    logout() {
        this.clearSession();
        this.currentUser = null;
        this.navigation.loadView('login');
    }

    // Fund Management
    createFund(fundData) {
        const funds = this.getData('funds') || [];
        const fund = {
            ...fundData,
            id: Date.now(),
            userId: this.currentUser.id,
            status: 'active',
            remainingBalance: fundData.depositAmount,
            payoutsMade: 0,
            createdAt: new Date().toISOString(),
            nextPayoutDate: this.calculateNextPayoutDate(fundData.payoutFrequency)
        };
        funds.push(fund);
        this.saveData('funds', funds);
        this.addTransaction({
            fundId: fund.id,
            type: 'deposit',
            amount: fundData.depositAmount,
            description: 'Initial deposit'
        });
        return fund;
    }

    getUserFunds() {
        const funds = this.getData('funds') || [];
        return funds.filter(f => f.userId === this.currentUser.id);
    }

    getFundById(id) {
        const funds = this.getData('funds') || [];
        return funds.find(f => f.id === id);
    }

    updateFund(id, updates) {
        const funds = this.getData('funds') || [];
        const index = funds.findIndex(f => f.id === id);
        if (index !== -1) {
            funds[index] = { ...funds[index], ...updates };
            this.saveData('funds', funds);
        }
    }

    pauseFund(id) {
        this.updateFund(id, { status: 'paused' });
    }

    resumeFund(id) {
        this.updateFund(id, { status: 'active' });
    }

    withdrawEarly(id) {
        const fund = this.getFundById(id);
        const penalty = fund.remainingBalance * 0.15; // 15% penalty
        const netAmount = fund.remainingBalance - penalty;
        
        if (confirm(`Early withdrawal incurs 15% penalty (KSh ${penalty.toFixed(2)}). You'll receive KSh ${netAmount.toFixed(2)}. Continue?`)) {
            this.addTransaction({
                fundId: id,
                type: 'withdrawal',
                amount: netAmount,
                description: `Early withdrawal (Penalty: KSh ${penalty.toFixed(2)})`
            });
            this.updateFund(id, { 
                status: 'withdrawn',
                remainingBalance: 0,
                closedAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    }

    cancelFund(id) {
        const fund = this.getFundById(id);
        const penalty = fund.depositAmount * 0.20; // 20% penalty
        const refundAmount = fund.remainingBalance - penalty;
        
        if (confirm(`Cancellation incurs 20% penalty (KSh ${penalty.toFixed(2)}). You'll get KSh ${refundAmount.toFixed(2)} refund. Continue?`)) {
            this.addTransaction({
                fundId: id,
                type: 'refund',
                amount: refundAmount,
                description: `Fund cancelled (Penalty: KSh ${penalty.toFixed(2)})`
            });
            this.updateFund(id, { 
                status: 'cancelled',
                remainingBalance: 0,
                closedAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    }

    // Calculations
    calculatePayout(depositAmount, duration, frequency) {
        const frequencyDays = {
            'daily': 1,
            'weekly': 7,
            'biweekly': 14,
            'monthly': 30
        };
        const numberOfPayouts = Math.floor(duration / frequencyDays[frequency]);
        const payoutAmount = depositAmount / numberOfPayouts;
        return { payoutAmount, numberOfPayouts };
    }

    calculateNextPayoutDate(frequency, fromDate = new Date()) {
        const frequencyDays = {
            'daily': 1,
            'weekly': 7,
            'biweekly': 14,
            'monthly': 30
        };
        const nextDate = new Date(fromDate);
        nextDate.setDate(nextDate.getDate() + frequencyDays[frequency]);
        return nextDate.toISOString();
    }

    // Transactions
    addTransaction(transactionData) {
        const transactions = this.getData('transactions') || [];
        transactions.push({
            ...transactionData,
            id: Date.now(),
            userId: this.currentUser.id,
            timestamp: new Date().toISOString()
        });
        this.saveData('transactions', transactions);
    }

    getUserTransactions() {
        const transactions = this.getData('transactions') || [];
        return transactions.filter(t => t.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getFundTransactions(fundId) {
        const transactions = this.getData('transactions') || [];
        return transactions.filter(t => t.fundId === fundId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Dependents
    addDependent(dependentData) {
        const dependents = this.getData('dependents') || [];
        dependents.push({
            ...dependentData,
            id: Date.now(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString()
        });
        this.saveData('dependents', dependents);
    }

    getUserDependents() {
        const dependents = this.getData('dependents') || [];
        return dependents.filter(d => d.userId === this.currentUser.id);
    }

    getDependentById(id) {
        const dependents = this.getData('dependents') || [];
        return dependents.find(d => d.id === id);
    }

    // Payout Simulation (would run as background job in real app)
    processPayouts() {
        const funds = this.getUserFunds();
        const now = new Date();
        
        funds.forEach(fund => {
            if (fund.status === 'active' && new Date(fund.nextPayoutDate) <= now) {
                const { payoutAmount } = this.calculatePayout(
                    fund.depositAmount,
                    fund.fundDuration,
                    fund.payoutFrequency
                );
                
                if (fund.remainingBalance >= payoutAmount) {
                    this.addTransaction({
                        fundId: fund.id,
                        type: 'payout',
                        amount: payoutAmount,
                        description: 'Automated payout'
                    });
                    
                    this.updateFund(fund.id, {
                        remainingBalance: fund.remainingBalance - payoutAmount,
                        payoutsMade: fund.payoutsMade + 1,
                        nextPayoutDate: this.calculateNextPayoutDate(fund.payoutFrequency, new Date(fund.nextPayoutDate)),
                        status: fund.remainingBalance - payoutAmount <= 0 ? 'completed' : 'active'
                    });
                }
            }
        });
    }

    // View Initializers will be added in next batch
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NiTrustApp();
});
