// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect } from "react";
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
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho';

const formSchemaChirho = z.object({
  topicChirho: z.string().min(3, "Topic must be at least 3 characters long.").max(100, "Topic must be at most 100 characters long."),
});

type FormValuesChirho = z.infer<typeof formSchemaChirho>;

interface ContextualGuidanceClientPagePropsChirho {
  dictionary: DictionaryChirho['contextualGuidancePage'];
  lang: string;
}

export default function ContextualGuidanceClientPageChirho({ dictionary, lang }: ContextualGuidanceClientPagePropsChirho) {
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

    const resultChirho = await fetchContextualGuidanceChirho({ topicChirho: dataChirho.topicChirho, languageChirho: lang });
    if (resultChirho.success && resultChirho.data) {
      setGuidanceChirho(resultChirho.data);
    } else {
      const errorMsg = resultChirho.error || (dictionary?.errorAlertDescription || "Failed to fetch guidance. Please try again.");
      setErrorChirho(errorMsg);
      toastChirho({
        variant: "destructive",
        title: dictionary?.errorAlertTitle || "Error",
        description: errorMsg,
      });
    }
    setIsLoadingChirho(false);
  };

  const handleCopyToClipboardChirho = (textChirho: string) => {
    navigator.clipboard.writeText(textChirho)
      .then(() => {
        toastChirho({ title: dictionary?.copiedToastTitle || "Copied!", description: dictionary?.copiedToastDescription || "Content copied to clipboard." });
      })
      .catch(() => {
        toastChirho({ variant: "destructive", title: dictionary?.copyErrorToastTitle || "Error", description: dictionary?.copyErrorToastDescription || "Failed to copy content." });
      });
  };
  
  const getShareableTextChirho = () => {
    if (!guidanceChirho || !dictionary) return "";
    let textChirho = `${dictionary.guidanceForTitle.replace('{topic}', formChirho.getValues("topicChirho"))}\n\n`;
    textChirho += `${dictionary.bibleVersesTitle}:\n`;
    guidanceChirho.bibleVersesChirho.forEach(verseChirho => textChirho += `- ${verseChirho}\n`);
    textChirho += `\n${dictionary.talkingPointsTitle}:\n`;
    guidanceChirho.talkingPointsChirho.forEach(pointChirho => textChirho += `- ${pointChirho}\n`);
    return textChirho;
  };

  if (!dictionary) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  // Update form validation messages based on dictionary
  useEffect(() => {
    formSchemaChirho.refine(data => data.topicChirho.length >= 3, {
      message: dictionary.topicMinLengthError || "Topic must be at least 3 characters long.",
      path: ['topicChirho'],
    }).refine(data => data.topicChirho.length <= 100, {
      message: dictionary.topicMaxLengthError || "Topic must be at most 100 characters long.",
      path: ['topicChirho'],
    });
  }, [dictionary]);


  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formChirho}>
            <form onSubmit={formChirho.handleSubmit(onSubmitChirho)} className="space-y-4">
              <FormField
                control={formChirho.control}
                name="topicChirho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.topicLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={dictionary.topicPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingChirho}>
                {isLoadingChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                {dictionary.getGuidanceButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {errorChirho && (
        <Alert variant="destructive">
          <AlertTitle>{dictionary.errorAlertTitle}</AlertTitle>
          <AlertDescription>{errorChirho}</AlertDescription>
        </Alert>
      )}

      {guidanceChirho && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{dictionary.guidanceForTitle.replace('{topic}', formChirho.getValues("topicChirho"))}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                {dictionary.bibleVersesTitle}
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
                {dictionary.talkingPointsTitle}
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
                  <Share2 className="mr-2 h-4 w-4" /> {dictionary.shareButton}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{dictionary.shareDialogTitle}</DialogTitle>
                  <DialogDescription>
                    {dictionary.shareDialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-64 my-4">
                    <pre className="text-sm whitespace-pre-wrap p-2 border rounded-md bg-muted">
                        {getShareableTextChirho()}
                    </pre>
                </ScrollArea>
                <DialogFooter className="sm:justify-start">
                   <Button type="button" onClick={() => handleCopyToClipboardChirho(getShareableTextChirho())}>
                    <Copy className="mr-2 h-4 w-4" /> {dictionary.copyTextButton}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => handleCopyToClipboardChirho(getShareableTextChirho())}>
              <Copy className="mr-2 h-4 w-4" /> {dictionary.copyAllButton}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
