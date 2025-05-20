// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { authChirho } from '@/lib/firebase-config-chirho';
import { initializeUserChirho as initializeUserActionChirho, fetchUserProfileFromServerChirho } from '@/lib/actions-chirho'; 
import { useRouter } from 'next/navigation';
import { useToastChirho } from '@/hooks/use-toast-chirho';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';


export interface UserProfileChirho {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  credits: number;
  createdAt: any; 
  lastLogin?: any; 
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
  dictionary: DictionaryChirho['authContext'];
}

export const AuthProviderChirho = ({ children, lang, dictionary }: AuthProviderPropsChirho) => {
  const [currentUserChirho, setCurrentUserChirho] = useState<User | null>(null);
  const [userProfileChirho, setUserProfileChirho] = useState<UserProfileChirho | null>(null);
  const [loadingAuthChirho, setLoadingAuthChirho] = useState(true);
  const routerChirho = useRouter();
  const { toastChirho } = useToastChirho();
  const [currentLangChirho, setCurrentLangChirho] = useState(lang);

  useEffect(() => {
    setCurrentLangChirho(lang); 
  }, [lang]);

  useEffect(() => {
    const unsubscribeChirho = onAuthStateChanged(authChirho, async (user) => {
      setLoadingAuthChirho(true);
      if (user) {
        setCurrentUserChirho(user);
        try {
          console.log("[AuthContext] User authenticated, initializing/updating profile:", user.uid);
          const initResult = await initializeUserActionChirho(user.uid, user.email, user.displayName, user.photoURL);
          if (!initResult.success) {
             console.error("[AuthContext] Failed to initialize user on server:", initResult.error);
             toastChirho({ variant: "destructive", title: dictionary.toastProfileSetupErrorTitle, description: initResult.error || dictionary.toastProfileSetupErrorDescription });
          } else {
            console.log("[AuthContext] User profile initialized/updated on server.");
          }
          
          console.log("[AuthContext] Fetching user profile from server:", user.uid);
          const profileResult = await fetchUserProfileFromServerChirho(user.uid);
          if (profileResult.success && profileResult.data) {
            setUserProfileChirho(profileResult.data);
            console.log("[AuthContext] User profile loaded:", profileResult.data);
          } else {
            console.error(`[AuthContext] Profile not found for user ${user.uid} after initialization attempt. Error: ${profileResult.error}`);
            toastChirho({ variant: "destructive", title: dictionary.toastProfileErrorTitle, description: profileResult.error || dictionary.toastProfileStillNotFound });
            setUserProfileChirho(null); 
          }
        } catch (error: any) {
          console.error("[AuthContext] Error during post-auth user processing:", error);
          toastChirho({ variant: "destructive", title: dictionary.toastProfileSetupErrorTitle, description: error.message || dictionary.toastProfileSetupErrorDescription });
          setUserProfileChirho(null);
        }
      } else {
        setCurrentUserChirho(null);
        setUserProfileChirho(null);
        console.log("[AuthContext] No user authenticated.");
      }
      setLoadingAuthChirho(false);
    });
    return () => unsubscribeChirho();
  }, [toastChirho, dictionary, lang]); 

  const fetchUserProfileChirho = async (userId: string): Promise<UserProfileChirho | null> => {
     const result = await fetchUserProfileFromServerChirho(userId);
     if (result.success && result.data) {
       return result.data;
     } else {
       console.error(`[AuthContext] fetchUserProfileChirho (direct call): Error fetching profile for 'users/${userId}':`, result.error);
       toastChirho({ variant: "destructive", title: dictionary.toastProfileErrorTitle, description: result.error || dictionary.toastProfileErrorDescription });
       return null;
     }
  };

  const logInWithGoogleChirho = async () => {
    try {
      const provider = new GoogleAuthProvider();
      console.log("[AuthContext] Attempting Google Sign-In. Firebase App Options for authChirho instance:", authChirho.app.options);
      if (!authChirho.app.options.apiKey || !authChirho.app.options.authDomain || !authChirho.app.options.projectId) {
        console.error("[AuthContext] CRITICAL: authChirho instance is missing key configuration for Google Sign-In!", authChirho.app.options);
        toastChirho({ variant: "destructive", title: dictionary.toastGoogleConfigErrorTitle, description: dictionary.toastGoogleConfigErrorDescription });
        return;
      }
      await signInWithPopup(authChirho, provider);
      // onAuthStateChanged will handle profile loading and redirect
    } catch (error: any) {
      console.error("[AuthContext] Google Sign-In Error:", error);
      if (error.code === 'auth/popup-blocked' || 
          (error.message && error.message.toLowerCase().includes('popup was blocked')) ||
          (error.message && error.message.toLowerCase().includes('blocked by the browser'))) {
        toastChirho({
          variant: "destructive",
          title: dictionary.toastPopupBlockedTitle,
          description: dictionary.toastPopupBlockedDescription,
          duration: 9000,
        });
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
         toastChirho({
          variant: "default", 
          title: dictionary.toastSignInCancelledTitle,
          description: dictionary.toastSignInCancelledDescription,
          duration: 5000,
        });
      } else if (error.code === 'auth/network-request-failed') {
         toastChirho({ variant: "destructive", title: dictionary.toastNetworkErrorTitle, description: dictionary.toastNetworkErrorDescription });
      }
      else {
        toastChirho({ variant: "destructive", title: dictionary.toastLoginFailedTitle, description: error.message || dictionary.toastLoginFailedDescriptionGoogle });
      }
    }
  };

  const logInWithEmailChirho = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(authChirho, email, pass);
      // onAuthStateChanged will handle profile loading and redirect
    } catch (error: any) {
      console.error("[AuthContext] Email Sign-In Error:", error);
      toastChirho({ variant: "destructive", title: dictionary.toastLoginFailedTitle, description: error.message || dictionary.toastLoginFailedDescriptionEmail });
    }
  };

  const signUpWithEmailChirho = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(authChirho, email, pass);
      // onAuthStateChanged will handle profile creation/loading and redirect
    } catch (error: any) {
      console.error("[AuthContext] Email Sign-Up Error:", error);
      toastChirho({ variant: "destructive", title: dictionary.toastSignupFailedTitle, description: error.message || dictionary.toastSignupFailedDescription });
    }
  };

  const logOutChirho = async () => {
    try {
      await firebaseSignOut(authChirho);
      if (routerChirho) {
          // Redirect to the localized login page
          routerChirho.push(`/${currentLangChirho}/login-chirho`); 
      }
      toastChirho({ title: dictionary.toastLoggedOutTitle, description: dictionary.toastLoggedOutDescription });
    } catch (error: any) {
      console.error("[AuthContext] Logout Error:", error);
      toastChirho({ variant: "destructive", title: dictionary.toastLogoutFailedTitle, description: error.message });
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
