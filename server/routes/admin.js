const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Middleware to check admin
const adminAuth = async (req, res, next) => {
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Access denied. Admin only.' });
    next();
};

// Get All Stats
// Get All Stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        // Total Coupons should be those available in the marketplace
        const couponCount = await Coupon.countDocuments({ status: 'available' });
        const pendingCoupons = await Coupon.countDocuments({ status: 'pending' });

        res.json({ userCount, couponCount, pendingCoupons });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Pending Coupons
router.get('/coupons/pending', auth, adminAuth, async (req, res) => {
    try {
        const coupons = await Coupon.find({ status: 'pending' }).populate('sellerId', 'username');
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve Coupon
router.post('/approve-coupon/:id', auth, adminAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });

        coupon.status = 'available'; // Listed
        await coupon.save();
        res.json({ msg: 'Coupon Approved', coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reject Coupon
router.post('/reject-coupon/:id', auth, adminAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });

        // Likely delete or mark rejected?
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Coupon Rejected/Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
