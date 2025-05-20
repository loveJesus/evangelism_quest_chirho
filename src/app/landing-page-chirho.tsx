// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Lightbulb, LogIn, Loader2 } from "lucide-react"; 
import Link from 'next/link';
import { useAuthChirho } from '@/contexts/auth-context-chirho';

export default function LandingPageChirho() {
  const { currentUserChirho, loadingAuthChirho } = useAuthChirho();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4 text-center">
      <header className="absolute top-0 right-0 p-6">
        {!loadingAuthChirho && !currentUserChirho && (
          <Button asChild variant="outline">
            <Link href="/login-chirho">
              <LogIn className="mr-2 h-4 w-4" /> Login / Signup
            </Link>
          </Button>
        )}
        {!loadingAuthChirho && currentUserChirho && (
           <Button asChild variant="default">
            <Link href="/ai-personas-chirho">
              Enter Evangelism Quest
            </Link>
          </Button>
        )}
      </header>
      
      <main className="flex flex-col items-center justify-center flex-1">
        <Card className="w-full max-w-3xl shadow-xl bg-card/90 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-6">
              {/* Updated Christian Cross SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                <path d="M10.5 2V8H4V12H10.5V22H13.5V12H20V8H13.5V2H10.5Z"/>
              </svg>
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Faith Forward ☧
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground mt-2">
              Sharpen your skills in sharing the Gospel through interactive AI-powered scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 mt-4">
            <p className="text-lg text-foreground/80">
              Practice engaging in meaningful conversations, explore different approaches, and gain confidence in your evangelistic journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow">
                <Gamepad2 className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">Interactive Scenarios</h3>
                <p className="text-sm text-muted-foreground mt-1">Chat with AI personas with diverse backgrounds and perspectives.</p>
              </div>
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow">
                <Users className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">Learn & Grow</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive suggestions and biblical guidance to refine your approach.</p>
              </div>
              <div className="p-6 rounded-lg border bg-background/70 hover:shadow-md transition-shadow">
                <Lightbulb className="h-10 w-10 text-accent mb-3" />
                <h3 className="text-xl font-semibold">Build Confidence</h3>
                <p className="text-sm text-muted-foreground mt-1">Become better equipped to share your faith effectively and lovingly.</p>
              </div>
            </div>
            <div className="mt-10">
              {loadingAuthChirho ? (
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground opacity-50 cursor-not-allowed">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
                </Button>
              ) : !currentUserChirho ? (
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
      </main>
       <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>"Go therefore and make disciples of all nations..." - Matthew 28:19</p>
        <p>&copy; {new Date().getFullYear()} Faith Forward ☧. All rights reserved.</p>
      </footer>
    </div>
  );
}
