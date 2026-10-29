import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-surface text-text text-sm transition-colors duration-150 placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-alt disabled:text-text-muted disabled:cursor-not-allowed ${
            error ? "border-danger focus:ring-danger" : "border-border hover:border-gray-400"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

