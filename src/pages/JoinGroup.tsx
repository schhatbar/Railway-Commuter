import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { joinGroup, getGroupByCode } from '../firebase/services';
import { GroupMember } from '../types';

const JoinGroup: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groupCode, setGroupCode] = useState('');
  const [cabinNumber, setCabinNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    if (groupCode.length !== 6) {
      setError('Group code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Check if group exists
      const group = await getGroupByCode(groupCode);
      if (!group) {
        setError('Group not found. Please check the code and try again.');
        setLoading(false);
        return;
      }

      const member: GroupMember = {
        userId: currentUser.userId,
        userName: currentUser.displayName,
        cabinNumber,
        seatNumber
      };

      await joinGroup(groupCode, member);
      navigate(`/groups/${group.groupId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </button>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Join a Group</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-1">
                Group Code
              </label>
              <input
                type="text"
                id="groupCode"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="input-field font-mono text-lg tracking-wider text-center"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ask your group admin for the 6-digit group code
              </p>
            </div>

            <div>
              <label htmlFor="cabinNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Your Cabin/Coach Number
              </label>
              <input
                type="text"
                id="cabinNumber"
                value={cabinNumber}
                onChange={(e) => setCabinNumber(e.target.value)}
                placeholder="e.g., S1, A2, B3"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Your Seat Number
              </label>
              <input
                type="text"
                id="seatNumber"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="e.g., 42"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || groupCode.length !== 6}
              className="w-full btn-primary"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
