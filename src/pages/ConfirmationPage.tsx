// Path: /src/pages/ConfirmationPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, BanknoteIcon } from 'lucide-react';

export const ConfirmationPage = () => {
    const location = useLocation();
    const state = location.state || {};
    
    // Data received from PaymentPage
    const message = state.message || 'Order Received'; 
    const method = state.method;
    const orderId = state.orderId || 'N/A';
    const orderSummary = state.orderSummary;
    const deliveryDetails = state.deliveryDetails;
    const cartItems = state.cartItems;
    const transactionId = state.transactionId;
    
    let IconComponent = CheckCircleIcon;
    let iconColor = 'text-green-500';
    let statusText = 'Order Confirmed';
    
    if (method === 'cod') {
        IconComponent = ClockIcon; 
        iconColor = 'text-orange-500';
        statusText = 'Order Place Ho Chuka Hai (Payment Pending)';
    } else if (['jazzcash', 'easypaisa'].includes(method) || orderId.startsWith('TEMP-')) { // TEMP- ID bhi pending/review hai
        IconComponent = ClockIcon; 
        iconColor = 'text-blue-500';
        statusText = 'Payment Under Review';
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
            <main className="max-w-4xl mx-auto py-10">
                <div className="text-center mb-10">
                    <IconComponent className={`w-24 h-24 mx-auto ${iconColor} mb-6 animate-bounce`} />
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {statusText}
                    </h1>
                    
                    <p className="text-xl font-medium text-gray-700 dark:text-gray-300 max-w-lg mx-auto mb-4">
                        {message}
                    </p>

                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner inline-block">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Aapka Order ID: 
                            <span className="text-purple-600 dark:text-purple-400 ml-2">{orderId}</span>
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* --- Delivery Details --- */}
                    {deliveryDetails && (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-indigo-500">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-indigo-500" /> Delivery Details
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold flex items-center"><UserIcon className='w-4 h-4 mr-2' />Name:</span> {deliveryDetails.name}</p>
                            <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold flex items-center"><PhoneIcon className='w-4 h-4 mr-2' />Phone:</span> {deliveryDetails.phone}</p>
                            <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Address:</span> {deliveryDetails.address}, {deliveryDetails.city}</p>
                        </div>
                    )}

                    {/* --- Payment & Total Summary --- */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-green-500">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BanknoteIcon className="w-5 h-5 mr-2 text-green-500" /> Payment Summary
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold">Method:</span> {method === 'cod' ? 'Cash on Delivery' : method?.toUpperCase()}</p>
                        {transactionId && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2 break-all"><span className="font-semibold">Txn ID:</span> <span className="text-yellow-500">{transactionId}</span></p>
                        )}
                        <hr className="my-3 border-gray-700" />
                        <p className="text-3xl font-bold text-right text-green-600 dark:text-green-400">
                            Total: Rs {orderSummary ? Number(orderSummary.total).toFixed(2) : 'N/A'}
                        </p>
                    </div>

                    {/* --- Order Items --- */}
                    {cartItems && (
                        <div className="md:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ordered Items</h2>
                            {cartItems.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {item.name} x {item.quantity}
                                    </span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                                        Rs {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                <div className="text-center mt-10">
                    <Link 
                        to="/" 
                        className="inline-flex items-center justify-center bg-purple-600 text-white p-4 rounded-full font-semibold hover:bg-purple-700 transition duration-300 text-lg transform hover:scale-105"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Home Page Par Wapas Jayen
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default ConfirmationPage;

