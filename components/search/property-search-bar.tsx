"use client";

import { Search, X } from "lucide-react";
import type { FormEvent } from "react";

import { cn } from "@/lib/utils";

type PropertySearchTab = "sale" | "rent" | "buy";

interface PropertySearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  activeTab: PropertySearchTab;
  onTabChange: (tab: PropertySearchTab) => void;
  placeholder: string;
  searchLabel: string;
  clearLabel: string;
  tabs: Array<{ id: PropertySearchTab; label: string }>;
  compact?: boolean;
  className?: string;
}

function PropertySearchBar({
  value,
  onValueChange,
  onSubmit,
  onClear,
  activeTab,
  onTabChange,
  placeholder,
  searchLabel,
  clearLabel,
  tabs,
  compact = false,
  className,
}: PropertySearchBarProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className={cn("w-full space-y-2.5", className)}>
      <form onSubmit={submit} role="search" className="flex min-h-12 items-center rounded-full border border-a7-line bg-white py-1.5 pl-4 pr-1.5 shadow-[var(--shadow-hairline)] transition-[border-color,box-shadow] duration-[var(--duration-base)] focus-within:border-a7-blue focus-within:shadow-[0_0_0_3px_rgba(0,87,217,.1)]">
        <input
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          aria-label={searchLabel}
          className="min-h-9 min-w-0 flex-1 appearance-none bg-transparent text-[13px] text-a7-navy outline-none placeholder:text-[#98A2B3] [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" className="grid size-10 shrink-0 place-items-center rounded-full bg-a7-blue text-white shadow-[0_4px_12px_rgba(0,87,217,.2)] transition-[background-color,transform] duration-[var(--duration-base)] hover:bg-[#0049B8] active:scale-[.96]" aria-label={searchLabel}>
          <Search className="size-[17px]" />
        </button>
        {value && (
          <button type="button" onClick={onClear} className="ml-1 grid size-10 shrink-0 place-items-center rounded-full text-[#98A2B3] transition-colors hover:bg-[#F3F1ED] hover:text-a7-navy" aria-label={clearLabel}>
            <X className="size-[19px]" />
          </button>
        )}
      </form>

      {!compact && (
        <div role="tablist" aria-label="Property search purpose" className="grid grid-cols-3 gap-1.5 rounded-full border border-a7-line bg-white p-1 shadow-[var(--shadow-hairline)]">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "min-h-10 rounded-full px-2 text-[10px] font-semibold transition-[background-color,color,box-shadow,transform] duration-[var(--duration-base)]",
                  selected
                    ? "bg-a7-blue text-white shadow-[0_4px_12px_rgba(0,87,217,.2)]"
                    : "bg-[#F5F6F7] text-a7-muted hover:bg-[#EDF4FF] hover:text-a7-blue",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { PropertySearchBar };
export type { PropertySearchBarProps, PropertySearchTab };
