import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  change,
  isPositive,
  className,
}) => {
  return (
    <div
      className={cn(
        "card bg-white p-4.5 rounded-xl border border-border shadow-xs hover:shadow-md transition-all",
        className
      )}
    >
      <div className="stat-label flex items-center justify-between text-xs font-semibold text-text-gray mb-2">
        <span>{label}</span>
        {icon && <span className="text-text-dark">{icon}</span>}
      </div>
      <div className="stat-value text-xl font-black text-text-dark tracking-tight">
        {value}
      </div>
      {change && (
        <div
          className={cn(
            "text-[11px] font-bold mt-1.5 flex items-center gap-1",
            isPositive ? "text-emerald-600" : "text-red-500"
          )}
        >
          <span>{isPositive ? "↑" : "↓"}</span>
          <span>{change} vs last period</span>
        </div>
      )}
    </div>
  );
};
