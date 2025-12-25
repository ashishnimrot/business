"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumbs } from "./breadcrumbs";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="md:pl-64 transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className={cn("p-4 md:p-6", className)}>
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
