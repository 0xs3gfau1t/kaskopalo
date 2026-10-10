import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../../firebase/config.js';

const AuthContext = createContext(null);

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/weak-password': 'Password should be at least 8 characters.',
  'auth/too-many-requests': 'Too many failed attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = ERROR_MESSAGES[err.code] || 'Failed to log in. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (email, password, displayName) => {
    setError(null);
    if (!displayName || displayName.trim().length === 0) {
      const msg = 'Display name is required.';
      setError(msg);
      throw new Error(msg);
    }
    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: displayName.trim(),
      });
    } catch (err) {
      const msg = ERROR_MESSAGES[err.code] || 'Failed to create account. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const msg = ERROR_MESSAGES[err.code] || 'Failed to sign in with Google.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const msg = 'Failed to log out.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
