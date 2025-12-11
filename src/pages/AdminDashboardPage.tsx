// Path: /src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Package, ShoppingCart, Users, Loader, Cpu, 
  User, FileText, Send, XCircle, LogOut, Wallet,
  CalendarClock, MapPin, Search, Trash2,
  Phone, MessageSquare, RefreshCcw, LayoutDashboard, Settings, ListPlus, 
  Moon, Sun, ImagePlus, ChevronRight, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileService } from '../utils/fileService';

// --- Global Theme State Management (Using localStorage for persistence) ---
type Theme = 'light' | 'dark';

// Default to 'light' for Barbershop style
const getInitialTheme = (): Theme => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as Theme;
  }
  return 'light'; 
};

// Backend API URL — make sure your backend env matches this
// 💡 FIX: BASE_URL ko aapke latest backend deployment ke hisaab se set kiya gaya hai.
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app'; 

// --- Interfaces based on backend data (No change) ---
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  product_id: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string | { _seconds: number, _nanoseconds: number }; 
  user_details: { name: string; email: string; };
  items: OrderItem[];
  shipping_details: {
    address: string;
    contact: string;
    whatsapp?: string;
    note?: string;
    recipient_name: string;
  };
  payment_method: string;
  payment_info: {
    method_name: 'JazzCash' | 'SadaPay' | 'EasyPaisa' | 'COD' | string;
    account_number?: string;
    txn_id?: string;
  };
}

const STATUS_OPTIONS: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// Utility component: StatusBadge 
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const statusClasses: Record<Order['status'], string> = {
    Pending: 'bg-yellow-400 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100', 
    Processing: 'bg-blue-400 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
    Shipped: 'bg-cyan-400 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100',
    Delivered: 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-100',
    Cancelled: 'bg-red-400 text-red-900 dark:bg-red-800 dark:text-red-100',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

// OrderDetailsModal component (Theme Fixed)
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  theme: Theme;
}
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusChange, theme }) => {
  const { shipping_details: shipDetails, payment_info: payInfo } = order;

  const date = (typeof order.created_at === 'string')
    ? new Date(order.created_at).toLocaleString()
    : (order.created_at && (order.created_at as any)._seconds
      ? new Date((order.created_at as any)._seconds * 1000).toLocaleString()
      : 'N/A');

  const items = order.items || [];
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-700/50' : 'bg-gray-100';
  const headerColor = isDark ? 'text-cyan-400' : 'text-blue-600'; 
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const highlightColor = isDark ? 'text-cyan-500' : 'text-blue-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className={`${bgColor} ${textColor} p-6 rounded-2xl w-full max-w-4xl border ${borderColor} shadow-2xl relative`}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 ${subTextColor} hover:${headerColor} transition`}>
          <XCircle className="w-7 h-7" />
        </button>

        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-4 mb-6`}>
          <h3 className={`text-3xl font-extrabold ${headerColor} flex items-center`}>
            <FileText className={`w-7 h-7 mr-3 ${highlightColor}`} /> Order Details
          </h3>
          <p className={`${subTextColor} ml-10 text-sm`}>
            Order ID: <span className={`${highlightColor} font-mono`}>{order.id}</span>
          </p>
          {order.order_number && (
            <p className={`${subTextColor} ml-10 text-sm`}>
              Order Number: <span className={`${highlightColor} font-mono`}>{order.order_number}</span>
            </p>
          )}
        </div>

        <div className="space-y-6 text-sm max-h-[75vh] overflow-y-auto pr-3 -mr-3">
          {/* Summary Section */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${cardBg} p-4 rounded-xl border ${borderColor}`}>
            <div>
              <h4 className={`font-semibold ${subTextColor} mb-1 text-xs uppercase tracking-wider flex items-center`}>
                <CalendarClock className="w-4 h-4 mr-1.5 text-yellow-500" /> Order Placed
              </h4>
              <p className={textColor}>{date}</p>
            </div>
            <div>
              <h4 className={`font-semibold ${subTextColor} mb-1 text-xs uppercase tracking-wider`}>Current Status</h4>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <h4 className={`font-semibold ${subTextColor} mb-1 text-xs uppercase tracking-wider`}>Grand Total</h4>
              <p className="text-3xl font-extrabold text-green-500">
                ${((order.total_amount || 0)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className={`${cardBg} p-5 rounded-xl border ${borderColor} hover:border-indigo-500 transition-all duration-300`}>
                <h4 className={`font-bold text-indigo-500 flex items-center mb-3 text-lg`}>
                  <User className="w-5 h-5 mr-2" /> Registered User Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className={`${subTextColor} w-20 inline-block`}>Name:</span> <span className={`${textColor} font-medium`}>{order.user_details.name}</span></p>
                  <p><span className={`${subTextColor} w-20 inline-block`}>Email:</span> <span className={textColor}>{order.user_details.email}</span></p>
                </div>
              </div>

              <div className={`${cardBg} p-5 rounded-xl border ${borderColor} hover:border-indigo-500 transition-all duration-300`}>
                <h4 className={`font-bold text-indigo-500 flex items-center mb-3 text-lg`}>
                  <MapPin className="w-5 h-5 mr-2" /> Shipping Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-20 inline-block`}>Recipient:</span>
                    <span className={`${textColor} font-medium`}>{shipDetails.recipient_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-20 inline-block`}>Contact:</span>
                    <span className={highlightColor+' font-medium'}>{shipDetails.contact || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-20 inline-block`}>Whatsapp:</span>
                    <span className={highlightColor}>{shipDetails.whatsapp || 'N/A'}</span>
                  </p>
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-20 inline-block align-top`}>Address:</span>
                    <span className={`${textColor} break-words inline-block w-[calc(100%-6rem)]`}>{shipDetails.address || 'N/A'}</span>
                  </p>
                  <p className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-20 inline-block`}>Note:</span>
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'} italic`}>{shipDetails.note || 'None'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className={`${cardBg} p-5 rounded-xl border ${borderColor} hover:border-green-500 transition-all duration-300`}>
                <h4 className="font-bold text-green-500 flex items-center mb-3 text-lg">
                  <Wallet className="w-5 h-5 mr-2" /> Payment Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Wallet className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-24 inline-block`}>Method:</span>
                    <span className={`font-medium ${textColor}`}>{payInfo.method_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-24 inline-block`}>Txn ID:</span>
                    <span className={`${highlightColor} break-all`}>{payInfo.txn_id || 'Not Provided'}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className={`${subTextColor} w-24 inline-block`}>Account No:</span>
                    <span className={textColor}>{payInfo.account_number || 'N/A'}</span>
                  </p>
                  <p className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-500 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 text-xs rounded-lg shadow-inner">
                    Admin Note: Verify Payment First!
                  </p>
                </div>
              </div>

              <div className={`${cardBg} p-5 rounded-xl border ${borderColor}`}>
                <h4 className={`font-bold ${headerColor} flex items-center mb-3 text-lg`}>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Ordered Items ({items.length})
                </h4>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {items.length > 0 ? items.map((item, index) => (
                    <li key={index} className={`flex justify-between items-center text-sm p-2 rounded-md border-l-4 ${isDark ? 'border-cyan-500/50 bg-gray-600/60 text-gray-300' : 'border-blue-500/50 bg-gray-200/60 text-gray-700'}`}>
                      <div>
                        <span className={`font-medium ${textColor}`}>{item.name || 'Unknown Product'}</span>
                        <span className={subTextColor}> (x{item.quantity || 1})</span>
                      </div>
                      <span className='text-green-500 font-medium'>
                        ${( (item.price || 0) * (item.quantity || 1) ).toFixed(2)}
                      </span>
                    </li>
                  )) : (
                    <li className={`${subTextColor} text-sm italic p-2`}>No items in this order.</li>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>

        <div className={`pt-5 flex justify-end border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} mt-6`}>
          <label className="flex items-center gap-3">
            <span className={`${subTextColor} font-medium`}>Update Status:</span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
              className={`${inputBg} rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </motion.div>
    </div>
  );
};

// --- Sidebar Navigation Component ---
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDarkTheme: boolean;
}
const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, isDarkTheme }) => {
  // Light Mode (Barbershop style)
  const activeLightClasses = 'bg-blue-100 text-blue-700 border-blue-500';
  const inactiveLightClasses = 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 border-transparent';
  
  // Dark Mode (Affiliate style)
  const activeDarkClasses = 'dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500';
  const inactiveDarkClasses = 'dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white dark:border-transparent';

  const baseClasses = 'flex items-center w-full px-4 py-3 rounded-xl transition duration-200 border-l-4';
  
  const currentActiveClasses = isActive 
    ? (isDarkTheme ? activeDarkClasses : activeLightClasses) 
    : (isDarkTheme ? inactiveDarkClasses : inactiveLightClasses);

  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900';

  const iconColor = isActive 
    ? (isDarkTheme ? 'text-cyan-400' : 'text-blue-700') 
    : (isDarkTheme ? 'text-gray-500' : 'text-gray-600');

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${currentActiveClasses} ${textColor} ${isActive ? '' : 'hover:text-gray-900 dark:hover:text-white'}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${iconColor}`} />
      <span className="font-medium text-sm">{label}</span>
      {isActive && <ChevronRight className={`w-4 h-4 ml-auto ${iconColor}`} />}
    </button>
  );
};

// Main AdminDashboardPage component
export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); 
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [newCode, setNewCode] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Ref for scrolling to sections
  const aiRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Theme State
  const [theme, setTheme] = useState<Theme>(getInitialTheme); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');

  // --- Theme Classes (Light Mode Default, Dark Mode with 'dark:' prefix) ---
  const isDark = theme === 'dark';
  const themeClasses = {
    // Light Mode (Barbershop Style) / Dark Mode (Affiliate Style)
    bg: 'bg-gray-50 dark:bg-[#151723]', 
    text: 'text-gray-900 dark:text-white',
    subText: 'text-gray-600 dark:text-gray-400',
    sidebarBg: 'bg-white dark:bg-[#1e202e]',
    headerBg: 'bg-white dark:bg-[#1e202e]',
    cardBg: 'bg-white dark:bg-[#1e202e]',
    cardBorder: 'border-gray-200 dark:border-gray-700',
    inputBg: 'bg-gray-100 border-gray-300 dark:bg-gray-700/50 dark:border-gray-600',
    tableHeaderBg: 'bg-gray-100 dark:bg-gray-700',
    tableRowHover: 'hover:bg-gray-100/70 dark:hover:bg-gray-700/70',
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500', 
    primaryText: 'text-blue-600 dark:text-cyan-600',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
    warning: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-500', // Adjusted light mode warning color for better visibility
    
    // Metric Card Colors 
    metricBg1: 'bg-white dark:bg-green-600',
    metricBg2: 'bg-white dark:bg-indigo-600',
    metricBg3: 'bg-white dark:bg-orange-600',
    metricBg4: 'bg-white dark:bg-pink-600',
  };
  
  // Apply theme to document body
  useEffect(() => {
    // This is the crucial step to ensure dark mode class is applied to the root element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  // --- END UI THEME CLASSES ---


  // --- Data Fetching & CRUD (Critical Fix Applied Here) ---
  const fetchAdminData = useCallback(async (isInitial = false) => {
    setError(null);
    if (!authToken) {
      navigate('/admin/login', { replace: true });
      if (isInitial) setLoadingInitial(false);
      return;
    }

    if (isInitial) setLoadingInitial(true);
    else setLoadingRefresh(true);

    try {
      const ordersUrl = `${BASE_URL}/api/admin/orders`; 
      const productsUrl = `${BASE_URL}/api/products`;
      
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(ordersUrl, { headers: { 'x-auth-token': authToken } }),
        fetch(productsUrl)
      ]);

      // 💡 CRITICAL FIX 1: If 401 or 403, clear token and redirect IMMEDIATELY.
      if (ordersResponse.status === 401 || ordersResponse.status === 403) {
        // Token invalid, expired, or forbidden role.
        localStorage.removeItem('authToken'); 
        // Throwing error with a custom code to catch below and show specific message
        throw new Error("SESSION_EXPIRED_OR_UNAUTHORIZED"); 
      }
      
      if (!ordersResponse.ok) {
         throw new Error(`Failed to fetch orders. Status: ${ordersResponse.status} from URL: ${ordersUrl}`);
      }
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products. Status: ${productsResponse.status}`);
      }
      
      const ordersText = await ordersResponse.text();
      // 💡 CRITICAL FIX 2: Check for unexpected response formats (e.g., Vercel/Netlify error page)
      if (!ordersText.trim() || ordersText.trim().startsWith('<')) {
        // Agar response empty ho ya HTML error page ho (Cold Start ya Deployment ghalti)
        throw new Error("NETWORK_OR_SERVER_DOWN: Backend is likely restarting or not deployed correctly.");
      }
      
      // 💡 FIX 3: Original code mein is tarah tha: 
      // if (ordersResponse.status === 401) { throw new Error("Session expired. Token invalid. Please login again."); }
      // Humne isko CRITICAL FIX 1 mein theek kar diya hai.
      
      const parsedOrders = JSON.parse(ordersText) as any[];
      const productsData = await productsResponse.json();

      const safeOrders: Order[] = parsedOrders.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount ?? 0,
        status: o.status,
        created_at: o.created_at
          ? (typeof o.created_at === 'string' ? o.created_at : o.created_at) 
          : new Date().toISOString(),
        user_details: {
          name: o.user_details?.name ?? 'Unknown',
          email: o.user_details?.email ?? 'Unknown'
        },
        items: Array.isArray(o.items) ? o.items.map((i: any) => ({
          name: i.name ?? 'Unknown Product',
          quantity: i.quantity ?? 1,
          price: i.price ?? 0,
          product_id: i.product_id ?? ''
        })) : [],
        shipping_details: {
          address: o.shipping_details?.address ?? 'N/A',
          contact: o.shipping_details?.contact ?? 'N/A',
          whatsapp: o.shipping_details?.whatsapp,
          note: o.shipping_details?.note,
          recipient_name: o.shipping_details?.recipient_name ?? 'N/A'
        },
        payment_method: o.payment_method ?? 'N/A',
        payment_info: {
          method_name: o.payment_info?.method_name ?? 'N/A',
          account_number: o.payment_info?.account_number,
          txn_id: o.payment_info?.txn_id
        }
      }));

      setOrders(safeOrders);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown network error.';
      
      // 💡 CRITICAL FIX 4: Catch the specific session error and show custom message.
      if (errorMsg === "SESSION_EXPIRED_OR_UNAUTHORIZED") {
          setError("❌ Session expired. Please log in again to access the dashboard.");
          // Session expire hone par dobara login page par bhej dein
          navigate('/admin/login', { replace: true }); 
          return;
      }
      // 💡 CRITICAL FIX 5: Improve Firebase/DB check message for network issues
      if (errorMsg.includes("NETWORK_OR_SERVER_DOWN") || errorMsg.includes("Failed to fetch")) {
          setError(`❌ Network Error. Iska matlab hai Backend Down hai ya URL ghalat hai: ${BASE_URL}`);
      } else {
          setError(errorMsg);
      }
    } finally {
      if (isInitial) setLoadingInitial(false);
      else setLoadingRefresh(false);
    }
  }, [authToken, navigate]);

  useEffect(() => {
    fetchAdminData(true);
    const intervalId = setInterval(() => fetchAdminData(false), 10000);
    return () => clearInterval(intervalId);
  }, [fetchAdminData]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!authToken) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o ));
    try {
      const resp = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': authToken },
        body: JSON.stringify({ status: newStatus })
      });
      if (!resp.ok) {
        throw new Error('Failed to update status on server.');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Network error during status update or server failed! Reverting data.');
      fetchAdminData(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!authToken) return;
    if (!window.confirm(`Are you sure you want to delete Order ID ${orderId}?`)) {
      return;
    }
    setOrders(prev => prev.filter(o => o.id !== orderId)); 
    try {
      const resp = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': authToken }
      });
      if (!resp.ok) {
        throw new Error('Failed to delete order on server.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error during delete! Reverting data.');
      fetchAdminData(false); 
    }
  };

  // --- AI Logic (Unchanged) ---
  const handleAIChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiResponse('...Processing Command...');
    setLoadingRefresh(true);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/ai-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken ?? ''
        },
        body: JSON.stringify({ command: aiQuery.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        const serverMessage = result.message || `Server responded with status code ${response.status}.`;
        if (response.status === 401 || response.status === 403) {
           setAiResponse(`🚨 Error ${response.status}: Login/Admin access required. Please log in again.`);
        } else if (response.status === 503) {
           setAiResponse(`🧠 Error 503: AI Service Unavailable. Backend message: ${serverMessage}.`);
        } else {
           setAiResponse(`❌ Error ${response.status}: Command failed. Backend message: ${serverMessage}`);
        }
        throw new Error(serverMessage);
      }

      if (result.success) {
        setAiResponse(`✅ Success: ${result.result || result.message || 'Command executed.'}`);
        setAiQuery('');
        fetchAdminData();
      } else {
        setAiResponse(`⚠️ Warning: ${result.message || 'Command failed (Success status was false).'}`);
      }
    } catch (err) {
      const networkError = err instanceof Error ? err.message : 'Unknown Network Error';
      setAiResponse(`🔴 FATAL NETWORK ERROR: Server connection failed. Error: ${networkError}.`);
    } finally {
      setLoadingRefresh(false);
    }
  };

  const handleAnalyze = async () => {
    setAiResponse('🧠 Requesting frontend analysis...');
    setLoadingRefresh(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/analyze-frontend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': authToken || '' },
        body: JSON.stringify({ target: 'frontend-project', details: 'Analyze routes/files and suggest improvements' })
      });
      const data = await res.json();
      if (!res.ok) {
        setAiResponse(`❌ Analyze failed: ${data.message || res.status}`);
        return;
      }
      if (data.analysis) setAiResponse(String(data.analysis).trim());
      else setAiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Analyze failed:', err);
      setAiResponse(`🔴 Analyze network error: ${err.message || err}`);
    } finally {
      setLoadingRefresh(false);
    }
  };

  const loadFiles = async () => {
    try {
      const res = await fileService.listFiles();
      setFiles(res || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const openFile = async (path: string) => {
    try {
      const file = await fileService.getFile(path);
      setSelectedFile(file);
      setNewCode(file.content || '');
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const saveFile = async () => {
    if (!selectedFile) return alert('No file selected.');
    try {
      await fileService.updateFile(selectedFile.path, newCode);
      alert('✅ File updated successfully!');
      loadFiles();
    } catch (err) {
      console.error('Failed to save file:', err);
      alert('Failed to save file.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageCommand = async () => {
    if (!authToken) return alert('Not authorized.');
    if (!imageFile) return alert('Please choose an image first.');
    if (!aiQuery) return alert('Please enter a command (e.g., "Add this image to product X").');

    setAiResponse('🧠 Uploading image and sending to AI...');
    setLoadingRefresh(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile); 
      formData.append('command', aiQuery);

      const res = await fetch(`${BASE_URL}/api/admin/ai-image`, {
        method: 'POST',
        headers: { 'x-auth-token': authToken || '' },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setAiResponse(`❌ Error ${res.status}: ${data.message || 'Upload failed.'}`);
      } else {
        setAiResponse(`✅ ${data.message || 'AI processed image successfully.'}\n${data.result ? String(data.result).slice(0,200) : ''}`);
        loadFiles();
        fetchAdminData(false);
      }
    } catch (err:any) {
      console.error('AI image upload failed:', err);
      setAiResponse(`🔴 Network Error: ${err.message || err}`);
    } finally {
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);
  // --- END Data Fetching & CRUD ---

  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const totalProducts = products.length;
  const totalUsers = new Set(orders.map(o => o.user_details.email).filter(email => !!email)).size;

  const showFullPageLoader = loadingInitial && orders.length === 0 && !error;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login', { replace: true });
  };
  
  // Custom scroll handler for NavItems
  const scrollToSection = (key: string) => {
      let ref;
      if (key === 'ai') ref = aiRef;
      else if (key === 'orders') ref = ordersRef;
      else if (key === 'editor') ref = editorRef;
      else return; 
      
      setIsSidebarOpen(false); 

      if (ref && ref.current) {
          // Add a small offset to account for the sticky header
          const yOffset = -80; 
          const y = ref.current.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  };


  if (showFullPageLoader) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg} ${themeClasses.text}`}>
        <Loader className="w-12 h-12 animate-spin text-blue-500 dark:text-cyan-500" />
        <p className="ml-4 text-xl">Loading Admin Data...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${themeClasses.bg} ${themeClasses.text} p-6`}>
        <XCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-red-500">DATA LOAD FAILED</h1>
        {/* 💡 FIX 6: Error message ko theek kiya aur Firebase/DB check ka message shamil kiya */}
        <p className={`text-lg ${themeClasses.subText} mt-2 p-3 ${themeClasses.cardBg} rounded text-center max-w-lg border border-red-500/50 shadow-xl`}>
            {error}
            <br />
            {/* Ab yeh message sirf ek hint hai, asal error upar dikh raha hai */}
            <span className='text-sm text-yellow-500'>Agar error Network/Backend se mutaliq hai, toh *Backend URL aur DB Connection* zarur check karein.</span>
        </p>
        <button onClick={() => { setLoadingInitial(true); fetchAdminData(true); }} className={`mt-6 ${isDark ? themeClasses.primary : 'bg-blue-600 hover:bg-blue-700'} p-3 px-6 rounded-xl transition shadow-lg text-white`}>Try Again</button>
        <button onClick={handleLogout} className={`mt-4 bg-gray-500 hover:bg-gray-600 p-3 px-6 rounded-xl transition text-white`}>Logout</button>
      </div>
    );
  }

  // Common button styling for icon-only buttons
  const iconButtonClasses = `p-3 rounded-xl transition duration-300 flex items-center justify-center`;
  
  // Navigation items for the sidebar (Admin Panel is main page)
  const navItems = [
      { icon: LayoutDashboard, label: "Admin Dashboard", key: "dashboard", onClick: () => scrollToSection('dashboard-start') }, // Scroll to the very top
      { icon: Package, label: "Orders Queue", key: "orders", onClick: () => scrollToSection('orders') },
      { icon: ListPlus, label: "Manage Products", key: "products", onClick: () => navigate('/admin/products') },
      { icon: Settings, label: "Files/Code Editor", key: "editor", onClick: () => scrollToSection('editor') },
      { icon: Cpu, label: "AI Console", key: "ai", onClick: () => scrollToSection('ai') },
  ];

  return (
    <div className={`min-h-screen flex ${themeClasses.bg} ${themeClasses.text} font-sans`}>
      
      {/* --- Sidebar (Desktop/Tablet) --- */}
      <div className={`hidden md:block w-64 ${themeClasses.sidebarBg} border-r ${themeClasses.cardBorder} p-5 sticky top-0 h-screen transition-all duration-300`}>
          <div className={`flex items-center mb-10 pb-4 border-b ${themeClasses.cardBorder}`}>
              <span className={`text-3xl font-extrabold ${themeClasses.primaryText} `}>AP</span>
              <span className={`text-xl font-semibold ml-2 ${themeClasses.text}`}>Admin Panel</span>
          </div>

          <nav className="space-y-2">
              {navItems.map(item => (
                  <NavItem
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      isActive={item.key === 'dashboard'} // Keeping dashboard as active for this page
                      onClick={item.onClick} 
                      isDarkTheme={isDark}
                  />
              ))}
          </nav>

          <div className="mt-auto absolute bottom-5 left-5 right-5">
              <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 border-l-4 border-transparent hover:bg-red-100 dark:hover:bg-red-600/20 text-red-500 dark:text-red-400`}
              >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="font-medium text-sm">Log Out</span>
              </button>
          </div>
      </div>
      
      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
          {isSidebarOpen && (
              <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className={`fixed inset-y-0 left-0 w-64 z-50 md:hidden ${themeClasses.sidebarBg} p-5 border-r ${themeClasses.cardBorder}`}
              >
                  <div className={`flex justify-between items-center mb-10 pb-4 border-b ${themeClasses.cardBorder}`}>
                      <span className={`text-3xl font-extrabold ${themeClasses.primaryText}`}>AP</span>
                      <button onClick={() => setIsSidebarOpen(false)} className={`${themeClasses.text} p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50`}>
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <nav className="space-y-2">
                      {navItems.map(item => (
                          <NavItem
                              key={item.key}
                              icon={item.icon}
                              label={item.label}
                              isActive={item.key === 'dashboard'}
                              onClick={() => { item.onClick(); setIsSidebarOpen(false); }}
                              isDarkTheme={isDark}
                          />
                      ))}
                  </nav>
                  <div className="mt-10">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 border-l-4 border-transparent hover:bg-red-100 dark:hover:bg-red-600/20 text-red-500 dark:text-red-400`}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium text-sm">Log Out</span>
                    </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
      
      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-x-hidden">

        {/* --- Top Header / Search Bar (FIXED POSITION) --- */}
        <header className={`sticky top-0 z-40 p-4 md:p-6 flex justify-between items-center ${themeClasses.headerBg} border-b ${themeClasses.cardBorder} shadow-lg shadow-black/10`}>
            
            {/* Mobile Menu & Dashboard Title */}
            <div className='flex items-center'>
                <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-lg ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-700/50 mr-3`}>
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className={`text-xl md:text-2xl font-bold ${themeClasses.text}`}>Admin Dashboard</h1>
            </div>
            
            {/* Search and User Profile */}
            <div className="flex items-center space-x-4">
                <div className={`relative hidden sm:block w-64`}>
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.subText}`} />
                    <input
                        type="text"
                        placeholder="Search Dashboard..."
                        className={`w-full p-2 pl-10 rounded-xl text-sm ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-cyan-500 transition`}
                    />
                </div>
                
                {/* Icon Buttons (Theme Toggle & Refresh) */}
                <div className="flex space-x-2">
                    {/* Dark/Light Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`${iconButtonClasses} ${themeClasses.cardBg} ${themeClasses.text} shadow-md border ${themeClasses.cardBorder}`}
                        title={isDark ? "Light Mode" : "Dark Mode"}
                    >
                        {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchAdminData(false)}
                        disabled={loadingRefresh}
                        className={`${iconButtonClasses} bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white ${loadingRefresh ? 'opacity-50 cursor-not-allowed' : ''} shadow-md`}
                        title="Refresh Data"
                    >
                        {loadingRefresh ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                    </button>
                </div>
                
                {/* User Info (Desktop only - Barbershop Style) */}
                <div className={`hidden lg:flex items-center space-x-2 border-l ${themeClasses.cardBorder} pl-4`}>
                    <div className={`w-10 h-10 rounded-full bg-blue-100 dark:bg-indigo-500 flex items-center justify-center text-blue-600 dark:text-white font-bold text-sm`}>A</div>
                    <div className='text-right'>
                        <p className={`text-sm font-semibold ${themeClasses.text}`}>Admin User</p>
                        <p className={`text-xs ${themeClasses.subText}`}>admin@example.com</p>
                    </div>
                </div>
            </div>
        </header>

        {/* --- Main Dashboard Content (Reference for scrolling) --- */}
        <main className="p-4 md:p-6 lg:p-8 space-y-8" id="dashboard-start">

          {/* KEY METRICS (Light Mode: Clean Cards, Dark Mode: Colored Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, subtext: 'Delivered Total', color: 'text-green-500', iconBg: 'bg-green-100 dark:bg-black/20', darkBg: themeClasses.metricBg1 },
              { title: 'New Orders', value: pendingOrdersCount, icon: Package, subtext: 'Pending / Processing', color: 'text-indigo-500', iconBg: 'bg-indigo-100 dark:bg-black/20', darkBg: themeClasses.metricBg2 },
              { title: 'Total Products', value: totalProducts, icon: ShoppingCart, subtext: 'Items in Stock', color: 'text-orange-500', iconBg: 'bg-orange-100 dark:bg-black/20', darkBg: themeClasses.metricBg3 },
              { title: 'Total Users', value: totalUsers, icon: Users, subtext: 'Unique Customers', color: 'text-pink-500', iconBg: 'bg-pink-100 dark:bg-black/20', darkBg: themeClasses.metricBg4 },
            ].map((metric, index) => (
              <motion.div
                key={index}
                // Light Mode: Clean White Card, Dark Mode: Colored Card
                className={`p-5 rounded-xl ${isDark ? metric.darkBg : themeClasses.cardBg} shadow-lg ${themeClasses.cardBorder} border transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center">
                    <p className={`text-sm font-medium ${isDark ? 'text-white/80' : themeClasses.subText}`}>{metric.title}</p>
                    <div className={`p-2 rounded-full ${metric.iconBg}`}>
                        <metric.icon className={`w-6 h-6 ${isDark ? 'text-white' : metric.color}`} />
                    </div>
                </div>
                <p className={`text-3xl font-extrabold mt-2 ${isDark ? 'text-white' : metric.color}`}>{metric.value}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/70' : themeClasses.subText}`}>{metric.subtext}</p>
              </motion.div>
            ))}
          </div>
          
          <hr className={`border-t ${themeClasses.cardBorder}`} />

          {/* AI COMMAND INTERFACE (Increased Height/Width & Image Preview) */}
          <div ref={aiRef} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.cardBorder} shadow-xl`}>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-5 flex items-center`}>
              <Cpu className={`w-6 h-6 mr-3 ${themeClasses.primaryText}`} />
              AI Command & Image Assistant
            </h3>

            {/* AI Console Input Area (Increased Height/Width) */}
            <form onSubmit={handleAIChatSubmit}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4 items-stretch">
                
                {/* Image Upload Button (With File Name Preview) */}
                <div className="flex-none w-full sm:w-auto">
                    <input
                        id="aiImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={`hidden`} 
                    />
                    <label 
                        htmlFor="aiImageInput" 
                        // Barbershop style yellow button
                        className={`cursor-pointer ${themeClasses.warning} font-semibold p-3 rounded-xl flex items-center gap-2 text-sm shadow-lg w-full justify-center`}
                    >
                        <ImagePlus className="w-5 h-5 text-yellow-900 dark:text-white" />
                        {imageFile ? imageFile.name.substring(0, 20) + (imageFile.name.length > 20 ? '...' : '') : 'Select Image'}
                    </label>
                </div>
                
                {/* Command Input Field */}
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={imageFile ? "Image-related command or general query..." : "AI Command type karein (e.g., 'Order 10 ko Delivered...')" }
                  className={`flex-grow p-4 rounded-xl text-base shadow-inner ${themeClasses.inputBg} ${themeClasses.text} placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500`}
                  style={{ minHeight: '120px', resize: 'vertical' }} // Increased height
                />
                
                {/* Execute Button */}
                <button
                    type="submit"
                    disabled={loadingRefresh}
                    onClick={imageFile ? handleImageCommand : handleAIChatSubmit}
                    className={`${themeClasses.primary} text-white p-4 rounded-xl flex justify-center items-center font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed gap-2 px-6 shadow-lg w-full sm:w-auto`}
                >
                  {loadingRefresh && aiResponse && aiResponse.includes('Processing') ? <Loader className="w-5 h-5 animate-spin" /> : <Send className='w-5 h-5' />}
                  Execute AI
                </button>
              </div>
            </form>
            
            <div className='flex gap-4 mt-3'>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className={`bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition font-medium text-sm px-4 shadow-lg`}
                >
                  Analyze Frontend
                </button>
                <button
                  type="button"
                  onClick={() => { setAiQuery(''); setAiResponse(null); setImageFile(null); }}
                  className={`bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-xl transition font-medium text-sm px-4`}
                >
                  Clear Console
                </button>
            </div>

            {aiResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 p-4 text-sm rounded-xl border ${
                  aiResponse.includes('Error') || aiResponse.includes('FATAL') || aiResponse.includes('❌')
                    ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300'
                    : 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300'
                }`}
              >
                <pre className="whitespace-pre-wrap font-mono min-h-[120px]">{aiResponse}</pre> 
              </motion.div>
            )}
          </div>
          
          {/* ORDERS MANAGEMENT TABLE */}
          <div ref={ordersRef} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.cardBorder} shadow-xl`}>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-5 flex items-center`}>
              <Package className={`w-6 h-6 mr-3 ${themeClasses.primaryText}`} />
              Recent Orders Queue ({orders.length} Total)
            </h3>

            {loadingRefresh && (
              <div className={`py-3 flex justify-center items-center gap-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-t-lg border-b border-indigo-500`}>
                <Loader className="w-5 h-5 animate-spin text-indigo-500" />
                <span className={themeClasses.subText}>Refreshing data...</span>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-500/20 shadow-inner">
              <table className="min-w-full">
                <thead>
                  <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${themeClasses.subText} ${themeClasses.tableHeaderBg}`}>
                    <th className="p-4 w-[15%]">Order ID</th>
                    <th className="p-4 w-[25%]">Customer</th>
                    <th className="p-4 w-[15%]">Total</th>
                    <th className="p-4 w-[15%]">Status</th>
                    <th className="p-4 w-[15%] text-center">Details</th>
                    <th className="p-4 w-[15%] text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.cardBorder}`}>
                  {orders.length > 0 ? orders.map(order => (
                    <tr key={order.id} className={themeClasses.tableRowHover}>
                      <td className={`p-4 text-sm font-medium ${themeClasses.text} font-mono`}>
                          {order.order_number || order.id.substring(0, 8)}...
                      </td>
                      <td className={`p-4 text-sm`}><p className={`font-semibold ${themeClasses.text}`}>{order.user_details.name || 'N/A'}</p></td>
                      <td className="p-4 text-sm font-bold text-green-500">${(order.total_amount || 0).toFixed(2)}</td>
                      <td className="p-4"><StatusBadge status={order.status} /></td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className='bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600 transition text-sm font-bold shadow-md'
                          title="View Details"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition text-sm font-bold shadow-md'
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className={`py-10 text-center ${themeClasses.subText}`}>
                        <p className='text-lg font-semibold'>No orders yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {selectedOrder && (
                <OrderDetailsModal
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onStatusChange={handleStatusUpdate}
                  theme={theme}
                />
              )}
            </AnimatePresence>

          </div>
          
          {/* FILE EXPLORER (Code Editor) */}
          <div ref={editorRef} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.cardBorder} shadow-xl`}>
            <h2 className={`text-2xl font-bold mb-5 ${themeClasses.text} flex items-center`}>
              <FileText className={`w-6 h-6 mr-3 ${themeClasses.primaryText}`} />
              Frontend Files (Code Editor)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File List */}
              <div className={`space-y-2 max-h-96 overflow-y-auto p-3 rounded-xl border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-700/30 lg:col-span-1`}>
                <h4 className={`text-lg font-semibold mb-2 ${themeClasses.text}`}>Project Files</h4>
                {files.length === 0 && (
                    <p className={`${themeClasses.subText} italic p-3`}>No files loaded.</p>
                )}
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    onClick={() => openFile(f.path)}
                    className={`cursor-pointer p-2 rounded text-sm transition-all duration-150 border-l-4 ${selectedFile && selectedFile.path === f.path 
                        ? 'bg-blue-100 border-blue-500 font-semibold text-blue-700 dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-400' 
                        : 'text-gray-700 hover:bg-gray-200/50 border-transparent dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
                  >
                    {f.name}
                  </div>
                ))}
              </div>

              {/* Code Editor */}
              {selectedFile && (
                <div className="space-y-4 lg:col-span-2">
                  <h3 className={`font-bold text-xl ${themeClasses.text} truncate`}>{selectedFile.name}</h3>
                  <textarea
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    rows={15}
                    // Dark background for code editor in both themes for better contrast
                    className={`w-full h-auto min-h-[400px] rounded p-4 text-sm font-mono shadow-inner resize-y bg-gray-900 border border-blue-500/50 text-yellow-100 dark:border-cyan-700/50 dark:text-yellow-300`} 
                  />
                  <button
                    onClick={saveFile}
                    className={`bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300`}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

        </main>
        
        {/* Spacer for mobile bottom */}
        <div className='h-4 md:h-8'></div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
