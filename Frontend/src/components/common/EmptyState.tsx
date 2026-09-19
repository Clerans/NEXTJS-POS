import React from 'react';
import { Package } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description,
  icon = <Package className="w-7 h-7 text-patina" />,
}) => {
  return (
    <div className="empty-state py-9 text-center text-textGray">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-bold text-textDark mb-1 text-xs">{title}</div>
      {description && <div className="text-[11px] text-textGray">{description}</div>}
    </div>
  );
};
