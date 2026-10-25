import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingBag, Tag, User, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'My Products', icon: Package },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/my-listings', label: 'My Listings', icon: Tag },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      backgroundColor: 'var(--color-card-bg)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      padding: '20px 14px',
      height: 'fit-content',
      position: 'sticky',
      top: '90px',
    }} className="dashboard-sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.925rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-lavender-light)';
            e.currentTarget.style.color = 'var(--color-accent-lavender)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          <Home size={19} />
          <span>Home</span>
        </NavLink>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: isActive ? '#6C5BC4' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-accent-lavender-light)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={19} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 820px) {
          .dashboard-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
