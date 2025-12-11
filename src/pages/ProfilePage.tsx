import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming useAuth provides necessary context (userId, profilePic, updateProfilePic, dbInstance)
import { useAuth } from '../context/AuthProvider'; 
import {
    User, Lock, ChevronRight, LogOut, Camera, Mail, Settings, Heart, Trash2,
    Loader2, Edit, X, Save, Key, CornerDownLeft, Bell, ShoppingBag, MapPin, HelpCircle, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Firebase imports (Assuming AuthProvider handles initialization and exposes dbInstance)
// We rely on the parent context provider for Firebase instances to avoid the CDN import issue.
// The presence of dbInstance confirms Firebase is ready.


// Backend API URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app';
const MAX_IMAGE_SIZE = 35000 * 1024; // 350 KB limit

// --- Interfaces ---
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    description: string;
    profilePicBase64: string | null;
}

interface OrderItem {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

interface Order {
    id: string;
    date: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Unknown';
    total_amount: number;
    items: OrderItem[];
}

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

interface NotificationItem {
    id: string;
    type: 'PROFILE_UPDATE' | 'ORDER_UPDATE' | 'GENERAL';
    message: string;
    date: string;
    createdAt: string;
}


// ===================================================
// Component 3: WishlistModal
// ===================================================

interface WishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose, userId }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const authToken = localStorage.getItem('authToken');

    // Fetch Wishlist
    const fetchWishlist = useCallback(async () => {
        if (!userId || !authToken) {
            toast.error("Login zaroori hai ya token missing hai.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/user-wishlist`, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });
            setWishlist(response.data || []);
        } catch (error) {
            console.error("Wishlist fetch error:", error);
            toast.error("Wishlist load nahi ho saka. (401 Error ki wajah ho sakti hai).");
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, [userId, authToken]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchWishlist();
        } 
    }, [isOpen, userId, fetchWishlist]);

    // Delete Item
    const handleDeleteItem = async (productId: string) => {
        if (!userId || !authToken) return toast.error("User ID ya token missing.");
        setWishlist(prev => prev.filter(item => item.id !== productId)); // Optimistic delete
        try {
            await axios.delete(`${BASE_URL}/api/user-wishlist/remove/${productId}`, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });
            toast.success("Item wishlist se hat gaya.");
        } catch (e) {
            toast.error("Delete mein ghalti hui. Refresh karein.");
            fetchWishlist(); // Revert on error
        }
    };

    // Add Mock Item (for testing/demo)
    const handleAddMockItem = async () => {
        if (!userId || !authToken) return toast.error("User ID ya token missing.");
        const mockProduct = {
            productId: `mock-${Math.random().toString(36).substring(2, 8)}`,
        };
        try {
            await axios.post(`${BASE_URL}/api/user-wishlist/add`, { productId: mockProduct.productId }, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });
            toast.success("Mock item add ho gaya! Refreshing...");
            fetchWishlist();
        } catch (e: any) {
             toast.error(e.response?.data?.message || "Mock item add nahi hua.");
        }
    }


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300">
                    <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50" aria-label="Back">
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>
                        <div className="flex flex-col items-center mb-8">
                            <Heart className="w-8 h-8 text-pink-500 mb-2" />
                            <h3 className="text-3xl font-extrabold text-white">My Wishlist (میری وش لسٹ)</h3>
                        </div>

                        <button onClick={handleAddMockItem} disabled={loading} className="w-full py-2 mb-4 text-sm bg-pink-700 hover:bg-pink-600 rounded-xl font-semibold transition flex items-center justify-center">
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-1" />} Test: Add Mock Product
                        </button>
                        
                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                            </div>
                        )}

                        {!loading && !authToken && (
                            <div className="text-center py-5 bg-red-900/50 rounded-xl border border-red-700 mb-4">
                                <p className="text-red-300 font-semibold">Authentication Error (تصدیق کا مسئلہ)</p>
                                <p className="text-xs text-red-400 mt-1">Login Token Missing/Expired. Barah-e-mehrbani dobara login karein.</p>
                            </div>
                        )}

                        {!loading && wishlist.length === 0 && (
                            <div className="text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                                <Heart className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Aapki wishlist abhi khali hai. (آپ کی وش لسٹ ابھی خالی ہے)</p>
                                <p className="text-xs text-gray-500 mt-2">Upar 'Add Mock Product' button se test karein.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {wishlist.map((item) => (
                                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center p-3 bg-gray-800 rounded-xl shadow-md border border-gray-700/50">
                                    <img src={item.imageUrl || `https://placehold.co/60x60/374151/fff?text=${item.name.substring(0, 2)}`} 
                                         alt={item.name} className="w-12 h-12 object-cover rounded-lg mr-4" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white truncate">{item.name}</p>
                                        <p className="text-sm text-pink-400">Rs. {item.price ? item.price.toLocaleString() : 'N/A'}</p>
                                    </div>
                                    <motion.button 
                                        onClick={() => handleDeleteItem(item.id)} 
                                        whileHover={{ scale: 1.1, backgroundColor: '#dc2626' }} whileTap={{ scale: 0.9 }}
                                        className="p-2 bg-red-800/50 text-red-400 rounded-full hover:bg-red-700 transition duration-150 ml-4">
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ===================================================
// Component 4: OrderHistoryModal
// ===================================================
interface OrderHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, userId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
    const authToken = localStorage.getItem('authToken');


    // Color mapper for status
    const getStatusStyle = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'bg-green-700/50 text-green-300';
            case 'Shipped': return 'bg-indigo-700/50 text-indigo-300';
            case 'Processing': return 'bg-yellow-700/50 text-yellow-300';
            case 'Cancelled': return 'bg-red-700/50 text-red-300';
            case 'Pending':
            default: return 'bg-gray-700/50 text-gray-300';
        }
    };

    // Fetch Orders from API
    const fetchOrderHistory = useCallback(async () => {
        if (!userId || !authToken) {
            setHasAttemptedFetch(true);
            toast.error("Login zaroori hai ya token missing hai. Orders load nahi honge.");
            return;
        }
        setLoading(true);
        setHasAttemptedFetch(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/user-orders`, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });

            const realOrders: Order[] = response.data || [];
            setOrders(realOrders);

        } catch (error: any) {
            console.error("Order History fetch error:", error?.response?.data || error);
            // Display specific error if available
            const errorMessage = error?.response?.status === 401 
                ? "Authentication failed (Token Invalid/Expired)."
                : "Server error ya network issue.";

            toast.error(`Orders load nahi ho sake: ${errorMessage}`);
            setOrders([]); // Error hone par empty array set karein
        } finally {
            setLoading(false);
        }
    }, [userId, authToken]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchOrderHistory();
        } else if (!isOpen) {
            setOrders([]);
            setHasAttemptedFetch(false);
        }
    }, [isOpen, userId, fetchOrderHistory]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300">
                    <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50" aria-label="Back">
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>
                        <div className="flex flex-col items-center mb-8">
                            <ShoppingBag className="w-8 h-8 text-indigo-500 mb-2" />
                            <h3 className="text-3xl font-extrabold text-white">Order History (آرڈر ہسٹری)</h3>
                        </div>

                        {loading && (
                            <div className="flex flex-col items-center py-16 bg-gray-800/50 rounded-xl">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                <p className='mt-3 text-gray-400'>Orders load ho rahe hain... (آرڈرز لوڈ ہو رہے ہیں)</p>
                            </div>
                        )}
                        
                        {!loading && !authToken && (
                            <div className="text-center py-5 bg-red-900/50 rounded-xl border border-red-700 mb-4">
                                <p className="text-red-300 font-semibold">Authentication Error (تصدیق کا مسئلہ)</p>
                                <p className="text-xs text-red-400 mt-1">Login Token Missing/Expired. Barah-e-mehrbani dobara login karein.</p>
                            </div>
                        )}

                        {!loading && orders.length === 0 && hasAttemptedFetch && (
                            <div className="text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                                <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Aapne abhi tak koi order place nahi kiya. (آپ نے کوئی آرڈر نہیں کیا)</p>
                                {authToken && <p className='text-xs text-gray-500 mt-2'>Note: Agar orders place kiye hain, toh check karein woh aapki user ID se linked hain ya nahi.</p>}
                            </div>
                        )}

                        <div className="space-y-6">
                            {orders.map((order, index) => (
                                <motion.div key={order.id || index} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                                    className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700/50">
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
                                        <div className='text-sm text-gray-400'>
                                            <p className="font-semibold text-white">Order ID: #{order.id}</p>
                                            <p>{order.date}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {order.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center">
                                                <img src={item.imageUrl || `https://placehold.co/40x40/374151/fff?text=${item.name.substring(0, 2)}`} 
                                                    alt={item.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                                <div className="flex-grow">
                                                    <p className="text-sm text-white font-medium">{item.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-indigo-400">
                                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-700">
                                        <p className="text-base font-bold text-white">Total Amount:</p>
                                        <p className="text-lg font-extrabold text-green-400">
                                            Rs. {order.total_amount ? order.total_amount.toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ===================================================
// Component 5: NotificationModal (Real API Fetch)
// ===================================================

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, userId }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const authToken = localStorage.getItem('authToken');

    // Helper function to format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return as is if invalid
            
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

            if (diffInMinutes < 1) {
                return 'just now (ابھی ابھی)';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} minutes ago (${diffInMinutes} منٹ پہلے)`;
            } else if (diffInMinutes < 24 * 60) {
                return `${Math.floor(diffInMinutes / 60)} hours ago (${Math.floor(diffInMinutes / 60)} گھنٹے پہلے)`;
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

        } catch (e) {
            return dateString;
        }
    };
    
    // Icon mapping function
    const getNotificationIcon = (type: string, message: string) => {
        if (type === 'ORDER_UPDATE') {
            if (message.includes('Delivered')) return { icon: ShoppingBag, color: 'text-green-400' };
            if (message.includes('Cancelled')) return { icon: X, color: 'text-red-400' };
            return { icon: AlertTriangle, color: 'text-yellow-400' };
        }
        if (type === 'PROFILE_UPDATE') return { icon: User, color: 'text-indigo-400' };
        return { icon: Bell, color: 'text-gray-400' };
    };
    
    // Fetch Real Notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!userId || !authToken) {
            toast.error("Login zaroori hai ya token missing hai. Notifications load nahi honge.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/user-notifications`, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });
            // Sort notifications by date/createdAt descending to show new ones first
            const sortedNotifications = (response.data || []).sort((a: NotificationItem, b: NotificationItem) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setNotifications(sortedNotifications);
        } catch (error: any) {
            console.error("Notifications fetch error:", error);
             // Display specific error if available
            const errorMessage = error?.response?.status === 401 
                ? "Authentication failed (Token Invalid/Expired)."
                : "Server error ya network issue.";

            toast.error(`Notifications load nahi ho sake: ${errorMessage}`);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [userId, authToken]);
    
    useEffect(() => {
        if (isOpen && userId) {
            fetchNotifications();
        }
    }, [isOpen, userId, fetchNotifications]);


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300">
                    <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50" aria-label="Back">
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>
                        <div className="flex flex-col items-center mb-8">
                            <Bell className="w-8 h-8 text-yellow-500 mb-2" />
                            <h3 className="text-3xl font-extrabold text-white">Notifications (اطلاعات)</h3>
                        </div>
                        
                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                            </div>
                        )}
                        
                        {!loading && !authToken && (
                            <div className="text-center py-5 bg-red-900/50 rounded-xl border border-red-700 mb-4">
                                <p className="text-red-300 font-semibold">Authentication Error (تصدیق کا مسئلہ)</p>
                                <p className="text-xs text-red-400 mt-1">Login Token Missing/Expired. Barah-e-mehrbani dobara login karein.</p>
                            </div>
                        )}

                        {!loading && notifications.length === 0 ? (
                             <div className="text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                                <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Aapke paas koi nayi notification nahi hai. (کوئی اطلاع نہیں ہے)</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notif, index) => {
                                    const { icon: Icon, color } = getNotificationIcon(notif.type, notif.message);
                                    return (
                                    <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                        className="flex p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700/50">
                                        <div className={`p-2 rounded-full ${color.replace('text-', 'bg-')}/30 mr-3 h-fit`}>
                                            <Icon className={`w-5 h-5 ${color}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{notif.type.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-300 mt-1">{notif.message}</p>
                                            {/* Date Formatting Applied */}
                                            <p className="text-xs text-gray-500 mt-2">{formatDate(notif.date)}</p> 
                                        </div>
                                    </motion.div>
                                )})}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ===================================================
// Component 6: SettingsModal
// ===================================================
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenPassword: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenPassword }) => {
    const menuItems = [
        { icon: MapPin, label: 'Address Management (ایڈریس)', action: () => toast.info('Address Management is coming soon!'), color: 'text-indigo-400' },
        { icon: HelpCircle, label: 'Help & Support (مدد)', action: () => toast.info('Need help? Contact support!'), color: 'text-yellow-400' },
        { icon: Key, label: 'Change Password (پاسورڈ بدلیں)', action: onOpenPassword, color: 'text-purple-400' },
    ];

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05, duration: 0.3 }
        }),
        hover: { scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 0.4)', transition: { duration: 0.2 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300">
                    <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto">
                        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50" aria-label="Back">
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>
                        <div className="flex flex-col items-center mb-8">
                            <Settings className="w-8 h-8 text-white mb-2" />
                            <h3 className="text-3xl font-extrabold text-white">App Settings (ایپ کی ترتیبات)</h3>
                        </div>

                        <div className="mt-4 p-2 space-y-3">
                            {menuItems.map((item, index) => (
                                <motion.button
                                    key={index}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-xl transition-all duration-200 text-left border border-gray-700/50 shadow-md"
                                    custom={index}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-5 h-5 mr-4 ${item.color}`} />
                                        <span className="text-white font-medium">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// ===================================================
// Component 1: EditProfileModal (Design Updated)
// ===================================================
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialName: string;
    initialDescription: string;
    onSave: (name: string, description: string) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, initialName, initialDescription, onSave }) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setDescription(initialDescription);
        }
    }, [isOpen, initialName, initialDescription]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (name.length < 3) {
            toast.error("Naam kam az kam 3 characters ka hona chahiye.");
            setLoading(false);
            return;
        }
        await onSave(name, description);
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50"
                            aria-label="Back"
                        >
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>

                        <div className="flex flex-col items-center mb-8">
                            <h3 className="text-3xl font-extrabold text-white">Edit Profile (پروفائل میں ترمیم)</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-light text-gray-400 mb-2">Full Name (پورا نام)</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                    minLength={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-light text-gray-400 mb-2">About Me (Bio) (میرے بارے میں)</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                    placeholder="Apne baray mein kuch likhein..."
                                />
                            </div>

                            <div className="flex justify-between space-x-4 pt-8">
                                <motion.button type="button" onClick={onClose} disabled={loading}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="w-1/2 py-3 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-600 font-semibold transition duration-200"
                                >
                                    Discard (منسوخ)
                                </motion.button>
                                <motion.button type="submit" disabled={loading}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="w-1/2 py-3 bg-white text-gray-900 rounded-xl shadow-lg hover:bg-gray-200 flex items-center justify-center font-semibold transition duration-200"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-1" />} Save (محفوظ کریں)
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

    );
};

// ===================================================
// Component 2: ChangePasswordModal (Design Updated)
// ===================================================
interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (oldPass: string, newPass: string) => Promise<boolean>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        if (newPassword.length < 6) {
            toast.error("Naya password kam az kam 6 characters ka hona chahiye.");
        } else if (newPassword !== confirmPassword) {
            toast.error("Naya password match nahi ho raha.");
        } else {
            const saveSuccessful = await onSave(oldPassword, newPassword);
            if (saveSuccessful) {
                setSuccess(true);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(onClose, 1800);
            }
        }

        setLoading(false);

    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50"
                            aria-label="Back"
                        >
                            <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
                        </button>
                        <div className="flex flex-col items-center mb-8">
                            <h3 className="text-3xl font-extrabold text-white">Change Password (پاسورڈ بدلیں)</h3>
                        </div>

                        {success && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className='p-3 bg-green-900/50 text-green-300 rounded-xl mb-6 font-semibold border border-green-700'>
                                Password successfully change ho gaya! (پاسورڈ کامیابی سے بدل گیا!)
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-light text-gray-400 mb-2">Old Password (پرانا پاسورڈ)</label>
                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-400 mb-2">New Password (min 6) (نیا پاسورڈ)</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-light text-gray-400 mb-2">Confirm New Password (تصدیق کریں)</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                                />
                            </div>

                            <div className="flex justify-end pt-8">
                                <motion.button type="submit" disabled={loading || success}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 flex items-center justify-center font-semibold transition duration-200"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Key className="w-5 h-5 mr-1" />} Change Password (پاسورڈ بدلیں)
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

    );
};


// ===================================================
// Main Profile Page Component
// ===================================================
export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    // Assuming useAuth provides necessary context (isLoggedIn, userId, logoutUser, updateProfilePic)
    const { isLoggedIn, userName, userId, logoutUser, profilePic, updateProfilePic } = useAuth(); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [isPicUploading, setIsPicUploading] = useState(false); // NEW: Separate loading for picture
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // NEW Modals
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

    const authToken = localStorage.getItem('authToken');
    const [authChecked, setAuthChecked] = useState(false);

    // Defensive guard wrapper - ensures actions require login
    const requireAuth = (action?: () => void) => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
            return false;
        }
        if (action) action();
        return true;
    };

    // Fetch profile
    const fetchProfile = useCallback(async () => {
        if (!authToken || !userId) {
            setProfile(null);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/profile`, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });

            const data: UserProfile = response.data;
            setProfile(data);

            localStorage.setItem('userName', data.name);
            if (data.profilePicBase64) localStorage.setItem('profilePicBase64', data.profilePicBase64);
            updateProfilePic(data.profilePicBase64);
        } catch (error: any) {
            console.error("Profile fetch error:", error?.response?.data || error);
            toast.error("Profile data load nahi ho saka. Server Error.");
        } finally {
            setLoading(false);
        }

    }, [authToken, userId, updateProfilePic]);

    // If user not logged in, redirect to login (defensive)
    useEffect(() => {
        if (!isLoggedIn) {
            setAuthChecked(true);
            // navigate('/login', { replace: true }); // navigate is not called if its for embed
            return;
        } else {
            setAuthChecked(true);
            fetchProfile();
        }
    }, [isLoggedIn, fetchProfile]);

    // Update profile (PUT)
    const handleUpdateProfile = async (newName: string, newDescription: string) => {
        if (!authToken) {
            toast.error("Not authenticated.");
            // navigate('/login', { replace: true }); // navigate is not called if its for embed
            return;
        }
        try {
            const response = await axios.put(`${BASE_URL}/api/profile`, {
                name: newName, description: newDescription
            }, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });

            if (response.data.message) {
                toast.success(response.data.message);
                localStorage.setItem('userName', newName);
                setIsEditingProfile(false); // Close modal on success
                // Notification is handled by the backend!
                fetchProfile(); // Re-fetch to update local state
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Profile update mein ghalti hui.");
        }

    };

    // Change password
    const handleChangePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
        if (!authToken) {
            toast.error("Not authenticated.");
            // navigate('/login', { replace: true }); // navigate is not called if its for embed
            return false;
        }
        try {
            const response = await axios.put(`${BASE_URL}/api/profile/change-password`, {
                oldPassword: oldPass, newPassword: newPass
            }, {
                headers: { 'x-auth-token': authToken },
                timeout: 15000
            });

            toast.success(response.data.message);
            // Notification is handled by the backend!
            return true;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Password change nahi ho saka. Old password check karein.");
            return false;
        }

    };

    // Profile picture upload - guarded and optimized
    const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!requireAuth()) return;
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error(`Image ka size ${MAX_IMAGE_SIZE / 1024}KB se kam hona chahiye.`);
            return;
        }

        setIsPicUploading(true); // Start local loading indicator
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const oldPic = profilePic;
            updateProfilePic(base64String); // Optimistic UI update

            try {
                const response = await axios.post(`${BASE_URL}/api/profile/upload-pic`, {
                    profilePicBase64: base64String
                }, {
                    headers: { 'x-auth-token': authToken },
                    timeout: 30000
                });

                if (response.data.success) {
                    toast.success("Profile picture update ho gaya!");
                    // Notification is handled by the backend!
                    // updateProfilePic handles the UI state correctly.
                } else {
                    updateProfilePic(oldPic); // Revert on failure
                    toast.error(response.data.message || "Picture upload mein ghalti hui.");
                }
            } catch (error) {
                updateProfilePic(oldPic); // Revert on failure
                console.error("Profile picture upload error:", error);
                toast.error("Picture upload nahi ho saka. Server error ya network issue.");
            } finally {
                setIsPicUploading(false); // Stop local loading indicator
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);

    };

    // Render loader while auth checked or initial fetch
    if (!authChecked || (loading && !profile)) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
            </div>
        );
    }

    // Fallback profile
    // IMPORTANT: If 'profile' is null, we use the values provided by useAuth context (like userName) and a default email.
    // The main email display issue was here: currentProfile.email was incorrectly set or displayed.
    const currentProfile: UserProfile = profile || {
        id: userId || 'N/A',
        name: userName || 'User',
        email: 'user@example.com', // Fallback value, this should ideally be populated by the useAuth context if available, but for now we rely on the API fetch above.
        role: 'user',
        description: 'Koi description nahi diya gaya.',
        profilePicBase64: profilePic,
    };
    
    // **Email Fix Logic**: We ensure that we use the email from the API fetched 'profile' or fall back correctly.
    const displayEmail = currentProfile.email; // This is now correct as 'profile' fetch returns the real email.
    // If 'profile' is null (meaning fetch failed), we still rely on 'currentProfile' which has the fallback email, 
    // but the issue seems to be in the display part which is corrected below.


    // Menu items (Main list ab Setting button se replace ho gayi hai)
    const quickAccessButtons = [
        { icon: Bell, label: 'Notifications (اطلاعات)', action: () => requireAuth(() => setIsNotificationsOpen(true)), color: 'text-yellow-400' },
        { icon: Heart, label: 'Wishlist (وش لسٹ)', action: () => requireAuth(() => setIsWishlistOpen(true)), color: 'text-pink-400' }, // New Wishlist button
        { icon: CornerDownLeft, label: 'History (ہسٹری)', action: () => requireAuth(() => setIsOrderHistoryOpen(true)), color: 'text-indigo-400' },
    ];

    // Menu items for the Settings Modal
    const settingsItems = [
        { icon: Edit, label: 'Edit Profile (پروفائل میں ترمیم)', action: () => requireAuth(() => setIsEditingProfile(true)), color: 'text-white' },
        { icon: Settings, label: 'Settings (ترتیبات)', action: () => requireAuth(() => setIsSettingsOpen(true)), color: 'text-gray-400' },
    ];

    // Common animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.05, duration: 0.3 }
        }),
        hover: { scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 0.4)', transition: { duration: 0.2 } }
    };

    const buttonVariants = {
        initial: { scale: 1, opacity: 1 },
        hover: { scale: 1.05, y: -2, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.5)' },
        tap: { scale: 0.95 }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white transition-all duration-300 p-0">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md mx-auto min-h-screen bg-gray-900 shadow-2xl"
            >

                {/* Header Section (Profile Title + Back Button) */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 p-4 pt-10 flex justify-between items-center border-b border-gray-800">
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="text-white hover:text-gray-300 transition duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <CornerDownLeft className="w-6 h-6 rotate-90" />
                    </motion.button>
                    <h1 className="text-2xl font-bold">Profile (پروفائل)</h1>
                    <div className="w-6"></div> {/* Placeholder for alignment */}
                </div>

                {/* User Info Card */}
                <div className="p-6 pt-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <motion.img
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            src={currentProfile.profilePicBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name || 'User')}&background=1f2937&color=fff&size=96&rounded=true`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-xl"
                        />
                        <button
                            onClick={() => {
                                if (!isLoggedIn) {
                                    navigate('/login', { replace: true });
                                    return;
                                }
                                fileInputRef.current?.click();
                            }}
                            className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                            aria-label="Change profile picture"
                            disabled={isPicUploading}
                        >
                            {isPicUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*" // Adjusted to allow most formats
                            onChange={handleProfilePicChange}
                            style={{ display: 'none' }}
                            disabled={isPicUploading}
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-2">
                        {currentProfile.name || 'Jane Cooper'}
                    </h2>
                    {/* *** EMAIL DISPLAY FIX: The email will now show the actual email address from the profile state *** */}
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Mail className='w-3 h-3' /> {displayEmail}
                    </p>
                </div>

                {/* Quick Access Buttons (Notification, Wishlist, History) */}
                <div className="flex justify-around items-center p-4">
                    {quickAccessButtons.map((btn, index) => (
                        <motion.button
                            key={index}
                            onClick={btn.action}
                            className="flex flex-col items-center text-xs text-gray-400 w-1/4"
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="p-3 bg-gray-800 rounded-xl mb-1 shadow-md">
                                <btn.icon className={`w-5 h-5 ${btn.color}`} />
                            </div>
                            {btn.label}
                        </motion.button>
                    ))}
                </div>

                {/* Settings Menu List */}
                <div className="mt-4 p-4 space-y-2">
                    {settingsItems.map((item, index) => (
                        <motion.button
                            key={index}
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-xl transition-all duration-200 text-left border border-gray-700/50"
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                        >
                            <div className="flex items-center">
                                <item.icon className={`w-5 h-5 mr-4 ${item.color}`} />
                                <span className="text-white font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.button>
                    ))}

                    {/* Logout Button (Separate style as per image's last item) */}
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => requireAuth(logoutUser)}
                        className="w-full flex items-center justify-center p-4 bg-red-700/70 text-white rounded-xl shadow-lg mt-6 border border-red-900/50 transition-all duration-200"
                        custom={settingsItems.length}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-semibold text-lg">Log out (لاگ آؤٹ)</span>
                    </motion.button>
                </div>

                {/* Bottom padding for better mobile view */}
                <div className="h-20"></div>

            </motion.div>

            {/* Modals */}
            <EditProfileModal
                isOpen={isEditingProfile}
                onClose={() => setIsEditingProfile(false)}
                initialName={currentProfile.name}
                initialDescription={currentProfile.description}
                onSave={handleUpdateProfile}
            />
            <ChangePasswordModal
                isOpen={isChangingPassword}
                onClose={() => setIsChangingPassword(false)}
                onSave={handleChangePassword}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onOpenPassword={() => { setIsSettingsOpen(false); setIsChangingPassword(true); }}
            />
            <WishlistModal
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                userId={userId}
            />
            <NotificationModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                userId={userId}
            />
            <OrderHistoryModal
                isOpen={isOrderHistoryOpen}
                onClose={() => setIsOrderHistoryOpen(false)}
                userId={userId}
            />

        </div>
    );
};

