import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';
import { productService } from '../../services/productService';

const defaultNotifications = [
  {
    id: 'n1',
    text: 'Your order ORD-20260501-8483 has been shipped!',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'n2',
    text: 'Special promo active: Use coupon FLAT100 for flat ₹100 off on orders above ₹500!',
    time: '1 day ago',
    read: false
  },
  {
    id: 'n3',
    text: 'Welcome to ShopZone India! Complete your profile to get personalized suggestions.',
    time: '2 days ago',
    read: true
  }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef();
  const blurTimeoutRef = useRef();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('shopzone_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      localStorage.setItem('shopzone_notifications', JSON.stringify(defaultNotifications));
      setNotifications(defaultNotifications);
    }
  }, []);

  useEffect(() => {
    const handleAddNotif = (e) => {
      const newNotif = {
        id: 'n_' + Date.now(),
        text: e.detail.text,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        localStorage.setItem('shopzone_notifications', JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener('add_notification', handleAddNotif);
    return () => window.removeEventListener('add_notification', handleAddNotif);
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('shopzone_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('shopzone_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

     setLoadingSuggestions(true);
     if (debounceRef.current) clearTimeout(debounceRef.current);
     debounceRef.current = setTimeout(async () => {
       try {
         // fetch top matching products
         const response = await productService.getProducts({ search: search.trim(), limit: 12 });
         const items = response.items || [];

         const q = search.trim().toLowerCase();
         const brandSet = new Set();
         const brandSuggestions = [];

         // collect unique brands that start with the query (prefix match)
         for (const it of items) {
           if (it.brand) {
             const b = (it.brand || '').toString();
             if (!brandSet.has(b) && b.toLowerCase().startsWith(q)) {
               brandSet.add(b);
               brandSuggestions.push({ type: 'brand', brand: b, name: b });
             }
           }
         }

         // map product suggestions (dedupe by id)
         const seen = new Set();
         const productSuggestions = [];
         for (const it of items) {
           if (!seen.has(it._id)) {
             seen.add(it._id);
             productSuggestions.push({ type: 'product', ...it });
           }
         }

         // final suggestion list: brands first then products, limit to 8
         const merged = [...brandSuggestions, ...productSuggestions].slice(0, 8);
         setSuggestions(merged);
       } catch (err) {
         setSuggestions([]);
       } finally {
         setLoadingSuggestions(false);
       }
     }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardLink = () => {
    if (!user) return null;
    return '/dashboard';
  };

  return (
    <header className="navbar">
      <div className="nav-top">
        <Link to="/" className="nav-logo">ShopZone<span>.in</span></Link>

        <div className="nav-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <div>
            <span className="nav-location-label">Deliver to</span>
            <span className="nav-location-city">New Delhi 110001</span>
          </div>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <select value={category} onChange={e => setCategory(e.target.value)} className="nav-search-cat">
            <option value="">All</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option value="home-kitchen">Home & Kitchen</option>
            <option>Beauty</option>
            <option>Books</option>
            <option>Sports</option>
          </select>
          <input
            type="text"
            placeholder="Search products, brands and more..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShowSuggestions(true);
              setHighlighted(-1);
            }}
            onKeyDown={e => {
              if (!showSuggestions) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlighted(i => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlighted(i => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                if (highlighted >= 0 && suggestions[highlighted]) {
                  e.preventDefault();
                  const item = suggestions[highlighted];
                  navigate(`/products/${item._id}`);
                  setSearch('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            onBlur={() => {
              // delay hiding so click handlers on suggestions fire
              blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 120);
            }}
            onFocus={() => {
              if (suggestions.length) setShowSuggestions(true);
            }}
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#131921" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions" role="listbox">
            {loadingSuggestions ? (
              <div className="suggestion-loading">Loading...</div>
            ) : (
              <ul>
                  {suggestions.map((item, idx) => (
                    <li
                      key={item.type === 'brand' ? `brand-${item.brand}` : item._id}
                      role="option"
                      aria-selected={highlighted === idx}
                      className={`search-suggestion-item ${highlighted === idx ? 'highlight' : ''}`}
                      onMouseDown={e => e.preventDefault()} /* prevent input blur before click */
                      onClick={() => {
                        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
                        if (item.type === 'brand') {
                          // navigate to product list filtered by brand
                          navigate(`/products?brand=${encodeURIComponent(item.brand)}`);
                        } else {
                          navigate(`/products/${item._id}`);
                        }
                        setSearch('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      onMouseEnter={() => setHighlighted(idx)}
                    >
                      <div className="suggestion-name">{item.name}</div>
                      <div className="suggestion-meta">
                        {item.type === 'brand' ? 'Brand' : `${item.brand || ''} ${item.category?.name ? `• ${item.category.name}` : ''}`}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        <div className="nav-actions">
          {user ? (
            <div className="nav-account dropdown">
              <div className="nav-action-item">
                <span className="nav-action-label">Hello, {user.name?.split(' ')[0]}</span>
                <span className="nav-action-main">Account ▾</span>
              </div>
              <div className="dropdown-menu">
                {getDashboardLink() && <Link to={getDashboardLink()}>Dashboard</Link>}
                <Link to="/my-orders">My Orders</Link>
                <Link to="/account">Profile</Link>
                <hr />
                <button onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-action-item">
              <span className="nav-action-label">Hello, sign in</span>
              <span className="nav-action-main">Account ▾</span>
            </Link>
          )}

          {/* NOTIFICATION BELL */}
          <div className="nav-notif dropdown" ref={notifRef} style={{ position: 'relative' }}>
            <div className="nav-action-item" onClick={handleToggleNotifications} style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zm-10 13a4 4 0 0 0 8 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -5, right: -5,
                    background: '#f0c14b',
                    color: '#111',
                    borderRadius: '50%',
                    width: 16, height: 16,
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #131921'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="nav-action-main">Inbox ▾</span>
            </div>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: -40,
                background: '#fff',
                width: 320,
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                color: '#333',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      style={{ background: 'none', border: 'none', color: '#0066c0', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f5f5f5',
                          background: notif.read ? '#fff' : '#f7faff',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: notif.read ? 'transparent' : '#0066c0', marginTop: 5, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', lineHeight: '1.4', fontWeight: notif.read ? 'normal' : '600', textAlign: 'left' }}>
                              {notif.text}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#888', marginTop: 4, display: 'block', textAlign: 'left' }}>{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link to="/my-orders" className="nav-action-item">
            <span className="nav-action-label">Returns</span>
            <span className="nav-action-main">& Orders</span>
          </Link>

          <Link to="/cart" className="nav-cart">
            <div className="nav-cart-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="nav-cart-count">{count}</span>
            </div>
            <span className="nav-action-main">Cart</span>
          </Link>
        </div>
      </div>

      <nav className="nav-bottom">
        <div className="nav-bottom-inner">
          <Link to="/products" className="nav-bottom-link nav-all">☰ All</Link>
          <Link to="/products?sort=price_asc" className="nav-bottom-link">Today's Deals</Link>
          <Link to="/products?category=Electronics" className="nav-bottom-link">Mobiles</Link>
          <Link to="/products?category=Electronics" className="nav-bottom-link">Electronics</Link>
          <Link to="/products?category=Fashion" className="nav-bottom-link">Fashion</Link>
          <Link to="/products?category=home-kitchen" className="nav-bottom-link">Home & Kitchen</Link>
          <Link to="/products?category=Books" className="nav-bottom-link">Books</Link>
          <Link to="/products?category=Sports" className="nav-bottom-link">Sports</Link>
          <Link to="/products?category=Beauty" className="nav-bottom-link">Beauty</Link>
          <Link to="/products?category=Groceries" className="nav-bottom-link">Groceries</Link>
          <Link to="/products?category=Toys" className="nav-bottom-link">Toys</Link>
          <Link to="/products?category=Gaming" className="nav-bottom-link">Gaming</Link>
          <a href="https://shopzon-vendor-dashboard.vercel.app/login" target="_blank" rel="noreferrer" className="nav-bottom-link nav-sell">Become a Seller</a>
          <a href="https://shopzon-vendor-dashboard.vercel.app/login" target="_blank" rel="noreferrer" className="nav-bottom-link" style={{color:'#ff9900', fontWeight:700}}>Sell on ShopZone</a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;