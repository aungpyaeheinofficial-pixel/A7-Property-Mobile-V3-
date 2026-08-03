"use client";

import SearchbarModule from "framework7/components/searchbar";
import SheetModule from "framework7/components/sheet";
import Framework7Core from "framework7/lite";
import Framework7React, {
  App as F7App,
  Button as F7Button,
  Searchbar as F7Searchbar,
  Segmented as F7Segmented,
  Sheet as F7Sheet,
} from "framework7-react";
import { Search, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

Framework7Core["use"]([Framework7React, SearchbarModule, SheetModule]);

function Framework7SearchRoot({ children }: { children: ReactNode }) {
  return (
    <F7App
      className="a7-f7-search-root ios"
      name="A7 Property Search"
      theme="ios"
      routes={[]}
    >
      {children}
    </F7App>
  );
}

function Framework7SearchField({
  value,
  onValueChange,
  onClear,
  onSubmit,
  placeholder,
  label,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("a7-f7-search-field relative min-w-0", className)} role="search" aria-label={label}>
      <F7Searchbar
        inline
        customSearch
        init={false}
        outline={false}
        disableButton={false}
        clearButton={false}
        value={value}
        placeholder={placeholder}
        onInput={(event) => onValueChange(String(event?.target?.value ?? ""))}
        onSubmit={(event) => {
          (event as FormEvent<HTMLFormElement> | undefined)?.preventDefault();
          onSubmit?.();
        }}
      />
      <Search className="pointer-events-none absolute left-4 top-1/2 z-40 size-[18px] -translate-y-1/2 text-a7-blue" aria-hidden="true" />
      {value && (
        <button type="button" onClick={onClear} className="absolute right-1.5 top-1/2 z-40 grid size-10 -translate-y-1/2 place-items-center rounded-full text-[#707873] transition-colors hover:bg-[#EFEEEA] hover:text-a7-navy" aria-label="Clear search">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function Framework7PurposeControl({
  value,
  onChange,
  rentLabel,
  buyLabel,
  ariaLabel,
  className,
}: {
  value: "rent" | "sale";
  onChange: (value: "rent" | "sale") => void;
  rentLabel: string;
  buyLabel: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("a7-f7-segmented-wrap", className)}>
      <F7Segmented strong className="a7-f7-segmented">
        <F7Button type="button" active={value === "rent"} onClick={() => onChange("rent")}>{rentLabel}</F7Button>
        <F7Button type="button" active={value === "sale"} onClick={() => onChange("sale")}>{buyLabel}</F7Button>
      </F7Segmented>
    </div>
  );
}

function Framework7ChoiceButton({
  selected,
  onClick,
  children,
  compact = false,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <F7Button
      type="button"
      active={selected}
      onClick={onClick}
      className={cn("a7-f7-choice", compact && "a7-f7-choice-compact", className)}
    >
      {children}
    </F7Button>
  );
}

function Framework7FilterSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <F7Sheet
      className="a7-f7-filter-sheet"
      opened={open}
      bottom
      backdrop
      animate
      swipeToClose
      swipeHandler=".a7-f7-sheet-handle"
      closeByBackdropClick
      closeByOutsideClick
      closeOnEscape
      containerEl=".a7-f7-search-root"
      onSheetClosed={() => onOpenChange(false)}
      style={{ height: "min(88svh, 760px)" }}
    >
      <section className="flex h-full flex-col" role="dialog" aria-modal="true" aria-label={title}>
        <div className="a7-f7-sheet-handle flex h-7 shrink-0 cursor-grab items-center justify-center" aria-hidden="true"><span className="h-1 w-10 rounded-full bg-[#C8C7C3]" /></div>
        <header className="flex shrink-0 items-start gap-4 border-b border-a7-line px-5 pb-5 sm:px-7">
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-semibold tracking-[-0.035em] text-a7-navy">{title}</h2>
            {description && <p className="mt-1.5 text-[11px] leading-5 text-a7-muted">{description}</p>}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F1EFEB] text-a7-navy transition-colors hover:bg-[#E8E5DF]" aria-label="Close filters"><X className="size-4" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <footer className="a7-glass shrink-0 border-x-0 border-b-0 px-5 py-4 sm:px-7">{footer}</footer>}
      </section>
    </F7Sheet>
  );
}

export {
  Framework7ChoiceButton,
  Framework7FilterSheet,
  Framework7PurposeControl,
  Framework7SearchField,
  Framework7SearchRoot,
};
