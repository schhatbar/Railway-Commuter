import { Timestamp } from 'firebase/firestore';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  frequentRoutes: FrequentRoute[];
  createdAt: Timestamp;
}

export interface FrequentRoute {
  trainNumber: string;
  trainName: string;
  route: string;
}

export interface Coach {
  coachType: 'sleeper' | 'ac' | 'general' | 'firstClass';
  coachNumber: string;
  totalSeats: number;
  platformPosition: number; // distance from platform start in meters
}

export interface Train {
  trainNumber: string;
  trainName: string;
  route: string;
  coaches: Coach[];
}

export interface GroupMember {
  userId: string;
  cabinNumber: string;
  seatNumber: string;
  userName: string;
  joinedAt?: Timestamp;
}

export interface Group {
  groupId: string;
  groupName: string;
  groupCode: string; // 6-digit code
  createdBy: string;
  members: GroupMember[];
  trainNumber: string;
  route: string;
  journeyDate: Timestamp;
  createdAt: Timestamp;
  isActive?: boolean;
}

export interface ChatMessage {
  messageId: string;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Timestamp;
}

export interface PlatformMarker {
  type: 'entrance' | 'exit' | 'stairs' | 'lift' | 'foodStall' | 'waitingRoom';
  position: number; // distance from platform start in meters
  label: string;
}

export interface UserSelection {
  trainNumber: string;
  trainName: string;
  coachNumber: string;
  seatNumber: string;
  coachType: string;
  platformPosition: number;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}
