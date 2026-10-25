import React, { useState } from 'react';
import Modal from './Modal';
import { secondLifeService } from '../services/secondLifeService';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Wrench, HeartHandshake, Recycle, ArrowRight, CheckCircle2 } from 'lucide-react';

const SecondLifeModal = ({ isOpen, onClose, product, onOpenSellModal, onActionRecorded }) => {
  const { showToast } = useToast();
  const [selectedAction, setSelectedAction] = useState(null); // 'REPAIR' | 'DONATE' | 'RECYCLE' | null
  const [loading, setLoading] = useState(false);

  // Form states for Repair / Donate / Recycle
  const [formData, setFormData] = useState({
    title: '',
    partnerOrCenter: '',
    cost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSelectOption = (option) => {
    if (option === 'SELL') {
      onClose();
      onOpenSellModal();
    } else {
      setSelectedAction(option);
      if (option === 'REPAIR') {
        setFormData({
          title: `Repair / Service for ${product?.name}`,
          partnerOrCenter: 'Local Authorized Service Centre',
          cost: '',
          notes: 'Scheduled or required maintenance checkup.',
          date: new Date().toISOString().split('T')[0],
        });
      } else if (option === 'DONATE') {
        setFormData({
          title: `Donated ${product?.name}`,
          partnerOrCenter: 'Goonj / Local Community NGO',
          cost: '',
          notes: 'Donated in functional condition to a community welfare initiative.',
          date: new Date().toISOString().split('T')[0],
        });
      } else if (option === 'RECYCLE') {
        setFormData({
          title: `E-Waste Recycled: ${product?.name}`,
          partnerOrCenter: 'Authorized E-Waste Collection Facility',
          cost: '',
          notes: 'Safely handed over for responsible material recycling and disposal.',
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await secondLifeService.recordAction(product.id, {
        actionType: selectedAction,
        details: {
          title: formData.title,
          notes: formData.notes,
        },
        partnerOrCenter: formData.partnerOrCenter,
        cost: formData.cost,
        date: formData.date,
      });

      if (res.success) {
        showToast(`SecondLife ${selectedAction.toLowerCase()} action logged on product timeline!`);
        onActionRecorded && onActionRecorded();
        setSelectedAction(null);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not record action.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setSelectedAction(null); onClose(); }}
      title={selectedAction ? `SecondLife: Record ${selectedAction}` : "SecondLife™ — Responsible Next Steps"}
      maxWidth="580px"
    >
      {!selectedAction ? (
        <div>
          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            Products shouldn't end up forgotten in a closet or in a landfill. Choose a responsible next step for your <strong>{product?.name}</strong>:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '16px' }}>
            {/* 1. Sell */}
            <button
              type="button"
              onClick={() => handleSelectOption('SELL')}
              className="card card-interactive"
              style={{
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-lavender-light)',
                color: '#6C5BC4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                  1. Sell
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  List on Ownly marketplace with verified care records.
                </p>
              </div>
            </button>

            {/* 2. Repair */}
            <button
              type="button"
              onClick={() => handleSelectOption('REPAIR')}
              className="card card-interactive"
              style={{
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-coral-light)',
                color: 'var(--color-accent-coral-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wrench size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                  2. Repair
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Record a required service or fix to extend its useful life.
                </p>
              </div>
            </button>

            {/* 3. Donate */}
            <button
              type="button"
              onClick={() => handleSelectOption('DONATE')}
              className="card card-interactive"
              style={{
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FDF2F8',
                color: '#BE185D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <HeartHandshake size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                  3. Donate
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Document donation to a community member, school, or NGO.
                </p>
              </div>
            </button>

            {/* 4. Recycle */}
            <button
              type="button"
              onClick={() => handleSelectOption('RECYCLE')}
              className="card card-interactive"
              style={{
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Recycle size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                  4. Recycle
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Safely hand over to an authorized e-waste recycler.
                </p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Action Record Form */
        <form onSubmit={handleSubmitAction}>
          <div className="form-group">
            <label className="form-label">Action Record Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">
                {selectedAction === 'REPAIR' ? 'Service Centre / Repair Shop' : selectedAction === 'DONATE' ? 'Recipient Organization / NGO' : 'Authorized Recycler'}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.partnerOrCenter}
                onChange={(e) => setFormData({ ...formData, partnerOrCenter: e.target.value })}
                placeholder="e.g. Croma Service, Goonj NGO..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          {selectedAction === 'REPAIR' && (
            <div className="form-group">
              <label className="form-label">Cost in ₹ (optional)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="₹ e.g. 1500"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes & Details</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any details on condition, components, or tracking..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setSelectedAction(null)}
              className="btn btn-secondary"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Recording...' : `Confirm ${selectedAction.toLowerCase()}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SecondLifeModal;
