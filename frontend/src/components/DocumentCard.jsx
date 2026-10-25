import React from 'react';
import { Receipt, ShieldCheck, BookOpen, Wrench, FileText, Download, Trash2, ExternalLink } from 'lucide-react';
import { documentService } from '../services/documentService';

const getDocIcon = (type) => {
  switch (type) {
    case 'Purchase Bill':
      return { icon: Receipt, color: '#6C5BC4', bg: 'var(--color-accent-lavender-light)' };
    case 'Warranty':
      return { icon: ShieldCheck, color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    case 'User Manual':
      return { icon: BookOpen, color: '#2B6CB0', bg: '#EBF8FF' };
    case 'Service Records':
      return { icon: Wrench, color: '#C05621', bg: 'var(--color-accent-coral-light)' };
    default:
      return { icon: FileText, color: 'var(--color-text-secondary)', bg: '#F1EEE9' };
  }
};

const DocumentCard = ({ document, onDelete, canDelete = true }) => {
  const { icon: Icon, color, bg } = getDocIcon(document.type);
  const viewUrl = documentService.getDocumentViewUrl(document.id);

  return (
    <div
      className="card"
      style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--color-text-primary)',
            }}>
              {document.title}
            </h4>
            {document.isPublicForListing && (
              <span className="badge badge-lavender" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                Shared
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {document.type}
            </span>
            {document.fileSize && (
              <>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-border)' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {document.fileSize}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          title="Preview or download document"
          style={{ padding: '8px' }}
        >
          <ExternalLink size={16} />
        </a>

        {canDelete && (
          <button
            onClick={() => onDelete(document)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '8px', color: 'var(--color-danger)' }}
            title="Delete document"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
