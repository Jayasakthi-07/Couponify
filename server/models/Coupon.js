const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who listed it
    brand: { type: String, required: true },
    code: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true }, // In credits
    status: { type: String, enum: ['wallet', 'pending', 'available', 'sold'], default: 'wallet' },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'coupons' });

module.exports = mongoose.model('Coupon', couponSchema);
