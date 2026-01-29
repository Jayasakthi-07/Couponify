import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { X, CreditCard, Smartphone, Banknote } from 'lucide-react';
import clsx from 'clsx';

const WalletModal = ({ isOpen, onClose }) => {
    const { refreshWallet } = useAuth();
    const [amount, setAmount] = useState(115); // Default to 100 credits worth
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Rule: ₹115 = 100 credits
    const credits = Math.floor((amount / 115) * 100);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simulate API call
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/wallet/add-credits', {
                amountPaid: amount,
                paymentMethod
            }, {
                headers: { 'x-auth-token': token }
            });

            await refreshWallet();
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Payment Failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Add Credits</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <X size={24} />
                    </button>
                </div>

                {!success ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Amount (₹)</label>
                            <input
                                type="number"
                                className="input-field text-lg font-bold"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                min="115"
                                step="115"
                            />
                            <p className="text-sm text-slate-500 mt-1">Rate: ₹115 = 100 Credits</p>
                            <div className="mt-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-center">
                                You get: {credits} Credits
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'UPI', icon: Smartphone, label: 'UPI' },
                                    { id: 'Card', icon: CreditCard, label: 'Card' },
                                    { id: 'NetBanking', icon: Banknote, label: 'Net Bank' }
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={clsx(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                                            paymentMethod === m.id
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                        )}
                                    >
                                        <m.icon size={24} className="mb-1" />
                                        <span className="text-xs font-medium">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading || amount < 115}
                            className="w-full btn-primary py-3 text-lg"
                        >
                            {loading ? 'Processing...' : `Pay ₹${amount}`}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h4>
                        <p className="text-slate-500">Credits have been added to your wallet.</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default WalletModal;
