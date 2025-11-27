import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToGroup,
  subscribeToMessages,
  sendMessage,
  leaveGroup,
  deleteGroup,
  getTrainByNumber,
  updateMemberSeat
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
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editCabinNumber, setEditCabinNumber] = useState('');
  const [editSeatNumber, setEditSeatNumber] = useState('');
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setChatError('');
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error('Error subscribing to messages:', error);
      setChatError('Failed to load messages. Please refresh the page.');
    });

    return () => {
      unsubscribeGroup();
      unsubscribeMessages();
    };
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !groupId) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setChatError('');

    try {
      await sendMessage(groupId, currentUser.userId, currentUser.displayName, messageText);
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setChatError(error.message || 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message text
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

  const handleShareLocation = () => {
    if (!currentUser || !group || !train || !selectedCoach) return;

    const shareData = {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      coachNumber: currentMember?.cabinNumber || '',
      seatNumber: currentMember?.seatNumber || '',
      groupCode: group.groupCode
    };

    const shareUrl = `${window.location.origin}/groups/join?code=${group.groupCode}`;
    const shareText = `Join my travel group! Train: ${train.trainName} (${train.trainNumber}), Coach: ${shareData.coachNumber}, Seat: ${shareData.seatNumber}. Group Code: ${group.groupCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Railway Commuter - Join My Group',
        text: shareText,
        url: shareUrl
      }).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Share link copied to clipboard!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Share link copied to clipboard!');
    }
  };

  const handleEditMember = (member: typeof currentMember) => {
    if (member) {
      setEditingMember(member.userId);
      setEditCabinNumber(member.cabinNumber || '');
      setEditSeatNumber(member.seatNumber || '');
    }
  };

  const handleSaveMemberEdit = async () => {
    if (!groupId || !editingMember || !editCabinNumber || !editSeatNumber) return;

    try {
      await updateMemberSeat(groupId, editingMember, editCabinNumber, editSeatNumber);
      setEditingMember(null);
      setEditCabinNumber('');
      setEditSeatNumber('');
    } catch (error) {
      console.error('Error updating member details:', error);
      alert('Failed to update details. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditCabinNumber('');
    setEditSeatNumber('');
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

            <div className="flex gap-3 flex-wrap">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Group Code</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-bold text-primary-600">{group.groupCode}</p>
                  <button onClick={handleCopyCode} className="text-gray-400 hover:text-gray-600" title="Copy group code">
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

              <button
                onClick={handleShareLocation}
                className="btn-secondary flex items-center gap-2"
                title="Share cabin location"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Location
              </button>

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
              groupMembers={group.members
                .filter(m => m.cabinNumber) // Only show members with cabin numbers on platform
                .map(m => ({
                  coachNumber: m.cabinNumber!,
                  userName: m.userName
                }))}
            />
            {group.members.some(m => !m.cabinNumber || m.joiningFromNextStation) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Some members don't have cabin/seat details yet or are joining from the next station.
                </p>
              </div>
            )}
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
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  {editingMember === member.userId && member.userId === currentUser?.userId ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-bold">
                            {member.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.userName} (You)</p>
                          <p className="text-xs text-gray-500">Update your cabin and seat details</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Cabin/Coach
                          </label>
                          <input
                            type="text"
                            value={editCabinNumber}
                            onChange={(e) => setEditCabinNumber(e.target.value)}
                            placeholder="e.g., S1, A2"
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Seat Number
                          </label>
                          <input
                            type="text"
                            value={editSeatNumber}
                            onChange={(e) => setEditSeatNumber(e.target.value)}
                            placeholder="e.g., 42"
                            className="input-field text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveMemberEdit}
                          disabled={!editCabinNumber || !editSeatNumber}
                          className="btn-primary text-sm flex-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
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
                            {member.joiningFromNextStation ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Joining from next station
                              </span>
                            ) : member.cabinNumber && member.seatNumber ? (
                              <>Coach {member.cabinNumber} • Seat {member.seatNumber}</>
                            ) : (
                              <span className="text-gray-400 italic">Cabin/Seat details not provided</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.userId === group.createdBy && (
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Owner
                          </span>
                        )}
                        {member.userId === currentUser?.userId && (!member.cabinNumber || !member.seatNumber) && (
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Update Details
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col" style={{ height: '500px' }}>
              {/* Error Message */}
              {chatError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                  {chatError}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2" style={{ maxHeight: '400px' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
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
                          <p className="break-words">{message.message}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setChatError('');
                  }}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || loading} 
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
