import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createJourneyReminder,
  getUserReminders,
  deleteReminder,
  updateReminder,
  getTrainByNumber
} from '../firebase/services';
import { JourneyReminder, UserSelection } from '../types';
import { Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import TrainSearch from '../components/TrainSearch';

const Reminders: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<JourneyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selection, setSelection] = useState<UserSelection | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadReminders();
    }
  }, [currentUser]);

  const loadReminders = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const userReminders = await getUserReminders(currentUser.userId);
      setReminders(userReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainSelect = (userSelection: UserSelection) => {
    setSelection(userSelection);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selection || !reminderDate || !reminderTime) return;

    try {
      const journeyDateTime = new Date(`${reminderDate}T${reminderTime}`);
      const reminderDateTime = new Date(journeyDateTime);
      reminderDateTime.setHours(reminderDateTime.getHours() - 1); // Remind 1 hour before

      await createJourneyReminder(currentUser.userId, {
        trainNumber: selection.trainNumber,
        trainName: selection.trainName,
        route: selection.trainName, // Using trainName as route for now
        journeyDate: Timestamp.fromDate(journeyDateTime),
        reminderTime: Timestamp.fromDate(reminderDateTime),
        coachNumber: selection.coachNumber,
        seatNumber: selection.seatNumber,
        isActive: true
      });

      await loadReminders();
      setShowAddForm(false);
      setSelection(null);
      setReminderDate('');
      setReminderTime('');

      // Set up browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        // Schedule notification (simplified - in production, use a service worker)
        const timeUntilReminder = reminderDateTime.getTime() - Date.now();
        if (timeUntilReminder > 0) {
          setTimeout(() => {
            new Notification('Journey Reminder', {
              body: `Your train ${selection.trainName} (${selection.trainNumber}) departs in 1 hour! Coach: ${selection.coachNumber}, Seat: ${selection.seatNumber}`,
              icon: '/logo192.png'
            });
          }, timeUntilReminder);
        }
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder. Please try again.');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        await deleteReminder(reminderId);
        await loadReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journey Reminders</h1>
            <p className="text-gray-600 mt-2">Get notified before your train journey</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add Reminder'}
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Journey Reminder</h2>
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <TrainSearch onSelect={handleTrainSelect} />

              {selection && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Journey Date
                      </label>
                      <input
                        type="date"
                        id="reminderDate"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Journey Time
                      </label>
                      <input
                        type="time"
                        id="reminderTime"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    You'll be reminded 1 hour before your journey
                  </p>
                  <button type="submit" className="btn-primary w-full">
                    Create Reminder
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Reminders</h2>
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600">No active reminders</p>
              <p className="text-sm text-gray-500 mt-2">Create a reminder to get notified before your journey</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.reminderId}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{reminder.trainName}</h3>
                        <span className="text-primary-600 font-medium">{reminder.trainNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reminder.route}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Journey Date</p>
                          <p className="font-medium text-gray-900">
                            {reminder.journeyDate.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Journey Time</p>
                          <p className="font-medium text-gray-900">
                            {reminder.journeyDate.toDate().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Coach</p>
                          <p className="font-medium text-gray-900">{reminder.coachNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Seat</p>
                          <p className="font-medium text-gray-900">{reminder.seatNumber}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(reminder.reminderId)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete reminder"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;

