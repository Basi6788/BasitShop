// Path: src/context/AuthProvider.jsx (Yeh file ab sirf Context, Provider, aur AuthFormHandler rakhegi)

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
// 🛑 FIX: Missing icons (Eye, EyeOff, Loader2, AlertTriangle) shamil kiye gaye hain
import { Eye, EyeOff, User, LogOut, Loader2, Mail, Lock, AlertTriangle, Camera } from 'lucide-react'; 

// --- Global Constants and Utilities ---
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app';
const USER_ID_KEY = 'currentUserId';
const USER_NAME_KEY = 'userName';
const AUTH_TOKEN_KEY = 'authToken'; 
const USER_ROLE_KEY = 'userRole';   
const PROFILE_PIC_KEY = 'profilePicBase64';

// Function to map common errors to user-friendly messages in Roman Urdu
const getErrorMessage = (errorName) => {
  switch (errorName) {
    case 'InvalidCredentials':
      return 'Email or password is wrong.';
    case 'EmailInUse':
      return 'Email is already registered.';
    case 'EmptyFields':
      return 'Please fill all fiels.';
    case 'PasswordTooShort':
        return 'Password can not short from 6 chrachter.';
    case 'InvalidName':
        return 'Use 3 to 20 chrachters in name.';
    case 'NetworkError':
      return 'Oops there is error from server please try later.';
    case 'AdminLogin': // Admin login attempt on user form
        return 'Admin cannot access from this form .';
    default:
      return 'It seems like there is any problem.';
  }
};


// --- Auth Context ---
const AuthContext = createContext({ 
    isLoggedIn: false, 
    userId: null, 
    userName: '', 
    userRole: 'guest',
    authToken: null,
    profilePic: null,
    isLoading: false,
    handleAuthSuccess: () => {}, 
    logoutUser: () => {},
    updateProfilePic: () => {}
});

export const useAuth = () => useContext(AuthContext);

// --- Auth Provider ---
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || null); 
    const [userRole, setUserRole] = useState(() => localStorage.getItem(USER_ROLE_KEY) || 'guest'); 
    const [userId, setUserId] = useState(() => localStorage.getItem(USER_ID_KEY) || null);
    const [userName, setUserName] = useState(() => localStorage.getItem(USER_NAME_KEY) || '');
    const [profilePic, setProfilePic] = useState(() => localStorage.getItem(PROFILE_PIC_KEY) || null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(AUTH_TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthSuccess = useCallback(async (data, isRegister) => {
        setIsLoading(true);
        
        const { token, userId: backendUserId, userName: backendUserName, userRole: backendUserRole } = data;

        setAuthToken(token);
        setUserId(String(backendUserId));
        setUserName(backendUserName);
        setUserRole(backendUserRole);
        setIsLoggedIn(true);

        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_ID_KEY, String(backendUserId));
        localStorage.setItem(USER_NAME_KEY, backendUserName);
        localStorage.setItem(USER_ROLE_KEY, backendUserRole);
        
        if (isRegister) {
            localStorage.removeItem(PROFILE_PIC_KEY);
            setProfilePic(null);
        }

        setIsLoading(false);
    }, []);

    const logoutUser = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY); 
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(USER_NAME_KEY);
        localStorage.removeItem(USER_ROLE_KEY); 
        localStorage.removeItem(PROFILE_PIC_KEY);
        
        setAuthToken(null);
        setUserId(null);
        setUserName('');
        setUserRole('guest');
        setProfilePic(null);
        setIsLoggedIn(false);
    }, []);
    
    const updateProfilePic = useCallback((base64) => {
        setProfilePic(base64);
        localStorage.setItem(PROFILE_PIC_KEY, base64);
    }, []);

    const value = { 
        isLoggedIn, userId, userName, userRole, authToken, profilePic, isLoading,
        handleAuthSuccess, logoutUser, updateProfilePic
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// --- AUTH FORM HANDLER (WITH STRICTER VALIDATION LOGIC) ---
export const AuthFormHandler = ({ isLoginView, onToggle, onLoginSuccess }) => {
    const { handleAuthSuccess } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Form switch hone par fields clear karein
        setName('');
        setEmail('');
        setPassword('');
        setError('');
    }, [isLoginView]);

    // 🛑 STRICTURE VALIDATION FUNCTION
    const validateFields = () => {
        if (!email || !password || (!isLoginView && !name)) {
            return getErrorMessage('EmptyFields');
        }
        if (password.length < 6) {
            return getErrorMessage('PasswordTooShort');
        }
        if (!isLoginView && (name.length < 3 || name.length > 50)) {
            return getErrorMessage('InvalidName');
        }
        // Admin email se user side par register/login block karein (Security check)
        if (email.toLowerCase().endsWith('@app.com')) {
            return getErrorMessage('AdminLogin'); 
        }
        return null;
    };


    const handleAuth = async (e) => {
        e.preventDefault();
        
        const validationError = validateFields();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsSubmitting(true);
        
        const endpoint = isLoginView ? `${BASE_URL}/api/login` : `${BASE_URL}/api/register`;

        try {
            const bodyData = isLoginView 
                ? { email, password } 
                : { name, email, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            
            const text = await response.text(); 
            
            if (!response.ok) {
                const data = text ? JSON.parse(text) : {};
                
                if (data.message && data.message.includes('already exists')) {
                    throw new Error('EmailInUse');
                }
                if (data.message && data.message.includes('Invalid Credentials')) {
                    throw new Error('InvalidCredentials');
                }
                
                throw new Error(data.message || 'UnknownError'); 
            }
            
            const data = JSON.parse(text);
            
            await handleAuthSuccess(data, !isLoginView); 
            
            // Login success hone par callback function call karein (Profile page par redirect ke liye)
            if (onLoginSuccess) {
                onLoginSuccess(data.userRole);
            }

        } catch (e) {
            const errorMessage = e.message.startsWith('Failed to fetch') ? 'NetworkError' : e.message;
            setError(getErrorMessage(errorMessage || 'UnknownError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const title = isLoginView ? 'Login Karein' : 'Register Karein';
    const subtitle = isLoginView ? 'Apne account mein login karein.' : 'Naya account banayein.';
    const buttonText = isLoginView ? 'Login Karein' : 'Register Karein';
    const togglePrompt = isLoginView ? 'Naya account chahiye?' : 'Pehle se account hai?';
    const toggleButtonText = isLoginView ? 'Register Karein' : 'Login Karein';
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        
        {error && (
            <div className="flex items-center p-3 text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Name Input (Only for Register View) */}
          {!isLoginView && (
            <div className="relative">
                <label htmlFor="authName" className="sr-only">Naam</label>
                <input 
                  type="text" 
                  id="authName" 
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required={!isLoginView}
                  minLength={3} 
                  maxLength={50}
                />
                <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-[calc(50%+4px)] left-3" />
            </div>
          )}

          {/* Email Input */}
          <div className="relative">
            <label htmlFor="authEmail" className="sr-only">Email</label>
            <input 
              type="email" 
              id="authEmail" 
              placeholder="apka@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-[calc(50%+4px)] left-3" />
          </div>
          
          {/* Password Input with Toggle */}
          <div className="relative">
            <label htmlFor="authPassword" className="sr-only">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="authPassword" 
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              minLength={6} 
            />
            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-[calc(50%+4px)] left-3" />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className={"absolute p-2 transition duration-150 ease-in-out transform -translate-y-1/2 rounded-full text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 top-[calc(50%+4px)] right-2 btn-animated"}
                aria-label={showPassword ? 'Password chupao' : 'Password dikhao'}
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={"w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] btn-animated"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
                {isLoginView ? 'Login Ho Raha Hai...' : 'Register Ho Raha Hai...'}
              </>
            ) : (
                buttonText
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {togglePrompt}{' '}
          <button 
            type="button" 
            onClick={onToggle} 
            className={"font-medium text-indigo-600 hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition duration-150 btn-animated"}
          >
            {toggleButtonText}
          </button>
        </p>
      </div>
    );
};

