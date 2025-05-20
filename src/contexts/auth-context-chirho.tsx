// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { authChirho } from '@/lib/firebase-config-chirho';
import { initializeUserChirho as initializeUserActionChirho, fetchUserProfileFromServerChirho } from '@/lib/actions-chirho'; 
import { useRouter } from 'next/navigation';
import { useToastChirho } from '@/hooks/use-toast-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; // Updated import


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
  routerChirho: ReturnType<typeof useRouter> | null; 
  currentLangChirho: string; 
}

const AuthContextChirho = createContext<AuthContextTypeChirho | undefined>(undefined);

interface AuthProviderPropsChirho {
  children: ReactNode;
  lang: string; 
  dictionary: DictionaryChirho['authContext']; // Expect authContext part of the dictionary
}

export const AuthProviderChirho = ({ children, lang, dictionary }: AuthProviderPropsChirho) => {
  const [currentUserChirho, setCurrentUserChirho] = useState<User | null>(null);
  const [userProfileChirho, setUserProfileChirho] = useState<UserProfileChirho | null>(null);
  const [loadingAuthChirho, setLoadingAuthChirho] = useState(true);
  const routerChirho = useRouter();
  const { toastChirho } = useToastChirho();
  const [currentLangChirho, setCurrentLangChirho] = useState(lang);
  // Dictionary is now passed as a prop

  useEffect(() => {
    setCurrentLangChirho(lang); 
  }, [lang]);


  useEffect(() => {
    const unsubscribeChirho = onAuthStateChanged(authChirho, async (user) => {
      setLoadingAuthChirho(true);
      if (user) {
        setCurrentUserChirho(user);
        try {
          const initResult = await initializeUserActionChirho(user.uid, user.email, user.displayName, user.photoURL);
          if (!initResult.success) {
             console.error("Failed to initialize user on server:", initResult.error);
             toastChirho({ variant: "destructive", title: dictionary?.toastProfileSetupErrorTitle || "Profile Setup Error", description: initResult.error || dictionary?.toastProfileSetupErrorDescription || "There was an issue setting up your profile." });
          }
          
          const profileResult = await fetchUserProfileFromServerChirho(user.uid);
          if (profileResult.success && profileResult.data) {
            setUserProfileChirho(profileResult.data);
          } else {
            console.error(`Profile not found for user ${user.uid} after initialization attempt. Error: ${profileResult.error}`);
            toastChirho({ variant: "destructive", title: dictionary?.toastProfileErrorTitle || "Profile Error", description: profileResult.error || dictionary?.toastProfileStillNotFound || "Failed to load your profile after initialization." });
            setUserProfileChirho(null); 
          }
        } catch (error: any) {
          console.error("Error during post-auth user processing:", error);
          toastChirho({ variant: "destructive", title: dictionary?.toastProfileSetupErrorTitle || "Profile Setup Error", description: error.message || dictionary?.toastProfileSetupErrorDescription || "There was an issue setting up your profile." });
          setUserProfileChirho(null);
        }
      } else {
        setCurrentUserChirho(null);
        setUserProfileChirho(null);
      }
      setLoadingAuthChirho(false);
    });
    return () => unsubscribeChirho();
  }, [toastChirho, dictionary]); // dictionary is a dependency if its strings are used in this effect

  const fetchUserProfileChirho = async (userId: string): Promise<UserProfileChirho | null> => {
     const result = await fetchUserProfileFromServerChirho(userId);
     if (result.success && result.data) {
       return result.data;
     } else {
       console.error(`fetchUserProfileChirho (direct call): Error fetching profile for 'users/${userId}':`, result.error);
       toastChirho({ variant: "destructive", title: dictionary?.toastProfileErrorTitle || "Profile Error", description: result.error || dictionary?.toastProfileErrorDescription || "Could not load your profile." });
       return null;
     }
  };

  const logInWithGoogleChirho = async () => {
    try {
      const provider = new GoogleAuthProvider();
      console.log("Attempting Google Sign-In. Firebase App Options for authChirho instance:", authChirho.app.options);
      if (!authChirho.app.options.apiKey || !authChirho.app.options.authDomain || !authChirho.app.options.projectId) {
        console.error("CRITICAL: authChirho instance is missing key configuration for Google Sign-In!", authChirho.app.options);
        toastChirho({ variant: "destructive", title: dictionary?.toastGoogleConfigErrorTitle || "Google Sign-In Config Error", description: dictionary?.toastGoogleConfigErrorDescription || "Internal configuration error for Google Sign-In. Please contact support." });
        return;
      }
      await signInWithPopup(authChirho, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === 'auth/popup-blocked' || 
          (error.message && error.message.toLowerCase().includes('popup was blocked')) ||
          (error.message && error.message.toLowerCase().includes('blocked by the browser'))) {
        toastChirho({
          variant: "destructive",
          title: dictionary?.toastPopupBlockedTitle || "Popup Blocked",
          description: dictionary?.toastPopupBlockedDescription || "Your browser blocked the Google Sign-In popup. Please check your browser settings to allow popups from this site or disable popup blockers and try again.",
          duration: 9000,
        });
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
         toastChirho({
          variant: "default", 
          title: dictionary?.toastSignInCancelledTitle || "Sign-In Cancelled",
          description: dictionary?.toastSignInCancelledDescription || "The Google Sign-In popup was closed before completion.",
          duration: 5000,
        });
      } else if (error.code === 'auth/network-request-failed') {
         toastChirho({ variant: "destructive", title: dictionary?.toastNetworkErrorTitle || "Network Error", description: dictionary?.toastNetworkErrorDescription || "A network error occurred during Google Sign-In. Please check your internet connection." });
      }
      else {
        toastChirho({ variant: "destructive", title: dictionary?.toastLoginFailedTitle || "Login Failed", description: error.message || dictionary?.toastLoginFailedDescriptionGoogle || "Could not sign in with Google." });
      }
    }
  };

  const logInWithEmailChirho = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(authChirho, email, pass);
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastLoginFailedTitle || "Login Failed", description: error.message || dictionary?.toastLoginFailedDescriptionEmail || "Incorrect email or password." });
    }
  };

  const signUpWithEmailChirho = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(authChirho, email, pass);
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastSignupFailedTitle || "Signup Failed", description: error.message || dictionary?.toastSignupFailedDescription || "Could not create account." });
    }
  };

  const logOutChirho = async () => {
    try {
      await firebaseSignOut(authChirho);
      if (routerChirho) {
          routerChirho.push(`/${currentLangChirho}/login-chirho`); 
      }
      toastChirho({ title: dictionary?.toastLoggedOutTitle || "Logged Out", description: dictionary?.toastLoggedOutDescription || "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastLogoutFailedTitle || "Logout Failed", description: error.message });
    }
  };
  
  const updateLocalUserProfileChirho = (profileUpdate: Partial<UserProfileChirho>) => {
    setUserProfileChirho(prev => prev ? { ...prev, ...profileUpdate } : null);
  };

  return (
    <AuthContextChirho.Provider value={{ currentUserChirho, userProfileChirho, loadingAuthChirho, logInWithGoogleChirho, logInWithEmailChirho, signUpWithEmailChirho, logOutChirho, fetchUserProfileChirho, updateLocalUserProfileChirho, routerChirho, currentLangChirho }}>
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
