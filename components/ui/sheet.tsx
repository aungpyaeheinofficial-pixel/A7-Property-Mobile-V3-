"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { a7Motion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "bottom";
  className?: string;
}

function Sheet({ open, onOpenChange, title, description, children, footer, side = "right", className }: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const motionPosition = side === "bottom"
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            aria-label="Close dialog"
            className="absolute inset-0 bg-a7-navy/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
              "absolute flex border-a7-line bg-white shadow-[var(--shadow-overlay)]",
              side === "right" && "inset-y-0 right-0 w-full max-w-[540px] flex-col border-l sm:rounded-l-[var(--radius-sheet)]",
              side === "bottom" && "inset-x-0 bottom-0 max-h-[92vh] flex-col rounded-t-[var(--radius-sheet)] border-t",
              className,
            )}
            {...motionPosition}
            transition={reduceMotion ? { duration: 0 } : a7Motion.slow}
          >
            {side === "bottom" && <div className="mx-auto mt-2 h-1 w-11 rounded-full bg-[#D1D1D5]" />}
            <div className="flex items-start gap-4 border-b border-a7-line px-5 py-5 sm:px-7 sm:py-6">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-xl font-semibold tracking-[-0.035em] text-a7-navy">{title}</h2>
                {description && <p id={descriptionId} className="mt-1.5 text-xs leading-5 text-a7-muted">{description}</p>}
              </div>
              <Button ref={closeRef} size="icon" variant="ghost" className="-mr-2 -mt-2" onClick={() => onOpenChange(false)} aria-label="Close">
                <X className="size-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="a7-glass border-x-0 border-b-0 px-5 py-4 sm:px-7">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Sheet };
export type { SheetProps };
