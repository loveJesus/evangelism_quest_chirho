// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { useAuthChirho } from '@/contexts/auth-context-chirho';
import { useRouter } from 'next/navigation';
import { 
  generateNewPersonaChirho, 
  sendMessageToPersonaChirho, 
  updatePersonaImageChirho, 
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

const DynamicImagePopupDialogChirho = dynamic(() => import('@/components/image-popup-dialog-chirho.tsx').then(mod => mod.ImagePopupDialogChirho), { ssr: false });

export interface MessageChirho {
  sender: "user" | "persona";
  text: string;
  id: string;
  imageUrlChirho?: string | null; // This will be stripped for Firestore archives
}

export interface ArchivedConversationChirho {
  id: string;
  timestamp: number;
  personaNameChirho: string;
  // initialPersonaImageChirho is NOT stored in Firestore to save space.
  // It can be reconstructed if needed from the first message, or a placeholder used.
  // For simplicity, we'll fetch the persona's *current* image if they continue a chat,
  // or use a placeholder for read-only history.
  initialPersonaImageChirho?: string | null; 
  meetingContextChirho: string;
  personaDetailsChirho: string; 
  personaNameKnownToUserChirho: boolean;
  difficultyLevelChirho: number;
  messagesChirho: MessageChirho[]; // imageUrlChirho will be stripped from these in Firestore
  convincedChirho: boolean;
}


const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;

export default function AIPersonasPageChirho() {
  const { currentUserChirho, userProfileChirho, loadingAuthChirho, updateLocalUserProfileChirho } = useAuthChirho();
  const routerChirho = useRouter();

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
  
  useEffect(() => {
    if (currentUserChirho && !loadingAuthChirho) {
      setIsLoadingHistoryChirho(true);
      fetchArchivedConversationsFromFirestoreChirho(currentUserChirho.uid)
        .then(result => {
          if (result.success && result.data) {
            setArchivedConversationsChirho(result.data);
          } else {
            console.error("Failed to fetch history:", result.error);
            toastChirho({
              variant: "destructive",
              title: "History Load Failed",
              description: result.error || "Could not retrieve your conversation history.",
            });
          }
        })
        .finally(() => setIsLoadingHistoryChirho(false));
    } else if (!currentUserChirho && !loadingAuthChirho) {
      setArchivedConversationsChirho([]); // Clear history if user logs out
    }
  }, [currentUserChirho, loadingAuthChirho, toastChirho]);

  useEffect(() => {
    if (!loadingAuthChirho) {
      if (!currentUserChirho) {
        // Reset state when user logs out or on initial load without a user
        setPersonaChirho(null);
        setMessagesChirho([]);
        setDynamicPersonaImageChirho(null);
        setSuggestedAnswerChirho(null);
        setDifficultyLevelChirho(1);
        setIsLoadingPersonaChirho(true); 
        routerChirho.push('/login-chirho');
      }
    }
  }, [currentUserChirho, loadingAuthChirho, routerChirho]);


  const archiveCurrentConversationChirho = useCallback(async (currentPersona: GenerateAiPersonaOutputChirho, currentMessages: MessageChirho[], convinced: boolean) => {
    if (!currentPersona || currentMessages.length === 0 || !currentUserChirho) return;
    
    const newArchiveEntry: ArchivedConversationChirho = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      personaNameChirho: currentPersona.personaNameChirho,
      // initialPersonaImageChirho: currentPersona.personaImageChirho, // DO NOT STORE - TOO LARGE
      initialPersonaImageChirho: null, // Explicitly set to null for Firestore to avoid size limits
      meetingContextChirho: currentPersona.meetingContextChirho,
      personaDetailsChirho: currentPersona.personaDetailsChirho,
      personaNameKnownToUserChirho: currentPersona.personaNameKnownToUserChirho,
      difficultyLevelChirho: difficultyLevelChirho,
      messagesChirho: [...currentMessages].map(msg => ({ // Strip imageUrlChirho for Firestore
        ...msg,
        imageUrlChirho: undefined 
      })),
      convincedChirho: convinced,
    };

    const result = await archiveConversationToFirestoreChirho(currentUserChirho.uid, newArchiveEntry);
    if (result.success) {
      // Update local state with the entry (which now also lacks the image data for consistency)
      setArchivedConversationsChirho(prev => [newArchiveEntry, ...prev].sort((a,b) => b.timestamp - a.timestamp).slice(0, MAX_ARCHIVED_CONVERSATIONS_CHIRHO));
      toastChirho({
        title: "Conversation Archived",
        description: "Your chat has been saved to your history.",
        duration: 3000
      });
    } else {
      toastChirho({
        variant: "destructive",
        title: "Archive Error",
        description: result.error || "Could not save conversation to Firestore.",
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
        description: result.error || "Could not clear conversation history from Firestore.",
      });
    }
    setIsLoadingHistoryChirho(false);
  };

  const loadNewPersonaChirho = useCallback(async (
    difficultyToLoadChirho: number, 
    convincedStatusOverride?: boolean, 
    conversationToContinue?: ArchivedConversationChirho | null
  ) => {
    if (conversationToContinue) {
        setIsLoadingPersonaChirho(true);
        setPersonaChirho({
            personaNameChirho: conversationToContinue.personaNameChirho,
            personaDetailsChirho: conversationToContinue.personaDetailsChirho,
            meetingContextChirho: conversationToContinue.meetingContextChirho,
            // Since initialPersonaImageChirho is not stored in Firestore archive, we'll need to re-generate an image if needed
            // For now, let's try to use the first image from the original persona generation if available from state, or generate new.
            // This part is tricky without storing the original image.
            // For simplicity in "continuing", we might have to regenerate or use a placeholder here.
            // Let's re-generate a fresh image if continuing an old chat for visual consistency.
            personaImageChirho: "", // This will be set by a new generation below.
            personaNameKnownToUserChirho: conversationToContinue.personaNameKnownToUserChirho,
        });

        // Restore messages - these won't have imageUrlChirho from Firestore
        const restoredMessages = conversationToContinue.messagesChirho.map(msg => ({
            ...msg,
            imageUrlChirho: undefined // Ensure it's undefined as it wasn't stored
        }));
        setMessagesChirho(restoredMessages);
        
        // Re-generate initial image for the continued persona
        const personaThemeDescriptionForContinuedChirho = `Continuing conversation with ${conversationToContinue.personaNameChirho}, who you met because: ${conversationToContinue.meetingContextChirho}. Persona details: ${conversationToContinue.personaDetailsChirho.substring(0,150)}...`;
        try {
            const regenResultChirho = await generateNewPersonaChirho({ personaDescriptionChirho: personaThemeDescriptionForContinuedChirho } as GenerateAiPersonaInputChirho);
            if (regenResultChirho.success && regenResultChirho.data) {
                setPersonaChirho(regenResultChirho.data); // Update persona with new image
                setDynamicPersonaImageChirho(regenResultChirho.data.personaImageChirho);
                 // Add the meeting context as the first message if messages are empty or first one is not meeting context
                if (restoredMessages.length === 0 || restoredMessages[0].text !== regenResultChirho.data.meetingContextChirho) {
                     setMessagesChirho(prev => [{
                        sender: "persona",
                        text: regenResultChirho.data.meetingContextChirho,
                        id: Date.now().toString() + "_continued_context",
                        imageUrlChirho: regenResultChirho.data.personaImageChirho
                    }, ...prev.filter(m => m.id !== Date.now().toString() + "_continued_context")]); // ensure no duplicates if already exists
                } else {
                    // If first message is already context, update its image
                    setMessagesChirho(prev => prev.map((m, idx) => idx === 0 ? {...m, imageUrlChirho: regenResultChirho.data.personaImageChirho} : m));
                }
            } else {
                toastChirho({ variant: "destructive", title: "Image Regen Failed", description: "Could not regenerate image for continued chat."});
                setDynamicPersonaImageChirho(null); // Fallback
            }
        } catch (e) {
             toastChirho({ variant: "destructive", title: "Image Regen Error", description: "Error regenerating image."});
             setDynamicPersonaImageChirho(null);
        }
        
        setDifficultyLevelChirho(conversationToContinue.difficultyLevelChirho);
        justContinuedConversationRef.current = true;

        setUserInputChirho("");
        setSuggestedAnswerChirho(null);
        setIsHistoryDialogOpenChirho(false); 
        setSelectedArchivedConversationChirho(null);
        setIsLoadingPersonaChirho(false);
        toastChirho({
            title: "Conversation Continued",
            description: `Continuing chat with ${conversationToContinue.personaNameKnownToUserChirho ? conversationToContinue.personaNameChirho : 'the person'}. Scroll up to see previous messages.`,
            duration: 5000,
        });
        return; 
    }

    // Archive current conversation (if any) before loading a new one
    if (personaChirho && messagesChirho.length > 1 && currentUserChirho) { 
      await archiveCurrentConversationChirho(personaChirho, messagesChirho, convincedStatusOverride ?? false);
    }

    setIsLoadingPersonaChirho(true);
    setMessagesChirho([]);
    setUserInputChirho("");
    setDynamicPersonaImageChirho(null);
    setSuggestedAnswerChirho(null);
    const personaThemeDescriptionChirho = `A person at difficulty level ${difficultyToLoadChirho}. Their story should be unique.`;
    
    try {
      const resultChirho = await generateNewPersonaChirho({ personaDescriptionChirho: personaThemeDescriptionChirho } as GenerateAiPersonaInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setPersonaChirho(resultChirho.data);
        setDynamicPersonaImageChirho(resultChirho.data.personaImageChirho);
        const initialMessageTextChirho = resultChirho.data.meetingContextChirho
          ? `${resultChirho.data.meetingContextChirho}` // Removed "(You can start the conversation.)" to make it a direct statement
          : "Hello! I'm ready to talk.";
        setMessagesChirho([{
          sender: "persona",
          text: initialMessageTextChirho,
          id: Date.now().toString(),
          imageUrlChirho: resultChirho.data.personaImageChirho 
        }]);
      } else {
        toastChirho({
          variant: "destructive",
          title: "Error Generating Persona",
          description: resultChirho.error || "Could not load a new persona. Please try again.",
        });
        setPersonaChirho(null);
      }
    } catch (errorChirho) {
        toastChirho({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while generating the persona.",
        });
        setPersonaChirho(null);
    }
    setIsLoadingPersonaChirho(false);
  }, [toastChirho, archiveCurrentConversationChirho, currentUserChirho]); // Removed personaChirho, messagesChirho from deps of loadNewPersonaChirho as they caused issues

  useEffect(() => {
    if (!currentUserChirho || loadingAuthChirho) return; 

    if (justContinuedConversationRef.current) {
      justContinuedConversationRef.current = false; 
      return;
    }
    // Load new persona only if no current persona and no messages (fresh start for user)
    if (!personaChirho && messagesChirho.length === 0) { 
        loadNewPersonaChirho(difficultyLevelChirho, false, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultyLevelChirho, currentUserChirho, loadingAuthChirho]); // personaChirho, messagesChirho removed


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
    if (!userInputChirho.trim() || !personaChirho || !dynamicPersonaImageChirho || !currentUserChirho || !userProfileChirho) return;

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
    const currentMessagesSnapshot = [...messagesChirho, newUserMessageChirho]; 
    setMessagesChirho(currentMessagesSnapshot);

    const currentInputChirho = userInputChirho;
    setUserInputChirho("");
    setSuggestedAnswerChirho(null);
    setIsSendingMessageChirho(true);

    let currentDynamicImageForResponse = dynamicPersonaImageChirho; 

    const convincingInputChirho: AIPersonaConvincingInputChirho = {
      difficultyLevelChirho: difficultyLevelChirho,
      personaDescriptionChirho: `${personaChirho.personaNameChirho}: ${personaChirho.personaDetailsChirho}`, 
      messageChirho: currentInputChirho,
    };

    try {
      const resultChirho = await sendMessageToPersonaChirho(convincingInputChirho);
      if (resultChirho.success && resultChirho.data) {
        const personaResponseChirho = resultChirho.data as AIPersonaConvincingOutputChirho;
        
        let imageForPersonaMessage = currentDynamicImageForResponse;

        if (personaResponseChirho.visualContextForNextImageChirho && currentDynamicImageForResponse) {
          console.log("Attempting to update persona image with visual context:", personaResponseChirho.visualContextForNextImageChirho);
          setIsUpdatingImageChirho(true);
          const imageUpdateInputChirho: UpdatePersonaVisualsInputChirho = {
            baseImageUriChirho: currentDynamicImageForResponse, 
            personaNameChirho: personaChirho.personaNameChirho,
            originalMeetingContextChirho: personaChirho.meetingContextChirho,
            newVisualPromptChirho: personaResponseChirho.visualContextForNextImageChirho,
          };
          const imageResultChirho = await updatePersonaImageChirho(imageUpdateInputChirho);
          if (imageResultChirho.success && imageResultChirho.data) {
            setDynamicPersonaImageChirho(imageResultChirho.data.updatedImageUriChirho);
            imageForPersonaMessage = imageResultChirho.data.updatedImageUriChirho;
          } else {
            console.warn("Image update failed, keeping previous image for message. Error:", imageResultChirho.error)
          }
          setIsUpdatingImageChirho(false);
        }

        const newPersonaMessageChirho: MessageChirho = {
          sender: "persona",
          text: personaResponseChirho.personaResponseChirho,
          id: (Date.now() + 1).toString(),
          imageUrlChirho: imageForPersonaMessage 
        };
        const finalMessagesSnapshot = [...currentMessagesSnapshot, newPersonaMessageChirho];
        setMessagesChirho(finalMessagesSnapshot);

        if (personaResponseChirho.convincedChirho) {
          toastChirho({
            title: "Persona Convinced!",
            description: `${personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : 'The person'} has come to believe! A new, more challenging persona will now be generated.`,
            duration: 7000,
          });
          await archiveCurrentConversationChirho(personaChirho, finalMessagesSnapshot, true);
          setDifficultyLevelChirho((prevDifficultyChirho) => Math.min(prevDifficultyChirho + 1, 10)); 
        }
      } else {
        toastChirho({
          variant: "destructive",
          title: "Error Getting Response",
          description: resultChirho.error || "Could not get persona's response.",
        });
         setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
         if(currentUserChirho) { 
            const creditRollback = await addTestCreditsChirho(currentUserChirho.uid, 1);
            if(creditRollback.success && creditRollback.newCredits !== undefined) {
                updateLocalUserProfileChirho({credits: creditRollback.newCredits});
            }
         }
      }
    } catch (errorChirho) {
        toastChirho({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while sending the message.",
        });
        setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
         if(currentUserChirho) { 
            const creditRollback = await addTestCreditsChirho(currentUserChirho.uid, 1);
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
        toastChirho({
            variant: "destructive",
            title: "Cannot Suggest",
            description: "No persona message found to base a suggestion on.",
        });
        return;
    }
    if (!lastPersonaMessageChirho.text?.trim()) {
        toastChirho({
            variant: "destructive",
            title: "Cannot Suggest",
            description: "The last persona message is empty. Cannot base suggestion on an empty message.",
        });
        return;
    }
    
    const actualPersonaName = (personaChirho.personaNameChirho && personaChirho.personaNameChirho.trim() !== "") 
                              ? personaChirho.personaNameChirho 
                              : "Character"; 

    const displayNameForSuggestion = personaChirho.personaNameKnownToUserChirho ? actualPersonaName : "the person";

    setIsFetchingSuggestionChirho(true);
    setSuggestedAnswerChirho(null);

    const suggestionInputChirho: SuggestEvangelisticResponseInputChirho = {
      personaLastResponseChirho: lastPersonaMessageChirho.text,
      personaActualNameForContextChirho: actualPersonaName, 
      personaDisplayNameForUserChirho: displayNameForSuggestion,
      conversationHistoryChirho: messagesChirho.slice(-5).map(m => `${m.sender === 'user' ? 'User' : (personaChirho.personaNameKnownToUserChirho ? actualPersonaName : 'The Person')}: ${m.text}`).join('\n')
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
    setIsSendingMessageChirho(true); 
    const result = await addTestCreditsChirho(currentUserChirho.uid, 1000); 
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


  if (loadingAuthChirho && !currentUserChirho) { 
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!currentUserChirho || !userProfileChirho) {
    // This check should ideally be handled by a higher-order component or router guard
    // For now, just show loading or a redirect message if still not logged in
    return <div className="flex items-center justify-center h-full"><p>Redirecting to login...</p><Loader2 className="h-8 w-8 animate-spin text-primary ml-2" /></div>;
  }


  const personaDisplayNameChirho = personaChirho && personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : "A New Encounter";
  const chatWithNameChirho = personaChirho && personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? personaChirho.personaNameChirho : "the Person";
  const messagePlaceholderNameChirho = personaChirho && personaChirho.personaNameKnownToUserChirho && personaChirho.personaNameChirho ? personaChirho.personaNameChirho : "the person";
  const noCreditsChirho = userProfileChirho.credits <= 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isLoadingPersonaChirho && !personaChirho ? "Loading Persona..." : `AI Persona: ${personaDisplayNameChirho}`}
             <div className="flex gap-2">
              <Dialog open={isHistoryDialogOpenChirho} onOpenChange={(open) => {
                setIsHistoryDialogOpenChirho(open);
                if (!open) setSelectedArchivedConversationChirho(null);
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
                      {selectedArchivedConversationChirho ? `Chat with ${selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : "Person"}` : "Conversation History"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedArchivedConversationChirho ? `Conversation from ${new Date(selectedArchivedConversationChirho.timestamp).toLocaleString()}` : "Select a past conversation to view details, continue, or clear history."}
                    </DialogDescription>
                  </DialogHeader>
                  {!selectedArchivedConversationChirho ? (
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
                                {(chatChirho.personaNameKnownToUserChirho ? chatChirho.personaNameChirho : "A Past Encounter")} - {new Date(chatChirho.timestamp).toLocaleDateString()} ({chatChirho.convincedChirho ? "Convinced" : "Not Convinced"})
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
                    <div className="flex-grow flex flex-col overflow-hidden">
                      <Button onClick={() => setSelectedArchivedConversationChirho(null)} variant="outline" size="sm" className="mb-2 self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                      </Button>
                      <Card className="mb-2 p-3">
                        <div className="flex items-center gap-3">
                           {/* Archived conversations don't store initialPersonaImageChirho in Firestore for size. Use a placeholder or name initial. */}
                           <AvatarIconChirho className="bg-primary text-primary-foreground">
                              {selectedArchivedConversationChirho.personaNameChirho ? selectedArchivedConversationChirho.personaNameChirho.charAt(0).toUpperCase() : <Bot className="h-5 w-5" />}
                            </AvatarIconChirho>
                          <div>
                            <p className="font-semibold">{selectedArchivedConversationChirho.personaNameKnownToUserChirho ? selectedArchivedConversationChirho.personaNameChirho : "A Past Encounter"}</p>
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
                                 <AvatarIconChirho 
                                    className={`bg-accent text-accent-foreground`}
                                    // No image popup for archived messages as imageUrlChirho is stripped from Firestore
                                >
                                   <Bot className="h-5 w-5" />
                                </AvatarIconChirho>
                              )}
                               <div
                                className={`max-w-[70%] rounded-lg p-3 shadow ${
                                  msgChirho.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                              </div>
                              {msgChirho.sender === "user" && (
                                <AvatarIconChirho className="bg-secondary text-secondary-foreground">
                                  <User className="h-5 w-5" />
                                </AvatarIconChirho>
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
            <div className="space-y-4">
              <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mt-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          ) : personaChirho && dynamicPersonaImageChirho ? (
            <>
              <div 
                className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-80"
                onClick={() => handleImagePopupChirho(dynamicPersonaImageChirho)}
                title="Click to enlarge image"
              >
                {dynamicPersonaImageChirho && (
                  <Image
                    src={dynamicPersonaImageChirho}
                    alt={`AI Persona: ${personaChirho.personaNameKnownToUserChirho ? personaChirho.personaNameChirho : "Current Encounter"}`}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint="portrait person"
                    unoptimized={!!(dynamicPersonaImageChirho && typeof dynamicPersonaImageChirho === 'string' && dynamicPersonaImageChirho.startsWith('data:image'))}
                    key={dynamicPersonaImageChirho} 
                    priority={true}
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

      <Card className="flex-grow flex flex-col shadow-xl max-h-full">
        <CardHeader>
          <CardTitle>Chat with {chatWithNameChirho}</CardTitle>
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
                    <AvatarIconChirho 
                        className={`bg-accent text-accent-foreground ${msgChirho.imageUrlChirho ? "cursor-pointer hover:opacity-80" : ""}`} 
                        imageUrlChirho={msgChirho.imageUrlChirho}
                        onClick={() => handleImagePopupChirho(msgChirho.imageUrlChirho)}
                        title={msgChirho.imageUrlChirho ? "Click avatar to view image" : ""}
                    >
                      {!msgChirho.imageUrlChirho && <Bot className="h-5 w-5" />}
                    </AvatarIconChirho>
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
                     <AvatarIconChirho className="bg-secondary text-secondary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarIconChirho>
                  )}
                </div>
              ))}
              {(isSendingMessageChirho || isUpdatingImageChirho) && messagesChirho[messagesChirho.length-1]?.sender === 'user' && (
                 <div className="flex items-end gap-2 justify-start">
                    <AvatarIconChirho className="bg-accent text-accent-foreground" imageUrlChirho={dynamicPersonaImageChirho}>
                        {!dynamicPersonaImageChirho && <Bot className="h-5 w-5" />}
                    </AvatarIconChirho>
                    <div className="max-w-[70%] rounded-lg p-3 shadow bg-card border">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
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
          {noCreditsChirho && personaChirho && (
             <Alert variant="destructive" className="m-4">
                <AlertTitle>Out of Message Credits</AlertTitle>
                <AlertDescription>
                  You've used all your message credits. Please get more to continue chatting with {chatWithNameChirho}.
                  <Button className="mt-2 w-full" size="sm" onClick={() => setIsBuyCreditsDialogOpenChirho(true)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Get More Credits
                  </Button>
                </AlertDescription>
             </Alert>
          )}
          <div className="border-t p-4 bg-background/50">
            <div className="flex items-end gap-2">
              <Textarea
                value={userInputChirho}
                onChange={(eChirho) => setUserInputChirho(eChirho.target.value)}
                placeholder={isLoadingPersonaChirho || !personaChirho ? "Loading persona..." : (noCreditsChirho ? "Out of credits. Get more to continue." :`Message ${messagePlaceholderNameChirho}...`)}
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

      <DynamicImagePopupDialogChirho
        isOpenChirho={isImagePopupOpenChirho}
        onCloseChirho={() => setIsImagePopupOpenChirho(false)}
        imageUrlChirho={imagePopupUrlChirho}
      />

    </div>
  );
}

const AvatarIconChirho = ({ children, className, imageUrlChirho, onClick, title }: { children?: React.ReactNode, className?: string, imageUrlChirho?: string | null, onClick?: () => void, title?: string }) => (
  <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 overflow-hidden ${className}`} onClick={onClick} title={title}>
    {imageUrlChirho && typeof imageUrlChirho === 'string' && imageUrlChirho.startsWith('data:image') ? (
      <Image src={imageUrlChirho} alt="Persona" width={32} height={32} className="object-cover w-full h-full" unoptimized />
    ) : imageUrlChirho && typeof imageUrlChirho === 'string' ? (
       <Image src={imageUrlChirho} alt="Persona" width={32} height={32} className="object-cover w-full h-full" />
    ) : (
      children
    )}
  </div>
);

    