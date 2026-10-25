import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import ProductCard from '../components/ProductCard';
import {
  ShieldCheck,
  PlusCircle,
  FolderArchive,
  ArrowRightLeft,
  CheckCircle2,
  Receipt,
  Wrench,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await marketplaceService.getListings();
        if (res.success && res.data) {
          setRecentListings(res.data.slice(0, 3));
        }
      } catch {
        // Quiet fallback
      }
    };
    fetchRecent();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '60px 24px 20px',
        width: '100%',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '48px',
          alignItems: 'center',
        }} className="hero-grid">
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-accent-lavender-light)',
              color: '#6C5BC4',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              <Sparkles size={16} />
              <span>Digital Product Passports for Everyday Things</span>
            </div>

            <h1 style={{
              fontSize: '3.1rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              color: 'var(--color-text-primary)',
            }}>
              Your things.<br />
              Their stories.<br />
              <span style={{ color: 'var(--color-accent-lavender)' }}>All in one place.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
              marginBottom: '36px',
              maxWidth: '520px',
            }}>
              Keep your product details, bills, warranties, and repair history together.
              Ready to sell something? Give its next owner a clearer picture of its journey.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link
                to={isAuthenticated ? '/add-product' : '/register'}
                className="btn btn-primary btn-lg"
                style={{ boxShadow: '0 4px 18px rgba(169, 154, 232, 0.45)' }}
              >
                Create Your First Passport
              </Link>
              <Link to="/marketplace" className="btn btn-secondary btn-lg">
                Explore Marketplace
              </Link>
            </div>
          </div>

          {/* Hero Visual Card Stack */}
          <div style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '18px' }}>
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"
                  alt="iPhone 15 Pro Max"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(41, 39, 37, 0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <ShieldCheck size={14} color="var(--color-accent-lavender)" />
                  <span>Passport #OW-8924</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>iPhone 15 Pro Max</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Apple • Natural Titanium</p>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                  <ShieldCheck size={13} />
                  <span>Warranty Active</span>
                </span>
              </div>

              {/* Verified passport mini items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#FAF8F4',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={16} color="var(--color-accent-lavender)" />
                    Original Tax Invoice
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>15 Oct 2024</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#FAF8F4',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} color="var(--color-accent-coral)" />
                    Apple Battery Diagnostic (99%)
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>20 Aug 2025</span>
                </div>
              </div>
            </div>

            {/* Overlapping small floating badge */}
            <div style={{
              position: 'absolute',
              bottom: '-16px',
              left: '-16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Clear History
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Ready to pass on to next owner
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-accent-lavender)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Simple & Effortless
          </span>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px' }}>
            How Ownly Works
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto 52px' }}>
            Three straightforward steps to take control of what you own and protect its value.
          </p>

          <div className="grid-3" style={{ textAlign: 'left' }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-accent-lavender-light)',
                color: '#6C5BC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <PlusCircle size={28} />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                STEP 1
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                Add your things
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Create a digital passport for the products you own with our quick two-step form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-accent-coral-light)',
                color: 'var(--color-accent-coral-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <FolderArchive size={28} />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                STEP 2
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                Keep everything organized
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                Store bills, warranties, manuals, and repair records together in one safe place.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <ArrowRightLeft size={28} />
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                STEP 3
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                Pass it on
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                List products you no longer need and share selected history with potential buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Listed on Marketplace */}
      {recentListings.length > 0 && (
        <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-lavender)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Second-Hand with Certainty
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px' }}>
                Recently Listed Products
              </h2>
            </div>

            <Link to="/marketplace" className="btn btn-secondary" style={{ gap: '6px' }}>
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {recentListings.map((listing) => (
              <ProductCard key={listing.id} product={listing} mode="marketplace" />
            ))}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          padding: '48px 36px',
        }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center' }}>
            Why Ownly is Better Than a Drawer Full of Receipts
          </h2>

          <div className="grid-3" style={{ gap: '28px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-lavender-light)',
                color: '#6C5BC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Receipt size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Never lose a receipt</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Snap a photo or attach your purchase PDF. No faded ink, no searching through shoe boxes.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-coral-light)',
                color: 'var(--color-accent-coral-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Track warranty expiration</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Know exactly when your device or appliance is covered without hunting through fine print.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Higher resale value</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Buyers pay more when you can prove how well you cared for your things with real records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div style={{
          backgroundColor: 'var(--color-text-primary)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
            Start organizing what you own today
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#D5CEC4', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Create your account in under 30 seconds. No credit card, no complex configuration.
          </p>
          <Link to={isAuthenticated ? '/add-product' : '/register'} className="btn btn-primary btn-lg">
            Create Your First Passport
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '32px 24px 0',
        width: '100%',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--color-accent-lavender)" />
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Ownly</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>— Everything you own, all in one place.</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          © {new Date().getFullYear()} Ownly Inc. Simple, beautiful digital product passports.
        </p>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
