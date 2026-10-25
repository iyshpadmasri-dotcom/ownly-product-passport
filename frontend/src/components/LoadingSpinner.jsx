import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'default' }) => {
  const dim = size === 'small' ? '20px' : size === 'large' ? '42px' : '28px';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '14px',
    }}>
      <div style={{
        width: dim,
        height: dim,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-accent-lavender)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />

      {text && (
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {text}
        </span>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
