const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Add a Coupon to Wallet
router.post('/add', auth, async (req, res) => {
    const { brand, code, expiryDate } = req.body;
    try {
        const coupon = new Coupon({
            sellerId: req.user.id,
            brand,
            code,
            expiryDate,
            price: 0, // Not for sale yet
            status: 'wallet'
        });
        await coupon.save();
        res.json(coupon);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List a Coupon for Sale (from Wallet)
router.post('/sell/:id', auth, async (req, res) => {
    const { price } = req.body;
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });

        // Check ownership
        if (coupon.sellerId.toString() !== req.user.id && (!coupon.buyerId || coupon.buyerId.toString() !== req.user.id)) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // If it was bought, set new sellerId
        if (coupon.buyerId && coupon.buyerId.toString() === req.user.id) {
            coupon.sellerId = req.user.id;
            coupon.buyerId = null; // Reset buyer
        }

        coupon.price = price;
        coupon.status = 'pending'; // Requires admin approval? Or available? Let's check plan. Plan says pending.

        await coupon.save();
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

        coupon.status = 'wallet'; // Now in buyer's wallet, not sold/done. "sold" was previous status, but "wallet" makes sense for re-listing.
        // Wait, previous logic had 'sold'. If I change to 'wallet', it means they can use it or sell it.
        // Let's stick to 'wallet' for ownership. But we need to know it was bought?
        // The model has buyerId. If buyerId is set, it's theirs.
        // Let's set status to 'wallet' for the new owner.

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

// My Coupons (In Wallet + Purchased)
router.get('/my-coupons', auth, async (req, res) => {
    try {
        // Fetch coupons where user is the CURRENT owner.
        // This includes:
        // 1. Coupons explicitly bought by user (buyerId = user.id)
        // 2. Coupons uploaded by user and NOT sold yet (sellerId = user.id AND buyerId = null)

        // Actually simpler: 
        // If buyerId is set, that's the owner.
        // If buyerId is null, sellerId is the owner.

        const coupons = await Coupon.find({
            $or: [
                { buyerId: req.user.id },
                { sellerId: req.user.id, buyerId: null }
            ]
        }).sort({ createdAt: -1 });

        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
