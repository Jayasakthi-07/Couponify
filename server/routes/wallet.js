const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth'); // Will create middleware next

// Get Balance
router.get('/', auth, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.id });
        if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });
        res.json(wallet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Credits (Simulated Payment)
router.post('/add-credits', auth, async (req, res) => {
    // RULE: ₹115 = 100 credits
    const { amountPaid, paymentMethod } = req.body;
    if (!amountPaid || amountPaid <= 0) return res.status(400).json({ msg: 'Invalid amount' });

    // Verify calculation strictly
    // credits = (amountPaid / 115) * 100 ? No, amountPaid must be multiples of 115? 
    // Examples: 115 -> 100. 230 -> 200.
    // We can calculate floor: Math.floor(amountPaid / 115) * 100
    // Or exact: (amountPaid / 1.15)
    // Let's assume strict blocks or proportional?
    // "Fixed Pricing Rule (MUST BE CORRECT) ₹115 = 100 credits"
    // "All calculations must strictly follow this rule"

    const credits = Math.floor((amountPaid / 115) * 100);

    if (credits <= 0) return res.status(400).json({ msg: 'Amount too low for credits' });

    try {
        let wallet = await Wallet.findOne({ userId: req.user.id });
        if (!wallet) {
            wallet = new Wallet({ userId: req.user.id, credits: 0 });
        }
        wallet.credits += credits;
        await wallet.save();

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'credit_buy',
            amount: credits,
            paymentMethod,
            description: `Bought ${credits} credits for ₹${amountPaid}`,
            date: Date.now()
        });
        await transaction.save();

        res.json({ msg: 'Credits added', credits: wallet.credits, added: credits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
