import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'Your collection starts here.',
  description = 'Add your first product to keep its details, bills, and warranty information organized.',
  actionText = 'Add Your First Product',
  onAction,
  actionLink,
}) => {
  return (
    <div style={{
      padding: '64px 24px',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-xl)',
      border: '1.5px dashed var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '560px',
      margin: '0 auto',
    }}>
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '20px',
        backgroundColor: 'var(--color-accent-lavender-light)',
        color: 'var(--color-accent-lavender)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Icon size={34} strokeWidth={1.8} />
      </div>

      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: '28px', lineHeight: 1.5 }}>
        {description}
      </p>

      {actionText && (
        onAction ? (
          <button onClick={onAction} className="btn btn-primary btn-lg">
            {actionText}
          </button>
        ) : actionLink ? (
          <a href={actionLink} className="btn btn-primary btn-lg">
            {actionText}
          </a>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
