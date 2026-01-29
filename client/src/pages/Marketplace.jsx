import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Marketplace = () => {
    const [coupons, setCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const { refreshWallet } = useAuth();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/coupons/marketplace');
            setCoupons(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuyClick = (coupon) => {
        setSelectedCoupon(coupon);
    };

    const confirmPurchase = async () => {
        if (!selectedCoupon) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/coupons/buy/${selectedCoupon._id}`, {}, {
                headers: { 'x-auth-token': token }
            });

            // Close modal and show success
            setSelectedCoupon(null);
            setShowSuccess(true);

            fetchCoupons(); // Refresh list
            refreshWallet(); // Update credits

            // Auto hide success message after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 2500);

        } catch (err) {
            alert(err.response?.data?.msg || "Purchase Failed");
            setSelectedCoupon(null);
        }
    };

    return (
        <div className="relative">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Marketplace</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <p className="text-slate-500">No coupons available.</p>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon._id} className="card hover:shadow-2xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{coupon.brand}</h3>
                                    <p className="text-xs text-slate-500">Listed by: {coupon.sellerId?.username}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                    {coupon.price} Credits
                                </span>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg mb-4 text-center border border-dashed border-slate-300 dark:border-slate-600">
                                <span className="font-mono text-slate-500 text-sm">HIDDEN CODE</span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                                <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                            </div>

                            <button
                                onClick={() => handleBuyClick(coupon)}
                                className="w-full btn-primary flex justify-center items-center space-x-2"
                            >
                                <ShoppingCart size={18} />
                                <span>Buy Now</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {selectedCoupon && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4"
                        >
                            <div className="flex items-center space-x-3 text-amber-500 mb-4">
                                <AlertCircle size={32} />
                                <h3 className="text-xl font-bold dark:text-white">Confirm Purchase</h3>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Are you sure you want to buy <span className="font-bold text-slate-900 dark:text-white">{selectedCoupon.brand}</span> for <span className="font-bold text-green-600">{selectedCoupon.price} credits</span>?
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedCoupon(null)}
                                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPurchase}
                                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Animation */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-transparent p-8 flex flex-col items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4"
                            >
                                <Check size={48} strokeWidth={4} />
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-green-600"
                            >
                                Successful!
                            </motion.h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Marketplace;
