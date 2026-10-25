import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { transferService } from '../services/transferService';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, Tag, ShieldCheck, Plus, Filter, ArrowRightLeft } from 'lucide-react';

const CATEGORY_FILTERS = [
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

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, listedForSale: 0, underWarranty: 0 });
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [productsRes, summaryRes, transfersRes] = await Promise.all([
          productService.getProducts(),
          productService.getSummary(),
          transferService.getTransfers().catch(() => ({ data: { incoming: [] } })),
        ]);

        if (productsRes.success) setProducts(productsRes.data);
        if (summaryRes.success) setSummary(summaryRes.data);
        if (transfersRes.data?.incoming) setPendingTransfers(transfersRes.data.incoming);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.model && p.model.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <Sidebar />

        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          {/* Pending Transfer Alert Banner */}
          {pendingTransfers.length > 0 && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ArrowRightLeft size={22} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#92400E', fontSize: '0.95rem', display: 'block' }}>
                    {pendingTransfers.length} Incoming Ownership Transfer Request{pendingTransfers.length > 1 ? 's' : ''}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#B45309' }}>
                    Another user has initiated a product ownership transfer to your account.
                  </p>
                </div>
              </div>
              <Link to="/my-listings" className="btn btn-primary btn-sm" style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}>
                Review Transfers
              </Link>
            </div>
          )}

          {/* Welcome Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Hey, welcome back!
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Your products and their stories, all in one place.
              </p>
            </div>

            <Link to="/add-product" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
              <Plus size={20} />
              <span>+ Add a Product</span>
            </Link>
          </div>

          {/* 3 Simple Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '18px',
            marginBottom: '36px',
          }} className="summary-grid">
            {/* Card 1: My Products */}
            <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-accent-lavender-light)',
                color: '#6C5BC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Package size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  My Products
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  {summary.totalProducts}
                </h3>
              </div>
            </div>

            {/* Card 2: Listed for Sale */}
            <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-accent-coral-light)',
                color: 'var(--color-accent-coral-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Tag size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Listed for Sale
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  {summary.listedForSale}
                </h3>
              </div>
            </div>

            {/* Card 3: Under Warranty */}
            <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Under Warranty
                </span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  {summary.underWarranty}
                </h3>
              </div>
            </div>
          </div>

          {/* My Products Section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                My Products
              </h2>

              <div style={{ maxWidth: '340px', width: '100%' }}>
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Filter by name or brand..."
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            {products.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '20px',
              }}>
                {CATEGORY_FILTERS.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: isSelected ? 'var(--color-accent-lavender)' : '#FFFFFF',
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
            )}

            {/* Products Grid or Empty State */}
            {loading ? (
              <LoadingSpinner text="Fetching your product passports..." />
            ) : products.length === 0 ? (
              <EmptyState
                title="Your collection starts here."
                description="Add your first product to keep its details, bills, and warranty information organized."
                actionText="Add Your First Product"
                actionLink="/add-product"
              />
            ) : filteredProducts.length === 0 ? (
              <div style={{
                padding: '48px 20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  No products matched "{search}".
                </p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '12px' }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} mode="dashboard" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
