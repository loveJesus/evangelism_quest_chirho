// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { useAuthChirho } from '@/contexts/auth-context-chirho'; // Adjusted import
// import { useRouter } from 'next/navigation'; // Not used directly, routerChirho from context is used
import { 
  generateNewPersonaChirho as generateNewPersonaActionChirho, 
  sendMessageToPersonaChirho, 
  updatePersonaImageChirho as updatePersonaImageActionChirho, 
  fetchSuggestedResponseChirho, 
  decrementUserCreditsChirho, 
  addTestCreditsChirho,
  fetchArchivedConversationsFromFirestoreChirho,
  archiveConversationToFirestoreChirho,
  clearArchivedConversationsFromFirestoreChirho
} from "@/lib/actions-chirho";
import type { GenerateAiPersonaOutputChirho, GenerateAiPersonaInputChirho } from "@/ai-chirho/flows-chirho/generate-ai-persona-chirho";
import type { AIPersonaConvincingOutputChirho, AIPersonaConvincingInputChirho } from "@/ai-chirho/flows-chirho/ai-persona-convincing-chirho";
import type { UpdatePersonaVisualsInputChirho } from "@/ai-chirho/flows-chirho/update-persona-visuals-chirho";
import type { SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai-chirho/flows-chirho/suggest-evangelistic-response-chirho";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2, Info, Lightbulb, XCircle, History, ArrowLeft, Trash2, CreditCard, MessageCircleMore } from "lucide-react";
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

const DynamicImagePopupDialogChirho = dynamic(() => import('@/components/image-popup-dialog-chirho.tsx').then(mod => mod.ImagePopupDialogChirho), { ssr: false });

export interface MessageChirho {
  sender: "user" | "persona";
  text: string;
  id: string;
  imageUrlChirho?: string | null; 
}

export interface ArchivedConversationChirho {
  id: string; 
  timestamp: number; // Client-generated Date.now()
  personaNameChirho: string;
  initialPersonaImageChirho?: string | null; 
  meetingContextChirho: string;
  encounterTitleChirho?: string | null; 
  personaDetailsChirho: string; 
  personaNameKnownToUserChirho: boolean;
  difficultyLevelChirho: number;
  messagesChirho: MessageChirho[];
  convincedChirho: boolean;
  archivedAtServerMillis?: number; // For serializable timestamp from Firestore
}

const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10; // This is now managed server-side but good to keep for client-side display limits if any

export default function AIPersonasPageChirho() { 
  const { currentUserChirho, userProfileChirho, loadingAuthChirho, updateLocalUserProfileChirho, routerChirho } = useAuthChirho();

  const [personaChirho, setPersonaChirho] = useState<GenerateAiPersonaOutputChirho | null>(null);
  const [dynamicPersonaImageChirho, setDynamicPersonaImageChirho] = useState<string | null>(null);
  const [messagesChirho, setMessagesChirho] = useState<MessageChirho[]>([]);
  const [userInputChirho, setUserInputChirho] = useState("");
  const [isLoadingPersonaChirho, setIsLoadingPersonaChirho] = useState(true); 
  const [isSendingMessageChirho, setIsSendingMessageChirho] = useState(false);
  const [isUpdatingImageChirho, setIsUpdatingImageChirho] = useState(false);
  const [difficultyLevelChirho, setDifficultyLevelChirho] = useState(1);
  const [suggestedAnswerChirho, setSuggestedAnswerChirho] = useState<string | null>(null);
  const [isFetchingSuggestionChirho, setIsFetchingSuggestionChirho] = useState(false);

  const [archivedConversationsChirho, setArchivedConversationsChirho] = useState<ArchivedConversationChirho[]>([]);
  const [selectedArchivedConversationChirho, setSelectedArchivedConversationChirho] = useState<ArchivedConversationChirho | null>(null);
  const [isHistoryDialogOpenChirho, setIsHistoryDialogOpenChirho] = useState<boolean>(false);
  const [isBuyCreditsDialogOpenChirho, setIsBuyCreditsDialogOpenChirho] = useState<boolean>(false);
  
  const [imagePopupUrlChirho, setImagePopupUrlChirho] = useState<string | null>(null);
  const [isImagePopupOpenChirho, setIsImagePopupOpenChirho] = useState<boolean>(false);
  const [isLoadingHistoryChirho, setIsLoadingHistoryChirho] = useState(false);

  const { toastChirho } = useToastChirho();
  const scrollAreaRefChirho = useRef<HTMLDivElement>(null);
  const archivedChatScrollAreaRefChirho = useRef<HTMLDivElement>(null);
  const justContinuedConversationRef = useRef(false);
  
  // Effect for handling auth changes: redirecting or fetching initial data
  useEffect(() => {
    if (!loadingAuthChirho) {
      if (currentUserChirho) {
        // User is logged in, fetch their history if not already fetched
        if (archivedConversationsChirho.length === 0) { 
          setIsLoadingHistoryChirho(true);
          fetchArchivedConversationsFromFirestoreChirho(currentUserChirho.uid)
            .then(result => {
              if (result.success && result.data) {
                setArchivedConversationsChirho(result.data);
              } else {
                console.error("Failed to fetch history from Firestore:", result.error);
                toastChirho({
                  variant: "destructive",
                  title: "History Load Failed",
                  description: result.error || "Could not retrieve your conversation history.",
                });
              }
            })
            .finally(() => setIsLoadingHistoryChirho(false));
        }
      } else {
        // User is logged out, redirect to login and clear states
        routerChirho.push('/login-chirho');
        setPersonaChirho(null);
        setMessagesChirho([]);
        setDynamicPersonaImageChirho(null);
        setSuggestedAnswerChirho(null);
        setDifficultyLevelChirho(1);
        setArchivedConversationsChirho([]); // Clear local history state
        setIsLoadingPersonaChirho(true); // Set to true so initial persona load effect can trigger if user logs back in
      }
    }
  }, [currentUserChirho, loadingAuthChirho, routerChirho, toastChirho, archivedConversationsChirho.length]); // Added archivedConversations.length to re-fetch if cleared


  const archiveCurrentConversationChirho = useCallback(async (
    personaToArchive: GenerateAiPersonaOutputChirho | null, 
    messagesToArchive: MessageChirho[], 
    convinced: boolean
  ) => {
    if (!personaToArchive || messagesToArchive.length === 0 || !currentUserChirho) {
        console.log("Archive skipped: no persona, messages, or user.", { hasPersona: !!personaToArchive, messagesLength: messagesToArchive.length, hasUser: !!currentUserChirho });
        return;
    }
    console.log(`Attempting to archive conversation for ${personaToArchive.personaNameChirho}`);
    
    const newArchiveEntry: ArchivedConversationChirho = {
      id: Date.now().toString() + "_" + Math.random().toString(36).substring(2,9),
      timestamp: Date.now(), // Client-generated timestamp
      personaNameChirho: personaToArchive.personaNameChirho,
      initialPersonaImageChirho: personaToArchive.personaImageChirho || null, 
      meetingContextChirho: personaToArchive.meetingContextChirho,
      encounterTitleChirho: personaToArchive.encounterTitleChirho || "A Past Encounter",
      personaDetailsChirho: personaToArchive.personaDetailsChirho, 
      personaNameKnownToUserChirho: personaToArchive.personaNameKnownToUserChirho,
      difficultyLevelChirho: difficultyLevelChirho, // Current difficulty
      messagesChirho: messagesToArchive.map(msg => ({ // Ensure we are saving Firebase Storage URLs
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        imageUrlChirho: msg.imageUrlChirho || null 
      })),
      convincedChirho: convinced,
      // archivedAtServerMillis will be set by Firestore serverTimestamp on write, then converted on read
    };

    const result = await archiveConversationToFirestoreChirho(currentUserChirho.uid, newArchiveEntry);
    if (result.success) {
      // Optimistically update local state, or re-fetch for consistency
      setArchivedConversationsChirho(prev => [newArchiveEntry, ...prev].sort((a,b) => b.timestamp - a.timestamp).slice(0, MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
      toastChirho({
        title: "Conversation Archived",
        description: "Your chat has been saved to the server.",
        duration: 3000
      });
    } else {
      toastChirho({
        variant: "destructive",
        title: "Archive Error",
        description: result.error || "Could not save conversation to server.",
      });
    }
  }, [difficultyLevelChirho, toastChirho, currentUserChirho]);


  const handleClearHistoryChirho = async () => {
    if (!currentUserChirho) return;
    setIsLoadingHistoryChirho(true);
    const result = await clearArchivedConversationsFromFirestoreChirho(currentUserChirho.uid);
    if (result.success) {
      setArchivedConversationsChirho([]);
      setSelectedArchivedConversationChirho(null); 
      toastChirho({
        title: "History Cleared",
        description: "All conversation history has been removed from the server.",
      });
    } else {
      toastChirho({
        variant: "destructive",
        title: "Clear History Error",
        description: result.error || "Could not clear conversation history from server.",
      });
    }
    setIsLoadingHistoryChirho(false);
  };

  const loadNewPersonaChirho = useCallback(async (
    difficultyToLoadChirho: number, 
    convincedStatusOverride?: boolean, 
    conversationToContinue?: ArchivedConversationChirho | null
  ) => {
    const currentPersonaForArchive = personaChirho;
    const currentMessagesForArchive = messagesChirho;

    if (currentPersonaForArchive && currentMessagesForArchive.length > 1 && currentUserChirho && !conversationToContinue) {
        await archiveCurrentConversationChirho(currentPersonaForArchive, currentMessagesForArchive, convincedStatusOverride ?? false);
    }
    
    setIsLoadingPersonaChirho(true);
    setUserInputChirho("");
    setSuggestedAnswerChirho(null);

    if (conversationToContinue && currentUserChirho) {
        console.log("Continuing conversation with:", conversationToContinue.personaNameChirho);
        
        setPersonaChirho({ 
            personaNameChirho: conversationToContinue.personaNameChirho,
            personaDetailsChirho: conversationToContinue.personaDetailsChirho,
            meetingContextChirho: conversationToContinue.meetingContextChirho,
            encounterTitleChirho: conversationToContinue.encounterTitleChirho || "A Continued Encounter",
            personaImageChirho: conversationToContinue.initialPersonaImageChirho || "", // This is the persona's *very first* image
            personaNameKnownToUserChirho: conversationToContinue.personaNameKnownToUserChirho,
        });

        // Restore messages directly from the archive
        const restoredMessages = conversationToContinue.messagesChirho.map(msg => ({ ...msg }));
        setMessagesChirho(restoredMessages);
        
        // Set dynamic image to the image of the LAST message in the continued conversation
        let lastImageUrl: string | null = conversationToContinue.initialPersonaImageChirho || null;
        if (restoredMessages.length > 0) {
            const lastMsgWithImage = [...restoredMessages].reverse().find(msg => msg.imageUrlChirho);
            if (lastMsgWithImage && lastMsgWithImage.imageUrlChirho) {
                lastImageUrl = lastMsgWithImage.imageUrlChirho;
            }
        }
        setDynamicPersonaImageChirho(lastImageUrl);
        
        setDifficultyLevelChirho(conversationToContinue.difficultyLevelChirho);
        justContinuedConversationRef.current = true; 
        setIsHistoryDialogOpenChirho(false); 
        setSelectedArchivedConversationChirho(null);
        setIsLoadingPersonaChirho(false);
        toastChirho({
            title: "Conversation Continued",
            description: `Continuing chat with ${conversationToContinue.personaNameKnownToUserChirho ? conversationToContinue.personaNameChirho : (conversationToContinue.encounterTitleChirho || 'the person')}.`,
            duration: 5000,
        });
        return; 
    }

    // Load a brand new persona
    console.log("Loading NEW persona, difficulty:", difficultyToLoadChirho);
    setMessagesChirho([]); 
    setDynamicPersonaImageChirho(null);
    setPersonaChirho(null);

    const personaThemeDescriptionChirho = `A person at difficulty level ${difficultyToLoadChirho}. Their story should be unique.`;
    
    try {
      if (!currentUserChirho) {
        throw new Error("User not authenticated for new persona generation.");
      }
      const resultChirho = await generateNewPersonaActionChirho({ personaDescriptionChirho: personaThemeDescriptionChirho } as GenerateAiPersonaInputChirho, currentUserChirho.uid);
      if (resultChirho.success && resultChirho.data) {
        setPersonaChirho(resultChirho.data); 
        setDynamicPersonaImageChirho(resultChirho.data.personaImageChirho); 
        const initialMessageTextChirho = resultChirho.data.meetingContextChirho
          ? `${resultChirho.data.meetingContextChirho}`
          : "Hello! I'm ready to talk.";
        setMessagesChirho([{
          sender: "persona",
          text: initialMessageTextChirho,
          id: Date.now().toString(),
          imageUrlChirho: resultChirho.data.personaImageChirho // Associate initial image with the first message
        }]);
      } else {
        toastChirho({
          variant: "destructive",
          title: "Error Generating Persona",
          description: resultChirho.error || "Could not load a new persona. Please try again.",
        });
        setPersonaChirho(null); 
      }
    } catch (errorChirho: any) {
        toastChirho({
            variant: "destructive",
            title: "Error",
            description: errorChirho.message || "An unexpected error occurred while generating the persona.",
        });
        setPersonaChirho(null); 
    }
    setIsLoadingPersonaChirho(false);
  }, [toastChirho, archiveCurrentConversationChirho, currentUserChirho]); // Added currentUserChirho

  // Effect for loading initial persona when user is logged in and no persona exists
  useEffect(() => {
    if (currentUserChirho && !loadingAuthChirho && !personaChirho && messagesChirho.length === 0 && !justContinuedConversationRef.current) {
        console.log("Initial persona load triggered by useEffect for new session/page load.");
        loadNewPersonaChirho(difficultyLevelChirho, false, null);
    }
    if (justContinuedConversationRef.current) {
        justContinuedConversationRef.current = false; // Reset ref after use
    }
  }, [currentUserChirho, loadingAuthChirho, personaChirho, messagesChirho.length, difficultyLevelChirho, loadNewPersonaChirho]); 


  useEffect(() => {
    if (scrollAreaRefChirho.current) {
      const scrollElementChirho = scrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElementChirho) {
        scrollElementChirho.scrollTop = scrollElementChirho.scrollHeight;
      }
    }
  }, [messagesChirho, suggestedAnswerChirho]);

  useEffect(() => {
    if (selectedArchivedConversationChirho && archivedChatScrollAreaRefChirho.current) {
      const scrollElementChirho = archivedChatScrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElementChirho) {
        scrollElementChirho.scrollTop = scrollElementChirho.scrollHeight;
      }
    }
  }, [selectedArchivedConversationChirho]);

  const handleSendMessageChirho = async () => {
    if (!userInputChirho.trim() || !personaChirho || !currentUserChirho || !userProfileChirho) return;
    
    // Use current dynamic image as the base for the next potential update,
    // or the persona's initial image if dynamic one isn't set yet.
    let baseImageForResponse = dynamicPersonaImageChirho || personaChirho.personaImageChirho;
    if (!baseImageForResponse) {
        console.warn("No base image available for persona response, image update might be skipped.");
        // Optionally, could use a placeholder here if absolutely no image is available
    }

    if (userProfileChirho.credits <= 0) {
      toastChirho({
        variant: "destructive",
        title: "Out of Credits",
        description: "You have no message credits left. Please get more to continue.",
      });
      setIsBuyCreditsDialogOpenChirho(true);
      return;
    }

    const creditDecrementResult = await decrementUserCreditsChirho(currentUserChirho.uid);
    if (!creditDecrementResult.success) {
      toastChirho({
        variant: "destructive",
        title: "Credit Error",
        description: creditDecrementResult.error || "Failed to update credits. Message not sent.",
      });
      if(creditDecrementResult.error === "Insufficient credits.") setIsBuyCreditsDialogOpenChirho(true);
      return;
    }
    if (creditDecrementResult.newCredits !== undefined) {
      updateLocalUserProfileChirho({ credits: creditDecrementResult.newCredits });
    }

    const newUserMessageChirho: MessageChirho = { sender: "user", text: userInputChirho, id: Date.now().toString() };
    // Snapshot messages *before* potential persona response and image update
    const currentMessagesSnapshot = [...messagesChirho, newUserMessageChirho]; 
    setMessagesChirho(currentMessagesSnapshot);

    const currentInputChirho = userInputChirho;
    setUserInputChirho("");
    setSuggestedAnswerChirho(null);
    setIsSendingMessageChirho(true);

    const convincingInputChirho: AIPersonaConvincingInputChirho = {
      difficultyLevelChirho: difficultyLevelChirho,
      personaDescriptionChirho: `${personaChirho.personaNameChirho}: ${personaChirho.personaDetailsChirho}`, 
      messageChirho: currentInputChirho,
    };

    try {
      const resultChirho = await sendMessageToPersonaChirho(convincingInputChirho);
      if (resultChirho.success && resultChirho.data) {
        const personaResponseChirho = resultChirho.data as AIPersonaConvincingOutputChirho;
        
        let imageForPersonaMessage = baseImageForResponse; // Start with the image visible before AI responds

        if (personaResponseChirho.visualContextForNextImageChirho && baseImageForResponse) {
          console.log("Attempting to update persona image with visual context:", personaResponseChirho.visualContextForNextImageChirho);
          setIsUpdatingImageChirho(true);
          const imageUpdateInputChirho: UpdatePersonaVisualsInputChirho = {
            baseImageUriChirho: baseImageForResponse, // Pass the *current* image as base
            personaNameChirho: personaChirho.personaNameChirho,
            originalMeetingContextChirho: personaChirho.meetingContextChirho,
            newVisualPromptChirho: personaResponseChirho.visualContextForNextImageChirho,
          };
          // Ensure userId is passed for storage operations within updatePersonaImageActionChirho
          const imageResultChirho = await updatePersonaImageActionChirho(imageUpdateInputChirho, currentUserChirho.uid); 
          if (imageResultChirho.success && imageResultChirho.data?.updatedImageUriChirho) {
            setDynamicPersonaImageChirho(imageResultChirho.data.updatedImageUriChirho);
            imageForPersonaMessage = imageResultChirho.data.updatedImageUriChirho; // Use the newly generated image for the message
          } else {
            console.warn("Image update failed, keeping previous image for message. Error:", imageResultChirho.error)
            // imageForPersonaMessage remains baseImageForResponse
          }
          setIsUpdatingImageChirho(false);
        }

        const newPersonaMessageChirho: MessageChirho = {
          sender: "persona",
          text: personaResponseChirho.personaResponseChirho,
          id: (Date.now() + 1).toString(), // Ensure unique ID
          imageUrlChirho: imageForPersonaMessage // Associate the relevant image with this specific message
        };
        const finalMessagesForArchive = [...currentMessagesSnapshot, newPersonaMessageChirho];
        setMessagesChirho(finalMessagesForArchive);

        if (personaResponseChirho.convincedChirho) {
          toastChirho({
            title: "Persona Convinced!",
            description: `${personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || 'The person')} has come to believe! A new, more challenging persona will now be generated.`,
            duration: 7000,
          });
          const newDifficulty = Math.min(difficultyLevelChirho + 1, 10);
          // Archive with the final set of messages and current persona state
          await archiveCurrentConversationChirho(personaChirho, finalMessagesForArchive, true); 
          setDifficultyLevelChirho(newDifficulty); 
          loadNewPersonaChirho(newDifficulty, false, null); // Load new persona
        }
      } else {
        toastChirho({
          variant: "destructive",
          title: "Error Getting Response",
          description: resultChirho.error || "Could not get persona's response.",
        });
         // Rollback messages if persona response failed (optional: or just leave user message)
         setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
         // Rollback credits
         if(currentUserChirho) { 
            const creditRollback = await addTestCreditsChirho(currentUserChirho.uid, 1); // Give back 1 credit
            if(creditRollback.success && creditRollback.newCredits !== undefined) {
                updateLocalUserProfileChirho({credits: creditRollback.newCredits});
            }
         }
      }
    } catch (errorChirho: any) {
        toastChirho({
            variant: "destructive",
            title: "Error",
            description: errorChirho.message || "An unexpected error occurred while sending the message.",
        });
        setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
         // Rollback credits
         if(currentUserChirho) { 
            const creditRollback = await addTestCreditsChirho(currentUserChirho.uid, 1); // Give back 1 credit
            if(creditRollback.success && creditRollback.newCredits !== undefined) {
                updateLocalUserProfileChirho({credits: creditRollback.newCredits});
            }
         }
    }
    setIsSendingMessageChirho(false);
  };

  const handleSuggestAnswerChirho = async () => {
    if (!personaChirho || messagesChirho.length === 0 || !currentUserChirho || !userProfileChirho) return;
    
    const lastPersonaMessageChirho = messagesChirho.filter(mChirho => mChirho.sender === 'persona').pop();
    if (!lastPersonaMessageChirho) {
        toastChirho({ variant: "destructive", title: "Cannot Suggest", description: "No persona message found to base a suggestion on." });
        return;
    }
    if (!lastPersonaMessageChirho.text?.trim()) {
        toastChirho({ variant: "destructive", title: "Cannot Suggest", description: "The last persona message is empty." });
        return;
    }
    
    // Explicitly get the persona's actual name, ensuring it's a non-empty string.
    const actualPersonaName = (personaChirho.personaNameChirho && personaChirho.personaNameChirho.trim() !== "") 
                              ? personaChirho.personaNameChirho 
                              : "Character"; // Using a clear, non-empty placeholder if the name is missing/empty

    const displayNameForSuggestion = personaChirho.personaNameKnownToUserChirho ? actualPersonaName : (personaChirho.encounterTitleChirho || "the person");

    setIsFetchingSuggestionChirho(true);
    setSuggestedAnswerChirho(null);

    const suggestionInputChirho: SuggestEvangelisticResponseInputChirho = {
      personaLastResponseChirho: lastPersonaMessageChirho.text,
      personaActualNameForContextChirho: actualPersonaName, 
      personaDisplayNameForUserChirho: displayNameForSuggestion,
      conversationHistoryChirho: messagesChirho.slice(-5).map(m => `${m.sender === 'user' ? 'User' : displayNameForSuggestion}: ${m.text}`).join('\n')
    };
    
    console.log("Requesting suggestion with input:", suggestionInputChirho);

    try {
      const resultChirho = await fetchSuggestedResponseChirho(suggestionInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setSuggestedAnswerChirho((resultChirho.data as SuggestEvangelisticResponseOutputChirho).suggestedResponseChirho);
      } else {
        toastChirho({
          variant: "destructive",
          title: "Suggestion Failed",
          description: resultChirho.error || "Could not fetch a suggestion. Please try again.",
        });
      }
    } catch (errorChirho: any) {
      console.error("Error fetching suggested response:", errorChirho);
      toastChirho({
        variant: "destructive",
        title: "Suggestion Error",
        description: errorChirho.message || "An unexpected error occurred while fetching the suggestion.",
      });
    }
    setIsFetchingSuggestionChirho(false);
  };
  
  const handleImagePopupChirho = (imageUrl: string | null | undefined) => {
    if (imageUrl) {
      setImagePopupUrlChirho(imageUrl);
      setIsImagePopupOpenChirho(true);
    }
  };

  const handleAddTestCredits = async () => {
    if (!currentUserChirho) return;
    setIsSendingMessageChirho(true); // Use a generic loading state, or create a new one
    const result = await addTestCreditsChirho(currentUserChirho.uid, 1000); // Add 1000 credits
    if (result.success && result.newCredits !== undefined) {
      updateLocalUserProfileChirho({ credits: result.newCredits });
      toastChirho({
        title: "Credits Added",
        description: "1000 test credits have been added to your account.",
      });
      setIsBuyCreditsDialogOpenChirho(false);
    } else {
      toastChirho({
        variant: "destructive",
        title: "Error Adding Credits",
        description: result.error || "Failed to add test credits.",
      });
    }
    setIsSendingMessageChirho(false);
  };

  // Loading state for initial auth check or if no user (will redirect)
  if (loadingAuthChirho && !currentUserChirho) { 
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  // If not loading auth and still no current user or profile, means redirect should happen or already happened.
  // This state might be brief before redirect logic in useEffect kicks in.
  if (!currentUserChirho || !userProfileChirho) {
    // router.push('/login-chirho') is handled by useEffect, this is a fallback UI
    return <div className="flex items-center justify-center h-full"><p>Redirecting to login...</p><Loader2 className="h-8 w-8 animate-spin text-primary ml-2" /></div>;
  }

  const personaDisplayNameForCard = personaChirho 
    ? (personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || "A New Encounter"))
    : "Loading...";
  const chatWithNameForHeader = personaChirho 
    ? (personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || "the Person"))
    : "Loading...";
  const messagePlaceholderName = personaChirho 
    ? (personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || "the person"))
    : "the person";
  const noCreditsChirho = userProfileChirho.credits <= 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      {/* Persona Info Card */}
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isLoadingPersonaChirho && !personaChirho ? "Loading Persona..." : `AI Persona: ${personaDisplayNameForCard}`}
            {/* Action Buttons */}
             <div className="flex gap-2">
              {/* History Dialog */}
              <Dialog open={isHistoryDialogOpenChirho} onOpenChange={(open) => {
                setIsHistoryDialogOpenChirho(open);
                if (!open) setSelectedArchivedConversationChirho(null); // Clear selection when dialog closes
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="View History" disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho}>
                    <History className="h-4 w-4" />
                    <span className="sr-only">View History</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedArchivedConversationChirho ? `Chat with ${selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : (selectedArchivedConversationChirho.encounterTitleChirho || "Person")}` : "Conversation History"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedArchivedConversationChirho ? `Conversation from ${new Date(selectedArchivedConversationChirho.timestamp).toLocaleString()}` : "Select a past conversation to view details, continue, or clear history."}
                    </DialogDescription>
                  </DialogHeader>
                  {!selectedArchivedConversationChirho ? (
                    // History List View
                    <>
                      <ScrollArea className="flex-grow mt-4">
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
                                {(chatChirho.personaNameKnownToUserChirho ? chatChirho.personaNameChirho : (chatChirho.encounterTitleChirho || "A Past Encounter"))} - {new Date(chatChirho.timestamp).toLocaleDateString()} ({chatChirho.convincedChirho ? "Convinced" : "Not Convinced"})
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">No conversation history found.</p>
                        )}
                      </ScrollArea>
                      {archivedConversationsChirho.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="w-full" disabled={isLoadingHistoryChirho}>
                                {isLoadingHistoryChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} 
                                Clear All History
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete all your conversation history for this account from the server.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearHistoryChirho}>
                                  Yes, delete history
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </>
                  ) : (
                    // Archived Chat Detail View
                    <div className="flex-grow flex flex-col overflow-hidden">
                      <Button onClick={() => setSelectedArchivedConversationChirho(null)} variant="outline" size="sm" className="mb-2 self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                      </Button>
                      <Card className="mb-2 p-3">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80" onClick={() => handleImagePopupChirho(selectedArchivedConversationChirho.initialPersonaImageChirho)} title="View initial persona image">
                              {selectedArchivedConversationChirho.initialPersonaImageChirho ? (
                                <AvatarImage src={selectedArchivedConversationChirho.initialPersonaImageChirho} alt="Archived persona avatar" />
                              ) : null }
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {selectedArchivedConversationChirho.personaNameChirho ? selectedArchivedConversationChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-5 w-5" />}
                              </AvatarFallback>
                            </Avatar>
                          <div>
                            <p className="font-semibold">{selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : (selectedArchivedConversationChirho.encounterTitleChirho || "A Past Encounter")}</p>
                            <p className="text-xs text-muted-foreground">{selectedArchivedConversationChirho.meetingContextChirho}</p>
                            <p className="text-xs text-muted-foreground">Difficulty: {selectedArchivedConversationChirho.difficultyLevelChirho} - {selectedArchivedConversationChirho.convincedChirho ? "Convinced" : "Not Convinced"}</p>
                          </div>
                        </div>
                      </Card>
                      <ScrollArea className="flex-grow border rounded-md p-4" ref={archivedChatScrollAreaRefChirho}>
                        <div className="space-y-4">
                          {selectedArchivedConversationChirho.messagesChirho.map(msgChirho => (
                            <div
                              key={msgChirho.id}
                              className={`flex items-end gap-2 ${msgChirho.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msgChirho.sender === "persona" && (
                                 <Avatar 
                                    className={`h-8 w-8 ${msgChirho.imageUrlChirho ? "cursor-pointer hover:opacity-80" : ""}`} 
                                    onClick={() => handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                    title={msgChirho.imageUrlChirho ? "Click avatar to view image" : ""}
                                 >
                                    {msgChirho.imageUrlChirho ? (
                                        <AvatarImage src={msgChirho.imageUrlChirho} alt="Persona avatar" />
                                    ) : (selectedArchivedConversationChirho.initialPersonaImageChirho ? <AvatarImage src={selectedArchivedConversationChirho.initialPersonaImageChirho} alt="Persona initial avatar" /> : null)}
                                    <AvatarFallback className="bg-accent text-accent-foreground">
                                      {!(msgChirho.imageUrlChirho || selectedArchivedConversationChirho.initialPersonaImageChirho) && (selectedArchivedConversationChirho.personaNameChirho ? selectedArchivedConversationChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-5 w-5"/>)}
                                    </AvatarFallback>
                                </Avatar>
                              )}
                               <div
                                className={`max-w-[70%] rounded-lg p-3 shadow ${
                                  msgChirho.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                                } ${msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : ""}`}
                                onClick={() => msgChirho.sender === "persona" && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "Click message to view image" : ""}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                              </div>
                              {msgChirho.sender === "user" && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                                      <User className="h-5 w-5" />
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
                                    loadNewPersonaChirho(selectedArchivedConversationChirho.difficultyLevelChirho, false, selectedArchivedConversationChirho);
                                }
                            }}
                            disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho}
                        >
                            Continue this Conversation
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* New Persona Button */}
              <Button variant="outline" size="icon" onClick={() => loadNewPersonaChirho(difficultyLevelChirho, false, null)} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho}>
                {isLoadingPersonaChirho && messagesChirho.length === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="sr-only">New Persona</span>
              </Button>
            </div>
          </CardTitle>
          {!isLoadingPersonaChirho && personaChirho && (
            <CardDescription>Difficulty Level: {difficultyLevelChirho}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingPersonaChirho && !personaChirho ? (
            // Skeleton Loader for Persona Info
            <div className="space-y-4">
              <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mt-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          ) : personaChirho && dynamicPersonaImageChirho ? (
            // Actual Persona Info
            <>
              <div 
                className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-80"
                onClick={() => handleImagePopupChirho(dynamicPersonaImageChirho)}
                title="Click to enlarge image"
              >
                {dynamicPersonaImageChirho && (
                  <Image
                    src={dynamicPersonaImageChirho}
                    alt={`AI Persona: ${personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : (personaChirho.encounterTitleChirho || "Current Encounter")}`}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint="portrait person"
                    key={dynamicPersonaImageChirho} // Re-render if image URI changes
                    priority={true} // Prioritize loading main persona image
                    unoptimized={typeof dynamicPersonaImageChirho === 'string' && dynamicPersonaImageChirho.startsWith('data:image')} // Unoptimize if it's a data URI (fallback)
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
                  Meeting Context
                </h3>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border">
                  {personaChirho.meetingContextChirho}
                </p>
              </div>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Error Loading Persona</AlertTitle>
              <AlertDescription>Failed to load persona details. Please try refreshing to get a new persona.</AlertDescription>
            </Alert>
          )}
        </CardContent>
         <CardFooter className="border-t pt-4">
          {/* Buy Credits Dialog */}
          <Dialog open={isBuyCreditsDialogOpenChirho} onOpenChange={setIsBuyCreditsDialogOpenChirho}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho}>
                <CreditCard className="mr-2 h-4 w-4" /> Get More Message Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Get More Message Credits</DialogTitle>
                <DialogDescription>
                  Choose a package to continue your conversations. (Payment integration is a demo).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <CardTitle className="text-lg">Test Package</CardTitle>
                  <CardDescription>Add 1000 credits for testing purposes.</CardDescription>
                  <Button className="mt-2 w-full" onClick={handleAddTestCredits} disabled={isSendingMessageChirho}>
                    {isSendingMessageChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Get 1000 Test Credits"}
                  </Button>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <CardTitle className="text-lg">Basic Evangelist Pack (Example)</CardTitle>
                  <CardDescription>$5.00 - Approximately 5000 message credits. (Actual payment not implemented)</CardDescription>
                  <Button className="mt-2 w-full" disabled={true}>Buy Now (Disabled)</Button>
                </Card>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Chat Area */}
      <Card className="flex-grow flex flex-col shadow-xl max-h-full">
        <CardHeader>
          <CardTitle>Chat with {chatWithNameForHeader}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MessageCircleMore className="h-4 w-4 text-primary" /> 
            Credits remaining: {userProfileChirho?.credits ?? 0}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRefChirho}>
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
                        className={`h-8 w-8 ${msgChirho.imageUrlChirho ? "cursor-pointer hover:opacity-80" : ""}`} 
                        onClick={() => handleImagePopupChirho(msgChirho.imageUrlChirho)}
                        title={msgChirho.imageUrlChirho ? "Click avatar to view image" : ""}
                    >
                      {/* Display current dynamic persona image for live chat, or message-specific for history */}
                      {msgChirho.imageUrlChirho ? (
                        <AvatarImage src={msgChirho.imageUrlChirho} alt="Persona avatar" />
                      ) : (personaChirho?.personaImageChirho ? <AvatarImage src={personaChirho.personaImageChirho} alt="Persona initial avatar" /> : null )}
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {!(msgChirho.imageUrlChirho || personaChirho?.personaImageChirho) && (personaChirho?.personaNameChirho ? personaChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-5 w-5"/>)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      msgChirho.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    } ${msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : ""}`}
                     onClick={() => msgChirho.sender === "persona" && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                     title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "Click message to view image" : ""}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                  </div>
                  {msgChirho.sender === "user" && (
                     <Avatar className="h-8 w-8">
                       {/* Optionally show current user's avatar if available from userProfileChirho.photoURL */}
                       <AvatarFallback className="bg-secondary text-secondary-foreground">
                          <User className="h-5 w-5" />
                       </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {/* Loading indicator for persona response */}
              {(isSendingMessageChirho || isUpdatingImageChirho) && messagesChirho[messagesChirho.length-1]?.sender === 'user' && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                       {dynamicPersonaImageChirho ? (
                         <AvatarImage src={dynamicPersonaImageChirho} alt="Persona avatar" />
                       ) : null }
                       <AvatarFallback className="bg-accent text-accent-foreground">
                         <Bot className="h-5 w-5" />
                       </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] rounded-lg p-3 shadow bg-card border">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          {/* Suggested Answer Alert */}
          {suggestedAnswerChirho && (
            <Alert variant="default" className="m-4 border-accent shadow-md">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="flex justify-between items-center">
                    Suggested Answer
                    <Button variant="ghost" size="icon" onClick={() => setSuggestedAnswerChirho(null)} className="h-6 w-6">
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Dismiss suggestion</span>
                    </Button>
                </AlertTitle>
                <AlertDescription className="mt-1 text-sm whitespace-pre-wrap">
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
                    Use this suggestion
                </Button>
            </Alert>
          )}
          {/* Out of Credits Alert */}
          {noCreditsChirho && personaChirho && ( // Only show if persona is loaded
             <Alert variant="destructive" className="m-4">
                <AlertTitle>Out of Message Credits</AlertTitle>
                <AlertDescription>
                  You've used all your message credits. Please get more to continue chatting with {chatWithNameForHeader}.
                  <Button className="mt-2 w-full" size="sm" onClick={() => setIsBuyCreditsDialogOpenChirho(true)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Get More Credits
                  </Button>
                </AlertDescription>
             </Alert>
          )}
          {/* Message Input Area */}
          <div className="border-t p-4 bg-background/50">
            <div className="flex items-end gap-2">
              <Textarea
                value={userInputChirho}
                onChange={(eChirho) => setUserInputChirho(eChirho.target.value)}
                placeholder={isLoadingPersonaChirho || !personaChirho ? "Loading persona..." : (noCreditsChirho ? "Out of credits. Get more to continue." :`Message ${messagePlaceholderName}...`)}
                className="flex-grow resize-none"
                rows={2}
                onKeyDown={(eChirho) => {
                  if (eChirho.key === 'Enter' && !eChirho.shiftKey && !noCreditsChirho) {
                    eChirho.preventDefault();
                    handleSendMessageChirho();
                  }
                }}
                disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho || noCreditsChirho}
              />
              <div className="flex flex-col gap-1">
                <Button
                  onClick={handleSuggestAnswerChirho}
                  disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho || messagesChirho.filter(mChirho=>mChirho.sender==='persona').length === 0 || noCreditsChirho}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  title="Suggest an answer"
                >
                  {isFetchingSuggestionChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-1">Suggest</span>
                </Button>
                <Button onClick={handleSendMessageChirho} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !userInputChirho.trim() || !personaChirho || noCreditsChirho} className="w-full">
                  {(isSendingMessageChirho || isUpdatingImageChirho) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-1">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Popup Dialog (Dynamically Imported) */}
      <DynamicImagePopupDialogChirho
        isOpenChirho={isImagePopupOpenChirho}
        onCloseChirho={() => setIsImagePopupOpenChirho(false)}
        imageUrlChirho={imagePopupUrlChirho}
      />

    </div>
  );
}
