// Path: /src/data/products.ts

/**
 * Product Interface
 * Yeh interface define karti hai ke aapka data backend se kis format mein aana chahiye.
 * Aap ise apne actual backend data structure ke mutabiq badal sakte hain.
 */
export interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description: string;
    category: string;
    isTrending: boolean;
    rating: number; // e.g., 4.5
}

/**
 * Dummy Product Data
 * Yeh array un components ke liye zaroori hai jo abhi tak backend se fetch nahi kar rahe hain 
 * (jaise DetailsPage.tsx jo aapke error mein mention hua tha) taake woh break na hon.
 * Real data ab HomePage.tsx mein backend se load ho raha hai.
 */
export const allProducts: Product[] = [
    {
        id: "p101",
        name: "Quantum Keyboard Pro",
        price: 199.99,
        image_url: "https://placehold.co/400x300/0A0D18/ffffff?text=Keyboard+Pro",
        description: "Mechanical keyboard with silent switches and RGB lighting.",
        category: "Keyboard",
        isTrending: true,
        rating: 4.8
    },
    {
        id: "p102",
        name: "Echo Gaming Headset",
        price: 89.50,
        image_url: "https://placehold.co/400x300/0A0D18/ffffff?text=Gaming+Headset",
        description: "7.1 Surround sound headset with noise-canceling mic.",
        category: "Headset",
        isTrending: false, // Featured Product
        rating: 4.2
    },
    {
        id: "p103",
        name: "Aura Laptop 2025",
        price: 1499.00,
        image_url: "https://placehold.co/400x300/0A0D18/ffffff?text=Aura+Laptop",
        description: "Ultra-thin laptop with latest Core i9 processor.",
        category: "Laptop",
        isTrending: false, // Featured Product
        rating: 4.9
    },
    {
        id: "p104",
        name: "Fusion Mouse",
        price: 55.00,
        image_url: "https://placehold.co/400x300/0A0D18/ffffff?text=Gaming+Mouse",
        description: "Wireless gaming mouse with customizable DPI.",
        category: "Mouse",
        isTrending: false, // Featured Product
        rating: 4.5
    },
    {
        id: "p105",
        name: "Chrono Watch",
        price: 299.99,
        image_url: "https://placehold.co/400x300/0A0D18/ffffff?text=Smart+Watch",
        description: "Smartwatch with health tracking and 10-day battery life.",
        category: "Wearable",
        isTrending: false, // Featured Product
        rating: 4.3
    },
];
