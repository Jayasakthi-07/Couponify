const mongoose = require('mongoose');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Coupon = require('./models/Coupon');
const Offer = require('./models/Offer');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const BRANDS = ['Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Myntra', 'Uber', 'Dominos', 'KFC', 'BookMyShow', 'Lenskart'];
const OFFERS = ['20% OFF', '₹100 Cashback', 'Buy 1 Get 1', 'Flat 50% OFF', 'Free Delivery'];
const STATUSES = ['pending', 'available', 'sold'];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/couponify');
        console.log('MongoDB Connected');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Coupon.deleteMany({});
    await Offer.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Data Cleared. Seeding...');

    // 1. Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Nazeer@2026', salt);

    const admin = new User({
        username: 'admin',
        email: 'nazeer@admin.com',
        password: hashedPassword,
        isAdmin: true
    });
    await admin.save();

    // Admin Wallet
    const adminWallet = new Wallet({ userId: admin._id, credits: 10000 });
    await adminWallet.save();

    const users = [];
    const wallets = [];

    // 2. Create 100 Demo Users
    for (let i = 1; i <= 100; i++) {
        const user = new User({
            username: `user${i}`,
            email: `user${i}@demo.com`,
            password: hashedPassword
        });
        const savedUser = await user.save();
        users.push(savedUser);

        const wallet = new Wallet({ userId: savedUser._id, credits: 100 });
        const savedWallet = await wallet.save();
        wallets.push(savedWallet);
    }

    console.log('Users & Wallets created.');

    // 3. Create 100 Demo Coupons
    const coupons = [];
    for (let i = 0; i < 100; i++) {
        const seller = users[Math.floor(Math.random() * users.length)];
        const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

        const coupon = new Coupon({
            sellerId: seller._id,
            brand: brand,
            code: `${brand.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
            expiryDate: new Date(+new Date() + Math.random() * 10000000000), // Future date
            price: Math.floor(Math.random() * 20) * 10 + 50, // 50, 60 ... 250
            status: status
        });

        // If sold, assign buyer
        if (status === 'sold') {
            let buyer = users[Math.floor(Math.random() * users.length)];
            while (buyer._id.equals(seller._id)) {
                buyer = users[Math.floor(Math.random() * users.length)];
            }
            coupon.buyerId = buyer._id;
        }

        coupons.push(coupon);
    }
    await Coupon.insertMany(coupons);
    console.log('Coupons created.');

    // 4. Create 50 Demo Offers
    const offers = [];
    for (let i = 0; i < 50; i++) {
        const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
        offers.push({
            brand: brand,
            description: OFFERS[Math.floor(Math.random() * OFFERS.length)],
            expiryDate: new Date(+new Date() + Math.random() * 10000000000),
            price: Math.floor(Math.random() * 50) + 10,
            isAvailable: true
        });
    }
    await Offer.insertMany(offers);
    console.log('Offers created.');

    console.log('Seeding Complete!');
    process.exit();
};

seedData();
