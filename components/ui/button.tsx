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
        "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.005em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 outline-none focus-visible:ring-4 focus-visible:ring-[#014BAA]/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        variant === "default" && "bg-[#014BAA] !text-white shadow-[0_4px_20px_rgba(0,0,0,.08)] hover:bg-[#003F91]",
        variant === "ghost" && "bg-transparent hover:bg-[#EEF5FC]",
        variant === "outline" && "border border-[#D7E0EA] bg-white text-[#014BAA] shadow-[0_1px_2px_rgba(15,23,42,.04)] hover:border-[#93B4F5] hover:bg-[#F7FAFF] hover:text-[#003F91]",
        size === "default" && "h-11 rounded-[14px] px-4 text-sm",
        size === "icon" && "size-11 rounded-[14px]",
        className,
      )}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
