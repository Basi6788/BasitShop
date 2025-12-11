import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XCircleIcon, Loader2 } from 'lucide-react';
import axios from 'axios'; // Axios zaroor install karein: npm install axios

// 💡 NOTE: Agar aapka backend Vercel/Netlify par hai,
// toh aapko yahan Pura Backend URL dena hoga (e.g., 'https://romeo-backend.vercel.app').
// Agar aapka front-end aur backend same domain par hain (jo ke nahi hain), toh sirf '/api' kaafi hai.
// Maine yahan ek Environment Variable ka istemal kiya hai jo Production ke liye behtar hai.
// Apne .env file mein BASE_API_URL set karein!
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://romeo-backend.vercel.app'; // Default local

// Product suggestion type (jo backend se aayega)
interface ProductSuggestion {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface SearchBarProps {
    initialQuery?: string;
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]); // API se aane wala data
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Debounce ke liye

    // 1. 🔍 API Se Data Fetching ka Logic
    const fetchSuggestions = useCallback(async (searchTerm: string) => {
        if (searchTerm.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Aapka backend endpoint: /api/products/search?q=<query>
            const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
                params: { q: searchTerm.trim() }
            });

            // Backend se aane wala data response.data.results mein hoga
            if (response.data && Array.isArray(response.data.results)) {
                // Sirf pehle 5 results dikhao, jaisa pehle tha
                setSuggestions(response.data.results.slice(0, 5));
            } else {
                setSuggestions([]);
            }

        } catch (err) {
            console.error('Search API call failed:', err);
            // Error handling ko behtar karne ke liye
            if (axios.isAxiosError(err) && err.response && err.response.status === 400) {
                 setError('Search query invalid hai.');
            } else {
                 setError('Backend se suggestions laane mein network error aaya.');
            }
            setSuggestions([]);

        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. ⏳ Debounce Effect (Taake har key press par API call na ho)
    useEffect(() => {
        // Purana timeout clear karo
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length >= 2) {
            // 300ms ke intezar ke baad API call karo
            debounceTimeout.current = setTimeout(() => {
                fetchSuggestions(trimmedQuery);
            }, 300);
        } else if (trimmedQuery.length === 0) {
            setSuggestions([]);
        }

        // Cleanup function (Component unmount hone par ya useEffect dobara chalne par)
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query, fetchSuggestions]);


    // Search button ya Enter press hone par
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const finalQuery = query.trim();
        if (finalQuery) {
            setIsFocused(false);
            navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
            inputRef.current?.blur();
        }
    };

    // Suggestion par click karne par
    const handleSuggestionClick = (suggestionName: string) => {
        setQuery(suggestionName);
        setIsFocused(false);
        navigate(`/search?q=${encodeURIComponent(suggestionName)}`);
        inputRef.current?.blur();
    };
    
    // Suggestion tab kab dikhega?
    const showSuggestions = isFocused && (suggestions.length > 0 || isLoading || error);


    return (
        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-200">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    // Blur par thoda delay do taa ke suggestion click ho sake
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} 
                    placeholder="Products search karein..."
                    className="w-full p-3 pl-4 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    disabled={isLoading}
                />
                
                {query && (
                    <button 
                        type="button" 
                        onClick={() => setQuery('')} 
                        className="p-2 text-gray-400 hover:text-red-500"
                        aria-label="Clear search"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}

                <button
                    type="submit"
                    className={"p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg disabled:bg-purple-400 transition-colors btn-animated"}
                    disabled={!query.trim()}
                    aria-label="Search"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <SearchIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                    
                    {isLoading && (
                        <div className="p-3 text-center text-purple-500 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Search ho raha hai...
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-center text-red-500">
                            Error: {error}
                        </div>
                    )}
                    
                    {/* Sirf tab dikhao jab loading aur error na ho aur suggestions hon */}
                    {!isLoading && !error && suggestions.length > 0 && (
                        <>
                            {suggestions.map((product, index) => (
                                <div
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product.name)} // Naam par click kar ke search ho
                                    className="p-3 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                                >
                                    <span className='truncate'>
                                        <SearchIcon className="w-4 h-4 mr-2 inline text-purple-500" />
                                        {product.name}
                                    </span>
                                    <span className='text-sm text-gray-500 dark:text-gray-400 ml-4 whitespace-nowrap'>
                                        Rs. {product.price.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            {/* Enter press karne ki instruction */}
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 text-center">
                                <kbd className="font-semibold">Enter</kbd> ya suggestion par click karein
                            </div>
                        </>
                    )}

                    {!isLoading && !error && suggestions.length === 0 && query.length >= 2 && (
                         <div className="p-3 text-center text-gray-500">
                             Koi product nahi mila.
                        </div>
                    )}
                </div>
            )}
        </form>
    );
}

