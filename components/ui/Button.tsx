import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const sizeStyles = {
      md: "min-h-[44px] px-4 py-2.5 text-sm gap-2",
      lg: "min-h-[50px] px-6 py-3 text-base gap-2.5",
    };

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm",
      secondary:
        "border border-border bg-surface text-text hover:bg-surface-alt hover:border-primary active:scale-[0.98]",
      ghost: "text-text hover:bg-surface-alt active:bg-border/40",
      danger: "bg-danger text-white hover:bg-red-700 active:scale-[0.98] shadow-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

