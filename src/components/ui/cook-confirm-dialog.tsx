interface CookConfirmDialogProps {
  emoji: string;
  name: string;
  /** Optional time string, e.g. "30 นาที". Shown in the subtitle when provided. */
  time?: string;
  /** Tailwind z-index class. Defaults to "z-[60]". */
  zIndex?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CookConfirmDialog({
  emoji,
  name,
  time,
  zIndex = "z-[60]",
  onConfirm,
  onCancel,
}: CookConfirmDialogProps) {
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/60 backdrop-blur-sm`}>
      <div className="mx-4 w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl text-center">
        <span className="mb-3 block text-5xl">{emoji}</span>
        <h3 className="mb-1 text-lg font-semibold text-slate-100">{name}</h3>
        <p className="mb-5 text-sm text-slate-400">
          {time
            ? `เริ่มทำเมนูนี้เลยไหม? ใช้เวลาประมาณ ${time}`
            : "เริ่มทำเมนูนี้เลยไหม?"}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            ยังก่อน
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            เริ่มทำเลย!
          </button>
        </div>
      </div>
    </div>
  );
}
