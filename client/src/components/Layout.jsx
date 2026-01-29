import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingBag, Tag, CreditCard, LogOut, User, Menu, X, Gift } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={clsx(
            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
            active ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
        { icon: Tag, label: 'My Coupons', path: '/my-coupons' },
        { icon: Gift, label: 'Rewards', path: '/rewards' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark flex">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Couponify
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                        />
                    ))}

                    {user?.isAdmin && (
                        <SidebarItem
                            icon={User}
                            label="Admin Panel"
                            path="/admin"
                            active={location.pathname === '/admin'}
                        />
                    )}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-4 px-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate dark:text-white">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            <div className="flex items-center gap-1 mt-1 text-amber-600 font-bold text-xs">
                                <CreditCard size={12} />
                                <span>{user?.credits || 0} Credits</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Couponify
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Confirm Logout</h3>
                        <p className="text-slate-500 mb-6">Are you sure you want to log out of your account?</p>
                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg transition-transform active:scale-95"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
