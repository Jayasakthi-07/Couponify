import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Users, Tag } from 'lucide-react';

const AdminPanel = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ userCount: 0, couponCount: 0, pendingCoupons: 0 });
    const [pendingList, setPendingList] = useState([]);

    // Fetch Stats and Pending Coupons on Load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            // In a real app, separate calls. Here assuming strict prototype routes or just fetch pending manually if no combined route.
            // I created /api/admin/stats. Let's assume I also need /api/admin/pending-coupons or similar.
            // Actually my admin.js route only has /stats, /approve/:id, /reject/:id. 
            // I missed creating a "get pending coupons" route in admin.js. 
            // I can reuse "Marketplace" route but filtering? No, marketplace only shows 'available'.
            // I need to add a route or filter in frontend if I fetch all? 
            // Let's quickly add a get pending route to `server/routes/admin.js` or just modify the `stats` route to return pending list?

            // Let's try fetching stats first.
            const resStats = await axios.get('http://localhost:5000/api/admin/stats', { headers: { 'x-auth-token': token } });
            setStats(resStats.data);

            // Now I need pending coupons. I'll add a quick route in admin.js via multi_replace?
            // Or I can just fetch from a new endpoint I'll Creating right now.
            // Actually, standard practice: get /api/admin/coupons?status=pending

            // I will assume I'll fix the backend to support this or just fetch all coupons if I had a route.
            // Wait, "View all transactions" was a requirement too.

            // Let's implement fetchPendingCoupons logic assuming I'll fix the backend next step.
            const resPending = await axios.get('http://localhost:5000/api/admin/coupons/pending', { headers: { 'x-auth-token': token } });
            setPendingList(resPending.data);

        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            if (action === 'approve') {
                await axios.post(`http://localhost:5000/api/admin/approve-coupon/${id}`, {}, { headers: { 'x-auth-token': token } });
            } else {
                await axios.post(`http://localhost:5000/api/admin/reject-coupon/${id}`, {}, { headers: { 'x-auth-token': token } });
            }
            fetchData(); // Refresh
            alert(`Coupon ${action}d`);
        } catch (err) {
            alert('Action failed');
        }
    };

    if (!user?.isAdmin) return <div className="p-8 text-center text-red-500">Access Denied</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Admin Panel</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Users</p>
                        <p className="text-2xl font-bold dark:text-white">{stats.userCount}</p>
                    </div>
                </div>
                <div className="card flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <Tag size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Total Coupons</p>
                        <p className="text-2xl font-bold dark:text-white">{stats.couponCount}</p>
                    </div>
                </div>
                <div className="card flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                        <Tag size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Pending Approval</p>
                        <p className="text-2xl font-bold dark:text-white">{stats.pendingCoupons || pendingList.length}</p>
                    </div>
                </div>
            </div>

            {/* Pending Approval List */}
            <h3 className="text-xl font-bold mb-4 dark:text-white">Pending Approvals</h3>
            <div className="space-y-4">
                {pendingList.length === 0 ? (
                    <p className="text-slate-500">No pending coupons.</p>
                ) : (
                    pendingList.map(coupon => (
                        <div key={coupon._id} className="card flex justify-between items-center">
                            <div>
                                <h4 className="font-bold dark:text-white">{coupon.brand}</h4>
                                <p className="text-sm text-slate-500">Code: {coupon.code} | Price: {coupon.price}</p>
                                <p className="text-xs text-slate-400">Seller ID: {coupon.sellerId?.username || coupon.sellerId}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAction(coupon._id, 'approve')}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => handleAction(coupon._id, 'reject')}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
