// Path: /src/pages/DetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, ZapIcon, StarIcon, MinusIcon, PlusIcon, CheckCircleIcon } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Cart context import karein
import { Product } from '../data/products'; 

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app'; 

export function DetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const cartContext = useCart();

    if (!cartContext) {
        return <div className="text-center p-10 min-h-screen dark:bg-gray-900 dark:text-white pt-20">Cart context missing.</div>;
    }
    const { addItem } = cartContext;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedStorage, setSelectedStorage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    
    // Data Fetching Effect (Backend se data fetch karna)
    useEffect(() => {
        if (!id) { setError("Error: Product ID is missing in the URL."); setLoading(false); return; }

        const fetchProductDetails = async () => {
            setLoading(true); setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/products/${id}`);
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                const data: Product = await response.json();
                
                setProduct(data);
                if (data.colorOptions && data.colorOptions.length > 0) setSelectedColor(data.colorOptions[0]);
                if (data.storageOptions && data.storageOptions.length > 0) setSelectedStorage(data.storageOptions[0]);
            } catch (err: any) {
                console.error("Product details fetch karte waqt error aaya:", err);
                setError("Data load nahi ho saka. Backend connection check karein.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    // ... (Loading and Error UI blocks) ...
    if (loading) { return ( <div className="flex justify-center items-center min-h-[500px] dark:bg-gray-900 text-center pt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-cyan-400"></div><p className="ml-4 text-xl dark:text-cyan-400">Product ki tafseelat load ho rahi hain...</p></div> ); }
    if (error || !product) { return ( <div className="text-center p-10 min-h-screen dark:bg-gray-900 dark:text-white pt-20"><h1 className="text-3xl font-bold text-red-500">Error!</h1><p className="mt-4">{error || "Product data load karne mein masla hua hai."}</p><Link to="/" className="text-indigo-600 hover:underline mt-4 block">Home Page par wapas jaayen</Link></div> ); }
    
    const isWishlisted = false;
    const maxStock = product.stock || 99;

    // Quantity Handlers
    const handleQuantityChange = (delta: number) => {
        setQuantity(prevQ => {
            const newQ = prevQ + delta;
            return Math.max(1, Math.min(maxStock, newQ));
        });
    };
    
    // Add to Cart Logic
    const handleAddToCart = () => {
        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            selectedColor: selectedColor,
            selectedStorage: selectedStorage,
        };
        addItem(itemToAdd); 
        console.log(`Added ${quantity} x ${product.name} to cart.`);
    };

    // FIX: Buy It Now Logic: Data ko navigate state mein pass karna
    const handleBuyItNow = () => {
        const productToBuy = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity, // Current quantity
            selectedColor: selectedColor,
            selectedStorage: selectedStorage,
        };
        
        // Data ko 'singleProduct' key ke saath CheckoutPage tak bhejein
        navigate('/checkout', { 
            state: { 
                singleProduct: productToBuy
            } 
        });
    };

    return (
        <div className="min-h-screen dark:bg-gray-900 dark:text-gray-200 pt-20 md:pt-10">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    
                    {/* --- 1. Product Image & Gallery --- */}
                    <div className="relative">
                        <img 
                            src={product.imageUrl || product.image || 'https://placehold.co/600x400/0A0D18/9ca3af?text=Image+Missing'} 
                            alt={product.name} 
                            className="w-full h-auto object-cover rounded-xl shadow-2xl transition-all duration-500 transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex space-x-3 mt-4 overflow-x-auto">
                            {[1, 2, 3].map((i) => (
                                <img 
                                    key={i} 
                                    src={product.imageUrl || product.image || `https://placehold.co/80x80/0A0D18/9ca3af?text=Img${i}`} 
                                    alt={`Gallery ${i}`} 
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition"
                                />
                            ))}
                        </div>
                    </div>

                    {/* --- 2. Product Details & Purchase Options --- */}
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">{product.name}</h1>
                        
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex text-yellow-500">
                                {Array(Math.round(product.rating || 4)).fill(0).map((_, i) => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                                {Array(5 - Math.round(product.rating || 4)).fill(0).map((_, i) => <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />)}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">({product.reviews || 0} Reviews)</span>
                        </div>

                        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 border-b pb-4 dark:border-gray-700">
                            Rs {(product.price || 0).toFixed(2)}
                        </p>

                        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                            {product.description || 'No detailed description provided for this product.'}
                        </p>

                        {/* Options: Color */}
                        {product.colorOptions?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2 dark:text-white">Color: <span className="font-normal">{selectedColor}</span></h3>
                                <div className="flex space-x-3">
                                    {product.colorOptions.map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 shadow-md`}
                                            style={{ 
                                                backgroundColor: color.toLowerCase().replace(/\s/g, ''), 
                                                borderColor: selectedColor === color ? 'rgb(99, 102, 241)' : 'transparent',
                                                transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                            aria-label={`Select color ${color}`}
                                        >
                                            {selectedColor === color && <CheckCircleIcon className="w-full h-full p-0.5 text-white/50" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Options: Storage */}
                        {product.storageOptions?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2 dark:text-white">Storage:</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.storageOptions.map(storage => (
                                        <button 
                                            key={storage} 
                                            onClick={() => setSelectedStorage(storage)}
                                            className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 
                                                        ${selectedStorage === storage 
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-indigo-400'
                                                        }`}
                                        >
                                            {storage}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector (+/- buttons) */}
                        <div className="flex items-center space-x-4 mb-6">
                            <h3 className="text-lg font-semibold dark:text-white">Quantity:</h3>
                            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1 border border-gray-600">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="p-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition disabled:bg-gray-500"
                                >
                                    <MinusIcon className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-bold text-lg text-white">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= maxStock}
                                    className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:bg-gray-500"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            {(product.stock !== undefined && product.stock <= 5 && product.stock > 0) && (
                                <span className="text-sm text-yellow-500 font-medium">Only {product.stock} left in stock!</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            
                            {/* Add to Cart Button */}
                            <button 
                                onClick={handleAddToCart}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 
                                           font-semibold rounded-full transition duration-300
                                           ${(product.stock || 0) > 0
                                             ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/50' 
                                             : 'bg-gray-400 text-gray-800 cursor-not-allowed'
                                           }`}
                                disabled={(product.stock || 0) <= 0}
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                <span>{(product.stock || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                            </button>

                            {/* Buy It Now Button */}
                            <button 
                                onClick={handleBuyItNow}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 
                                           font-semibold rounded-full transition duration-300
                                           ${(product.stock || 0) > 0 
                                             ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-xl shadow-pink-500/50' 
                                             : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                           }`}
                                disabled={(product.stock || 0) <= 0}
                            >
                                <ZapIcon className="w-5 h-5 fill-current" />
                                <span>Buy It Now</span>
                            </button>
                            
                            {/* Wishlist Button */}
                            <button 
                                className={`p-3 rounded-full border transition duration-300 
                                            ${isWishlisted ? 'bg-pink-100 border-pink-500 text-pink-500' : 'border-gray-300 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                aria-label="Add to Wishlist"
                            >
                                <HeartIcon className={`w-6 h-6 ${isWishlisted ? 'fill-pink-500' : ''}`} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

