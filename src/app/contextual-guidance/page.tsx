
"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchContextualGuidance } from "@/lib/actions";
import type { ContextualGuidanceOutput } from "@/ai/flows/contextual-guidance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long.").max(100, "Topic must be at most 100 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContextualGuidancePage() {
  const [guidance, setGuidance] = useState<ContextualGuidanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGuidance(null);

    const result = await fetchContextualGuidance({ topic: data.topic });
    if (result.success && result.data) {
      setGuidance(result.data);
    } else {
      setError(result.error || "Failed to fetch guidance. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to fetch guidance.",
      });
    }
    setIsLoading(false);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: "Copied!", description: "Content copied to clipboard." });
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Error", description: "Failed to copy content." });
      });
  };
  
  const getShareableText = () => {
    if (!guidance) return "";
    let text = `Contextual Guidance on: ${form.getValues("topic")}\n\n`;
    text += "Bible Verses:\n";
    guidance.bibleVerses.forEach(verse => text += `- ${verse}\n`);
    text += "\nTalking Points:\n";
    guidance.talkingPoints.forEach(point => text += `- ${point}\n`);
    return text;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Contextual Guidance</CardTitle>
          <CardDescription>Enter a topic to receive relevant Bible verses and talking points for evangelism.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Get Guidance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {guidance && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Guidance for: "{form.getValues("topic")}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Bible Verses
              </h3>
              <ScrollArea className="h-48 rounded-md border p-4">
                <ul className="space-y-2">
                  {guidance.bibleVerses.map((verse, index) => (
                    <li key={index} className="text-sm">{verse}</li>
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
                  {guidance.talkingPoints.map((point, index) => (
                    <li key={index} className="text-sm">{point}</li>
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
                        {getShareableText()}
                    </pre>
                </ScrollArea>
                <DialogFooter className="sm:justify-start">
                   <Button type="button" onClick={() => handleCopyToClipboard(getShareableText())}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => handleCopyToClipboard(getShareableText())}>
              <Copy className="mr-2 h-4 w-4" /> Copy All
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
