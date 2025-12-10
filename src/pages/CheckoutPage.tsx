// Path: /src/pages/CheckoutPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeftIcon } from 'lucide-react';

interface FormData { name: string; email: string; address: string; city: string; postalCode: string; phone: string; }
interface CheckoutItem { id: string; name: string; price: number; quantity: number; selectedColor?: string; selectedStorage?: string; }

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const cartContext = useCart();
    
    if (!cartContext) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p className="text-lg">Cart context available nahi hai.</p></div>;

    // Buy It Now ya Cart se item determine karna
    const singleProduct: CheckoutItem | undefined = location.state?.singleProduct;
    const checkoutItems = singleProduct ? [singleProduct] : cartContext.cartItems as CheckoutItem[];
    const isSingleItemCheckout = !!singleProduct;

    const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "", email: "", address: "", city: "", postalCode: "", phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProceedToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!checkoutItems.length) {
            console.log("Empty!");
            return;
        }

        // Data ko PaymentPage par forward karna (sari details)
        navigate('/payment', {
            state: {
                deliveryDetails: formData, // User ki enter ki gayi details
                cartItems: checkoutItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    options: { color: item.selectedColor, storage: item.selectedStorage },
                })),
                orderSummary: { total: totalAmount },
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8 px-3">
            <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-lg p-6">
                
                {/* Back Link */}
                <Link 
                    to={isSingleItemCheckout ? `/details/${singleProduct.id}` : "/cart"} 
                    className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Wapas {isSingleItemCheckout ? 'Product Details' : 'Cart'} Par Jayen
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-center">Checkout (1/2)</h1>

                <form onSubmit={handleProceedToPayment} className="space-y-6">
                    
                    {/* --- 1. Order Summary (Product Details) --- */}
                    <div className="p-4 bg-gray-700 rounded-xl shadow-inner">
                        <h2 className="text-xl font-semibold mb-3 border-b border-gray-600 pb-2 text-white">Aapka Order</h2>
                        {checkoutItems.length > 0 ? (
                            checkoutItems.map((item: any) => (
                                <div key={item.id} className="flex flex-col md:flex-row justify-between text-sm py-2 border-b border-gray-600 last:border-b-0">
                                    <span className="font-medium text-gray-300">
                                        {item.name} <span className="text-yellow-400">x {item.quantity}</span>
                                        {(item.selectedColor || item.selectedStorage) && (
                                            <span className="ml-2 text-gray-500 text-xs">({item.selectedColor}, {item.selectedStorage})</span>
                                        )}
                                    </span>
                                    <span className="font-bold text-lg text-green-400">
                                        Rs {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">Cart khaali hai.</p>
                        )}
                        <hr className="my-3 border-gray-600" />
                        <p className="text-right font-bold text-2xl text-green-300">Total: Rs {totalAmount.toFixed(2)}</p>
                    </div>


                    {/* --- 2. Delivery Details Form --- */}
                    <h2 className="text-xl font-semibold text-white pt-4">Delivery Information</h2>
                    {Object.keys(formData).map((key) => {
                        const field = key as keyof FormData;
                        return (
                            <input
                                key={field}
                                name={field}
                                type={field === "email" ? "email" : (field === "phone" ? "tel" : "text")}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                                value={formData[field]}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        );
                    })}

                    <button
                        type="submit"
                        disabled={loading || checkoutItems.length === 0}
                        className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${
                            loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50"
                        }`}
                    >
                        {loading ? "Processing..." : "Proceed to Payment (Step 2)"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;

