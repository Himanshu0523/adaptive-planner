import React from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "bg-[#2D5A43] text-white hover:bg-[#1E3A2F] active:bg-[#193128] shadow-sm",
  secondary: "bg-[#F3F2EE] text-stone-900 hover:bg-[#EAE8E2]",
  outline: "border border-[#E7E5E0] bg-white hover:bg-[#FAF9F5] text-stone-700",
  ghost: "bg-transparent hover:bg-[#F3F2EE] text-stone-700",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A43] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";