import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { proofpackService } from '../services/proofpackService';
import { formatINR, formatIndianDate, getEvidenceBadge } from '../utils/formatters';
import WarrantyBadge from '../components/WarrantyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Printer,
  Calendar,
  Store,
  CheckCircle2,
  FileCheck2,
  Lock,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  ClipboardCheck,
  Check
} from 'lucide-react';

const ProofPackViewPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProofPack = async () => {
      setLoading(true);
      try {
        const res = await proofpackService.getPublicProofPack(token);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'ProofPack report not found or has been revoked.');
      } finally {
        setLoading(false);
      }
    };

    fetchProofPack();
  }, [token]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <LoadingSpinner text="Generating verifiable ProofPack report..." size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '520px', textAlign: 'center', padding: '80px 20px' }}>
        <div className="card" style={{ padding: '40px 32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <AlertCircle size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '8px' }}>
            Report Unavailable
          </h2>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {error || 'This ProofPack link has expired or been revoked by the product owner.'}
          </p>
          <Link to="/" className="btn btn-secondary">
            Return to Ownly Home
          </Link>
        </div>
      </div>
    );
  }

  const { product, conditionAssessment, history, documents, owner } = data;

  return (
    <div className="page-wrapper proofpack-print-container" style={{ maxWidth: '820px', padding: '40px 20px 80px' }}>
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link
          to="/marketplace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Ownly Platform</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <Printer size={15} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Main Report Document Sheet */}
      <div className="card proofpack-sheet" style={{ padding: '40px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
        {/* Certificate Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: '24px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent-lavender)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShieldCheck size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Ownly ProofPack™
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Digital Product Passport • Verifiable Ownership & Care Dossier
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FAF8F4',
              border: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}>
              ID #{token.substring(0, 10).toUpperCase()}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Generated: {formatIndianDate(data.createdAt)}
            </p>
          </div>
        </div>

        {/* Product Overview Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          gap: '24px',
          alignItems: 'center',
          marginBottom: '32px',
        }} className="proofpack-overview-grid">
          <div style={{
            width: '100%',
            height: '160px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: '#F5F2EB',
          }}>
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span className="badge badge-lavender">{product.category}</span>
              {product.warrantyInfo && <WarrantyBadge warrantyInfo={product.warrantyInfo} />}
              {product.condition && <span className="badge badge-neutral">Condition: {product.condition}</span>}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px' }}>
              {product.name}
            </h1>

            {(product.brand || product.model) && (
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                {[product.brand, product.model].filter(Boolean).join(' • ')}
              </p>
            )}

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              {product.purchasePrice && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Purchase Price</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{formatINR(product.purchasePrice)}</p>
                </div>
              )}
              {product.purchaseDate && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Purchase Date</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{formatIndianDate(product.purchaseDate)}</p>
                </div>
              )}
              {product.purchaseStore && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source Store</span>
                  <p style={{ fontWeight: 700, margin: 0 }}>{product.purchaseStore}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TrustCheck Condition Report Section */}
        {conditionAssessment && (
          <div style={{
            backgroundColor: '#FAF8F4',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--color-border)',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCheck size={20} color="#0D9488" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  TrustCheck™ Condition Assessment
                </h3>
              </div>

              <span className={`badge ${conditionAssessment.evidenceStatus === 'DOCUMENT_SUPPORTED' ? 'badge-success' : 'badge-neutral'}`}>
                {conditionAssessment.evidenceStatus === 'DOCUMENT_SUPPORTED' ? 'Document-Supported' : 'Self-Reported by Seller'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}>
              {Object.entries(conditionAssessment.checklist || {}).map(([key, item]) => (
                <div key={key} style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{key}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: item.status === 'Good' ? '#15803D' : item.status === 'Minor Issue' ? '#D97706' : '#DC2626',
                    }}>
                      {item.status}
                    </span>
                  </div>
                  {item.notes && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {conditionAssessment.notes && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }}>
                "{conditionAssessment.notes}"
              </p>
            )}
          </div>
        )}

        {/* LifeTrace Timeline Section */}
        {history && history.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
              LifeTrace™ Care & Service History
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Chronological milestones documented in this product's digital passport.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((h) => {
                const evidence = getEvidenceBadge(h.evidenceType);
                return (
                  <div key={h.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    gap: '12px',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent-lavender)', textTransform: 'uppercase' }}>
                          {h.eventType}
                        </span>
                        <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                          • {formatIndianDate(h.eventDate)}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: evidence.bg,
                          color: evidence.color,
                          padding: '1px 7px',
                          borderRadius: 'var(--radius-full)',
                        }}>
                          {evidence.label}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                        {h.title}
                      </h4>

                      {h.notes && (
                        <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                          {h.notes}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {h.cost && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {formatINR(h.cost)}
                        </span>
                      )}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        Source: {h.recordedBy}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Public Documents Section */}
        {documents && documents.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>
              Attached Official Records
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#FAF8F4',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {doc.title} ({doc.type})
                  </span>
                  <a
                    href={`/api/documents/${doc.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redaction & Privacy Notice */}
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FAF8F4',
          border: '1px dashed var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}>
          <Lock size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Ownly Privacy Standard:</strong> Hardware serial numbers, device IMEIs, personal billing addresses, and payment details are strictly redacted to protect the owner’s privacy.
          </span>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #FFFFFF !important;
          }
          .proofpack-print-container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .proofpack-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .proofpack-overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProofPackViewPage;
