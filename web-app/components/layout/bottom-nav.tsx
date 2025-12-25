"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Parties",
    href: "/parties",
    icon: Users,
  },
  {
    title: "Items",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
];

interface QuickAction {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: "New Invoice",
    href: "/invoices/new",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    title: "Add Party",
    href: "/parties/new",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Add Item",
    href: "/inventory/new",
    icon: Package,
    color: "bg-purple-500",
  },
  {
    title: "Record Payment",
    href: "/payments/new",
    icon: CreditCard,
    color: "bg-orange-500",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showQuickActions, setShowQuickActions] = React.useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* FAB Trigger */}
          <Sheet open={showQuickActions} onOpenChange={setShowQuickActions}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg -mt-6 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-6 w-6" />
                <span className="sr-only">Quick Actions</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader className="text-left">
                <SheetTitle>Quick Actions</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4 py-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setShowQuickActions(false)}
                      className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center text-white",
                          action.color
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">{action.title}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
