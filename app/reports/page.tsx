import AppShell from "@/app/components/app-shell";

export default function ReportsPage() {
  return (
    <AppShell title="สถิติ & รายงาน" subtitle="ดูแนวโน้มการใช้วัตถุดิบและค่าใช้จ่ายรายเดือน">
      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">ค่าใช้จ่ายรายสัปดาห์</h2>
          <div className="mt-3 h-44 rounded-xl bg-[linear-gradient(180deg,#ecfdf3_0%,#f8fafc_100%)]" />
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">อัตราการลดขยะอาหาร</h2>
          <div className="mt-3 h-44 rounded-xl bg-[linear-gradient(180deg,#f0f9ff_0%,#f8fafc_100%)]" />
        </article>
      </section>
    </AppShell>
  );
}
