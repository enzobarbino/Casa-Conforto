import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Card({
  as: Component = "div",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`bg-surface rounded-2xl border border-border/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

