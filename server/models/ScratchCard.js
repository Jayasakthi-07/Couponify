const mongoose = require('mongoose');

const scratchCardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true }, // To track "one per week"
    isRedeemed: { type: Boolean, default: false },
    rewardAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScratchCard', scratchCardSchema);
