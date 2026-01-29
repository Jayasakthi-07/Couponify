const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// List a Coupon
router.post('/sell', auth, async (req, res) => {
    const { brand, code, expiryDate, price } = req.body;
    try {
        const coupon = new Coupon({
            sellerId: req.user.id,
            brand,
            code,
            expiryDate,
            price,
            status: 'pending' // Admin must approve
        });
        await coupon.save();

        // Log transaction? Maybe only when Sold?
        // Requirement: "Log referral reward in transactions", doesn't explicitly say log 'listing'.

        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Marketplace Coupons (Available Only)
router.get('/marketplace', async (req, res) => {
    try {
        const coupons = await Coupon.find({ status: 'available' }).populate('sellerId', 'username');
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buy Coupon
router.post('/buy/:id', auth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });
        if (coupon.status !== 'available') return res.status(400).json({ msg: 'Coupon not available' });
        if (coupon.sellerId.toString() === req.user.id) return res.status(400).json({ msg: 'Cannot buy your own coupon' });

        const buyerWallet = await Wallet.findOne({ userId: req.user.id });
        if (buyerWallet.credits < coupon.price) return res.status(400).json({ msg: 'Insufficient credits' });

        const sellerWallet = await Wallet.findOne({ userId: coupon.sellerId });

        // Transfer Credits
        buyerWallet.credits -= coupon.price;
        sellerWallet.credits += coupon.price;

        coupon.status = 'sold'; // Or 'redeemed'? Req says "Status = redeemed".
        coupon.buyerId = req.user.id;

        await buyerWallet.save();
        await sellerWallet.save();
        await coupon.save();

        // Log Transactions
        await new Transaction({
            userId: req.user.id,
            type: 'coupon_buy',
            amount: -coupon.price,
            description: `Bought ${coupon.brand} coupon`,
            date: Date.now()
        }).save();

        await new Transaction({
            userId: coupon.sellerId,
            type: 'coupon_sell',
            amount: coupon.price,
            description: `Sold ${coupon.brand} coupon`,
            date: Date.now()
        }).save();

        res.json({ msg: 'Coupon purchased successfully', coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// My Coupons (Purchased)
router.get('/my-coupons', auth, async (req, res) => {
    try {
        const coupons = await Coupon.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
