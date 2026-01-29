const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const ScratchCard = require('../models/ScratchCard');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Scratch Card
router.post('/scratch', auth, async (req, res) => {
    try {
        const today = new Date();
        // Logic: 1 free scratch card per week.
        // Check if user has a scratch card for this week
        // Basic logic: Find scratch card where weekStartDate is within last 7 days? 
        // Or just "weekStartDate" logic.

        // Simplification for prototype: Check if user scratched in last 7 days.
        const wallet = await Wallet.findOne({ userId: req.user.id });
        const lastScratch = wallet.lastScratchDate;

        if (lastScratch) {
            const diffTime = Math.abs(today - lastScratch);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
                return res.status(400).json({ msg: 'Scratch card not available yet. Try again later.' });
            }
        }

        // Generate Reward (5-50)
        const reward = Math.floor(Math.random() * 46) + 5;

        wallet.credits += reward;
        wallet.lastScratchDate = today;
        await wallet.save();

        await new Transaction({
            userId: req.user.id,
            type: 'scratch_reward',
            amount: reward,
            description: 'Scratch Card Reward',
            date: Date.now()
        }).save();

        res.json({ msg: 'Scratch Card Redeemed', reward, newBalance: wallet.credits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View Ad Reward
router.post('/ad-reward', auth, async (req, res) => {
    // Logic: Add 5 credits.
    try {
        const wallet = await Wallet.findOne({ userId: req.user.id });
        wallet.credits += 5;
        await wallet.save();

        await new Transaction({
            userId: req.user.id,
            type: 'ad_reward',
            amount: 5,
            description: 'Video Ad Reward',
            date: Date.now()
        }).save();

        res.json({ msg: 'Ad Reward Added', reward: 5, newBalance: wallet.credits });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Referral Reward (Triggered when user enters code manually for demo? or Auto?)
// Req says: "Simple referral code or button"
// We'll add a route to claim referral code
router.post('/referral', auth, async (req, res) => {
    const { referralCode } = req.body;
    // Assuming referralCode is another user's username for simplicity
    try {
        const referrer = await User.findOne({ username: referralCode });
        if (!referrer) return res.status(404).json({ msg: 'Invalid referral code' });
        if (referrer.id === req.user.id) return res.status(400).json({ msg: 'Cannot refer yourself' });

        // Limit? "When a user refers a friend: 25 credits added to REFERRER".
        // So current user is "Friend". Referrer gets credits.
        // Does Friend get credits? Not specified.
        // "Referrer's wallet -> +25"

        const referrerWallet = await Wallet.findOne({ userId: referrer.id });
        referrerWallet.credits += 25;
        await referrerWallet.save();

        await new Transaction({
            userId: referrer.id,
            type: 'referral',
            amount: 25,
            description: `Referral reward from user ${req.user.username}`, // req.user populated by auth
            date: Date.now()
        }).save();

        res.json({ msg: 'Referral applied successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
