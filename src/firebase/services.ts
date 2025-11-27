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
import { User, Group, Train, ChatMessage, GroupMember } from '../types';

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
  const group = groupDoc.data() as Group;

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

  return querySnapshot.docs[0].data() as Group;
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

export const subscribeToMessages = (groupId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('groupId', '==', groupId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ messageId: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
};

// Update member location/seat in group
export const updateMemberSeat = async (groupId: string, userId: string, cabinNumber: string, seatNumber: string) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);

  if (groupSnap.exists()) {
    const group = groupSnap.data() as Group;
    const updatedMembers = group.members.map(m =>
      m.userId === userId ? { ...m, cabinNumber, seatNumber } : m
    );
    await updateDoc(groupRef, { members: updatedMembers });
  }
};
