// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { authChirho, dbChirho } from '@/lib/firebase-config-chirho';
import { initializeUserChirho as initializeUserActionChirho } from '@/lib/actions-chirho';
import { useRouter } from 'next/navigation';
import { useToastChirho } from '@/hooks/use-toast-chirho';

export interface UserProfileChirho {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  credits: number;
  createdAt: any; // Firestore Timestamp
  lastLogin?: any; // Firestore Timestamp
}

interface AuthContextTypeChirho {
  currentUserChirho: User | null;
  userProfileChirho: UserProfileChirho | null;
  loadingAuthChirho: boolean;
  logInWithGoogleChirho: () => Promise<void>;
  logInWithEmailChirho: (email: string, pass: string) => Promise<void>;
  signUpWithEmailChirho: (email: string, pass: string) => Promise<void>;
  logOutChirho: () => Promise<void>;
  fetchUserProfileChirho: (userId: string) => Promise<UserProfileChirho | null>;
  updateLocalUserProfileChirho: (profile: Partial<UserProfileChirho>) => void;
}

const AuthContextChirho = createContext<AuthContextTypeChirho | undefined>(undefined);

export const AuthProviderChirho = ({ children }: { children: ReactNode }) => {
  const [currentUserChirho, setCurrentUserChirho] = useState<User | null>(null);
  const [userProfileChirho, setUserProfileChirho] = useState<UserProfileChirho | null>(null);
  const [loadingAuthChirho, setLoadingAuthChirho] = useState(true);
  const routerChirho = useRouter();
  const { toastChirho } = useToastChirho();

  useEffect(() => {
    const unsubscribeChirho = onAuthStateChanged(authChirho, async (user) => {
      setLoadingAuthChirho(true);
      if (user) {
        setCurrentUserChirho(user);
        const profile = await fetchUserProfileChirho(user.uid);
        if (profile) {
          setUserProfileChirho(profile);
           try {
            await updateDoc(doc(dbChirho, "users", user.uid), { lastLogin: serverTimestamp() });
          } catch (error) {
            console.warn("Failed to update lastLogin:", error);
          }
        } else {
          // This case handles if a user is authenticated with Firebase Auth
          // but doesn't have a profile doc yet (e.g., first Google Sign-In)
          // Or if profile fetching failed for some reason.
          // We'll attempt to initialize it.
          try {
            await initializeUserActionChirho(user.uid, user.email, user.displayName);
            const newProfile = await fetchUserProfileChirho(user.uid);
            setUserProfileChirho(newProfile);
          } catch (error) {
            console.error("Error initializing user profile after auth change:", error);
            setUserProfileChirho(null); // Ensure profile is null if initialization fails
          }
        }
      } else {
        setCurrentUserChirho(null);
        setUserProfileChirho(null);
      }
      setLoadingAuthChirho(false);
    });
    return () => unsubscribeChirho();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfileChirho = async (userId: string): Promise<UserProfileChirho | null> => {
    if (!userId) return null;
    try {
      const userDocRef = doc(dbChirho, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserProfileChirho;
      } else {
        console.log(`No profile found for user ${userId}, attempting to initialize.`);
        return null; // Will be handled by onAuthStateChanged
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toastChirho({ variant: "destructive", title: "Profile Error", description: "Could not load your profile." });
      return null;
    }
  };

  const logInWithGoogleChirho = async () => {
    setLoadingAuthChirho(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authChirho, provider);
      // onAuthStateChanged will handle profile creation/fetching
      toastChirho({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: "Login Failed", description: error.message });
      setLoadingAuthChirho(false);
    }
  };

  const logInWithEmailChirho = async (email: string, pass: string) => {
    setLoadingAuthChirho(true);
    try {
      await signInWithEmailAndPassword(authChirho, email, pass);
      // onAuthStateChanged will handle profile fetching
      toastChirho({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: "Login Failed", description: error.message });
      setLoadingAuthChirho(false);
    }
  };

  const signUpWithEmailChirho = async (email: string, pass: string) => {
    setLoadingAuthChirho(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(authChirho, email, pass);
      await initializeUserActionChirho(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
      // onAuthStateChanged will update currentUserChirho and fetch profile
      toastChirho({ title: "Signup Successful", description: "Welcome! Your account is ready." });
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toastChirho({ variant: "destructive", title: "Signup Failed", description: error.message });
      setLoadingAuthChirho(false);
    }
  };

  const logOutChirho = async () => {
    setLoadingAuthChirho(true);
    try {
      await firebaseSignOut(authChirho);
      setCurrentUserChirho(null);
      setUserProfileChirho(null);
      routerChirho.push('/login-chirho');
      toastChirho({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout Error:", error);
      toastChirho({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
        setLoadingAuthChirho(false);
    }
  };
  
  const updateLocalUserProfileChirho = (profileUpdate: Partial<UserProfileChirho>) => {
    setUserProfileChirho(prev => prev ? { ...prev, ...profileUpdate } : null);
  };

  return (
    <AuthContextChirho.Provider value={{ currentUserChirho, userProfileChirho, loadingAuthChirho, logInWithGoogleChirho, logInWithEmailChirho, signUpWithEmailChirho, logOutChirho, fetchUserProfileChirho, updateLocalUserProfileChirho }}>
      {children}
    </AuthContextChirho.Provider>
  );
};

export const useAuthChirho = () => {
  const contextChirho = useContext(AuthContextChirho);
  if (contextChirho === undefined) {
    throw new Error('useAuthChirho must be used within an AuthProviderChirho');
  }
  return contextChirho;
};
