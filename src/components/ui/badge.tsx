type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  success: "bg-emerald-900/60 text-emerald-400",
  warning: "bg-amber-900/60 text-amber-400",
  danger: "bg-rose-900/60 text-rose-400",
  info: "bg-blue-900/60 text-blue-400"
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
