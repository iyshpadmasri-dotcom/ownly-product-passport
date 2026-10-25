import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';
import { ShieldCheck, LogIn, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        showToast(res.message || 'Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Could not sign in. Please verify your credentials.';
      const field = err.response?.data?.field;
      if (field) {
        setErrors({ [field]: errorMsg });
      } else {
        setErrors({ general: errorMsg });
      }
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '440px', padding: '60px 20px' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-accent-lavender)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(169, 154, 232, 0.4)',
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter your credentials to access your passports
          </p>
        </div>

        {errors.general && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
            marginBottom: '20px',
            fontWeight: 500,
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            required
            autoComplete="email"
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '14px' }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
        }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-accent-lavender)' }}>
            Sign up
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#FAF8F4',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
        }}>
          <strong>Demo account:</strong> demo@ownly.app • password123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
