// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth'; // Import User type directly
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore'; // Added increment
import { authChirho, dbChirho } from '@/lib/firebase-config-chirho';
import { initializeUserChirho as initializeUserActionChirho } from '@/lib/actions-chirho'; // Ensure this path is correct
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
          try {
            await initializeUserActionChirho(user.uid, user.email, user.displayName);
            const newProfile = await fetchUserProfileChirho(user.uid);
            setUserProfileChirho(newProfile);
          } catch (error) {
            console.error("Error initializing user profile after auth change:", error);
            setUserProfileChirho(null); 
            toastChirho({ variant: "destructive", title: "Profile Error", description: "Failed to create or load your user profile." });
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
        console.log(`No profile found for user ${userId}. Initialization will be attempted.`);
        return null; 
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toastChirho({ variant: "destructive", title: "Profile Error", description: "Could not load your profile." });
      return null;
    }
  };

  const logInWithGoogleChirho = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Diagnostic log for Google Sign-In
      console.log("Attempting Google Sign-In. Firebase App Options for authChirho instance:", authChirho.app.options);
      if (!authChirho.app.options.apiKey || !authChirho.app.options.authDomain || !authChirho.app.options.projectId) {
        console.error("CRITICAL: authChirho instance is missing key configuration for Google Sign-In!", authChirho.app.options);
        toastChirho({ variant: "destructive", title: "Google Sign-In Config Error", description: "Internal configuration error for Google Sign-In. Please contact support." });
        return;
      }
      
      setLoadingAuthChirho(true); // Set loading right before the popup attempt
      await signInWithPopup(authChirho, provider);
      // onAuthStateChanged will handle success and setting loading to false.
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === 'auth/popup-blocked' || 
          (error.message && error.message.toLowerCase().includes('popup was blocked')) ||
          (error.message && error.message.toLowerCase().includes('blocked by the browser'))) {
        toastChirho({
          variant: "destructive",
          title: "Popup Blocked",
          description: "Your browser blocked the Google Sign-In popup. Please check your browser settings to allow popups from this site or disable popup blockers and try again.",
          duration: 9000,
        });
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
         toastChirho({
          variant: "default", 
          title: "Sign-In Cancelled",
          description: "The Google Sign-In popup was closed before completion.",
          duration: 5000,
        });
      } else {
        toastChirho({ variant: "destructive", title: "Login Failed", description: error.message || "Could not sign in with Google." });
      }
      setLoadingAuthChirho(false); // Ensure loading is set to false on any error during the popup attempt phase
    }
    // Note: setLoadingAuthChirho(false) on successful sign-in or if onAuthStateChanged handles other non-error cancellations
    // is managed by the onAuthStateChanged listener.
  };

  const logInWithEmailChirho = async (email: string, pass: string) => {
    setLoadingAuthChirho(true);
    try {
      await signInWithEmailAndPassword(authChirho, email, pass);
      // onAuthStateChanged will handle profile fetching and toasts
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: "Login Failed", description: error.message || "Incorrect email or password." });
      setLoadingAuthChirho(false);
    }
  };

  const signUpWithEmailChirho = async (email: string, pass: string) => {
    setLoadingAuthChirho(true);
    try {
      await createUserWithEmailAndPassword(authChirho, email, pass);
      // onAuthStateChanged will handle new user creation and profile initialization.
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toastChirho({ variant: "destructive", title: "Signup Failed", description: error.message || "Could not create account." });
      setLoadingAuthChirho(false);
    }
  };

  const logOutChirho = async () => {
    setLoadingAuthChirho(true); // Set loading true at the start of logout
    try {
      await firebaseSignOut(authChirho);
      // onAuthStateChanged will set currentUserChirho and userProfileChirho to null, and setLoadingAuthChirho(false)
      routerChirho.push('/login-chirho');
      toastChirho({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout Error:", error);
      toastChirho({ variant: "destructive", title: "Logout Failed", description: error.message });
      setLoadingAuthChirho(false); // Ensure loading is false if logout errors out before onAuthStateChanged handles it
    }
    // No finally block to set loading false, as onAuthStateChanged is the primary driver for this after sign out.
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
