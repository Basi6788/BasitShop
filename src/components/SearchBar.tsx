import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XCircleIcon } from 'lucide-react';

// Mock Data (Sirf suggestions ke liye, Product type ki zaroorat nahi)
const MOCK_PRODUCT_NAMES = [
    'BAST Giga-Flow Headset',
    'Smart Ring Device',
    'Mini Projector Pro',
    'Wireless Keyboard',
    'Flow Charging Cable (USB-C)',
    'Giga Mouse Pro',
    'Smart Watch X',
    'Portable SSD 1TB',
];

interface SearchBarProps {
    initialQuery?: string; // Agar URL se koi pehle se query ho toh
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false); // Dropdown kab dikhana hai
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Live filtering for suggestions
    const suggestions = useMemo(() => {
        if (query.trim().length < 2) return []; // Kam se kam 2 letters par suggestions dikhao

        const lowerCaseQuery = query.toLowerCase().trim();

        // Har word ke shuruat mein ya product name mein kaheen bhi match karo
        return MOCK_PRODUCT_NAMES
            .filter(name => 
                name.toLowerCase().includes(lowerCaseQuery) || // Kahin bhi match
                name.toLowerCase().startsWith(lowerCaseQuery) // Shuruat mein match
            )
            .slice(0, 5); // Sirf pehle 5 suggestions dikhao

    }, [query]);

    // Search button ya Enter press hone par
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsFocused(false); // Suggestions band karo
            // URL ko update karo aur SearchPage ko trigger karo
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            inputRef.current?.blur(); // Input se focus hatao
        }
    };

    // Suggestion par click karne par
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setIsFocused(false);
        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
        inputRef.current?.blur();
    };

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
                    <SearchIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && query.trim() && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <SearchIcon className="w-4 h-4 mr-2 inline text-purple-500" />
                            {suggestion}
                        </div>
                    ))}
                    {/* Enter press karne ki instruction */}
                    <div className="p-2 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 text-center">
                        <kbd className="font-semibold">Enter</kbd> press karein ya click karein
                    </div>
                </div>
            )}
        </form>
    );
}

