
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateNewPersonaChirho, sendMessageToPersonaChirho, updatePersonaImageChirho, fetchSuggestedResponseChirho } from "@/lib/actions";
import type { GenerateAiPersonaOutputChirho, GenerateAiPersonaInputChirho } from "@/ai/flows/generate-ai-persona";
import type { AIPersonaConvincingOutputChirho, AIPersonaConvincingInputChirho } from "@/ai/flows/ai-persona-convincing";
import type { UpdatePersonaVisualsInputChirho, UpdatePersonaVisualsOutputChirho } from "@/ai/flows/update-persona-visuals";
import type { SuggestEvangelisticResponseInputChirho, SuggestEvangelisticResponseOutputChirho } from "@/ai/flows/suggest-evangelistic-response";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2, Info, Lightbulb, XCircle } from "lucide-react";
import { useToastChirho } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MessageChirho {
  sender: "user" | "persona";
  text: string;
  id: string;
}

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

  const { toastChirho } = useToastChirho();
  const scrollAreaRefChirho = useRef<HTMLDivElement>(null);

  const loadNewPersonaChirho = useCallback(async (difficultyChirho: number) => {
    setIsLoadingPersonaChirho(true);
    setMessagesChirho([]);
    setUserInputChirho("");
    setDynamicPersonaImageChirho(null);
    setSuggestedAnswerChirho(null);
    const personaThemeDescriptionChirho = `A person at difficulty level ${difficultyChirho}. Their story should be unique, with varied professions, names, and backgrounds.`;
    
    try {
      const resultChirho = await generateNewPersonaChirho({ personaDescriptionChirho: personaThemeDescriptionChirho } as GenerateAiPersonaInputChirho);
      if (resultChirho.success && resultChirho.data) {
        setPersonaChirho(resultChirho.data);
        setDynamicPersonaImageChirho(resultChirho.data.personaImageChirho);
        const initialMessageTextChirho = resultChirho.data.meetingContextChirho 
          ? `${resultChirho.data.meetingContextChirho} (You can start the conversation.)`
          : "Hello! I'm ready to talk.";
        setMessagesChirho([{ sender: "persona", text: initialMessageTextChirho, id: Date.now().toString() }]);
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
  }, [toastChirho]);

  useEffect(() => {
    loadNewPersonaChirho(difficultyLevelChirho);
  }, [loadNewPersonaChirho, difficultyLevelChirho]);

  useEffect(() => {
    if (scrollAreaRefChirho.current) {
      const scrollElementChirho = scrollAreaRefChirho.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElementChirho) {
        scrollElementChirho.scrollTop = scrollElementChirho.scrollHeight;
      }
    }
  }, [messagesChirho, suggestedAnswerChirho]); 

  const handleSendMessageChirho = async () => {
    if (!userInputChirho.trim() || !personaChirho || !dynamicPersonaImageChirho) return;

    const newUserMessageChirho: MessageChirho = { sender: "user", text: userInputChirho, id: Date.now().toString() };
    setMessagesChirho((prevMessagesChirho) => [...prevMessagesChirho, newUserMessageChirho]);
    const currentInputChirho = userInputChirho; 
    setUserInputChirho("");
    setSuggestedAnswerChirho(null); 
    setIsSendingMessageChirho(true);

    const convincingInputChirho: AIPersonaConvincingInputChirho = {
      difficultyLevelChirho: difficultyLevelChirho,
      personaDescriptionChirho: personaChirho.personaDetailsChirho, 
      messageChirho: currentInputChirho,
    };

    try {
      const resultChirho = await sendMessageToPersonaChirho(convincingInputChirho);
      if (resultChirho.success && resultChirho.data) {
        const personaResponseChirho = resultChirho.data as AIPersonaConvincingOutputChirho;
        const newPersonaMessageChirho: MessageChirho = { sender: "persona", text: personaResponseChirho.personaResponseChirho, id: (Date.now() + 1).toString() };
        setMessagesChirho((prevMessagesChirho) => [...prevMessagesChirho, newPersonaMessageChirho]);

        if (personaResponseChirho.visualContextForNextImageChirho && dynamicPersonaImageChirho) {
          setIsUpdatingImageChirho(true);
          const imageUpdateInputChirho: UpdatePersonaVisualsInputChirho = {
            baseImageUriChirho: dynamicPersonaImageChirho, 
            personaNameChirho: personaChirho.personaNameChirho,
            originalMeetingContextChirho: personaChirho.meetingContextChirho,
            newVisualPromptChirho: personaResponseChirho.visualContextForNextImageChirho,
          };
          const imageResultChirho = await updatePersonaImageChirho(imageUpdateInputChirho);
          if (imageResultChirho.success && imageResultChirho.data) {
            setDynamicPersonaImageChirho(imageResultChirho.data.updatedImageUriChirho);
          } else {
            toastChirho({
              variant: "destructive",
              title: "Image Update Failed",
              description: imageResultChirho.error || "Could not update the persona's image.",
            });
          }
          setIsUpdatingImageChirho(false);
        }

        if (personaResponseChirho.convincedChirho) {
          toastChirho({
            title: "Persona Convinced!",
            description: `${personaChirho.personaNameChirho || 'The persona'} has come to believe! A new, more challenging persona will now be generated.`,
            duration: 7000,
          });
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
      // conversationHistoryChirho: messagesChirho.slice(-5).map(mChirho => `${mChirho.sender}: ${mChirho.text}`).join('\n') 
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


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isLoadingPersonaChirho ? "Loading Persona..." : `AI Persona: ${personaChirho?.personaNameChirho || "Details"}`}
            <Button variant="outline" size="icon" onClick={() => loadNewPersonaChirho(difficultyLevelChirho)} disabled={isLoadingPersonaChirho || isSendingMessageChirho || isUpdatingImageChirho || isFetchingSuggestionChirho}>
              {isLoadingPersonaChirho ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">New Persona</span>
            </Button>
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
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="portrait person"
                    unoptimized={dynamicPersonaImageChirho.startsWith('data:image')}
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
                    <AvatarIconChirho className="bg-accent text-accent-foreground" imageUrlChirho={dynamicPersonaImageChirho}>
                      {!dynamicPersonaImageChirho && <Bot className="h-5 w-5" />}
                    </AvatarIconChirho>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      msgChirho.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border" 
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
    </div>
  );
}

const AvatarIconChirho = ({ children, className, imageUrlChirho }: { children?: React.ReactNode, className?: string, imageUrlChirho?: string | null }) => (
  <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 overflow-hidden ${className}`}>
    {imageUrlChirho ? (
      <Image src={imageUrlChirho} alt="Persona" width={32} height={32} className="object-cover w-full h-full" unoptimized={imageUrlChirho.startsWith('data:image')} />
    ) : (
      children
    )}
  </div>
);
