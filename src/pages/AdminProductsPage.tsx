// Path: src/pages/AdminProductsPage.tsx
import React, { useState, useEffect } from "react";

// Aapka Backend URL
const API_URL = "https://romeobackend.netlify.app/products";

export function AdminProductsPage() {
  // Dummy data hata diya, ab empty array se start hoga
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  // 1. Backend se Products mangwana (Fetch)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // Agar backend { success: true, products: [...] } bhej raha hai to data.products karein,
      // filhal direct array assume kar rahe hain.
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products from backend");
    } finally {
      setLoading(false);
    }
  };

  // Page load hone par data laye ga
  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Naya Product Add karna (POST)
  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return alert("Please fill all fields!");

    try {
      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Add hone ke baad list refresh karein
        await fetchProducts();
        setNewProduct({ name: "", price: "", stock: "" });
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // 3. Product Delete karna (DELETE)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Delete hone ke baad list refresh karein
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-400">🛍 Admin Products</h1>

      <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            className="p-2 rounded bg-gray-700 outline-none text-white"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            className="p-2 rounded bg-gray-700 outline-none text-white"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            className="p-2 rounded bg-gray-700 outline-none text-white"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
        </div>
        <button
          onClick={handleAdd}
          className={"mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg btn-animated"}
        >
          ➕ Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading products from backend...</p>
      ) : (
        <table className="w-full text-left border-collapse border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price ($)</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No products found in backend.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                // Backend usually sends '_id' instead of 'id'
                <tr key={product._id || product.id} className="border-t border-gray-700">
                  <td className="p-3 text-sm text-gray-400 truncate max-w-[100px]">
                    {product._id || product.id}
                  </td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.price}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(product._id || product.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
