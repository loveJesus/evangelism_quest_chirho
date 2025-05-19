
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
import { SidebarNav } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { Church, PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomization } from "@/contexts/customization-context"; // For page title

const pageTitles: { [key: string]: string } = {
  "/": "AI Personas",
  "/ai-personas": "AI Personas",
  "/contextual-guidance": "Contextual Guidance",
  "/daily-inspiration": "Daily Inspiration",
  "/settings": "Settings",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { effectiveTheme } = useCustomization(); // To pass theme to sidebar if needed, or for header styling

  const currentPageTitle = pageTitles[pathname] || "FaithForward";

  return (
    <SidebarProvider defaultOpen={!isMobile} open={!isMobile}>
      <Sidebar
        variant="sidebar"
        collapsible={isMobile ? "offcanvas" : "icon"}
        className="shadow-lg"
      >
        <SidebarHeader className="p-4 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground hover:text-sidebar-primary transition-colors">
            <Church className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden">FaithForward</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Optional: Add settings or user profile link here if not in main nav */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          {isMobile && (
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
          )}
          <h1 className="text-xl font-semibold">{currentPageTitle}</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
