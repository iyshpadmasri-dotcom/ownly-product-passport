import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import CategorySelector from '../components/CategorySelector';
import FormInput from '../components/FormInput';
import { INDIAN_PURCHASE_STORES } from '../utils/formatters';
import { ShieldCheck, ArrowRight, ArrowLeft, Upload, CheckCircle2, Plus, Sparkles, Image as ImageIcon, Lock } from 'lucide-react';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Smartphones & Tablets',
    brand: '',
    model: '',
    imageFile: null,
    imagePreview: null,
    imageUrl: '',
    purchaseDate: '',
    purchasePrice: '',
    purchaseStore: '',
    serialOrImei: '',
    warrantyExpiry: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter a product name.';
    }
    if (!formData.category) {
      newErrors.category = 'Please choose a category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep(2);
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      if (formData.brand) data.append('brand', formData.brand);
      if (formData.model) data.append('model', formData.model);
      if (formData.description) data.append('description', formData.description);
      if (formData.purchaseDate) data.append('purchaseDate', formData.purchaseDate);
      if (formData.purchasePrice) data.append('purchasePrice', formData.purchasePrice);
      if (formData.purchaseStore) data.append('purchaseStore', formData.purchaseStore);
      if (formData.serialOrImei) data.append('serialOrImei', formData.serialOrImei);
      if (formData.warrantyExpiry) data.append('warrantyExpiry', formData.warrantyExpiry);

      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
      }

      const res = await productService.createProduct(data);
      if (res.success && res.data) {
        setCreatedProduct(res.data);
        setStep(3); // Success screen
        showToast('Your product passport has been created!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save product. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Smartphones & Tablets',
      brand: '',
      model: '',
      imageFile: null,
      imagePreview: null,
      imageUrl: '',
      purchaseDate: '',
      purchasePrice: '',
      purchaseStore: '',
      serialOrImei: '',
      warrantyExpiry: '',
      description: '',
    });
    setErrors({});
    setCreatedProduct(null);
    setStep(1);
  };

  // Step 3: Success Screen
  if (step === 3 && createdProduct) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '520px', padding: '60px 20px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 36px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px' }}>
            Your product passport is ready!
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
            We’ve created a digital passport for <strong>{createdProduct.name}</strong>. You can now store receipts, warranty certificates, and service records.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to={`/passport/${createdProduct.id}`} className="btn btn-primary btn-lg">
              <span>View Passport</span>
              <ArrowRight size={18} />
            </Link>

            <button onClick={resetForm} className="btn btn-secondary">
              <Plus size={16} />
              <span>Add Another Product</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '640px', padding: '40px 20px' }}>
      {/* Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: step >= 1 ? 'var(--color-accent-lavender)' : 'var(--color-border)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            1
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: step === 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
            Basic Information
          </span>
        </div>

        <div style={{ height: '2px', flex: 1, backgroundColor: 'var(--color-border)', margin: '0 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: step >= 2 ? 'var(--color-accent-lavender)' : 'var(--color-border)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            2
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: step === 2 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
            Additional Details
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: '36px 32px' }}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Continue}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
                Add a product
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Start with a few basics. You can always change these later.
              </p>
            </div>

            <FormInput
              label="Product name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. MacBook Air M3, Sony Headphones, Aero Chair"
              error={errors.name}
              required
            />

            {/* Category selection */}
            <div className="form-group">
              <label className="form-label">
                Category <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <CategorySelector
                selectedCategory={formData.category}
                onSelect={handleCategorySelect}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormInput
                label="Brand (optional)"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Sony, Dyson"
              />

              <FormInput
                label="Model / Edition (optional)"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. 256GB Midnight"
              />
            </div>

            {/* Photo Upload */}
            <div className="form-group">
              <label className="form-label">
                Product photo (optional)
              </label>
              <div style={{
                border: '1.5px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#FAF8F4',
                position: 'relative',
              }}>
                {formData.imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageFile: null, imagePreview: null }))}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '10px' }}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-accent-lavender)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        <Upload size={20} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Click to upload a product photo
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        PNG, JPG, or WEBP up to 10MB
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Additional Details */}
        {step === 2 && (
          <form onSubmit={handleSaveProduct}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
                Additional details
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                You can skip any of these and fill them in anytime.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormInput
                label="Purchase date (optional)"
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                hint="We'll log this in your timeline"
              />

              <FormInput
                label="Purchase price (₹ INR optional)"
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="1"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="purchaseStore" className="form-label">
                  Purchased from (Store / Platform)
                </label>
                <select
                  id="purchaseStore"
                  name="purchaseStore"
                  value={formData.purchaseStore}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Store or Platform</option>
                  {INDIAN_PURCHASE_STORES.map((store) => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Serial number / IMEI (Private)"
                id="serialOrImei"
                name="serialOrImei"
                value={formData.serialOrImei}
                onChange={handleChange}
                placeholder="e.g. F2LLN8..."
                hint="Kept strictly private to you."
              />
            </div>

            <FormInput
              label="Warranty expiry date (optional)"
              id="warrantyExpiry"
              name="warrantyExpiry"
              type="date"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              hint="We'll show active warranty badges and reminders"
            />

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Notes or description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Where you bought it, condition notes, or accessories included..."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ gap: '6px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="btn btn-ghost"
                >
                  Skip for Now
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;
