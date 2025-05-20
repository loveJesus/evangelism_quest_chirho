
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
  "/": "Evangelism Quest ☧", 
  "/ai-personas-chirho": "Evangelism Quest ☧",
  "/contextual-guidance-chirho": "Contextual Guidance ☧",
  "/daily-inspiration-chirho": "Daily Inspiration ☧",
  "/settings-chirho": "Settings ☧",
  "/login-chirho": "Login / Signup ☧",
};

const PROTECTED_ROUTES_CHIRHO = ["/", "/ai-personas-chirho", "/contextual-guidance-chirho", "/settings-chirho"];


export function AppLayoutChirho({ children }: { children: ReactNode }) {
  const isMobileChirho = useIsMobileChirho();
  const pathnameChirho = usePathname();
  const { effectiveThemeChirho } = useCustomizationChirho(); 
  const { currentUserChirho, userProfileChirho, logOutChirho, loadingAuthChirho, routerChirho } = useAuthChirho();

  const currentPageTitleChirho = pageTitlesChirho[pathnameChirho] || "Faith Forward ☧";

  if (loadingAuthChirho) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Login page bypasses the main layout entirely
  if (pathnameChirho === '/login-chirho') {
    return <>{children}</>;
  }

  // If the user is authenticated OR if it's a public page that still uses the layout
  // (e.g., /daily-inspiration-chirho), then render the full SidebarProvider layout.
  if (currentUserChirho || !PROTECTED_ROUTES_CHIRHO.includes(pathnameChirho)) {
    return (
      <SidebarProvider defaultOpen={!isMobileChirho} open={!isMobileChirho}>
        <Sidebar
          variant="sidebar"
          collapsible={isMobileChirho ? "offcanvas" : "icon"}
          className="shadow-lg"
        >
          <SidebarHeader className="p-4 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
              <Church className="h-6 w-6" />
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
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
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
              ) : !currentUserChirho && !loadingAuthChirho && !PROTECTED_ROUTES_CHIRHO.includes(pathnameChirho) ? (
                // Show login button only on non-protected pages if logged out and layout is used
                <Button asChild variant="outline" size="sm">
                  <Link href="/login-chirho">Login</Link>
                </Button>
              ) : null 
              } 
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  } else {
    // User is NOT authenticated AND on a PROTECTED route.
    // The child page (e.g., AIPersonasPageChirho) is responsible for rendering its "Redirecting..."
    // message and handling the actual redirect via its useEffect.
    // AppLayout here just renders the children without its own chrome, allowing the page to mount and run effects.
    return <>{children}</>;
  }
}

