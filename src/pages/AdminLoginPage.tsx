import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader, XCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// Backend API URL (Vercel ya Localhost handle karega)
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeobackend.netlify.app';

const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Development backdoor for testing
    const MOCK_ADMIN_EMAIL = 'admin@app.com';
    const MOCK_ADMIN_PASS = '123456';

    useEffect(() => {
        // Page load pe purana session clear kar do taake naya login clean ho
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError("Email aur Password dono zaroori hain.");
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting login to:", `${BASE_URL}/api/login`);
            
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Handle Non-JSON Responses (Vercel Crashes/HTML errors)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") === -1) {
                const text = await response.text();
                throw new Error("Server Error: Received HTML instead of JSON. Check Backend Logs.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            // --- STRICT ADMIN CHECK ---
            // Backend se userRole aana chahiye 'admin'
            if (data.token && data.userRole === 'admin') {
                
                // 1. Store Credentials
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.userName || 'Admin');
                localStorage.setItem('userRole', data.userRole);
                
                console.log("✅ Admin Login Success:", data.userName);

                // 2. Redirect with slight delay for storage propagation
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 100);
                
            } else if (data.token && data.userRole !== 'admin') {
                // Agar user login ho gya lekin wo Admin nahi hai
                setError("Access Denied: Ye area sirf Admins ke liye hai.");
                localStorage.clear(); // Token hata do
            } else {
                setError("Invalid Server Response. Missing Token.");
            }

        } catch (err: any) {
            console.error("Login Error:", err);

            // --- MOCK FALLBACK (Emergency Access) ---
            if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASS) {
                console.warn("⚠️ Network failed. Using Mock Admin Access.");
                localStorage.setItem('authToken', 'mock_admin_token_fallback');
                localStorage.setItem('userName', 'Mock Admin');
                localStorage.setItem('userRole', 'admin');
                
                setTimeout(() => {
                    navigate('/admin/dashboard', { replace: true });
                }, 100);
                return;
            }
            // --- END MOCK FALLBACK ---

            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-purple-700 relative overflow-hidden">
                
                {/* Decorative Background Blur */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <h2 className="text-3xl font-bold text-cyan-400 mb-2 text-center">Admin Portal</h2>
                <p className="text-center text-gray-400 mb-6 text-sm">Romeo Backend V4.0 Connection</p>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 p-3 rounded-lg text-red-200 text-sm mb-5 flex items-start animate-pulse">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute w-5 h-5 text-purple-400 top-3 left-3" />
                            <input
                                type="email"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@romeo.com"
                                className="w-full p-3 pl-10 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute w-5 h-5 text-purple-400 top-3 left-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-3 pl-10 pr-10 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                                required
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-white transition"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-bold transition duration-300 flex items-center justify-center shadow-lg
                            ${loading 
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-purple-500/25'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                Login to Dashboard
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-gray-700 pt-4">
                     <p className="text-xs text-gray-500">
                        Secure Connection via Custom JWT
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
