import React from "react";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-surface border border-dashed border-border/80 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-alt text-text-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-text mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

