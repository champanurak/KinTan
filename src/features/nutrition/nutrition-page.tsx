import AppShell from "@/components/layout/app-shell";

export default function NutritionPage() {
  return (
    <AppShell title="โภชนาการ" subtitle="ติดตามสารอาหารต่อวันจากมื้อที่บันทึกไว้">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { name: "พลังงาน", value: "1,650 / 2,000 kcal" },
          { name: "โปรตีน", value: "82 / 100 g" },
          { name: "คาร์บ", value: "180 / 250 g" },
          { name: "ไขมัน", value: "45 / 70 g" }
        ].map((item) => (
          <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{item.name}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
