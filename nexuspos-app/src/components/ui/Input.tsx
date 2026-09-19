import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="field mb-3 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-text-dark mb-1.5"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "input w-full border border-border rounded-xl px-3.5 py-2 text-xs text-text-dark bg-white focus:outline-none focus:border-patina focus:ring-2 focus:ring-patina/10 transition-all placeholder:text-text-gray/50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="hint text-[11px] text-text-gray mt-1">{hint}</p>}
        {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
