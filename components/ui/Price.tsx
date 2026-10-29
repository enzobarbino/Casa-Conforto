import React from "react";
import { formatarMoeda } from "@/lib/format";

export interface PriceProps {
  value: number;
  originalValue?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Price({
  value,
  originalValue,
  size = "md",
  className = "",
}: PriceProps) {
  const sizeClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
    xl: "text-3xl font-extrabold tracking-tight",
  };

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`text-text ${sizeClasses[size]}`}>
        {formatarMoeda(value)}
      </span>
      {originalValue && originalValue > value && (
        <span className="text-xs text-text-muted line-through font-normal">
          {formatarMoeda(originalValue)}
        </span>
      )}
    </div>
  );
}

