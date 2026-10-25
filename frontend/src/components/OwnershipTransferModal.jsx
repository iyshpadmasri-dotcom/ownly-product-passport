import React, { useState } from 'react';
import Modal from './Modal';
import { transferService } from '../services/transferService';
import { useToast } from '../context/ToastContext';
import { ArrowRightLeft, ShieldAlert, CheckCircle2, User, Mail, Lock } from 'lucide-react';

const OwnershipTransferModal = ({ isOpen, onClose, product, onTransferred }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [shareDocuments, setShareDocuments] = useState(true);
  const [shareHistory, setShareHistory] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.trim()) {
      showToast('Please enter the recipient’s email address.', 'error');
      return;
    }
    if (!confirmed) {
      showToast('Please confirm the transfer conditions.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await transferService.initiateTransfer({
        productId: product.id,
        toEmail: recipientEmail.trim(),
        notes: notes.trim(),
        shareDocuments,
        shareHistory,
      });

      if (res.success) {
        showToast(`Transfer request sent to ${recipientEmail}!`);
        onTransferred && onTransferred();
        onClose();
        setRecipientEmail('');
        setNotes('');
        setConfirmed(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Transfer failed to initiate.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Product Passport Ownership" maxWidth="560px">
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#EEF2FF',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid #C7D2FE',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ArrowRightLeft size={18} color="#4338CA" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#312E81' }}>
              Secure Lifecycle Continuity
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#3730A3', margin: 0, lineHeight: 1.5 }}>
            Ownly preserves this product's verifiable care history for the next owner. The recipient must have or create an Ownly account with this email to review and accept the transfer.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Recipient's Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="form-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. buyer@example.com"
              required
            />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
            A transfer invitation will be sent to their Ownly dashboard.
          </span>
        </div>

        {/* History and Document Sharing Permissions */}
        <div style={{
          backgroundColor: '#FAF8F4',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
            Records Permitted for Transfer:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={shareHistory}
                onChange={(e) => setShareHistory(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Transfer timeline history (purchases, services, repairs)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={shareDocuments}
                onChange={(e) => setShareDocuments(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Transfer warranty documents & public service invoices</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <Lock size={13} />
            <span>Your personal invoices, physical address, and payment credentials are kept strictly private.</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Transfer Note (optional)</label>
          <textarea
            rows="2"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Handover of device with original charger and box in Bengaluru..."
          />
        </div>

        {/* Explicit confirmation checkbox */}
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          marginBottom: '20px',
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ width: '16px', height: '16px', marginTop: '3px' }}
            />
            <span style={{ fontSize: '0.825rem', color: '#92400E', lineHeight: 1.45 }}>
              I authorize the transfer of this product passport. Once the recipient accepts, this product will belong to their account and will no longer appear in my active collection.
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !confirmed}
            className="btn btn-primary"
            style={{ backgroundColor: '#4338CA' }}
          >
            {loading ? 'Initiating Transfer...' : 'Initiate Transfer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OwnershipTransferModal;
