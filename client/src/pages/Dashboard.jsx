import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import WalletModal from '../components/WalletModal';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Calendar, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/wallet/transactions', {
                    headers: { 'x-auth-token': token }
                });
                setTransactions(res.data);
            } catch (err) {
                console.error("Failed to fetch transactions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.credits]); // Refresh when credits change (e.g. after add funds)

    // Process data for the graph (Balance History)
    const graphData = useMemo(() => {
        if (!user || transactions.length === 0) return [];

        let currentBalance = user.credits;
        // Create a copy and sort by date descending (newest first) to work backwards
        const sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        const history = sortedTx.map(tx => {
            const snapshot = {
                date: new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                balance: currentBalance,
                amount: tx.amount,
                type: tx.type
            };

            // Reverse calculate previous balance
            // If type adds credits, previous was less. If type removes, previous was more.
            const isAddition = ['credit_buy', 'coupon_sell', 'referral', 'ad_reward', 'scratch_reward'].includes(tx.type);
            if (isAddition) {
                currentBalance -= tx.amount;
            } else {
                currentBalance += tx.amount;
            }
            return snapshot;
        });

        // Add the starting point (approximate) if few transactions
        if (history.length > 0) {
            history.push({
                date: 'Start',
                balance: currentBalance, // The calculated start balance
                amount: 0,
                type: 'initial'
            });
        }

        // Return chronological order for the graph
        return history.reverse();
    }, [user, transactions]);

    const getTransactionIcon = (type) => {
        const isAddition = ['credit_buy', 'coupon_sell', 'referral', 'ad_reward', 'scratch_reward'].includes(type);
        return isAddition ?
            <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30">
                <ArrowDownLeft size={20} />
            </div> :
            <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30">
                <ArrowUpRight size={20} />
            </div>;
    };

    const formatType = (type) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>

            {/* Wallet Card */}
            <div className="card bg-gradient-to-br from-primary to-indigo-600 text-white border-none shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={120} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-lg opacity-90 mb-1 font-medium">Available Balance</h3>
                    <div className="text-5xl font-bold mb-6 tracking-tight">{user?.credits || 0} <span className="text-2xl opacity-80 font-normal">Credits</span></div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsWalletModalOpen(true)}
                            className="bg-white text-primary hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            + Add Credits
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Analytics Graph */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <Activity size={20} className="text-primary" />
                            Balance History
                        </h3>
                    </div>

                    <div className="h-72 w-full">
                        {graphData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={graphData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">
                                <Activity size={48} className="mb-2 opacity-50" />
                                <p>No sufficient data for graph</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <h3 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        Recent Transactions
                    </h3>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        {getTransactionIcon(tx.type)}
                                        <div>
                                            <p className="font-semibold text-sm dark:text-slate-200">{formatType(tx.type)}</p>
                                            <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-sm ${['credit_buy', 'coupon_sell', 'referral', 'ad_reward', 'scratch_reward'].includes(tx.type) ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {['credit_buy', 'coupon_sell', 'referral', 'ad_reward', 'scratch_reward'].includes(tx.type) ? '+' : '-'}{tx.amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <p>No recent transactions</p>
                            </div>
                        )}
                    </div>

                    {transactions.length > 0 && (
                        <button className="w-full mt-4 text-center text-sm text-primary font-medium hover:underline">
                            View All History
                        </button>
                    )}
                </div>
            </div>

            <WalletModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
            />
        </div>
    );
}

export default Dashboard;
