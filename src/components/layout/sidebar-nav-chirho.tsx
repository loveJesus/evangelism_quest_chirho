
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Sun, Settings, Icon, Gamepad2 } from "lucide-react"; 
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; 
import { cn } from "@/lib/utils-chirho"; 

interface NavItemChirho {
  href: string;
  label: string;
  icon: Icon; 
  soon?: boolean;
}

const navItemsChirho: NavItemChirho[] = [
  { href: "/ai-personas-chirho", label: "AI Evangelism Game", icon: Gamepad2 }, 
  { href: "/contextual-guidance-chirho", label: "Contextual Guidance", icon: Lightbulb },
  { href: "/daily-inspiration-chirho", label: "Daily Inspiration", icon: Sun },
  { href: "/settings-chirho", label: "Settings", icon: Settings },
];

export function SidebarNavChirho() {
  const pathnameChirho = usePathname();

  return (
    <SidebarMenu>
      {navItemsChirho.map((itemChirho) => (
        <SidebarMenuItem key={itemChirho.href}>
          <Link href={itemChirho.href} passHref legacyBehavior>
            <SidebarMenuButton
              className={cn(
                "w-full justify-start",
                 itemChirho.soon && "cursor-not-allowed opacity-50"
              )}
              isActive={pathnameChirho === itemChirho.href || (itemChirho.href === "/ai-personas-chirho" && pathnameChirho === "/")}
              tooltip={itemChirho.label}
              disabled={itemChirho.soon}
              aria-disabled={itemChirho.soon}
            >
              <itemChirho.icon className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">{itemChirho.label}{itemChirho.soon && " (Soon)"}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
