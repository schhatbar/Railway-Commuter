import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { joinGroup, getGroupByCode } from '../firebase/services';
import { GroupMember } from '../types';

const JoinGroup: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [groupCode, setGroupCode] = useState('');
  const [cabinNumber, setCabinNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [joiningFromNextStation, setJoiningFromNextStation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for group code in URL parameters
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setGroupCode(codeFromUrl);
    }
  }, [searchParams]);

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
        cabinNumber: cabinNumber.trim() || undefined,
        seatNumber: seatNumber.trim() || undefined,
        joiningFromNextStation: joiningFromNextStation
      };

      const updatedGroup = await joinGroup(groupCode, member);
      if (updatedGroup) {
        navigate(`/groups/${updatedGroup.groupId}`);
      } else {
        setError('Failed to join group. Please try again.');
      }
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={joiningFromNextStation}
                  onChange={(e) => {
                    setJoiningFromNextStation(e.target.checked);
                    if (e.target.checked) {
                      setCabinNumber('');
                      setSeatNumber('');
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  I will join from the next station
                </span>
              </label>
              <p className="text-xs text-gray-600 mt-2 ml-6">
                Check this if you don't have cabin/seat details yet
              </p>
            </div>

            {!joiningFromNextStation && (
              <>
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
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - leave blank if not available</p>
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
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - leave blank if not available</p>
                </div>
              </>
            )}

            {joiningFromNextStation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Joining from next station</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      You can update your cabin and seat details later from the group page.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
