// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // From next/navigation for App Router
import { Lightbulb, Sun, Settings, Icon, Gamepad2, LogIn, LogOut, Loader2, Home } from "lucide-react"; 
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; 
import { cn } from "@/lib/utils-chirho.ts"; 
import { useAuthChirho } from "@/contexts/auth-context-chirho";
import type { DictionaryChirho } from "@/lib/get-dictionary-chirho";

interface NavItemChirho {
  hrefKey: keyof Omit<DictionaryChirho['siteNav'], 'loading'>; // Use keys from dictionary for href labels
  path: string; // The actual path segment without locale
  icon: Icon; 
  soon?: boolean;
  authRequired?: boolean; 
}

interface SidebarNavPropsChirho {
  lang: string;
  dictionary: DictionaryChirho['siteNav'];
}

export function SidebarNavChirho({ lang, dictionary }: SidebarNavPropsChirho) {
  const pathnameWithLocale = usePathname();
  const pathnameChirho = pathnameWithLocale.replace(`/${lang}`, "") || "/";
  const { currentUserChirho, logOutChirho, loadingAuthChirho } = useAuthChirho();

  const navItemsChirho: NavItemChirho[] = [
    { hrefKey: "home", path: "/", icon: Home, authRequired: undefined },
    { hrefKey: "evangelismQuest", path: "/ai-personas-chirho", icon: Gamepad2, authRequired: true }, 
    { hrefKey: "contextualGuidance", path: "/contextual-guidance-chirho", icon: Lightbulb, authRequired: true },
    { hrefKey: "dailyInspiration", path: "/daily-inspiration-chirho", icon: Sun, authRequired: false },
    { hrefKey: "settings", path: "/settings-chirho", icon: Settings, authRequired: true },
  ];

  return (
    <SidebarMenu>
      {navItemsChirho.map((itemChirho) => {
        if (itemChirho.authRequired === true && !currentUserChirho && !loadingAuthChirho) {
          return null; 
        }
        const label = dictionary[itemChirho.hrefKey];
        const href = `/${lang}${itemChirho.path === "/" && lang === "en" ? "" : itemChirho.path}`; // Handle root path slightly differently for default lang if desired, or always prefix

        return (
          <SidebarMenuItem key={itemChirho.path}>
            <Link href={href} passHref legacyBehavior>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-start",
                  itemChirho.soon && "cursor-not-allowed opacity-50"
                )}
                isActive={pathnameChirho === itemChirho.path}
                tooltip={label}
                disabled={itemChirho.soon}
                aria-disabled={itemChirho.soon}
              >
                <itemChirho.icon className="h-5 w-5" />
                <span className="truncate group-data-[collapsible=icon]:hidden">{label}{itemChirho.soon && " (Soon)"}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
      <SidebarMenuItem className="mt-auto pt-2 border-t border-sidebar-border">
        {loadingAuthChirho ? (
           <SidebarMenuButton
              className="w-full justify-start"
              disabled={true}
              tooltip={dictionary.loading}
            >
             <Loader2 className="h-5 w-5 animate-spin"/>
             <span className="truncate group-data-[collapsible=icon]:hidden">{dictionary.loading}</span>
           </SidebarMenuButton>
        ) : currentUserChirho ? (
          <SidebarMenuButton
            className="w-full justify-start"
            onClick={logOutChirho}
            tooltip={dictionary.logout}
          >
            <LogOut className="h-5 w-5" />
            <span className="truncate group-data-[collapsible=icon]:hidden">{dictionary.logout}</span>
          </SidebarMenuButton>
        ) : (
          <Link href={`/${lang}/login-chirho`} passHref legacyBehavior>
            <SidebarMenuButton
              className="w-full justify-start"
              isActive={pathnameChirho === "/login-chirho"}
              tooltip={dictionary.loginSignup}
            >
              <LogIn className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">{dictionary.loginSignup}</span>
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
