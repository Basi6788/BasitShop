import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormHandler, useAuth } from '../context/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

// --- Language Toggle Icon ---
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
        welcomeSubtitle: 'Login to continue',
        createTitle: 'Create Account',
        createSubtitle: 'Sign up to get started',
        loginTitle: 'Sign In',
        loginSubtitle: 'Sign in to your account',
        registerTitle: 'Sign Up',
        registerSubtitle: 'Fill in the details to join',
        toggleToRegister: "Don't have an account? ",
        toggleToRegisterAction: 'Sign Up',
        toggleToLogin: 'Already have an account? ',
        toggleToLoginAction: 'Sign In',
        language: 'English',
    },
    ur: {
        welcomeTitle: 'خوش آمدید!',
        welcomeSubtitle: 'جاری رکھنے کے لیے لاگ ان کریں۔',
        createTitle: 'اکاؤنٹ بنائیں',
        createSubtitle: 'شروع کرنے کے لیے سائن اپ کریں۔',
        loginTitle: 'لاگ ان کریں',
        loginSubtitle: 'اپنے اکاؤنٹ میں لاگ ان کریں۔',
        registerTitle: 'سائن اپ کریں',
        registerSubtitle: 'شامل ہونے کے لیے تفصیلات پُر کریں۔',
        toggleToRegister: 'کوئی اکاؤنٹ نہیں ہے؟ ',
        toggleToRegisterAction: 'سائن اپ کریں',
        toggleToLogin: 'پہلے سے ہی ایک اکاؤنٹ ہے؟ ',
        toggleToLoginAction: 'لاگ ان کریں',
        language: 'اردو',
    },
};

// --- Live Galaxy Mixing Background (5 SECOND ANIMATION) ---
const AnimatedGradientBackground = () => (
    <motion.div
        className="fixed inset-0 z-0"
        style={{
            background: 'linear-gradient(270deg, #582C83, #3E1E68, #241B3A, #4a1a7c, #582C83)',
            backgroundSize: '1000% 1000%', 
        }}
        animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
            duration: 5, // 5 second animation
            repeat: Infinity,
            ease: 'linear', 
        }}
    />
);


const LoginRegisterPage = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [language, setLanguage] = useState('en'); // Default language 'en' (English)

    const toggleForm = () => setIsLogin(!isLogin);
    const toggleLanguage = () => setLanguage((lang) => (lang === 'en' ? 'ur' : 'en'));

    const t = translations[language];

    // Navigation logic
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/profile', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    // Login success handler
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
        <div className="relative min-h-svh w-full flex items-center justify-center p-4 overflow-hidden">
            {/* 1. Naya Live Galaxy Mixing Background */}
            <AnimatedGradientBackground />

            {/* 2. Language Toggle Button (z-20 taake sabse oopar ho) */}
            <motion.button
                onClick={toggleLanguage}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium transition-colors hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <GlobeIcon className="w-5 h-5" />
                <span>{language === 'en' ? 'English' : 'اردو'}</span>
            </motion.button>

            {/* 3. Glassmorphism Card Container (z-10 taake background se oopar ho) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <div
                    className="bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                >
                    <div className="p-8 md:p-10">
                        {/* Headers (Welcome/Create Account) */}
                        <AnimatePresence mode="wait">
                            <motion.h2
                                key={isLogin ? 'welcome' : 'create'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="text-3xl font-bold text-center text-white mb-2"
                            >
                                {isLogin ? t.welcomeTitle : t.createTitle}
                            </motion.h2>
                        </AnimatePresence> {/* <--- TYPO YAHAN THA, AB FIX HO GAYA HAI */}
                        <p className="text-center text-gray-300 mb-6">
                            {isLogin ? t.welcomeSubtitle : t.createSubtitle}
                        </p>

                        {/* Login/Register Title (Picture ke mutabiq) */}
                        <AnimatePresence mode="wait">
                            <motion.h3
                                key={isLogin ? 'loginTitle' : 'regTitle'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="text-2xl font-semibold text-white mb-2"
                            >
                                {isLogin ? t.loginTitle : t.registerTitle}
                            </motion.h3>
                        </AnimatePresence>
                        <p className="text-gray-300 mb-6 text-sm">
                            {isLogin ? t.loginSubtitle : t.registerSubtitle}
                        </p>

                        <AuthFormHandler
                            isLoginView={isLogin}
                            onToggle={toggleForm}
                            onLoginSuccess={handleLoginSuccess}
                            language={language} 
                        />
                    </div>
                </div>

                {/* 4. Bottom Toggle Button */}
                <div className="text-center mt-6" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                    <button
                        onClick={toggleForm}
                        className="text-gray-400 hover:text-white transition-colors duration-300 font-medium"
                    >
                        {isLogin ? t.toggleToRegister : t.toggleToLogin}
                        <span className="font-bold text-white hover:underline">
                            {isLogin ? t.toggleToRegisterAction : t.toggleToLoginAction}
                        </span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginRegisterPage;



