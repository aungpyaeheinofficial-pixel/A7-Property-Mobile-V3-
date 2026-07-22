import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
};

function Button({ className, variant = "default", size = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-[color,background-color,border-color,box-shadow,transform] outline-none focus-visible:ring-3 focus-visible:ring-[#0f6fb2]/25 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-[#0f6fb2] text-white hover:bg-[#0b5f9f]",
        variant === "ghost" && "bg-transparent hover:bg-[#f0f8fd]",
        variant === "outline" && "border border-[#1384c8]/20 bg-white text-[#1384c8] hover:bg-[#f0f8fd]",
        size === "default" && "h-11 rounded-xl px-4 text-sm",
        size === "icon" && "size-11 rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
