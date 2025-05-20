// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Sun, Settings, Icon, Gamepad2, LogIn, LogOut, Loader2, Home } from "lucide-react"; 
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; 
import { cn } from "@/lib/utils-chirho.ts"; 
import { useAuthChirho } from "@/contexts/auth-context-chirho";

interface NavItemChirho {
  href: string;
  label: string;
  icon: Icon; 
  soon?: boolean;
  authRequired?: boolean; // True if auth is required, false if public, undefined if shown for both
}

const navItemsChirho: NavItemChirho[] = [
  { href: "/", label: "Home", icon: Home, authRequired: undefined }, // Public landing page
  { href: "/ai-personas-chirho", label: "Evangelism Quest", icon: Gamepad2, authRequired: true }, 
  { href: "/contextual-guidance-chirho", label: "Contextual Guidance", icon: Lightbulb, authRequired: true },
  { href: "/daily-inspiration-chirho", label: "Daily Inspiration", icon: Sun, authRequired: false }, // Public page
  { href: "/settings-chirho", label: "Settings", icon: Settings, authRequired: true },
];

export function SidebarNavChirho() {
  const pathnameChirho = usePathname();
  const { currentUserChirho, logOutChirho, loadingAuthChirho } = useAuthChirho();

  return (
    <SidebarMenu>
      {navItemsChirho.map((itemChirho) => {
        // Hide item if auth is required and no user, or if auth is false (public only) and user exists
        if (itemChirho.authRequired === true && !currentUserChirho && !loadingAuthChirho) {
          return null; 
        }
        if (itemChirho.authRequired === false && currentUserChirho && !loadingAuthChirho) {
            // Optionally hide public-only links when logged in, or show them. For now, show.
            // return null; 
        }

        return (
          <SidebarMenuItem key={itemChirho.href}>
            <Link href={itemChirho.href} passHref legacyBehavior>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-start",
                  itemChirho.soon && "cursor-not-allowed opacity-50"
                )}
                isActive={pathnameChirho === itemChirho.href}
                tooltip={itemChirho.label}
                disabled={itemChirho.soon}
                aria-disabled={itemChirho.soon}
              >
                <itemChirho.icon className="h-5 w-5" />
                <span className="truncate group-data-[collapsible=icon]:hidden">{itemChirho.label}{itemChirho.soon && " (Soon)"}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
      {/* Login/Logout Button */}
      <SidebarMenuItem className="mt-auto pt-2 border-t border-sidebar-border">
        {loadingAuthChirho ? (
           <SidebarMenuButton
              className="w-full justify-start"
              disabled={true}
              tooltip="Loading..."
            >
             <Loader2 className="h-5 w-5 animate-spin"/>
             <span className="truncate group-data-[collapsible=icon]:hidden">Loading...</span>
           </SidebarMenuButton>
        ) : currentUserChirho ? (
          <SidebarMenuButton
            className="w-full justify-start"
            onClick={logOutChirho}
            tooltip="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="truncate group-data-[collapsible=icon]:hidden">Logout</span>
          </SidebarMenuButton>
        ) : (
          <Link href="/login-chirho" passHref legacyBehavior>
            <SidebarMenuButton
              className="w-full justify-start"
              isActive={pathnameChirho === "/login-chirho"}
              tooltip="Login"
            >
              <LogIn className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">Login / Signup</span>
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
