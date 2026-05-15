import AppShell from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell title="ตั้งค่า" subtitle="จัดการข้อมูลบัญชีและการแจ้งเตือนของคุณ">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">โปรไฟล์ผู้ใช้</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-600">ชื่อ
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400" defaultValue="คุณคุนกัน" />
          </label>
          <label className="text-sm text-slate-600">อีเมล
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400" defaultValue="test@test.com" />
          </label>
        </div>
        <button type="button" className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          บันทึกการตั้งค่า
        </button>
      </section>
    </AppShell>
  );
}
