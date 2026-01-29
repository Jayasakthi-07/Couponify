import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token and get user details
                    // For now, we decode or fetch simplified.
                    // Better: Fetch from /api/auth/me if exists, or store user in localstorage (less secure but ok for proto)
                    // We'll fetch wallet/user info.

                    // Simple Setup: assume valid if token exists? No.
                    // Let's implement a 'loadUser' function if we had /me route.
                    // Re-using Login response data if stored?

                    // For this prototype, if token exists, we try to fetch wallet to validate.
                    const res = await axios.get('http://localhost:5000/api/wallet', {
                        headers: { 'x-auth-token': token }
                    });

                    // If successful, we need user details. 
                    // We'll store basic user info in localStorage on login too for ease.
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if (storedUser) {
                        // Update credits from wallet fetch
                        setUser({ ...storedUser, credits: res.data.credits });
                    }
                } catch (err) {
                    console.error("Auth verification failed", err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (username, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const refreshWallet = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/wallet', {
                headers: { 'x-auth-token': token }
            });
            setUser(prev => ({ ...prev, credits: res.data.credits }));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, refreshWallet }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
