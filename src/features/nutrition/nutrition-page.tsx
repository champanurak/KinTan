"use client";

import { useRef, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  ChevronLeft, ChevronRight, Calendar, Info,
  RefreshCw, Calculator, Smile,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";

type TDEEForm = {
  age: string; weight: string; height: string;
  bodyFat: string; activity: string; formula: string;
};

const TABS = ["ภาพรวม", "บันทึกอาหาร", "อาหารที่แนะนำ", "วิเคราะห์สารอาหาร", "เป้าหมาย"];

const ACTIVITY_OPTIONS = [
  { value: "sedentary",  label: "ไม่ออกกำลังกาย หรือออกกำลังกายน้อยมาก", mult: 1.2 },
  { value: "light",      label: "ออกกำลังกาย 1–3 ครั้ง/สัปดาห์",          mult: 1.375 },
  { value: "moderate",   label: "ออกกำลังกาย 4–5 ครั้ง/สัปดาห์",          mult: 1.55 },
  { value: "active",     label: "ออกกำลังกาย 6–7 ครั้ง/สัปดาห์",          mult: 1.725 },
  { value: "veryActive", label: "ออกกำลังกายวันละ 2 ครั้งขึ้นไป",          mult: 1.9 },
];

const FORMULA_OPTIONS = [
  { value: "mifflin",    label: "Mifflin–St Jeor (แนะนำ)" },
  { value: "harris",     label: "Harris-Benedict (1984)" },
  { value: "katch",      label: "Katch-McArdle (ต้องระบุ % ไขมัน)" },
];

const GOAL_ROWS = [
  { label: "ลดน้ำหนักอย่างมาก",  change: "-1 กก./สัปดาห์",   delta: -1000 },
  { label: "ลดน้ำหนัก",          change: "-0.5 กก./สัปดาห์",  delta: -500 },
  { label: "ลดน้ำหนักเล็กน้อย",  change: "-0.25 กก./สัปดาห์", delta: -250 },
  { label: "รักษาน้ำหนัก",       change: "0 กก./สัปดาห์",     delta: 0 },
  { label: "เพิ่มน้ำหนักเล็กน้อย", change: "+0.25 กก./สัปดาห์", delta: 250 },
  { label: "เพิ่มน้ำหนัก",        change: "+0.5 กก./สัปดาห์",  delta: 500 },
  { label: "เพิ่มน้ำหนักอย่างมาก", change: "+1 กก./สัปดาห์",   delta: 1000 },
];

interface TDEEResult { bmr: number; tdee: number }

function EnergyDonut({ kcal, goal }: { kcal: number; goal: number }) {
  const pct = Math.min(Math.round((kcal / goal) * 100), 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={120} height={120} className="-rotate-90">
          <circle cx={60} cy={60} r={r} fill="none" stroke="#1e3a22" strokeWidth={12} />
          <circle cx={60} cy={60} r={r} fill="none" stroke="#22c55e" strokeWidth={12}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-100 leading-tight">{kcal.toLocaleString()}</span>
          <span className="text-xs text-slate-500">kcal</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-emerald-600">{pct}%</p>
        <p className="text-xs text-slate-500">ของเป้าหมาย</p>
        <p className="text-xs text-slate-500 mt-2">จาก {goal.toLocaleString()} kcal</p>
        <p className="text-xs text-slate-500">เหลืออีก {(goal - kcal).toLocaleString()} kcal</p>
      </div>
    </div>
  );
}

function MacroBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const pct = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400 font-medium">{current}/{max} g</span>
      </div>
      <div className="h-2.5 bg-slate-700 rounded-lg overflow-hidden">
        <div className="h-full rounded-lg transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MacroDonut({ proteinPct, carbsPct, fatPct }: { proteinPct: number; carbsPct: number; fatPct: number }) {
  const gradient = `conic-gradient(#22c55e 0% ${proteinPct}%, #3b82f6 ${proteinPct}% ${proteinPct + carbsPct}%, #f97316 ${proteinPct + carbsPct}% 100%)`;
  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-slate-800" style={{ width: 44, height: 44 }} />
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {[
          { color: "#22c55e", label: "โปรตีน", pct: proteinPct },
          { color: "#3b82f6", label: "คาร์บ",   pct: carbsPct },
          { color: "#f97316", label: "ไขมัน",   pct: fatPct },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-slate-300 w-14">{m.label}</span>
            <span className="font-bold text-slate-100 ml-auto">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [gender, setGender]     = useState<"male" | "female">("male");
  const [result, setResult]     = useState<TDEEResult | null>(null);
  const tdeeFormRef             = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TDEEForm>({
    defaultValues: { age: "", weight: "", height: "", bodyFat: "", activity: "", formula: "" },
  });
  const watchedFormula = watch("formula");

  function onCalculate(data: TDEEForm) {
    const a = parseInt(data.age) || 25;
    const w = parseFloat(data.weight) || 70;
    const h = parseFloat(data.height) || 175;
    const f = parseFloat(data.bodyFat) || 20;

    let bmr: number;
    if (data.formula === "mifflin") {
      bmr = gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
    } else if (data.formula === "harris") {
      bmr = gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    } else {
      // Katch-McArdle
      bmr = 370 + 21.6 * (1 - f / 100) * w;
    }

    const mult = ACTIVITY_OPTIONS.find((o) => o.value === data.activity)?.mult ?? 1.2;
    const tdee = Math.round(bmr * mult);
    setResult({ bmr: Math.round(bmr), tdee });
  }

  function resetForm() {
    setGender("male");
    reset();
    setResult(null);
  }

  function scrollToForm() {
    tdeeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const tdeeValue = result?.tdee ?? 0;

  const dateAction = (
    <div className="flex items-center gap-1">
      <button className="p-1.5 rounded-lg hover:bg-slate-700 transition">
        <ChevronLeft className="h-4 w-4 text-slate-400" />
      </button>
      <span className="text-sm font-medium text-slate-300 px-1 whitespace-nowrap">วันนี้, 10 มิ.ย. 2567</span>
      <button className="p-1.5 rounded-lg hover:bg-slate-700 transition">
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </button>
      <button className="p-1.5 rounded-lg hover:bg-slate-700 transition ml-0.5">
        <Calendar className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  );

  return (
    <AppShell
      title="โภชนาการ 🌿"
      subtitle="ติดตามโภชนาการของคุณแต่ละวัน"
      headerAction={dateAction}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === i
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        <div className="space-y-5">
          {/* Row 1 — 4 stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TDEE card */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-300">TDEE ของฉัน</span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                {tdeeValue > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-100">{tdeeValue.toLocaleString()} <span className="text-base font-normal text-slate-400">kcal / วัน</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">พลังงานที่ร่างกายต้องการต่อวัน</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">ยังไม่ได้กรอกข้อมูล</p>
                )}
              </div>
              <button
                onClick={scrollToForm}
                className="mt-auto text-sm font-medium text-emerald-400 border border-emerald-700/60 rounded-xl py-2 hover:bg-emerald-900/30 transition"
              >
                กรอก / แก้ไข TDEE
              </button>
            </div>

            {/* Energy today */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <p className="text-sm font-semibold text-slate-300 mb-3">พลังงานที่กินวันนี้</p>
              <EnergyDonut kcal={1650} goal={tdeeValue} />
            </div>

            {/* Macros */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <p className="text-sm font-semibold text-slate-300 mb-4">สารอาหารหลัก</p>
              <div className="space-y-3">
                <MacroBar label="โปรตีน" current={65}  max={100} color="#22c55e" />
                <MacroBar label="คาร์บ"   current={180} max={250} color="#3b82f6" />
                <MacroBar label="ไขมัน"   current={45}  max={70}  color="#f97316" />
              </div>
            </div>

            {/* Water */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-300">น้ำ</p>
              <p className="text-4xl font-bold text-slate-100">1.2 <span className="text-base font-normal text-slate-400">/ 2.0 ลิตร</span></p>
              <div className="space-y-1">
                <div className="h-2.5 bg-slate-700 rounded-lg overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-lg" style={{ width: "60%" }} />
                </div>
                <p className="text-xs text-slate-400">60% ของเป้าหมาย</p>
              </div>
            </div>
          </div>

          {/* Row 2 — TDEE form + right cards */}
          <div className="grid gap-4 xl:grid-cols-3">
            {/* TDEE calculator (takes 2/3) */}
            <div ref={tdeeFormRef} className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-slate-200">คำนวณ BMR / TDEE ของคุณ</h3>
                <p className="text-sm text-slate-400 mt-0.5">ระบุข้อมูลเพื่อคำนวณพลังงานที่ร่างกายต้องการในแต่ละวัน</p>
              </div>

              <form onSubmit={handleSubmit(onCalculate)} className="space-y-5">
                {/* Gender + basic fields */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {/* Gender */}
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">เพศ</label>
                    <div className="flex rounded-xl border border-slate-600 overflow-hidden text-sm">
                      {(["male", "female"] as const).map((g) => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          className={`flex-1 py-2.5 font-medium transition ${
                            gender === g ? "bg-emerald-500 text-white" : "text-slate-300 hover:bg-slate-700"
                          }`}>
                          {g === "male" ? "ชาย" : "หญิง"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <Controller
                    name="age"
                    control={control}
                    rules={{ required: "กรุณากรอกอายุ" }}
                    render={({ field }) => (
                      <TextInput label="อายุ" value={field.value} onChange={field.onChange} type="number" min={1} max={120} unit="ปี" error={errors.age?.message} />
                    )}
                  />

                  {/* Weight */}
                  <Controller
                    name="weight"
                    control={control}
                    rules={{ required: "กรุณากรอกน้ำหนัก" }}
                    render={({ field }) => (
                      <TextInput label="น้ำหนัก" value={field.value} onChange={field.onChange} type="number" min={1} unit="กก." error={errors.weight?.message} />
                    )}
                  />

                  {/* Height */}
                  <Controller
                    name="height"
                    control={control}
                    rules={{ required: "กรุณากรอกส่วนสูง" }}
                    render={({ field }) => (
                      <TextInput label="ส่วนสูง" value={field.value} onChange={field.onChange} type="number" min={1} unit="ซม." error={errors.height?.message} />
                    )}
                  />
                </div>

                {/* Activity + Formula */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="activity"
                    control={control}
                    rules={{ required: "กรุณาเลือกระดับกิจกรรม" }}
                    render={({ field }) => (
                      <SelectInput label="ระดับกิจกรรม" value={field.value} onChange={field.onChange} error={errors.activity?.message}>
                        <option value="" disabled>-- เลือกระดับกิจกรรม --</option>
                        {ACTIVITY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label} (×{o.mult})</option>
                        ))}
                      </SelectInput>
                    )}
                  />
                  <Controller
                    name="formula"
                    control={control}
                    rules={{ required: "กรุณาเลือกสูตร" }}
                    render={({ field }) => (
                      <SelectInput label="สูตรการประมาณค่า BMR" value={field.value} onChange={field.onChange} error={errors.formula?.message}>
                        <option value="" disabled>-- เลือกสูตร --</option>
                        {FORMULA_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </SelectInput>
                    )}
                  />
                </div>

                {/* Body fat % — only for Katch-McArdle */}
                {watchedFormula === "katch" && (
                  <Controller
                    name="bodyFat"
                    control={control}
                    render={({ field }) => (
                      <TextInput label="เปอร์เซ็นต์ไขมันในร่างกาย" value={field.value} onChange={field.onChange} type="number" min={1} max={60} placeholder="20" unit="%" className="max-w-xs" />
                    )}
                  />
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                    <Calculator className="h-4 w-4" />
                    คำนวณ
                  </button>
                  <button type="button" onClick={resetForm}
                    className="flex items-center gap-1.5 text-sm text-slate-400 border border-slate-600 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition">
                    <RefreshCw className="h-4 w-4" />
                    ล้างข้อมูล
                  </button>
                </div>
              </form>

              {/* Result */}
              {result && (
                <div className="rounded-xl border border-amber-700/50 bg-amber-900/30 p-4 space-y-4">
                  {/* BMR + TDEE */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">อัตราการเผาผลาญพื้นฐาน (BMR)</p>
                      <p className="text-xl font-bold text-slate-200">{result.bmr.toLocaleString()} <span className="text-sm font-normal text-slate-400">kcal/วัน</span></p>
                    </div>
                    <div className="sm:border-l sm:border-amber-700/50 sm:pl-3">
                      <p className="text-xs text-slate-400 mb-0.5">พลังงานที่ต้องการในแต่ละวัน (TDEE)</p>
                      <p className="text-xl font-bold text-emerald-400">{result.tdee.toLocaleString()} <span className="text-sm font-normal text-slate-400">kcal/วัน</span></p>
                    </div>
                  </div>

                  {/* Goal table */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">แคลอรี่ตามเป้าหมาย</p>
                    <div className="rounded-lg overflow-hidden border border-amber-700/50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-amber-900/50 text-slate-300">
                            <th className="text-left px-3 py-2 font-medium">เป้าหมาย</th>
                            <th className="text-center px-3 py-2 font-medium hidden sm:table-cell">เปลี่ยนแปลง</th>
                            <th className="text-right px-3 py-2 font-medium">kcal/วัน</th>
                            <th className="text-right px-3 py-2 font-medium">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {GOAL_ROWS.map((row, i) => {
                            const kcal = Math.max(result.tdee + row.delta, 1200);
                            const pct  = Math.round((kcal / result.tdee) * 100);
                            const isMaintain = row.delta === 0;
                            return (
                              <tr key={row.label}
                                className={`border-t border-amber-800/40 ${isMaintain ? "bg-emerald-900/30 font-semibold" : i % 2 === 0 ? "bg-transparent" : "bg-amber-900/10"}`}>
                                <td className={`px-3 py-2 ${isMaintain ? "text-emerald-400" : "text-slate-300"}`}>{row.label}</td>
                                <td className="px-3 py-2 text-center text-slate-500 hidden sm:table-cell">{row.change}</td>
                                <td className={`px-3 py-2 text-right ${isMaintain ? "text-emerald-400" : "text-slate-200"}`}>{kcal.toLocaleString()}</td>
                                <td className={`px-3 py-2 text-right ${isMaintain ? "text-emerald-400" : "text-slate-400"}`}>{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      ค่าที่คำนวณได้เป็นเพียงค่าประมาณ สภาพร่างกายแต่ละคนอาจแตกต่างกัน
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right — 2 stacked cards */}
            <div className="flex flex-col gap-4">
              {/* Macro proportion */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex flex-col gap-4">
                <p className="text-sm font-semibold text-slate-300">สัดส่วนสารอาหาร</p>
                <MacroDonut proteinPct={22} carbsPct={56} fatPct={22} />
                <button className="text-sm font-medium text-emerald-400 border border-emerald-700/60 rounded-xl py-2 hover:bg-emerald-900/30 transition">
                  ดูรายละเอียด
                </button>
              </div>

              {/* Nutrition score */}
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex flex-col gap-3">
                <p className="text-sm font-semibold text-slate-300">คะแนนโภชนาการ</p>
                <div className="flex flex-col items-center text-center gap-2 py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-900/50 flex items-center justify-center">
                    <Smile className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-200">ดีมาก</p>
                  <p className="text-xs text-slate-400 leading-relaxed">คุณได้รับสารอาหารครบถ้วน<br />ทำได้ดีมาก! รักษาสมดุลนี้ต่อไป</p>
                </div>
                <button className="text-sm font-medium text-emerald-400 border border-emerald-700/60 rounded-xl py-2 hover:bg-emerald-900/30 transition">
                  ดูคำแนะนำ
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <div className="text-5xl mb-4">🚧</div>
          <p className="text-lg font-medium text-slate-400">กำลังพัฒนา</p>
          <p className="text-sm mt-1">ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้</p>
        </div>
      )}
    </AppShell>
  );
}

