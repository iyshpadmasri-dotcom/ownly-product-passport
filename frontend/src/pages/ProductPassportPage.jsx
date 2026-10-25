import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { documentService } from '../services/documentService';
import { historyService } from '../services/historyService';
import { marketplaceService } from '../services/marketplaceService';
import { useToast } from '../context/ToastContext';
import WarrantyBadge from '../components/WarrantyBadge';
import DocumentCard from '../components/DocumentCard';
import HistoryTimeline from '../components/HistoryTimeline';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import TrustCheckModal from '../components/TrustCheckModal';
import OwnershipTransferModal from '../components/OwnershipTransferModal';
import ProofPackModal from '../components/ProofPackModal';
import SecondLifeModal from '../components/SecondLifeModal';
import { transferService } from '../services/transferService';
import { formatINR, formatIndianDate } from '../utils/formatters';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Tag,
  FileText,
  Clock,
  MoreVertical,
  Calendar,
  DollarSign,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Share2,
  Send,
  CheckSquare,
  RefreshCw,
  Lock,
  Store,
  AlertCircle
} from 'lucide-react';

const ProductPassportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [addHistoryModalOpen, setAddHistoryModalOpen] = useState(false);
  const [listSaleModalOpen, setListSaleModalOpen] = useState(false);
  const [trustCheckModalOpen, setTrustCheckModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [proofPackModalOpen, setProofPackModalOpen] = useState(false);
  const [secondLifeModalOpen, setSecondLifeModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // For doc or history deletion
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({});
  const [docForm, setDocForm] = useState({
    type: 'Purchase Bill',
    title: '',
    file: null,
    isPublicForListing: false,
  });
  const [historyForm, setHistoryForm] = useState({
    eventType: 'Service',
    title: '',
    eventDate: new Date().toISOString().split('T')[0],
    notes: '',
    cost: '',
    serviceProvider: '',
  });
  const [saleForm, setSaleForm] = useState({
    price: '',
    condition: 'Like New',
    description: '',
    location: '',
    sharePurchaseDate: true,
    shareWarranty: true,
    shareHistory: true,
    shareDocuments: false,
  });
  const [salePreviewStep, setSalePreviewStep] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await productService.getProductById(id);
      if (res.success && res.data) {
        setProduct(res.data);
        setEditForm({
          name: res.data.name || '',
          brand: res.data.brand || '',
          model: res.data.model || '',
          category: res.data.category || '',
          purchaseDate: res.data.purchaseDate ? res.data.purchaseDate.split('T')[0] : '',
          purchasePrice: res.data.purchasePrice || '',
          purchaseStore: res.data.purchaseStore || '',
          serialOrImei: res.data.serialOrImei || '',
          warrantyExpiry: res.data.warrantyExpiry ? res.data.warrantyExpiry.split('T')[0] : '',
          description: res.data.description || '',
        });
        setSaleForm((prev) => ({
          ...prev,
          price: res.data.purchasePrice ? (res.data.purchasePrice * 0.75).toFixed(0) : '',
          description: res.data.description || `Selling my ${res.data.name}. Kept in great condition with verified records.`,
        }));
      }
    } catch (err) {
      showToast('Could not load product passport.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await productService.updateProduct(id, editForm);
      if (res.success) {
        showToast('Product details updated.');
        setEditModalOpen(false);
        fetchProduct();
      }
    } catch (err) {
      showToast('Could not update details.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Document Upload
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.file && !docForm.title) {
      showToast('Please select a file and enter a title.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const data = new FormData();
      data.append('title', docForm.title || docForm.file.name);
      data.append('type', docForm.type);
      data.append('isPublicForListing', docForm.isPublicForListing);
      if (docForm.file) {
        data.append('document', docForm.file);
      }

      const res = await documentService.addDocument(id, data);
      if (res.success) {
        showToast('Document added to passport.');
        setAddDocModalOpen(false);
        setDocForm({ type: 'Purchase Bill', title: '', file: null, isPublicForListing: false });
        fetchProduct();
      }
    } catch (err) {
      showToast('Failed to upload document.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle History Submit
  const handleHistorySubmit = async (e) => {
    e.preventDefault();
    if (!historyForm.title.trim() || !historyForm.eventDate) {
      showToast('Please enter an event title and date.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await historyService.addHistory(id, historyForm);
      if (res.success) {
        showToast('Event added to product timeline.');
        setAddHistoryModalOpen(false);
        setHistoryForm({
          eventType: 'Service',
          title: '',
          eventDate: new Date().toISOString().split('T')[0],
          notes: '',
          cost: '',
          serviceProvider: '',
        });
        fetchProduct();
      }
    } catch (err) {
      showToast('Failed to add history record.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Listing for Sale
  const handleListForSale = async (e) => {
    if (e) e.preventDefault();
    setActionLoading(true);
    try {
      const res = await marketplaceService.createListing({
        productId: id,
        title: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
        description: saleForm.description,
        price: parseFloat(saleForm.price),
        condition: saleForm.condition,
        location: saleForm.location,
        sharePurchaseDate: saleForm.sharePurchaseDate,
        shareWarranty: saleForm.shareWarranty,
        shareHistory: saleForm.shareHistory,
        shareDocuments: saleForm.shareDocuments,
      });

      if (res.success) {
        showToast('Your product is now listed on the Ownly marketplace!');
        setListSaleModalOpen(false);
        setSalePreviewStep(false);
        fetchProduct();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not publish listing.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    setActionLoading(true);
    try {
      const res = await productService.deleteProduct(id);
      if (res.success) {
        showToast('Product passport removed.');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (doc) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      try {
        await documentService.deleteDocument(doc.id);
        showToast('Document deleted.');
        fetchProduct();
      } catch {
        showToast('Failed to delete document.', 'error');
      }
    }
  };

  // Delete History
  const handleDeleteHistory = async (event) => {
    if (window.confirm(`Delete "${event.title}" from timeline?`)) {
      try {
        await historyService.deleteHistory(event.id);
        showToast('History event deleted.');
        fetchProduct();
      } catch {
        showToast('Failed to delete history.', 'error');
      }
    }
  };

  // Cancel Pending Transfer
  const handleCancelTransfer = async (transferId) => {
    if (window.confirm('Cancel this pending ownership transfer? The recipient will no longer be able to accept it.')) {
      try {
        await transferService.cancelTransfer(transferId);
        showToast('Transfer request cancelled.');
        fetchProduct();
      } catch (err) {
        showToast('Failed to cancel transfer.', 'error');
      }
    }
  };

  if (loading || !product) {
    return (
      <div className="page-wrapper">
        <LoadingSpinner text="Opening digital product passport..." size="large" />
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="page-wrapper">
      {/* Top Navigation Back Link & Feature Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/dashboard"
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
          <span>Back to My Products</span>
        </Link>

        {/* Feature Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTrustCheckModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Inspect and document condition with category checklist"
          >
            <CheckSquare size={15} color="var(--color-accent-lavender)" />
            <span>TrustCheck™</span>
          </button>

          <button
            onClick={() => setProofPackModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Generate shareable verified report"
          >
            <Share2 size={15} color="var(--color-accent-lavender)" />
            <span>ProofPack™</span>
          </button>

          <button
            onClick={() => setTransferModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Transfer ownership securely to another user"
          >
            <Send size={15} color="#D97706" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setSecondLifeModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Sell, Repair, Donate, or Recycle"
          >
            <RefreshCw size={15} color="#15803D" />
            <span>SecondLife™</span>
          </button>

          {/* Action Menu Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 10px', gap: '4px' }}
            >
              <span>Actions</span>
              <MoreVertical size={16} />
            </button>

            {actionMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '38px',
                  width: '210px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => { setEditModalOpen(true); setActionMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-lavender-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Edit size={16} />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => { setAddDocModalOpen(true); setActionMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-lavender-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FileText size={16} />
                  <span>Add Document</span>
                </button>

                <button
                  onClick={() => { setAddHistoryModalOpen(true); setActionMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-lavender-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Clock size={16} />
                  <span>Add History</span>
                </button>

                {!product.activeListing && (
                  <button
                    onClick={() => { setListSaleModalOpen(true); setActionMenuOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-accent-coral)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-coral-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Tag size={16} />
                    <span>List for Sale</span>
                  </button>
                )}

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                <button
                  onClick={() => { setDeleteDialogOpen(true); setActionMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} />
                  <span>Delete Product</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Transfer Alert Banner */}
      {product.pendingTransfer && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#92400E', fontSize: '0.95rem', display: 'block' }}>
                Ownership Transfer In Progress
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#B45309' }}>
                Transfer request initiated to <strong>{product.pendingTransfer.toUser?.email || product.pendingTransfer.toEmail}</strong> on {formatIndianDate(product.pendingTransfer.createdAt)}. Awaiting their acceptance.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCancelTransfer(product.pendingTransfer.id)}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: '#F59E0B', color: '#92400E', fontSize: '0.825rem' }}
          >
            Cancel Transfer Request
          </button>
        </div>
      )}

      {/* Main Product Overview Card */}
      <div className="card" style={{ padding: '32px', marginBottom: '36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '36px',
          alignItems: 'center',
        }} className="passport-header-grid">
          {/* Image */}
          <div style={{
            width: '100%',
            height: '240px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: '#F5F2EB',
            position: 'relative',
          }}>
            <img
              src={product.imageUrl || defaultImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = defaultImage; }}
            />
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="badge badge-lavender">
                {product.category}
              </span>
              <WarrantyBadge warrantyInfo={product.warrantyInfo} />

              {product.conditionReport && (
                <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckSquare size={12} />
                  <span>TrustCheck™: {product.conditionReport.overallRating || 'Completed'}</span>
                </span>
              )}

              {product.lifecycleStatus && product.lifecycleStatus !== 'ACTIVE' && (
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={12} />
                  <span>Status: {product.lifecycleStatus}</span>
                </span>
              )}

              {product.activeListing && (
                <Link to={`/marketplace/${product.activeListing.id}`} className="badge" style={{ backgroundColor: 'var(--color-accent-coral)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} />
                  <span>Listed on Marketplace • {formatINR(product.activeListing.price)}</span>
                </Link>
              )}
            </div>

            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '6px' }}>
              {product.name}
            </h1>

            {(product.brand || product.model) && (
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
                {[product.brand, product.model].filter(Boolean).join(' • ')}
              </p>
            )}

            {product.description && (
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                {product.description}
              </p>
            )}

            {/* Purchase & Warranty Meta Boxes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}>
              {product.purchaseDate && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Purchase Date
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    {formatIndianDate(product.purchaseDate)}
                  </p>
                </div>
              )}

              {product.purchasePrice !== null && product.purchasePrice !== undefined && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Original Price
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    {formatINR(product.purchasePrice)}
                  </p>
                </div>
              )}

              {product.warrantyExpiry && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Warranty Expiry
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    {formatIndianDate(product.warrantyExpiry)}
                  </p>
                </div>
              )}

              {product.purchaseStore && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Store size={11} color="var(--color-accent-lavender)" /> Store
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    {product.purchaseStore}
                  </p>
                </div>
              )}

              {product.serialOrImei && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Lock size={11} color="var(--color-accent-lavender)" /> Serial / IMEI (Private)
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'monospace' }}>
                    {product.serialOrImei}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: My Documents + Product History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '32px' }} className="passport-columns">
        {/* Section: My Documents */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                My Documents
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Bills, warranties, and user manuals
              </p>
            </div>

            <button
              onClick={() => setAddDocModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={16} />
              <span>+ Add Document</span>
            </button>
          </div>

          {product.documents.length === 0 ? (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '14px' }}>
                No documents uploaded yet. Keep your receipt or warranty safe here.
              </p>
              <button
                onClick={() => setAddDocModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                + Upload First Document
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {product.documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDeleteDocument}
                  canDelete={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section: Product History */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                Product History
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Chronological record of service & care
              </p>
            </div>

            <button
              onClick={() => setAddHistoryModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={16} />
              <span>+ Add History</span>
            </button>
          </div>

          <HistoryTimeline
            history={product.history}
            onDelete={handleDeleteHistory}
            canDelete={true}
          />
        </div>
      </div>

      {/* MODAL 1: Edit Details */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Product Details">
        <form onSubmit={handleEditSubmit}>
          <FormInput
            label="Product Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Brand"
              value={editForm.brand}
              onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
            />
            <FormInput
              label="Model"
              value={editForm.model}
              onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Purchase Date"
              type="date"
              value={editForm.purchaseDate}
              onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
            />
            <FormInput
              label="Original Price (₹ INR)"
              type="number"
              step="1"
              value={editForm.purchasePrice}
              onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Purchase Store / Platform"
              value={editForm.purchaseStore}
              onChange={(e) => setEditForm({ ...editForm, purchaseStore: e.target.value })}
              placeholder="e.g. Amazon India, Croma, Apple Store BKC"
            />
            <FormInput
              label="Serial / IMEI (Private to you)"
              value={editForm.serialOrImei}
              onChange={(e) => setEditForm({ ...editForm, serialOrImei: e.target.value })}
              placeholder="e.g. F2LLN8..."
            />
          </div>
          <FormInput
            label="Warranty Expiry Date"
            type="date"
            value={editForm.warrantyExpiry}
            onChange={(e) => setEditForm({ ...editForm, warrantyExpiry: e.target.value })}
          />
          <div className="form-group">
            <label className="form-label">Description / Notes</label>
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

      {/* MODAL 2: Add Document */}
      <Modal isOpen={addDocModalOpen} onClose={() => setAddDocModalOpen(false)} title="Add Document">
        <form onSubmit={handleDocSubmit}>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={docForm.type}
              onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
            >
              <option value="Purchase Bill">Purchase Bill</option>
              <option value="Warranty">Warranty Certificate</option>
              <option value="User Manual">User Manual</option>
              <option value="Service Records">Service Records</option>
              <option value="Other Documents">Other Documents</option>
            </select>
          </div>

          <FormInput
            label="Document Title"
            value={docForm.title}
            onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            placeholder="e.g. Official Invoice, 2-Year Care Plan"
            required
          />

          <div className="form-group">
            <label className="form-label">File Upload (PDF, PNG, JPG)</label>
            <input
              type="file"
              onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="isPublicForListing"
              checked={docForm.isPublicForListing}
              onChange={(e) => setDocForm({ ...docForm, isPublicForListing: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="isPublicForListing" style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              Allow buyers to view this document if product is listed for sale
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={() => setAddDocModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Add History */}
      <Modal isOpen={addHistoryModalOpen} onClose={() => setAddHistoryModalOpen(false)} title="Add Product History Event">
        <form onSubmit={handleHistorySubmit}>
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select
              className="form-select"
              value={historyForm.eventType}
              onChange={(e) => setHistoryForm({ ...historyForm, eventType: e.target.value })}
            >
              <option value="Service">Service / Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Purchase">Purchase / Acquisition</option>
              <option value="Upgrade">Upgrade / Part Replacement</option>
              <option value="Warranty">Warranty Registration</option>
              <option value="Inspection">Inspection</option>
              <option value="Other">Other Milestone</option>
            </select>
          </div>

          <FormInput
            label="Event Title"
            value={historyForm.title}
            onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })}
            placeholder="e.g. Battery Diagnostic Check, Screen replacement"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormInput
              label="Event Date"
              type="date"
              value={historyForm.eventDate}
              onChange={(e) => setHistoryForm({ ...historyForm, eventDate: e.target.value })}
              required
            />
            <FormInput
              label="Cost (₹ INR optional)"
              type="number"
              step="1"
              value={historyForm.cost}
              onChange={(e) => setHistoryForm({ ...historyForm, cost: e.target.value })}
              placeholder="0"
            />
          </div>

          <FormInput
            label="Service Provider / Shop (optional)"
            value={historyForm.serviceProvider}
            onChange={(e) => setHistoryForm({ ...historyForm, serviceProvider: e.target.value })}
            placeholder="e.g. Apple Genius Bar, Local Repair Hub"
          />

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={historyForm.notes}
              onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })}
              placeholder="Any details on work done, parts replaced, or conditions..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setAddHistoryModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: List for Sale */}
      <Modal isOpen={listSaleModalOpen} onClose={() => { setListSaleModalOpen(false); setSalePreviewStep(false); }} title={salePreviewStep ? 'Preview Listing' : 'List Product for Sale'}>
        {!salePreviewStep ? (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Create a listing directly from this product's passport. Choose which verified records to share with potential buyers.
            </p>

            <FormInput
              label="Asking Price (₹ INR)"
              type="number"
              value={saleForm.price}
              onChange={(e) => setSaleForm({ ...saleForm, price: e.target.value })}
              placeholder="e.g. 35000"
              required
            />

            <div className="form-group">
              <label className="form-label">Item Condition</label>
              <select
                className="form-select"
                value={saleForm.condition}
                onChange={(e) => setSaleForm({ ...saleForm, condition: e.target.value })}
              >
                <option value="Brand New">Brand New (Unopened)</option>
                <option value="Like New">Like New (Flawless)</option>
                <option value="Excellent">Excellent (Minor signs of use)</option>
                <option value="Good">Good (Fully functional, normal wear)</option>
                <option value="Fair">Fair (Cosmetic wear, fully working)</option>
              </select>
            </div>

            <FormInput
              label="General Location (City, State)"
              value={saleForm.location}
              onChange={(e) => setSaleForm({ ...saleForm, location: e.target.value })}
              placeholder="e.g. San Francisco, CA"
            />

            <div className="form-group">
              <label className="form-label">Listing Description</label>
              <textarea
                rows="3"
                className="form-textarea"
                value={saleForm.description}
                onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })}
              />
            </div>

            {/* Privacy Toggles: What to share */}
            <div style={{
              backgroundColor: '#FAF8F4',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--color-border)',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                Information to Share with Buyers:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={saleForm.sharePurchaseDate}
                    onChange={(e) => setSaleForm({ ...saleForm, sharePurchaseDate: e.target.checked })}
                  />
                  Share original purchase date
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={saleForm.shareWarranty}
                    onChange={(e) => setSaleForm({ ...saleForm, shareWarranty: e.target.checked })}
                  />
                  Share active warranty status & dates
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={saleForm.shareHistory}
                    onChange={(e) => setSaleForm({ ...saleForm, shareHistory: e.target.checked })}
                  />
                  Share service timeline and maintenance milestones
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={saleForm.shareDocuments}
                    onChange={(e) => setSaleForm({ ...saleForm, shareDocuments: e.target.checked })}
                  />
                  Share approved document titles
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setListSaleModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setSalePreviewStep(true)}
                disabled={!saleForm.price}
                className="btn btn-primary"
              >
                Preview Listing
              </button>
            </div>
          </div>
        ) : (
          /* Preview Step */
          <div>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {product.brand ? `${product.brand} ` : ''}{product.name}
                </h4>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent-lavender)' }}>
                  {formatINR(saleForm.price)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-neutral">{saleForm.condition}</span>
                <span className="badge badge-neutral">{saleForm.location || 'Location not set'}</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
                {saleForm.description}
              </p>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', fontSize: '0.85rem' }}>
                <strong>Verified Badges to show:</strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {saleForm.sharePurchaseDate && product.purchaseDate && <span className="badge badge-lavender">Purchase Record</span>}
                  {saleForm.shareWarranty && product.warrantyExpiry && <span className="badge badge-success">Warranty Info</span>}
                  {saleForm.shareHistory && product.history?.length > 0 && <span className="badge badge-neutral">Service History</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setSalePreviewStep(false)} className="btn btn-secondary">
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleListForSale}
                disabled={actionLoading}
                className="btn btn-primary btn-lg"
              >
                {actionLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Product Deletion */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete this product passport?"
        message={`Are you sure you want to delete ${product.name}? All attached bills, warranties, and history will be permanently deleted.`}
        confirmText="Delete Passport"
        isLoading={actionLoading}
      />

      {/* TRUSTCHECK MODAL */}
      <TrustCheckModal
        isOpen={trustCheckModalOpen}
        onClose={() => setTrustCheckModalOpen(false)}
        product={product}
        onSaved={fetchProduct}
      />

      {/* OWNERSHIP TRANSFER MODAL */}
      <OwnershipTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        product={product}
        onTransferred={fetchProduct}
      />

      {/* PROOFPACK MODAL */}
      <ProofPackModal
        isOpen={proofPackModalOpen}
        onClose={() => setProofPackModalOpen(false)}
        product={product}
      />

      {/* SECONDLIFE MODAL */}
      <SecondLifeModal
        isOpen={secondLifeModalOpen}
        onClose={() => setSecondLifeModalOpen(false)}
        product={product}
        onOpenSellModal={() => setListSaleModalOpen(true)}
        onActionRecorded={fetchProduct}
      />

      <style>{`
        @media (max-width: 840px) {
          .passport-header-grid {
            grid-template-columns: 1fr !important;
          }
          .passport-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductPassportPage;
