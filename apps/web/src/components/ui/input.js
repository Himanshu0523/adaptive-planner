import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-stone-900",
        "placeholder:text-stone-400",
        "focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/30 focus:border-[#2D5A43]",
        "disabled:bg-[#F5F4EF] disabled:text-stone-400",
        error
          ? "border-red-600 focus:ring-red-200"
          : "border-[#E7E5E0]",
        className
      )}
      {...props}
    />
  );
});