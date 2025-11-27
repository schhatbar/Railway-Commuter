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
import { Timestamp } from 'firebase/firestore';

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
        try {
          // Fetch user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setCurrentUser(userProfile);
          } else {
            // If profile doesn't exist, create it from Firebase auth data
            try {
              await createUserProfile(firebaseUser.uid, {
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                phoneNumber: firebaseUser.phoneNumber || '',
                frequentRoutes: []
              });
              const newProfile = await getUserProfile(firebaseUser.uid);
              setCurrentUser(newProfile);
            } catch (profileError: any) {
              console.error('Error creating user profile:', profileError);
              // Don't sign out user if profile creation fails, keep auth state
              // Create a minimal user object from Firebase auth
              setCurrentUser({
                userId: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                phoneNumber: firebaseUser.phoneNumber || '',
                frequentRoutes: [],
                createdAt: Timestamp.now()
              });
            }
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          // Don't sign out user on Firestore errors, keep auth state
          // Create a minimal user object from Firebase auth
          if (firebaseUser) {
            setCurrentUser({
              userId: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              phoneNumber: firebaseUser.phoneNumber || '',
              frequentRoutes: [],
              createdAt: Timestamp.now()
            });
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Wait a moment to ensure auth state is propagated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create user profile in Firestore
      try {
        await createUserProfile(user.uid, {
          email: user.email || email,
          displayName,
          phoneNumber: '',
          frequentRoutes: []
        });

        // Fetch and set the new user profile
        const userProfile = await getUserProfile(user.uid);
        setCurrentUser(userProfile);
      } catch (firestoreError: any) {
        // Handle Firestore permission errors
        if (firestoreError.code === 'permission-denied' || firestoreError.code === 'permissions-denied') {
          throw new Error('Firestore permissions error. Please ensure security rules are deployed. See README for instructions.');
        }
        throw firestoreError;
      }
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please contact support or enable it in Firebase Console.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.message && error.message.includes('Firestore permissions')) {
        throw error;
      }
      // Re-throw the error with original message if it's not a known error
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please contact support or enable it in Firebase Console.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      // Re-throw the error with original message if it's not a known error
      throw error;
    }
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
