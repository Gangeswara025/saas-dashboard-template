import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Lock, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword } from '../services/api';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}` : null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return toast.error('Please upload an image file');
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      formData.append('company', profileData.company);
      if (avatar) formData.append('avatar', avatar);

      await updateProfile(formData);
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setPwdLoading(true);
    try {
      await updatePassword({
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      toast.success('Password updated successfully');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2"><User size={16} /> Profile Details</div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2"><Lock size={16} /> Security</div>
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface border border-border rounded-xl p-6 max-w-2xl"
      >
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-surface-2 border-2 border-border overflow-hidden flex items-center justify-center text-text-muted">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <h3 className="font-medium text-text-primary">Profile Picture</h3>
                <p className="text-sm text-text-muted mt-1">Upload a new avatar. Recommended size 256x256px.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="input opacity-60 cursor-not-allowed"
                  value={user?.email}
                />
                <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> Email cannot be changed
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Phone Number</label>
                <input
                  type="text"
                  className="input"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Company</label>
                <input
                  type="text"
                  className="input"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
                {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePwdSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Current Password</label>
              <input
                type="password"
                required
                className="input"
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={pwdData.newPassword}
                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={pwdLoading} className="btn-primary flex items-center gap-2">
                {pwdLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Update Password
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
