import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/marketplace/ProductCard';
import { productService } from '../../services/productService';
import { PRODUCTS, CATEGORIES } from '../../utils/dummyData';
import './Home.css';

const SLIDES = [
  {
    tag: 'Great Summer Sale', title: 'Up to', highlight: '70% Off Electronics',
    sub: 'Laptops, phones, tablets & more from top brands',
    bg: 'linear-gradient(135deg,#1a2744 0%,#2d4a8a 50%,#1557b0 100%)',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=380&fit=crop&auto=format',
    link: '/products?search=electronics',
  },
  {
    tag: 'New Arrivals', title: 'Fresh', highlight: 'Fashion Collection',
    sub: 'Trending styles for every occasion this season',
    bg: 'linear-gradient(135deg,#1e3a1e 0%,#2d5a2d 50%,#0e6b0e 100%)',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=380&fit=crop&auto=format',
    link: '/products?search=fashion',
  },
  {
    tag: 'Home Makeover', title: 'Transform Your', highlight: 'Home',
    sub: 'Furniture, decor & appliances at unbeatable prices',
    bg: 'linear-gradient(135deg,#3a1a2e 0%,#6b2d5a 50%,#8b1a4a 100%)',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=380&fit=crop&auto=format',
    link: '/products?search=home',
  },
];

const placeholderImage = (text = 'Category') => {
  const label = String(text || 'Category').replace(/[<>]/g, '').slice(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset="1" stop-color="#e5e7eb"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" font-size="44" fill="#9ca3af" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" dy=".35em">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CATEGORY_FALLBACK_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=900&fit=crop&auto=format',
  Fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=900&fit=crop&auto=format',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=900&fit=crop&auto=format',
  Beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=900&fit=crop&auto=format',
  Books: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=900&fit=crop&auto=format',
  Sports: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&h=900&fit=crop&auto=format',
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=900&fit=crop&auto=format',
  Toys: 'https://images.unsplash.com/photo-1558877385-72041b44f1ef?w=1200&h=900&fit=crop&auto=format',
  Gaming: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=900&fit=crop&auto=format',
};

const getCategoryImage = (cat) => {
  const name = cat?.name || '';
  return cat?.image?.url || CATEGORY_FALLBACK_IMAGES[name] || placeholderImage(name);
};

const Home = () => {
  const [slide, setSlide] = useState(0);
  const [slides, setSlides] = useState(SLIDES);
  const [products, setProducts] = useState(PRODUCTS.slice(0, 20));
  const [categories, setCategories] = useState(CATEGORIES);
  const navigate = useNavigate();

  // Defensive slice
  const safeItems = Array.isArray(products) ? products : [];
  const deals = safeItems.slice(0, 6);
  const featured = safeItems.slice(0, 10);
  const newArrivals = safeItems.slice(0, 8);
  const trending = [...safeItems].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)).slice(0, 8);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || 'https://backend-93wt.onrender.com/api';
    fetch(`${apiBase}/banners`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.banners)) {
          setSlides(data.banners);
        }
      })
      .catch(err => console.warn('Could not load dynamic banners from API', err));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  useEffect(() => {
    productService.getProducts({ limit: 20 })
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setProducts(data.items);
        }
      })
      .catch(err => console.warn('Home fetch failed', err));

    productService.getCategories()
      .then(data => {
        if (data && data.length > 0) setCategories(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <div className="hero">
        {slides.map((s, i) => (
          <div key={i} className={`hero-slide${slide === i ? ' active' : ''}`} style={{ background: s.bg }}>
            <div className="hero-content">
              <span className="hero-tag">{s.tag}</span>
              <h1>{s.title} <b>{s.highlight}</b></h1>
              <p>{s.sub}</p>
              <button className="hero-btn" onClick={() => navigate(s.link)}>Shop Now →</button>
            </div>
            <img src={s.img} alt={s.tag} className="hero-img" />
          </div>
        ))}
        <button className="hero-arrow left" onClick={() => setSlide(s => (s - 1 + slides.length) % slides.length)}>‹</button>
        <button className="hero-arrow right" onClick={() => setSlide(s => (s + 1) % slides.length)}>›</button>
        <div className="hero-dots">
          {slides.map((_, i) => <button key={i} className={`dot${slide === i ? ' active' : ''}`} onClick={() => setSlide(i)} />)}
        </div>
      </div>

      {/* DEAL STRIP */}
      <div className="deal-strip">
        <span className="deal-strip-label">⚡ Top Picks:</span>
        {safeItems.slice(0, 12).map((prod, i) => (
          <Link to={`/products/${prod._id}`} className="deal-strip-item" key={i}>
            <img src={prod.image || prod.images?.[0]?.url} alt={prod.name} />
            <span>{prod.name.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      <div className="home-main container">
        {/* CATEGORIES */}
        <section className="home-section">
          <h2 className="section-heading">Shop by Category</h2>
          <div className="cat-grid">
            {categories.map(cat => (
              <Link to={`/products?category=${cat._id}`} className="cat-card" key={cat._id}>
                <img
                  src={getCategoryImage(cat)}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    const name = cat?.name || 'Category';
                    // prevent infinite loop
                    if (e.currentTarget.dataset.fallbackApplied === '1') return;
                    e.currentTarget.dataset.fallbackApplied = '1';
                    e.currentTarget.src = placeholderImage(name);
                  }}
                />
                <div className="cat-card-label">
                  <span className="cat-icon">{cat.icon || '•'}</span>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TODAY'S DEALS */}
        {deals.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 className="section-heading" style={{ margin: 0 }}>Today's Deals</h2>
                <span className="flash-badge">⚡ Limited Time</span>
              </div>
              <Link to="/products" className="see-all-link">See all deals →</Link>
            </div>
            <div className="products-grid-6">
              {deals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* TRENDING */}
        {trending.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-heading" style={{ margin: 0 }}>Trending Now</h2>
              <Link to="/products" className="see-all-link">Explore →</Link>
            </div>
            <div className="products-grid-4">
              {trending.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* PROMO BANNERS */}
        <section className="promo-banners">
          {[
            { img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&h=320&fit=crop&auto=format', title: 'Mobiles Fest', sub: 'Up to 40% off on smartphones', link: '/products?category=Electronics' },
            { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&h=320&fit=crop&auto=format', title: 'Fashion Week', sub: 'Trending looks, unbeatable prices', link: '/products?category=Fashion' },
            { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=320&fit=crop&auto=format', title: 'Home Refresh', sub: 'Furniture & decor starting ₹499', link: '/products?category=Home' },
          ].map((b, i) => (
            <Link to={b.link} className="promo-card" key={i}>
              <img src={b.img} alt={b.title} />
              <div className="promo-overlay">
                <h3>{b.title}</h3>
                <p>{b.sub}</p>
                <span className="promo-btn">Shop Now</span>
              </div>
            </Link>
          ))}
        </section>

        {/* BEST SELLERS */}
        {featured.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <h2 className="section-heading" style={{ margin: 0 }}>Best Sellers</h2>
              <Link to="/products" className="see-all-link">View all →</Link>
            </div>
            <div className="products-grid-5">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* SELL BANNER */}
        <section className="sell-banner vendor-promo" style={{background: 'linear-gradient(135deg, #131921, #37475a)', marginBottom: 20, borderRadius: 8, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div className="sell-banner-content">
            <h2 style={{color: '#ff9900', fontSize: 28, marginBottom: 8}}>Become a ShopZone Seller</h2>
            <p style={{color: '#ccc', marginBottom: 20}}>Reach millions of customers and grow your business across India.</p>
            <a href="https://shopzon-vendor-dashboard.vercel.app/register" target="_blank" rel="noreferrer" className="sell-banner-btn" style={{background: '#ff9900', color: '#131921', padding: '12px 28px', borderRadius: 4, fontWeight: 700, textDecoration: 'none', display: 'inline-block'}}>Start Selling Today →</a>
          </div>
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop&auto=format" alt="Sell" style={{width: 300, height: 180, objectFit: 'cover', borderRadius: 6}} />
        </section>

        <section className="sell-banner" style={{background: 'linear-gradient(135deg, #232f3e, #37475a)', borderRadius: 8, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}>
          <div className="sell-banner-content">
            <h2 style={{color: 'white', fontSize: 28, marginBottom: 8}}>Shop smarter on ShopZone</h2>
            <p style={{color: '#ccc', marginBottom: 20}}>Discover top categories, best sellers, and daily savings.</p>
            <Link to="/products" className="sell-banner-btn" style={{background: '#ff9900', color: '#131921', padding: '12px 28px', borderRadius: 4, fontWeight: 700, textDecoration: 'none', display: 'inline-block'}}>Explore Products →</Link>
          </div>
          <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=300&fit=crop&auto=format" alt="Shop" style={{width: 300, height: 180, objectFit: 'cover', borderRadius: 6}} />
        </section>
      </div>
    </div>
  );
};

export default Home;
