import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import './ProductCard.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const discount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const disc = product.comparePrice ? discount(product.price, product.comparePrice) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product);
      toast.success('Added to cart!', { duration: 1500 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to use wishlist.');
      return;
    }
    try {
      await userService.addToWishlist(product._id);
      toast.success('Saved to wishlist!', { duration: 1500 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save to wishlist');
    }
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="pc-img-wrap">
        <img src={product.image || product.images?.[0]?.url} alt={product.name} className="pc-img" loading="lazy" />
        <button className="pc-wish" type="button" onClick={handleWish} aria-label="Add to wishlist">♡</button>
        {product.badge ? (
          <span className={`pc-badge badge-${product.badge === 'deal' ? 'red' : product.badge === 'hot' ? 'orange' : 'green'}`}>
            {product.badge === 'deal' ? `-${disc}%` : product.badge.toUpperCase()}
          </span>
        ) : disc > 0 ? (
          <span className="pc-badge badge-red" style={{ background: '#cc0c39', color: '#fff', fontSize: '10px', fontWeight: '700', borderRadius: '3px', padding: '2px 6px', position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
            ON SALE
          </span>
        ) : null}
      </div>
      <div className="pc-info">
        <p className="pc-name">{product.name}</p>
        <div className="pc-brand">{product.brand}</div>
        <div className="pc-rating">
          <Stars rating={product.rating} />
          <span className="pc-reviews">({product.reviews?.toLocaleString()})</span>
        </div>
        <div className="pc-pricing">
          <span className="pc-price">{fmt(product.price)}</span>
          {product.comparePrice && (
            <span className="pc-old">{fmt(product.comparePrice)}</span>
          )}
        </div>
        {disc > 0 && <div className="pc-save">Save {disc}%</div>}
        <div className="pc-prime">✦ FREE Delivery by ShopZone</div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="pc-low-stock">Only {product.stock} left!</div>
        )}
        {product.stock === 0 && <div className="pc-out">Out of Stock</div>}
        <button className="pc-btn" onClick={handleAdd} disabled={product.stock === 0}>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
