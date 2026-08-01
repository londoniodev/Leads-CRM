'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface ScraperDrawerShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

/**
 * Shell abstracto de Drawer lateral derecho (Principio de Abstracción y Responsabilidad Única - SRP).
 * Reutilizable para cualquier formulario o panel lateral en la posición derecha.
 */
export function ScraperDrawerShell({
  open,
  onOpenChange,
  triggerButton,
  title,
  description,
  children,
}: ScraperDrawerShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>
        {triggerButton}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 p-6 flex flex-col font-sans overflow-y-auto"
      >
        <SheetHeader className="text-left space-y-1.5 pb-4 border-b border-zinc-800/80">
          <SheetTitle className="text-xl font-bold flex items-center gap-2 text-white">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-zinc-400 text-xs">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 pt-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
