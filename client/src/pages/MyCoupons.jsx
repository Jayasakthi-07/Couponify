import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Copy, Plus, DollarSign } from 'lucide-react';

const MyCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    // Form States
    const [newCoupon, setNewCoupon] = useState({ brand: '', code: '', expiryDate: '' });
    const [sellPrice, setSellPrice] = useState('');

    const fetchMyCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/coupons/my-coupons', {
                headers: { 'x-auth-token': token }
            });
            setCoupons(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyCoupons();
    }, []);

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/coupons/add', newCoupon, {
                headers: { 'x-auth-token': token }
            });
            setShowAddModal(false);
            setNewCoupon({ brand: '', code: '', expiryDate: '' });
            fetchMyCoupons();
        } catch (err) {
            alert('Error adding coupon');
        }
    };

    const handleSellCoupon = async (e) => {
        e.preventDefault();
        if (!selectedCoupon) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/coupons/sell/${selectedCoupon._id}`, { price: sellPrice }, {
                headers: { 'x-auth-token': token }
            });
            setShowSellModal(false);
            setSellPrice('');
            setSelectedCoupon(null);
            fetchMyCoupons();
        } catch (err) {
            alert('Error listing coupon');
        }
    };

    const openSellModal = (coupon) => {
        setSelectedCoupon(coupon);
        setShowSellModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">My Wallet & Coupons</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                    <Plus size={20} /> Add Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <p className="text-slate-500">Your wallet is empty.</p>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon._id} className="card border-l-4 border-l-primary relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{coupon.brand}</h3>
                                    <p className="text-xs text-slate-500">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Tag className="text-primary" size={20} />
                                    <span className={`text-xs px-2 py-1 rounded-full ${coupon.status === 'wallet' ? 'bg-green-100 text-green-700' :
                                        coupon.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {coupon.status === 'wallet' ? 'In Wallet' :
                                            coupon.status === 'pending' ? 'Pending Approval' : 'Listed'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg mb-4 flex justify-between items-center group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => navigator.clipboard.writeText(coupon.code)}
                                title="Click to copy"
                            >
                                <span className="font-mono font-bold text-lg text-slate-800 dark:text-white tracking-widest">{coupon.code}</span>
                                <Copy size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                            </div>

                            {coupon.status === 'wallet' && (
                                <button
                                    onClick={() => openSellModal(coupon)}
                                    className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors flex justify-center items-center gap-2"
                                >
                                    <DollarSign size={18} /> Sell Coupon
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Coupon Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Add Coupon to Wallet</h3>
                        <form onSubmit={handleAddCoupon}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full input"
                                    value={newCoupon.brand}
                                    onChange={e => setNewCoupon({ ...newCoupon, brand: e.target.value })}
                                    placeholder="e.g. Amazon, Myntra"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full input"
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                    placeholder="XXXX-XXXX"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full input"
                                    value={newCoupon.expiryDate}
                                    onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">Add Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sell Coupon Modal */}
            {showSellModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">List Coupon for Sale</h3>
                        <p className="mb-4 text-slate-600 dark:text-slate-400">
                            Set a price for your <strong>{selectedCoupon?.brand}</strong> coupon.
                        </p>
                        <form onSubmit={handleSellCoupon}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Price (Credits)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full input"
                                    value={sellPrice}
                                    onChange={e => setSellPrice(e.target.value)}
                                    placeholder="e.g. 50"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSellModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">List for Sale</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCoupons;
