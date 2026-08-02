import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface SearchBarProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  label: string;
  placeholder?: string;
  trailing?: React.ReactNode;
}

function SearchBar({ value, onValueChange, onSubmit, label, placeholder, trailing, className, ...props }: SearchBarProps) {
  return (
    <form
      role="search"
      className={cn("flex min-h-12 min-w-0 items-center gap-2 rounded-[12px] border border-[#DCD9D2] bg-white px-4 transition-colors focus-within:border-[#014BAA]", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      {...props}
    >
      <Search className="size-[18px] shrink-0 text-[#014BAA]" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="min-h-11 min-w-0 flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#969D99]"
      />
      {trailing}
    </form>
  );
}

export { SearchBar };
export type { SearchBarProps };
