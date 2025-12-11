import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon, XCircleIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { ProductCard, Product } from '../components/ProductCard'; 

// 💡 FIX 1: Correct Backend URL Setup.
// Hamesha base URL (jo aapne Vercel/Netlify par deploy kiya hai)
// aur endpoint alag-alag define karein.
// Aapka backend Vercel ya Netlify par hai, toh woh full URL dein.
const API_BASE_URL = 'https://romeo-backend.vercel.app'; // Ya aapka Netlify URL
const SEARCH_ENDPOINT = '/api/products/search'; // Yeh aapke backend index.js mein hai

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rawSearchTerm: string = searchParams.get('q') || '';
    const searchTerm: string = rawSearchTerm.trim();

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchTerm) {
                setLoading(false);
                setResults([]);
                return;
            }

            // 💡 FIX: Yeh URL ab theek se banega: https://romeo-backend.vercel.app/api/products/search
            const fullUrl = `${API_BASE_URL}${SEARCH_ENDPOINT}`; 

            try {
                setLoading(true);
                setError(null);
                setResults([]);

                const response = await axios.get(fullUrl, {
                    params: { q: searchTerm }, // Query param ko params object mein bhejna behtar hai
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000, // 10 second ka timeout
                });

                // 💡 FIX 2: Backend Response Structure Check
                // Aapka backend code (/api/products/search) yeh structure return karta hai:
                // { success: true, query: q, count: results.length, results: [...] }
                // Aur aapka code response.data.products dhoondh raha tha.
                if (response.data && Array.isArray(response.data.results)) {
                    // Sahi property se data uthayein
                    setResults(response.data.results);
                } else if (response.data && Array.isArray(response.data)) {
                    // Agar backend ne sirf array return kiya (jo /api/products karta hai)
                    setResults(response.data);
                } else {
                    // Agar structure galat ho ya empty ho
                    setResults([]);
                }
                
                // Agar data mila lekin array empty ho
                if(response.data.count === 0 || setResults.length === 0){
                    setError(null); // Agar 0 results hon toh error nahi hona chahiye
                }

            } catch (err: any) {
                console.error('Search API Error:', err.response || err);
                
                let errorMessage = 'Server se response nahi mila. Thodi der baad try karein.';
                
                if (axios.isAxiosError(err)) {
                     if (err.response) {
                        // Agar 400 Bad Request ya 404 Not Found jaisa status aaya ho
                        errorMessage = err.response.data.message || `Server Error (${err.response.status}).`;
                    } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
                        // Agar connection timeout hua ho ya network error ho
                        errorMessage = 'Network connection fail ho gaya ya backend server down hai.';
                    }
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchTerm]);

    // --- Content Rendering Logic (No changes needed here) ---

    let content;

    if (loading) {
        content = (
            <div className="flex flex-col justify-center items-center h-48 dark:text-gray-300">
                <Loader2 className="w-8 h-8 text-purple-500 dark:text-cyan-400 animate-spin mb-3" />
                <p>Products search kiye ja rahe hain...</p>
            </div>
        );
    } else if (error) {
        content = (
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700">
                <AlertTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Error</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
            </div>
        );
    } else if (!searchTerm) {
        content = (
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700">
                <AlertTriangleIcon className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Koi Search Query Nahi</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Upar (Header mein) search bar use karein.</p>
            </div>
        );
    } else if (results.length > 0) {
        content = (
            <div className="mb-8">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    Aapki query se <b>{results.length}</b> item(s) milay hain.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        );
    } else {
        content = (
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700">
                <XCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Koi Results Nahi Mila</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    <span className="font-medium text-red-600 dark:text-red-400">"{searchTerm}"</span> ke liye koi products nahi milay.
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Kisi aur keyword se try karein.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700 pt-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Search Ke Nataij (Results)
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center">
                        <SearchIcon className="w-5 h-5 mr-2 text-purple-500 dark:text-cyan-400" />
                        {searchTerm ? (
                            <>
                                Results for:
                                <span className="font-semibold ml-1 text-purple-600 dark:text-cyan-400 break-all">
                                    "{searchTerm}"
                                </span>
                            </>
                        ) : (
                            <span className="font-medium">Please search from the main navigation header.</span>
                        )}
                    </p>
                </header>

                {content}
            </div>
        </div>
    );
}
