import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { motion } from "framer-motion";
import { Trash2Icon, PlusIcon, MinusIcon, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const dummyAuth = () => {};

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 15 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <Header onSearch={setSearchTerm} isAuthenticated={false} userName={null} onLogin={dummyAuth} onLogout={dummyAuth} />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center py-32 px-6"
        >
          <ShoppingCart className="w-20 h-20 text-purple-500 dark:text-cyan-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Aapki Cart Khaali Hai!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Kuch behtareen products daal kar shopping shuru karein.
          </p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-md hover:scale-105 transition"
          >
            Shopping Shuru Karein
          </Link>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <Header onSearch={setSearchTerm} isAuthenticated={false} userName={null} onLogin={dummyAuth} onLogout={dummyAuth} />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto p-6 py-10 pt-24"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 border-b-4 border-purple-500/50 pb-3">
          Shopping Cart Items ({cartItems.length})
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT */}
          <motion.div variants={containerVariants} className="flex-1 lg:w-3/5 space-y-5">
            {cartItems.map(item => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-between p-5 bg-white/50 dark:bg-gray-800/70 rounded-2xl border border-white/20 shadow-xl"
              >
                <div className="flex items-center w-full sm:w-auto">
                  <Link to={`/details/${item.id}`} className="flex items-center group">
                    <img
                      src={item.imageUrl || item.image || "/placeholder-600x400.png"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl mr-4 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h2>
                      <p className="text-md font-semibold text-purple-600 dark:text-cyan-400">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:space-x-8">
                  <div className="flex items-center border-2 border-purple-300 dark:border-cyan-500 rounded-full overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-3">
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-lg font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-cyan-400 hidden sm:block">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-3 rounded-full">
                    <Trash2Icon className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ))}
            <motion.button onClick={clearCart} className="text-red-500 font-semibold mt-6 flex items-center gap-2">
              <Trash2Icon className="w-5 h-5" /> Poora Cart Khali Karein
            </motion.button>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-2/5 p-8 bg-white/50 dark:bg-gray-800/70 rounded-2xl border border-white/20 shadow-2xl sticky top-24 h-fit"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-lg text-gray-700 dark:text-gray-300 font-medium">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping:</span><span>${shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (10%):</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between pt-5 border-t-4 border-purple-500 text-3xl font-extrabold">
              <span>GRAND TOTAL:</span>
              <span className="text-purple-600 dark:text-cyan-400">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="block text-center mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl font-bold hover:scale-105 transition">
              Proceed to Checkout
            </Link>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
