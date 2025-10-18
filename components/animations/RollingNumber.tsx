"use client";

import React from "react";
import { motion } from "framer-motion";

interface DigitColumnProps {
  target: number; // 0-9
  duration?: number;
  delay?: number;
}

const DIGITS = Array.from({ length: 10 }).map((_, i) => String(i));

function DigitColumn({ target, duration = 0.6, delay = 0 }: DigitColumnProps) {
  const translateY = `-${target}em`;
  return (
    <span
      className="inline-block overflow-hidden align-baseline"
      style={{ height: "1em" }}
    >
      <motion.span
        initial={{ y: "1em", opacity: 0, filter: "blur(4px)" }}
        animate={{ y: translateY, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "inline-block", lineHeight: 1 }}
      >
        <span style={{ display: "inline-block" }}>
          {DIGITS.map((d) => (
            <span key={d} style={{ display: "block", height: "1em" }}>
              {d}
            </span>
          ))}
        </span>
      </motion.span>
    </span>
  );
}

export interface RollingNumberProps {
  value: string; // e.g., "2025" or "25"
  animateLastTwoOnly?: boolean;
  className?: string;
  delay?: number;
}

export function RollingNumber({
  value,
  animateLastTwoOnly = true,
  className = "",
  delay = 0,
}: RollingNumberProps) {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return <span className={className}>{value}</span>;

  if (animateLastTwoOnly && digitsOnly.length === 4) {
    const prefix = digitsOnly.slice(0, 2);
    const d1 = Number(digitsOnly[2]);
    const d2 = Number(digitsOnly[3]);
    return (
      <span className={className}>
        <span>{prefix}</span>
        <DigitColumn target={d1} delay={delay + 0.02} />
        <DigitColumn target={d2} delay={delay + 0.06} />
      </span>
    );
  }

  // Fallback: animate each digit independently
  return (
    <span className={className}>
      {digitsOnly.split("").map((d, i) => (
        <DigitColumn
          key={`${i}-${d}`}
          target={Number(d)}
          delay={delay + i * 0.04}
        />
      ))}
    </span>
  );
}

export default RollingNumber;
