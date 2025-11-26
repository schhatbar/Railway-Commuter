import React, { useState } from 'react';
import { searchTrains, getTrainByNumber } from '../firebase/services';
import { Train, Coach, UserSelection } from '../types';
import PlatformVisualization from './PlatformVisualization';

interface TrainSearchProps {
  onSelect: (selection: UserSelection) => void;
}

const TrainSearch: React.FC<TrainSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Train[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [seatNumber, setSeatNumber] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      // First try exact match by train number
      const exactMatch = await getTrainByNumber(searchTerm.trim());
      if (exactMatch) {
        setSearchResults([exactMatch]);
      } else {
        // Otherwise search by partial match
        const results = await searchTrains(searchTerm);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching trains:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleTrainSelect = (train: Train) => {
    setSelectedTrain(train);
    setSelectedCoach(null);
    setSeatNumber('');
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
  };

  const handleConfirmSelection = () => {
    if (selectedTrain && selectedCoach && seatNumber) {
      const selection: UserSelection = {
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.trainName,
        coachNumber: selectedCoach.coachNumber,
        seatNumber,
        coachType: selectedCoach.coachType,
        platformPosition: selectedCoach.platformPosition
      };
      onSelect(selection);
    }
  };

  const getCoachColor = (coachType: string) => {
    switch (coachType) {
      case 'ac':
      case 'firstClass':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'sleeper':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCoachLabel = (coachType: string) => {
    switch (coachType) {
      case 'ac':
        return 'AC';
      case 'firstClass':
        return '1st Class';
      case 'sleeper':
        return 'Sleeper';
      case 'general':
        return 'General';
      default:
        return coachType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by train number, name, or route..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={searching} className="btn-primary">
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedTrain && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Search Results</h3>
          {searchResults.map((train) => (
            <div
              key={train.trainNumber}
              onClick={() => handleTrainSelect(train)}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{train.trainName}</h4>
                  <p className="text-sm text-gray-600">{train.route}</p>
                  <p className="text-xs text-gray-500 mt-1">{train.coaches.length} coaches</p>
                </div>
                <span className="text-primary-600 font-bold">{train.trainNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Train - Coach Selection */}
      {selectedTrain && !selectedCoach && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedTrain.trainName}</h3>
              <p className="text-sm text-gray-600">{selectedTrain.route}</p>
            </div>
            <button onClick={() => setSelectedTrain(null)} className="text-sm text-primary-600 hover:text-primary-700">
              Change Train
            </button>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Select Your Coach</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedTrain.coaches.map((coach) => (
                <button
                  key={coach.coachNumber}
                  onClick={() => handleCoachSelect(coach)}
                  className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${getCoachColor(coach.coachType)}`}
                >
                  <div className="font-bold text-lg">{coach.coachNumber}</div>
                  <div className="text-xs mt-1">{getCoachLabel(coach.coachType)}</div>
                  <div className="text-xs">{coach.totalSeats} seats</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Coach - Seat Selection and Platform Visualization */}
      {selectedTrain && selectedCoach && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedTrain.trainName} - Coach {selectedCoach.coachNumber}
              </h3>
              <p className="text-sm text-gray-600">{getCoachLabel(selectedCoach.coachType)}</p>
            </div>
            <button onClick={() => setSelectedCoach(null)} className="text-sm text-primary-600 hover:text-primary-700">
              Change Coach
            </button>
          </div>

          {/* Seat Number Input */}
          <div className="max-w-xs">
            <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Seat Number
            </label>
            <input
              type="text"
              id="seatNumber"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              placeholder="e.g., 42"
              className="input-field"
            />
          </div>

          {/* Platform Visualization */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Platform Location</h4>
            <PlatformVisualization
              train={selectedTrain}
              selectedCoach={selectedCoach}
            />
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmSelection}
            disabled={!seatNumber}
            className="btn-primary w-full"
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainSearch;
