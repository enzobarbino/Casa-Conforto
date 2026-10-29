import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border/80 p-3 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <Skeleton className="w-3/4 h-4 rounded" />
      <Skeleton className="w-1/2 h-3 rounded" />
      <div className="flex items-center justify-between pt-2 mt-auto">
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
    </div>
  );
}

