import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WarrantyBadge from '../components/WarrantyBadge';
import DocumentCard from '../components/DocumentCard';
import HistoryTimeline from '../components/HistoryTimeline';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatINR, formatIndianDate } from '../utils/formatters';
import {
  ShieldCheck,
  Tag,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  ExternalLink,
  CheckSquare,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';

const MarketplaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Inquiry Form
  const [inquiryData, setInquiryData] = useState({
    buyerName: currentUser?.name || '',
    buyerEmail: currentUser?.email || '',
    buyerPhone: '',
    message: '',
    offerPrice: '',
  });

  useEffect(() => {
    if (currentUser) {
      setInquiryData((prev) => ({
        ...prev,
        buyerName: prev.buyerName || currentUser.name,
        buyerEmail: prev.buyerEmail || currentUser.email,
      }));
    }
  }, [currentUser]);

  const fetchListing = async () => {
    try {
      const res = await marketplaceService.getListingById(id);
      if (res.success && res.data) {
        setListing(res.data);
      }
    } catch (err) {
      showToast('Listing not found or no longer active.', 'error');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.buyerName.trim() || !inquiryData.buyerEmail.trim() || !inquiryData.message.trim()) {
      showToast('Please fill out your name, email, and message.', 'error');
      return;
    }

    setSubmittingInquiry(true);
    try {
      const res = await marketplaceService.createInquiry(id, inquiryData);
      if (res.success) {
        showToast('Your inquiry has been sent to the seller!');
        setInquiryModalOpen(false);
        setInquiryData((prev) => ({ ...prev, message: '', offerPrice: '' }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit inquiry.', 'error');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading || !listing) {
    return (
      <div className="page-wrapper">
        <LoadingSpinner text="Loading product details..." size="large" />
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="page-wrapper">
      {/* Back button */}
      <Link
        to="/marketplace"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Marketplace</span>
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '40px',
        alignItems: 'start',
      }} className="detail-layout">
        {/* Left Column: Image Gallery, Description, History & Documents */}
        <div>
          {/* Main Photo */}
          <div style={{
            width: '100%',
            height: '380px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#F5F2EB',
            position: 'relative',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <img
              src={listing.product?.imageUrl || defaultImage}
              alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = defaultImage; }}
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}>
              Condition: {listing.condition}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '14px' }}>
              Product Details & Notes
            </h2>
            <p style={{ fontSize: '0.975rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              {listing.description}
            </p>
          </div>

          {/* TrustCheck Condition Report */}
          {listing.product?.conditionReport && (
            <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={20} color="var(--color-accent-lavender)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    TrustCheck™ Condition Assessment
                  </h3>
                </div>
                <span className="badge badge-lavender" style={{ fontSize: '0.85rem' }}>
                  Overall: {listing.product.conditionReport.overallRating}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Evidence-aware diagnostic checklist recorded on this product passport.
              </p>

              {listing.product.conditionReport.checklist && Object.keys(listing.product.conditionReport.checklist).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {Object.entries(listing.product.conditionReport.checklist).map(([key, item]) => (
                    <div key={key} style={{
                      padding: '10px 14px',
                      backgroundColor: '#FAF8F4',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {key}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.status === 'Good' ? '#DCFCE7' : item.status === 'Minor Issue' ? '#FEF3C7' : '#FEE2E2',
                        color: item.status === 'Good' ? '#15803D' : item.status === 'Minor Issue' ? '#92400E' : '#B91C1C',
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {listing.product.conditionReport.notes && (
                <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: '#FAF8F4', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  <strong>Notes:</strong> {listing.product.conditionReport.notes}
                </div>
              )}
            </div>
          )}

          {/* Seller-approved Shared Documents */}
          {listing.sharedDocuments && listing.sharedDocuments.length > 0 && (
            <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="var(--color-accent-lavender)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Seller-Approved Documents
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
                The seller has verified these official records are attached to this passport.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {listing.sharedDocuments.map((doc) => (
                  <div key={doc.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#FAF8F4',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {doc.title}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {doc.type} {doc.fileSize && `• ${doc.fileSize}`}
                      </span>
                    </div>

                    <a
                      href={`/api/documents/${doc.id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <span>Preview</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Product History Timeline */}
          {listing.sharedHistory && listing.sharedHistory.length > 0 && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
                Product History & Care Timeline
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                Recorded service, repairs, and ownership milestones shared by the seller.
              </p>

              <HistoryTimeline
                history={listing.sharedHistory}
                canDelete={false}
              />
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Location, Seller Info, Contact Button */}
        <div>
          <div className="card" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-lavender">
                {listing.product?.category}
              </span>
              {listing.product?.warrantyInfo && (
                <WarrantyBadge warrantyInfo={listing.product.warrantyInfo} />
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.25 }}>
              {listing.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {formatINR(listing.price)}
              </span>
            </div>

            {/* General Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              <MapPin size={16} color="var(--color-accent-coral)" />
              <span>{listing.location || 'Location upon request'}</span>
            </div>

            {/* Verified History Highlights */}
            <div style={{
              backgroundColor: '#FAF8F4',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              border: '1px solid var(--color-border)',
              marginBottom: '28px',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Passport Transparency:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {listing.product?.purchaseDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>Purchase date verified: {formatIndianDate(listing.product.purchaseDate)}</span>
                  </div>
                )}
                {listing.sharedHistory?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>{listing.sharedHistory.length} documented service/care records</span>
                  </div>
                )}
                {listing.sharedDocuments?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>{listing.sharedDocuments.length} approved documents attached</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <Lock size={14} />
                  <span>Private serial numbers and personal addresses remain hidden</span>
                </div>
              </div>
            </div>

            {/* Contact Seller Button */}
            {listing.isSeller ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                backgroundColor: 'var(--color-accent-lavender-light)',
                borderRadius: 'var(--radius-md)',
                color: '#6C5BC4',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                This is your listing. Manage it from <Link to="/my-listings" style={{ textDecoration: 'underline' }}>My Listings</Link>.
              </div>
            ) : (
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '10px' }}
              >
                <MessageSquare size={18} />
                <span>Contact Seller</span>
              </button>
            )}

            {/* Seller profile pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}>
              <img
                src={listing.seller?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={listing.seller?.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Sold by {listing.seller?.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Member since {new Date(listing.seller?.memberSince).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Contact Seller Inquiry Form */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={`Message ${listing.seller?.name}`}
      >
        <form onSubmit={handleInquirySubmit}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '18px' }}>
            Send an inquiry directly to the owner of this {listing.product?.name}.
          </p>

          <FormInput
            label="Your Name"
            value={inquiryData.buyerName}
            onChange={(e) => setInquiryData({ ...inquiryData, buyerName: e.target.value })}
            placeholder="e.g. David Chen"
            required
          />

          <FormInput
            label="Your Email"
            type="email"
            value={inquiryData.buyerEmail}
            onChange={(e) => setInquiryData({ ...inquiryData, buyerEmail: e.target.value })}
            placeholder="you@example.com"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Phone number (optional)"
              value={inquiryData.buyerPhone}
              onChange={(e) => setInquiryData({ ...inquiryData, buyerPhone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <FormInput
              label="Offer price (₹ INR optional)"
              type="number"
              value={inquiryData.offerPrice}
              onChange={(e) => setInquiryData({ ...inquiryData, offerPrice: e.target.value })}
              placeholder={`Asking ${formatINR(listing.price)}`}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <textarea
              rows="4"
              className="form-textarea"
              value={inquiryData.message}
              onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
              placeholder="Hi, is this item still available? Are you open to meeting locally..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setInquiryModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInquiry}
              className="btn btn-primary"
            >
              {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 860px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MarketplaceDetailPage;
