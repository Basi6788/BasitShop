// Path: /src/components/Header.tsx
// --- FINAL FIX: Token Authentication, Safe Cart Access & Profile Redirection ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon, SearchIcon, XCircleIcon, SunIcon, MoonIcon, HomeIcon, StoreIcon,
  UserIcon, LayoutDashboard, LogOut, X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// ---------------- Desktop Nav Link ----------------
const DesktopNavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ to, children, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm transition-colors duration-200 flex items-center gap-1
       ${isActive
         ? 'text-black dark:text-white font-semibold' 
         : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white font-medium'
       }`
    }
  >
    {icon && <span className="w-4 h-4">{icon}</span>}
    {children}
  </NavLink>
);

// ---------------- Utility Button ----------------
const UtilityButton: React.FC<{ onClick?: () => void, label: string, children: React.ReactNode, className?: string }> = 
  ({ onClick, label, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      p-2 rounded-full transition-colors duration-300
      hover:bg-black/10 dark:hover:bg-white/10
      flex items-center
      ${className} 
    `}
    aria-label={label}
  >
    {children}
  </button>
);

// ---------------- Main Header ----------------
export function Header() { 
  const cartContext = useCart();
  const cart = cartContext?.cart || [];
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null); 

  // 🟢 Safe cart count calculation
  const cartItemCount = Array.isArray(cart)
    ? cart.reduce((total, item) => total + (item?.quantity || 0), 0)
    : 0;

  const [isSearchActive, setIsSearchActive] = useState(false); 
  const [query, setQuery] = useState(''); 
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark' ||
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 🟢 Auth states from localStorage
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = !!authToken;
  const isAdmin = userRole === 'admin';

  useEffect(() => setIsLoaded(true), []);

  // 🟢 Dark Mode Logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ---------------- Search Logic ----------------
  const handleFinalSearch = (e: React.FormEvent | string) => {
    let finalQuery: string;
    if (typeof e === 'string') finalQuery = e.trim();
    else {
      e.preventDefault();
      finalQuery = query.trim();
    }
    if (finalQuery) {
      setIsSearchActive(false);
      setQuery('');
      inputRef.current?.blur();
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return []; 
    const MOCK_PRODUCT_NAMES: string[] = ['BAST Giga-Flow Headset', 'Smart Ring Device', 'Mini Projector Pro'];
    const lowerCaseQuery = query.toLowerCase().trim();
    return MOCK_PRODUCT_NAMES.filter(name => name.toLowerCase().includes(lowerCaseQuery)).slice(0, 5);
  }, [query]);

  const handleMobileSearchToggle = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setQuery('');
    } else {
      setIsSearchActive(true);
      setTimeout(() => inputRef.current?.focus(), 100); 
    }
  };

  // ---------------- Logout & Profile ----------------
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentUserId');
    navigate('/', { replace: true }); 
    window.location.reload(); 
  };

  const handleProfileRedirect = () => {
    if (isAuthenticated) navigate('/profile');
    else navigate('/login');
  };

  // ---------------- Render ----------------
  return (
    <header className="fixed top-0 left-0 w-full py-4 px-6 z-40">
      <div className={`
        max-w-7xl mx-auto flex items-center justify-between rounded-full
        border border-white/20 dark:border-gray-700/50 px-4 py-2 md:px-6 md:py-3 shadow-lg
        backdrop-blur-md bg-white/70 dark:bg-black/50 transition-all duration-700 ease-out
        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}
      `}>
        
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setIsSearchActive(false)}
          className={`text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ${isSearchActive ? 'hidden' : 'block'}`}
          style={{ background: 'linear-gradient(to right, #22d3ee, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          BASIT SHOP
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center gap-6 ${isSearchActive ? 'hidden' : 'flex'}`}>
          <DesktopNavLink to="/" icon={<HomeIcon className="w-4 h-4" />}>Home</DesktopNavLink>
          <DesktopNavLink to="/products" icon={<StoreIcon className="w-4 h-4" />}>Shop</DesktopNavLink>
          {isAdmin && (
            <DesktopNavLink to="/admin/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>Admin</DesktopNavLink>
          )}
          {isAuthenticated ? (
            <>
              <DesktopNavLink to="/profile" icon={<UserIcon className="w-4 h-4" />}>Profile</DesktopNavLink>
              <UtilityButton onClick={handleLogout} label="Logout" className="ml-2 bg-red-600 text-white hover:bg-red-700 p-2">
                <LogOut className="w-4 h-4" />
              </UtilityButton>
            </>
          ) : (
            <DesktopNavLink to="/login" icon={<UserIcon className="w-4 h-4" />}>Login</DesktopNavLink>
          )}
        </nav>

        {/* Search Bar */}
        <div className={`relative flex-grow md:flex ${isSearchActive ? 'flex mx-0 flex-1' : 'hidden mx-0 md:mx-4'} transition-all duration-1000 ease-in-out max-w-xl`}>
          <form onSubmit={handleFinalSearch} className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Products search karein aur suggestions dekhein..."
              className="w-full p-2 pl-4 pr-16 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 z-10"
                aria-label="Clear search"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className={"absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400 z-10 btn-animated"}
              disabled={!query.trim()}
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-4">
          {!isSearchActive && (
            <Link to="/cart" className="relative">
              <UtilityButton label="Cart">
                <ShoppingCartIcon className="w-6 h-6 text-black dark:text-white" /> 
              </UtilityButton>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white/20">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}
          <UtilityButton onClick={handleMobileSearchToggle} label={isSearchActive ? "Close search" : "Open search"} className="md:hidden">
            {isSearchActive ? <XCircleIcon className="w-6 h-6 text-red-500" /> : <SearchIcon className="w-6 h-6 text-black dark:text-white" />}
          </UtilityButton>
          {!isSearchActive && (
            <UtilityButton onClick={handleProfileRedirect} label={isAuthenticated ? "Profile" : "Login"} className="md:hidden">
              <UserIcon className={`w-6 h-6 ${isAuthenticated ? 'text-purple-500' : 'text-black dark:text-white'}`} />
            </UtilityButton>
          )}
          <UtilityButton onClick={toggleDarkMode} label="Toggle dark mode">
            {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-black" />}
          </UtilityButton>
        </div>
      </div>
    </header>
  );
}
