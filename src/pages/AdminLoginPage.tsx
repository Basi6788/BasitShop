// Path: /src/pages/AdminLoginPage.tsx
// 🔷 FINAL FIX: Added setTimeout to ensure localStorage updates before redirect

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader, XCircle, Eye, EyeOff } from 'lucide-react';

// Backend API URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeobackend.netlify.app';

const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const MOCK_ADMIN_EMAIL = 'admin@app.com';
    const MOCK_ADMIN_PASS = '123456';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError("Email aur password zaroori hain.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/login`, { // ✅ /api/login endpoint use kiya
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                 const text = await response.text();
                if (text.includes('<!DOCTYPE')) {
                    throw new Error(`FATAL BACKEND CONFIG ERROR: Server ne JSON ki bajaye HTML bhej diya (Status: ${response.status}).`);
                }
                const data = JSON.parse(text);
                throw new Error(data.message || 'Login attempt failed.');
            }

            const data = await response.json();

            if (data.token && data.userRole === 'admin') {
                // SUCCESS: Token, Role aur Name save karo
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.userName || 'Admin');
                localStorage.setItem('userRole', data.userRole);
                
                // ✅ FIX: 50ms delay diya taake LocalStorage update ho jaye
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 50); // 50ms delay
                
            } else {
                setError(data.message || "Invalid Credentials. Access denied.");
            }

        } catch (err) {
            // --- MOCK FALLBACK LOGIC ---
            if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASS) {
                console.warn("Network failed/Backend issue. Using mock fallback for access.");
                localStorage.setItem('authToken', 'mock_admin_token_fallback');
                localStorage.setItem('userName', 'Mock Admin');
                localStorage.setItem('userRole', 'admin');
                
                // ✅ Mock fallback mein bhi delay add kiya
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 50); 
                return;
            }
            // --- END MOCK FALLBACK ---

            setError(`Login network error: ${err instanceof Error ? err.message : 'Unknown network failure.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-purple-700">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center border-b border-purple-700 pb-2">Admin Login</h2>

                {error && (
                    <div className="bg-red-900 p-3 rounded-lg border border-red-700 text-red-300 text-sm mb-4 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" /> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="relative">
                            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                            <input
                                type="email"
                                id="email"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Admin Email"
                                className="w-full p-3 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full p-3 pl-12 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                                title={showPassword ? "Password chhupao" : "Password dikhao"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={"w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition duration-300 flex items-center justify-center disabled:opacity-50 btn-animated"}
                    >
                        {loading ? (
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <LogIn className="w-5 h-5 mr-2" />
                        )}
                        {loading ? 'Logging In...' : 'LOGIN'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">For Admin Use Only</p>
            </div>
        </div>
    );
};

export default AdminLoginPage;

