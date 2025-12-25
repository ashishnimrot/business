"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  invoices: "Invoices",
  parties: "Parties",
  inventory: "Inventory",
  payments: "Payments",
  reports: "Reports",
  settings: "Settings",
  help: "Help",
  new: "New",
  edit: "Edit",
  create: "Create",
};

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    const segments = pathname?.split("/").filter(Boolean) || [];
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Check if segment is a UUID (skip it in display but keep in path)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

      if (isUuid) {
        breadcrumbs.push({
          label: "Details",
          href: isLast ? undefined : currentPath,
        });
      } else {
        breadcrumbs.push({
          label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  }, [pathname, items]);

  // Don't render on dashboard
  if (pathname === "/dashboard" || pathname === "/") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {/* Home Link */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
