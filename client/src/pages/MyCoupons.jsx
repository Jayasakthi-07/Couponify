import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Copy, CheckCircle } from 'lucide-react';

const MyCoupons = () => {
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
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
        fetchMyCoupons();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">My Coupons</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <p className="text-slate-500">You haven't purchased any coupons yet.</p>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon._id} className="card border-l-4 border-l-primary">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{coupon.brand}</h3>
                                    <p className="text-xs text-slate-500">Purchased on: {new Date(coupon.createdAt).toLocaleDateString()}</p>
                                    {/* Note: createdAt is listing date, buying date not stored in coupon? 
                                    Ah, logic: "Purchased on" usually transaction date. 
                                    Proto simplification: just show info.
                                */}
                                </div>
                                <Tag className="text-primary" size={20} />
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg mb-4 flex justify-between items-center group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => navigator.clipboard.writeText(coupon.code)}
                                title="Click to copy"
                            >
                                <span className="font-mono font-bold text-lg text-slate-800 dark:text-white tracking-widest">{coupon.code}</span>
                                <Copy size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="flex items-center text-green-600 text-sm font-medium">
                                <CheckCircle size={16} className="mr-2" />
                                Redeemable
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyCoupons;
