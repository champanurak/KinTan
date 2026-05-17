"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
  "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
  "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const THAI_DAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

type ViewMode = "day" | "month" | "year";

/* ─── Helpers ──────────────────────────────────────────────── */
function toDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function formatDisplay(iso: string): string {
  const d = toDate(iso);
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/* ─── Props ────────────────────────────────────────────────── */
interface DatePickerProps {
  /** Optional label rendered above the input trigger. */
  label?: string;
  /** Controlled ISO date value: "YYYY-MM-DD". */
  value?: string;
  onChange?: (value: string) => void;
  /** Text shown at the bottom of the popup (e.g. AI suggestion). */
  hint?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/* ─── Component ────────────────────────────────────────────── */
export function DatePicker({
  label,
  value,
  onChange,
  hint,
  placeholder = "เลือกวันที่",
  required,
  className,
}: DatePickerProps) {
  const today = new Date();
  const todayISO = toISO(today);

  const initDate = value ? toDate(value) : today;
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [viewYear, setViewYear] = useState(initDate.getFullYear());

  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setViewMode("day");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Sync calendar view when value changes externally */
  useEffect(() => {
    if (value) {
      const d = toDate(value);
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setViewMode("day"); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* ── Navigation prev / next ── */
  const prevMonth = () => {
    if (viewMode === "day") {
      if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
      else setViewMonth((m) => m - 1);
    } else if (viewMode === "month") {
      setViewYear((y) => y - 1);
    } else {
      setViewYear((y) => y - 10);
    }
  };
  const nextMonth = () => {
    if (viewMode === "day") {
      if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
      else setViewMonth((m) => m + 1);
    } else if (viewMode === "month") {
      setViewYear((y) => y + 1);
    } else {
      setViewYear((y) => y + 10);
    }
  };

  /* Build calendar grid */
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    if (i < firstDow) {
      return {
        d: new Date(viewYear, viewMonth - 1, prevMonthDays - firstDow + 1 + i),
        inMonth: false,
      };
    } else if (i < firstDow + daysInMonth) {
      return {
        d: new Date(viewYear, viewMonth, i - firstDow + 1),
        inMonth: true,
      };
    } else {
      return {
        d: new Date(viewYear, viewMonth + 1, i - firstDow - daysInMonth + 1),
        inMonth: false,
      };
    }
  });

  const selectDate = (d: Date) => {
    onChange?.(toISO(d));
    setOpen(false);
    setViewMode("day");
  };

  /* ── Decade range for year view ── */
  const decadeStart = Math.floor(viewYear / 10) * 10;
  // 12 cells: 1 overflow before + 10 decade years + 1 overflow after
  const yearCells = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

  /* ── Header label ── */
  const headerLabel =
    viewMode === "day"
      ? `${THAI_MONTHS[viewMonth]} ${viewYear + 543}`
      : viewMode === "month"
      ? `${viewYear + 543}`
      : `${decadeStart + 543}–${decadeStart + 9 + 543}`;

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Label */}
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-200">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}

      {/* Trigger input */}
      <button
        type="button"
        onClick={() => setOpen((o) => { if (!o) setViewMode("day"); return !o; })}
        className={`datepicker-trigger flex w-full items-center gap-2 rounded-xl border bg-slate-700 px-4 py-2.5 text-left text-sm transition ${
          open ? "border-emerald-500" : "border-slate-600"
        } focus:outline-none`}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        <span className={`flex-1 ${value ? "text-slate-100" : "text-slate-500"}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Calendar popup */}
      {open && (
        <div className="datepicker-popup absolute left-0 top-full z-[60] mt-1.5 w-72 rounded-2xl border border-slate-600 bg-slate-800 p-4 shadow-2xl">

          {/* ── Header ── */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (viewMode === "day") setViewMode("year");
              }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-slate-100 transition ${
                viewMode !== "day" ? "cursor-default" : "hover:bg-slate-700"
              }`}
            >
              {headerLabel}
              {viewMode === "day" && (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── MONTH PICKER ── */}
          {viewMode === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {THAI_MONTHS_SHORT.map((name, idx) => {
                const selDate = value ? toDate(value) : null;
                const isSelected = selDate
                  ? selDate.getMonth() === idx && selDate.getFullYear() === viewYear
                  : false;
                const isCurMonth = today.getMonth() === idx && today.getFullYear() === viewYear;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { setViewMonth(idx); setViewMode("day"); }}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : isCurMonth
                        ? "text-emerald-400 ring-1 ring-emerald-500/60 hover:bg-slate-700"
                        : "text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── YEAR PICKER ── */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-2">
              {yearCells.map((yr) => {
                const inDecade = yr >= decadeStart && yr <= decadeStart + 9;
                const selDate = value ? toDate(value) : null;
                const isSelected = selDate ? selDate.getFullYear() === yr : false;
                const isCurYear = today.getFullYear() === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => { setViewYear(yr); setViewMode("month"); }}
                    className={`rounded-xl py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : isCurYear && inDecade
                        ? "text-emerald-400 ring-1 ring-emerald-500/60 hover:bg-slate-700"
                        : inDecade
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    {yr + 543}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── DAY PICKER ── */}
          {viewMode === "day" && (
            <>
              {/* Day-of-week headers */}
              <div className="mb-1 grid grid-cols-7 text-center">
                {THAI_DAYS_SHORT.map((d) => (
                  <span key={d} className="py-1 text-xs font-medium text-slate-500">
                    {d}
                  </span>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7">
                {cells.map(({ d, inMonth }) => {
                  const iso = toISO(d);
                  const isSelected = iso === value;
                  const isToday = iso === todayISO && inMonth;

                  let cellCls =
                    "flex h-8 w-8 mx-auto items-center justify-center rounded-full text-sm transition ";

                  if (isSelected) {
                    cellCls += "bg-emerald-500 font-semibold text-white";
                  } else if (isToday) {
                    cellCls += "font-semibold text-emerald-400 ring-1 ring-emerald-500/60 hover:bg-slate-700";
                  } else if (inMonth) {
                    cellCls += "text-slate-200 hover:bg-slate-700";
                  } else {
                    cellCls += "text-slate-600";
                  }

                  return (
                    <div key={iso} className="flex items-center justify-center py-0.5">
                      <button
                        type="button"
                        onClick={() => selectDate(d)}
                        className={cellCls}
                      >
                        {d.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Hint (AI suggestion) ── */}
          {hint && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-700/30 bg-emerald-900/20 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="text-xs text-emerald-400">{hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
