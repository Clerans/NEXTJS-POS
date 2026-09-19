import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "orange" | "patina" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variantClasses = {
      default:
        "btn bg-white border border-border text-text-dark hover:bg-patina-light hover:border-patina-accent hover:text-patina-dark rounded-xl shadow-xs",
      orange:
        "btn-orange bg-patina text-white hover:bg-patina-dark rounded-full shadow-md active:scale-[0.98]",
      patina:
        "btn-patina bg-patina text-white hover:bg-patina-dark rounded-full shadow-md active:scale-[0.98]",
      outline:
        "bg-transparent border border-border text-text-dark hover:bg-patina-light hover:text-patina-dark rounded-xl",
      ghost:
        "bg-transparent text-text-gray hover:bg-patina-light hover:text-patina-dark rounded-lg",
      danger:
        "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl",
    };

    const sizeClasses = {
      sm: "px-2.5 py-1 text-xs gap-1.5",
      md: "px-3.5 py-2 text-xs gap-2",
      lg: "px-5 py-2.5 text-sm gap-2.5",
      icon: "w-8 h-8 p-0 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
