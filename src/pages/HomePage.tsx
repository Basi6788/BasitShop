import AnimatedButton from '../components/AnimatedButton';
// Path: /src/pages/HomePage.tsx
// --- FINAL FIX: Background Overrides Removed, Full Dark/Light Toggle Working ---

import React, { useState, useEffect, useRef } from 'react'; // Added useEffect and useState
import { ProductCard } from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { useInView } from 'react-intersection-observer'; 
import { 
  Truck, 
  ShieldCheck, 
  Cpu, 
  Headphones, 
  Keyboard, 
  Mouse,
  CreditCard,
  Zap,
} from 'lucide-react';

// --- Central data se Product Type import karein ---
import { Product } from '../data/products'; 

// --- Cart Context import karein ---
import { useCart } from '../context/CartContext'; 

// Backend URL constant (FRONTEND SIDE: Base URL)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeobackend.netlify.app/';

// ==================================================================
// --- 🌟 ANIMATION HELPER (No Change) ---
// ==================================================================
interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({ children, className, delay = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ 
        type: "tween",
        ease: "easeOut",
        duration: 0.5,
        delay: delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==================================================================
// --- 🔥 MAIN HOME PAGE COMPONENT ---
// ==================================================================
export function HomePage() {
  
  // State for fetched products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<string[]>([]); 
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart(); 
  
  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // FIX: Ab yeh call sirf /products endpoint ko karega (Jo index.js mein fix ho chuka hai)
        const url = `${BACKEND_URL}/api/products`; 
        const response = await fetch(url); 
        
        if (!response.ok) {
          // Agar server accessible hai lekin response code 200-299 nahi hai
          const errorDetail = `HTTP Error: ${response.status} ${response.statusText}. URL: ${url}`;
          throw new Error(errorDetail);
        }
        
        const data: Product[] = await response.json();
        // Check karein ke array mila hai ya nahi
        if (!Array.isArray(data)) {
           throw new Error("Invalid response format: Expected an array of products.");
        }

        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("Products fetch karte waqt error aaya:", err);
        let userMessage = "Products load nahi ho sake. Please internet connection check karein ya thori der baad try karein.";
        
        if (err.message.includes("Failed to fetch")) {
            userMessage = "Network error: Could not connect to the API. Please check your internet connection or if the backend server is running/deployed.";
        } else if (err.message.includes("HTTP Error: 404")) {
            userMessage = `API endpoint not found (404). Check backend route configuration on Vercel. URL: ${BACKEND_URL}/api/products`;
        } else if (err.message.includes("HTTP Error")) {
            userMessage = `API se data nahi mila: ${err.message}. Backend logs check karein.`;
        } else if (err.message.includes("Invalid response format")) {
            userMessage = `API response ghalat hai: ${err.message}. Backend data structure check karein.`;
        }

        setError(userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs only once on mount


  const toggleWishlist = (productId: string) => {
      setWishlist(prevList => prevList.includes(productId) ? 
          prevList.filter(id => id !== productId) : [...prevList, productId]
      );
  };
  
  const handleAddToCart = (product: Product) => {
      addToCart(product, 1); 
  };

  const handleBuyNow = (productId: string) => {
      // Pehle product find karein
      const product = products.find(p => p.id === productId);
      if (product) {
          buyNow(product, 1, navigate); // buyNow ko ab full Product object chahiye
      }
  };

  // Ab products state se featured products filter karein
  const featuredProducts = products.filter(p => !p.isTrending).slice(0, 4);
  
  // Stagger animation (No Change)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'tween', ease: 'easeOut', duration: 0.4 }
    }
  };

  // --- MOCK IMAGE ASSETS FOR HERO & CATEGORIES (Placeholders) ---
  const heroImages = {
    headset: 'https://images.unsplash.com/photo-1546435770-d3e4983dfd1f?w=400&q=80',
    keyboard: 'https://images.unsplash.com/photo-1587827827409-d75a40a85208?w=400&q=80',
    watch: 'https://images.unsplash.com/photo-1546868512-14073d8a7c1b?w=400&q=80',
    laptop: 'https://images.unsplash.com/photo-1550007823-3b0f5b9d3e8e?q=80&w=2070&auto=format&fit=crop'
  };

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px] dark:bg-[#0A0D18] text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="ml-4 text-xl dark:text-cyan-400">Products load ho rahe hain...</p>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="text-center p-20 dark:bg-[#0A0D18] min-h-[500px]">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Connection Error</h2>
        <p className="dark:text-gray-300 max-w-lg mx-auto leading-relaxed">{error}</p>
        <p className="mt-6 text-cyan-400 font-semibold">
           {/* Display the URL the user needs to check */}
           <a href={`${BACKEND_URL}/api/products`} target="_blank" rel="noopener noreferrer" className="hover:underline">Backend URL check karein: {BACKEND_URL}/products</a>
        </p>
      </div>
    );
  }

  return (
    // Global Wrapper background (Yeh color poore page ka background set karega)
    <div className="w-full transition-colors duration-300 bg-white dark:bg-[#0A0D18] text-gray-900 dark:text-white"> 
      
      {/* ======================================= */}
      {/* --- 1. HERO SECTION (Always Dark Background) --- */}
      {/* ======================================= */}
      {/* Hero section ka background hardcoded dark rahega, jaisa aap chahte hain */}
      <section className="relative min-h-[550px] md:min-h-[650px] flex items-center pt-24 pb-12 px-6 overflow-hidden bg-[#0A0D18]">
        
        {/* Background Pattern/Image - Dark Mode Only */}
        <div className="absolute top-0 left-0 w-full h-full bg-no-repeat bg-cover opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1974&auto=format&fit=crop')`, backgroundPosition: 'center top' }}></div>
        
        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center">
          <AnimateOnScroll className="max-w-xl md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 
                            text-white leading-tight"> 
              INNOVATE
              <br />& INSPIRE
            </h1>
            <p className="text-lg md:text-xl text-cyan-200/80 mb-6 max-w-md">
              Discover cutting-edge tech and gadgets. Unbeatable prices await.
            </p>
            
            <Link to="/products" 
                  className="inline-block px-8 py-3 
                              text-black font-semibold rounded-lg
                              bg-cyan-400 
                              hover:bg-cyan-300
                              active:scale-95 transition-all duration-300 shadow-lg shadow-cyan-400/30">
              EXPLORE COLLECTION
            </Link>
          </AnimateOnScroll>
          
          {/* Hero Images (Right side) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:w-1/2 relative h-full flex justify-center items-center"
          >
            <img src={heroImages.laptop} alt="Laptop" 
                 className="w-full max-w-md md:max-w-full h-auto object-cover rounded-xl shadow-2xl shadow-cyan-900/50 dark:shadow-cyan-900/70"
            />
          </motion.div>
        </div>
      </section>

      {/* ======================================= */}
      {/* --- 2. SHOP BY CATEGORY (Inherits Global BG) --- */}
      {/* ======================================= */}
      <section className="py-16 px-6"> {/* FIX: Bg classes removed to inherit from parent */}
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              Shop by Category
            </h2>
          </AnimateOnScroll>
          
          <motion.div 
            className="flex space-x-4 overflow-x-auto pb-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Category Cards (Inner Card Backgrounds must switch) */}
            <motion.div variants={itemVariants} className="flex-none w-56 h-32 p-4 rounded-xl border border-gray-300 dark:border-cyan-800/50 bg-white dark:bg-black/50 backdrop-blur-sm hover:border-cyan-500 transition-colors cursor-pointer shadow-lg">
              <Headphones className="w-6 h-6 text-indigo-600 dark:text-cyan-400 mb-2"/>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Headsets</h3>
            </motion.div>
            {/* Category Card 2: Keyboards */}
            <motion.div variants={itemVariants} className="flex-none w-56 h-32 p-4 rounded-xl border border-gray-300 dark:border-cyan-800/50 bg-white dark:bg-black/50 backdrop-blur-sm hover:border-cyan-500 transition-colors cursor-pointer shadow-lg">
              <Keyboard className="w-6 h-6 text-indigo-600 dark:text-cyan-400 mb-2"/>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboards</h3>
            </motion.div>
            {/* Category Card 3: Mice */}
            <motion.div variants={itemVariants} className="flex-none w-56 h-32 p-4 rounded-xl border border-gray-300 dark:border-cyan-800/50 bg-white dark:bg-black/50 backdrop-blur-sm hover:border-cyan-500 transition-colors cursor-pointer shadow-lg">
              <Mouse className="w-6 h-6 text-indigo-600 dark:text-cyan-400 mb-2"/>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mice</h3>
            </motion.div>
            <motion.div variants={itemVariants} className="flex-none w-56 h-32 p-4 rounded-xl border border-gray-300 dark:border-cyan-800/50 bg-white dark:bg-black/50 backdrop-blur-sm hover:border-cyan-500 transition-colors cursor-pointer shadow-lg">
              <Cpu className="w-6 h-6 text-indigo-600 dark:text-cyan-400 mb-2"/>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processors</h3>
            </motion.div>
          </motion.div>
         </div>
      </section>

      {/* ======================================= */}
      {/* --- 3. FEATURED PRODUCTS (Inherits Global BG) --- */}
      {/* ======================================= */} 
      <section className="py-16 px-6"> {/* FIX: Bg classes removed to inherit from parent */}
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll delay={0.1}>
            {/* Agar products nahi hain toh yeh title bhi hide ho jana chahiye */}
            {products.length > 0 && (
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Featured Products
              </h2>
            )}
            {products.length === 0 && (
                <p className="text-center text-xl text-gray-500 dark:text-gray-400 mb-8">
                    Koi Featured Products available nahi hain.
                </p>
            )}
          </AnimateOnScroll>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featuredProducts.map((product) => 
                <motion.div key={product.id} variants={itemVariants}>
                  <Link 
                      to={`/details/${product.id}`} 
                      className="group block h-full"
                  > 
                      <ProductCard 
                          product={product} 
                          isWishlisted={wishlist.includes(product.id)}
                          onToggleWishlist={toggleWishlist}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                      />
                  </Link>
                </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ======================================= */}
      {/* --- 4. LIMITED TIME OFFER (Inherits Global BG) --- */}
      {/* ======================================= */}
      <section className="py-16 px-6 border-t border-gray-200 dark:border-cyan-900/50"> {/* FIX: Bg classes removed to inherit from parent */}
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll delay={0.1}>
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">
              LIMITED TIME OFFER: UP TO 50% OFF SELECT ITEMS!
            </h2>
          </AnimateOnScroll>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Feature Cards (Inner Card Backgrounds must switch) */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-white dark:bg-black/50 border border-gray-300 dark:border-cyan-900/80 
                shadow-sm dark:shadow-xl dark:shadow-cyan-900/30
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-cyan-900/50 border dark:border-cyan-600/50">
                <Truck className="w-8 h-8 text-indigo-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get your order shipped in record time, anywhere.</p>
            </motion.div>

            {/* Card 2: Secure Payments */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-white dark:bg-black/50 border border-gray-300 dark:border-cyan-900/80 
                shadow-sm dark:shadow-xl dark:shadow-cyan-900/30
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-cyan-900/50 border dark:border-cyan-600/50">
                <CreditCard className="w-8 h-8 text-indigo-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your payments are 100% secure and encrypted.</p>
            </motion.div>

            {/* Card 3: Quality Assurance */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-white dark:bg-black/50 border border-gray-300 dark:border-cyan-900/80 
                shadow-sm dark:shadow-xl dark:shadow-cyan-900/30
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-cyan-900/50 border dark:border-cyan-600/50">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-cyan-400" /> 
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quality Assurance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">We guarantee 100% original and quality products.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

    </div>
  );
}


