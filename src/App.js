import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/marketplace/Home';
import Products from './pages/marketplace/Products';
import ProductDetail from './pages/marketplace/ProductDetail';
import Dashboard from './pages/marketplace/Dashboard';

// Lazy loaded pages
const Cart = React.lazy(() => import('./pages/marketplace/Cart'));
const Checkout = React.lazy(() => import('./pages/marketplace/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/marketplace/OrderSuccess'));
const MyOrders = React.lazy(() => import('./pages/marketplace/MyOrders'));
const OrderTracking = React.lazy(() => import('./pages/marketplace/OrderTracking'));
const Profile = React.lazy(() => import('./pages/marketplace/Profile'));
const Wishlist = React.lazy(() => import('./pages/marketplace/Wishlist'));

// Auth pages
const CustomerLogin = React.lazy(() => import('./pages/auth/CustomerLogin'));
const CustomerRegister = React.lazy(() => import('./pages/auth/CustomerRegister'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));

const VendorRegister = React.lazy(() => import('./pages/auth/VendorRegister'));

function AppLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh' }}>
        <React.Suspense fallback={<div style={{padding:40}}>Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/vendor-register" element={<VendorRegister />} />

            {/* Customer Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/track/:id" element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            } />

            <Route path="*" element={<div style={{padding:40}}>Page not found</div>} />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
