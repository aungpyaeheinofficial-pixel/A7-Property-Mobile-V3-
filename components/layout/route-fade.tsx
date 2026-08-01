"use client";

import { motion, useReducedMotion } from "framer-motion";

function RouteFade({ children }: Readonly<{ children: React.ReactNode }>) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0.72 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export { RouteFade };
