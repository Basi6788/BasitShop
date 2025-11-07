import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- Original Imports Restored ---
import { AuthFormHandler, useAuth } from '../context/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (Lucide-React ke badle inline SVG) ---
const GlobeIcon = ({ className }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

// --- Translations (Roman Urdu hata diya gaya hai) ---
const translations = {
    en: {
        welcomeTitle: 'Welcome Back!',
        welcomeSubtitle: 'Login to continue your journey.',
        createTitle: 'New Adventure Starts!',
        createSubtitle: 'Sign up to create your account.',
        loginTitle: 'Sign In',
        loginSubtitle: 'Enter your credentials to access your dashboard.',
        registerTitle: 'Sign Up',
        registerSubtitle: 'Join us! Fill in your details below.',
        toggleToRegister: "Don't have an account?",
        toggleToRegisterAction: 'Register Now',
        toggleToLogin: 'Already a member?',
        toggleToLoginAction: 'Sign In Here',
        language: 'English',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        confirmPasswordPlaceholder: 'Confirm Password',
    },
    ur: {
        welcomeTitle: 'خوش آمدید!',
        welcomeSubtitle: 'اپنا سفر جاری رکھنے کے لیے لاگ ان کریں۔',
        createTitle: 'نیا ایڈونچر شروع!',
        createSubtitle: 'اپنا اکاؤنٹ بنانے کے لیے سائن اپ کریں۔',
        loginTitle: 'لاگ ان کریں',
        loginSubtitle: 'اپنے ڈیش بورڈ تک رسائی کے لیے اپنی تفصیلات درج کریں۔',
        registerTitle: 'سائن اپ کریں',
        registerSubtitle: 'ہمارے ساتھ شامل ہوں! اپنی تفصیلات نیچے پُر کریں۔',
        toggleToRegister: 'کوئی اکاؤنٹ نہیں ہے؟',
        toggleToRegisterAction: 'ابھی رجسٹر کریں',
        toggleToLogin: 'پہلے سے ہی ممبر ہیں؟',
        toggleToLoginAction: 'یہاں لاگ ان کریں',
        language: 'اردو',
        emailPlaceholder: 'ای میل ایڈریس',
        passwordPlaceholder: 'پاس ورڈ',
        confirmPasswordPlaceholder: 'پاس ورڈ کی تصدیق',
    },
};

// --- Live Galaxy Mixing Background (5 SECOND ANIMATION) ---
const AnimatedGradientBackground = () => (
    <motion.div
        className="fixed inset-0 z-0"
        style={{
            // Darker, richer galaxy colors
            background: 'linear-gradient(270deg, #1C0F32, #2A174F, #0F091E, #3B1F70, #1C0F32)',
            backgroundSize: '1000% 1000%', 
        }}
        animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
            duration: 8, // Thoda slow aur smooth animation
            repeat: Infinity,
            ease: 'easeInOut', 
        }}
    />
);


const LoginRegisterPage = () => {
    // --- useAuth and useNavigate are now using the actual imported hooks ---
    const { isLoggedIn } = useAuth(); 
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [language, setLanguage] = useState('en'); // Default language 'en' (English)

    const toggleForm = () => setIsLogin(!isLogin);
    const toggleLanguage = () => setLanguage((lang) => (lang === 'en' ? 'ur' : 'en'));

    const t = translations[language];

    // Navigation logic (Original code se)
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/profile', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    // Login success handler (Original code se)
    const handleLoginSuccess = (userRole) => {
        if (userRole === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else {
            navigate('/profile', { replace: true });
        }
    };

    if (isLoggedIn) {
        return null; 
    }

    return (
        <div className="relative min-h-svh w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden font-sans">
            {/* 1. Naya Live Galaxy Mixing Background */}
            <AnimatedGradientBackground />

            {/* 2. Language Toggle Button (Fixed Position) */}
            <motion.button
                onClick={toggleLanguage}
                className="fixed top-4 right-4 z-30 flex items-center gap-2 p-3 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium transition-colors hover:bg-indigo-600/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <GlobeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t.language}</span>
            </motion.button>

            {/* 3. Main Content Card (Dark Glassmorphism) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                // Mobile: 100% width, full height (like 2nd screenshot, but contained).
                // PC: max-w-md, centered card.
                className="w-full max-w-md relative z-10 flex flex-col justify-center min-h-[90vh] sm:min-h-0"
            >
                <div
                    className="bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-indigo-400/20 w-full"
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                >
                    <div className="p-6 sm:p-10">
                        
                        {/* Title Section */}
                        <div className="mb-8">
                            <AnimatePresence mode="wait">
                                <motion.h2
                                    key={isLogin ? 'welcome' : 'create'}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-4xl font-extrabold text-center text-white mb-2 tracking-tight"
                                >
                                    {isLogin ? t.welcomeTitle : t.createTitle}
                                </motion.h2>
                            </AnimatePresence>
                            <p className="text-center text-indigo-300 text-lg font-light">
                                {isLogin ? t.welcomeSubtitle : t.createSubtitle}
                            </p>
                        </div>

                        {/* Login/Register Form Card-like Container */}
                        <div className="bg-black/20 p-6 rounded-2xl shadow-inner border border-white/10">
                            
                            <AnimatePresence mode="wait">
                                <motion.h3
                                    key={isLogin ? 'loginTitle' : 'regTitle'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="text-2xl font-bold text-white mb-1"
                                >
                                    {isLogin ? t.loginTitle : t.registerTitle}
                                </motion.h3>
                            </AnimatePresence>
                            <p className="text-gray-400 mb-6 text-sm">
                                {isLogin ? t.loginSubtitle : t.registerSubtitle}
                            </p>
                            
                            {/* AuthFormHandler is now the actual component from '../context/AuthProvider' */}
                            <AuthFormHandler
                                isLoginView={isLogin}
                                onToggle={toggleForm}
                                onLoginSuccess={handleLoginSuccess}
                                language={language} 
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Toggle Button */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-6" 
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                >
                    <button
                        onClick={toggleForm}
                        className="text-gray-300 hover:text-white transition-colors duration-300 font-medium text-sm sm:text-base"
                    >
                        {isLogin ? t.toggleToRegister : t.toggleToLogin}
                        {' '}
                        <span className="font-extrabold text-indigo-400 hover:text-indigo-300 hover:underline">
                            {isLogin ? t.toggleToRegisterAction : t.toggleToLoginAction}
                        </span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginRegisterPage;

