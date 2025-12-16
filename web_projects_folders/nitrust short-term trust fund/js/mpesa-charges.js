// M-Pesa Transaction Charges Calculator

class MpesaCharges {
    static getSendCharge(amount) {
        if (amount <= 100) return 0;
        if (amount <= 500) return 7;
        if (amount <= 1000) return 13;
        if (amount <= 1500) return 23;
        if (amount <= 2500) return 33;
        if (amount <= 3500) return 53;
        if (amount <= 5000) return 57;
        if (amount <= 7500) return 78;
        if (amount <= 10000) return 90;
        if (amount <= 15000) return 100;
        if (amount <= 20000) return 105;
        if (amount <= 35000) return 108;
        if (amount <= 250000) return 108;
        return 108;
    }

    static calculateTotalCharges(payoutAmount, numberOfPayouts, fundAmount) {
        // Calculate total M-Pesa charges for all payouts
        let totalMpesaCharges = 0;
        for (let i = 0; i < numberOfPayouts; i++) {
            totalMpesaCharges += this.getSendCharge(payoutAmount);
        }

        // Calculate 3% service charge on the fund amount
        const serviceCharge = fundAmount * 0.03;

        return {
            mpesaCharges: totalMpesaCharges,
            serviceCharge: serviceCharge,
            totalCharges: totalMpesaCharges + serviceCharge,
            grandTotal: fundAmount + totalMpesaCharges + serviceCharge
        };
    }

    static formatChargesBreakdown(charges) {
        return {
            'Fund Amount': `KSh ${charges.fundAmount?.toLocaleString() || 0}`,
            'M-Pesa Transaction Fees': `KSh ${charges.mpesaCharges.toFixed(2)}`,
            'Service Charge (3%)': `KSh ${charges.serviceCharge.toFixed(2)}`,
            'Total Charges': `KSh ${charges.totalCharges.toFixed(2)}`,
            'Total to Deposit': `KSh ${charges.grandTotal.toFixed(2)}`
        };
    }
}

// Make available globally
window.MpesaCharges = MpesaCharges;
