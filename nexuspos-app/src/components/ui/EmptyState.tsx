import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There are no entries matching the current filter or search criteria.",
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "empty-state flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-text-gray mb-3">
        {icon || <FolderOpen className="w-6 h-6 text-text-gray" />}
      </div>
      <h4 className="text-sm font-bold text-text-dark">{title}</h4>
      <p className="text-xs text-text-gray max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
