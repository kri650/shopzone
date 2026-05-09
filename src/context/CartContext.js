import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const { isAuthenticated } = useAuth();

  const updateCartState = (serverCart) => {
    setCart(
      (serverCart.items || []).map((item) => ({
        _id: item.product?._id || item.product,
        cartItemId: item._id,
        name: item.product?.name,
        image: item.product?.images?.[0]?.url || '',
        brand: item.product?.brand || '',
        price: item.price,
        qty: item.quantity,
        stock: item.product?.stock || 0
      }))
    );
    setCouponCode(serverCart.couponCode || '');
    setDiscount(serverCart.discount || 0);
  };

  useEffect(() => {
    const load = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const serverCart = await cartService.getCart();
          updateCartState(serverCart);
        } catch (err) {
          setCart([]);
          setCouponCode('');
          setDiscount(0);
        } finally {
          setLoading(false);
        }
      } else {
        const stored = localStorage.getItem('shopzone_cart');
        setCart(stored ? JSON.parse(stored) : []);
        setCouponCode('');
        setDiscount(0);
      }
    };
    load();
  }, [isAuthenticated]);

  const saveCart = (items) => {
    setCart(items);
    if (!isAuthenticated) localStorage.setItem('shopzone_cart', JSON.stringify(items));
  };

  const addToCart = async (product, qty = 1) => {
    if (isAuthenticated) {
      const serverCart = await cartService.addToCart({ productId: product._id, quantity: qty });
      updateCartState(serverCart);
      return;
    }

    const existing = cart.find((i) => i._id === product._id);
    if (existing) {
      saveCart(cart.map((i) => (i._id === product._id ? { ...i, qty: i.qty + qty } : i)));
    } else {
      saveCart([...cart, { ...product, qty }]);
    }
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      const item = cart.find((entry) => entry._id === id);
      if (!item?.cartItemId) return;
      const serverCart = await cartService.removeCartItem(item.cartItemId);
      updateCartState(serverCart);
      return;
    }
    saveCart(cart.filter((i) => i._id !== id));
  };

  const updateQty = async (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    if (isAuthenticated) {
      const item = cart.find((entry) => entry._id === id);
      if (!item?.cartItemId) return;
      const serverCart = await cartService.updateCartItem(item.cartItemId, qty);
      updateCartState(serverCart);
      return;
    }
    saveCart(cart.map((i) => (i._id === id ? { ...i, qty } : i)));
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await cartService.clearCart();
    }
    saveCart([]);
    setCouponCode('');
    setDiscount(0);
  };

  const applyCoupon = async (code) => {
    if (isAuthenticated) {
      const serverCart = await cartService.applyCoupon(code);
      updateCartState(serverCart);
      return serverCart;
    } else {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      let disc = 0;
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode === 'SAVE10') {
        disc = Math.round(subtotal * 0.1);
      } else if (cleanCode === 'DEMO20') {
        disc = Math.round(subtotal * 0.2);
      } else if (cleanCode === 'FLAT100') {
        if (subtotal < 500) throw new Error("FLAT100 requires a minimum subtotal of ₹500.");
        disc = 100;
      } else if (cleanCode === 'WELCOME50') {
        disc = Math.min(Math.round(subtotal * 0.5), 250);
      } else {
        throw new Error("Invalid coupon code.");
      }
      setCouponCode(cleanCode);
      setDiscount(disc);
    }
  };

  const removeCoupon = async () => {
    if (isAuthenticated) {
      const serverCart = await cartService.removeCoupon();
      updateCartState(serverCart);
    } else {
      setCouponCode('');
      setDiscount(0);
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart, 
      count,
      subtotal,
      total,
      loading,
      couponCode,
      discount,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);