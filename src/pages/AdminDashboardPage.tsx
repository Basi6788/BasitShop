// Path: /src/pages/AdminDashboardPage.tsx
// 🔷 FINAL OPTIMIZED VERSION: Fixed Auth Headers, Removed Broken Imports, Handled 401 Errors

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

// --- Global Theme State Management ---
type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme') as Theme;
  }
  return 'light'; 
};

// Backend API URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeobackend.netlify.app';

// --- Interfaces ---
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  product_id: string;
}

interface Order {
  id: string;
  _id?: string; // Fallback for some DBs
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
    method_name: string;
    account_number?: string;
    txn_id?: string;
  };
}

const STATUS_OPTIONS: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// --- Components ---

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const statusClasses: Record<Order['status'], string> = {
    Pending: 'bg-yellow-400 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100', 
    Processing: 'bg-blue-400 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
    Shipped: 'bg-cyan-400 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100',
    Delivered: 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-100',
    Cancelled: 'bg-red-400 text-red-900 dark:bg-red-800 dark:text-red-100',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${statusClasses[status] || 'bg-gray-400'}`}>
      {status}
    </span>
  );
};

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
  theme: Theme;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusChange, theme }) => {
  const { shipping_details: shipDetails, payment_info: payInfo } = order;

  // Safe Date Parsing
  let dateStr = 'N/A';
  try {
      if (typeof order.created_at === 'string') dateStr = new Date(order.created_at).toLocaleString();
      else if (order.created_at && (order.created_at as any)._seconds) dateStr = new Date((order.created_at as any)._seconds * 1000).toLocaleString();
  } catch (e) { dateStr = 'Invalid Date'; }

  const items = order.items || [];
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-700/50' : 'bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${bgColor} ${textColor} p-6 rounded-2xl w-full max-w-4xl border border-gray-600 shadow-2xl relative mt-10 mb-10`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 hover:text-red-500 transition">
          <XCircle className="w-7 h-7" />
        </button>

        <div className="border-b border-gray-500/30 pb-4 mb-6">
          <h3 className="text-2xl font-bold flex items-center text-indigo-500">
             Order Details
          </h3>
          <p className="text-sm font-mono opacity-70 mt-1">ID: {order.order_number || order.id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className={`${cardBg} p-4 rounded-xl`}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><User className="w-4 h-4"/> Customer</h4>
                <p><span className={subTextColor}>Name:</span> {order.user_details?.name || 'Guest'}</p>
                <p><span className={subTextColor}>Email:</span> {order.user_details?.email || 'N/A'}</p>
            </div>

            {/* Shipping Info */}
            <div className={`${cardBg} p-4 rounded-xl`}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Shipping</h4>
                <p><span className={subTextColor}>Recipient:</span> {shipDetails?.recipient_name}</p>
                <p><span className={subTextColor}>Addr:</span> {shipDetails?.address}</p>
                <p><span className={subTextColor}>Phone:</span> {shipDetails?.contact}</p>
            </div>

            {/* Payment Info */}
            <div className={`${cardBg} p-4 rounded-xl`}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><Wallet className="w-4 h-4"/> Payment</h4>
                <p><span className={subTextColor}>Method:</span> {payInfo?.method_name}</p>
                <p><span className={subTextColor}>TRX ID:</span> <span className="font-mono bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-1 rounded">{payInfo?.txn_id || 'N/A'}</span></p>
                <p><span className={subTextColor}>Total:</span> <span className="text-green-500 font-bold text-lg">${order.total_amount}</span></p>
            </div>

            {/* Items */}
            <div className={`${cardBg} p-4 rounded-xl`}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> Items</h4>
                <ul className="max-h-32 overflow-y-auto space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm border-b border-gray-500/20 pb-1">
                            <span>{item.name} <span className="text-xs opacity-70">x{item.quantity}</span></span>
                            <span>${item.price * item.quantity}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-500/30 flex justify-end items-center gap-4">
            <span className="font-bold">Update Status:</span>
            <select 
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
                className="p-2 rounded bg-gray-200 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500"
            >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

      </motion.div>
    </div>
  );
};

const NavItem: React.FC<{ icon: any, label: string, isActive: boolean, onClick: () => void, isDark: boolean }> = ({ icon: Icon, label, isActive, onClick, isDark }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition duration-200 border-l-4 
            ${isActive 
                ? (isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'bg-blue-100 text-blue-700 border-blue-500') 
                : 'border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">{label}</span>
        </button>
    )
}

// --- Main Page Component ---

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); 
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // AI & Files State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [newCode, setNewCode] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const aiRef = useRef<HTMLDivElement>(null);
  const ordersRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<Theme>(getInitialTheme); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const navigate = useNavigate();

  // Helper to get headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // --- Fetch Data ---
  const fetchAdminData = useCallback(async (isInitial = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        navigate('/admin/login', { replace: true });
        return;
    }

    if (isInitial) setLoadingInitial(true);
    else setLoadingRefresh(true);
    setError(null);

    try {
        // Parallel Fetching with Auth Token
        const [ordersRes, productsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/admin/orders`, { headers: { 'x-auth-token': token } }),
            fetch(`${BASE_URL}/api/products`) // Public route
        ]);

        if (ordersRes.status === 401) {
            localStorage.clear();
            navigate('/admin/login');
            throw new Error("Session Expired");
        }

        if (!ordersRes.ok) throw new Error("Failed to load orders");
        
        // Handle Vercel HTML Error
        const contentType = ordersRes.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
            throw new Error("Backend Returned HTML (Possible Crash/Deployment Issue)");
        }

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        // Map Orders safely
        const safeOrders: Order[] = (Array.isArray(ordersData) ? ordersData : []).map((o: any) => ({
            id: o._id || o.id,
            order_number: o.order_number || `ORD-${o.id}`,
            total_amount: Number(o.total_amount) || 0,
            status: o.status || 'Pending',
            created_at: o.created_at || new Date().toISOString(),
            user_details: { name: o.user_details?.name || 'Guest', email: o.user_details?.email || 'N/A' },
            items: o.items || [],
            shipping_details: o.shipping_details || {},
            payment_method: o.payment_method || 'COD',
            payment_info: o.payment_info || {}
        }));

        setOrders(safeOrders);
        setProducts(Array.isArray(productsData) ? productsData : []);

    } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
    } finally {
        setLoadingInitial(false);
        setLoadingRefresh(false);
    }
  }, [navigate]);

  useEffect(() => {
      fetchAdminData(true);
      // Removed fileService import, doing direct safe fetch for files
      const fetchFiles = async () => {
         const token = localStorage.getItem('authToken');
         try {
             const res = await fetch(`${BASE_URL}/api/admin/files/list`, { headers: { 'x-auth-token': token || '' } });
             if(res.ok) {
                 const data = await res.json();
                 setFiles(Array.isArray(data) ? data : []);
             }
         } catch(e) { console.log("Files API not ready yet"); }
      };
      fetchFiles();

      const interval = setInterval(() => fetchAdminData(false), 15000);
      return () => clearInterval(interval);
  }, [fetchAdminData]);

  // --- Handlers ---
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      try {
          await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({ status: newStatus })
          });
      } catch (e) { alert("Update Failed"); fetchAdminData(); }
  };

  const handleDeleteOrder = async (orderId: string) => {
      if(!window.confirm("Delete this order?")) return;
      setOrders(prev => prev.filter(o => o.id !== orderId));
      try {
          await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
      } catch (e) { alert("Delete Failed"); fetchAdminData(); }
  };

  // AI Handler
  const handleAI = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!aiQuery) return;
      setLoadingRefresh(true);
      setAiResponse("Processing...");
      
      try {
          // If Image
          if(imageFile) {
              const formData = new FormData();
              formData.append('image', imageFile);
              formData.append('command', aiQuery);
              const res = await fetch(`${BASE_URL}/api/admin/ai-image`, {
                  method: 'POST',
                  headers: { 'x-auth-token': localStorage.getItem('authToken') || '' },
                  body: formData
              });
              const d = await res.json();
              setAiResponse(d.message || "Processed");
          } else {
              // Text Command
              const res = await fetch(`${BASE_URL}/api/admin/ai-command`, {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({ command: aiQuery })
              });
              const d = await res.json();
              setAiResponse(d.result || d.message || "Done");
              if(d.success) fetchAdminData();
          }
      } catch (e: any) {
          setAiResponse("Error: " + e.message);
      } finally {
          setLoadingRefresh(false);
          setImageFile(null);
          setAiQuery("");
      }
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate('/admin/login');
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
      setIsSidebarOpen(false);
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- Render Helpers ---
  const isDark = theme === 'dark';
  const themeClasses = {
      bg: 'bg-gray-50 dark:bg-[#0f111a]',
      text: 'text-gray-900 dark:text-white',
      card: 'bg-white dark:bg-[#1e212b] border border-gray-200 dark:border-gray-700',
      primary: 'bg-blue-600 dark:bg-cyan-600 text-white'
  };

  const stats = [
      { label: 'Revenue', val: `$${orders.reduce((acc, o) => o.status === 'Delivered' ? acc + o.total_amount : acc, 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
      { label: 'Pending', val: orders.filter(o => o.status === 'Pending').length, icon: Package, color: 'text-yellow-500' },
      { label: 'Products', val: products.length, icon: ShoppingCart, color: 'text-blue-500' },
      { label: 'Users', val: new Set(orders.map(o => o.user_details.email)).size, icon: Users, color: 'text-purple-500' }
  ];

  if (loadingInitial) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader className="animate-spin w-10 h-10"/></div>;

  return (
    <div className={`min-h-screen flex ${themeClasses.bg} ${themeClasses.text} font-sans transition-colors duration-300`}>
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 ${themeClasses.card} transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200`}>
            <div className="p-6 border-b border-gray-700/30 flex justify-between items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">Romeo Admin</span>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X/></button>
            </div>
            <nav className="p-4 space-y-2">
                <NavItem icon={LayoutDashboard} label="Dashboard" isActive={true} onClick={() => window.scrollTo(0,0)} isDark={isDark} />
                <NavItem icon={Package} label="Orders" isActive={false} onClick={() => scrollTo(ordersRef)} isDark={isDark} />
                <NavItem icon={Cpu} label="AI Console" isActive={false} onClick={() => scrollTo(aiRef)} isDark={isDark} />
                <NavItem icon={Settings} label="Files" isActive={false} onClick={() => scrollTo(editorRef)} isDark={isDark} />
                <div className="pt-10">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition"><LogOut className="w-5 h-5 mr-3"/> Logout</button>
                </div>
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 transition-all">
            {/* Header */}
            <header className={`sticky top-0 z-40 p-4 ${themeClasses.card} flex justify-between items-center shadow-md`}>
                <div className="flex items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4"><Menu/></button>
                    <h1 className="text-xl font-bold hidden sm:block">Dashboard Overview</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => fetchAdminData(false)} disabled={loadingRefresh} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {loadingRefresh ? <Loader className="animate-spin w-5 h-5"/> : <RefreshCcw className="w-5 h-5"/>}
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {isDark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5"/>}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                </div>
            </header>

            <main className="p-6 space-y-8">
                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl flex items-center"><XCircle className="mr-2"/> {error}</div>}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className={`${themeClasses.card} p-5 rounded-xl shadow-sm hover:shadow-md transition`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                                    <h3 className="text-2xl font-bold mt-1">{s.val}</h3>
                                </div>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Section */}
                <div ref={aiRef} className={`${themeClasses.card} p-6 rounded-xl shadow-lg border-l-4 border-indigo-500`}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Cpu className="text-indigo-500"/> AI Command Center</h2>
                    <form onSubmit={handleAI} className="flex flex-col md:flex-row gap-3">
                        <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 p-3 rounded-xl flex items-center justify-center hover:bg-gray-300 transition">
                            <ImagePlus className="w-5 h-5"/>
                            <input type="file" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)}/>
                        </label>
                        <input 
                            type="text" 
                            value={aiQuery} 
                            onChange={e => setAiQuery(e.target.value)}
                            placeholder={imageFile ? `Image selected: ${imageFile.name}` : "Ask AI to update orders, check stock..."}
                            className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" className={`${themeClasses.primary} px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/50 transition`}>
                            Execute
                        </button>
                    </form>
                    {aiResponse && <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-sm border-l-4 border-green-500">{aiResponse}</div>}
                </div>

                {/* Orders Table */}
                <div ref={ordersRef} className={`${themeClasses.card} rounded-xl shadow-md overflow-hidden`}>
                    <div className="p-6 border-b border-gray-700/30 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Package className="text-blue-500"/> Recent Orders</h2>
                        <span className="text-sm text-gray-500">{orders.length} Records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="p-4 font-mono text-sm">{o.order_number}</td>
                                        <td className="p-4 text-sm font-medium">{o.user_details.name}</td>
                                        <td className="p-4"><StatusBadge status={o.status}/></td>
                                        <td className="p-4 text-green-500 font-bold">${o.total_amount}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => setSelectedOrder(o)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"><Search className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteOrder(o.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* File Editor (Read Only for now) */}
                <div ref={editorRef} className={`${themeClasses.card} p-6 rounded-xl`}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-orange-500"/> System Files</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 overflow-y-auto">
                            {files.length === 0 ? <p className="p-4 text-sm text-gray-500 italic">No files available or API limited.</p> : 
                             files.map((f, i) => (
                                <div key={i} onClick={() => { setSelectedFile(f); setNewCode("// Content loading simulated...\n// Real file editing requires Node fs access."); }} 
                                     className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded text-sm truncate">
                                    {f.name}
                                </div>
                            ))}
                        </div>
                        <div className="md:col-span-2 bg-gray-900 rounded-xl p-4 text-gray-300 font-mono text-sm overflow-auto">
                            {selectedFile ? (
                                <textarea value={newCode} onChange={e => setNewCode(e.target.value)} className="w-full h-full bg-transparent border-none outline-none resize-none"/>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600">Select a file to view</div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
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
  );
}

export default AdminDashboardPage;
