import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E7E5E0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("border-b border-[#E7E5E0]/70 p-5", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold text-stone-900 tracking-tight", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("border-t border-[#E7E5E0]/70 p-5", className)}
      {...props}
    />
  );
}