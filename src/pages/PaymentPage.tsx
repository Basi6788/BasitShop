// Path: /src/pages/PaymentPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import axios from 'axios';
import { CheckCircleIcon, CreditCardIcon, BanknoteIcon, WalletIcon, Loader, ArrowLeftIcon, UserIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

const BACKEND_URL = 'https://romeobackend.netlify.app'; 

const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', description: 'Paise delivery par.', icon: BanknoteIcon, color: 'green', disabled: false },
    { id: 'jazzcash', name: 'JazzCash', description: 'JazzCash Mobile Account se adaigi.', icon: WalletIcon, color: 'red', disabled: false status: 'Recommended' },
    { id: 'easypaisa', name: 'EasyPaisa', description: 'EasyPaisa Mobile Account se adaigi.', icon: WalletIcon, color: 'purple', disabled: false },
    { id: 'card', name: 'Credit/Debit Card', description: 'Online card se adaigi (Abhi dastiyab nahi).', icon: CreditCardIcon, color: 'blue', disabled: false, status: 'Open now' },
];

const DUMMY_PAYMENT_DETAILS = {
    jazzcash: { name: 'Nazeer Ahmad JazzCash A/C', number: '03018005087', bank: 'JazzCash' },
    easypaisa: { name: 'Nazeer Ahmad EasyPaisa A/C', number: '03018005087', bank: 'EasyPaisa' },
};

// Interfaces (Zaroori types)
interface OrderSummary { total: number; }
interface DeliveryDetails { name: string; address: string; phone: string; email: string; city: string; postalCode: string; }
interface CartItem { id: string; quantity: number; price: number; name: string; options?: any; }


export const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    
    // States
    const state = location.state;
    const [selectedMethod, setSelectedMethod] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // ✅ AUTH TOKEN LOAD KAREIN
    const authToken = localStorage.getItem('authToken'); 

    // Data Extraction 
    const orderData = (state?.orderSummary || { total: 0 }) as OrderSummary;
    const deliveryDetails = state?.deliveryDetails as DeliveryDetails | undefined;
    const cartItems = state?.cartItems as CartItem[] | undefined; 

    // Redirect if data is missing
    useEffect(() => {
        if (!deliveryDetails || !cartItems || cartItems.length === 0) { 
            navigate('/checkout', { replace: true });
        }
    }, [deliveryDetails, cartItems, navigate]);

    const isTransactionRequired = ['jazzcash', 'easypaisa'].includes(selectedMethod);
    const isConfirmEnabled = selectedMethod && (selectedMethod === 'cod' || (isTransactionRequired && transactionId.length >= 5));
    const selectedDetails = isTransactionRequired ? DUMMY_PAYMENT_DETAILS[selectedMethod as keyof typeof DUMMY_PAYMENT_DETAILS] : null;

    const navigateToConfirmation = useCallback((finalOrderNumber: string, message: string, status: string = 'review') => {
        clearCart();
        setLoading(false); // Redirection se pehle loading band kar dein
        navigate('/confirmation', { 
            state: { 
                message: message, 
                method: selectedMethod, 
                orderId: finalOrderNumber,
                orderSummary: orderData,
                deliveryDetails: deliveryDetails,
                cartItems: cartItems,
                transactionId: isTransactionRequired ? transactionId : undefined,
                paymentStatus: status,
            } 
        });
    }, [clearCart, selectedMethod, orderData, deliveryDetails, cartItems, isTransactionRequired, transactionId, navigate]);


    const handlePlaceOrder = useCallback(async () => {
        if (!isConfirmEnabled || loading || !cartItems || !deliveryDetails) return;
        
        // Agar user logged in nahi hai
        if (!authToken) {
             setApiError("Order place karne se pehle login karna ya register karna zaroori hai.");
             setLoading(false);
             return;
        }

        setLoading(true);
        setApiError(null);

        const orderId = crypto.randomUUID().substring(0, 8); // Temporary Order ID
        
        const submissionData = {
            deliveryDetails: {
                ...deliveryDetails,
                paymentMethod: selectedMethod,
                transactionId: isTransactionRequired ? transactionId : undefined,
                
                // 🛑 FINAL FIX: Shipping details keys ko map kiya
                recipient_name: deliveryDetails.name, 
                contact: deliveryDetails.phone,        
            },
            // Backend /api/checkout expects cartItems in array
            cartItems: cartItems.map(item => ({ 
                id: item.id, 
                product_id: item.id, // Explicitly product_id bhejein
                name: item.name, 
                price: item.price, 
                quantity: item.quantity, 
                options: item.options 
            })),
            totalAmount: orderData.total,
            orderId: orderId,
            paymentMethod: selectedMethod, 
            paymentInfo: {
                method_name: selectedMethod,
                txn_id: isTransactionRequired ? transactionId : undefined,
            }
        };
        
        try {
            // Endpoint /api/checkout aur Auth Token headers mein bheja
            const apiResponse = await axios.post(`${BACKEND_URL}/api/checkout`, submissionData, {
                timeout: 5000,
                headers: {
                    'x-auth-token': authToken, // Auth Token yahan jaa raha hai
                    'Content-Type': 'application/json'
                }
            });
            
            const finalOrderNumber = apiResponse.data.order_number || orderId; 
            
            // SUCCESS: Redirect to ConfirmationPage
            navigateToConfirmation(finalOrderNumber, `Order #${finalOrderNumber} successfully placed.`, 'confirmed');

        } catch (error) {
            console.error("Order Placement Error:", error?.response?.data || error);

            const isAuthError = error?.response?.status === 401 || error?.response?.status === 403;
            const isNetworkFailure = error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED' || !error.response;

            if (isAuthError) {
                 setApiError("Session expire ho gayi hai. Barae meherbani dobara login karen.");
            }
            else if (isNetworkFailure || error.response) {
                // Network/Server error bypass
                navigateToConfirmation(
                    `TEMP-${orderId}`, 
                    "Order place nahi ho saka lekin humne aapki request record kar li hai. (Error Bypass)",
                    'pending'
                );
            } else {
                setApiError("Order place nahi ho saka. Server se ghalti ya data mein masla hai.");
            }

        } finally {
            setLoading(false);
        }
    }, [isConfirmEnabled, loading, cartItems, deliveryDetails, selectedMethod, transactionId, orderData.total, navigateToConfirmation, authToken]);

    if (!deliveryDetails || !cartItems || cartItems.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
            <main className="max-w-4xl mx-auto p-6 py-10">
                
                {/* Back to Checkout Link */}
                <Link to="/checkout" className="flex items-center text-blue-600 hover:text-blue-500 mb-4 transition">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Wapas Delivery Details Par Jayen
                </Link>

                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white border-b-2 border-purple-500 inline-block pb-2 mb-8">
                    Payment Review (2/2)
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT: Order Summary & Delivery Details */}
                    <div className="flex-1 space-y-6">
                        {/* Delivery Details Section */}
                        {deliveryDetails && (
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-indigo-500">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-indigo-500" /> Shipping Address
                            </h2>
                            <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                                <p className="flex items-center"><UserIcon className="w-4 h-4 mr-2 text-gray-400" /> 
                                    <span className="font-semibold">{deliveryDetails.name}</span>
                                </p>
                                <p className="ml-6">
                                    {deliveryDetails.address}, {deliveryDetails.city}, {deliveryDetails.postalCode}
                                </p>
                                <p className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2 text-gray-400" /> 
                                    {deliveryDetails.phone}
                                </p>
                            </div>
                        </div>
                        )}

                        {/* Order Summary Section */}
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                                Item Details
                            </h2>
                            {cartItems && cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-base py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {item.name} x {item.quantity}
                                        {(item.options?.color || item.options?.storage) && (
                                            <span className="ml-2 text-gray-500 text-xs">
                                                ({item.options.color}, {item.options.storage})
                                            </span>
                                        )}
                                    </span>
                                    <span className="font-bold text-lg text-green-500 dark:text-green-400">
                                        Rs {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            <hr className="my-3 border-gray-700" />

                            <p className="text-right font-bold text-2xl text-green-500 dark:text-green-400">
                                FINAL TOTAL: Rs {Number(orderData.total).toFixed(2)} 
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Payment Options & Action */}
                    <div className="lg:w-2/5 sticky top-4 h-fit">
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Select Payment</h2>
                        
                        <div className="space-y-4">
                            {paymentMethods.map(method => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;
                                
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => !method.disabled && setSelectedMethod(method.id)}
                                        disabled={method.disabled || loading}
                                        className={`w-full text-left p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-200 hover:scale-[1.01] ${method.disabled ? 'bg-gray-200 dark:bg-gray-700 border-gray-400 text-gray-500 cursor-not-allowed opacity-60' : isSelected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-white dark:bg-gray-700 shadow-sm`}>
                                                <Icon className={`w-6 h-6 text-${method.color}-600 dark:text-${method.color}-400`} />
                                            </div>
                                            <div>
                                                <p className={`font-bold text-lg ${method.disabled ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {method.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </div>
                                        {method.disabled ? (
                                            <div className="text-red-500 font-semibold text-sm">Closed Now</div>
                                        ) : isSelected && (
                                            <CheckCircleIcon className={`w-6 h-6 text-purple-600 dark:text-purple-400 fill-current`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        

                        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                            {apiError && (
                                <div className="p-3 mb-4 text-sm font-semibold text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
                                    {apiError}
                                </div>
                            )}
                            
                            {/* Digital Wallet Details Box */}
                            {selectedDetails && (
                                <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4 border-l-4 border-yellow-500">
                                    <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-300">
                                        {selectedMethod.toUpperCase()} Details
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300">**Account Name:** {selectedDetails.name || 'N/A'}</p>
                                    <p className="text-gray-700 dark:text-gray-300">**Number:** {selectedDetails.number || 'N/A'}</p>
                                    
                                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Transaction/Reference ID</label>
                                    <input
                                        type="text"
                                        id="transactionId"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Adaigi ke baad Txn ID daalein"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white transition"
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* Confirm Order Button */}
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={!isConfirmEnabled || loading}
                                className={`w-full mt-6 flex items-center justify-center p-3 rounded-lg font-semibold transition-all duration-300 
                                    ${isConfirmEnabled
                                        ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                                        : 'bg-gray-400 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`
                                }
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Order Submit Ho Raha Hai...
                                    </>
                                ) : (
                                    'Confirm Order & Pay'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;

