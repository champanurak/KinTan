interface NutritionGridProps {
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  /** Extra Tailwind classes applied to the wrapper (e.g. margin). */
  className?: string;
}

const ITEMS = [
  { key: "calories" as const, label: "แคลอรี่", unit: "kcal", color: "text-orange-400" },
  { key: "protein"  as const, label: "โปรตีน",  unit: "g",    color: "text-sky-400"    },
  { key: "carb"     as const, label: "คาร์บ",    unit: "g",    color: "text-amber-400"  },
  { key: "fat"      as const, label: "ไขมัน",   unit: "g",    color: "text-rose-400"   },
];

export function NutritionGrid({ calories, protein, carb, fat, className = "" }: NutritionGridProps) {
  const values: Record<typeof ITEMS[number]["key"], number> = { calories, protein, carb, fat };

  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {ITEMS.map(({ key, label, unit, color }) => (
        <div key={key} className="rounded-xl bg-slate-700 p-2 text-center">
          <p className={`text-lg font-bold ${color}`}>{values[key]}</p>
          <p className="text-[10px] text-slate-500">{unit}</p>
          <p className="text-[10px] text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
