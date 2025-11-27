import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TrainSearch from '../components/TrainSearch';
import { UserSelection } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<UserSelection | null>(null);

  const handleTrainSelect = (userSelection: UserSelection) => {
    setSelection(userSelection);
  };

  const handleCreateGroup = () => {
    if (selection) {
      navigate('/groups/create', { state: { selection } });
    }
  };

  const handleJoinGroup = () => {
    navigate('/groups/join');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.displayName}!
          </h1>
          <p className="text-gray-600 mt-2">Find your cabin location and coordinate with your travel group</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={handleJoinGroup}>
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Join a Group</h3>
                <p className="text-gray-600 text-sm">Enter a group code to join your friends</p>
              </div>
            </div>
          </div>

          <div
            className={`card hover:shadow-lg transition-shadow ${selection ? 'cursor-pointer' : 'opacity-50'}`}
            onClick={handleCreateGroup}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create a Group</h3>
                <p className="text-gray-600 text-sm">
                  {selection ? 'Create a group with your selection' : 'Select a train first'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Train Search Section */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Train</h2>
          <TrainSearch onSelect={handleTrainSelect} />
        </div>

        {/* Frequent Routes */}
        {currentUser?.frequentRoutes && currentUser.frequentRoutes.length > 0 && (
          <div className="mt-8 card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequent Routes</h2>
            <div className="space-y-3">
              {currentUser.frequentRoutes.map((route, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{route.trainName}</h3>
                    <p className="text-sm text-gray-600">{route.route}</p>
                  </div>
                  <span className="text-primary-600 font-medium">{route.trainNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
