import type { InputHTMLAttributes } from "react";

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Label shown above the input. */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Optional unit suffix displayed inside the input (e.g. "ปี", "กก.", "%"). */
  unit?: string;
  /** Validation error message from React Hook Form. */
  error?: string;
}

/**
 * Styled text / number input with optional label and unit suffix.
 * The `className` prop is forwarded to the outermost wrapper `<div>`.
 */
export function TextInput({
  label,
  value,
  onChange,
  unit,
  error,
  className,
  ...rest
}: TextInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-xs text-slate-400">{label}</label>
      )}
      <div className={`flex items-center gap-2 rounded-xl border bg-slate-700 px-3 py-2.5 transition focus-within:border-emerald-400 ${
        error ? "border-red-500" : "border-slate-600"
      }`}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          {...rest}
        />
        {unit && (
          <span className="flex-shrink-0 text-xs text-slate-400">{unit}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
