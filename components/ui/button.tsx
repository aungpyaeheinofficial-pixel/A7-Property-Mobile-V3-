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
        "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.005em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-4 focus-visible:ring-[#006AFF]/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        variant === "default" && "bg-[linear-gradient(135deg,#0B76FF_0%,#0057D9_100%)] !text-white shadow-[0_8px_20px_rgba(0,106,255,.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,106,255,.28)]",
        variant === "ghost" && "bg-transparent hover:bg-[#EEF3F9]",
        variant === "outline" && "border border-[#D7E0EA] bg-white text-[#29445F] shadow-[0_1px_2px_rgba(23,43,63,.04)] hover:-translate-y-0.5 hover:border-[#9FC4FF] hover:bg-[#F7FAFF] hover:text-[#0057D9]",
        size === "default" && "h-11 rounded-xl px-4 text-sm",
        size === "icon" && "size-11 rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
