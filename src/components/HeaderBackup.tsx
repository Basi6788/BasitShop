// Path: /src/components/Header.tsx
// --- UPDATED: 1. Active nav link ko bold kiya. 2. Icon colors ko individually set kiya. ---

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// --- Interface (Same as before) ---
interface HeaderProps {
  onSearch: (searchTerm: string) => void;
}

// --- Helper Component for Nav Links (Desktop) ---
const DesktopNavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm transition-colors duration-200
       ${isActive
         // --- CHANGE: Active state ab 'font-semibold' hai ---
         ? 'text-black dark:text-white font-semibold' 
         // --- CHANGE: Inactive state 'font-medium' hai ---
         : 'text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white font-medium'
       }`
    }
  >
    {children}
  </NavLink>
);

// --- Main Header Component ---
export function Header({
  onSearch,
}: HeaderProps) {

  const { cart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // --- DARK MODE LOGIC (Same as before) ---
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark' ||
          (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

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

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- FADE-IN EFFECT LOGIC (Same as before) ---
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // --- Handlers (Same as before) ---
  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <header className="
      fixed top-0 left-0 w-full
      py-4 px-6
      z-40
    ">
      {/* --- Main Glass Effect Container (Same as before) --- */}
      <div className={`
        max-w-7xl mx-auto flex items-center justify-between
        rounded-full
        border border-white/20 dark:border-gray-700/50 
        px-4 py-2 md:px-6 md:py-3
        shadow-lg
        backdrop-blur-md
        bg-white/70 dark:bg-black/50
        transition-all duration-700 ease-out
        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}
      `}>

        {/* --- 1. LOGO (Same as before) --- */}
        <Link
            to="/"
            className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
            style={{
              background: 'linear-gradient(to right, #22d3ee, #c026d3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
        >
          BASIT SHOP
        </Link>

        {/* --- 2. DESKTOP NAVIGATION LINKS (Center) --- */}
        {/* (Helper component mein changes ho gaye hain) */}
        <nav className="hidden md:flex items-center gap-6">
          <DesktopNavLink to="/">Home</DesktopNavLink>
          <DesktopNavLink to="/products">Shop</DesktopNavLink>
          <DesktopNavLink to="/search">Search</DesktopNavLink>
          
          <div className="relative">
            <DesktopNavLink to="/cart">Cart</DesktopNavLink>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white/20">
                {cartItemCount}
              </span>
            )}
          </div>
        </nav>

        {/* --- 3. ICONS (Right) --- */}
        <div className="flex items-center gap-3 md:gap-4">
            
            {/* Search Icon (Mobile Only) */}
            <UtilityButton onClick={handleSearchClick} label="Search" className="md:hidden">
                {/* --- CHANGE: Color explicitly set kiya --- */}
                <SearchIcon className="w-6 h-6 text-black dark:text-white" /> 
            </UtilityButton>

            {/* Cart Icon (Mobile Only) */}
            <Link to="/cart" className="relative md:hidden">
                <UtilityButton label="Cart">
                    {/* --- CHANGE: Color explicitly set kiya --- */}
                    <ShoppingCartIcon className="w-6 h-6 text-black dark:text-white" /> 
                </UtilityButton>
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white/20">
                        {cartItemCount}
                    </span>
                )}
            </Link>

            {/* Dark Mode Toggle - Always visible */}
            <UtilityButton onClick={toggleDarkMode} label="Toggle dark mode">
                {isDarkMode ? (
                    <SunIcon className="w-6 h-6 text-yellow-400" /> 
                ) : (
                    // --- CHANGE: Color explicitly set kiya ---
                    <MoonIcon className="w-6 h-6 text-black" /> 
                )}
            </UtilityButton>

        </div>
      </div>
    </header>
  );
}

// --- HELPER COMPONENT (UtilityButton) ---
const UtilityButton: React.FC<{ onClick?: () => void, label: string, children: React.ReactNode, className?: string }> = 
  ({ onClick, label, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      p-2 rounded-full transition-colors duration-300
      hover:bg-black/10 dark:hover:bg-white/10
      
      /* --- CHANGE: Base text color yahan se hata diya hai --- */
      /* text-black dark:text-white */
      
      flex items-center
      ${className} 
    `}
    aria-label={label}
  >
    {children}
  </button>
);

