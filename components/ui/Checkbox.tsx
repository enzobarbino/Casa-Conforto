import React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, id, className = "", checked, onChange, disabled, ...props }, ref) => {
    const checkboxId =
      id || (label ? `check-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-start gap-3 select-none cursor-pointer min-h-[44px] py-1.5 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`w-5 h-5 rounded-md border transition-all duration-150 flex items-center justify-center ${
                checked
                  ? "bg-primary border-primary text-white"
                  : "bg-surface border-border hover:border-gray-400"
              } peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${
                error ? "border-danger" : ""
              }`}
            >
              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text leading-tight">{label}</span>
            {description && (
              <span className="text-xs text-text-muted mt-0.5">{description}</span>
            )}
          </div>
        </label>
        {error && <p className="text-xs text-danger font-medium pl-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

