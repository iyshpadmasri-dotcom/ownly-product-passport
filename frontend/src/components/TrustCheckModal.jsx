import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { conditionService } from '../services/conditionService';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, XCircle, FileText } from 'lucide-react';

const getChecklistForCategory = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('smartphone') || cat.includes('electronic') || cat.includes('laptop') || cat.includes('tablet')) {
    return [
      { key: 'screen', label: 'Screen & Display Panel', desc: 'Glass integrity, dead pixels, touch response, scratches' },
      { key: 'battery', label: 'Battery Performance & Health', desc: 'Battery backup duration, charging cycle behavior' },
      { key: 'camera', label: 'Camera & Flash', desc: 'Front/rear sensors, autofocus, lens glass clarity' },
      { key: 'charging', label: 'Ports, Speakers & Microphones', desc: 'USB/Lightning connection, audio clarity, call mic' },
      { key: 'physical', label: 'Body Frame & Back Panel', desc: 'Dents, corner scuffs, button clickiness' },
      { key: 'repairs', label: 'Previous Known Repairs', desc: 'Third-party screen replacement or battery change' },
    ];
  } else if (cat.includes('vehicle') || cat.includes('bike') || cat.includes('car') || cat.includes('scooter')) {
    return [
      { key: 'frame', label: 'Frame & Bodywork', desc: 'Structural alignment, cracks, dents, welds' },
      { key: 'brakes', label: 'Brakes & Stopping Power', desc: 'Pads/shoes wear, fluid lines, cable tension' },
      { key: 'drivetrain', label: 'Engine / Motor & Transmission', desc: 'Gears, chain, motor output, clutch feel' },
      { key: 'tires', label: 'Tires & Wheels', desc: 'Tread depth, puncture repairs, rim balance' },
      { key: 'repairs', label: 'Past Service & Parts History', desc: 'Authorized servicing, periodic tune-ups' },
    ];
  } else if (cat.includes('appliance') || cat.includes('washing')) {
    return [
      { key: 'power', label: 'Power & Core Operation', desc: 'Turns on reliably, running cycle without tripping power' },
      { key: 'seals', label: 'Seals, Gaskets & Tubing', desc: 'Door rubber seals, water pipes, lint filters' },
      { key: 'leaks', label: 'Leakage & Heating/Cooling', desc: 'No water/gas leaks, reaches correct temperature' },
      { key: 'exterior', label: 'Exterior Cosmetic Finish', desc: 'Surface rust, scratch marks, panel cleanliness' },
    ];
  } else if (cat.includes('furniture')) {
    return [
      { key: 'structural', label: 'Structural Stability', desc: 'No wobbles, solid joints, weight-bearing strength' },
      { key: 'fabric', label: 'Upholstery, Mesh or Leather', desc: 'Stains, tears, cushioning firmness' },
      { key: 'mechanisms', label: 'Moving Parts & Mechanisms', desc: 'Casters, gas lift cylinder, drawer glides, tilt' },
      { key: 'surface', label: 'Wood / Metal Finish', desc: 'Varnish, paint chipping, scratches' },
    ];
  } else {
    return [
      { key: 'functionality', label: 'Primary Functionality', desc: 'Operates as described by manufacturer' },
      { key: 'cosmetic', label: 'Cosmetic Condition', desc: 'Scratches, discolorations, signs of usage' },
      { key: 'parts', label: 'Completeness & Original Parts', desc: 'All original accessories or cables included' },
      { key: 'defects', label: 'Known Defects or Quirks', desc: 'Any intermittent issues or required care' },
    ];
  }
};

const STATUS_OPTIONS = [
  { value: 'Good', label: 'Good (No Issues)', color: '#15803D', icon: CheckCircle2 },
  { value: 'Minor Issue', label: 'Minor Issue (Cosmetic)', color: '#D97706', icon: AlertTriangle },
  { value: 'Defective', label: 'Defective (Needs Repair)', color: '#DC2626', icon: XCircle },
  { value: 'Unknown', label: 'Unknown / Not Tested', color: '#6B7280', icon: HelpCircle },
];

const TrustCheckModal = ({ isOpen, onClose, product, onSaved }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [overallCondition, setOverallCondition] = useState('Like New');
  const [evidenceStatus, setEvidenceStatus] = useState('SELLER_REPORTED');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({});

  const items = getChecklistForCategory(product?.category);

  useEffect(() => {
    if (isOpen && product) {
      // Initialize with existing report if present
      if (product.latestConditionReport) {
        setOverallCondition(product.latestConditionReport.overallCondition || product.condition || 'Like New');
        setEvidenceStatus(product.latestConditionReport.evidenceStatus || 'SELLER_REPORTED');
        setNotes(product.latestConditionReport.notes || '');
        setChecklist(product.latestConditionReport.checklist || {});
      } else {
        setOverallCondition(product.condition || 'Like New');
        setEvidenceStatus(product.documents?.length > 0 ? 'DOCUMENT_SUPPORTED' : 'SELLER_REPORTED');
        setNotes('');
        const initial = {};
        items.forEach((item) => {
          initial[item.key] = { status: 'Good', notes: '' };
        });
        setChecklist(initial);
      }
    }
  }, [isOpen, product]);

  const handleItemStatusChange = (key, status) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: { ...prev[key], status },
    }));
  };

  const handleItemNotesChange = (key, noteText) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: { ...prev[key], notes: noteText },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await conditionService.saveConditionReport(product.id, {
        overallCondition,
        checklist,
        notes,
        evidenceStatus,
      });

      if (res.success) {
        showToast('TrustCheck condition report updated!');
        onSaved && onSaved();
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="TrustCheck™ Condition Assessment" maxWidth="620px">
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#FAF8F4',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          border: '1px solid var(--color-border)',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={18} color="var(--color-accent-lavender)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Transparent Seller Disclosure for {product?.name}
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45 }}>
            Assess each functional check honestly. Prospective buyers trust sellers who clearly document what is working and what has minor wear.
          </p>
        </div>

        {/* Overall Rating Selection */}
        <div className="form-group">
          <label className="form-label">Overall Condition Rating</label>
          <select
            className="form-select"
            value={overallCondition}
            onChange={(e) => setOverallCondition(e.target.value)}
          >
            <option value="Brand New">Brand New (Unopened, pristine)</option>
            <option value="Like New">Like New (Flawless, barely used)</option>
            <option value="Excellent">Excellent (Minor cosmetic signs only)</option>
            <option value="Good">Good (Normal wear, 100% functional)</option>
            <option value="Fair">Fair (Noticeable cosmetic wear, functional)</option>
          </select>
        </div>

        {/* Category-Adapted Checklist */}
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ marginBottom: '10px' }}>
            {product?.category} Diagnostic Checklist:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {items.map((item) => {
              const currentStatus = checklist[item.key]?.status || 'Good';
              const currentNote = checklist[item.key]?.notes || '';

              return (
                <div
                  key={item.key}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {item.label}
                      </span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Status Pill Selector */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.map((opt) => {
                        const isSelected = currentStatus === opt.value;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleItemStatusChange(item.key, opt.value)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: `1.5px solid ${isSelected ? opt.color : 'var(--color-border)'}`,
                              backgroundColor: isSelected ? `${opt.color}15` : '#FFFFFF',
                              color: isSelected ? opt.color : 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon size={12} />
                            <span>{opt.label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Add specific note for this check (optional)..."
                    value={currentNote}
                    onChange={(e) => handleItemNotesChange(item.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '6px',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Status Label */}
        <div className="form-group">
          <label className="form-label">Verification & Evidence Source</label>
          <select
            className="form-select"
            value={evidenceStatus}
            onChange={(e) => setEvidenceStatus(e.target.value)}
          >
            <option value="SELLER_REPORTED">Self-Reported by Owner (Based on personal inspection)</option>
            <option value="DOCUMENT_SUPPORTED">Document-Supported (Supported by diagnostic bill or authorized service sheet)</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
            Ownly strictly distinguishes between self-reported observations and document-supported checks.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">General Assessment Notes</label>
          <textarea
            rows="2"
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Always used with protective case; zero liquid damage..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving Assessment...' : 'Save Condition Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TrustCheckModal;
