"use client";

import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  Lock, Leaf, CalendarDays, Heart,
  Clock, PiggyBank, ShieldCheck, Smile,
  Check, Star, Crown,
  Archive, ScanLine, Bell, BarChart2, ChefHat, Activity, Cloud, FileDown, Headphones,
} from "lucide-react";

const FEATURES = [
  { icon: <Archive className="h-3.5 w-3.5" />,    label: "จัดการวัตถุดิบไม่จำกัด",                  free: "จำกัด 50 รายการ",    premium: true },
  { icon: <ScanLine className="h-3.5 w-3.5" />,   label: "สแกนใบเสร็จ & คำนวณอัตโนมัติ",           free: "จำกัด 5 ใบ / เดือน", premium: true },
  { icon: <Bell className="h-3.5 w-3.5" />,       label: "แจ้งเตือนหมดอายุอัจฉริยะ",               free: "พื้นฐาน",             premium: true },
  { icon: <BarChart2 className="h-3.5 w-3.5" />,  label: "วิเคราะห์ค่าใช้จ่าย & รายงานเชิงลึก",   free: "พื้นฐาน",             premium: true },
  { icon: <ChefHat className="h-3.5 w-3.5" />,    label: "วางแผนเมนู & สูตรอาหารเฉพาะคุณ",         free: "—",                   premium: true },
  { icon: <Activity className="h-3.5 w-3.5" />,   label: "โภชนาการเชิงลึก (TDEE, Macro Tracking)", free: "พื้นฐาน",             premium: true },
  { icon: <Cloud className="h-3.5 w-3.5" />,      label: "สำรองข้อมูลอัตโนมัติ (Cloud)",           free: "—",                   premium: true },
  { icon: <FileDown className="h-3.5 w-3.5" />,   label: "ส่งออกข้อมูล & รายงาน",                  free: "จำกัด",               premium: true },
  { icon: <Headphones className="h-3.5 w-3.5" />, label: "ซัพพอร์ตพิเศษ",                          free: "—",                   premium: "พิเศษ" },
];

const PLANS = [
  {
    id: "monthly",
    label: "รายเดือน",
    badge: null,
    sub: "ยกเลิกเมื่อไหร่ก็ได้",
    price: "฿69",
    per: "/ เดือน",
    note: "เรียกเก็บทุกเดือน",
    highlight: false,
    perks: ["ใช้งานฟีเจอร์ Premium ทั้งหมด", "อัปเดตฟีเจอร์ใหม่ก่อนใคร", "ยกเลิกได้ตลอดเวลา"],
  },
  {
    id: "biannual",
    label: "ราย 6 เดือน",
    badge: "คุ้มค่าขึ้น",
    sub: null,
    price: "฿329",
    per: "/ 6 เดือน",
    note: "ตกเดือนละ ฿54.83",
    highlight: false,
    perks: ["ใช้งานฟีเจอร์ Premium ทั้งหมด", "ประหยัด 20% จากรายเดือน", "ซัพพอร์ตพิเศษ"],
  },
  {
    id: "annual",
    label: "รายปี",
    badge: "แนะนำ",
    sub: "คุ้มค่าที่สุด",
    price: "฿699",
    per: "/ ปี",
    note: "ตกเดือนละ ฿58.25",
    highlight: true,
    perks: ["ใช้งานฟีเจอร์ Premium ทั้งหมด", "ประหยัด 30% จากรายเดือน", "ซัพพอร์ตพิเศษ", "สิทธิ์พิเศษเฉพาะสมาชิก"],
  },
];

const TESTIMONIALS = [
  { name: "คุณผ่ผน",   role: "สมาชิก Premium", stars: 5, text: "ช่วยให้เราวางแผนอาหารได้ดีขึ้น ประหยัดค่าใช้จ่ายไปได้เยอะเลย" },
  { name: "คุณอ้อนส์", role: "สมาชิก Premium", stars: 5, text: "แจ้งเตือนหมดอายุดีมาก ไม่ทิ้งของในตู้เย็นอีกต่อไปแล้ว" },
  { name: "คุณแม่",    role: "สมาชิก Premium", stars: 5, text: "รายงานค่าใช้จ่ายดีมาก เห็นเลยว่าประหยัดขึ้นจริง" },
];

const WHY = [
  { icon: <Clock className="h-6 w-6" />,     label: "ประหยัดเวลา",  desc: "ทำงานอัตโนมัติ รวดเร็วขึ้น" },
  { icon: <PiggyBank className="h-6 w-6" />, label: "ประหยัดเงิน", desc: "ลดของเสีย ควบคุมค่าใช้จ่าย" },
  { icon: <Heart className="h-6 w-6" />,     label: "สุขภาพดี",    desc: "ติดตามโภชนาการได้อย่างแม่นยำ" },
  { icon: <Smile className="h-6 w-6" />,     label: "ใช้งานง่าย",  desc: "ออกแบบมาเพื่อคนทำกับข้าว" },
];

export default function UpgradePage() {
  const [selected, setSelected] = useState<"monthly" | "biannual" | "annual">("annual");
  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  return (
    <AppShell title="อัปเกรดเป็น Premium" subtitle="ปลดล็อกทุกความสามารถ จัดการวัตถุดิบและค่าใช้จ่ายได้อย่างมืออาชีพ">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Hero */}
        <div
          className="rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-700/40"
          style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)" }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 leading-snug">
                อัปเกรดเพื่อประสบการณ์ที่ดีกว่า
              </h2>
              <p className="mt-2 text-sm text-emerald-700 leading-relaxed">
                ช่วยให้คุณประหยัดเวลา ลดของเสีย และควบคุมค่าใช้จ่ายได้อย่างมีประสิทธิภาพ
              </p>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Lock className="h-4 w-4" />,         label: "ประหยัดเงิน\nมากขึ้น" },
                  { icon: <Leaf className="h-4 w-4" />,         label: "ลดของเสีย\nในบ้าน" },
                  { icon: <CalendarDays className="h-4 w-4" />, label: "วางแผนอาหาร\nได้ง่าย" },
                  { icon: <Heart className="h-4 w-4" />,        label: "สุขภาพดีขึ้น\nทุกวัน" },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-2 rounded-xl bg-white/70 border border-emerald-200/60 px-3 py-3 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      {f.icon}
                    </span>
                    <p className="text-[11px] font-medium text-emerald-800 leading-tight whitespace-pre-line">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex flex-shrink-0 items-end self-end pr-8">
              <img src="/illustrations/mascot-bag.svg" alt="" className="w-44 h-44 object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Feature comparison + Pricing */}
        <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">

          {/* Feature comparison */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">เปรียบเทียบฟีเจอร์</h3>
            <div className="grid grid-cols-[1fr_auto_auto] text-xs font-medium mb-1 gap-x-2 px-1">
              <span />
              <span className="w-16 text-center text-slate-400">ฟรี</span>
              <span className="w-16 flex justify-center">
                <span className="inline-block rounded-md border border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Premium
                </span>
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {FEATURES.map((f) => (
                <div key={f.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 py-2.5 px-1 text-xs">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">{f.icon}</span>
                    {f.label}
                  </span>
                  <span className="w-16 text-center text-slate-400 text-[11px]">{f.free}</span>
                  <span className="w-16 flex justify-center">
                    {f.premium === true
                      ? <Check className="h-4 w-4 text-emerald-500" />
                      : <span className="text-emerald-500 font-semibold text-[11px]">{f.premium}</span>
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing plans */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">เลือกแผนที่เหมาะกับคุณ</h3>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 dark:bg-amber-400/10 dark:border-amber-400/30 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                ประหยัดกว่า 20% เมื่อเลือกแผนรายปี
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((plan) => {
                const isSelected = selected === plan.id;
                return (
                <div
                  key={plan.id}
                  onClick={() => setSelected(plan.id as typeof selected)}
                  className={`flex flex-col rounded-xl border-2 p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/20 hover:border-emerald-300 dark:hover:border-emerald-600"
                  }`}
                >
                  {/* Selection indicator */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{plan.label}</span>
                      {plan.badge && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
                          plan.highlight
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                        }`}>{plan.badge}</span>
                      )}
                    </div>
                    <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-500"
                    }`}>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  {plan.sub && <p className="text-[10px] text-slate-400 mb-2 leading-tight">{plan.sub}</p>}
                  <div className="mt-auto">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{plan.price}</span>
                    <span className="text-[11px] text-slate-400 ml-1">{plan.per}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{plan.note}</p>
                  </div>
                </div>
                );
              })}
            </div>

            {/* ── Detail card: updates with selection ── */}
            <div className={`mt-4 rounded-xl border-2 border-emerald-500 overflow-hidden`}>
              <div className="flex flex-col sm:flex-row">
                {/* Left: what's included */}
                <div className="flex-1 p-4 bg-emerald-50 dark:bg-emerald-900/15">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">แผนที่คุณเลือก</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">Premium {selectedPlan.label}</span>
                    {selectedPlan.badge && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">{selectedPlan.badge}</span>
                    )}
                  </div>
                  {selectedPlan.sub && <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{selectedPlan.sub}</p>}
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">สิ่งที่รวมอยู่ในแผนนี้:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                    {selectedPlan.perks.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: order summary + buy button */}
                <div className="sm:w-52 p-4 bg-white dark:bg-slate-800 flex flex-col justify-between gap-3 border-t sm:border-t-0 sm:border-l border-emerald-200 dark:border-emerald-700/40">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-2 font-medium">สรุปคำสั่งซื้อ</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-300">Premium {selectedPlan.label}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedPlan.price}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedPlan.note}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">ยอดรวม</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{selectedPlan.price}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Crown className="h-4 w-4" />
                      ซื้อแพ็คเกจ{selectedPlan.label}
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> ปลอดภัย 100%</span>
                      <span className="flex items-center gap-0.5"><Check className="h-3 w-3 text-emerald-500" /> ยกเลิกได้</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">เสียงจากผู้ใช้จริง</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">❝ {t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name[2]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">ทำไมต้อง Kin-Tan Premium?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {WHY.map((w) => (
              <div key={w.label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                  {w.icon}
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{w.label}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
