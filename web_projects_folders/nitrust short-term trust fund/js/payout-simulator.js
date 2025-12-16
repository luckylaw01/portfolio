// Payout Simulation System
// This simulates automatic payouts that would run as a background job

class PayoutSimulator {
    constructor(app) {
        this.app = app;
        this.intervalId = null;
    }

    start() {
        // Check for payouts every 10 seconds (simulating real-time)
        // In production, this would be a server-side cron job
        this.intervalId = setInterval(() => {
            this.checkAndProcessPayouts();
        }, 10000);
        
        // Also check immediately
        this.checkAndProcessPayouts();
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    checkAndProcessPayouts() {
        if (!this.app.currentUser) return;

        const funds = this.app.getUserFunds();
        const now = new Date();
        let payoutsProcessed = 0;

        funds.forEach(fund => {
            if (fund.status === 'active') {
                const nextPayout = new Date(fund.nextPayoutDate);
                
                // For demo purposes, we'll process if it's within 24 hours
                // In production, this would be exactly on the date
                if (nextPayout <= now) {
                    const { payoutAmount } = this.app.calculatePayout(
                        fund.depositAmount,
                        fund.fundDuration,
                        fund.payoutFrequency
                    );
                    
                    if (fund.remainingBalance >= payoutAmount) {
                        // Process payout
                        this.app.addTransaction({
                            fundId: fund.id,
                            type: 'payout',
                            amount: payoutAmount,
                            description: 'Automated payout'
                        });
                        
                        const newBalance = fund.remainingBalance - payoutAmount;
                        const newPayoutsMade = fund.payoutsMade + 1;
                        
                        this.app.updateFund(fund.id, {
                            remainingBalance: newBalance,
                            payoutsMade: newPayoutsMade,
                            nextPayoutDate: this.app.calculateNextPayoutDate(
                                fund.payoutFrequency, 
                                nextPayout
                            ),
                            status: newBalance <= 0.01 ? 'completed' : 'active'
                        });
                        
                        payoutsProcessed++;
                    }
                }
            }
        });

        // Refresh dashboard if payouts were processed and we're on dashboard
        if (payoutsProcessed > 0 && this.app.navigation.currentView === 'dashboard') {
            console.log(`Processed ${payoutsProcessed} payout(s)`);
            // Optionally refresh the view
        }
    }
}

// Initialize payout simulator when app is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to initialize
    setTimeout(() => {
        if (window.app) {
            window.payoutSimulator = new PayoutSimulator(window.app);
            window.payoutSimulator.start();
        }
    }, 1000);
});
