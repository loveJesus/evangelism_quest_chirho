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

const pageTitlesChirho: { [key: string]: string } = {
  "/": "Welcome - Evangelism Quest ☧", // Updated title for landing page
  "/ai-personas-chirho": "Evangelism Quest ☧",
  "/contextual-guidance-chirho": "Contextual Guidance ☧",
  "/daily-inspiration-chirho": "Daily Inspiration ☧",
  "/settings-chirho": "Settings ☧",
  "/login-chirho": "Login / Signup ☧",
};

// Root path '/' is now public. Only /ai-personas-chirho and other specific feature pages are protected.
const PROTECTED_ROUTES_CHIRHO = ["/ai-personas-chirho", "/contextual-guidance-chirho", "/settings-chirho"];


export function AppLayoutChirho({ children }: { children: ReactNode }) {
  const isMobileChirho = useIsMobileChirho();
  const pathnameChirho = usePathname();
  const { effectiveThemeChirho } = useCustomizationChirho(); 
  const { currentUserChirho, userProfileChirho, logOutChirho, loadingAuthChirho, routerChirho } = useAuthChirho();

  const currentPageTitleChirho = pageTitlesChirho[pathnameChirho] || "Faith Forward ☧";

  if (loadingAuthChirho) {
    return (
      <div className="fixed inset-0 flex items-center justify-center h-screen w-screen bg-background text-foreground z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading Application...</p>
        </div>
      </div>
    );
  }

  // Login page bypasses the main layout entirely
  if (pathnameChirho === '/login-chirho') {
    return <>{children}</>;
  }

  // If the user is not authenticated and on a protected route (excluding the new public landing page)
  // The child page (e.g., AIPersonasPageChirho) will handle its own "Redirecting..." message and actual redirect.
  // The AppLayout will render the children hidden to allow their useEffects to run for redirection.
  if (!currentUserChirho && PROTECTED_ROUTES_CHIRHO.includes(pathnameChirho)) {
    return (
        <>
          <div className="fixed inset-0 flex items-center justify-center h-screen w-screen bg-background text-foreground z-50">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg">Redirecting to login...</p>
            </div>
          </div>
          {/* Render children hidden so its useEffect for redirection can run */}
          <div style={{ display: 'none' }}>{children}</div> 
        </>
    );
  }
  
  // Render full layout for authenticated users OR for public pages (like the new landing page)
  return (
    <SidebarProvider defaultOpen={!isMobileChirho} open={!isMobileChirho}>
      <Sidebar
        variant="sidebar"
        collapsible={isMobileChirho ? "offcanvas" : "icon"}
        className="shadow-lg"
      >
        <SidebarHeader className="p-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cross"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
            <span className="group-data-[collapsible=icon]:hidden">Faith Forward ☧</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavChirho />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Optional: Add settings or user profile link here if not in main nav */}
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
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem disabled className="text-xs">
                      {currentUserChirho.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => routerChirho && routerChirho.push('/settings-chirho')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert("Manage Subscription - Placeholder. This would lead to your payment provider's customer portal or a custom subscription management page.")}>
                      Manage Subscription
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logOutChirho}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Show login button if no user and not on login page
              pathnameChirho !== '/login-chirho' && (
                 <Button asChild variant="outline" size="sm">
                   <Link href="/login-chirho">Login / Signup</Link>
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
