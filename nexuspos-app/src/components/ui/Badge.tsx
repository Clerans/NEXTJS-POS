import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "orange" | "red" | "purple" | "gray" | "blue";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "gray",
  children,
  ...props
}) => {
  const variantClasses = {
    green: "badge-green bg-[#DCFCE7] text-[#15803D]",
    orange: "badge-orange bg-[#E8F3F5] text-[#004953]",
    red: "badge-red bg-[#FEE2E2] text-[#B91C1C]",
    purple: "badge-purple bg-[#F3E8FF] text-[#6D28D9]",
    gray: "badge-gray bg-[#F1F5F9] text-[#5B6B73]",
    blue: "badge-blue bg-[#E0F2FE] text-[#1D4ED8]",
  };

  return (
    <span
      className={cn(
        "badge inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
