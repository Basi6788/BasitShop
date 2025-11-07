// Path: /src/pages/ProductsPage.tsx
import React, { useState, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { Link } from "react-router-dom";
import { Product } from "../data/products";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://romeo-backend.vercel.app";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const url = `${BACKEND_URL}/api/products`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data: Product[] = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format.");

        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("Fetch error:", err);
        let message = "Products load nahi ho sake. Internet check karein.";
        if (err.message.includes("Failed to fetch")) {
          message = "Network error: API connect nahi ho saka.";
        } else if (err.message.includes("404")) {
          message = "Error: API endpoint not found (/api/products).";
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white dark:bg-[#0A0D18]">
        <motion.div
          className="rounded-full h-12 w-12 border-b-4 border-indigo-500 dark:border-cyan-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <p className="ml-4 text-lg dark:text-cyan-400 font-medium">
          Products load ho rahe hain...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 dark:bg-[#0A0D18] min-h-[400px]">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Error</h2>
        <p className="dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-6 bg-gray-50 dark:bg-[#0A0D18] text-gray-900 dark:text-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center border-b pb-4 border-gray-200 dark:border-gray-700">
          Products ({products.length})
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            "All Products",
            "Most Purchased",
            "Furniture",
            "Shoes",
            "Clothes",
            "Electronic",
            "Sports",
            "Grocery",
          ].map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-white dark:bg-[#101422] shadow-sm dark:shadow-cyan-900/20 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/details/${product.id}`}
                  className="group block h-full"
                >
                  <ProductCard
                    product={product}
                    isWishlisted={false}
                    onToggleWishlist={() => console.log("Wishlist toggle")}
                    onAddToCart={() => console.log("Add to cart")}
                    onBuyNow={() => console.log("Buy now")}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {products.length === 0 && (
          <p className="text-center text-xl text-gray-500 dark:text-gray-400 mt-10">
            Koi products nahi milay. Database check karein.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;