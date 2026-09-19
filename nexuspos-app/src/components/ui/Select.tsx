import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="field mb-3 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-text-dark mb-1.5"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "select w-full border border-border rounded-xl px-3.5 py-2 text-xs text-text-dark bg-white focus:outline-none focus:border-patina focus:ring-2 focus:ring-patina/10 transition-all font-medium",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p className="hint text-[11px] text-text-gray mt-1">{hint}</p>}
        {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
