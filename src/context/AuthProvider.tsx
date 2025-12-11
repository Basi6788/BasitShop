// Path: src/context/AuthProvider.tsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Eye, EyeOff, User, LogOut, Loader2, Mail, Lock, AlertTriangle, Camera } from 'lucide-react';

// --- Constants ---
const BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) ? import.meta.env.VITE_BACKEND_URL : 'https://romeo-backend.vercel.app';
const USER_ID_KEY = 'currentUserId';
const USER_NAME_KEY = 'userName';
const AUTH_TOKEN_KEY = 'authToken';
const USER_ROLE_KEY = 'userRole';
const PROFILE_PIC_KEY = 'profilePicBase64';

// --- Utility: friendly messages (Roman Urdu) ---
const getErrorMessage = (errorName: string) => {
  switch (errorName) {
    case 'InvalidCredentials':
      return 'Email ya password ghalat hai.';
    case 'EmailInUse':
      return 'Email pehle se registered hai.';
    case 'EmptyFields':
      return 'Saray fields bhar dein.';
    case 'PasswordTooShort':
      return 'Password kam az kam 6 characters ka hona chahiye.';
    case 'InvalidName':
      return 'Naam 3 se 50 characters ke darmiyan rakhein.';
    case 'NetworkError':
      return 'Server mein masla nazar aa raha hai. Baad mein try karein.';
    case 'AdminLogin':
      return 'Admin is form se register nahi kar sakta. Agar aap admin ho to login use karein.';
    default:
      return 'Kuch masla hogaya, dobara koshish karein.';
  }
};

// --- Types (light) ---
type AuthContextType = {
  isLoggedIn: boolean;
  userId: string | null;
  userName: string;
  userRole: string;
  authToken: string | null;
  profilePic: string | null;
  isLoading: boolean;
  handleAuthSuccess: (data: any, isRegister?: boolean) => Promise<void>;
  logoutUser: () => void;
  updateProfilePic: (base64: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  userName: '',
  userRole: 'guest',
  authToken: null,
  profilePic: null,
  isLoading: false,
  handleAuthSuccess: async () => {},
  logoutUser: () => {},
  updateProfilePic: () => {}
});

export const useAuth = () => useContext(AuthContext);

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [userRole, setUserRole] = useState<string>(() => localStorage.getItem(USER_ROLE_KEY) || 'guest');
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_ID_KEY) || null);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem(USER_NAME_KEY) || '');
  const [profilePic, setProfilePic] = useState<string | null>(() => localStorage.getItem(PROFILE_PIC_KEY) || null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // handle successful login/register from backend
  const handleAuthSuccess = useCallback(async (data: any, isRegister = false) => {
    setIsLoading(true);
    try {
      const { token, userId: backendUserId, userName: backendUserName, userRole: backendUserRole } = data;
      setAuthToken(token);
      setUserId(String(backendUserId));
      setUserName(backendUserName || '');
      setUserRole(backendUserRole || 'user');
      setIsLoggedIn(true);

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_ID_KEY, String(backendUserId));
      localStorage.setItem(USER_NAME_KEY, backendUserName || '');
      localStorage.setItem(USER_ROLE_KEY, backendUserRole || 'user');

      if (isRegister) {
        // clear any temp profile pic
        localStorage.removeItem(PROFILE_PIC_KEY);
        setProfilePic(null);
      }
    } finally {
      setIsLoading(false);
    }
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

  const updateProfilePic = useCallback((base64: string | null) => {
    if (base64) {
      localStorage.setItem(PROFILE_PIC_KEY, base64);
    } else {
      localStorage.removeItem(PROFILE_PIC_KEY);
    }
    setProfilePic(base64);
  }, []);

  // --- Dev helpers (same as before) ---
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).__getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
        (window as any).__fetchWithToken = async (url: string, opts: RequestInit = {}) => {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          const headers = Object.assign({}, opts.headers || {}, {
            Authorization: token ? `Bearer ${token}` : ''
          });
          const response = await fetch(url, Object.assign({}, opts, { headers, credentials: opts.credentials || 'include' }));
          return response;
        };

        // Auto patch fetch for requests to BASE_URL in dev (optional)
        const enableAutoPatch = (import.meta && import.meta.env && import.meta.env.MODE !== 'production') || true;
        if (enableAutoPatch) {
          const originalFetch = window.fetch.bind(window);
          (window as any).__restoreFetch = () => {
            (window as any).fetch = originalFetch;
            delete (window as any).__restoreFetch;
          };
          (window as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
            try {
              const token = localStorage.getItem(AUTH_TOKEN_KEY);
              let url = typeof input === 'string' ? input : (input as Request).url;
              if (url && url.startsWith(BASE_URL)) {
                const headers = Object.assign({}, init && init.headers ? init.headers : {}, {
                  Authorization: token ? `Bearer ${token}` : ''
                });
                const newInit = Object.assign({}, init || {}, { headers, credentials: init && init.credentials ? init.credentials : 'include' });
                return originalFetch(input, newInit);
              }
            } catch (e) {
              // fallback
            }
            return originalFetch(input, init);
          };
        }
      }
    } catch (e) {
      console.warn('[AuthProvider] dev helpers init failed', e);
    }

    return () => {
      try {
        if (typeof window !== 'undefined' && (window as any).__restoreFetch) {
          (window as any).__restoreFetch();
        }
        if (typeof window !== 'undefined') {
          delete (window as any).__getAuthToken;
          delete (window as any).__fetchWithToken;
        }
      } catch (e) {}
    };
  }, []);

  const value: AuthContextType = {
    isLoggedIn,
    userId,
    userName,
    userRole,
    authToken,
    profilePic,
    isLoading,
    handleAuthSuccess,
    logoutUser,
    updateProfilePic
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------------- AUTH FORM HANDLER COMPONENT ----------------
export const AuthFormHandler: React.FC<{
  isLoginView: boolean;
  onToggle: () => void;
  onLoginSuccess?: (role: string) => void;
}> = ({ isLoginView, onToggle, onLoginSuccess }) => {
  const { handleAuthSuccess } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }, [isLoginView]);

  // NOTE: Admin emails are blocked only for REGISTER (security). LOGIN allows admin.
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
    // Block admin *registration* only:
    if (!isLoginView && email.toLowerCase().endsWith('@app.com')) {
      return getErrorMessage('AdminLogin');
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
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
      const bodyData = isLoginView ? { email, password } : { name, email, password };

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

      // Agar backend ne role admin bheji to redirect kar do (login flow)
      if (isLoginView && data && data.userRole === 'admin') {
        try {
          // Agar parent provided onLoginSuccess, call pehle usko
          if (onLoginSuccess) onLoginSuccess(data.userRole);
        } catch (ignore) {}
        // Redirect to admin dashboard (client-side)
        window.location.href = '/admin/dashboard';
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.userRole);
      }
    } catch (e: any) {
      const msgKey = (typeof e?.message === 'string' && e.message.startsWith('Failed to fetch')) ? 'NetworkError' : (e?.message || 'UnknownError');
      setError(getErrorMessage(msgKey));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  const title = isLoginView ? 'Login Karein' : 'Register Karein';
  const subtitle = isLoginView ? 'Apne account mein login karein.' : 'Naya account banayein.';
  const buttonText = isLoginView ? 'Login Karein' : 'Register Karein';
  const togglePrompt = isLoginView ? 'Naya account chahiye?' : 'Pehle se account hai?';
  const toggleButtonText = isLoginView ? 'Register Karein' : 'Login Karein';

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>

      {error && (
        <div className="flex items-center p-3 text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
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
            className="absolute p-2 transition duration-150 ease-in-out transform -translate-y-1/2 rounded-full text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 top-[calc(50%+4px)] right-2 btn-animated"
            aria-label={showPassword ? 'Password chupao' : 'Password dikhao'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] btn-animated"
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
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition duration-150 btn-animated"
        >
          {toggleButtonText}
        </button>
      </p>
    </div>
  );
};