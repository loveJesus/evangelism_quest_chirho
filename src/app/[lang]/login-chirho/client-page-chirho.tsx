// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthChirho } from '@/contexts/auth-context-chirho';
import { useRouter } from 'next/navigation'; 
import { Loader2, ArrowLeft } from 'lucide-react';
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; 

const loginSchemaChirho = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormValuesChirho = z.infer<typeof loginSchemaChirho>;

const signupSchemaChirho = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, {message: "Password must be at least 6 characters."})
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});
type SignupFormValuesChirho = z.infer<typeof signupSchemaChirho>;

interface LoginClientPagePropsChirho {
  dictionary: DictionaryChirho;
  lang: string;
}

export default function LoginClientPageChirho({ dictionary: fullDictionary, lang }: LoginClientPagePropsChirho) { 
  const dictionary = fullDictionary.loginPage;
  const { currentUserChirho, logInWithGoogleChirho, logInWithEmailChirho, signUpWithEmailChirho, loadingAuthChirho } = useAuthChirho();
  const routerChirho = useRouter();
  const [isSubmittingChirho, setIsSubmittingChirho] = useState(false);

  const loginForm = useForm<LoginFormValuesChirho>({
    resolver: zodResolver(loginSchemaChirho),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValuesChirho>({
    resolver: zodResolver(signupSchemaChirho),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (currentUserChirho) {
      routerChirho.push(`/${lang}/ai-personas-chirho`);
    }
  }, [currentUserChirho, routerChirho, lang]);

  const handleGoogleSignInChirho = async () => {
    setIsSubmittingChirho(true);
    await logInWithGoogleChirho();
    setIsSubmittingChirho(false);
  };

  const onLoginSubmitChirho: SubmitHandler<LoginFormValuesChirho> = async (data) => {
    setIsSubmittingChirho(true);
    await logInWithEmailChirho(data.email, data.password);
    setIsSubmittingChirho(false);
  };

  const onSignupSubmitChirho: SubmitHandler<SignupFormValuesChirho> = async (data) => {
    setIsSubmittingChirho(true);
    await signUpWithEmailChirho(data.email, data.password);
    setIsSubmittingChirho(false);
  };

  if (loadingAuthChirho && !isSubmittingChirho || !dictionary) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
   if (currentUserChirho) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting...</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl relative">
         <Link href={`/${lang}/`} passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {dictionary.backToHome}
            </Button>
          </Link>
        <CardHeader className="text-center pt-16">
          <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{dictionary.loginTab}</TabsTrigger>
              <TabsTrigger value="signup">{dictionary.signupTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmitChirho)} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email">{dictionary.emailLabel}</Label>
                  <Input id="login-email" type="email" placeholder={dictionary.emailPlaceholder} {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">{dictionary.passwordLabel}</Label>
                  <Input id="login-password" type="password" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingChirho || loadingAuthChirho}>
                  {isSubmittingChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : dictionary.loginButton}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signupForm.handleSubmit(onSignupSubmitChirho)} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="signup-email">{dictionary.emailLabel}</Label>
                  <Input id="signup-email" type="email" placeholder={dictionary.emailPlaceholder} {...signupForm.register("email")} />
                  {signupForm.formState.errors.email && <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">{dictionary.passwordLabel}</Label>
                  <Input id="signup-password" type="password" {...signupForm.register("password")} />
                  {signupForm.formState.errors.password && <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>}
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="signup-confirm-password">{dictionary.confirmPasswordLabel}</Label>
                  <Input id="signup-confirm-password" type="password" {...signupForm.register("confirmPassword")} />
                  {signupForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingChirho || loadingAuthChirho}>
                  {isSubmittingChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : dictionary.signupButton}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {dictionary.orContinueWith}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignInChirho} disabled={isSubmittingChirho || loadingAuthChirho}>
              {isSubmittingChirho || loadingAuthChirho ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              }
              {dictionary.googleButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
