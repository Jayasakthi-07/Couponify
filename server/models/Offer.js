const mongoose = require('mongoose');

// Mock Offers (like GPAY scratch cards but just visual)
const offerSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    description: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Offer', offerSchema);
