// Path: src/pages/AdminProductsPage.tsx
import React, { useState } from "react";

export function AdminProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "Wireless Headphones", price: 120, stock: 24 },
    { id: 2, name: "Smart Watch", price: 90, stock: 12 },
    { id: 3, name: "Gaming Mouse", price: 45, stock: 50 },
  ]);

  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return alert("Please fill all fields!");
    const newItem = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
    };
    setProducts([...products, newItem]);
    setNewProduct({ name: "", price: "", stock: "" });
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
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
            className="p-2 rounded bg-gray-700 outline-none"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            className="p-2 rounded bg-gray-700 outline-none"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            className="p-2 rounded bg-gray-700 outline-none"
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
          {products.map((product) => (
            <tr key={product.id} className="border-t border-gray-700">
              <td className="p-3">{product.id}</td>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.price}</td>
              <td className="p-3">{product.stock}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
