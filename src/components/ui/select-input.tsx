import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface SelectInputProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /** Label shown above the select. */
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  /** Validation error message from React Hook Form. */
  error?: string;
}

/**
 * Styled select / dropdown with ChevronDown icon and optional label.
 * The `className` prop is forwarded to the outermost wrapper `<div>`.
 */
export function SelectInput({
  label,
  value,
  onChange,
  children,
  error,
  className,
  ...rest
}: SelectInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-xs text-slate-400">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-xl border bg-slate-700 px-3 py-2.5 pr-9 text-sm text-slate-100 outline-none transition focus:border-emerald-400 ${
            error ? "border-red-500" : "border-slate-600"
          }`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
