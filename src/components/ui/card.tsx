interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <article className={`rounded-xl border border-slate-700 bg-slate-800/60 p-4 ${className}`}>
      {title && (
        <>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </>
      )}
      {title && <div className="mt-3">{children}</div>}
      {!title && children}
    </article>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  note?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
}

export function StatCard({ label, value, note, icon, iconClassName = "bg-emerald-100 text-emerald-700" }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        {icon ? (
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${iconClassName}`}>
            {icon}
          </div>
        ) : null}
        <div>
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p className="mt-1 text-[2rem] font-semibold leading-none text-slate-100">{value}</p>
          {note && <p className="mt-1 text-sm text-slate-400">{note}</p>}
        </div>
      </div>
    </Card>
  );
}
