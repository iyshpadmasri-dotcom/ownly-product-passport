import React from 'react';
import { Link } from 'react-router-dom';
import WarrantyBadge from './WarrantyBadge';
import { ShieldCheck, FileText, Wrench, Receipt, ArrowRight, Tag } from 'lucide-react';

import { formatINR } from '../utils/formatters';

const ProductCard = ({ product, mode = 'dashboard' }) => {
  const isMarketplace = mode === 'marketplace';
  const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  if (isMarketplace) {
    const { historyBadges, seller, price, condition, location } = product;

    return (
      <div className="card card-interactive" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', width: '100%', height: '210px', backgroundColor: '#F5F2EB' }}>
          <img
            src={product.product?.imageUrl || defaultImage}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(41, 39, 37, 0.88)',
            color: '#FFFFFF',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}>
            {formatINR(price)}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '3px 9px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {condition}
          </div>
        </div>

        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            {product.product?.brand || product.product?.category}
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px', lineHeight: 1.35 }}>
            {product.title}
          </h3>

          {/* History indicators */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {historyBadges?.purchaseRecord && (
              <span className="badge badge-lavender" title="Seller shared purchase receipt date" style={{ fontSize: '0.75rem' }}>
                <Receipt size={12} />
                <span>Purchase Record</span>
              </span>
            )}
            {historyBadges?.warrantyActive && (
              <span className="badge badge-success" title="Active warranty verified by seller" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={12} />
                <span>Warranty Info</span>
              </span>
            )}
            {historyBadges?.serviceHistory && (
              <span className="badge badge-neutral" title="Documented service history" style={{ fontSize: '0.75rem' }}>
                <Wrench size={12} />
                <span>Service History</span>
              </span>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
              {location}
            </span>

            <Link
              to={`/marketplace/${product.id}`}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              View Product
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / My Products Mode
  return (
    <div className="card card-interactive" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: '100%', height: '190px', backgroundColor: '#F5F2EB' }}>
        <img
          src={product.imageUrl || defaultImage}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = defaultImage; }}
        />

        {product.isListed && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'var(--color-accent-coral)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Tag size={12} />
            <span>Listed for Sale</span>
          </div>
        )}
      </div>

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          {product.brand || product.category}
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
          {product.name}
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <WarrantyBadge warrantyInfo={product.warrantyInfo} />
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileText size={14} color="var(--color-accent-lavender)" />
              {product.documentCount ?? 0} docs
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wrench size={14} color="var(--color-accent-coral)" />
              {product.historyCount ?? 0} events
            </span>
          </div>

          <Link
            to={`/passport/${product.id}`}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, gap: '4px' }}
          >
            <span>View Passport</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
