// Path: /src/components/BottomNavigationBar.tsx
// --- FIX: Reverted to full-width bottom bar (like image 1000040225.jpg) ---
// --- FIX: Added 'md:hidden' class to hide on desktop ---
// --- UPDATE: '/account' route changed to '/login' for Login/Register page ---

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  SearchIcon, 
  ShoppingBagIcon, 
  UserCogIcon // Yeh icon Account ke liye use ho raha hai
} from 'lucide-react'; 

// --- Interface for NavItem Props ---
interface NavItemProps {
  to: string;
  Icon: React.ElementType;
  label: string;
}

// --- NavItem Component ---
// (Ismein active state ke liye design update kiya gaya hai)
const NavItem: React.FC<NavItemProps> = ({ to, Icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex flex-col items-center justify-center p-1.5 transition-colors duration-200 
         ${isActive 
            ? 'text-indigo-600 dark:text-cyan-400' // Active color
            : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400' // Inactive color
          }`
      }
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-0.5 font-medium">{label}</span>
    </NavLink>
  );
};

// --- MAIN BOTTOM NAVIGATION BAR COMPONENT ---
const BottomNavigationBar: React.FC = () => {
  return (
    // --- DESIGN CHANGE: Floating pill se wapas full-width bar ---
    <div className="
      fixed bottom-0 left-0 right-0 z-40 
      
      /* --- Glass Effect (jaisa image 1000040225.jpg mein tha) --- */
      bg-white/80 dark:bg-gray-900/80 
      backdrop-blur-md 
      
      border-t border-gray-200 dark:border-gray-700 
      
      /* --- FIX: 'md:hidden' class yahan hai. Yeh desktop par hide karegi --- */
      md:hidden 
    ">
      
      <div className="flex justify-around items-center h-16 max-w-xl mx-auto">
        
        {/* --- Routes ko update kiya gaya hai (Products -> /products) --- */}
        <NavItem to="/" Icon={HomeIcon} label="Home" />
        <NavItem to="/products" Icon={ShoppingBagIcon} label="Shop" />
        <NavItem to="/search" Icon={SearchIcon} label="Search" />
        <NavItem to="/cart" Icon={ShoppingCartIcon} label="Cart" />
        
        {/* --- Yahan /account ki bajaye /login kar diya gaya hai --- */}
        <NavItem to="/login" Icon={UserCogIcon} label="Account" /> 

      </div>
    </div>
  );
};

export default BottomNavigationBar;

