// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { authChirho } from '@/lib/firebase-config-chirho';
import { initializeUserChirho as initializeUserActionChirho, fetchUserProfileFromServerChirho } from '@/lib/actions-chirho'; 
import { useRouter } from 'next/navigation';
import { useToastChirho } from '@/hooks/use-toast-chirho';
import type { DictionaryChirho } from '@/lib/get-dictionary-chirho'; // Assuming this type exists
import { getDictionaryChirho } from '@/lib/get-dictionary-chirho'; // For fetching dictionary


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
  fetchUserProfileChirho: (userId: string) => Promise<UserProfileChirho | null>; // Kept for direct use if needed
  updateLocalUserProfileChirho: (profile: Partial<UserProfileChirho>) => void;
  routerChirho: ReturnType<typeof useRouter> | null; // Make router available
  currentLangChirho: string; // To store current language
}

const AuthContextChirho = createContext<AuthContextTypeChirho | undefined>(undefined);

interface AuthProviderPropsChirho {
  children: ReactNode;
  lang: string; // Language passed from [lang]/layout.tsx
}

export const AuthProviderChirho = ({ children, lang }: AuthProviderPropsChirho) => {
  const [currentUserChirho, setCurrentUserChirho] = useState<User | null>(null);
  const [userProfileChirho, setUserProfileChirho] = useState<UserProfileChirho | null>(null);
  const [loadingAuthChirho, setLoadingAuthChirho] = useState(true);
  const routerChirho = useRouter();
  const { toastChirho } = useToastChirho();
  const [currentLangChirho, setCurrentLangChirho] = useState(lang);
  const [dictionary, setDictionary] = useState<DictionaryChirho['authContext'] | null>(null);

  useEffect(() => {
    setCurrentLangChirho(lang); // Update currentLangChirho when lang prop changes
    const fetchDict = async () => {
      const d = await getDictionaryChirho(lang);
      setDictionary(d.authContext);
    };
    fetchDict();
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
          
          const profile = await fetchUserProfileFromServerChirho(user.uid);
          if (profile.success && profile.data) {
            setUserProfileChirho(profile.data);
          } else {
            console.error(`Profile not found for user ${user.uid} after initialization attempt. Error: ${profile.error}`);
            toastChirho({ variant: "destructive", title: dictionary?.toastProfileErrorTitle || "Profile Error", description: profile.error || dictionary?.toastProfileStillNotFound || "Failed to load your profile after initialization." });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionary]); // Add dictionary to dependencies

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
    // setLoadingAuthChirho(true); // onAuthStateChanged will handle this
    try {
      const provider = new GoogleAuthProvider();
      console.log("Attempting Google Sign-In. Firebase App Options for authChirho instance:", authChirho.app.options);
      if (!authChirho.app.options.apiKey || !authChirho.app.options.authDomain || !authChirho.app.options.projectId) {
        console.error("CRITICAL: authChirho instance is missing key configuration for Google Sign-In!", authChirho.app.options);
        toastChirho({ variant: "destructive", title: dictionary?.toastGoogleConfigErrorTitle || "Google Sign-In Config Error", description: dictionary?.toastGoogleConfigErrorDescription || "Internal configuration error for Google Sign-In. Please contact support." });
        // setLoadingAuthChirho(false);
        return;
      }
      await signInWithPopup(authChirho, provider);
      // onAuthStateChanged will handle success and setting loading to false.
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
      // setLoadingAuthChirho(false); // onAuthStateChanged will handle this
    }
  };

  const logInWithEmailChirho = async (email: string, pass: string) => {
    // setLoadingAuthChirho(true);
    try {
      await signInWithEmailAndPassword(authChirho, email, pass);
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastLoginFailedTitle || "Login Failed", description: error.message || dictionary?.toastLoginFailedDescriptionEmail || "Incorrect email or password." });
      // setLoadingAuthChirho(false);
    }
  };

  const signUpWithEmailChirho = async (email: string, pass: string) => {
    // setLoadingAuthChirho(true);
    try {
      await createUserWithEmailAndPassword(authChirho, email, pass);
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastSignupFailedTitle || "Signup Failed", description: error.message || dictionary?.toastSignupFailedDescription || "Could not create account." });
      // setLoadingAuthChirho(false);
    }
  };

  const logOutChirho = async () => {
    // setLoadingAuthChirho(true); 
    try {
      await firebaseSignOut(authChirho);
      if (routerChirho) {
          routerChirho.push(`/${currentLangChirho}/login-chirho`); // Use currentLangChirho
      }
      toastChirho({ title: dictionary?.toastLoggedOutTitle || "Logged Out", description: dictionary?.toastLoggedOutDescription || "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout Error:", error);
      toastChirho({ variant: "destructive", title: dictionary?.toastLogoutFailedTitle || "Logout Failed", description: error.message });
      // setLoadingAuthChirho(false); 
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
