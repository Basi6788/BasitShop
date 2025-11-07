// Path: /src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Component Imports
import { Header } from "./components/Header";
import BottomNavigationBar from "./components/BottomNavigationBar";

// Pages - User Facing
import { HomePage } from "./pages/HomePage";
import { DetailsPage } from "./pages/DetailsPage";
import { CartPage } from "./pages/CartPage";
import ProductsPage from "./pages/ProductsPage"; // ✅ fixed import (default export)
import LoginRegisterPage from "./pages/LoginRegisterPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { SearchPage } from "./pages/SearchPage";
import { ProfilePage } from "./pages/ProfilePage";

// Pages - Admin
import AdminLoginPage from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminProductsManager } from "./pages/AdminProductsManager";

// Context
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthProvider";
import AdminRoute from "./utils/AdminRoute";

// Dummy Page
const ContactPage: React.FC = () => (
  <div className="p-8 text-white">Contact Page Content</div>
);

// Wrapper to manage when header/bottom nav show
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isUserRoute =
    !location.pathname.startsWith("/admin") &&
    !location.pathname.includes("/login"); // Hide header for admin login

  const handleSearch = (term: string) => console.log("Searching for:", term);
  const handleLogin = () => console.log("Login initiated");
  const handleLogout = () => console.log("Logout initiated");

  const isAuthenticated = !!localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName") || "Guest";

  return (
    <>
      {isUserRoute && (
        <Header
          onSearch={handleSearch}
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
      <main className="pb-16 md:pb-0 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {children}
      </main>
      {isUserRoute && <BottomNavigationBar />}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/details/:id" element={<DetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/products" element={<ProductsPage />} /> {/* ✅ Fixed */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginRegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsManager />} />
              </Route>
            </Routes>
          </LayoutWrapper>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;