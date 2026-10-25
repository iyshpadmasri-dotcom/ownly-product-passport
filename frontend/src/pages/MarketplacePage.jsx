import React, { useState, useEffect, useMemo } from 'react';
import { marketplaceService } from '../services/marketplaceService';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { INDIAN_STATES } from '../utils/formatters';
import { ShoppingBag, SlidersHorizontal, X, MapPin } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Smartphones & Tablets',
  'Laptops & Computers',
  'Two-Wheelers & Bicycles',
  'Cars & Automobiles',
  'Audio & Headphones',
  'Home & Kitchen Appliances',
  'Furniture',
  'Smart Watches',
  'Cameras & Photography',
  'Books & Study',
  'Sports & Fitness',
];
const CONDITIONS = ['All', 'Brand New', 'Like New', 'Excellent', 'Good', 'Fair'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        ...(search && { search }),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(selectedCondition !== 'All' && { condition: selectedCondition }),
        ...(selectedState !== 'All' && { state: selectedState }),
        ...(maxPrice && { maxPrice }),
        sortBy,
      };
      const res = await marketplaceService.getListings(params);
      if (res.success && res.data) {
        setListings(res.data);
      }
    } catch (err) {
      console.error('Failed to load marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedCondition, selectedState, sortBy]);

  // Debounced or direct search trigger on enter / clear
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedState('All');
    setSortBy('newest');
    setMaxPrice('');
  };

  const hasActiveFilters =
    search !== '' || selectedCategory !== 'All' || selectedCondition !== 'All' || selectedState !== 'All' || maxPrice !== '';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--color-accent-lavender)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Second-Hand with a Past You Can Trust
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '6px', marginBottom: '12px' }}>
          Ownly Marketplace
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
          Browse pre-owned electronics, furniture, vehicles, and tools with their verified digital history records.
        </p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '32px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search marketplace (e.g. iPhone, Herman Miller, Specialized)..."
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
            Search
          </button>
        </form>

        {/* Category Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '16px 0 12px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--color-accent-lavender)' : '#FAF8F4',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--color-accent-lavender)' : 'var(--color-border)'}`,
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Condition, Max Price, Sort */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Condition dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Condition:</span>
              <select
                className="form-select"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Indian State dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="var(--color-accent-lavender)" /> State:
              </span>
              <select
                className="form-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="All">All India</option>
                {INDIAN_STATES.slice(0, 15).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Max Price (₹):</span>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={fetchListings}
                style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-danger)', gap: '4px' }}
              >
                <X size={14} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Sort by:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <LoadingSpinner text="Loading marketplace products..." />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products found"
          description={hasActiveFilters ? "Try broadening your search or clearing active filters to see all available listings." : "No listings are currently published on the marketplace."}
          actionText={hasActiveFilters ? "Clear All Filters" : null}
          onAction={hasActiveFilters ? handleClearFilters : null}
        />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Showing {listings.length} {listings.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="grid-3">
            {listings.map((item) => (
              <ProductCard key={item.id} product={item} mode="marketplace" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
