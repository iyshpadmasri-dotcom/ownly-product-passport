import React from 'react';
import {
  ShoppingCart,
  Wrench,
  Shield,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  ClipboardCheck,
  HeartHandshake,
  Recycle,
  FileCheck2,
  UserCheck
} from 'lucide-react';
import { formatINR, formatIndianDate, getEvidenceBadge } from '../utils/formatters';

const getEventMeta = (type) => {
  switch (type) {
    case 'Purchase':
      return { icon: ShoppingCart, color: '#6C5BC4', bg: 'var(--color-accent-lavender-light)' };
    case 'Service':
    case 'Repair':
      return { icon: Wrench, color: '#C05621', bg: 'var(--color-accent-coral-light)' };
    case 'Warranty':
      return { icon: Shield, color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    case 'Upgrade':
      return { icon: Sparkles, color: '#2B6CB0', bg: '#EBF8FF' };
    case 'Ownership Transfer':
      return { icon: ArrowRightLeft, color: '#4338CA', bg: '#EEF2FF' };
    case 'Condition Check':
      return { icon: ClipboardCheck, color: '#0D9488', bg: '#F0FDFA' };
    case 'Donation':
      return { icon: HeartHandshake, color: '#BE185D', bg: '#FDF2F8' };
    case 'Recycle':
      return { icon: Recycle, color: '#15803D', bg: '#F0FDF4' };
    default:
      return { icon: CheckCircle2, color: 'var(--color-text-secondary)', bg: '#F1EEE9' };
  }
};

const HistoryTimeline = ({ history = [], onDelete, canDelete = true }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{
        padding: '32px 20px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          No history events recorded yet. Click <strong>+ Add History</strong> to log your first service, upgrade, or milestone.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '28px' }}>
      {/* Vertical line connecting events */}
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '16px',
        bottom: '16px',
        width: '2px',
        backgroundColor: 'var(--color-border)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {history.map((event) => {
          const { icon: Icon, color, bg } = getEventMeta(event.eventType);
          const evidence = getEvidenceBadge(event.evidenceType);

          return (
            <div key={event.id} style={{ position: 'relative' }}>
              {/* Timeline node icon */}
              <div style={{
                position: 'absolute',
                left: '-28px',
                top: '4px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: bg,
                border: `2px solid ${color}`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={12} />
              </div>

              {/* Event Card Content */}
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {event.eventType}
                      </span>

                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        — {formatIndianDate(event.eventDate)}
                      </span>

                      {/* LifeTrace Evidence Source Badge */}
                      <span
                        title={evidence.title}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: evidence.bg,
                          color: evidence.color,
                        }}
                      >
                        {event.evidenceType === 'DOCUMENT_SUPPORTED' ? (
                          <FileCheck2 size={11} />
                        ) : event.evidenceType === 'VERIFIED' ? (
                          <UserCheck size={11} />
                        ) : null}
                        <span>{evidence.label}</span>
                      </span>

                      {event.cost !== null && event.cost !== undefined && event.cost > 0 && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {formatINR(event.cost)}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {event.title}
                    </h4>

                    {event.notes && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                        {event.notes}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {event.recordedBy && (
                        <span>
                          Source: <strong>{event.recordedBy}</strong>
                        </span>
                      )}
                      {event.serviceProvider && (
                        <span>
                          Provider: <strong>{event.serviceProvider}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {canDelete && !event.isTransferRecord && (
                    <button
                      onClick={() => onDelete(event)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px', color: 'var(--color-text-muted)' }}
                      title="Delete record"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTimeline;
