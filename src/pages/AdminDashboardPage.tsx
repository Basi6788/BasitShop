// Path: /src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Package, ShoppingCart, Users, Loader, BrainCircuit,
  User, FileText, ArrowRight, XCircle, LogOut, Wallet,
  CalendarClock, Navigation, FileSearch, Settings, Inbox, Search, X, Trash2,
  Phone, MessageSquare, MapPin, Hash, UserCheck, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileService } from '../utils/fileService';

// Backend API URL — make sure your backend env matches this
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app';

// --- Interfaces based on backend data ---
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
  created_at: string | { _seconds: number, _nanoseconds: number }; // Firestore style
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

// Neon border CSS component
const NeonStyle: React.FC = () => (
  <style>{`
    @keyframes rotateNeon { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .neon-card { position: relative; overflow: hidden; z-index: 1; }
    .neon-card::before {
      content: ''; position: absolute; width: 150%; height: 150%;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: conic-gradient(
        from 0deg,
        rgba(139, 92, 246, 0.7),
        rgba(59, 130, 246, 0.7),
        rgba(139, 92, 246, 0.7),
        transparent 30%,
        transparent 70%
      );
      z-index: -1;
      animation: rotateNeon 6s linear infinite;
    }
  `}</style>
);

// Utility component: StatusBadge
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const statusClasses: Record<Order['status'], string> = {
    Pending: 'bg-yellow-500 text-black',
    Processing: 'bg-blue-500 text-white',
    Shipped: 'bg-cyan-500 text-black',
    Delivered: 'bg-green-500 text-black',
    Cancelled: 'bg-red-500 text-white',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

// OrderDetailsModal component
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusChange }) => {
  const { shipping_details: shipDetails, payment_info: payInfo } = order;

  // Robust Date Conversion
  const date = (typeof order.created_at === 'string')
    ? new Date(order.created_at).toLocaleString()
    : (order.created_at && (order.created_at as any)._seconds
      ? new Date((order.created_at as any)._seconds * 1000).toLocaleString()
      : 'N/A');

  const items = order.items || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className="bg-neutral-900 p-6 rounded-2xl w-full max-w-4xl border border-neutral-800 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
          <XCircle className="w-7 h-7" />
        </button>

        <div className="border-b border-neutral-800 pb-4 mb-6">
          <h3 className="text-3xl font-extrabold text-indigo-400 flex items-center">
            <FileText className="w-7 h-7 mr-3" /> Order Details
          </h3>
          <p className="text-gray-400 ml-10">
            Order ID (Firestore): <span className='text-purple-400 font-mono'>{order.id}</span>
          </p>
          {order.order_number && (
            <p className="text-gray-400 ml-10">
              Order Number: <span className='text-cyan-400 font-mono'>{order.order_number}</span>
            </p>
          )}
        </div>

        <div className="space-y-6 text-sm max-h-[75vh] overflow-y-auto pr-3 -mr-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
            <div>
              <h4 className="font-semibold text-gray-400 mb-1 text-xs uppercase tracking-wider flex items-center">
                <CalendarClock className="w-4 h-4 mr-1.5" /> Order Placed
              </h4>
              <p className='text-gray-200 text-sm'>{date}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-400 mb-1 text-xs uppercase tracking-wider">Current Status</h4>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-400 mb-1 text-xs uppercase tracking-wider">Grand Total</h4>
              <p className="text-3xl font-extrabold text-green-400">
                ${((order.total_amount || 0)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-neutral-800/50 p-5 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-indigo-400 flex items-center mb-3 text-lg">
                  <User className="w-5 h-5 mr-2" /> Registered User Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400 w-20 inline-block">Name:</span> <span className="text-white font-medium">{order.user_details.name}</span></p>
                  <p><span className="text-gray-400 w-20 inline-block">Email:</span> <span className="text-white">{order.user_details.email}</span></p>
                </div>
              </div>

              <div className="bg-neutral-800/50 p-5 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-indigo-400 flex items-center mb-3 text-lg">
                  <Navigation className="w-5 h-5 mr-2" /> Shipping Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-20 inline-block">Recipient:</span>
                    <span className="text-white font-medium">{shipDetails.recipient_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-20 inline-block">Contact:</span>
                    <span className='text-cyan-300 font-medium'>{shipDetails.contact || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-20 inline-block">Whatsapp:</span>
                    <span className='text-cyan-300'>{shipDetails.whatsapp || 'N/A'}</span>
                  </p>
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <span className="text-gray-400 w-20 inline-block align-top">Address:</span>
                    <span className="text-white break-words inline-block w-[calc(100%-6rem)]">{shipDetails.address || 'N/A'}</span>
                  </p>
                  <p className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <span className="text-gray-400 w-20 inline-block">Note:</span>
                    <span className="text-gray-300 italic">{shipDetails.note || 'None'}</span>
                  </p> {/* 💡 FIX: Yahan ghalti se </img-p> tha, ab </p> kar diya hai */}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-neutral-800/50 p-5 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-green-400 flex items-center mb-3 text-lg">
                  <Wallet className="w-5 h-5 mr-2" /> Payment Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Wallet className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-24 inline-block">Method:</span>
                    <span className='font-medium text-white'>{payInfo.method_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-24 inline-block">Txn ID:</span>
                    <span className='text-cyan-300 break-all'>{payInfo.txn_id || 'Not Provided'}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400 w-24 inline-block">Account No:</span>
                    <span className='text-white'>{payInfo.account_number || 'N/A'}</span>
                  </p>
                  <p className="mt-3 p-2 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-xs rounded-lg">
                    Admin Note: Verify Payment First!
                  </p>
                </div>
              </div>

              <div className="bg-neutral-800/50 p-5 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-indigo-400 flex items-center mb-3 text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Ordered Items ({items.length})
                </h4>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {items.length > 0 ? items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-gray-300 text-sm p-2 bg-neutral-700/50 rounded-md">
                      <div>
                        <span className='font-medium text-white'>{item.name || 'Unknown Product'}</span>
                        <span className="text-gray-400"> (x{item.quantity || 1})</span>
                      </div>
                      <span className='text-green-400 font-medium'>
                        ${( (item.price || 0) * (item.quantity || 1) ).toFixed(2)}
                      </span>
                    </li>
                  )) : (
                    <li className="text-gray-400 text-sm italic">No items in this order.</li>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-5 flex justify-end border-t border-neutral-800 mt-6">
          <label className="flex items-center gap-3">
            <span className="text-gray-400 font-medium">Update Status:</span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
              className="bg-neutral-700 border border-neutral-600 text-white rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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

// Main AdminDashboardPage component
export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); // Initial Load
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false); // Refreshing Load
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [newCode, setNewCode] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const adminName = localStorage.getItem('userName') || 'Admin';
  const authToken = localStorage.getItem('authToken');

  const fetchAdminData = async (isInitial = false) => {
    setError(null);
    if (!authToken) {
      navigate('/admin/login', { replace: true });
      if (isInitial) setLoadingInitial(false);
      return;
    }

    if (isInitial) setLoadingInitial(true);
    else setLoadingRefresh(true);

    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/orders`, { headers: { 'x-auth-token': authToken } }),
        fetch(`${BASE_URL}/api/products`)
      ]);

      if (ordersResponse.status === 401) {
        throw new Error("Session expired. Token invalid. Please login again.");
      }

      if (!ordersResponse.ok && ordersResponse.status !== 401) {
         throw new Error(`Failed to fetch orders. Status: ${ordersResponse.status}`);
      }
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products. Status: ${productsResponse.status}`);
      }

      const ordersText = await ordersResponse.text();
      if (!ordersText.trim() || ordersText.trim().startsWith('<')) {
        throw new Error("Network/Session Error. Unexpected empty/HTML response instead of JSON. (Backend not running or down)");
      }
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
      setError(err instanceof Error ? err.message : 'Unknown network error.');
    } finally {
      if (isInitial) setLoadingInitial(false);
      else setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    // Initial data load
    fetchAdminData(true);

    // Interval refresh
    const intervalId = setInterval(() => fetchAdminData(false), 10000);
    return () => clearInterval(intervalId);
  }, [authToken, navigate]);

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
        throw new Error('Failed to update status.');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Network error during status update! Reverting.');
      fetchAdminData();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!authToken) return;
    if (!window.confirm(`Are you sure you want to delete Order ID ${orderId}?`)) {
      return;
    }
    setOrders(prev => prev.filter(o => o.id !== orderId)); // Optimistic delete
    try {
      const resp = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': authToken }
      });
      if (!resp.ok) {
        throw new Error('Failed to delete order.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error during delete! Reverting.');
      fetchAdminData(); // Revert back
    }
  };

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

  // 🧠 Trigger backend AI analysis of frontend (calls backend analyze route)
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
      // Pretty output for UI
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

  // Upload image and ask backend to run AI command (single-step)
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

  if (showFullPageLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader className="w-12 h-12 animate-spin text-indigo-400" />
        <p className="ml-4 text-xl">Loading Admin Data...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <XCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-red-400">DATA LOAD FAILED</h1>
        <p className="text-lg text-gray-400 mt-2 p-3 bg-neutral-800 rounded text-center max-w-lg">
            {error}
            <br />
            <span className='text-sm text-yellow-300'>Backend URL aur Firebase/DB Connection check karein.</span>
        </p>
        <button onClick={() => { setLoadingInitial(true); fetchAdminData(true); }} className="mt-6 bg-indigo-600 p-2 px-4 rounded-lg hover:bg-indigo-700 transition">Try Again</button>
        <button onClick={handleLogout} className="mt-4 bg-neutral-700 p-2 px-4 rounded-lg hover:bg-neutral-600 transition">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e202e] text-gray-100 font-sans">
      <NeonStyle />

      <header className="py-4 px-6 md:px-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="text-indigo-400" />
          BASIT CMD Dashboard
        </h1>
        <div className="flex gap-3">
            <button
                onClick={() => fetchAdminData(false)}
                disabled={loadingRefresh}
                className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 text-sm ${loadingRefresh ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loadingRefresh ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh Data
            </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 text-sm"
          >
            <Settings className="w-4 h-4" /> Manage Products
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* AI Command Interface */}
        <div className="bg-[#2c2f48] p-6 rounded-xl border border-indigo-500/30 shadow-lg neon-card">
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
            <BrainCircuit className="w-5 h-5 mr-2 text-indigo-400" />
            AI Command Console
          </h3>
          <form onSubmit={handleAIChatSubmit} className='flex flex-col sm:flex-row gap-3'>
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Command type karein (e.g., 'Order 10 ko Delivered...')"
              className="flex-grow p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={loadingRefresh}
              className='bg-indigo-600 p-3 rounded-lg hover:bg-indigo-500 transition flex justify-center items-center font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed gap-2 px-4'
            >
              {loadingRefresh && aiResponse && aiResponse.includes('Processing Command') ? <Loader className="w-5 h-5 animate-spin" /> : <ArrowRight className='w-5 h-5' />}
              Execute Command
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              className='bg-emerald-600 p-3 rounded-lg hover:bg-emerald-500 transition font-medium text-white px-4'
            >
              Analyze Frontend
            </button>
            <button
              type="button"
              onClick={() => { setAiQuery(''); setAiResponse(null); }}
              className='bg-neutral-700 p-3 rounded-lg hover:bg-neutral-600 transition font-medium text-gray-300 px-4'
            >
              Clear
            </button>
          </form>

          {aiResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-3 text-sm rounded-lg border ${
                aiResponse.includes('Error') || aiResponse.includes('FATAL') || aiResponse.includes('503') || aiResponse.includes('401')
                  ? 'bg-red-900/50 border-red-700 text-red-300'
                  : 'bg-green-900/50 border-green-700 text-green-300'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{aiResponse}</pre>
            </motion.div>
          )}
        </div>

        {/* ============ AI IMAGE ASSISTANT ============ */}
        <div className="bg-[#2c2f48] p-6 rounded-xl border border-green-500/30 shadow-lg neon-card mt-6">
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
            <BrainCircuit className="w-5 h-5 mr-2 text-green-400" />
            AI Image Assistant
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="aiImageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white text-sm cursor-pointer"
            />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g., ‘Add this image to new product Red Hoodie’"
              className="flex-grow p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white text-sm"
            />
            <button
              type="button"
              onClick={handleImageCommand}
              disabled={loadingRefresh}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              Upload & Execute
            </button>
          </div>

          {aiResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-3 text-sm rounded-lg border ${
                aiResponse.includes('Error') || aiResponse.includes('Network') || aiResponse.includes('❌')
                  ? 'bg-red-900/50 border-red-700 text-red-300'
                  : 'bg-green-900/50 border-green-700 text-green-300'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{aiResponse}</pre>
            </motion.div>
          )}
        </div>

        {/* ============ FILE EXPLORER ============ */}
        <div className="bg-[#2c2f48] p-6 rounded-xl border border-cyan-500/30 shadow-lg mt-6">
          <h2 className="text-lg font-semibold mb-3 text-white">📂 Frontend Files</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => openFile(f.path)}
                  className="cursor-pointer hover:bg-neutral-800 p-2 rounded text-sm text-gray-300"
                >
                  {f.name}
                </div>
              ))}
            </div>

            {selectedFile && (
              <div>
                <h3 className="font-semibold mb-2 text-white">{selectedFile.name}</h3>
                <textarea
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full h-64 bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-green-400 font-mono"
                />
                <button
                  onClick={saveFile}
                  className="mt-3 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
                >
                  Save File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="bg-[#2c2f48] p-6 rounded-xl border border-indigo-500/30 shadow-lg neon-card">
          <h3 className='text-lg font-semibold text-white mb-4'>System Overview</h3>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {[
              { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, subtext: 'Delivered Total' },
              { title: 'New Orders', value: pendingOrdersCount, icon: Package, subtext: 'Pending / Processing' },
              { title: 'Total Products', value: totalProducts, icon: ShoppingCart, subtext: 'Items in Stock' },
              { title: 'Total Users', value: totalUsers, icon: Users, subtext: 'Total Users' },
            ].map(metric => (
              <motion.div
                key={metric.title}
                className="bg-neutral-800/60 p-5 rounded-xl border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                variants={{ visible: { opacity: 1, y: 0 } }}
              >
                <metric.icon className="w-7 h-7 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-300">{metric.title}</p>
                <p className="text-3xl font-extrabold text-white mt-1">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ORDERS MANAGEMENT TABLE */}
        <div className="bg-[#2c2f48] p-6 rounded-xl border border-indigo-500/30 shadow-lg neon-card">
          <h3 className='text-lg font-semibold text-white mb-4'>Order Queue ({orders.length} Total)</h3>

          {loadingRefresh && (
            <div className='py-2 flex justify-center items-center gap-2 bg-neutral-800/30 rounded-t-lg'>
              <Loader className="w-5 h-5 animate-spin text-indigo-400" />
              <span className='text-gray-400 text-sm'>Refreshing data...</span>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-neutral-700/50">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 bg-neutral-800/50">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors duration-200">
                    <td className="p-4 text-sm font-medium text-indigo-300 font-mono">
                        {order.order_number || order.id}
                    </td>
                    <td className="p-4 text-sm"><p className="font-semibold text-white">{order.user_details.name || 'N/A'}</p></td>
                    <td className="p-4 text-sm font-bold text-green-400">${(order.total_amount || 0).toFixed(2)}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className='bg-indigo-600 text-white py-1.5 px-4 rounded-lg hover:bg-indigo-500 transition text-xs font-bold'
                      >
                        Details
                      </button>
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className='bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition text-xs font-bold'
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loadingInitial && orders.length === 0 && !error && (
            <div className='py-10 px-8 bg-neutral-800/30 text-center rounded-b-lg border border-neutral-700/50 mt-[-1px]'>
              <Inbox className="w-10 h-10 mx-auto text-indigo-400 mb-3" />
              <p className='text-lg font-semibold text-white'>No orders yet.</p>
              <p className='text-gray-400 text-sm'>Waiting for new orders.</p>
            </div>
          )}

          <AnimatePresence>
            {selectedOrder && (
              <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusChange={handleStatusUpdate}
              />
            )}
          </AnimatePresence>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboardPage;

