import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile, getUserProfile, updateUserProfile as updateProfile } from '../firebase/services';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result from Google Sign-In
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const user = result.user;
          // Check if user profile exists, if not create it
          let userProfile = await getUserProfile(user.uid);
          if (!userProfile) {
            await createUserProfile(user.uid, {
              email: user.email || '',
              displayName: user.displayName || 'User',
              phoneNumber: user.phoneNumber || '',
              frequentRoutes: []
            });
            userProfile = await getUserProfile(user.uid);
          }
          setCurrentUser(userProfile);
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        // Store error in sessionStorage to display on login/register page
        if (error.code === 'auth/operation-not-allowed') {
          sessionStorage.setItem('authError', 'Google Sign-In is not enabled. Please contact support or use email/password sign-in.');
        } else if (error.code) {
          sessionStorage.setItem('authError', error.message || 'Authentication failed');
        }
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userProfile = await getUserProfile(firebaseUser.uid);
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email: user.email || email,
      displayName,
      phoneNumber: '',
      frequentRoutes: []
    });

    // Fetch and set the new user profile
    const userProfile = await getUserProfile(user.uid);
    setCurrentUser(userProfile);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // The redirect result will be handled in the useEffect hook
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    await updateProfile(currentUser.userId, updates);
    const updatedProfile = await getUserProfile(currentUser.userId);
    setCurrentUser(updatedProfile);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
