import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'orange' | 'outline' | 'secondary' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyle = 'btn';
  const variantStyles = {
    default: '',
    orange: 'btn-orange',
    outline: 'border border-border hover:bg-patina-light text-textDark',
    secondary: 'border border-border hover:bg-patina-light text-textDark',
    icon: 'icon-btn',
    danger: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-xs px-3.5 py-2',
    lg: 'text-sm px-5 py-2.5',
  };

  return (
    <button
      className={cn(
        baseStyle,
        variantStyles[variant],
        variant !== 'icon' && sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
