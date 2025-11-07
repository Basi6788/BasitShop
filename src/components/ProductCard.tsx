// Path: /src/components/ProductCard.tsx
import React, { useState } from "react";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleImageError = () => setImageError(true);
  const handleLikeToggle = () => setLiked(!liked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden shadow-lg transition-all duration-500 
      bg-white text-black dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800"
    >
      {/* Product Image Section */}
      <div className="relative bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-4">
        {imageError || !product.imageUrl ? (
          <div className="text-gray-400 text-center p-6">
            <ImageOff className="w-10 h-10 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-semibold">Image failed to load.</p>
          </div>
        ) : (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-48 sm:h-60 object-contain rounded-xl transition-transform duration-500 hover:scale-105"
          />
        )}

        {/* Heart Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/70 dark:bg-white/20 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/40 transition"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-300 ${
              liked
                ? "fill-red-500 text-red-500"
                : "text-gray-700 dark:text-gray-200"
            }`}
          />
        </motion.button>

        {/* Best Seller Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-green-100 dark:bg-green-700/30 text-green-600 dark:text-green-300 text-xs font-semibold">
          Best Seller
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col h-full">
        <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {product.description || "No description available."}
        </p>

        <div className="mt-auto flex justify-between items-center">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            ${product.price.toFixed(2)}
          </p>

          {/* Buy Now Button (keeps same functionality) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onAddToCart(product._id)}
            className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black 
            px-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-300 hover:opacity-90"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};