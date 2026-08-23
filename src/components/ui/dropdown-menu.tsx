"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">
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
  const { setOpen, triggerRef } = useDropdown();

  return (
    <button
      ref={triggerRef}
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
  const { open, setOpen, triggerRef } = useDropdown();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [coords, setCoords] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const updateCoords = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = contentRef.current ? contentRef.current.offsetHeight : 230;
    const menuWidth = contentRef.current ? contentRef.current.offsetWidth : 208;

    // Check vertical space (if close to bottom, position above trigger)
    const spaceBelow = window.innerHeight - rect.bottom;
    const positionAbove = spaceBelow < menuHeight + 12 && rect.top > menuHeight;

    let top = positionAbove ? rect.top - menuHeight - 6 : rect.bottom + 6;
    let left = rect.left;

    if (align === "end") {
      left = rect.right - menuWidth;
    } else if (align === "center") {
      left = rect.left + rect.width / 2 - menuWidth / 2;
    }

    // Keep horizontal alignment within screen boundary
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8));

    setCoords({ top, left });
  }, [triggerRef, align]);

  React.useLayoutEffect(() => {
    if (open) {
      updateCoords();
    }
  }, [open, updateCoords]);

  React.useEffect(() => {
    if (!open) return;

    function handleScrollOrResize() {
      updateCoords();
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isTrigger = triggerRef.current && triggerRef.current.contains(target);
      const isContent = contentRef.current && contentRef.current.contains(target);

      if (!isTrigger && !isContent) {
        setOpen(false);
      }
    }

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen, triggerRef, updateCoords]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 99999,
      }}
      className={cn(
        "min-w-[13rem] rounded-xl bg-zinc-900/95 p-1.5 text-zinc-200 shadow-2xl border border-zinc-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 font-sans text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
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
