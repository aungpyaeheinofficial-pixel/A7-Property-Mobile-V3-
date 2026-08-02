"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function Modal({ open, onOpenChange, title, description, children, footer, className }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
          <motion.button aria-label="Close modal" className="absolute inset-0 bg-[#111827]/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onOpenChange(false)} />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn("relative z-10 max-h-[90vh] w-full max-w-[560px] overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,.08)]", className)}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <header className="flex items-start gap-4 border-b border-[#E5E7EB] px-5 py-5">
              <div className="min-w-0 flex-1"><h2 id={titleId} className="text-xl font-semibold text-[#111827]">{title}</h2>{description && <p id={descriptionId} className="mt-1.5 text-sm text-[#64748B]">{description}</p>}</div>
              <Button ref={closeRef} size="icon" variant="ghost" onClick={() => onOpenChange(false)} aria-label="Close"><X className="size-5" /></Button>
            </header>
            <div className="max-h-[65vh] overflow-y-auto">{children}</div>
            {footer && <footer className="border-t border-[#E5E7EB] px-5 py-4">{footer}</footer>}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Modal };
export type { ModalProps };
