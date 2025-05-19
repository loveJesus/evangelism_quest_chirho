// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchContextualGuidanceChirho } from "@/lib/actions-chirho"; 
import type { ContextualGuidanceOutputChirho } from "@/ai-chirho/flows-chirho/contextual-guidance-chirho"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToastChirho } from "@/hooks/use-toast-chirho"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, BookOpen, Copy, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchemaChirho = z.object({
  topicChirho: z.string().min(3, "Topic must be at least 3 characters long.").max(100, "Topic must be at most 100 characters long."),
});

type FormValuesChirho = z.infer<typeof formSchemaChirho>;

export default function ContextualGuidancePage() { // Renamed component
  const [guidanceChirho, setGuidanceChirho] = useState<ContextualGuidanceOutputChirho | null>(null);
  const [isLoadingChirho, setIsLoadingChirho] = useState(false);
  const [errorChirho, setErrorChirho] = useState<string | null>(null);
  const { toastChirho } = useToastChirho();

  const formChirho = useForm<FormValuesChirho>({
    resolver: zodResolver(formSchemaChirho),
    defaultValues: {
      topicChirho: "",
    },
  });

  const onSubmitChirho: SubmitHandler<FormValuesChirho> = async (dataChirho) => {
    setIsLoadingChirho(true);
    setErrorChirho(null);
    setGuidanceChirho(null);

    const resultChirho = await fetchContextualGuidanceChirho({ topicChirho: dataChirho.topicChirho });
    if (resultChirho.success && resultChirho.data) {
      setGuidanceChirho(resultChirho.data);
    } else {
      setErrorChirho(resultChirho.error || "Failed to fetch guidance. Please try again.");
      toastChirho({
        variant: "destructive",
        title: "Error",
        description: resultChirho.error || "Failed to fetch guidance.",
      });
    }
    setIsLoadingChirho(false);
  };

  const handleCopyToClipboardChirho = (textChirho: string) => {
    navigator.clipboard.writeText(textChirho)
      .then(() => {
        toastChirho({ title: "Copied!", description: "Content copied to clipboard." });
      })
      .catch(() => {
        toastChirho({ variant: "destructive", title: "Error", description: "Failed to copy content." });
      });
  };
  
  const getShareableTextChirho = () => {
    if (!guidanceChirho) return "";
    let textChirho = `Contextual Guidance on: ${formChirho.getValues("topicChirho")}\n\n`;
    textChirho += "Bible Verses:\n";
    guidanceChirho.bibleVersesChirho.forEach(verseChirho => textChirho += `- ${verseChirho}\n`);
    textChirho += "\nTalking Points:\n";
    guidanceChirho.talkingPointsChirho.forEach(pointChirho => textChirho += `- ${pointChirho}\n`);
    return textChirho;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Contextual Guidance</CardTitle>
          <CardDescription>Enter a topic to receive relevant Bible verses and talking points for evangelism.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formChirho}>
            <form onSubmit={formChirho.handleSubmit(onSubmitChirho)} className="space-y-4">
              <FormField
                control={formChirho.control}
                name="topicChirho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., forgiveness, hope, purpose" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingChirho}>
                {isLoadingChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Get Guidance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {errorChirho && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorChirho}</AlertDescription>
        </Alert>
      )}

      {guidanceChirho && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Guidance for: "{formChirho.getValues("topicChirho")}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Bible Verses
              </h3>
              <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                  {guidanceChirho.bibleVersesChirho.map((verseChirho, indexChirho) => (
                    <li key={indexChirho} className="text-sm">{verseChirho}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                Talking Points
              </h3>
              <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                  {guidanceChirho.talkingPointsChirho.map((pointChirho, indexChirho) => (
                    <li key={indexChirho} className="text-sm">{pointChirho}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Guidance</DialogTitle>
                  <DialogDescription>
                    Copy the text below to share it.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-64 my-4">
                    <pre className="text-sm whitespace-pre-wrap p-2 border rounded-md bg-muted">
                        {getShareableTextChirho()}
                    </pre>
                </ScrollArea>
                <DialogFooter className="sm:justify-start">
                   <Button type="button" onClick={() => handleCopyToClipboardChirho(getShareableTextChirho())}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => handleCopyToClipboardChirho(getShareableTextChirho())}>
              <Copy className="mr-2 h-4 w-4" /> Copy All
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
