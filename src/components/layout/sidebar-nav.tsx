
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Lightbulb, Sun, Settings, Icon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Assuming these are ShadCN and should not be suffixed
import { cn } from "@/lib/utils";

interface NavItemChirho {
  href: string;
  label: string;
  icon: Icon; // This is a Lucide type, should not change
  soon?: boolean;
}

const navItemsChirho: NavItemChirho[] = [
  { href: "/ai-personas", label: "Evangelism Simulator", icon: Users },
  { href: "/contextual-guidance", label: "Contextual Guidance", icon: Lightbulb },
  { href: "/daily-inspiration", label: "Daily Inspiration", icon: Sun },
  { href: "/settings", label: "Settings", icon: Settings },
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
              isActive={pathnameChirho === itemChirho.href || (itemChirho.href === "/ai-personas" && pathnameChirho === "/")}
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

