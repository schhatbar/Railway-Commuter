import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToGroup,
  subscribeToMessages,
  sendMessage,
  leaveGroup,
  deleteGroup,
  getTrainByNumber
} from '../firebase/services';
import { Group, ChatMessage, Train } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import PlatformVisualization from '../components/PlatformVisualization';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [train, setTrain] = useState<Train | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'chat'>('members');

  useEffect(() => {
    if (!groupId) return;

    // Subscribe to group updates
    const unsubscribeGroup = subscribeToGroup(groupId, async (updatedGroup) => {
      setGroup(updatedGroup);

      // Fetch train data
      if (updatedGroup.trainNumber) {
        const trainData = await getTrainByNumber(updatedGroup.trainNumber);
        setTrain(trainData);
      }

      setLoading(false);
    });

    // Subscribe to messages
    const unsubscribeMessages = subscribeToMessages(groupId, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => {
      unsubscribeGroup();
      unsubscribeMessages();
    };
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !groupId) return;

    try {
      await sendMessage(groupId, currentUser.userId, currentUser.displayName, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || !groupId) return;

    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(groupId, currentUser.userId);
        navigate('/groups');
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;

    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await deleteGroup(groupId);
        navigate('/groups');
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleCopyCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.groupCode);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Group Not Found</h2>
          <button onClick={() => navigate('/groups')} className="btn-primary">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  const isOwner = group.createdBy === currentUser?.userId;
  const currentMember = group.members.find(m => m.userId === currentUser?.userId);
  const selectedCoach = train?.coaches.find(c => c.coachNumber === currentMember?.cabinNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/groups')}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.groupName}</h1>
              <p className="text-gray-600 mt-1">{group.route}</p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Group Code</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-bold text-primary-600">{group.groupCode}</p>
                  <button onClick={handleCopyCode} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {isOwner ? (
                <button onClick={handleDeleteGroup} className="btn-secondary text-red-600 hover:bg-red-50">
                  Delete Group
                </button>
              ) : (
                <button onClick={handleLeaveGroup} className="btn-secondary">
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Platform Visualization */}
        {train && selectedCoach && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Location</h2>
            <PlatformVisualization
              train={train}
              selectedCoach={selectedCoach}
              groupMembers={group.members.map(m => ({
                coachNumber: m.cabinNumber,
                userName: m.userName
              }))}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Members ({group.members.length})
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chat
                {messages.length > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {messages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              {group.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {member.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.userName}
                        {member.userId === currentUser?.userId && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Coach {member.cabinNumber} • Seat {member.seatNumber}
                      </p>
                    </div>
                  </div>
                  {member.userId === group.createdBy && (
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col" style={{ height: '500px' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`flex ${
                        message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          message.userId === currentUser?.userId
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {message.userId !== currentUser?.userId && (
                          <p className="text-xs font-medium mb-1 opacity-75">{message.userName}</p>
                        )}
                        <p>{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {message.timestamp.toDate().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" disabled={!newMessage.trim()} className="btn-primary">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
