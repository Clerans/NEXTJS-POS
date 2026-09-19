import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'orange' | 'yellow' | 'red' | 'purple' | 'gray' | 'blue';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  className,
  ...props
}) => {
  const variantClasses = {
    green: 'badge-green',
    orange: 'badge-orange',
    yellow: 'badge-orange',
    red: 'badge-red',
    purple: 'badge-purple',
    gray: 'badge-gray',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={cn('badge', variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
};
