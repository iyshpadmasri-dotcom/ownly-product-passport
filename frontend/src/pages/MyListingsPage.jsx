import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { transferService } from '../services/transferService';
import { formatINR, formatIndianDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Tag,
  MessageSquare,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ArrowRightLeft,
  Check,
  X,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

const MyListingsPage = () => {
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [transfers, setTransfers] = useState({ incoming: [], outgoing: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'inquiries' | 'transfers'

  // Edit listing modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', status: 'ACTIVE', description: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsRes, inquiriesRes, transfersRes] = await Promise.all([
        marketplaceService.getMyListings(),
        marketplaceService.getSellerInquiries(),
        transferService.getTransfers(),
      ]);

      if (listingsRes.success) setListings(listingsRes.data);
      if (inquiriesRes.success) setInquiries(inquiriesRes.data);
      if (transfersRes.success) setTransfers(transfersRes.data);
    } catch (err) {
      console.error('Failed to load listings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (listing) => {
    setSelectedListing(listing);
    setEditForm({
      price: listing.price,
      status: listing.status,
      description: listing.description,
    });
    setEditModalOpen(true);
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await marketplaceService.updateListing(selectedListing.id, editForm);
      if (res.success) {
        showToast('Listing updated successfully.');
        setEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update listing.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to remove this listing from the marketplace?')) {
      try {
        await marketplaceService.deleteListing(id);
        showToast('Listing removed.');
        fetchData();
      } catch {
        showToast('Failed to remove listing.', 'error');
      }
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await marketplaceService.updateInquiryStatus(inquiryId, newStatus);
      showToast(`Inquiry marked as ${newStatus.toLowerCase()}.`);
      fetchData();
    } catch {
      showToast('Could not update inquiry status.', 'error');
    }
  };

  const handleRespondTransfer = async (transferId, action) => {
    const actionLabel = action === 'ACCEPT' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this ownership transfer?`)) return;

    setActionLoading(true);
    try {
      const res = await transferService.respondTransfer(transferId, action);
      if (res.success) {
        showToast(
          action === 'ACCEPT'
            ? 'Ownership transferred! The product passport is now in your collection.'
            : 'Transfer declined.'
        );
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update transfer status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransfer = async (transferId) => {
    if (!window.confirm('Cancel this pending ownership transfer? The recipient will no longer be able to accept it.')) return;

    setActionLoading(true);
    try {
      const res = await transferService.cancelTransfer(transferId);
      if (res.success) {
        showToast('Transfer request cancelled.');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to cancel transfer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <Sidebar />

        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
              My Marketplace Listings
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Manage your products listed for sale and respond to buyer inquiries
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '28px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('listings')}
              style={{
                padding: '12px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'listings' ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
                borderBottom: `2px solid ${activeTab === 'listings' ? 'var(--color-accent-lavender)' : 'transparent'}`,
                marginBottom: '-1px',
              }}
            >
              Active Listings ({listings.length})
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              style={{
                padding: '12px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'inquiries' ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
                borderBottom: `2px solid ${activeTab === 'inquiries' ? 'var(--color-accent-lavender)' : 'transparent'}`,
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Buyer Inquiries</span>
              {inquiries.filter((i) => i.status === 'NEW').length > 0 && (
                <span className="badge badge-lavender" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  {inquiries.filter((i) => i.status === 'NEW').length} New
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              style={{
                padding: '12px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'transfers' ? 'var(--color-accent-lavender)' : 'var(--color-text-secondary)',
                borderBottom: `2px solid ${activeTab === 'transfers' ? 'var(--color-accent-lavender)' : 'transparent'}`,
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Ownership Transfers</span>
              {transfers.incoming && transfers.incoming.length > 0 && (
                <span className="badge badge-lavender" style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#FDE68A', color: '#92400E' }}>
                  {transfers.incoming.length} Request{transfers.incoming.length > 1 ? 's' : ''}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading listings & inquiries..." />
          ) : activeTab === 'listings' ? (
            /* Listings Tab */
            listings.length === 0 ? (
              <EmptyState
                icon={Tag}
                title="No items listed for sale"
                description="You haven't listed any of your products for sale yet. Open any product passport to list it on the marketplace."
                actionText="Go to My Products"
                actionLink="/dashboard"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {listings.map((item) => (
                  <div key={item.id} className="card" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#F5F2EB',
                          flexShrink: 0,
                        }}>
                          <img
                            src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : item.status === 'SOLD' ? 'badge-lavender' : 'badge-neutral'}`}>
                              {item.status}
                            </span>
                            <span className="badge badge-neutral">{item.condition}</span>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                            {item.title}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {formatINR(item.price)}
                            </span>
                            <span>•</span>
                            <span>{item.inquiries?.length || 0} inquiries</span>
                            <span>•</span>
                            <span>{item.location || 'Location not specified'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to={`/marketplace/${item.id}`} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                          <span>View Public Page</span>
                          <ExternalLink size={14} />
                        </Link>

                        <button onClick={() => openEditModal(item)} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>

                        <button onClick={() => handleDeleteListing(item.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'inquiries' ? (
            /* Inquiries Tab */
            inquiries.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No inquiries received yet"
                description="When buyers are interested in your listed products, their messages and offer prices will appear right here."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="card" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                            {inquiry.buyerName}
                          </h4>
                          <span className={`badge ${inquiry.status === 'NEW' ? 'badge-lavender' : inquiry.status === 'REPLIED' ? 'badge-success' : 'badge-neutral'}`}>
                            {inquiry.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={14} color="var(--color-text-muted)" />
                            <a href={`mailto:${inquiry.buyerEmail}`} style={{ textDecoration: 'underline' }}>{inquiry.buyerEmail}</a>
                          </span>
                          {inquiry.buyerPhone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={14} color="var(--color-text-muted)" />
                              {inquiry.buyerPhone}
                            </span>
                          )}
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {formatIndianDate(inquiry.createdAt)}
                          </span>
                        </div>
                      </div>

                      {inquiry.offerPrice && (
                        <div style={{
                          padding: '6px 14px',
                          backgroundColor: 'var(--color-success-bg)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-success)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}>
                          Offer: {formatINR(inquiry.offerPrice)}
                        </div>
                      )}
                    </div>

                    <div style={{
                      backgroundColor: '#FAF8F4',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.5,
                      marginBottom: '14px',
                    }}>
                      "{inquiry.message}"
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                        Inquiry regarding: <strong>{inquiry.listing?.title}</strong>
                      </span>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`mailto:${inquiry.buyerEmail}?subject=Regarding your inquiry about ${encodeURIComponent(inquiry.listing?.title)}`}
                          onClick={() => handleUpdateInquiryStatus(inquiry.id, 'REPLIED')}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '6px' }}
                        >
                          <Mail size={14} />
                          <span>Reply via Email</span>
                        </a>

                        {inquiry.status === 'NEW' && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inquiry.id, 'READ')}
                            className="btn btn-secondary btn-sm"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Transfers Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Incoming Transfers */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      Incoming Transfer Requests
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      Products another owner wants to transfer to your digital product passport
                    </p>
                  </div>
                  {transfers.incoming && transfers.incoming.length > 0 && (
                    <span className="badge badge-lavender">
                      {transfers.incoming.length} Awaiting Your Response
                    </span>
                  )}
                </div>

                {!transfers.incoming || transfers.incoming.length === 0 ? (
                  <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--color-border)',
                  }}>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                      No incoming transfer requests. When someone sends you a product passport, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {transfers.incoming.map((item) => (
                      <div key={item.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-accent-lavender)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                              width: '76px',
                              height: '76px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              backgroundColor: '#F5F2EB',
                              flexShrink: 0,
                            }}>
                              <img
                                src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80'}
                                alt={item.product?.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span className="badge badge-lavender">Incoming Transfer</span>
                                <span className="badge badge-neutral">{item.product?.category}</span>
                              </div>

                              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                                {item.product?.brand ? `${item.product.brand} ` : ''}{item.product?.name}
                              </h3>

                              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                Sent by: <strong>{item.fromUser?.name || 'Authorized Owner'}</strong> on {formatIndianDate(item.createdAt)}
                              </p>

                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                                  📜 History: {item.shareHistory ? 'Included' : 'Withheld'}
                                </span>
                                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                                  📑 Documents: {item.shareDocuments ? 'Included' : 'Withheld'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleRespondTransfer(item.id, 'ACCEPT')}
                              disabled={actionLoading}
                              className="btn btn-primary"
                              style={{ gap: '6px' }}
                            >
                              <Check size={16} />
                              <span>Accept Ownership</span>
                            </button>

                            <button
                              onClick={() => handleRespondTransfer(item.id, 'REJECT')}
                              disabled={actionLoading}
                              className="btn btn-secondary"
                              style={{ color: 'var(--color-danger)', gap: '6px' }}
                            >
                              <X size={16} />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>

                        {item.notes && (
                          <div style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            backgroundColor: '#FAF8F4',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            fontStyle: 'italic',
                          }}>
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Transfers */}
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Sent Transfer Requests
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Requests you initiated that are waiting for the recipient to accept
                  </p>
                </div>

                {!transfers.outgoing || transfers.outgoing.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--color-border)',
                  }}>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                      No pending outgoing transfer requests.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transfers.outgoing.map((item) => (
                      <div key={item.id} className="card" style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span className="badge badge-neutral" style={{ color: '#D97706', borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}>
                                Pending Recipient Acceptance
                              </span>
                            </div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0' }}>
                              {item.product?.brand ? `${item.product.brand} ` : ''}{item.product?.name}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                              Sent to <strong>{item.toEmail}</strong> on {formatIndianDate(item.createdAt)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleCancelTransfer(item.id)}
                            disabled={actionLoading}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer Audit History */}
              {transfers.history && transfers.history.length > 0 && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      Ownership Transfer History
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      Verified record of past completed or closed ownership changes
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {transfers.history.map((record) => (
                      <div key={record.id} style={{
                        padding: '14px 18px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{record.product?.name}</strong>
                          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            From: {record.fromUser?.name || 'Previous Owner'} → To: {record.toUser?.name || record.toEmail}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge ${record.status === 'ACCEPTED' ? 'badge-success' : 'badge-neutral'}`}>
                            {record.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {formatIndianDate(record.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Listing Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Marketplace Listing">
        <form onSubmit={handleUpdateListing}>
          <FormInput
            label="Asking Price (₹ INR)"
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            required
          />

          <div className="form-group">
            <label className="form-label">Listing Status</label>
            <select
              className="form-select"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE (Visible on Marketplace)</option>
              <option value="SOLD">SOLD (Mark as completed)</option>
              <option value="DELISTED">DELISTED (Hidden from Marketplace)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyListingsPage;
