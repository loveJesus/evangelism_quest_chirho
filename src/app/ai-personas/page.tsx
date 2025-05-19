
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generateNewPersona, sendMessageToPersona } from "@/lib/actions";
import type { GenerateAiPersonaOutput, GenerateAiPersonaInput } from "@/ai/flows/generate-ai-persona";
import type { AIPersonaConvincingOutput, AIPersonaConvincingInput } from "@/ai/flows/ai-persona-convincing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  sender: "user" | "persona";
  text: string;
  id: string;
}

export default function AIPersonasPage() {
  const [persona, setPersona] = useState<GenerateAiPersonaOutput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingPersona, setIsLoadingPersona] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadNewPersona = useCallback(async (difficulty: number) => {
    setIsLoadingPersona(true);
    setMessages([]);
    const personaDescription = `A person at difficulty level ${difficulty}. They may have some challenging questions before considering faith. Their life story should reflect this.`;
    const result = await generateNewPersona({ personaDescription } as GenerateAiPersonaInput);
    if (result.success && result.data) {
      setPersona(result.data);
      setMessages([{ sender: "persona", text: "Hello! I'm ready to talk.", id: Date.now().toString() }]);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not load a new persona.",
      });
      setPersona(null); // Clear persona on error
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
    if (!userInput.trim() || !persona) return;

    const newUserMessage: Message = { sender: "user", text: userInput, id: Date.now().toString() };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsSendingMessage(true);

    const input: AIPersonaConvincingInput = {
      difficultyLevel,
      personaDescription: persona.personaDetails,
      message: userInput,
    };

    const result = await sendMessageToPersona(input);
    if (result.success && result.data) {
      const personaResponse = result.data as AIPersonaConvincingOutput;
      const newPersonaMessage: Message = { sender: "persona", text: personaResponse.personaResponse, id: (Date.now() + 1).toString() };
      setMessages((prev) => [...prev, newPersonaMessage]);

      if (personaResponse.convinced) {
        toast({
          title: "Persona Convinced!",
          description: `${persona.personaDetails.split(' ')[0] || 'The persona'} has come to believe! A new, more challenging persona will now be generated.`,
          duration: 5000,
        });
        setDifficultyLevel((prev) => prev + 1);
        // loadNewPersona will be called by useEffect due to difficultyLevel change
      } else if (personaResponse.nextQuestion) {
         const nextQuestionMessage: Message = { sender: "persona", text: `Next question: ${personaResponse.nextQuestion}`, id: (Date.now() + 2).toString() };
         setMessages((prev) => [...prev, nextQuestionMessage]);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not get persona's response.",
      });
      // Add back user message if sending failed
      setMessages((prev) => prev.filter(m => m.id !== newUserMessage.id));
    }
    setIsSendingMessage(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)] max-h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="lg:w-1/3 flex-shrink-0 overflow-y-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            AI Persona
            <Button variant="outline" size="icon" onClick={() => loadNewPersona(difficultyLevel)} disabled={isLoadingPersona}>
              {isLoadingPersona ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">New Persona</span>
            </Button>
          </CardTitle>
          <CardDescription>Difficulty Level: {difficultyLevel}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPersona ? (
            <div className="space-y-4">
              <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          ) : persona ? (
            <>
              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={persona.personaImage}
                  alt="AI Persona"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="portrait person"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">Background Story</h3>
              <ScrollArea className="h-40">
                <p className="text-sm text-muted-foreground">{persona.personaDetails}</p>
              </ScrollArea>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load persona. Please try refreshing.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="flex-grow flex flex-col shadow-xl max-h-full">
        <CardHeader>
          <CardTitle>Chat with Persona</CardTitle>
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
                    <AvatarIcon className="bg-accent text-accent-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarIcon>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border" 
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.sender === "user" && (
                     <AvatarIcon className="bg-secondary text-secondary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarIcon>
                  )}
                </div>
              ))}
              {isSendingMessage && messages[messages.length-1]?.sender === 'user' && (
                 <div className="flex items-end gap-2 justify-start">
                    <AvatarIcon className="bg-accent text-accent-foreground">
                      <Bot className="h-5 w-5" />
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
                placeholder="Type your message..."
                className="flex-grow resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoadingPersona || isSendingMessage || !persona}
              />
              <Button onClick={handleSendMessage} disabled={isLoadingPersona || isSendingMessage || !userInput.trim() || !persona} className="self-end">
                {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AvatarIcon = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${className}`}>
    {children}
  </div>
);
