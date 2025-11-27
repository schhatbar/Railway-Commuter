import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { removeFrequentRoute } from '../firebase/services';

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    phoneNumber: currentUser?.phoneNumber || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateUserProfile(formData);
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      phoneNumber: currentUser?.phoneNumber || ''
    });
    setEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-lg mb-6 ${
                message.includes('success')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={currentUser?.email || ''}
                  className="input-field bg-gray-100"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-medium text-gray-900">{currentUser?.displayName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">
                  {currentUser?.phoneNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-medium text-gray-900">
                  {currentUser?.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Frequent Routes Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Frequent Routes</h2>
          </div>
          {currentUser?.frequentRoutes && currentUser.frequentRoutes.length > 0 ? (
            <div className="space-y-3">
              {currentUser.frequentRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <h3 className="font-semibold text-gray-900">{route.trainName}</h3>
                    <p className="text-sm text-gray-600">{route.route}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary-600 font-medium">{route.trainNumber}</span>
                    <button
                      onClick={async () => {
                        if (currentUser && window.confirm('Remove this route from favorites?')) {
                          try {
                            await removeFrequentRoute(currentUser.userId, route.trainNumber);
                            await updateUserProfile({});
                          } catch (error) {
                            console.error('Error removing route:', error);
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove route"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No frequent routes saved yet. Save routes from the dashboard to see them here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
