import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/users/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gradient-luxury mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-navy rounded-xl shadow-glow">
              <User size={32} className="text-white" />
            </div>
            My Profile
          </h1>
          <p className="text-neutral-600 text-lg">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <div className="card-luxury p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                <User size={24} className="text-royal-blue" />
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Shield size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-700 mb-2">First Name</div>
                    <div className="text-lg font-bold text-navy">{user?.firstName}</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                    <div className="text-sm font-semibold text-purple-700 mb-2">Last Name</div>
                    <div className="text-lg font-bold text-navy">{user?.lastName}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                  <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </div>
                  <div className="text-lg font-bold text-navy">{user?.email}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    className="input-field"
                  />
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Card */}
          <div className="card-luxury p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                <Lock size={24} className="text-royal-blue" />
                Change Password
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Lock size={18} />
                  Update Password
                </button>
              )}
            </div>

            {!isChangingPassword ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 text-neutral-600">
                  <Shield size={20} className="text-royal-blue" />
                  <p>Keep your account secure by using a strong password.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                    New Password * (minimum 6 characters)
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="input-field"
                  />
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
