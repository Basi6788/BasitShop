// Path: /src/components/ProductCard.tsx
import React, { useState } from 'react';
import { ShoppingCart, Heart, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Interface for a single product (assumed from admin data)
interface Product {
  _id: string; // Assuming MongoDB ID
  name: string;
  price: number;
  description: string;
  imageUrl: string; // The URL that is failing
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // State to track if the image failed to load
  const [imageError, setImageError] = useState(false);

  // Function to handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-800 flex flex-col"
    >
      {/* Product Image Section */}
      <div className="relative h-48 sm:h-64 bg-neutral-800 flex items-center justify-center">
        {/* FIX: If imageError is true or imageUrl is missing, show fallback */}
        {imageError || !product.imageUrl ? (
          <div className="text-gray-400 text-center p-4">
            <ImageOff className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-semibold">Image failed to load.</p>
            <p className="text-xs text-gray-500 mt-1">Check backend storage/URL: {product.imageUrl ? product.imageUrl.substring(0, 30) + '...' : 'N/A'}</p>
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            onError={handleImageError} // CRUCIAL: Error handler added
            loading="lazy"
          />
        )}
        <button className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-3 flex-grow">{product.description || "No description provided."}</p>
        
        <div className="mt-auto flex justify-between items-center pt-3 border-t border-neutral-800">
          <p className="text-2xl font-extrabold text-indigo-400">${product.price.toFixed(2)}</p>
          <button
            onClick={() => onAddToCart(product._id)}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transition-all duration-300 shadow-md flex items-center gap-1 text-sm font-semibold"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className='hidden sm:inline'>Add to Cart</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// END OF FILE

