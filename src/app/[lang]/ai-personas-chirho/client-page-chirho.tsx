
// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { useAuthChirho } from '@/contexts/auth-context-chirho';
import {
  generateNewPersonaChirho as generateNewPersonaActionChirho,
  sendMessageToPersonaChirho,
  updatePersonaImageChirho as updatePersonaImageActionChirho,
  fetchSuggestedResponseChirho,
  decrementUserCreditsChirho,
  fetchArchivedConversationsFromFirestoreChirho,
  archiveConversationToFirestoreChirho,
  clearArchivedConversationsFromFirestoreChirho,
  saveActiveConversationToFirestoreChirho,
  fetchActiveConversationFromFirestoreChirho,
  clearActiveConversationFromFirestoreChirho,
  addFreeCreditsChirho as addFreeCreditsActionChirho,
  type ActiveConversationDataChirho
} from "@/lib/actions-chirho";
import type { GenerateAiPersonaOutputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import type { AIPersonaConvincingOutputChirho, AIPersonaConvincingInputChirho } from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import type { UpdatePersonaVisualsInputChirho } from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import type { SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';
import { defaultLocale } from '@/middleware';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2, Info, Lightbulb, XCircle, History, ArrowLeft, Trash2, CreditCard, MessageCircleMore, PartyPopper, Gift, ExternalLink, ArrowUpCircle, ArrowDownCircle } from "lucide-react"; // Added ArrowUpCircle, ArrowDownCircle
import { useToastChirho } from "@/hooks/use-toast-chirho";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils-chirho.ts";
import { useIsMobileChirho } from "@/hooks/use-mobile-chirho";

const DynamicImagePopupDialogChirho = dynamic(() => import('@/components/image-popup-dialog-chirho.tsx').then(mod => mod.ImagePopupDialogChirho), { ssr: false });

export interface MessageChirho {
  sender: "user" | "persona";
  text: string;
  id: string;
  imageUrlChirho?: string | null;
}

export interface ArchivedConversationChirho {
  id: string;
  timestamp: number;
  personaNameChirho: string;
  initialPersonaImageChirho?: string | null;
  meetingContextChirho: string;
  encounterTitleChirho?: string | null;
  personaDetailsChirho: string;
  personaNameKnownToUserChirho: boolean;
  difficultyLevelChirho: number;
  messagesChirho: MessageChirho[];
  convincedChirho: boolean;
  conversationLanguageChirho: string;
  archivedAtServerMillis?: number;
}

const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const FREE_CREDITS_ADD_AMOUNT_CHIRHO = 25;
const FREE_CREDITS_THRESHOLD_CHIRHO = 50;
const ANIMATION_TOTAL_DURATION_CHIRHO = 2250; 


interface AIPersonasClientPagePropsChirho {
  dictionary: DictionaryChirho;
  lang: string;
}

export default function AIPersonasClientPageChirho({ dictionary: fullDictionary, lang }: AIPersonasClientPagePropsChirho) {
  const dictionary = fullDictionary.aiPersonasPage;
  const { currentUserChirho, userProfileChirho, loadingAuthChirho, updateLocalUserProfileChirho, routerChirho, currentLangChirho: authContextLang } = useAuthChirho();
  const isMobileChirho = useIsMobileChirho();

  const [personaChirho, setPersonaChirho] = useState<GenerateAiPersonaOutputChirho | null>(null);
  const [dynamicPersonaImageChirho, setDynamicPersonaImageChirho] = useState<string | null>(null);
  const [messagesChirho, setMessagesChirho] = useState<MessageChirho[]>([]);
  const [userInputChirho, setUserInputChirho] = useState("");
  const [isLoadingPersonaChirho, setIsLoadingPersonaChirho] = useState(false);
  const [isSendingMessageChirho, setIsSendingMessageChirho] = useState(false);
  const [isUpdatingImageChirho, setIsUpdatingImageChirho] = useState(false);
  const [difficultyLevelChirho, setDifficultyLevelChirho] = useState(1);
  const [suggestedAnswerChirho, setSuggestedAnswerChirho] = useState<string | null>(null);
  const [isFetchingSuggestionChirho, setIsFetchingSuggestionChirho] = useState(false);
  const [currentConversationLanguageChirho, setCurrentConversationLanguageChirho] = useState<string>(lang);
  const [isCelebrationModeActiveChirho, setIsCelebrationModeActiveChirho] = useState<boolean>(false);
  const [isInitialLoadAttemptedChirho, setIsInitialLoadAttemptedChirho] = useState<boolean>(false);
  const [animatingMessageIdChirho, setAnimatingMessageIdChirho] = useState<string | null>(null);


  const [archivedConversationsChirho, setArchivedConversationsChirho] = useState<ArchivedConversationChirho[]>([]);
  const [selectedArchivedConversationChirho, setSelectedArchivedConversationChirho] = useState<ArchivedConversationChirho | null>(null);
  const [isHistoryDialogOpenChirho, setIsHistoryDialogOpenChirho] = useState<boolean>(false);
  const [isBuyCreditsDialogOpenChirho, setIsBuyCreditsDialogOpenChirho] = useState<boolean>(false);
  const [isAddingFreeCreditsChirho, setIsAddingFreeCreditsChirho] = useState(false);


  const [imagePopupUrlChirho, setImagePopupUrlChirho] = useState<string | null>(null);
  const [isImagePopupOpenChirho, setIsImagePopupOpenChirho] = useState<boolean>(false);
  const [isLoadingHistoryChirho, setIsLoadingHistoryChirho] = useState(false);

  const [showScrollToTopButtonChirho, setShowScrollToTopButtonChirho] = useState<boolean>(false);
  const [showScrollToBottomButtonChirho, setShowScrollToBottomButtonChirho] = useState<boolean>(false);

  const { toastChirho } = useToastChirho();
  const scrollAreaRefChirho = useRef<HTMLDivElement>(null);
  const archivedChatScrollAreaRefChirho = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated (handled by early returns in JSX now)
  useEffect(() => {
    if (!loadingAuthChirho && !currentUserChirho && routerChirho) {
        const targetLang = authContextLang || lang || defaultLocale;
        console.log("[AIPersonasPage] No user detected after auth load, attempting redirect to login on lang:", targetLang);
        if (routerChirho) routerChirho.push(`/${targetLang}/login-chirho`);
    }
  }, [currentUserChirho, loadingAuthChirho, routerChirho, lang, authContextLang]);

  // Reset state on logout or if user becomes null after initial load
  useEffect(() => {
    if (!loadingAuthChirho && !currentUserChirho && isInitialLoadAttemptedChirho) {
      console.log("[AIPersonasPage] User logged out or no user. Resetting component state.");
      setPersonaChirho(null);
      setMessagesChirho([]);
      setDynamicPersonaImageChirho(null);
      setSuggestedAnswerChirho(null);
      setArchivedConversationsChirho([]); 
      setIsLoadingPersonaChirho(false);
      setIsCelebrationModeActiveChirho(false);
      setCurrentConversationLanguageChirho(lang); 
    }
  }, [currentUserChirho, loadingAuthChirho, lang, isInitialLoadAttemptedChirho]);


  const saveCurrentActiveConversation = useCallback(async (
    currentPersonaToSave: GenerateAiPersonaOutputChirho | null = personaChirho,
    currentMessagesToSave: MessageChirho[] = messagesChirho,
    currentDynamicImgToSave: string | null = dynamicPersonaImageChirho,
    currentDifficultyToSave: number = difficultyLevelChirho,
    currentLangToSave: string = currentConversationLanguageChirho
  ) => {
    if (!currentUserChirho || !currentPersonaToSave) {
      console.log("[AIPersonasPage] Skipping saveCurrentActiveConversation - no user or persona.");
      return;
    }
    const activeData: ActiveConversationDataChirho = {
      personaChirho: currentPersonaToSave,
      messagesChirho: currentMessagesToSave.map(msg => ({ ...msg, imageUrlChirho: msg.imageUrlChirho || null })),
      difficultyLevelChirho: currentDifficultyToSave,
      currentConversationLanguageChirho: currentLangToSave,
      dynamicPersonaImageChirho: currentDynamicImgToSave,
      lastSaved: Date.now(), 
    };
    const result = await saveActiveConversationToFirestoreChirho(currentUserChirho.uid, activeData);
    if (!result.success) {
      toastChirho({
        variant: "destructive",
        title: dictionary.toastActiveSaveErrorTitle,
        description: (dictionary.toastActiveSaveErrorDescription) + (result.error || dictionary.generalUnexpectedError),
      });
    } else {
      console.log("[AIPersonasPage] Active conversation successfully saved to Firestore.");
    }
  }, [currentUserChirho, personaChirho, messagesChirho, dynamicPersonaImageChirho, difficultyLevelChirho, currentConversationLanguageChirho, toastChirho, dictionary]);


  const archiveCurrentConversationChirho = useCallback(async (
    personaToArchive: GenerateAiPersonaOutputChirho,
    messagesToArchive: MessageChirho[],
    convincedStatus: boolean,
    archiveLang: string
  ) => {
    if (currentUserChirho && personaToArchive && messagesToArchive.length > 0) { 
      console.log(`[AIPersonasPage] Archiving conversation with ${personaToArchive.personaNameChirho} (convinced: ${convincedStatus}) in lang ${archiveLang}`);
      const archiveEntry: ArchivedConversationChirho = {
        id: Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(), 
        personaNameChirho: personaToArchive.personaNameChirho,
        initialPersonaImageChirho: personaToArchive.personaImageChirho, 
        meetingContextChirho: personaToArchive.meetingContextChirho,
        encounterTitleChirho: personaToArchive.encounterTitleChirho,
        personaDetailsChirho: personaToArchive.personaDetailsChirho,
        personaNameKnownToUserChirho: personaToArchive.personaNameKnownToUserChirho,
        difficultyLevelChirho: difficultyLevelChirho, 
        messagesChirho: messagesToArchive.map(msg => ({...msg, imageUrlChirho: msg.imageUrlChirho || null })),
        convincedChirho: convincedStatus,
        conversationLanguageChirho: archiveLang,
      };
      const archiveResult = await archiveConversationToFirestoreChirho(currentUserChirho.uid, archiveEntry);
      if (archiveResult.success) {
        
        setArchivedConversationsChirho(prev => [archiveEntry, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
        toastChirho({ title: dictionary.toastConversationArchivedTitle, description: dictionary.toastConversationArchivedDescription });
      } else {
        toastChirho({ variant: "destructive", title: dictionary.toastArchiveErrorTitle, description: archiveResult.error || dictionary.toastArchiveErrorDescription });
      }
    } else {
      console.log("[AIPersonasPage] Skipping archive: No current user, persona, or no messages for archiving.");
    }
  }, [currentUserChirho, difficultyLevelChirho, dictionary, toastChirho]);


  const loadNewPersonaChirho = useCallback(async (
    difficultyToLoadChirho: number,
    convincedStatusOverride?: boolean, 
    conversationToContinue?: ArchivedConversationChirho | null
  ) => {
    if (!currentUserChirho || !userProfileChirho) {
      toastChirho({ variant: "destructive", title: dictionary.toastCreditErrorTitle, description: dictionary.generalUnexpectedError });
      setIsLoadingPersonaChirho(false);
      return;
    }

    setIsLoadingPersonaChirho(true);
    setUserInputChirho("");
    setSuggestedAnswerChirho(null);
    setIsCelebrationModeActiveChirho(false);

    
    const currentPersonaSnapshot = personaChirho ? { ...personaChirho } : null;
    const currentMessagesSnapshot = messagesChirho.length > 0 ? [...messagesChirho] : [];
    const currentConversationLanguageSnapshot = currentConversationLanguageChirho;

    if (currentPersonaSnapshot && currentMessagesSnapshot.length > 0 && (!conversationToContinue || (conversationToContinue && conversationToContinue.id !== (currentPersonaSnapshot.encounterTitleChirho + currentPersonaSnapshot.personaNameChirho)))) {
      await archiveCurrentConversationChirho(currentPersonaSnapshot, currentMessagesSnapshot, convincedStatusOverride ?? false, currentConversationLanguageSnapshot);
    }
    await clearActiveConversationFromFirestoreChirho(currentUserChirho.uid); 

    if (conversationToContinue) {
      console.log("[AIPersonasPage] Continuing conversation with:", conversationToContinue.personaNameChirho);
      const restoredPersona: GenerateAiPersonaOutputChirho = {
        personaNameChirho: conversationToContinue.personaNameChirho,
        personaDetailsChirho: conversationToContinue.personaDetailsChirho,
        meetingContextChirho: conversationToContinue.meetingContextChirho,
        encounterTitleChirho: conversationToContinue.encounterTitleChirho || dictionary.historyArchivedDefaultEncounterTitle,
        personaImageChirho: conversationToContinue.initialPersonaImageChirho || "", 
        personaNameKnownToUserChirho: conversationToContinue.personaNameKnownToUserChirho,
      };
      setPersonaChirho(restoredPersona);
      setCurrentConversationLanguageChirho(conversationToContinue.conversationLanguageChirho);

      const restoredMessages = conversationToContinue.messagesChirho.map(msg => ({ ...msg, imageUrlChirho: msg.imageUrlChirho || null }));
      setMessagesChirho(restoredMessages);

      let lastImageUrl: string | null = null;
      if (restoredMessages.length > 0) {
          const lastMsgWithImage = [...restoredMessages].reverse().find(msg => msg.sender === 'persona' && msg.imageUrlChirho);
          lastImageUrl = lastMsgWithImage?.imageUrlChirho || conversationToContinue.initialPersonaImageChirho || null;
      } else {
        lastImageUrl = conversationToContinue.initialPersonaImageChirho || null;
      }
      setDynamicPersonaImageChirho(lastImageUrl);
      setDifficultyLevelChirho(conversationToContinue.difficultyLevelChirho);

      setIsHistoryDialogOpenChirho(false); 
      setSelectedArchivedConversationChirho(null);

      await saveCurrentActiveConversation(restoredPersona, restoredMessages, lastImageUrl, conversationToContinue.difficultyLevelChirho, conversationToContinue.conversationLanguageChirho);
      setIsLoadingPersonaChirho(false);
      toastChirho({
        title: dictionary.toastConversationContinuedTitle,
        description: (dictionary.toastConversationContinuedDescription).replace(
          "{nameOrTitle}",
          conversationToContinue.personaNameKnownToUserChirho ? conversationToContinue.personaNameChirho : (conversationToContinue.encounterTitleChirho || dictionary.historyArchivedDefaultEncounterTitle)
        ),
        duration: 5000,
      });
      return;
    }

    
    const newPersonaLang = lang; 
    console.log("[AIPersonasPage] Loading NEW persona, difficulty:", difficultyToLoadChirho, "in language:", newPersonaLang);
    setCurrentConversationLanguageChirho(newPersonaLang);
    setMessagesChirho([]); 
    setDynamicPersonaImageChirho(null);
    setPersonaChirho(null); 

    if (userProfileChirho.credits <= 0) {
      toastChirho({ variant: "destructive", title: dictionary.toastOutOfCreditsTitle, description: dictionary.toastOutOfCreditsNewPersona });
      setIsLoadingPersonaChirho(false);
      setIsBuyCreditsDialogOpenChirho(true);
      return;
    }

    try {
      const personaThemeDescriptionChirho = `A person at difficulty level ${difficultyToLoadChirho}. Their story should be unique.`;
      const genResult = await generateNewPersonaActionChirho({ personaDescriptionChirho: personaThemeDescriptionChirho, languageChirho: newPersonaLang }, currentUserChirho.uid);

      if (genResult.success && genResult.data) {
        const newPersona = genResult.data;
        const creditDecrementResult = await decrementUserCreditsChirho(currentUserChirho.uid);

        if (!creditDecrementResult.success) {
          toastChirho({ variant: "destructive", title: dictionary.toastCreditErrorTitle, description: creditDecrementResult.error || dictionary.toastCreditErrorNewPersona });
          setIsLoadingPersonaChirho(false);
          if (creditDecrementResult.error === "Insufficient credits.") setIsBuyCreditsDialogOpenChirho(true);
          return;
        }
        if (creditDecrementResult.newCredits !== undefined) {
          updateLocalUserProfileChirho({ credits: creditDecrementResult.newCredits });
        }

        setPersonaChirho(newPersona);
        setDynamicPersonaImageChirho(newPersona.personaImageChirho);
        const initialMessageTextChirho = newPersona.meetingContextChirho
          ? (dictionary.initialMeetingMessage).replace("{context}", newPersona.meetingContextChirho)
          : "Hello! I'm ready to talk.";

        const initialMessages: MessageChirho[] = [{
          sender: "persona",
          text: initialMessageTextChirho,
          id: Date.now().toString(),
          imageUrlChirho: newPersona.personaImageChirho
        }];
        setMessagesChirho(initialMessages);

        
        await saveCurrentActiveConversation(newPersona, initialMessages, newPersona.personaImageChirho, difficultyToLoadChirho, newPersonaLang);

      } else {
        toastChirho({ variant: "destructive", title: dictionary.errorGeneratingPersonaTitle, description: genResult.error || dictionary.errorGeneratingPersonaDescription });
      }
    } catch (errorChirho: any) {
      toastChirho({ variant: "destructive", title: dictionary.generalErrorTitle, description: errorChirho.message || dictionary.generalUnexpectedError });
    }
    setIsLoadingPersonaChirho(false);
  }, [toastChirho, currentUserChirho, userProfileChirho, dictionary, lang, archiveCurrentConversationChirho, updateLocalUserProfileChirho, saveCurrentActiveConversation, messagesChirho, personaChirho, currentConversationLanguageChirho]);

  // Initial data load (active session or new persona) and history fetching
  useEffect(() => {
    if (!loadingAuthChirho && currentUserChirho && !isInitialLoadAttemptedChirho) {
      setIsInitialLoadAttemptedChirho(true);

      const initialLoad = async () => {
        console.log("[AIPersonasPage] Attempting initial load for user:", currentUserChirho.uid);
        setIsLoadingPersonaChirho(true);

        
        setIsLoadingHistoryChirho(true);
        fetchArchivedConversationsFromFirestoreChirho(currentUserChirho.uid)
          .then(result => {
            if (result.success && result.data) {
              setArchivedConversationsChirho(result.data);
            } else {
              console.error("[AIPersonasPage] Failed to fetch history from Firestore:", result.error);
              toastChirho({ variant: "destructive", title: dictionary.toastHistoryLoadFailedTitle, description: result.error || dictionary.toastHistoryLoadFailedDescription });
            }
          }).finally(() => setIsLoadingHistoryChirho(false));

        
        const activeConvResult = await fetchActiveConversationFromFirestoreChirho(currentUserChirho.uid);
        if (activeConvResult.success && activeConvResult.data) {
          console.log("[AIPersonasPage] Active conversation found, restoring state.");
          const activeData = activeConvResult.data;
          setPersonaChirho(activeData.personaChirho);
          setMessagesChirho(activeData.messagesChirho.map(msg => ({...msg, imageUrlChirho: msg.imageUrlChirho || null })));
          setDynamicPersonaImageChirho(activeData.dynamicPersonaImageChirho);
          setDifficultyLevelChirho(activeData.difficultyLevelChirho);
          setCurrentConversationLanguageChirho(activeData.currentConversationLanguageChirho);
          toastChirho({ title: dictionary.toastConversationContinuedTitle, description: (dictionary.toastConversationContinuedDescription).replace("{nameOrTitle}", activeData.personaChirho.personaNameKnownToUserChirho ? activeData.personaChirho.personaNameChirho : (activeData.personaChirho.encounterTitleChirho || dictionary.aNewEncounterTitle)) });
        } else {
          console.log("[AIPersonasPage] No active conversation, loading new persona. Error (if any):", activeConvResult.error);
          await loadNewPersonaChirho(difficultyLevelChirho, false, null); 
        }
        setIsLoadingPersonaChirho(false);
      };
      initialLoad();
    }
  }, [currentUserChirho, loadingAuthChirho, isInitialLoadAttemptedChirho, loadNewPersonaChirho, toastChirho, dictionary, difficultyLevelChirho]);


  // Scroll chat to bottom
  useEffect(() => {
    if (scrollAreaRefChirho.current) {
      const viewport = scrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [messagesChirho.length, suggestedAnswerChirho]);

  // Scroll archived chat to bottom
  useEffect(() => {
    if (selectedArchivedConversationChirho && archivedChatScrollAreaRefChirho.current) {
      const viewport = archivedChatScrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  }, [selectedArchivedConversationChirho]);

   // Scroll event listener for mobile scroll buttons
  useEffect(() => {
    if (!isMobileChirho || !scrollAreaRefChirho.current) {
      setShowScrollToTopButtonChirho(false);
      setShowScrollToBottomButtonChirho(false);
      return;
    }

    const viewport = scrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) {
        console.warn("[AIPersonasPage] Scroll viewport not found for mobile scroll buttons.");
        return;
    }
    // console.log("[AIPersonasPage] Setting up scroll listener for mobile buttons.");

    const handleScroll = () => {
      // console.log('Scroll event:', viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight); 
      setShowScrollToTopButtonChirho(viewport.scrollTop > 200);
      setShowScrollToBottomButtonChirho(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 200);
    };

    viewport.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
        // console.log("[AIPersonasPage] Cleaning up scroll listener for mobile buttons.");
        if (viewport) { // Check if viewport still exists before removing listener
            viewport.removeEventListener('scroll', handleScroll);
        }
    }
  }, [isMobileChirho, messagesChirho.length]); // Re-evaluate on messages.length if scrollHeight might change


  const handleSendMessageChirho = async () => {
    if (!userInputChirho.trim() || !personaChirho || !currentUserChirho || !userProfileChirho) return;

    let currentDynamicImageForResponse = dynamicPersonaImageChirho || personaChirho.personaImageChirho;
    if (!currentDynamicImageForResponse) {
      currentDynamicImageForResponse = personaChirho.personaImageChirho;
    }

    if (userProfileChirho.credits <= 0) {
      toastChirho({ variant: "destructive", title: dictionary.toastOutOfCreditsTitle, description: dictionary.toastOutOfCreditsDescription });
      setIsBuyCreditsDialogOpenChirho(true);
      return;
    }

    const newUserMessageChirho: MessageChirho = { sender: "user", text: userInputChirho, id: Date.now().toString() };
    const updatedMessagesWithUser = [...messagesChirho, newUserMessageChirho];
    setMessagesChirho(updatedMessagesWithUser);

    const currentInputChirho = userInputChirho;
    setUserInputChirho("");
    setSuggestedAnswerChirho(null);
    setIsSendingMessageChirho(true);

    const convincingInputChirho: AIPersonaConvincingInputChirho = {
      difficultyLevelChirho: difficultyLevelChirho,
      personaDescriptionChirho: `${personaChirho.personaNameChirho}: ${personaChirho.personaDetailsChirho}`,
      messageChirho: currentInputChirho,
      languageChirho: currentConversationLanguageChirho,
    };

    let aiResponseData: AIPersonaConvincingOutputChirho | null = null;
    let imageForPersonaMessage = currentDynamicImageForResponse; 

    try {
      
      const resultChirho = await sendMessageToPersonaChirho(convincingInputChirho);

      if (resultChirho.success && resultChirho.data) {
        aiResponseData = resultChirho.data;
        console.log("AI response language: ", aiResponseData.outputLanguageChirho, " | Requested language: ", currentConversationLanguageChirho);

        
        const creditDecrementResult = await decrementUserCreditsChirho(currentUserChirho.uid);
        if (!creditDecrementResult.success) {
          toastChirho({ variant: "destructive", title: dictionary.toastCreditErrorTitle, description: creditDecrementResult.error || dictionary.toastCreditErrorDescription });
          if (creditDecrementResult.error === "Insufficient credits.") {
            setIsBuyCreditsDialogOpenChirho(true);
            
          }
        }
        if (creditDecrementResult.newCredits !== undefined) {
          updateLocalUserProfileChirho({ credits: creditDecrementResult.newCredits });
        }

        
        if (aiResponseData.visualContextForNextImageChirho && currentDynamicImageForResponse && personaChirho) {
          console.log("Attempting to update persona image with visual context:", aiResponseData.visualContextForNextImageChirho);
          setIsUpdatingImageChirho(true);
          const imageUpdateInputChirho: UpdatePersonaVisualsInputChirho = {
            baseImageUriChirho: currentDynamicImageForResponse, 
            personaNameChirho: personaChirho.personaNameChirho,
            originalMeetingContextChirho: personaChirho.meetingContextChirho,
            newVisualPromptChirho: aiResponseData.visualContextForNextImageChirho,
          };
          const imageResultChirho = await updatePersonaImageActionChirho(imageUpdateInputChirho, currentUserChirho.uid);
          if (imageResultChirho.success && imageResultChirho.data?.updatedImageUriChirho) {
            setDynamicPersonaImageChirho(imageResultChirho.data.updatedImageUriChirho);
            imageForPersonaMessage = imageResultChirho.data.updatedImageUriChirho; 
          } else {
            toastChirho({ variant: "destructive", title: dictionary.errorUpdatingImageTitle, description: imageResultChirho.error || dictionary.errorUpdatingImageDescription });
            
          }
          setIsUpdatingImageChirho(false);
        }

        
        const newPersonaMessageChirho: MessageChirho = {
          sender: "persona",
          text: aiResponseData.personaResponseChirho,
          id: (Date.now() + 1).toString(),
          imageUrlChirho: imageForPersonaMessage 
        };

        const finalMessagesForSave = [...updatedMessagesWithUser, newPersonaMessageChirho];
        setMessagesChirho(finalMessagesForSave);
        setAnimatingMessageIdChirho(newPersonaMessageChirho.id);
        setTimeout(() => setAnimatingMessageIdChirho(null), ANIMATION_TOTAL_DURATION_CHIRHO);

        
        if(personaChirho) { 
          await saveCurrentActiveConversation(personaChirho, finalMessagesForSave, imageForPersonaMessage, difficultyLevelChirho, currentConversationLanguageChirho);
        }

        
        if (aiResponseData.convincedChirho && personaChirho) {
          toastChirho({
            title: dictionary.personaConvincedToastTitle,
            description: (dictionary.personaConvincedToastDescription).replace(
              "{nameOrTitle}",
              personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || dictionary.aNewEncounterTitle)
            ),
            duration: 7000,
          });
          await archiveCurrentConversationChirho(personaChirho, finalMessagesForSave, true, currentConversationLanguageChirho);
          await clearActiveConversationFromFirestoreChirho(currentUserChirho.uid);
          setIsCelebrationModeActiveChirho(true); 
        }
      } else {
        
        toastChirho({ variant: "destructive", title: dictionary.errorSendingMessageTitle, description: resultChirho.error || dictionary.errorSendingMessageDescription });
        
        setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
      }
    } catch (errorChirho: any) {
      toastChirho({ variant: "destructive", title: dictionary.generalErrorTitle, description: errorChirho.message || dictionary.generalUnexpectedError });
      
      setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
    }
    setIsSendingMessageChirho(false);
  };


  const handleSuggestAnswerChirho = async () => {
    if (!personaChirho || messagesChirho.length === 0 || !currentUserChirho || !userProfileChirho) return;

    const lastPersonaMessageChirho = messagesChirho.filter(mChirho => mChirho.sender === 'persona').pop();
    if (!lastPersonaMessageChirho) {
      toastChirho({ variant: "destructive", title: dictionary.toastCannotSuggestTitle, description: dictionary.toastCannotSuggestNoMessage });
      return;
    }
    if (!lastPersonaMessageChirho.text?.trim()) {
      toastChirho({ variant: "destructive", title: dictionary.toastCannotSuggestTitle, description: dictionary.toastCannotSuggestEmptyMessage });
      return;
    }
    if (!personaChirho.personaNameChirho || personaChirho.personaNameChirho.trim() === "") {
      toastChirho({ variant: "destructive", title: dictionary.toastCannotSuggestTitle, description: dictionary.toastCannotSuggestNoPersonaName});
      return;
    }


    const actualPersonaName = (personaChirho.personaNameChirho && personaChirho.personaNameChirho.trim() !== "")
                              ? personaChirho.personaNameChirho
                              : "Character"; 

    const displayNameForSuggestion = personaChirho.personaNameKnownToUserChirho ? actualPersonaName : (personaChirho.encounterTitleChirho || dictionary.thePerson);

    setIsFetchingSuggestionChirho(true);
    setSuggestedAnswerChirho(null);

    const conversationHistorySummary = messagesChirho
        .slice(-5) 
        .map(m => `${m.sender === 'user' ? (userProfileChirho.displayName || 'User') : displayNameForSuggestion}: ${m.text}`)
        .join('\n');

    const suggestionInputChirho: SuggestEvangelisticResponseInputChirho = {
      personaLastResponseChirho: lastPersonaMessageChirho.text,
      personaActualNameForContextChirho: actualPersonaName,
      personaDisplayNameForUserChirho: displayNameForSuggestion,
      conversationHistoryChirho: conversationHistorySummary,
      languageChirho: currentConversationLanguageChirho,
    };

    console.log("Requesting suggestion with input:", suggestionInputChirho);

    try {
      const resultChirho = await fetchSuggestedResponseChirho(suggestionInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setSuggestedAnswerChirho((resultChirho.data as SuggestEvangelisticResponseOutputChirho).suggestedResponseChirho);
      } else {
        toastChirho({ variant: "destructive", title: dictionary.toastSuggestionFailedTitle, description: resultChirho.error || dictionary.toastSuggestionFailedDescription });
      }
    } catch (errorChirho: any) {
      console.error("Error fetching suggested response:", errorChirho);
      toastChirho({ variant: "destructive", title: dictionary.toastSuggestionErrorTitle, description: errorChirho.message || dictionary.toastSuggestionErrorDescription });
    }
    setIsFetchingSuggestionChirho(false);
  };

  const handleStartNextConversationChirho = async () => {
    if (!currentUserChirho) return;
    const newDifficulty = Math.min(difficultyLevelChirho + 1, 10); 
    await loadNewPersonaChirho(newDifficulty, false, null);
  };

  const handleClearHistoryChirho = async () => {
    if (!currentUserChirho) {
      toastChirho({ variant: "destructive", title: dictionary.generalErrorTitle, description: dictionary.generalUnexpectedError });
      return;
    }
    setIsLoadingHistoryChirho(true);
    const result = await clearArchivedConversationsFromFirestoreChirho(currentUserChirho.uid);
    if (result.success) {
      setArchivedConversationsChirho([]);
      toastChirho({ title: dictionary.toastHistoryClearedTitle, description: dictionary.toastHistoryClearedDescription });
    } else {
      toastChirho({ variant: "destructive", title: dictionary.toastClearHistoryErrorTitle, description: result.error || dictionary.toastClearHistoryErrorDescription });
    }
    setIsLoadingHistoryChirho(false);
  };


  const handleAddFreeCreditsChirho = async () => {
    if (!currentUserChirho || !userProfileChirho) return;
    if (userProfileChirho.credits >= FREE_CREDITS_THRESHOLD_CHIRHO) {
      toastChirho({ variant: "default", title: dictionary.creditsDialog?.title || "Credits Info", description: dictionary.creditsDialog?.addFreeCreditsInfo || `Free credits are available when your balance is below ${FREE_CREDITS_THRESHOLD_CHIRHO}.` });
      return;
    }
    setIsAddingFreeCreditsChirho(true);
    const result = await addFreeCreditsActionChirho(currentUserChirho.uid);
    if (result.success && result.newCredits !== undefined) {
      updateLocalUserProfileChirho({ credits: result.newCredits });
      toastChirho({ title: dictionary.creditsDialog?.toastFreeCreditsAddedTitle || "Free Credits Added!", description: (dictionary.creditsDialog?.toastFreeCreditsAddedDescription || `Added ${FREE_CREDITS_ADD_AMOUNT_CHIRHO} free credits.`).replace('{amount}', FREE_CREDITS_ADD_AMOUNT_CHIRHO.toString()) });
    } else {
      toastChirho({ variant: "destructive", title: dictionary.creditsDialog?.toastErrorAddingFreeCreditsTitle || "Error", description: result.error || dictionary.creditsDialog?.toastErrorAddingFreeCreditsDescription || "Could not add free credits." });
    }
    setIsAddingFreeCreditsChirho(false);
  };


  const handleImagePopupChirho = (imageUrl: string | null | undefined) => {
    if (imageUrl) {
      setImagePopupUrlChirho(imageUrl);
      setIsImagePopupOpenChirho(true);
    }
  };

  
  if (loadingAuthChirho) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  
  if (!currentUserChirho) {
    return <div className="flex items-center justify-center h-full"><p>{dictionary.redirectingToLogin}</p><Loader2 className="h-8 w-8 animate-spin text-primary ml-2" /></div>;
  }

  
  if (!userProfileChirho) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{dictionary.loadingUserProfile}</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
      </div>
    );
  }

  const personaDisplayNameForCard = isCelebrationModeActiveChirho
    ? (dictionary.personaConvincedCelebrationMessage).replace("{nameOrTitle}", personaChirho?.personaNameKnownToUserChirho ? (personaChirho?.personaNameChirho || "") : (personaChirho?.encounterTitleChirho || dictionary.thePerson))
    : isLoadingPersonaChirho && !personaChirho
      ? (dictionary.generatingPersonaMessage)
      : personaChirho
        ? (personaChirho.personaNameKnownToUserChirho ? (dictionary.personaCardTitleKnown).replace("{name}", personaChirho.personaNameChirho) : (personaChirho.encounterTitleChirho || dictionary.aNewEncounterTitle))
        : (dictionary.errorGeneratingPersonaTitle); 

  const chatWithNameForHeader = personaChirho
    ? (personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? (dictionary.chatWithTitleKnown).replace("{name}", personaChirho.personaNameChirho) : (personaChirho.encounterTitleChirho || dictionary.thePerson))
    : dictionary.personaCardTitleLoading;
  const messagePlaceholderName = personaChirho
    ? (personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? (dictionary.messagePlaceholderKnown).replace("{name}", personaChirho.personaNameChirho) : (dictionary.messagePlaceholderUnknown).replace("{title}", personaChirho.encounterTitleChirho || dictionary.thePerson))
    : dictionary.messagePlaceholderLoading;
  const noCreditsChirho = userProfileChirho.credits <= 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <Card className="lg:w-1/3 flex-shrink-0 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] max-h-[calc(100vh-var(--header-height)-3rem)] overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {personaDisplayNameForCard}
             <div className="flex gap-2">
              <Dialog open={isHistoryDialogOpenChirho} onOpenChange={(open) => {
                setIsHistoryDialogOpenChirho(open);
                if (!open) setSelectedArchivedConversationChirho(null); 
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title={dictionary.historyButtonTitle} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || isCelebrationModeActiveChirho}>
                    <History className="h-4 w-4" />
                    <span className="sr-only">{dictionary.historyButtonTitle}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedArchivedConversationChirho ? (dictionary.historyDialogTitleSelected).replace("{nameOrTitle}", selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : (selectedArchivedConversationChirho.encounterTitleChirho || dictionary.historyArchivedDefaultEncounterTitle)) : dictionary.historyDialogTitle}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedArchivedConversationChirho ? (dictionary.historyDialogDescriptionSelected).replace("{date}", new Date(selectedArchivedConversationChirho.timestamp).toLocaleString()) : dictionary.historyDialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  {!selectedArchivedConversationChirho ? (
                    <>
                      <ScrollArea className="flex-grow mt-4 min-h-0">
                        {isLoadingHistoryChirho ? (
                           <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : archivedConversationsChirho.length > 0 ? (
                          <div className="space-y-2">
                            {archivedConversationsChirho.map(chatChirho => (
                              <Button
                                key={chatChirho.id}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setSelectedArchivedConversationChirho(chatChirho)}
                              >
                                {(chatChirho.personaNameKnownToUserChirho ? chatChirho.personaNameChirho : (chatChirho.encounterTitleChirho || dictionary.historyArchivedDefaultEncounterTitle))} - {new Date(chatChirho.timestamp).toLocaleDateString()} ({chatChirho.convincedChirho ? dictionary.historyArchivedPersonaConvinced : dictionary.historyArchivedPersonaNotConvinced})
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">{dictionary.historyListEmpty}</p>
                        )}
                      </ScrollArea>
                      {archivedConversationsChirho.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full" disabled={isLoadingHistoryChirho}>
                                {isLoadingHistoryChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                {dictionary.historyClearAllButton}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{dictionary.historyClearConfirmTitle}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {dictionary.historyClearConfirmDescription}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{dictionary.general?.cancel || "Cancel"}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearHistoryChirho}>
                                  {dictionary.historyClearConfirmAction}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col overflow-hidden">
                      <Button onClick={() => setSelectedArchivedConversationChirho(null)} variant="outline" size="sm" className="mb-2 self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {dictionary.historyBackButton}
                      </Button>
                      <Card className="mb-2 p-3">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80" onClick={() => handleImagePopupChirho(selectedArchivedConversationChirho.initialPersonaImageChirho)} title={dictionary.historyArchivedPersonaAvatarTitle}>
                              {selectedArchivedConversationChirho.initialPersonaImageChirho ? (
                                <AvatarImage src={selectedArchivedConversationChirho.initialPersonaImageChirho} alt={dictionary.historyArchivedPersonaAvatarAlt} />
                              ) : null }
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {selectedArchivedConversationChirho.personaNameChirho ? selectedArchivedConversationChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-7 w-7" />}
                              </AvatarFallback>
                            </Avatar>
                          <div>
                            <p className="font-semibold">{(selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : (selectedArchivedConversationChirho.encounterTitleChirho || dictionary.historyArchivedDefaultEncounterTitle))}</p>
                            <p className="text-xs text-muted-foreground">{selectedArchivedConversationChirho.meetingContextChirho}</p>
                            <p className="text-xs text-muted-foreground">{dictionary.difficultyLevel.replace('{level}',selectedArchivedConversationChirho.difficultyLevelChirho.toString())} - {selectedArchivedConversationChirho.convincedChirho ? dictionary.historyArchivedPersonaConvinced : dictionary.historyArchivedPersonaNotConvinced}</p>
                          </div>
                        </div>
                      </Card>
                      <ScrollArea className="flex-grow border rounded-md p-4 min-h-0" ref={archivedChatScrollAreaRefChirho}>
                        <div className="space-y-4">
                          {selectedArchivedConversationChirho.messagesChirho.map(msgChirho => (
                            <div
                              key={msgChirho.id}
                              className={`flex items-end gap-2 ${msgChirho.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msgChirho.sender === "persona" && (
                                 <Avatar
                                    className={`h-12 w-12 ${msgChirho.imageUrlChirho ? "cursor-pointer hover:opacity-80" : ""}`}
                                    onClick={() => handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                    title={msgChirho.imageUrlChirho ? dictionary.viewMessageImageTitle : ""}
                                 >
                                    {msgChirho.imageUrlChirho ? (
                                        <AvatarImage src={msgChirho.imageUrlChirho} alt={dictionary.personaAvatarAlt} />
                                    ) : (selectedArchivedConversationChirho.initialPersonaImageChirho ? <AvatarImage src={selectedArchivedConversationChirho.initialPersonaImageChirho} alt={dictionary.personaInitialAvatarAlt} /> : null)}
                                    <AvatarFallback className="bg-accent text-accent-foreground">
                                      {!(msgChirho.imageUrlChirho || selectedArchivedConversationChirho.initialPersonaImageChirho) && (selectedArchivedConversationChirho.personaNameChirho ? selectedArchivedConversationChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-7 w-7"/>)}
                                    </AvatarFallback>
                                </Avatar>
                              )}
                               <div
                                className={`max-w-[70%] rounded-lg p-3 shadow ${
                                  msgChirho.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                                } ${msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : ""}`}
                                onClick={() => msgChirho.sender === "persona" && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? dictionary.viewMessageImageTitle : ""}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                              </div>
                              {msgChirho.sender === "user" && (
                                <Avatar className="h-12 w-12">
                                   {currentUserChirho?.photoURL ? (
                                    <AvatarImage src={currentUserChirho.photoURL} alt={userProfileChirho?.displayName || "User"} />
                                  ) : null}
                                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                                      <User className="h-7 w-7" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <DialogFooter className="mt-4">
                        <Button
                            variant="default"
                            onClick={() => {
                                if (selectedArchivedConversationChirho) {
                                    setIsHistoryDialogOpenChirho(false); 
                                    loadNewPersonaChirho(selectedArchivedConversationChirho.difficultyLevelChirho, false, selectedArchivedConversationChirho);
                                }
                            }}
                            disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isCelebrationModeActiveChirho}
                        >
                            {dictionary.historyContinueButton}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">{dictionary.historyCloseButton}</Button>
                        </DialogClose>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="icon" onClick={() => loadNewPersonaChirho(difficultyLevelChirho, false, null)} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || isCelebrationModeActiveChirho} title={dictionary.newPersonaButtonTitle}>
                {isLoadingPersonaChirho && !personaChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="sr-only">{dictionary.newPersonaButtonTitle}</span>
              </Button>
            </div>
          </CardTitle>
          {!(isLoadingPersonaChirho && !personaChirho) && !isCelebrationModeActiveChirho && personaChirho && (
            <CardDescription>{dictionary.difficultyLevel.replace("{level}", difficultyLevelChirho.toString())}</CardDescription>
          )}
        </CardHeader>
        <CardContent className={isCelebrationModeActiveChirho ? "flex flex-col items-center justify-center h-full" : ""}>
          {isCelebrationModeActiveChirho ? (
             <div className="text-center space-y-4 p-4">
                <PartyPopper className="h-16 w-16 text-accent mx-auto" />
                <h2 className="text-2xl font-semibold">{personaDisplayNameForCard}</h2>
                <Button onClick={handleStartNextConversationChirho} size="lg">
                  {dictionary.startNextConversationButton}
                </Button>
              </div>
          ) : isLoadingPersonaChirho && !personaChirho ? (
            <div className="text-center space-y-2 p-4">
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <p className="text-lg font-semibold">{dictionary.generatingPersonaMessage}</p>
              <p className="text-sm text-muted-foreground">{dictionary.generatingPersonaDescription}</p>
            </div>
          ) : personaChirho ? (
            <>
              <div
                className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-80"
                onClick={() => handleImagePopupChirho(dynamicPersonaImageChirho || personaChirho.personaImageChirho)}
                title={dictionary.enlargeImageTitle}
              >
                {(dynamicPersonaImageChirho || personaChirho.personaImageChirho) && (
                  <Image
                    src={dynamicPersonaImageChirho || personaChirho.personaImageChirho!}
                    alt={(dictionary.personaImageAlt).replace("{nameOrTitle}", personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || dictionary.aNewEncounterTitle))}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint="portrait person"
                    key={dynamicPersonaImageChirho || personaChirho.personaImageChirho} 
                    priority={true}
                    unoptimized={false} 
                  />
                )}
                {isUpdatingImageChirho && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {dictionary.meetingContextTitle}
                </h3>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border">
                  {personaChirho.meetingContextChirho}
                </p>
              </div>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>{dictionary.errorGeneratingPersonaTitle}</AlertTitle>
              <AlertDescription>{dictionary.errorGeneratingPersonaDescription}</AlertDescription>
            </Alert>
          )}
        </CardContent>
         {!isCelebrationModeActiveChirho && (
            <CardFooter className="border-t pt-4">
                <Dialog open={isBuyCreditsDialogOpenChirho} onOpenChange={setIsBuyCreditsDialogOpenChirho}>
                    <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho}>
                        <CreditCard className="mr-2 h-4 w-4" /> {dictionary.creditsDialog?.getMoreCreditsButton}
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dictionary.creditsDialog?.title}</DialogTitle>
                        <DialogDescription>
                        {dictionary.creditsDialog?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Card className="p-4 hover:shadow-lg transition-shadow">
                          <CardTitle className="text-lg">{dictionary.creditsDialog?.donationTitle}</CardTitle>
                          <CardDescription>{dictionary.creditsDialog?.donationDescription}</CardDescription>
                          <Button asChild className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white">
                            <a href="https://paypal.me/brianloveJesus" target="_blank" rel="noopener noreferrer">
                                {dictionary.creditsDialog?.donationButtonLabel} <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </Card>
                        {userProfileChirho && (
                           <Card className="p-4 hover:shadow-lg transition-shadow">
                             <CardTitle className="text-lg">{dictionary.creditsDialog?.addFreeCreditsButtonLabel}</CardTitle>
                             <Button
                                className="mt-2 w-full"
                                onClick={handleAddFreeCreditsChirho}
                                disabled={isAddingFreeCreditsChirho || userProfileChirho.credits >= FREE_CREDITS_THRESHOLD_CHIRHO}
                             >
                               {isAddingFreeCreditsChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                               {dictionary.creditsDialog?.addFreeCreditsButtonLabel}
                             </Button>
                              {userProfileChirho.credits >= FREE_CREDITS_THRESHOLD_CHIRHO && (
                                <CardDescription className="mt-2 text-xs text-muted-foreground">
                                  {dictionary.creditsDialog?.addFreeCreditsInfo}
                                </CardDescription>
                              )}
                           </Card>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">{dictionary.creditsDialog?.closeButton}</Button>
                        </DialogClose>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
         )}
      </Card>

      <Card className="flex-grow flex flex-col shadow-xl max-h-full lg:max-h-[calc(100vh-var(--header-height)-3rem)] relative">
        <CardHeader>
          <CardTitle>{chatWithNameForHeader}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MessageCircleMore className="h-4 w-4 text-primary" />
            {dictionary.creditsRemaining.replace("{count}", (userProfileChirho?.credits ?? 0).toString())}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-grow p-6 min-h-0" ref={scrollAreaRefChirho}>
            <div className="space-y-4">
              {messagesChirho.map((msgChirho) => (
                <div
                  key={msgChirho.id}
                  className={`flex items-end gap-2 ${
                    msgChirho.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msgChirho.sender === "persona" && (
                    <Avatar
                        className={cn(
                            'h-12 w-12', 
                            msgChirho.imageUrlChirho ? 'cursor-pointer hover:opacity-80' : '',
                            msgChirho.id === animatingMessageIdChirho ? 'avatar-entrance-chirho' : ''
                        )}
                        onClick={() => handleImagePopupChirho(msgChirho.imageUrlChirho)}
                        title={msgChirho.imageUrlChirho ? dictionary.viewMessageImageTitle : ""}
                    >
                      {msgChirho.imageUrlChirho ? (
                        <AvatarImage src={msgChirho.imageUrlChirho} alt={dictionary.personaAvatarAlt} />
                      ) : (personaChirho?.personaImageChirho ? <AvatarImage src={personaChirho.personaImageChirho} alt={dictionary.personaInitialAvatarAlt} /> : null )}
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {!(msgChirho.imageUrlChirho || personaChirho?.personaImageChirho) && (personaChirho?.personaNameChirho ? personaChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-7 w-7"/>)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                        'max-w-[70%] rounded-lg p-3 shadow',
                        msgChirho.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border",
                        msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : "",
                        msgChirho.id === animatingMessageIdChirho && msgChirho.sender === "persona" ? 'text-bubble-entrance-chirho' : ''
                    )}
                     onClick={() => msgChirho.sender === "persona" && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                     title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? dictionary.viewMessageImageTitle : ""}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                  </div>
                  {msgChirho.sender === "user" && (
                     <Avatar className="h-12 w-12"> 
                       {currentUserChirho?.photoURL ? (
                        <AvatarImage src={currentUserChirho.photoURL} alt={userProfileChirho?.displayName || "User"} />
                       ) : null}
                       <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User className="h-7 w-7" /> 
                       </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {(isSendingMessageChirho || isUpdatingImageChirho) && messagesChirho[messagesChirho.length-1]?.sender === 'user' && !isCelebrationModeActiveChirho && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-12 w-12"> 
                       {dynamicPersonaImageChirho ? (
                         <AvatarImage src={dynamicPersonaImageChirho} alt={dictionary.personaAvatarAlt} />
                       ) : (personaChirho?.personaImageChirho ? <AvatarImage src={personaChirho.personaImageChirho} alt={dictionary.personaInitialAvatarAlt} /> : null ) }
                       <AvatarFallback className="bg-accent text-accent-foreground">
                         {!(dynamicPersonaImageChirho || personaChirho?.personaImageChirho) && <Bot className="h-7 w-7" />} 
                       </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] rounded-lg p-3 shadow bg-card border">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          {suggestedAnswerChirho && !isCelebrationModeActiveChirho && (
            <Alert variant="default" className="mx-4 my-2 border-accent shadow-md overflow-hidden w-auto"> 
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="flex justify-between items-center">
                    {dictionary.suggestedAnswerAlertTitle}
                    <Button variant="ghost" size="icon" onClick={() => setSuggestedAnswerChirho(null)} className="h-6 w-6">
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">{dictionary.dismissSuggestionButtonTitle}</span>
                    </Button>
                </AlertTitle>
                <AlertDescription className="mt-1 text-sm whitespace-pre-wrap break-words"> 
                    {suggestedAnswerChirho}
                </AlertDescription>
                 <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                        setUserInputChirho(suggestedAnswerChirho);
                        setSuggestedAnswerChirho(null);
                    }}
                    disabled={noCreditsChirho}
                >
                    {dictionary.useSuggestionButton}
                </Button>
            </Alert>
          )}
          {noCreditsChirho && personaChirho && !isCelebrationModeActiveChirho && (
             <Alert variant="destructive" className="m-4">
                <AlertTitle>{dictionary.outOfCreditsAlertTitle}</AlertTitle>
                <AlertDescription>
                  {(dictionary.outOfCreditsAlertDescription).replace("{nameOrTitle}", chatWithNameForHeader)}
                  <Button className="mt-2 w-full" size="sm" onClick={() => setIsBuyCreditsDialogOpenChirho(true)}>
                    <CreditCard className="mr-2 h-4 w-4" /> {dictionary.creditsDialog?.getMoreCreditsButton}
                  </Button>
                </AlertDescription>
             </Alert>
          )}
          {!isCelebrationModeActiveChirho && (
            <div className="border-t p-4 bg-background/50">
                <div className="flex items-end gap-2">
                <Textarea
                    value={userInputChirho}
                    onChange={(eChirho) => setUserInputChirho(eChirho.target.value)}
                    placeholder={ (isLoadingPersonaChirho && !personaChirho) ? dictionary.messagePlaceholderLoading : (noCreditsChirho ? dictionary.messagePlaceholderNoCredits : messagePlaceholderName)}
                    className="flex-grow resize-none"
                    rows={2}
                    onKeyDown={(eChirho) => {
                    if (eChirho.key === 'Enter' && !eChirho.shiftKey && !noCreditsChirho) {
                        eChirho.preventDefault();
                        handleSendMessageChirho();
                    }
                    }}
                    disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho || noCreditsChirho || !isInitialLoadAttemptedChirho}
                />
                <div className="flex flex-col gap-1">
                    <Button
                    onClick={handleSuggestAnswerChirho}
                    disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho || messagesChirho.filter(mChirho=>mChirho.sender==='persona').length === 0 || noCreditsChirho || !isInitialLoadAttemptedChirho}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    title={dictionary.suggestButtonTitle}
                    >
                    {isFetchingSuggestionChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                    <span className="sr-only sm:not-sr-only sm:ml-1">{dictionary.suggestButton}</span>
                    </Button>
                    <Button onClick={handleSendMessageChirho} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !userInputChirho.trim() || !personaChirho || noCreditsChirho || !isInitialLoadAttemptedChirho} className="w-full">
                    {(isSendingMessageChirho || isUpdatingImageChirho) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only sm:not-sr-only sm:ml-1">{dictionary.sendButton}</span>
                    </Button>
                </div>
                </div>
            </div>
          )}
        </CardContent>
         {/* Scroll to Top/Bottom Buttons for Mobile */}
        {isMobileChirho && (
          <div className="absolute bottom-20 right-4 space-y-2 z-20">
            {showScrollToTopButtonChirho && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-lg"
                onClick={() => {
                  const viewport = scrollAreaRefChirho.current?.querySelector('div[data-radix-scroll-area-viewport]') as HTMLElement | null;
                  if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title={dictionary.scrollToTopButtonTitle || "Scroll to Top"}
              >
                <ArrowUpCircle className="h-5 w-5" />
              </Button>
            )}
            {showScrollToBottomButtonChirho && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-lg"
                onClick={() => {
                  const viewport = scrollAreaRefChirho.current?.querySelector('div[data-radix-scroll-area-viewport]') as HTMLElement | null;
                  if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                }}
                title={dictionary.scrollToBottomButtonTitle || "Scroll to Bottom"}
              >
                <ArrowDownCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </Card>

      { typeof window !== 'undefined' && (
        <DynamicImagePopupDialogChirho
            isOpenChirho={isImagePopupOpenChirho}
            onCloseChirho={() => setIsImagePopupOpenChirho(false)}
            imageUrlChirho={imagePopupUrlChirho}
            dictionary={fullDictionary.aiPersonasPage}
        />
      )}

    </div>
  );
}


    