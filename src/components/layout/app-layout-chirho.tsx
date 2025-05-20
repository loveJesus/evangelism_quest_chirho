// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"; 
import { SidebarNavChirho } from "./sidebar-nav-chirho";
import { Button } from "@/components/ui/button";
import { Church, PanelLeft, UserCircle, LogOut, CreditCard, Loader2, Gamepad2 } from "lucide-react";
import { useIsMobileChirho } from "@/hooks/use-mobile-chirho";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useCustomizationChirho } from "@/contexts/customization-context-chirho";
import { useAuthChirho } from "@/contexts/auth-context-chirho";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import type { DictionaryChirho } from '@/lib/dictionary-types-chirho'; // Updated import

interface AppLayoutPropsChirho {
  children: ReactNode;
  lang: string;
  dictionary: DictionaryChirho['siteNav']; 
  appName: string;
}

const PROTECTED_ROUTES_CHIRHO = ["/ai-personas-chirho", "/contextual-guidance-chirho", "/settings-chirho"];

export function AppLayoutChirho({ children, lang, dictionary, appName }: AppLayoutPropsChirho) {
  const isMobileChirho = useIsMobileChirho();
  const pathnameWithLocale = usePathname(); 
  const pathnameChirho = pathnameWithLocale.replace(`/${lang}`, "") || "/"; 
  
  const { effectiveThemeChirho } = useCustomizationChirho(); 
  const { currentUserChirho, userProfileChirho, logOutChirho, loadingAuthChirho, routerChirho } = useAuthChirho();

  let currentPageTitleChirho = appName; 
  if (pathnameChirho === "/ai-personas-chirho") currentPageTitleChirho = dictionary.evangelismQuest;
  else if (pathnameChirho === "/contextual-guidance-chirho") currentPageTitleChirho = dictionary.contextualGuidance;
  else if (pathnameChirho === "/daily-inspiration-chirho") currentPageTitleChirho = dictionary.dailyInspiration;
  else if (pathnameChirho === "/settings-chirho") currentPageTitleChirho = dictionary.settings;
  else if (pathnameChirho === "/") currentPageTitleChirho = dictionary.home; 

  if (pathnameChirho === '/login-chirho' || pathnameChirho === '/') {
    return <>{children}</>;
  }

  if (loadingAuthChirho) {
    return (
      <div className="fixed inset-0 flex items-center justify-center h-screen w-screen bg-background text-foreground z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">{dictionary.loading}</p>
        </div>
      </div>
    );
  }
  
  if (!currentUserChirho && PROTECTED_ROUTES_CHIRHO.includes(pathnameChirho)) {
    // The page component (e.g., AIPersonasPageChirho) will handle the actual redirect
    // and can show its own "Redirecting..." message. This layout just renders its children.
    // If children are null due to page's early return, nothing from children is shown.
    return (
      <div className="fixed inset-0 flex items-center justify-center h-screen w-screen bg-background text-foreground z-50" style={{ display: 'none' }}>
         {children}
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={!isMobileChirho} open={!isMobileChirho}>
      <Sidebar
        variant="sidebar"
        collapsible={isMobileChirho ? "offcanvas" : "icon"}
        className="shadow-lg"
      >
        <SidebarHeader className="p-4 items-center justify-between">
          <Link href={`/${lang}/`} className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Church className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden">{appName}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavChirho lang={lang} dictionary={dictionary} />
        </SidebarContent>
        <SidebarFooter className="p-2">
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4" style={{'--header-height': '72px'} as React.CSSProperties}>
          <div className="flex items-center gap-4">
            {isMobileChirho && (
              <SidebarTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SidebarTrigger>
            )}
            <h1 className="text-xl font-semibold">{currentPageTitleChirho}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUserChirho && userProfileChirho ? ( 
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>{userProfileChirho.credits}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      {currentUserChirho.photoURL ? (
                        <Image src={currentUserChirho.photoURL} alt="User avatar" width={28} height={28} className="rounded-full" />
                      ) : (
                        <UserCircle className="h-5 w-5" />
                      )}
                      <span className="sr-only">User Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{dictionary.userMenuLabel || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuItem disabled className="text-xs">
                      {currentUserChirho.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => routerChirho && routerChirho.push(`/${lang}/ai-personas-chirho`)}>
                      {dictionary.evangelismQuest}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => routerChirho && routerChirho.push(`/${lang}/settings-chirho`)}>
                      {dictionary.settings}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Manage Subscription - Placeholder. This would lead to your payment provider's customer portal or a custom subscription management page.")}>
                      {dictionary.userMenuManageSubscription || "Manage Subscription"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOutChirho}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {dictionary.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              pathnameChirho !== '/login-chirho' && ( 
                 <Button asChild variant="outline" size="sm">
                   <Link href={`/${lang}/login-chirho`}>{dictionary.loginSignup}</Link>
                 </Button>
              )
            ) 
            } 
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
