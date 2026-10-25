import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Menu, X, User, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'rgba(250, 248, 244, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1160px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-accent-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(169, 154, 232, 0.35)',
          }}>
            <ShieldCheck size={22} strokeWidth={2.3} />
          </div>
          <div>
            <span style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
            }}>
              Ownly
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '-3px',
            }}>
              Product Passports
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            to="/marketplace"
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive('/marketplace') ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Marketplace
          </Link>

          {!isAuthenticated ? (
            <>
              <a
                href="/#how-it-works"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                How It Works
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 16px' }}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '9px 18px' }}>
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                to="/dashboard"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/dashboard') ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/my-listings"
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive('/my-listings') ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
                }}
              >
                My Listings
              </Link>

              <Link to="/add-product" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                <Plus size={16} />
                <span>Add Product</span>
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px 4px 4px',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {currentUser?.name?.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '42px',
                      width: '200px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '8px',
                      zIndex: 101,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        {currentUser?.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-lavender-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User size={16} />
                      <span>Profile & Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-danger)',
                        borderRadius: '8px',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            padding: '8px',
            color: 'var(--color-text-primary)',
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Marketplace
          </Link>

          {!isAuthenticated ? (
            <>
              <a
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                How It Works
              </a>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                Dashboard
              </Link>
              <Link
                to="/my-listings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                My Listings
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                Profile & Settings
              </Link>
              <Link
                to="/add-product"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
              >
                + Add a Product
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
