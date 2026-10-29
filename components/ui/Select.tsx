import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, id, className = "", ...props }, ref) => {
    const selectId =
      id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-text">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-surface text-text text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-alt disabled:text-text-muted disabled:cursor-not-allowed ${
            error ? "border-danger focus:ring-danger" : "border-border hover:border-gray-400"
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

