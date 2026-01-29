import { useState } from 'react';
import axios from 'axios';
import { Gift, Play, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ScratchCard from '../components/ScratchCard';
import CustomToast from '../components/CustomToast';

const Rewards = () => {
    // Referral State
    const [referralCode, setReferralCode] = useState('');
    const [referralLoading, setReferralLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'error' });
    const { user } = useAuth(); // Need user for their username

    // Scratch Card States
    const [reward, setReward] = useState(null); // The actual reward amount
    const [isReadyToScratch, setIsReadyToScratch] = useState(false); // Validated and ready to scratch
    const [scratched, setScratched] = useState(false); // Fully scratched/revealed
    const [claimLoading, setClaimLoading] = useState(false);

    // Ad States
    const [adPlaying, setAdPlaying] = useState(false);
    const [adCompleted, setAdCompleted] = useState(false);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        // Auto-hide is handled in component, but just in case we can reset logic here if needed
    };

    const handlePrepareScratch = async () => {
        setClaimLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/gamification/scratch', {}, {
                headers: { 'x-auth-token': token }
            });

            // Success: Set reward and enable scratch mode
            setReward(res.data.reward);
            setIsReadyToScratch(true);
        } catch (err) {
            showToast(err.response?.data?.msg || 'Scratch card not available', 'error');
        } finally {
            setClaimLoading(false);
        }
    };

    const handleReveal = () => {
        if (!scratched) {
            setScratched(true);
            refreshWallet(); // Update credits only after reveal

            // Optional: Celebration sound or effect here
        }
    };

    const handleWatchAd = () => {
        setAdPlaying(true);
        // Simulate 5 second video
        setTimeout(async () => {
            try {
                // Step 1: Claim Reward API
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No auth token");

                await axios.post('http://localhost:5000/api/gamification/ad-reward', {}, {
                    headers: { 'x-auth-token': token }
                });

                // If we get here, API succeeded
                setAdCompleted(true);
                setAdPlaying(false);

                // Step 2: Refresh Wallet safely
                try {
                    await refreshWallet();
                } catch (walletErr) {
                    console.error("Wallet refresh failed but reward claimed:", walletErr);
                    // Don't toast error here, reward is safe
                }

                showToast('Ad Watched! 5 Credits Added.', 'success');
            } catch (err) {
                console.error("Ad Reward Error:", err);
                setAdPlaying(false);
                showToast(`Error claiming reward: ${err.message}`, 'error');
            }
        }, 5000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(user?.username);
        showToast('Referral code copied to clipboard!', 'success');
    };

    const handleClaimReferral = async () => {
        if (!referralCode.trim()) {
            showToast('Please enter a valid referral code', 'error');
            return;
        }

        setReferralLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming the backend endpoint is /api/gamification/referral
            await axios.post('http://localhost:5000/api/gamification/referral',
                { referralCode },
                { headers: { 'x-auth-token': token } }
            );

            showToast('Referral code applied! Your friend got 25 credits.', 'success');
            setReferralCode('');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Failed to apply referral code', 'error');
        } finally {
            setReferralLoading(false);
        }
    };

    return (
        <div>
            <CustomToast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, message: '' })}
            />

            <h2 className="text-2xl font-bold mb-6 dark:text-white">Rewards Center</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Scratch Card Section */}
                <div className="card text-center relative overflow-hidden">
                    <div className="flex flex-col items-center relative z-10">
                        <Gift size={48} className="text-secondary mb-4" />
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Weekly Scratch Card</h3>
                        <p className="text-slate-500 mb-6">Win up to 50 Credits!</p>

                        <div className="flex justify-center min-h-[150px] items-center">
                            {!isReadyToScratch ? (
                                <button
                                    onClick={handlePrepareScratch}
                                    disabled={claimLoading}
                                    className="btn-primary py-3 px-8 shadow-xl hover:scale-105 transition-transform"
                                >
                                    {claimLoading ? 'Loading Card...' : 'Play Now'}
                                </button>
                            ) : (
                                <div className="relative">
                                    <ScratchCard
                                        width={250}
                                        height={125}
                                        coverColor="#94a3b8"
                                        onReveal={handleReveal}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-yellow-100 to-amber-100 border-4 border-amber-300 rounded-xl">
                                            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">You Won</span>
                                            <div className="text-3xl font-black text-amber-500 drop-shadow-sm">
                                                +{reward}
                                            </div>
                                            <span className="text-amber-600 font-medium text-sm">Credits</span>
                                        </div>
                                    </ScratchCard>

                                    {/* Success Message below or overlay */}
                                    <AnimatePresence>
                                        {scratched && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -bottom-10 left-0 right-0 text-green-500 font-bold flex justify-center items-center gap-2"
                                            >
                                                <Sparkles size={16} /> Claimed!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Watch Ad Section */}
                <div className="card text-center">
                    <div className="flex flex-col items-center">
                        <Play size={48} className="text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Watch Video Ad</h3>
                        <p className="text-slate-500 mb-6">Earn 5 Credits instantly</p>

                        {adPlaying ? (
                            <div className="w-full bg-black rounded-xl aspect-video flex items-center justify-center">
                                <p className="text-white animate-pulse">Playing Simulation... (5s)</p>
                            </div>
                        ) : (
                            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl aspect-video flex items-center justify-center p-4">
                                {adCompleted ? (
                                    <div className="text-green-500 flex flex-col items-center">
                                        <CheckCircle size={32} className="mb-2" />
                                        <span className="font-bold">Reward Claimed!</span>
                                        <button onClick={() => setAdCompleted(false)} className="text-xs underline mt-2 text-slate-400">Watch Another</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleWatchAd}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        <span>Watch Video</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Referral Section */}
                <div className="card text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Refer & Earn</h3>
                        <p className="text-slate-500 mb-6 text-sm">Give your friends 0 credits, get 25 credits when they use your code! (Wait, only you win?)</p>

                        <div className="w-full space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <p className="text-xs text-slate-500 mb-1 uppercase font-bold tracking-wider">Your Code</p>
                                <div
                                    onClick={handleCopyCode}
                                    className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                                >
                                    <span className="text-lg font-mono font-bold text-primary">{user?.username || '...'}</span>
                                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">COPY</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Friend's Code"
                                    className="input-field flex-1 text-center font-mono uppercase text-sm"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                />
                                <button
                                    onClick={handleClaimReferral}
                                    disabled={referralLoading || !referralCode}
                                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {referralLoading ? '...' : 'Claim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
