// Path: /src/AppRouter.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthProvider";

import { HomePage } from "./pages/HomePage";
import { DetailsPage } from "./pages/DetailsPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentPage } from "./pages/PaymentPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { ProductsPage } from "./pages/ProductsPage";
import { SearchPage } from "./pages/SearchPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginRegisterPage from "./pages/LoginRegisterPage";

import AdminLoginPage from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminProductsManager } from "./pages/AdminProductsManager";
import AdminRoute from "./utils/AdminRoute";

export function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/details/:id" element={<DetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginRegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/products" element={<AdminProductsManager />} />
            </Route>

            <Route path="/admin" element={<AdminLoginPage />} />
          </Routes>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}
