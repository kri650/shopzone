import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const fmt = (value) =>
  Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const discount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [localReviews, setLocalReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, title: '', comment: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
  const item = await productService.getProductById(id);
        setProduct({
          ...item,
          image: item.images?.[0]?.url,
          reviews: item.totalReviews ?? item.reviews ?? 0
        });

        if (item.category?._id) {
          const rel = await productService.getProducts({ category: item.category._id, limit: 4 });
          setRelated((rel.items || []).filter((p) => p._id !== id).slice(0, 4));
        }
      } catch (err) {
        // If service threw a client-side validation error, treat as not found.
        if (err && err.isClientValidation) {
          setProduct(null);
        } else {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) {
      setLocalReviews(JSON.parse(saved));
    } else {
      setLocalReviews([]);
    }
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      _id: 'local_' + Date.now(),
      name: reviewForm.name || user?.name || 'Anonymous User',
      rating: Number(reviewForm.rating),
      title: reviewForm.title,
      comment: reviewForm.comment,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newReview, ...localReviews];
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setLocalReviews(updated);
    setShowReviewForm(false);
    setReviewForm({ name: '', rating: 5, title: '', comment: '' });
    toast.success('Thank you! Your review has been submitted locally.');
  };

  if (loading) return <div className="container" style={{ padding: 40, textAlign: 'center' }}><h2>Loading product...</h2></div>;
  if (!product) return <div className="container" style={{ padding: 40, textAlign: 'center' }}><h2>Product not found</h2><Link to="/products">← Back to Products</Link></div>;

  const disc = product.comparePrice ? discount(product.price, product.comparePrice) : 0;
  const imgs = product.images?.length ? product.images.map((img) => img.url) : [product.image, product.image, product.image];

  const handleAddCart = async () => {
    try {
      await addToCart(product, qty);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };
  const handleBuyNow = async () => {
    try {
      await addToCart(product, qty);
      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await userService.addToWishlist(product._id);
      toast.success('Saved to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save to wishlist');
    }
  };

  return (
    <div className="pd-page container">
      <div className="pd-breadcrumb">
        <Link to="/">Home</Link> › <Link to="/products">Products</Link> › <Link to={`/products?category=${product.category?._id}`}>{product.category?.name || 'Category'}</Link> › <span>{product.name}</span>
      </div>

      <div className="pd-main">
        {/* IMAGES */}
        <div className="pd-images">
          <div className="pd-thumbs">
            {imgs.map((img, i) => (
              <button key={i} className={`pd-thumb${activeImg === i ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
          <div className="pd-main-img">
            <img src={imgs[activeImg]} alt={product.name} />
          </div>
        </div>

        {/* INFO */}
        <div className="pd-info">
          <p className="pd-brand">{product.brand}</p>
          <h1 className="pd-title">{product.name}</h1>
          <div className="pd-rating">
            <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span className="pd-rating-num">{product.rating}</span>
            <span className="pd-reviews">{product.reviews?.toLocaleString()} ratings</span>
          </div>
          <hr className="pd-divider" />

          <div className="pd-price-block">
            {disc > 0 && <span className="pd-disc-badge">-{disc}%</span>}
            <span className="pd-price">{fmt(product.price)}</span>
            {product.comparePrice && (
              <div className="pd-mrp">M.R.P.: <s>{fmt(product.comparePrice)}</s></div>
            )}
            {disc > 0 && <div className="pd-saving">You save: {fmt(product.comparePrice - product.price)} ({disc}%)</div>}
          </div>

          <div className="pd-prime-msg">✦ FREE Delivery by ShopZone Prime</div>

          <div className="pd-details-list">
            <div className="pd-detail-row"><span>Category</span><span>{product.category?.name || '-'}</span></div>
            <div className="pd-detail-row"><span>Brand</span><span>{product.brand}</span></div>
            <div className="pd-detail-row"><span>Sold by</span><span className="link">{product.vendor?.storeName || '-'}</span></div>
            <div className="pd-detail-row"><span>Availability</span>
              <span style={{ color: product.stock > 0 ? '#007600' : '#cc0c39', fontWeight: 600 }}>
                {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="pd-qty-row">
            <span>Qty:</span>
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button className="btn-add-cart" onClick={handleAddCart} disabled={product.stock === 0}>Add to Cart</button>
            <button className="btn-buy-now" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</button>
            <button className="btn-wishlist" onClick={handleWishlist}>♡ Wishlist</button>
          </div>

          <div className="pd-secure"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure transaction</div>
        </div>

        {/* BUY BOX */}
        <div className="pd-buy-box">
          <div className="pd-buy-price">{fmt(product.price)}</div>
          <div className="pd-buy-prime">✦ FREE Prime Delivery</div>
          <div className="pd-buy-delivery">Arrives by <b>Tomorrow</b></div>
          <div className="pd-buy-location">📍 Delivering to New Delhi 110001</div>
          <div className="pd-stock-label" style={{ color: product.stock > 0 ? '#007600' : '#cc0c39' }}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
          <div className="pd-qty-row-small">
            <span>Qty:</span>
            <select value={qty} onChange={e => setQty(+e.target.value)}>
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button className="buy-box-add" onClick={handleAddCart} disabled={product.stock === 0}>Add to Cart</button>
          <button className="buy-box-buy" onClick={handleBuyNow} disabled={product.stock === 0}>Buy Now</button>
          <div className="buy-box-sold">Sold by: <span className="link">{product.vendor?.storeName || '-'}</span></div>
          <div className="buy-box-returns">✓ Return policy: 10 days</div>
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="pd-related">
          <h2>Customers also viewed</h2>
          <div className="pd-related-grid">
            {related.map(p => (
              <Link to={`/products/${p._id}`} className="pd-related-card" key={p._id}>
                <img src={p.image || p.images?.[0]?.url} alt={p.name} />
                <div className="pd-related-info">
                  <p className="pd-related-name">{p.name}</p>
                  <div className="stars" style={{ fontSize: 12 }}>{'★'.repeat(Math.floor(p.rating))}</div>
                  <div className="pd-related-price">{fmt(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="pd-reviews-section" style={{ marginTop: 50, borderTop: '1px solid #ddd', paddingTop: 30 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#333' }}>Customer Reviews</h2>
        
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Left breakdown */}
          <div style={{ flex: '1 1 300px', maxWidth: 350 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
              <span className="stars" style={{ fontSize: '1.5rem', color: '#ff9900' }}>
                {'★'.repeat(Math.round(product.rating || 4.5))}{'☆'.repeat(5 - Math.round(product.rating || 4.5))}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{product.rating || 4.5} out of 5</span>
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
              {(product.reviews || 0) + localReviews.length} global ratings
            </p>

            {/* Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
              {[
                { stars: 5, pct: 75 },
                { stars: 4, pct: 18 },
                { stars: 3, pct: 5 },
                { stars: 2, pct: 1 },
                { stars: 1, pct: 1 }
              ].map(row => (
                <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
                  <span style={{ width: 45, color: '#0066c0', cursor: 'pointer' }}>{row.stars} star</span>
                  <div style={{ flex: 1, background: '#f0f0f0', height: 16, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, background: '#ff9900', height: '100%' }} />
                  </div>
                  <span style={{ width: 35, textAlign: 'right', color: '#555' }}>{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Write review trigger */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Review this product</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>Share your thoughts with other customers</p>
              <button 
                onClick={() => setShowReviewForm(!showReviewForm)} 
                className="btn btn-outline"
                style={{ width: '100%', padding: '10px', fontWeight: 600 }}
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Customer Review'}
              </button>
            </div>
          </div>

          {/* Right reviews column */}
          <div style={{ flex: '2 2 500px' }}>
            {/* Show Form if open */}
            {showReviewForm && (
              <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 30 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 15, fontWeight: 600 }}>Create Review</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Overall Rating</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          type="button" 
                          onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: 0, color: num <= reviewForm.rating ? '#ff9900' : '#ccc' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Your Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder={user?.name || "Anonymous"} 
                      value={reviewForm.name} 
                      onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4 }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Add a Headline</label>
                    <input 
                      type="text" 
                      placeholder="What's most important to know?" 
                      required
                      value={reviewForm.title} 
                      onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4 }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Written Review</label>
                    <textarea 
                      rows="4" 
                      placeholder="What did you like or dislike? How was the product quality?" 
                      required
                      value={reviewForm.comment} 
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }} 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', alignSelf: 'flex-start', border: 'none' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Combine local reviews and default reviews */}
              {[...localReviews, ...[
                {
                  _id: 'fake1',
                  name: 'Anjali Sharma',
                  rating: 5,
                  title: 'Absolutely love this product!',
                  comment: 'Exceeded my expectations. The quality is premium and it feels very durable. Will definitely recommend this to friends and family!',
                  date: '2026-04-18'
                },
                {
                  _id: 'fake2',
                  name: 'Rohan Mehta',
                  rating: 4,
                  title: 'Very good purchase, worth the money',
                  comment: 'Good packaging and fast delivery. The product works flawlessly. Rated 4 stars only because there was a tiny scratch on the outer box, but the item itself is perfect!',
                  date: '2026-04-22'
                },
                {
                  _id: 'fake3',
                  name: 'Vikram Singh',
                  rating: 5,
                  title: 'Top-tier quality and premium packaging',
                  comment: 'Super fast shipping by ShopZone Prime! The item works beautifully, the materials feel incredibly premium. Definitely worth buying!',
                  date: '2026-05-01'
                }
              ]].map((rev) => (
                <div key={rev._id} style={{ borderBottom: '1px solid #eee', paddingBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>
                      {rev.name[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>{rev.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#ff9900', border: '1px solid #ff9900', borderRadius: 3, padding: '1px 4px', marginLeft: 8 }}>Verified Purchase</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="stars" style={{ color: '#ff9900', fontSize: '0.95rem' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#111' }}>{rev.title}</strong>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: 8 }}>Reviewed on {new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  
                  <p style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.4', margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
