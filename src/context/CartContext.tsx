import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";

// Backend URL
const BACKEND_URL = "https://romeo-backend.vercel.app";

// Cart Item Interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
}

// Context Type Interface
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  getCartTotal: () => number;
  refreshCart: () => Promise<void>;
}

// Default Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ Cart Provider
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Fetch cart items
  const refreshCart = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/cart`);
      if (res.data && Array.isArray(res.data)) {
        setCartItems(res.data);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  // Add item
  const addToCart = async (item: CartItem) => {
    try {
      const existing = cartItems.find(i => i.id === item.id);
      if (existing) {
        await updateQuantity(item.id, existing.quantity + 1);
      } else {
        await axios.post(`${BACKEND_URL}/api/cart/add`, { ...item, quantity: 1 });
        await refreshCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Remove item
  const removeFromCart = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/cart/remove/${id}`);
      await refreshCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/cart/clear`);
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Update quantity
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
      } else {
        await axios.put(`${BACKEND_URL}/api/cart/update/${id}`, { quantity });
        await refreshCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // ✅ Total calculation function
  const getCartTotal = (): number => {
    return cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCartTotal,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
