import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { User, Group, Train, ChatMessage, GroupMember, FrequentRoute, JourneyReminder } from '../types';

// User Services
export const createUserProfile = async (userId: string, userData: Omit<User, 'userId' | 'createdAt'>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      ...userData,
      createdAt: Timestamp.now()
    });
  } catch (error: any) {
    // Provide more context for permission errors
    if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
      throw new Error('Permission denied: Firestore security rules may not be deployed. Please deploy firestore.rules to Firebase.');
    }
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as User : null;
  } catch (error: any) {
    // Provide more context for permission errors
    if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
      throw new Error('Permission denied: Firestore security rules may not be deployed. Please deploy firestore.rules to Firebase.');
    }
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
};

export const addFrequentRoute = async (userId: string, route: FrequentRoute) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const user = userSnap.data() as User;
    const existingRoutes = user.frequentRoutes || [];
    
    // Check if route already exists
    const routeExists = existingRoutes.some(
      r => r.trainNumber === route.trainNumber
    );
    
    if (!routeExists) {
      const updatedRoutes = [...existingRoutes, route];
      await updateDoc(userRef, { frequentRoutes: updatedRoutes });
    }
  }
};

export const removeFrequentRoute = async (userId: string, trainNumber: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const user = userSnap.data() as User;
    const updatedRoutes = (user.frequentRoutes || []).filter(
      r => r.trainNumber !== trainNumber
    );
    await updateDoc(userRef, { frequentRoutes: updatedRoutes });
  }
};

// Train Services
export const getTrainByNumber = async (trainNumber: string): Promise<Train | null> => {
  const trainRef = doc(db, 'trains', trainNumber);
  const trainSnap = await getDoc(trainRef);
  return trainSnap.exists() ? trainSnap.data() as Train : null;
};

export const searchTrains = async (searchTerm: string): Promise<Train[]> => {
  const trainsRef = collection(db, 'trains');
  const q = query(trainsRef);
  const querySnapshot = await getDocs(q);

  const trains: Train[] = [];
  querySnapshot.forEach((doc) => {
    const train = doc.data() as Train;
    if (
      train.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.route.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      trains.push(train);
    }
  });

  return trains;
};

// Group Services
export const createGroup = async (groupData: Omit<Group, 'groupId' | 'createdAt' | 'groupCode'>): Promise<string> => {
  try {
    const groupCode = Math.floor(100000 + Math.random() * 900000).toString();
    const groupRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      groupCode,
      createdAt: Timestamp.now(),
      isActive: true
    });

    await updateDoc(groupRef, { groupId: groupRef.id });
    return groupCode;
  } catch (error: any) {
    // Provide more context for permission errors
    if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
      throw new Error('Permission denied: Firestore security rules may not be deployed. Please deploy firestore.rules to Firebase.');
    }
    throw error;
  }
};

export const joinGroup = async (groupCode: string, member: GroupMember): Promise<Group | null> => {
  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where('groupCode', '==', groupCode), where('isActive', '==', true));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const groupDoc = querySnapshot.docs[0];
  const group = { groupId: groupDoc.id, ...groupDoc.data() } as Group;

  // Check if user is already a member
  if (group.members.some(m => m.userId === member.userId)) {
    return group;
  }

  const updatedMembers = [...group.members, { ...member, joinedAt: Timestamp.now() }];
  await updateDoc(doc(db, 'groups', groupDoc.id), { members: updatedMembers });

  return { ...group, members: updatedMembers };
};

export const leaveGroup = async (groupId: string, userId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (groupSnap.exists()) {
    const group = groupSnap.data() as Group;
    const updatedMembers = group.members.filter(m => m.userId !== userId);
    await updateDoc(groupRef, { members: updatedMembers });
  }
};

export const deleteGroup = async (groupId: string) => {
  await deleteDoc(doc(db, 'groups', groupId));

  // Delete all messages in the group
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, where('groupId', '==', groupId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, 'messages', docSnap.id));
  });
};

export const getGroupByCode = async (groupCode: string): Promise<Group | null> => {
  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where('groupCode', '==', groupCode));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return { groupId: doc.id, ...doc.data() } as Group;
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const groupsRef = collection(db, 'groups');
  const querySnapshot = await getDocs(groupsRef);

  const groups: Group[] = [];
  querySnapshot.forEach((doc) => {
    const group = doc.data() as Group;
    if (group.members.some(m => m.userId === userId) && group.isActive) {
      groups.push(group);
    }
  });

  return groups;
};

// Real-time listeners
export const subscribeToGroup = (groupId: string, callback: (group: Group) => void) => {
  const groupRef = doc(db, 'groups', groupId);
  return onSnapshot(groupRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Group);
    }
  });
};

// Chat Services
export const sendMessage = async (groupId: string, userId: string, userName: string, message: string) => {
  await addDoc(collection(db, 'messages'), {
    groupId,
    userId,
    userName,
    message,
    timestamp: Timestamp.now()
  });
};

export const subscribeToMessages = (
  groupId: string, 
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: any) => void
) => {
  const messagesRef = collection(db, 'messages');
  
  // Try with orderBy first (requires index)
  const q = query(
    messagesRef,
    where('groupId', '==', groupId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ messageId: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    },
    (error) => {
      console.error('Error in message subscription:', error);
      
      // If index doesn't exist, try without orderBy as fallback
      if (error.code === 'failed-precondition' || String(error.code) === '9') {
        console.warn('Firestore index missing. Using fallback query without orderBy.');
        const fallbackQuery = query(
          messagesRef,
          where('groupId', '==', groupId)
        );
        
        // Return the fallback subscription
        return onSnapshot(fallbackQuery, (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            messages.push({ messageId: doc.id, ...doc.data() } as ChatMessage);
          });
          // Sort manually by timestamp
          messages.sort((a, b) => {
            try {
              const aTime = a.timestamp?.toDate?.()?.getTime() || 0;
              const bTime = b.timestamp?.toDate?.()?.getTime() || 0;
              return aTime - bTime;
            } catch {
              return 0;
            }
          });
          callback(messages);
        });
      } else {
        // For other errors, call onError if provided
        if (onError) {
          onError(error);
        }
      }
    }
  );
};

// Update member location/seat in group
export const updateMemberSeat = async (groupId: string, userId: string, cabinNumber: string, seatNumber: string) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (groupSnap.exists()) {
    const group = groupSnap.data() as Group;
    const updatedMembers = group.members.map(m =>
      m.userId === userId ? { ...m, cabinNumber, seatNumber, joiningFromNextStation: false } : m
    );
    await updateDoc(groupRef, { members: updatedMembers });
  }
};

// Journey Reminder Services
export const createJourneyReminder = async (userId: string, reminder: Omit<JourneyReminder, 'reminderId' | 'createdAt'>) => {
  const reminderRef = await addDoc(collection(db, 'reminders'), {
    ...reminder,
    userId,
    createdAt: Timestamp.now()
  });
  return reminderRef.id;
};

export const getUserReminders = async (userId: string): Promise<JourneyReminder[]> => {
  const remindersRef = collection(db, 'reminders');
  const q = query(
    remindersRef,
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('journeyDate', 'asc')
  );
  const querySnapshot = await getDocs(q);

  const reminders: JourneyReminder[] = [];
  querySnapshot.forEach((doc) => {
    reminders.push({ reminderId: doc.id, ...doc.data() } as JourneyReminder);
  });

  return reminders;
};

export const deleteReminder = async (reminderId: string) => {
  await deleteDoc(doc(db, 'reminders', reminderId));
};

export const updateReminder = async (reminderId: string, updates: Partial<JourneyReminder>) => {
  const reminderRef = doc(db, 'reminders', reminderId);
  await updateDoc(reminderRef, updates);
};
