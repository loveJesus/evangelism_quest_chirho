
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { generateNewPersonaChirho, sendMessageToPersonaChirho, updatePersonaImageChirho, fetchSuggestedResponseChirho } from "@/lib/actions";
import type { GenerateAiPersonaOutputChirho, GenerateAiPersonaInputChirho } from "@/ai/flows/generate-ai-persona";
import type { AIPersonaConvincingOutputChirho, AIPersonaConvincingInputChirho } from "@/ai/flows/ai-persona-convincing";
import type { UpdatePersonaVisualsInputChirho, UpdatePersonaVisualsOutputChirho } from "@/ai/flows/update-persona-visuals";
import type { SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai/flows/suggest-evangelistic-response";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2, Info, Lightbulb, XCircle, History, ArrowLeft, Eye } from "lucide-react"; // Added Eye
import { useToastChirho } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const DynamicImagePopupDialogChirho = dynamic(() => import('@/components/image-popup-dialog-chirho.tsx').then(mod => mod.ImagePopupDialogChirho), { ssr: false });

interface MessageChirho {
  sender: "user" | "persona";
  text: string;
  id: string;
  imageUrlChirho?: string | null;
}

interface ArchivedConversationChirho {
  id: string;
  timestamp: number;
  personaNameChirho: string;
  initialPersonaImageChirho: string;
  meetingContextChirho: string;
  personaDetailsChirho: string;
  difficultyLevelChirho: number;
  messagesChirho: MessageChirho[];
  convincedChirho: boolean;
}

const MAX_ARCHIVED_CONVERSATIONS_CHIRHO = 10;
const LOCAL_STORAGE_HISTORY_KEY_CHIRHO = 'faithforward-conversationHistoryChirho';

export default function AIPersonasPageChirho() {
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
  
  const [imagePopupUrlChirho, setImagePopupUrlChirho] = useState<string | null>(null);
  const [isImagePopupOpenChirho, setIsImagePopupOpenChirho] = useState<boolean>(false);

  const { toastChirho } = useToastChirho();
  const scrollAreaRefChirho = useRef<HTMLDivElement>(null);
  const archivedChatScrollAreaRefChirho = useRef<HTMLDivElement>(null);
  const justContinuedConversationRef = useRef(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY_CHIRHO);
      if (storedHistory) {
        setArchivedConversationsChirho(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Error loading conversation history from localStorage:", error);
    }
  }, []);

  const archiveCurrentConversationChirho = useCallback((currentPersona: GenerateAiPersonaOutputChirho, currentMessages: MessageChirho[], convinced: boolean) => {
    if (!currentPersona || currentMessages.length === 0) return;

    const newArchiveEntry: ArchivedConversationChirho = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      personaNameChirho: currentPersona.personaNameChirho,
      initialPersonaImageChirho: currentPersona.personaImageChirho, // Store the base image
      meetingContextChirho: currentPersona.meetingContextChirho,
      personaDetailsChirho: currentPersona.personaDetailsChirho,
      difficultyLevelChirho: difficultyLevelChirho,
      messagesChirho: [...currentMessages], // Ensure all messages, including their specific image URLs, are archived
      convincedChirho: convinced,
    };

    setArchivedConversationsChirho(prevArchivedChirho => {
      const updatedHistory = [newArchiveEntry, ...prevArchivedChirho].slice(0, MAX_ARCHIVED_CONVERSATIONS_CHIRHO);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY_CHIRHO, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving conversation history to localStorage:", error);
        toastChirho({
          variant: "destructive",
          title: "History Save Error",
          description: "Could not save conversation history locally.",
        });
      }
      return updatedHistory;
    });
  }, [difficultyLevelChirho, toastChirho]);

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
            personaImageChirho: conversationToContinue.initialPersonaImageChirho,
        });
        setMessagesChirho([...conversationToContinue.messagesChirho]);
        
        const lastPersonaMessageWithImage = [...conversationToContinue.messagesChirho].filter(m => m.sender === 'persona' && m.imageUrlChirho).pop();
        setDynamicPersonaImageChirho(lastPersonaMessageWithImage?.imageUrlChirho || conversationToContinue.initialPersonaImageChirho);
        
        setDifficultyLevelChirho(conversationToContinue.difficultyLevelChirho);
        justContinuedConversationRef.current = true; // Set flag to prevent immediate reload by useEffect

        setUserInputChirho("");
        setSuggestedAnswerChirho(null);
        setIsHistoryDialogOpenChirho(false); 
        setSelectedArchivedConversationChirho(null);
        setIsLoadingPersonaChirho(false);
        toastChirho({
            title: "Conversation Continued",
            description: `Continuing chat with ${conversationToContinue.personaNameChirho}. Scroll up to see previous messages.`,
            duration: 5000,
        });
        return; 
    }

    if (personaChirho && messagesChirho.length > 0) {
      archiveCurrentConversationChirho(personaChirho, messagesChirho, convincedStatusOverride ?? false);
    }

    setIsLoadingPersonaChirho(true);
    setMessagesChirho([]);
    setUserInputChirho("");
    setDynamicPersonaImageChirho(null);
    setSuggestedAnswerChirho(null);
    const personaThemeDescriptionChirho = `A person at difficulty level ${difficultyToLoadChirho}. Their story should be unique, with varied professions, names, and backgrounds.`;
    
    try {
      const resultChirho = await generateNewPersonaChirho({ personaDescriptionChirho: personaThemeDescriptionChirho } as GenerateAiPersonaInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setPersonaChirho(resultChirho.data);
        setDynamicPersonaImageChirho(resultChirho.data.personaImageChirho);
        const initialMessageTextChirho = resultChirho.data.meetingContextChirho
          ? `${resultChirho.data.meetingContextChirho} (You can start the conversation.)`
          : "Hello! I'm ready to talk.";
        setMessagesChirho([{
          sender: "persona",
          text: initialMessageTextChirho,
          id: Date.now().toString(),
          imageUrlChirho: resultChirho.data.personaImageChirho // Initial image for first message
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
  }, [toastChirho, archiveCurrentConversationChirho, personaChirho, messagesChirho]);

  useEffect(() => {
    if (justContinuedConversationRef.current) {
      justContinuedConversationRef.current = false; 
      return;
    }
    // Default behavior: load a new persona if difficulty changes (and not just after continuing)
    // This will also handle the initial load.
    loadNewPersonaChirho(difficultyLevelChirho, false, null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultyLevelChirho]); // loadNewPersonaChirho is stable via useCallback, so not needed here if its own deps are correct.


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
    if (!userInputChirho.trim() || !personaChirho || !dynamicPersonaImageChirho) return;

    const newUserMessageChirho: MessageChirho = { sender: "user", text: userInputChirho, id: Date.now().toString() };
    setMessagesChirho((prevMessagesChirho) => [...prevMessagesChirho, newUserMessageChirho]);
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
        setMessagesChirho((prevMessagesChirho) => [...prevMessagesChirho, newPersonaMessageChirho]);

        if (personaResponseChirho.convincedChirho) {
          toastChirho({
            title: "Persona Convinced!",
            description: `${personaChirho.personaNameChirho || 'The persona'} has come to believe! A new, more challenging persona will now be generated.`,
            duration: 7000,
          });
          archiveCurrentConversationChirho(personaChirho, [...messagesChirho, newUserMessageChirho, newPersonaMessageChirho], true);
          setDifficultyLevelChirho((prevDifficultyChirho) => Math.min(prevDifficultyChirho + 1, 10)); 
        }
      } else {
        toastChirho({
          variant: "destructive",
          title: "Error Getting Response",
          description: resultChirho.error || "Could not get persona's response.",
        });
         setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
      }
    } catch (errorChirho) {
        toastChirho({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while sending the message.",
        });
        setMessagesChirho((prevMessagesChirho) => prevMessagesChirho.filter(mChirho => mChirho.id !== newUserMessageChirho.id));
    }
    setIsSendingMessageChirho(false);
  };

  const handleSuggestAnswerChirho = async () => {
    if (!personaChirho || messagesChirho.length === 0) return;
    const lastPersonaMessageChirho = messagesChirho.filter(mChirho => mChirho.sender === 'persona').pop();
    if (!lastPersonaMessageChirho) return;

    setIsFetchingSuggestionChirho(true);
    setSuggestedAnswerChirho(null);

    const suggestionInputChirho: SuggestEvangelisticResponseInputChirho = {
      personaLastResponseChirho: lastPersonaMessageChirho.text,
      personaNameChirho: personaChirho.personaNameChirho,
    };

    try {
      const resultChirho = await fetchSuggestedResponseChirho(suggestionInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setSuggestedAnswerChirho((resultChirho.data as SuggestEvangelisticResponseOutputChirho).suggestedResponseChirho);
      } else {
        toastChirho({
          variant: "destructive",
          title: "Suggestion Failed",
          description: resultChirho.error || "Could not fetch a suggestion.",
        });
      }
    } catch (errorChirho) {
      toastChirho({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching the suggestion.",
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isLoadingPersonaChirho ? "Loading Persona..." : `AI Persona: ${personaChirho?.personaNameChirho || "Details"}`}
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
                      {selectedArchivedConversationChirho ? `Chat with ${selectedArchivedConversationChirho.personaNameChirho}` : "Conversation History"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedArchivedConversationChirho ? `Conversation from ${new Date(selectedArchivedConversationChirho.timestamp).toLocaleString()}` : "Select a past conversation to view its details."}
                    </DialogDescription>
                  </DialogHeader>
                  {!selectedArchivedConversationChirho ? (
                    <ScrollArea className="flex-grow mt-4">
                      {archivedConversationsChirho.length > 0 ? (
                        <div className="space-y-2">
                          {archivedConversationsChirho.map(chatChirho => (
                            <Button
                              key={chatChirho.id}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => setSelectedArchivedConversationChirho(chatChirho)}
                            >
                              {chatChirho.personaNameChirho} - {new Date(chatChirho.timestamp).toLocaleDateString()} ({chatChirho.convincedChirho ? "Convinced" : "Not Convinced"})
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No conversation history found.</p>
                      )}
                    </ScrollArea>
                  ) : (
                    <div className="flex-grow flex flex-col overflow-hidden">
                      <Button onClick={() => setSelectedArchivedConversationChirho(null)} variant="outline" size="sm" className="mb-2 self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                      </Button>
                      <Card className="mb-2 p-3">
                        <div className="flex items-center gap-3">
                           {selectedArchivedConversationChirho.initialPersonaImageChirho && (
                            <Image
                                src={selectedArchivedConversationChirho.initialPersonaImageChirho}
                                alt={`${selectedArchivedConversationChirho.personaNameChirho} initial`}
                                width={40}
                                height={40}
                                className="rounded-full object-cover cursor-pointer hover:opacity-80"
                                unoptimized={!!(selectedArchivedConversationChirho.initialPersonaImageChirho && selectedArchivedConversationChirho.initialPersonaImageChirho.startsWith('data:image'))}
                                onClick={() => handleImagePopupChirho(selectedArchivedConversationChirho.initialPersonaImageChirho)}
                             />
                           )}
                          <div>
                            <p className="font-semibold">{selectedArchivedConversationChirho.personaNameChirho}</p>
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
                                    className={`bg-accent text-accent-foreground ${msgChirho.imageUrlChirho ? "cursor-pointer hover:opacity-80" : ""}`}
                                    imageUrlChirho={msgChirho.imageUrlChirho || selectedArchivedConversationChirho.initialPersonaImageChirho}
                                    onClick={() => msgChirho.imageUrlChirho && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                    title={msgChirho.imageUrlChirho ? "Click avatar to view image" : ""}
                                >
                                  {!(msgChirho.imageUrlChirho || selectedArchivedConversationChirho.initialPersonaImageChirho) && <Bot className="h-5 w-5" />}
                                </AvatarIconChirho>
                              )}
                               <div
                                className={`max-w-[70%] rounded-lg p-3 shadow relative ${
                                  msgChirho.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                                } ${msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : ""}`}
                                onClick={() => msgChirho.sender === "persona" && msgChirho.imageUrlChirho && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                                title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "Click message to view image" : ""}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                                {msgChirho.sender === "persona" && msgChirho.imageUrlChirho && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={(e) => { e.stopPropagation(); handleImagePopupChirho(msgChirho.imageUrlChirho); }}
                                        title="View image"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                )}
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
                    </div>
                  )}
                   <DialogFooter className="mt-4">
                      {selectedArchivedConversationChirho && (
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
                      )}
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" onClick={() => loadNewPersonaChirho(difficultyLevelChirho, false, null)} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho}>
                {isLoadingPersonaChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="sr-only">New Persona</span>
              </Button>
            </div>
          </CardTitle>
          {!isLoadingPersonaChirho && personaChirho && (
            <CardDescription>Difficulty Level: {difficultyLevelChirho}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingPersonaChirho ? (
            <div className="space-y-4">
              <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mt-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          ) : personaChirho && dynamicPersonaImageChirho ? (
            <>
              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md">
                {dynamicPersonaImageChirho && (
                  <Image
                    src={dynamicPersonaImageChirho}
                    alt={`AI Persona: ${personaChirho.personaNameChirho}`}
                    fill
                    style={{ objectFit: "cover" }}
                    data-ai-hint="portrait person"
                    unoptimized={!!(dynamicPersonaImageChirho && typeof dynamicPersonaImageChirho === 'string' && dynamicPersonaImageChirho.startsWith('data:image'))}
                    key={dynamicPersonaImageChirho} 
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
      </Card>

      <Card className="flex-grow flex flex-col shadow-xl max-h-full">
        <CardHeader>
          <CardTitle>Chat with {personaChirho?.personaNameChirho || "Persona"}</CardTitle>
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
                        onClick={() => msgChirho.imageUrlChirho && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                        title={msgChirho.imageUrlChirho ? "Click avatar to view image" : ""}
                    >
                      {!msgChirho.imageUrlChirho && <Bot className="h-5 w-5" />}
                    </AvatarIconChirho>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow relative ${
                      msgChirho.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    } ${msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "cursor-pointer hover:bg-muted/80" : ""}`}
                     onClick={() => msgChirho.sender === "persona" && msgChirho.imageUrlChirho && handleImagePopupChirho(msgChirho.imageUrlChirho)}
                     title={msgChirho.sender === "persona" && msgChirho.imageUrlChirho ? "Click message to view image" : ""}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msgChirho.text}</p>
                     {msgChirho.sender === "persona" && msgChirho.imageUrlChirho && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); handleImagePopupChirho(msgChirho.imageUrlChirho); }}
                            title="View image"
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                    )}
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
                >
                    Use this suggestion
                </Button>
            </Alert>
          )}
          <div className="border-t p-4 bg-background/50">
            <div className="flex items-end gap-2">
              <Textarea
                value={userInputChirho}
                onChange={(eChirho) => setUserInputChirho(eChirho.target.value)}
                placeholder={isLoadingPersonaChirho || !personaChirho ? "Loading persona..." : `Message ${personaChirho.personaNameChirho}...`}
                className="flex-grow resize-none"
                rows={2}
                onKeyDown={(eChirho) => {
                  if (eChirho.key === 'Enter' && !eChirho.shiftKey) {
                    eChirho.preventDefault();
                    handleSendMessageChirho();
                  }
                }}
                disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho}
              />
              <div className="flex flex-col gap-1">
                <Button
                  onClick={handleSuggestAnswerChirho}
                  disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !personaChirho || messagesChirho.filter(mChirho=>mChirho.sender==='persona').length === 0}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  title="Suggest an answer"
                >
                  {isFetchingSuggestionChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-1">Suggest</span>
                </Button>
                <Button onClick={handleSendMessageChirho} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho || !userInputChirho.trim() || !personaChirho} className="w-full">
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

    