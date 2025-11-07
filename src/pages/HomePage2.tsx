// Path: /src/pages/HomePage.tsx
// --- FIX: Sab images ke DIRECT URLs add kar diye hain. Ab kuch download nahi karna. ---

import React, { useState, useRef } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion'; 
import { useInView } from 'react-intersection-observer'; 
import { 
  Truck, 
  ShieldCheck, 
  Cpu, 
  Headphones, 
  Keyboard, 
  Mouse,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

// --- Types ---
interface Product {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    price: number;
    darkBg?: boolean; 
}

// ==================================================================
// --- 🌟 ANIMATION HELPER (Scroll par animation ke liye) ---
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
  
  const [wishlist, setWishlist] = useState<string[]>([]); 
  const toggleWishlist = (productId: string) => {
      setWishlist(prevList => prevList.includes(productId) ? 
          prevList.filter(id => id !== productId) : [...prevList, productId]
      );
  };

  // --- DUMMY DATA (8 Products) ---
  // --- CHANGE: Sab images ke URLs add kar diye hain ---
  const products: Product[] = [
    { id: '1', name: 'Giga-Flow Headset', image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", rating: 5, reviews: 45, price: 3.00, darkBg: false },
    { id: '2', name: 'Pro Wireless Keyboard', image: 'https://images.unsplash.com/photo-1618384887924-6b6de3b7f843?w=600&q=80', rating: 4, reviews: 32, price: 1.00, darkBg: false },
    { id: '3', name: 'Ergonomic Mouse Pro', image: 'https://images.unsplash.com/photo-1615663245651-e3b2b8c5639e?w=600&q=80', rating: 4, reviews: 56, price: 2.50, darkBg: false },
    { id: '4', name: 'Smartwatch Series 8', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80', rating: 5, reviews: 78, price: 15.00, darkBg: false },
    { id: '5', name: '4K Mini Projector', image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80', rating: 5, reviews: 62, price: 22.50, darkBg: false },
    { id: '6', name: 'Aura Smart Ring', image: 'https://images.unsplash.com/photo-1613141315003-613c713606f7?w=600&q=80', rating: 4, reviews: 19, price: 8.00, darkBg: false },
    { id: '7', name: 'Portable Power Bank', image: 'https://images.unsplash.com/photo-1588621477940-188b0b275e3e?w=600&q=80', rating: 5, reviews: 99, price: 5.50, darkBg: false },
    { id: '8', name: 'VR Headset G2', image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80', rating: 5, reviews: 31, price: 30.00, darkBg: false },
  ];
  
  // --- DUMMY DATA (4 Products) ---
  // --- CHANGE: Sab images ke URLs add kar diye hain ---
  const trendingProducts: Product[] = [
    { id: '9', name: 'Noise-Cancelling Earbuds', image: 'https://images.unsplash.com/photo-1606802383236-a5cbdc9f187c?w=600&q=80', rating: 5, reviews: 91, price: 10.00, darkBg: true },
    { id: '10', name: 'Gaming Laptop X-15', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80', rating: 5, reviews: 102, price: 99.00, darkBg: true },
    { id: '11', name: 'Smart Home Hub', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', rating: 4, reviews: 55, price: 12.00, darkBg: true },
    { id: '12', name: '4K Action Camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', rating: 5, reviews: 40, price: 18.00, darkBg: true },
  ];

  // Stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  return (
    <div className="w-full transition-colors duration-300 bg-white dark:bg-gray-950"> 
      
      {/* ======================================= */}
      {/* --- 1. HERO SECTION (Fluid Background) --- */}
      {/* ======================================= */}
      <section className="relative min-h-[550px] md:min-h-[650px] flex items-center py-20 px-6 overflow-hidden">
        
        {/* --- Fluid Blobs (Tailwind config se) --- */}
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
          <div className="absolute w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl opacity-50 
                          animate-blob1"></div>
          <div className="absolute w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-40 
                          animate-blob2" style={{ animationDelay: '2s' }}></div>
          <div className="absolute w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-30 
                          animate-blob3 top-20 md:left-1/3" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-gray-950 dark:via-gray-950/70 dark:to-transparent"></div>

        {/* Hero Content (Left-aligned) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <AnimateOnScroll className="max-w-xl">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6
                           text-transparent bg-clip-text 
                           bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400
                           dark:from-indigo-400 dark:via-cyan-400 dark:to-indigo-400
                           bg-[200%_auto] 
                           animate-textGradient"> 
              INNOVATE
              <br />& INSPIRE
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md">
              Discover the latest in tech and gadgets. Premium quality, unbeatable prices.
            </p>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
            >
              <Link to="/products" 
                    className="inline-block px-10 py-4 
                               text-white font-semibold rounded-lg
                               bg-indigo-600 
                               hover:bg-indigo-700
                               dark:bg-indigo-500 dark:hover:bg-indigo-600
                               active:scale-95 transition-all duration-300 shadow-lg shadow-indigo-500/30">
                DISCOVER MORE
              </Link>
            </motion.div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ======================================= */}
      {/* --- 2. FRESH ARRIVALS (4-Col Layout) --- */}
      {/* ======================================= */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-white">
              Fresh Arrivals
            </h2>
          </AnimateOnScroll>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.map((product) => 
                <motion.div key={product.id} variants={itemVariants}>
                  <Link 
                      to={`/details/${product.id}`} 
                      className="group block h-full"
                  > 
                      <ProductCard 
                          {...product} 
                          darkBg={false} 
                          isWishlisted={wishlist.includes(product.id)}
                          onToggleWishlist={toggleWishlist}
                      />
                  </Link>
                </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ======================================= */}
      {/* --- 3. FEATURED CATEGORIES --- */}
      {/* ======================================= */}
      <section className="py-16 px-6 bg-white dark:bg-gray-950">
         <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 dark:text-white">
              Shop by Category
            </h2>
          </AnimateOnScroll>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Category Card 1 */}
            <motion.div variants={itemVariants} className="group relative h-80 rounded-2xl overflow-hidden shadow-xl">
              {/* --- CHANGE: Image URL added --- */}
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" alt="Gaming"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <Headphones className="w-8 h-8 text-indigo-400 mb-2"/>
                <h3 className="text-3xl font-bold text-white">Headsets</h3>
              </div>
            </motion.div>
            {/* Category Card 2 */}
            <motion.div variants={itemVariants} className="group relative h-80 rounded-2xl overflow-hidden shadow-xl">
              {/* --- CHANGE: Image URL added --- */}
              <img src="https://images.unsplash.com/photo-1595044484877-59c022c0696e?w=800&q=80" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" alt="Keyboards"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <Keyboard className="w-8 h-8 text-indigo-400 mb-2"/>
                <h3 className="text-3xl font-bold text-white">Keyboards</h3>
              </div>
            </motion.div>
            {/* Category Card 3 */}
            <motion.div variants={itemVariants} className="group relative h-80 rounded-2xl overflow-hidden shadow-xl">
              {/* --- CHANGE: Image URL added --- */}
              <img src="https://images.unsplash.com/photo-1615663245651-e3b2b8c5639e?w=800&q=80" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" alt="Mice"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <Mouse className="w-8 h-8 text-indigo-400 mb-2"/>
                <h3 className="text-3xl font-bold text-white">Mice</h3>
              </div>
            </motion.div>
          </motion.div>
         </div>
      </section>

      {/* ======================================= */}
      {/* --- 4. TRENDING NOW (4-Col Layout) --- */}
      {/* ======================================= */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll delay={0.1}>
            <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-indigo-500 dark:text-indigo-400" /> Trending Now
            </h2>
          </AnimateOnScroll>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {trendingProducts.map((product) => 
                <motion.div key={product.id} variants={itemVariants}>
                  <Link 
                      to={`/details/${product.id}`} 
                      className="group block h-full"
                  > 
                      <ProductCard 
                          {...product} 
                          darkBg={true}
                          isWishlisted={wishlist.includes(product.id)}
                          onToggleWishlist={toggleWishlist}
                      />
                  </Link>
                </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ======================================= */}
      {/* --- 5. WHY SHOP WITH US (Professional Design) --- */}
      {/* ======================================= */}
      <section className="py-16 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll delay={0.1}>
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 dark:text-white">
              Why Shop With Us?
            </h2>
          </AnimateOnScroll>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Card 1: Fast Delivery */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-gray-50 dark:bg-gray-900 
                border border-gray-200 dark:border-gray-800
                shadow-sm
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <Truck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold dark:text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get your order delivered in record time, anywhere.</p>
            </motion.div>

            {/* Card 2: Secure Payments */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-gray-50 dark:bg-gray-900 
                border border-gray-200 dark:border-gray-800
                shadow-sm
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold dark:text-white mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your payments are 100% secure and encrypted.</p>
            </motion.div>

            {/* Card 3: Quality Assurance */}
            <motion.div variants={itemVariants} className="
                p-6 rounded-xl text-center
                bg-gray-50 dark:bg-gray-900 
                border border-gray-200 dark:border-gray-800
                shadow-sm
            ">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> 
              </div>
              <h3 className="text-lg font-semibold dark:text-white mb-2">Quality Assurance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">We guarantee 100% original and quality products.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

    </div>
  );
}

