"use client";

import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
type IconVariant = "default" | "gradient" | "solid" | "ghost" | "glow";

const sizeMap: Record<IconSize, { icon: string; box: string }> = {
  xs: { icon: "size-3.5", box: "size-7" },
  sm: { icon: "size-4", box: "size-8" },
  md: { icon: "size-5", box: "size-10" },
  lg: { icon: "size-6", box: "size-12" },
  xl: { icon: "size-7", box: "size-14" },
};

const variantStyles: Record<IconVariant, { wrapper: string; icon: string }> = {
  default: { wrapper: "", icon: "" },
  gradient: { wrapper: "bg-gradient-to-br from-[#014BAA] to-[#003F91] text-white shadow-[0_4px_14px_rgba(1,75,170,.25)]", icon: "" },
  solid: { wrapper: "bg-[#EEF5FC] text-[#014BAA]", icon: "" },
  ghost: { wrapper: "bg-white/10 text-white backdrop-blur", icon: "" },
  glow: { wrapper: "bg-[#014BAA]/10 text-[#014BAA] shadow-[0_0_20px_rgba(1,75,170,.15)]", icon: "" },
};

interface AnimatedIconProps {
  icon: string;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  iconClassName?: string;
  hover?: "none" | "scale" | "rotate" | "bounce" | "wiggle" | "pulse";
  wrapperClassName?: string;
  style?: CSSProperties;
}

const hoverAnimations = {
  none: {},
  scale: { scale: 1.15 },
  rotate: { rotate: 15, scale: 1.1 },
  bounce: { y: -3 },
  wiggle: { rotate: [0, -8, 8, -4, 0] },
  pulse: { scale: [1, 1.12, 1] },
};

function AnimatedIcon({
  icon,
  size = "md",
  variant = "default",
  className,
  iconClassName,
  hover = "none",
  wrapperClassName,
  style,
}: AnimatedIconProps) {
  const reduceMotion = useReducedMotion();
  const s = sizeMap[size];
  const v = variantStyles[variant];

  if (variant === "default") {
    return (
      <motion.span
        className={`${s.icon} ${iconClassName ?? ""} ${className ?? ""}`}
        whileHover={reduceMotion ? undefined : hoverAnimations[hover]}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        style={style}
      >
        <Icon icon={icon} className="size-full" />
      </motion.span>
    );
  }

  return (
    <motion.span
      className={`grid ${s.box} place-items-center rounded-xl ${v.wrapper} ${wrapperClassName ?? ""} ${className ?? ""}`}
      whileHover={reduceMotion ? undefined : hoverAnimations[hover]}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={style}
    >
      <Icon icon={icon} className={`${s.icon} ${iconClassName ?? ""}`} />
    </motion.span>
  );
}

export { AnimatedIcon };
export type { IconSize, IconVariant, AnimatedIconProps };