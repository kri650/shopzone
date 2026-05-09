import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/marketplace/ProductCard';
import { productService } from '../../services/productService';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const Products = () => {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchQ = params.get('search') || '';
  const categoryQ = params.get('category') || '';
  const pageQ = Number(params.get('page') || 1);

  const categoryLabel = useMemo(() => {
    if (!categoryQ) return '';
    const q = String(categoryQ);
    const found = categories.find((c) => c?._id === q || c?.slug === q || String(c?.name || '').toLowerCase() === q.toLowerCase());
    return found?.name || q;
  }, [categoryQ, categories]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getProducts({
          search: searchQ || undefined,
          category: categoryQ || undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          minRating: minRating || undefined,
          brand: selectedBrands[0] || undefined,
          sort,
          page: pageQ,
          limit: 12
        });
        setProducts(data.items || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQ, categoryQ, sort, priceRange, minRating, selectedBrands, pageQ]);

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))], [products]);

  const filtered = products;

  const toggleBrand = (brand) => setSelectedBrands(prev =>
    prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
  );

  const setCategory = (cat) => {
    const p = new URLSearchParams(params);
    if (cat) p.set('category', cat); else p.delete('category');
    p.delete('page');
    setParams(p);
  };

  const setPage = (page) => {
    const p = new URLSearchParams(params);
    p.set('page', String(page));
    setParams(p);
  };

  const handleClearAll = () => {
    setPriceRange([0, 200000]);
    setMinRating(0);
    setSelectedBrands([]);
    setSort('featured');
    setCategory('');
  };

  return (
    <div className="products-page container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: '#333' }}>Filters</h2>
          {(minRating > 0 || priceRange[0] > 0 || priceRange[1] < 200000 || selectedBrands.length > 0 || categoryQ) && (
            <button 
              type="button"
              onClick={handleClearAll} 
              style={{ background: 'none', border: 'none', color: '#0066c0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Department</h3>
          <ul className="sidebar-list">
            <li className={!categoryQ ? 'active' : ''} onClick={() => setCategory('')}>All Categories</li>
            {categories.map(c => (
              <li key={c._id} className={categoryQ === c._id ? 'active' : ''} onClick={() => setCategory(c._id)}>
                {c.icon || '•'} {c.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Avg. Customer Review</h3>
          {[4, 3, 2].map(r => (
            <div 
              key={r} 
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer', padding: '6px 0', color: minRating === r ? '#e47911' : '#333', fontWeight: minRating === r ? 'bold' : 'normal' }}
            >
              <span className="stars" style={{ color: '#ff9900', fontSize: '0.95rem' }}>
                {'★'.repeat(r)}{'☆'.repeat(5 - r)}
              </span>
              <span>& Up</span>
              {minRating === r && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#c5221f' }}>✕</span>}
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Price</h3>
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={priceRange[0] || ''} onChange={e => setPriceRange([+e.target.value || 0, priceRange[1]])} />
            <span>–</span>
            <input type="number" placeholder="Max" value={priceRange[1] || ''} onChange={e => setPriceRange([priceRange[0], +e.target.value || 200000])} />
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Brand</h3>
          <ul className="sidebar-list">
            {brands.map(b => (
              <li key={b}>
                <label className="sidebar-check">
                  <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* MAIN RESULTS */}
      <main className="products-main">
        <div className="products-topbar">
          <div className="results-info">
            {searchQ && <span>Results for "<b>{searchQ}</b>" – </span>}
            {categoryQ && <span>Category: <b>{categoryLabel}</b> – </span>}
            <span>{pagination.total} results</span>
          </div>
          <div className="sort-bar">
            <span>Sort by:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="no-results"><h3>Loading products...</h3></div>
        ) : error ? (
          <div className="no-results"><h3>{error}</h3></div>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3>No results found</h3>
            <p>Try different keywords or clear filters</p>
          </div>
        ) : (
          <>
            <div className="products-grid-4">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>Previous</button>
                <span style={{ alignSelf: 'center' }}>Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Products;
