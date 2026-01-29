const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit_buy', 'coupon_buy', 'coupon_sell', 'referral', 'ad_reward', 'scratch_reward'], required: true },
    amount: { type: Number, required: true }, // Credits
    paymentMethod: { type: String, default: null }, // e.g., 'UPI', 'card' (only for credit_buy)
    description: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
