import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import './Wishlist.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const Wishlist = () => {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const items = await userService.getWishlist();
      setWishlistItems(items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (productId) => {
    try {
      await userService.removeFromWishlist(productId);
      toast.success('Removed from wishlist.');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item.');
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page container">
        <div className="empty-state">
          <h3>Loading wishlist…</h3>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page container">
        <div className="empty-state">
          <h3>Your wishlist is empty</h3>
          <p>Save items to your wishlist to see them here</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <h1>Your Wishlist</h1>
      
      <div className="wishlist-grid">
        {wishlistItems.map(product => (
          <div className="wishlist-card" key={product._id}>
            <Link to={`/products/${product._id}`} className="wishlist-img">
              <img src={product.images?.[0]?.url || product.image} alt={product.name} />
            </Link>
            <div className="wishlist-info">
              <Link to={`/products/${product._id}`} className="wishlist-name">{product.name}</Link>
              <div className="wishlist-price">{fmt(product.price)}</div>
              <div className="wishlist-actions">
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => remove(product._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
