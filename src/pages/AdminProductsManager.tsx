// Path: /src/pages/AdminProductsManager.tsx
// --- FINAL FIXED VERSION: Safe Number Parsing & Error Handling ---

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, PlusCircle, Edit, Trash2, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

// Backend API URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app';

// --- Interfaces for Product Data (Same) ---
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string; 
    stock: number;
    category: string;
}

// ==================================================================
// --- Utility Components (Product Modal for Add/Edit) ---
// ==================================================================

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> & { id: number }) => void; 
    initialProduct?: Product; 
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialProduct }) => {
    const [productData, setProductData] = useState<Product>(initialProduct || {
        id: 0, name: '', description: '', price: 0, imageUrl: '', stock: 0, category: 'Electronics', 
    });

    useEffect(() => {
        if (initialProduct) {
            setProductData(initialProduct);
        } else {
            setProductData({ id: 0, name: '', description: '', price: 0, imageUrl: '', stock: 0, category: 'Electronics', });
        }
    }, [initialProduct, isOpen]); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // 🟢 FIX 1: Agar type number hai aur value khaali nahi hai, tabhi number mein badlein.
        const parsedValue = type === 'number' && value.trim() !== '' 
            ? parseFloat(value) 
            : value;

        setProductData(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(productData as Omit<Product, 'id'> & { id: number }); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 p-6 rounded-lg w-full max-w-lg border border-cyan-600 shadow-2xl relative"
            >
                <button onClick={onClose} className={"absolute top-3 right-3 text-gray-400 hover:text-white btn-animated"}><XCircle className="w-6 h-6" /></button>
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-purple-700 pb-2 flex items-center">
                    <PlusCircle className="w-6 h-6 mr-2" /> {initialProduct ? `Edit Product (ID: ${initialProduct.id})` : 'Add New Product'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-400 text-sm font-bold mb-1">Product Name</label>
                        <input type="text" id="name" name="name" value={productData.name} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-gray-400 text-sm font-bold mb-1">Description</label>
                        <textarea id="description" name="description" value={productData.description} onChange={handleChange} rows={3} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-gray-400 text-sm font-bold mb-1">Price ($)</label>
                        {/* FIX: Input type number hi rakha, lekin handling handleChange mein ho rahi hai */}
                        <input type="number" id="price" name="price" value={productData.price} onChange={handleChange} step="0.01" required className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-gray-400 text-sm font-bold mb-1">Image URL</label>
                        <input type="text" id="imageUrl" name="imageUrl" value={productData.imageUrl} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-gray-400 text-sm font-bold mb-1">Stock</label>
                        <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-gray-400 text-sm font-bold mb-1">Category</label>
                        <select id="category" name="category" value={productData.category} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="Electronics">Electronics</option>
                            <option value="Apparel">Apparel</option>
                            <option value="Books">Books</option>
                            <option value="Home">Home</option>
                            <option value="AI_Assist">AI_Assist</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className={"px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 text-white btn-animated"}>Cancel</button>
                        <button type="submit" className={"px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 text-white flex items-center btn-animated"}>
                            <PlusCircle className="w-5 h-5 mr-2" /> {initialProduct ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ==================================================================
// --- ⚙️ ADMIN PRODUCTS MANAGER COMPONENT (Final logic fix) ---
// ==================================================================

export function AdminProductsManager() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const authToken = localStorage.getItem('authToken');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        // ... (fetch logic remains the same)
        try {
            const response = await fetch(`${BASE_URL}/api/products`);
            // ... (error handling)
            if (!response.ok) {
                if (response.status === 401) throw new Error("Session expired. Please log in again.");
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            const data = await response.json();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(`Network/API Error: ${err instanceof Error ? err.message : 'Unknown'}`);
            if (err instanceof Error && err.message.includes("Session expired")) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userName');
                navigate('/admin/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!authToken) {
            navigate('/admin/login', { replace: true });
            return;
        }
        fetchProducts();
    }, [authToken, navigate, fetchProducts]);

    // --- Handle Add/Edit Product ---
    const handleSaveProduct = async (product: Omit<Product, 'id'> & { id: number }) => {
        if (!authToken) return;
        
        // 🟢 FIX 2: Data ko API call se pehle theek format mein convert karein
        const submissionData = {
            ...product,
            price: product.price ? Number(product.price) : 0, // Ensure it's a number
            stock: product.stock ? Number(product.stock) : 0,   // Ensure it's a number
        };
        
        // Basic validation for missing data
        if (!submissionData.name || submissionData.price <= 0 || submissionData.stock < 0) {
             alert('Error: Please provide a valid Name, Price (>0), and Stock (>=0).');
             return;
        }

        setLoading(true);

        const method = product.id === 0 ? 'POST' : 'PUT';
        const url = product.id === 0 ? `${BASE_URL}/api/admin/products` : `${BASE_URL}/api/admin/products/${product.id}`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': authToken 
                },
                // Theek kiya hua data bheja
                body: JSON.stringify(submissionData), 
            });

            if (response.ok) {
                fetchProducts(); 
                setIsModalOpen(false);
                setEditingProduct(undefined);
            } else {
                const errorData = await response.json();
                // Specific error message dikhao agar backend se milay
                alert(`Failed to save product: ${errorData.message || response.statusText}`); 
            }
        } catch (error) {
            console.error('Save Product Error:', error);
            // Ab yeh generic message sirf Network ya bahut bada masla hone par dikhega
            alert('An unexpected error occurred while saving the product (Check Network/Server Logs).'); 
        } finally {
            setLoading(false);
        }
    };
    
    // ... (handleDeleteProduct remains the same) ...
    const handleDeleteProduct = async (productId: number) => {
        if (!authToken) return;
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': authToken },
            });

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            } else {
                const errorData = await response.json();
                alert(`Failed to delete product: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Delete Product Error:', error);
            alert('An unexpected error occurred while deleting the product.');
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <Loader className="w-12 h-12 animate-spin text-purple-400" />
                <p className="ml-4 text-xl">Loading Products...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                <XCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                <h1 className="text-3xl font-bold text-red-400">PRODUCT DATA LOAD FAILED</h1>
                <p className="text-lg text-gray-400 mt-2 p-3 bg-gray-800 rounded">{error}</p>
                <button onClick={() => navigate('/admin/login')} className="mt-6 bg-purple-600 p-2 px-4 rounded hover:bg-purple-700 transition">Relogin</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
            <header className="bg-gray-800 p-4 shadow-lg border-b border-purple-900/50 mb-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-cyan-400 flex items-center">
                        <Package className="w-7 h-7 mr-2 text-purple-400" />
                        Product Manager Console
                    </h1>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
                
                <div className="bg-gray-800 p-6 rounded-lg border border-cyan-800/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Product Listings ({products.length} Total)</h2>
                        <button 
                            onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" /> Add Product
                        </button>
                    </div>

                    <p className="text-gray-400 mb-6">Yahan aap products list, add, edit, aur delete kar sakte hain.</p>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-purple-900/50">
                            <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-700">
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-700 transition-colors duration-200">
                                        <td className="p-4"><img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" /></td>
                                        <td className="p-4 text-sm font-medium text-white">{product.name}</td>
                                        <td className="p-4 text-sm text-green-400">${product.price.toFixed(2)}</td>
                                        <td className="p-4 text-sm text-yellow-400">{product.stock}</td>
                                        <td className="p-4 text-sm text-gray-300">{product.category}</td>
                                        <td className="p-4 flex items-center space-x-2">
                                            <button 
                                                onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                                className="text-blue-400 hover:text-blue-300 p-2 rounded-md"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-400 hover:text-red-300 p-2 rounded-md"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && !loading && (<p className="p-6 text-center text-gray-500">No products listed yet.</p>)}
                    </div>
                </div>
            </main>

            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProduct(undefined); }}
                onSave={handleSaveProduct}
                initialProduct={editingProduct}
            />
        </div>
    );
}

