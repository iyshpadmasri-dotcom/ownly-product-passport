import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { proofpackService } from '../services/proofpackService';
import { useToast } from '../context/ToastContext';
import { FileCheck, Share2, Copy, Check, ExternalLink, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ProofPackModal = ({ isOpen, onClose, product }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    includePurchaseDate: true,
    includeWarranty: true,
    includeHistory: true,
    includeConditionReport: true,
    includeDocuments: false,
    isRevoked: false,
  });
  const [shareToken, setShareToken] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const fetchConfig = async () => {
        try {
          const res = await proofpackService.getProofPackConfig(product.id);
          if (res.success && res.data) {
            setConfig({
              includePurchaseDate: res.data.includePurchaseDate,
              includeWarranty: res.data.includeWarranty,
              includeHistory: res.data.includeHistory,
              includeConditionReport: res.data.includeConditionReport,
              includeDocuments: res.data.includeDocuments,
              isRevoked: res.data.isRevoked,
            });
            setShareToken(res.data.shareToken);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchConfig();
    }
  }, [isOpen, product]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await proofpackService.createOrUpdateProofPack(product.id, config);
      if (res.success) {
        setShareToken(res.data.shareToken);
        showToast(config.isRevoked ? 'ProofPack link has been revoked.' : 'ProofPack report configured!');
      }
    } catch (err) {
      showToast('Could not configure ProofPack.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const shareableUrl = shareToken ? `${window.location.origin}/proofpack/${shareToken}` : '';

  const handleCopy = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      showToast('ProofPack link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ProofPack™ Shareable Product Report" maxWidth="560px">
      <div>
        <div style={{
          backgroundColor: '#FAF8F4',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FileCheck size={20} color="var(--color-accent-lavender)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              ProofPack for {product?.name}
            </h4>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Create a clean, privacy-conscious public verification dossier. Anyone with this link can view the permitted milestones, warranty status, and TrustCheck condition checks without seeing your private serial numbers or account details.
          </p>
        </div>

        {/* Permissions Configuration */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ marginBottom: '12px' }}>
            Choose What to Include in the Report:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includePurchaseDate}
                onChange={(e) => setConfig({ ...config, includePurchaseDate: e.target.checked })}
              />
              <span>Original purchase date & store ({product?.purchaseStore || 'Authorized Retail'})</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeWarranty}
                onChange={(e) => setConfig({ ...config, includeWarranty: e.target.checked })}
              />
              <span>Warranty validity status & expiry dates</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeHistory}
                onChange={(e) => setConfig({ ...config, includeHistory: e.target.checked })}
              />
              <span>LifeTrace service & maintenance timeline</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeConditionReport}
                onChange={(e) => setConfig({ ...config, includeConditionReport: e.target.checked })}
              />
              <span>TrustCheck diagnostic condition report</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.includeDocuments}
                onChange={(e) => setConfig({ ...config, includeDocuments: e.target.checked })}
              />
              <span>Seller-approved public document titles</span>
            </label>
          </div>
        </div>

        {/* Link revocation toggle */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: config.isRevoked ? 'var(--color-danger-bg)' : '#F0FDF4',
          border: `1px solid ${config.isRevoked ? 'rgba(211,47,47,0.2)' : 'rgba(22,163,74,0.2)'}`,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: config.isRevoked ? 'var(--color-danger)' : '#15803D' }}>
              Link Status: {config.isRevoked ? 'Revoked (Private)' : 'Active (Shareable)'}
            </span>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {config.isRevoked ? 'Nobody can access this report link.' : 'Anyone with the link can view permitted details.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfig({ ...config, isRevoked: !config.isRevoked })}
            className={`btn btn-sm ${config.isRevoked ? 'btn-secondary' : 'btn-danger'}`}
          >
            {config.isRevoked ? 'Re-activate Link' : 'Revoke Link'}
          </button>
        </div>

        {/* Active Shareable Link box if available */}
        {shareToken && !config.isRevoked && (
          <div style={{
            backgroundColor: '#FAF8F4',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Public ProofPack URL:
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={shareableUrl}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-secondary)',
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{ gap: '4px' }}
              >
                {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={shareableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ gap: '4px' }}
              >
                <ExternalLink size={14} />
                <span>View</span>
              </a>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : shareToken ? 'Update Report Link' : 'Generate ProofPack Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProofPackModal;
