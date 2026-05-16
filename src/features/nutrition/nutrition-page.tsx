"use client";

import { useRef, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  ChevronLeft, ChevronRight, ChevronDown, Calendar, Info,
  RefreshCw, Calculator, Smile,
} from "lucide-react";

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
          <circle cx={60} cy={60} r={r} fill="none" stroke="#e2e8f0" strokeWidth={12} />
          <circle cx={60} cy={60} r={r} fill="none" stroke="#22c55e" strokeWidth={12}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900 leading-tight">{kcal.toLocaleString()}</span>
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
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500 font-medium">{current}/{max} g</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
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
          <div className="rounded-full bg-white" style={{ width: 44, height: 44 }} />
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
            <span className="text-slate-700 w-14">{m.label}</span>
            <span className="font-bold text-slate-800 ml-auto">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [gender, setGender]     = useState<"male" | "female">("male");
  const [age, setAge]           = useState("");
  const [weight, setWeight]     = useState("");
  const [height, setHeight]     = useState("");
  const [bodyFat, setBodyFat]   = useState("");
  const [activity, setActivity] = useState("");
  const [formula, setFormula]   = useState("");
  const [result, setResult]     = useState<TDEEResult | null>(null);
  const tdeeFormRef             = useRef<HTMLDivElement>(null);

  function calculateTDEE() {
    const a = parseInt(age) || 25;
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 175;
    const f = parseFloat(bodyFat) || 20;

    let bmr: number;
    if (formula === "mifflin") {
      bmr = gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
    } else if (formula === "harris") {
      bmr = gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    } else {
      // Katch-McArdle
      bmr = 370 + 21.6 * (1 - f / 100) * w;
    }

    const mult = ACTIVITY_OPTIONS.find((o) => o.value === activity)?.mult ?? 1.2;
    const tdee = Math.round(bmr * mult);
    setResult({ bmr: Math.round(bmr), tdee });
  }

  function resetForm() {
    setGender("male"); setAge(""); setWeight(""); setHeight("");
    setBodyFat(""); setActivity(""); setFormula(""); setResult(null);
  }

  function scrollToForm() {
    tdeeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const tdeeValue = result?.tdee ?? 0;

  const dateAction = (
    <div className="flex items-center gap-1">
      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition">
        <ChevronLeft className="h-4 w-4 text-slate-500" />
      </button>
      <span className="text-sm font-medium text-slate-700 px-1 whitespace-nowrap">วันนี้, 10 มิ.ย. 2567</span>
      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition">
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </button>
      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition ml-0.5">
        <Calendar className="h-4 w-4 text-slate-500" />
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
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === i
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-700">TDEE ของฉัน</span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div>
                {tdeeValue > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-900">{tdeeValue.toLocaleString()} <span className="text-base font-normal text-slate-500">kcal / วัน</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">พลังงานที่ร่างกายต้องการต่อวัน</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">ยังไม่ได้กรอกข้อมูล</p>
                )}
              </div>
              <button
                onClick={scrollToForm}
                className="mt-auto text-sm font-medium text-emerald-600 border border-emerald-300 rounded-xl py-2 hover:bg-emerald-50 transition"
              >
                กรอก / แก้ไข TDEE
              </button>
            </div>

            {/* Energy today */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">พลังงานที่กินวันนี้</p>
              <EnergyDonut kcal={1650} goal={tdeeValue} />
            </div>

            {/* Macros */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-700 mb-4">สารอาหารหลัก</p>
              <div className="space-y-3">
                <MacroBar label="โปรตีน" current={65}  max={100} color="#22c55e" />
                <MacroBar label="คาร์บ"   current={180} max={250} color="#3b82f6" />
                <MacroBar label="ไขมัน"   current={45}  max={70}  color="#f97316" />
              </div>
            </div>

            {/* Water */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-700">น้ำ</p>
              <p className="text-2xl font-bold text-slate-900">1.2 <span className="text-base font-normal text-slate-500">/ 2.0 ลิตร</span></p>
              <div className="space-y-1">
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: "60%" }} />
                </div>
                <p className="text-xs text-slate-500">60% ของเป้าหมาย</p>
              </div>
            </div>
          </div>

          {/* Row 2 — TDEE form + right cards */}
          <div className="grid gap-4 xl:grid-cols-3">
            {/* TDEE calculator (takes 2/3) */}
            <div ref={tdeeFormRef} className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <h3 className="font-semibold text-slate-800">คำนวณ BMR / TDEE ของคุณ</h3>
                <p className="text-sm text-slate-500 mt-0.5">ระบุข้อมูลเพื่อคำนวณพลังงานที่ร่างกายต้องการในแต่ละวัน</p>
              </div>

              {/* Gender + basic fields */}
              <div className="grid gap-4 sm:grid-cols-4">
                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">เพศ</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm">
                    {(["male", "female"] as const).map((g) => (
                      <button key={g} onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 font-medium transition ${
                          gender === g ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}>
                        {g === "male" ? "ชาย" : "หญิง"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">อายุ</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
                    <input value={age} onChange={(e) => setAge(e.target.value)}
                      className="w-full text-sm outline-none text-slate-800 bg-white" placeholder="" type="number" min={1} max={120} />
                    <span className="text-xs text-slate-400 flex-shrink-0">ปี</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">น้ำหนัก</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
                    <input value={weight} onChange={(e) => setWeight(e.target.value)}
                      className="w-full text-sm outline-none text-slate-800 bg-white" placeholder="" type="number" min={1} />
                    <span className="text-xs text-slate-400 flex-shrink-0">กก.</span>
                  </div>
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">ส่วนสูง</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
                    <input value={height} onChange={(e) => setHeight(e.target.value)}
                      className="w-full text-sm outline-none text-slate-800 bg-white" placeholder="" type="number" min={1} />
                    <span className="text-xs text-slate-400 flex-shrink-0">ซม.</span>
                  </div>
                </div>
              </div>

              {/* Activity + Formula */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">ระดับกิจกรรม</label>
                  <div className="relative">
                    <select value={activity} onChange={(e) => setActivity(e.target.value)}
                      className="w-full appearance-none text-sm border border-slate-200 rounded-xl px-3 pr-9 py-2.5 outline-none text-slate-800 bg-white cursor-pointer">
                      <option value="" disabled>-- เลือกระดับกิจกรรม --</option>
                      {ACTIVITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label} (×{o.mult})</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">สูตรการประมาณค่า BMR</label>
                  <div className="relative">
                    <select value={formula} onChange={(e) => setFormula(e.target.value)}
                      className="w-full appearance-none text-sm border border-slate-200 rounded-xl px-3 pr-9 py-2.5 outline-none text-slate-800 bg-white cursor-pointer">
                      <option value="" disabled>-- เลือกสูตร --</option>
                      {FORMULA_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Body fat % — only for Katch-McArdle */}
              {formula === "katch" && (
                <div className="space-y-1.5 max-w-xs">
                  <label className="text-xs font-medium text-slate-600">เปอร์เซ็นต์ไขมันในร่างกาย</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
                    <input value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                      className="w-full text-sm outline-none text-slate-800 bg-white" placeholder="20" type="number" min={1} max={60} />
                    <span className="text-xs text-slate-400 flex-shrink-0">%</span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={calculateTDEE}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                  <Calculator className="h-4 w-4" />
                  คำนวณ
                </button>
                <button onClick={resetForm}
                  className="flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition">
                  <RefreshCw className="h-4 w-4" />
                  ล้างข้อมูล
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-4">
                  {/* BMR + TDEE */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">อัตราการเผาผลาญพื้นฐาน (BMR)</p>
                      <p className="text-xl font-bold text-slate-800">{result.bmr.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal/วัน</span></p>
                    </div>
                    <div className="sm:border-l sm:border-amber-200 sm:pl-3">
                      <p className="text-xs text-slate-500 mb-0.5">พลังงานที่ต้องการในแต่ละวัน (TDEE)</p>
                      <p className="text-xl font-bold text-emerald-700">{result.tdee.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal/วัน</span></p>
                    </div>
                  </div>

                  {/* Goal table */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">แคลอรี่ตามเป้าหมาย</p>
                    <div className="rounded-lg overflow-hidden border border-amber-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-amber-100 text-slate-600">
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
                                className={`border-t border-amber-100 ${isMaintain ? "bg-emerald-50 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}`}>
                                <td className={`px-3 py-2 ${isMaintain ? "text-emerald-700" : "text-slate-700"}`}>{row.label}</td>
                                <td className="px-3 py-2 text-center text-slate-500 hidden sm:table-cell">{row.change}</td>
                                <td className={`px-3 py-2 text-right ${isMaintain ? "text-emerald-700" : "text-slate-800"}`}>{kcal.toLocaleString()}</td>
                                <td className={`px-3 py-2 text-right ${isMaintain ? "text-emerald-700" : "text-slate-500"}`}>{pct}%</td>
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4">
                <p className="text-sm font-semibold text-slate-700">สัดส่วนสารอาหาร</p>
                <MacroDonut proteinPct={22} carbsPct={56} fatPct={22} />
                <button className="text-sm font-medium text-emerald-600 border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
                  ดูรายละเอียด
                </button>
              </div>

              {/* Nutrition score */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
                <p className="text-sm font-semibold text-slate-700">คะแนนโภชนาการ</p>
                <div className="flex flex-col items-center text-center gap-2 py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Smile className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">ดีมาก</p>
                  <p className="text-xs text-slate-500 leading-relaxed">คุณได้รับสารอาหารครบถ้วน<br />ทำได้ดีมาก! รักษาสมดุลนี้ต่อไป</p>
                </div>
                <button className="text-sm font-medium text-emerald-600 border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
                  ดูคำแนะนำ
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🚧</div>
          <p className="text-lg font-medium text-slate-500">กำลังพัฒนา</p>
          <p className="text-sm mt-1">ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้</p>
        </div>
      )}
    </AppShell>
  );
}

