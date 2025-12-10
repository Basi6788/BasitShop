import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon, XCircleIcon, AlertTriangleIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { ProductCard, Product } from '../components/ProductCard'; 

const BACKEND_URL = 'https://romeobackend.netlify.app/api/products/search';

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

            try {
                setLoading(true);
                setError(null);
                setResults([]);

                const response = await axios.get(`${BACKEND_URL}?q=${encodeURIComponent(searchTerm)}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.data && Array.isArray(response.data.products)) {
                    setResults(response.data.products);
                } else if (Array.isArray(response.data)) {
                    // fallback if backend returns a direct array
                    setResults(response.data);
                } else {
                    setResults([]);
                }
            } catch (err: any) {
                console.error('Search API Error:', err);
                setError('Server se response nahi mila. Thodi der baad try karein.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchTerm]);

    // --- Content Rendering Logic ---

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
