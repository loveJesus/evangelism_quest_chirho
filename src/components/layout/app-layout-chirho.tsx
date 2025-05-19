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
import { Church, PanelLeft } from "lucide-react";
import { useIsMobileChirho } from "@/hooks/use-mobile-chirho";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomizationChirho } from "@/contexts/customization-context-chirho";

const pageTitlesChirho: { [key: string]: string } = {
  "/": "AI Evangelism Game Chirho",
  "/ai-personas-chirho": "AI Evangelism Game Chirho", 
  "/contextual-guidance-chirho": "Contextual Guidance Chirho",
  "/daily-inspiration-chirho": "Daily Inspiration Chirho",
  "/settings-chirho": "Settings Chirho",
};

export function AppLayoutChirho({ children }: { children: ReactNode }) {
  const isMobileChirho = useIsMobileChirho();
  const pathnameChirho = usePathname();
  const { effectiveThemeChirho } = useCustomizationChirho(); 

  const currentPageTitleChirho = pageTitlesChirho[pathnameChirho] || "FaithForward Chirho";

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
            <span className="group-data-[collapsible=icon]:hidden">FaithForward Chirho</span>
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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          {isMobileChirho && (
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
          )}
          <h1 className="text-xl font-semibold">{currentPageTitleChirho}</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
