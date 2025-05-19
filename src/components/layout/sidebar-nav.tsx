
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Lightbulb, Sun, Settings, Icon } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  soon?: boolean;
}

const navItems: NavItem[] = [
  { href: "/ai-personas", label: "AI Personas", icon: Users },
  { href: "/contextual-guidance", label: "Contextual Guidance", icon: Lightbulb },
  { href: "/daily-inspiration", label: "Daily Inspiration", icon: Sun },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              className={cn(
                "w-full justify-start",
                 item.soon && "cursor-not-allowed opacity-50"
              )}
              isActive={pathname === item.href || (item.href === "/ai-personas" && pathname === "/")}
              tooltip={item.label}
              disabled={item.soon}
              aria-disabled={item.soon}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}{item.soon && " (Soon)"}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
