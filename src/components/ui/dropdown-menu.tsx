"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType | null>(null);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a DropdownMenu");
  }
  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  className,
  children,
  disabled,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useDropdown();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = "end",
  className,
  children,
  ...props
}: {
  align?: "start" | "end" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useDropdown();

  if (!open) return null;

  const alignClasses =
    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[12rem] rounded-xl bg-zinc-900 p-1.5 text-zinc-200 shadow-2xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-100",
        alignClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
  onClick,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) {
  const { setOpen } = useDropdown();

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setOpen(false);
        onClick?.(e);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-zinc-800/90 text-zinc-200 focus:bg-zinc-800",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-zinc-800", className)} {...props} />;
}
