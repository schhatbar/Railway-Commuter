import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createGroup } from '../firebase/services';
import { UserSelection, GroupMember } from '../types';
import { Timestamp } from 'firebase/firestore';

const CreateGroup: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selection = location.state?.selection as UserSelection | undefined;

  const [groupName, setGroupName] = useState('');
  const [trainNumber, setTrainNumber] = useState(selection?.trainNumber || '');
  const [trainName, setTrainName] = useState(selection?.trainName || '');
  const [route, setRoute] = useState(selection?.trainName || '');
  const [coachNumber, setCoachNumber] = useState(selection?.coachNumber || '');
  const [seatNumber, setSeatNumber] = useState(selection?.seatNumber || '');
  const [journeyDate, setJourneyDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Pre-fill form if selection is available
  useEffect(() => {
    if (selection) {
      setTrainNumber(selection.trainNumber);
      setTrainName(selection.trainName);
      setRoute(selection.trainName);
      setCoachNumber(selection.coachNumber);
      setSeatNumber(selection.seatNumber);
    }
  }, [selection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    // Validation
    if (!trainNumber.trim() || !coachNumber.trim() || !seatNumber.trim()) {
      setError('Please fill in all train details (Train Number, Coach, and Seat)');
      return;
    }

    setLoading(true);

    try {
      const member: GroupMember = {
        userId: currentUser.userId,
        userName: currentUser.displayName,
        cabinNumber: coachNumber.trim(),
        seatNumber: seatNumber.trim()
      };

      const code = await createGroup({
        groupName,
        createdBy: currentUser.userId,
        members: [member],
        trainNumber: trainNumber.trim(),
        route: route.trim() || trainName.trim() || trainNumber.trim(),
        journeyDate: Timestamp.fromDate(new Date(journeyDate))
      });

      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleViewGroup = async () => {
    // Find the group ID and navigate
    navigate('/groups');
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Created!</h2>
            <p className="text-gray-600">Share this code with your travel companions</p>
          </div>

          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Group Code</p>
            <p className="text-4xl font-bold font-mono text-primary-600 tracking-wider">{generatedCode}</p>
          </div>

          <div className="space-y-3">
            <button onClick={handleCopyCode} className="w-full btn-secondary">
              Copy Code
            </button>
            <button onClick={handleViewGroup} className="w-full btn-primary">
              View Group
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Travel Group</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Friends Trip, Family Travel"
                className="input-field"
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Train Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trainNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Train Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="trainNumber"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    placeholder="e.g., 12301"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="trainName" className="block text-sm font-medium text-gray-700 mb-1">
                    Train Name
                  </label>
                  <input
                    type="text"
                    id="trainName"
                    value={trainName}
                    onChange={(e) => setTrainName(e.target.value)}
                    placeholder="e.g., Rajdhani Express"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <input
                  type="text"
                  id="route"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g., New Delhi - Howrah"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="coachNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Coach/Cabin Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="coachNumber"
                    value={coachNumber}
                    onChange={(e) => setCoachNumber(e.target.value)}
                    placeholder="e.g., S1, A2, B3"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Seat Number <span className="text-red-500">*</span>
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
              </div>
            </div>

            <div>
              <label htmlFor="journeyDate" className="block text-sm font-medium text-gray-700 mb-1">
                Journey Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="journeyDate"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
