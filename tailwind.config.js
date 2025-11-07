/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- YEH CUSTOM ANIMATIONS HAIN ---
      keyframes: {
        // 1. Text Gradient (Yeh pehle se tha)
        textGradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        // 2. Fluid Blobs (Yeh hai naya sahi code)
        blob1: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-50px, 30px) scale(1.1)' },
          '66%': { transform: 'translate(40px, -10px) scale(0.9)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, 40px) scale(0.9)' },
          '66%': { transform: 'translate(-30px, -30px) scale(1.1)' },
        },
      },
      animation: {
        // Animations ko register kiya
        textGradient: 'textGradient 5s ease-in-out infinite',
        blob1: 'blob1 15s ease-in-out infinite',
        blob2: 'blob2 12s ease-in-out infinite',
        blob3: 'blob3 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

