// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Lightbulb } from "lucide-react";
import Link from 'next/link';
import { useAuthChirho } from '@/contexts/auth-context-chirho';

export default function LandingPageChirho() {
  const { currentUserChirho } = useAuthChirho();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,100px)-4rem)] p-4 text-center">
      <Card className="w-full max-w-2xl shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cross">
              <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>
            </svg>
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">
            Welcome to Evangelism Quest ☧
          </CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2">
            Sharpen your skills in sharing the Gospel through interactive AI-powered scenarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Practice engaging in meaningful conversations, explore different approaches, and gain confidence in your evangelistic journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg border bg-card/50">
              <Gamepad2 className="h-8 w-8 text-accent mb-2" />
              <h3 className="text-lg font-semibold">Interactive Scenarios</h3>
              <p className="text-sm text-muted-foreground">Chat with AI personas with diverse backgrounds and perspectives.</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/50">
              <Users className="h-8 w-8 text-accent mb-2" />
              <h3 className="text-lg font-semibold">Learn & Grow</h3>
              <p className="text-sm text-muted-foreground">Receive suggestions and biblical guidance to refine your approach.</p>
            </div>
            <div className="p-4 rounded-lg border bg-card/50">
              <Lightbulb className="h-8 w-8 text-accent mb-2" />
              <h3 className="text-lg font-semibold">Build Confidence</h3>
              <p className="text-sm text-muted-foreground">Become better equipped to share your faith effectively and lovingly.</p>
            </div>
          </div>
          <div className="mt-8">
            {!currentUserChirho ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/login-chirho">Login or Sign Up to Begin!</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/ai-personas-chirho">Enter Evangelism Quest</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>"Go therefore and make disciples of all nations..." - Matthew 28:19</p>
        <p>&copy; {new Date().getFullYear()} Faith Forward ☧. All rights reserved.</p>
      </footer>
    </div>
  );
}
