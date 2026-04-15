"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-[family-name:var(--font-inter-tight)] font-semibold tracking-wide transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ember)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl",
  };

  const variants = {
    primary:
      "bg-[var(--color-ember)] text-white hover:opacity-90 active:scale-95",
    ghost:
      "bg-transparent text-[var(--color-ink)] hover:text-[var(--color-ember)] underline-offset-4 hover:underline",
    outline:
      "bg-transparent border border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-ember)] hover:text-[var(--color-ember)] active:scale-95",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
