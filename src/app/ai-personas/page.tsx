
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateNewPersona, sendMessageToPersona, updatePersonaImage } from "@/lib/actions";
import type { GenerateAiPersonaOutput, GenerateAiPersonaInput } from "@/ai/flows/generate-ai-persona";
import type { AIPersonaConvincingOutput, AIPersonaConvincingInput } from "@/ai/flows/ai-persona-convincing";
import type { UpdatePersonaVisualsInput, UpdatePersonaVisualsOutput } from "@/ai/flows/update-persona-visuals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  sender: "user" | "persona";
  text: string;
  id: string;
}

export default function AIPersonasPage() {
  const [persona, setPersona] = useState<GenerateAiPersonaOutput | null>(null);
  const [dynamicPersonaImage, setDynamicPersonaImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingPersona, setIsLoadingPersona] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadNewPersona = useCallback(async (difficulty: number) => {
    setIsLoadingPersona(true);
    setMessages([]);
    setUserInput("");
    setDynamicPersonaImage(null);
    const personaThemeDescription = `A person at difficulty level ${difficulty}. They might have some challenging questions or life situations. Their story should be unique.`;
    
    try {
      const result = await generateNewPersona({ personaDescription: personaThemeDescription } as GenerateAiPersonaInput);
      if (result.success && result.data) {
        setPersona(result.data);
        setDynamicPersonaImage(result.data.personaImage);
        const initialMessageText = result.data.meetingContext 
          ? `${result.data.meetingContext} (You can start the conversation.)`
          : "Hello! I'm ready to talk.";
        setMessages([{ sender: "persona", text: initialMessageText, id: Date.now().toString() }]);
      } else {
        toast({
          variant: "destructive",
          title: "Error Generating Persona",
          description: result.error || "Could not load a new persona. Please try again.",
        });
        setPersona(null); 
      }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while generating the persona.",
        });
        setPersona(null);
    }
    setIsLoadingPersona(false);
  }, [toast]);

  useEffect(() => {
    loadNewPersona(difficultyLevel);
  }, [loadNewPersona, difficultyLevel]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !persona || !dynamicPersonaImage) return;

    const newUserMessage: Message = { sender: "user", text: userInput, id: Date.now().toString() };
    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = userInput; 
    setUserInput("");
    setIsSendingMessage(true);

    const convincingInput: AIPersonaConvincingInput = {
      difficultyLevel,
      personaDescription: persona.personaDetails, 
      message: currentInput,
    };

    try {
      const result = await sendMessageToPersona(convincingInput);
      if (result.success && result.data) {
        const personaResponse = result.data as AIPersonaConvincingOutput;
        const newPersonaMessage: Message = { sender: "persona", text: personaResponse.personaResponse, id: (Date.now() + 1).toString() };
        setMessages((prev) => [...prev, newPersonaMessage]);

        if (personaResponse.visualContextForNextImage && dynamicPersonaImage) { // ensure dynamicPersonaImage is not null
          setIsUpdatingImage(true);
          const imageUpdateInput: UpdatePersonaVisualsInput = {
            baseImageUri: dynamicPersonaImage, 
            personaName: persona.personaName,
            originalMeetingContext: persona.meetingContext,
            newVisualPrompt: personaResponse.visualContextForNextImage,
          };
          const imageResult = await updatePersonaImage(imageUpdateInput);
          if (imageResult.success && imageResult.data) {
            setDynamicPersonaImage(imageResult.data.updatedImageUri);
          } else {
            toast({
              variant: "destructive",
              title: "Image Update Failed",
              description: imageResult.error || "Could not update the persona's image.",
            });
          }
          setIsUpdatingImage(false);
        }

        if (personaResponse.convinced) {
          toast({
            title: "Persona Convinced!",
            description: `${persona.personaName || 'The persona'} has come to believe! A new, more challenging persona will now be generated.`,
            duration: 7000,
          });
          setDifficultyLevel((prev) => prev + 1);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error Getting Response",
          description: result.error || "Could not get persona's response.",
        });
         setMessages((prev) => prev.filter(m => m.id !== newUserMessage.id)); 
      }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while sending the message.",
        });
        setMessages((prev) => prev.filter(m => m.id !== newUserMessage.id));
    }
    setIsSendingMessage(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {isLoadingPersona ? "Loading Persona..." : `AI Persona: ${persona?.personaName || "Details"}`}
            <Button variant="outline" size="icon" onClick={() => loadNewPersona(difficultyLevel)} disabled={isLoadingPersona || isSendingMessage || isUpdatingImage}>
              {isLoadingPersona ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">New Persona</span>
            </Button>
          </CardTitle>
          {!isLoadingPersona && persona && (
            <CardDescription>Difficulty Level: {difficultyLevel}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingPersona ? (
            <div className="space-y-4">
              <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mt-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          ) : persona && dynamicPersonaImage ? (
            <>
              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md">
                {dynamicPersonaImage && (
                  <Image
                    src={dynamicPersonaImage}
                    alt={`AI Persona: ${persona.personaName}`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="portrait person"
                    unoptimized={dynamicPersonaImage.startsWith('data:image')}
                    key={dynamicPersonaImage} // Force re-render on image change
                  />
                )}
                {isUpdatingImage && (
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
                  {persona.meetingContext}
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
          <CardTitle>Chat with {persona?.personaName || "Persona"}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "persona" && (
                    <AvatarIcon className="bg-accent text-accent-foreground" imageUrl={dynamicPersonaImage}>
                      {!dynamicPersonaImage && <Bot className="h-5 w-5" />}
                    </AvatarIcon>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border" 
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.sender === "user" && (
                     <AvatarIcon className="bg-secondary text-secondary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarIcon>
                  )}
                </div>
              ))}
              {(isSendingMessage || isUpdatingImage) && messages[messages.length-1]?.sender === 'user' && (
                 <div className="flex items-end gap-2 justify-start">
                    <AvatarIcon className="bg-accent text-accent-foreground" imageUrl={dynamicPersonaImage}>
                        {!dynamicPersonaImage && <Bot className="h-5 w-5" />}
                    </AvatarIcon>
                    <div className="max-w-[70%] rounded-lg p-3 shadow bg-card border">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-background/50">
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isLoadingPersona || !persona ? "Loading persona..." : `Message ${persona.personaName}...`}
                className="flex-grow resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoadingPersona || isSendingMessage || isUpdatingImage || !persona}
              />
              <Button onClick={handleSendMessage} disabled={isLoadingPersona || isSendingMessage || isUpdatingImage || !userInput.trim() || !persona} className="self-end">
                {(isSendingMessage || isUpdatingImage) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AvatarIcon = ({ children, className, imageUrl }: { children?: React.ReactNode, className?: string, imageUrl?: string | null }) => (
  <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 overflow-hidden ${className}`}>
    {imageUrl ? (
      <Image src={imageUrl} alt="Persona" width={32} height={32} className="object-cover w-full h-full" unoptimized={imageUrl.startsWith('data:image')} />
    ) : (
      children
    )}
  </div>
);
