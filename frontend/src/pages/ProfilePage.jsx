import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import Sidebar from '../components/Sidebar';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { INDIAN_STATES } from '../utils/formatters';
import { User, Lock, MapPin, Camera, Save, KeyRound } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    avatarUrl: '',
    avatarFile: null,
    avatarPreview: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        location: currentUser.location || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        avatarUrl: currentUser.avatarUrl || '',
        avatarFile: null,
        avatarPreview: null,
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append('name', profileData.name);
      data.append('location', profileData.location || [profileData.city, profileData.state].filter(Boolean).join(', '));
      if (profileData.city) data.append('city', profileData.city);
      if (profileData.state) data.append('state', profileData.state);
      if (profileData.pincode) data.append('pincode', profileData.pincode);
      if (profileData.avatarFile) {
        data.append('avatar', profileData.avatarFile);
      }

      const res = await userService.updateProfile(data);
      if (res.success) {
        updateUser(res.data);
        showToast('Profile updated successfully.');
      }
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await userService.changePassword(passwordData);
      if (res.success) {
        showToast('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <Sidebar />

        <div style={{ flex: 1, minWidth: 0, width: '100%', maxWidth: '640px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
              Profile & Account
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Update your personal details and manage security settings
            </p>
          </div>

          {/* Profile Details Form */}
          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>
              Personal Details
            </h2>

            <form onSubmit={handleProfileSubmit}>
              {/* Avatar upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={profileData.avatarPreview || profileData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={profileData.name}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FAF8F4' }}
                  />
                  <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="avatar-input"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      backgroundColor: 'var(--color-accent-lavender)',
                      color: '#FFFFFF',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    title="Change profile photo"
                  >
                    <Camera size={14} />
                  </label>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    {profileData.name || 'Your Profile Photo'}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                    Click the camera icon to upload a photo
                  </p>
                </div>
              </div>

              <FormInput
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />

              <FormInput
                label="Email Address"
                value={profileData.email}
                disabled
                hint="Your email address is your unique login credential"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormInput
                  label="City / Town"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="e.g. Bengaluru, Mumbai, Delhi"
                />

                <div className="form-group">
                  <label className="form-label">State / Union Territory</label>
                  <select
                    className="form-select"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  >
                    <option value="">Select State / UT</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FormInput
                  label="PIN Code"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                  placeholder="e.g. 560001"
                  hint="Helps buyers discover local products"
                />

                <FormInput
                  label="General Location Display"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="e.g. Indiranagar, Bengaluru"
                  hint="Custom display text shown on your marketplace listings"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ gap: '8px' }}>
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Security Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
              Change Password
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Keep your account secure by using a strong password.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <FormInput
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />

              <FormInput
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                required
              />

              <FormInput
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                placeholder="Re-type new password"
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" disabled={savingPassword} className="btn btn-secondary" style={{ gap: '8px' }}>
                  <KeyRound size={16} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
