"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/invoices/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Invoice</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/parties/new"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Add Party</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/inventory/new"))}
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Add Item</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/payments/new"))}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Record Payment</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/invoices"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Invoices</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/parties"))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Parties</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/inventory"))}
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/payments"))}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Payments</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/reports"))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings */}
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings/business"))}
          >
            <Calculator className="mr-2 h-4 w-4" />
            <span>Business Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
