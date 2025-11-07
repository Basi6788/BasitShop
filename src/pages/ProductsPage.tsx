// Path: /src/pages/ProductsPage.tsx
import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Product } from '../data/products'; // Product type ko import karein

// FIX: Backend URL for data fetching
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app'; 

export function ProductsPage() {
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetching logic: Yehi woh jagah hai jahan ghalat URL call ho raha tha
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                // FIX: Ab yeh call sirf /products endpoint ko karega
                const url = `${BACKEND_URL}/api/products`; 
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorDetail = `HTTP Error: ${response.status} ${response.statusText}. URL: ${url}`;
                    throw new Error(errorDetail);
                }
                
                const data: Product[] = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format: Expected an array of products.");
                }

                setProducts(data);
                setError(null);
            } catch (err: any) {
                console.error("All products fetch karte waqt error aaya:", err);
                let userMessage = "Products load nahi ho sake. Please internet connection check karein ya thori der baad try karein.";
                
                if (err.message.includes("Failed to fetch")) {
                    userMessage = "Network error: API se connect nahi ho saka. Backend deployment check karein.";
                } else if (err.message.includes("HTTP Error: 404")) {
                    // Ye wohi error hai jo aapke screenshot mein aa raha tha
                    userMessage = `Error: API endpoint not found: /api/products (Front-end abhi bhi ghalat URL call kar raha hai).`;
                }
                
                setError(userMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] dark:bg-[#0A0D18] text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-cyan-400"></div>
                <p className="ml-4 text-xl dark:text-cyan-400">Sabhi products load ho rahe hain...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 dark:bg-[#0A0D18] min-h-[400px]">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Error</h2>
                <p className="dark:text-gray-300 max-w-lg mx-auto leading-relaxed">{error}</p>
            </div>
        );
    }


    return (
        <div className="w-full py-10 px-6 bg-white dark:bg-[#0A0D18] text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-10 border-b pb-4 border-gray-200 dark:border-cyan-900">
                    All Products ({products.length})
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link 
                            key={product.id} 
                            to={`/details/${product.id}`} 
                            className="group block h-full"
                        > 
                            <ProductCard 
                                product={product} 
                                // Placeholder for wishlist, addToCart etc. functionality
                                isWishlisted={false}
                                onToggleWishlist={() => console.log('Wishlist toggle')}
                                onAddToCart={() => console.log('Add to cart')}
                                onBuyNow={() => console.log('Buy now')}
                            />
                        </Link>
                    ))}
                </div>
                {products.length === 0 && (
                    <p className="text-center text-xl text-gray-500 dark:text-gray-400 mt-10">
                        Koi products nahi milay. Kya aapke database mein data hai?
                    </p>
                )}
            </div>
        </div>
    );
}


