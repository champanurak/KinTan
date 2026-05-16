"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import {
  ChevronLeft, ChevronRight, Download, TrendingDown, TrendingUp,
  ShoppingCart, ScanLine, Package, AlertTriangle, Gift, ExternalLink,
  Wallet, PiggyBank, Receipt, Calendar,
} from "lucide-react";

const TABS = ["ภาพรวม", "ค่าใช้จ่าย", "วัตถุดิบ", "เมนู", "รายงาน"];

// ─── Line Chart ────────────────────────────────────────────────────────────────
const PERIOD_DATA = {
  week: [
    { label: "6–12 พ.ย.",    value: 1850.30 },
    { label: "13–19 พ.ย.",   value: 2120.45 },
    { label: "20–26 พ.ย.",   value: 1980.20 },
    { label: "27พ.ย.–2มิ.", value: 2800.10 },
    { label: "3–9 มิ.",      value: 2450.75 },
  ],
  month: [
    { label: "ม.ค.",  value: 8200 },
    { label: "ก.พ.",  value: 7500 },
    { label: "มี.ค.", value: 9100 },
    { label: "เม.ย.", value: 8800 },
    { label: "พ.ค.",  value: 9600 },
    { label: "มิ.ย.", value: 10200 },
  ],
  year: [
    { label: "2563", value: 88000 },
    { label: "2564", value: 95000 },
    { label: "2565", value: 102000 },
    { label: "2566", value: 98500 },
    { label: "2567", value: 112000 },
  ],
};

const PERIOD_OPTIONS = [
  { value: "week",  label: "รายสัปดาห์" },
  { value: "month", label: "รายเดือน" },
  { value: "year",  label: "รายปี" },
] as const;

type PeriodKey = keyof typeof PERIOD_DATA;

const PAD = { l: 52, r: 20, t: 20, b: 44 };
const W = 500; const H = 190;
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;

function buildChart(data: { label: string; value: number }[]) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const rawMax = maxVal * 1.25;
  const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const maxY = Math.ceil(rawMax / mag) * mag;
  const steps = 5;
  const stepSize = maxY / steps;
  const gridVals = Array.from({ length: steps }, (_, i) => Math.round(stepSize * (i + 1)));

  const cxFn = (i: number) => PAD.l + (i / Math.max(data.length - 1, 1)) * CW;
  const cyFn = (v: number) => PAD.t + (1 - v / maxY) * CH;

  const pts = data.map((d, i) => `${cxFn(i)},${cyFn(d.value)}`).join(" L ");
  const linePath = `M ${pts}`;
  const areaPath = `M ${cxFn(0)},${PAD.t + CH} L ${pts} L ${cxFn(data.length - 1)},${PAD.t + CH} Z`;

  return { maxY, gridVals, cxFn, cyFn, linePath, areaPath };
}

// ─── Expiring items ────────────────────────────────────────────────────────────
const EXPIRING = [
  { emoji: "🥛", name: "นมสด",       qty: "1 ลิตร",  used: 78, wasting: 14, wasted: 8,  left: "เหลือ 1 กล่อง",  exp: "8 มิ.ย. 2567",  totalValue: 2000 },
  { emoji: "🥬", name: "ผักกาดหอม",  qty: "1 หัว",   used: 60, wasting: 20, wasted: 20, left: "เหลือ 1 หัว",    exp: "6 มิ.ย. 2567",  totalValue: 200  },
  { emoji: "🌭", name: "ไส้กรอกไก่", qty: "1 แพ็ก",  used: 50, wasting: 30, wasted: 20, left: "เหลือ 1 แพ็ก",  exp: "5 มิ.ย. 2567",  totalValue: 150  },
  { emoji: "🍜", name: "เส้นหมี่",    qty: "1 ห่อ",  used: 30, wasting: 40, wasted: 30, left: "เหลือ 1 ห่อ",   exp: "4 มิ.ย. 2567",  totalValue: 100  },
  { emoji: "🫙", name: "โยเกิร์ต",   qty: "1 ถ้วย", used: 20, wasting: 30, wasted: 50, left: "เหลือ 2 ถ้วย",  exp: "3 มิ.ย. 2567",  totalValue: 180  },
];

// ─── Category donut ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "ผักและผลไม้",              pct: 42, amount: "฿1,029.50", color: "#22c55e" },
  { label: "เนื้อสัตว์และอาหารทะเล",   pct: 28, amount: "฿686.20",   color: "#f97316" },
  { label: "เครื่องดื่มและเครื่องปรุง", pct: 15, amount: "฿367.50",   color: "#3b82f6" },
  { label: "ขนมขบเคี้ยวและของแห้ง",    pct: 10, amount: "฿245.55",   color: "#a855f7" },
  { label: "อื่นๆ",                    pct:  5, amount: "฿122.00",   color: "#94a3b8" },
];

function buildGradient(cats: typeof CATEGORIES) {
  let cursor = 0;
  return cats.map((c) => {
    const start = cursor;
    cursor += c.pct;
    return `${c.color} ${start}% ${cursor}%`;
  }).join(", ");
}

// ─── Popular menus (fallback if no stats yet) ───────────────────────────────────────────────
const DEFAULT_TOP_MENUS = [
  { name: "ผัดกะเพราไก่", times: 8, img: "/recipes/pad-krapao.svg",  emoji: "🌿" },
  { name: "สุกี้น้ำใส",   times: 6, img: "/recipes/suki-clear.svg",  emoji: "🍲" },
  { name: "มาม่าต้มยำไก่", times: 5, img: "/recipes/mama-tomyum.svg", emoji: "🍜" },
];

// ─── Expense tab data ──────────────────────────────────────────────────────────────
const STORES = [
  { name: "Lotus\u2019s", amount: 950.75,  pct: 38.8, color: "#22c55e",  logo: "/partners/lotuss-icon.svg" },
  { name: "Makro",     amount: 620.30,  pct: 25.3, color: "#dc2626",  logo: "/partners/makro.ico" },
  { name: "Tops",      amount: 450.80,  pct: 18.4, color: "#3b82f6",  logo: "/partners/tops.png" },
  { name: "Big C",     amount: 280.60,  pct: 11.4, color: "#f59e0b",  logo: "/partners/bigc-icon.svg" },
  { name: "อื่น×",      amount: 148.30,  pct:  6.1, color: "#a855f7",  logo: "" },
];

const PURCHASES = [
  { date: "9 มิ.ย. 2567", items: "ผักสด, อกไก่, นมสด, ไข่ไก่",   store: "Lotus\u2019s", storeLogo: "/partners/lotuss-icon.svg", storeBg: "bg-green-500", storeInit: "L", category: "ผักและผลไม้, เนื้อสัตว์, นม", total: 345.50 },
  { date: "8 มิ.ย. 2567", items: "เนื้อวัว, มันฝรั่ง, แครอท",         store: "Makro",      storeLogo: "/partners/makro.ico",        storeBg: "bg-red-600",   storeInit: "M", category: "เนื้อสัตว์, ผักและผลไม้",       total: 560.30 },
  { date: "7 มิ.ย. 2567", items: "ข้าวสาร, น้ำมันพืช, ซีอิ้ว",       store: "Tops",       storeLogo: "/partners/tops.png",         storeBg: "bg-blue-500",  storeInit: "T", category: "ของแห้งและเครื่องปรุง",                   total: 320.75 },
  { date: "6 มิ.ย. 2567", items: "ไข่ไก่, นมสด, โยเกิร์ต",              store: "Big C",      storeLogo: "/partners/bigc-icon.svg",    storeBg: "bg-amber-500", storeInit: "B", category: "นม, ไข่",                                   total: 210.50 },
  { date: "5 มิ.ย. 2567", items: "ผลไม้รวม, น้ำผึ้ง",                   store: "7-Eleven",   storeLogo: "/partners/7eleven.png",      storeBg: "bg-rose-500",  storeInit: "7", category: "ผักและผลไม้, เครื่องดื่ม",                total: 120.25 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [topMenus, setTopMenus] = useState(DEFAULT_TOP_MENUS);
  const [menuCarouselIdx, setMenuCarouselIdx] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<PeriodKey>("week");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [expChartPeriod, setExpChartPeriod] = useState<PeriodKey>("week");
  const [expPeriodOpen, setExpPeriodOpen] = useState(false);

  const activeData = PERIOD_DATA[chartPeriod];
  const chart = buildChart(activeData);
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === chartPeriod)!.label;
  const compareLabel = chartPeriod === "week" ? "สัปดาห์ก่อน" : chartPeriod === "month" ? "เดือนก่อน" : "ปีก่อน";
  const chartTitle = chartPeriod === "week" ? "ค่าใช้จ่ายรายสัปดาห์" : chartPeriod === "month" ? "ค่าใช้จ่ายรายเดือน" : "ค่าใช้จ่ายรายปี";

  const expActiveData = PERIOD_DATA[expChartPeriod];
  const expChart = buildChart(expActiveData);
  const expPeriodLabel = PERIOD_OPTIONS.find((o) => o.value === expChartPeriod)!.label;
  const expChartTitle = expChartPeriod === "week" ? "ค่าใช้จ่ายรายสัปดาห์" : expChartPeriod === "month" ? "ค่าใช้จ่ายรายเดือน" : "ค่าใช้จ่ายรายปี";
  const expCompareLabel = expChartPeriod === "week" ? "สัปดาห์ก่อน" : expChartPeriod === "month" ? "เดือนก่อน" : "ปีก่อน";
  const expTotal = expActiveData.reduce((s, d) => s + d.value, 0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cook_stats");
      if (!raw) return;
      const stats: Record<string, { name: string; emoji: string; img?: string; count: number }> = JSON.parse(raw);
      const dynamic = Object.entries(stats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 3)
        .map(([, s]) => ({ name: s.name, times: s.count, img: s.img ?? "", emoji: s.emoji }));
      if (dynamic.length > 0) setTopMenus(dynamic);
    } catch {}
  }, []);

  const dateAction = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 border border-slate-700 rounded-xl px-3 py-1.5 bg-slate-800">
        <button className="p-0.5 hover:bg-slate-700 rounded transition">
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </button>
        <span className="text-sm font-medium text-slate-300 px-1 whitespace-nowrap">3 – 9 มิ.ย. 2567</span>
        <button className="p-0.5 hover:bg-slate-700 rounded transition">
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        <button className="p-0.5 hover:bg-slate-700 rounded transition ml-1">
          <Calendar className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl px-3 py-2 bg-slate-800 hover:bg-slate-700 transition whitespace-nowrap">
        <Download className="h-4 w-4" />
        ดาวน์โหลดรายงาน
      </button>
    </div>
  );

  return (
    <AppShell
      title="สถิติ & รายงาน 📊"
      subtitle="ภาพรวมข้อมูลการจัดการวัตถุดิบและค่าใช้จ่าย"
      headerAction={dateAction}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === i ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        <div className="space-y-5">

          {/* ── Row 1: 5 stat cards ─────────────────────────────────────── */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {/* ค่าใช้จ่ายรวม */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">ค่าใช้จ่ายรวม</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-emerald-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">฿2,450.75</p>
              <p className="text-xs text-red-400 mt-1 flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> 12.5% จากสัปดาห์ก่อน
              </p>
            </div>
            {/* รายการสแกน */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">รายการสแกนใบเสร็จ</span>
                <span className="w-7 h-7 rounded-lg bg-orange-900/50 flex items-center justify-center">
                  <ScanLine className="h-4 w-4 text-orange-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">18</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 5 รายการ จากสัปดาห์ก่อน
              </p>
            </div>
            {/* วัตถุดิบทั้งหมด */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">วัตถุดิบทั้งหมด</span>
                <span className="w-7 h-7 rounded-lg bg-blue-900/50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">128 <span className="text-sm font-normal text-slate-400">รายการ</span></p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 12 รายการ จากสัปดาห์ก่อน
              </p>
            </div>
            {/* วัตถุดิบใกล้หมดอายุ */}
            <div className="rounded-2xl border border-red-900/50 bg-red-900/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-red-400">วัตถุดิบใกล้หมดอายุ</span>
                <span className="w-7 h-7 rounded-lg bg-red-900/60 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">12 <span className="text-sm font-normal text-slate-400">รายการ</span></p>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 3 รายการ จากสัปดาห์ก่อน
              </p>
            </div>
            {/* มูลค่าคงเหลือ */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">มูลค่าวัตถุดิบคงเหลือ</span>
                <span className="w-7 h-7 rounded-lg bg-purple-900/50 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-purple-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">฿1,250</p>
              <p className="text-xs text-slate-400 mt-1">ประเมินจากราคาปัจจุบัน</p>
            </div>
          </div>

          {/* ── Row 2: Chart + Expiring table ──────────────────────────── */}
          <div className="grid gap-4 xl:grid-cols-5">
            {/* Line chart (2/5) */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">{chartTitle}</h3>
                {/* Period dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setPeriodOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-600 rounded-lg px-2.5 py-1 hover:bg-slate-700 transition"
                  >
                    {periodLabel}
                    <ChevronRight className={`h-3 w-3 transition-transform ${periodOpen ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                  {periodOpen && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-28 rounded-xl border border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setChartPeriod(opt.value); setPeriodOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition hover:bg-slate-700 ${
                            chartPeriod === opt.value ? "font-semibold text-emerald-400 bg-emerald-900/30" : "text-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 190 }}>
                {/* Grid lines */}
                {chart.gridVals.map((v) => (
                  <g key={v}>
                    <line x1={PAD.l} y1={chart.cyFn(v)} x2={W - PAD.r} y2={chart.cyFn(v)} stroke="#1e293b" strokeWidth="1" />
                    <text x={PAD.l - 6} y={chart.cyFn(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                      {v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : v}
                    </text>
                  </g>
                ))}
                {/* Area fill */}
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <path d={chart.areaPath} fill="url(#areaGrad)" />
                {/* Line */}
                <path d={chart.linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {/* Data points + labels */}
                {activeData.map((d, i) => (
                  <g key={i}>
                    <circle cx={chart.cxFn(i)} cy={chart.cyFn(d.value)} r="4" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                    {i === activeData.length - 1 && (
                      <text x={chart.cxFn(i)} y={chart.cyFn(d.value) - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="#16a34a">
                        {d.value >= 1000
                          ? d.value.toLocaleString("th-TH", { maximumFractionDigits: 0 })
                          : d.value.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </text>
                    )}
                    <text x={chart.cxFn(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
                  </g>
                ))}
              </svg>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <span>เปรียบเทียบกับ{compareLabel}</span>
                <span className="text-red-500 font-medium flex items-center gap-0.5 ml-1">
                  <TrendingDown className="h-3 w-3" /> 12.5%
                </span>
              </div>
            </div>

            {/* Expiring items table (3/5) */}
            <div className="xl:col-span-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">สินค้าหมดอายุก่อนใช้งาน</h3>
                <button className="text-xs text-emerald-600 flex items-center gap-0.5 hover:underline">
                  ดูทั้งหมด <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <div>
                {EXPIRING.map((item) => {
                  const usedAmt    = Math.round(item.totalValue * item.used    / 100);
                  const wastingAmt = Math.round(item.totalValue * item.wasting / 100);
                  const wastedAmt  = Math.round(item.totalValue * item.wasted  / 100);
                  return (
                    <div key={item.name} className="py-3 border-b border-slate-700/40 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl leading-none">{item.emoji}</span>
                          <div>
                            <p className="text-xs font-medium text-slate-200 leading-tight">{item.name}</p>
                            <p className="text-[11px] text-slate-400">{item.qty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs shrink-0 ml-3">
                          <span className="text-slate-400">{item.left}</span>
                          <span className="text-slate-500 whitespace-nowrap">{item.exp}</span>
                        </div>
                      </div>
                      <div className="flex h-6 rounded-full overflow-hidden text-[10px] font-medium">
                        {item.used > 0 && (
                          <div className="bg-emerald-400 flex items-center overflow-hidden shrink-0 text-white" style={{ width: `${item.used}%` }}>
                            <span className="px-2.5 whitespace-nowrap">ใช้ไป {item.used}% (฿{usedAmt.toLocaleString()})</span>
                          </div>
                        )}
                        {item.wasting > 0 && (
                          <div className="bg-yellow-400 flex items-center justify-center overflow-hidden shrink-0 text-amber-900" style={{ width: `${item.wasting}%` }}>
                            <span className="px-2 whitespace-nowrap">กำลังจะเสีย {item.wasting}% (฿{wastingAmt.toLocaleString()})</span>
                          </div>
                        )}
                        {item.wasted > 0 && (
                          <div className="bg-red-400 flex items-center justify-end overflow-hidden shrink-0 text-white" style={{ width: `${item.wasted}%` }}>
                            <span className="px-2.5 whitespace-nowrap">เสียแล้ว {item.wasted}% (฿{wastedAmt.toLocaleString()})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2">
                <span className="text-xs text-slate-400">รวมมูลค่าความเสียหายโดยประมาณ</span>
                <span className="text-sm font-bold text-red-400">฿187</span>
              </div>
            </div>
          </div>

          {/* ── Row 3: Category donut + Summary + Popular menus ────────── */}
          <div className="grid gap-4 xl:grid-cols-5">
            {/* Category donut (2/5) */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">แยกตามหมวดค่าใช้จ่าย</h3>
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
                  <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${buildGradient(CATEGORIES)})` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-slate-800" style={{ width: 44, height: 44 }} />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-xs">
                  {CATEGORIES.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-400 flex-1 truncate">{c.label}</span>
                      <span className="text-slate-500">{c.pct}%</span>
                      <span className="font-medium text-slate-300 w-16 text-right">{c.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-slate-700 font-semibold text-slate-300">
                    <span>รวม</span>
                    <span>฿2,450.75</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary stats (1/5) */}
            <div className="xl:col-span-1 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">สรุปการจัดการวัตถุดิบ</h3>
              <div className="space-y-3">
                {[
                  { icon: <Package className="h-4 w-4 text-emerald-400" />, label: "สแกนวัตถุดิบเข้าใหม่", value: 28, color: "text-emerald-400" },
                  { icon: <ScanLine className="h-4 w-4 text-blue-400" />,    label: "ใช้วัตถุดิบ",          value: 45, color: "text-blue-400" },
                  { icon: <ShoppingCart className="h-4 w-4 text-slate-400" />, label: "ทิ้งวัตถุดิบ",        value: 3,  color: "text-slate-400" },
                  { icon: <AlertTriangle className="h-4 w-4 text-orange-400" />, label: "ใกล้หมดอายุ",      value: 12, color: "text-orange-400" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">{r.icon}</span>
                    <span className="text-xs text-slate-400 flex-1">{r.label}</span>
                    <span className={`text-sm font-bold ${r.color}`}>{r.value} <span className="text-xs font-normal text-slate-500">รายการ</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular menus (2/5) */}
            <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-200">เมนูยอดนิยม</h3>
              </div>
              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="flex gap-3 transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(calc(-${menuCarouselIdx} * (100% / 3 + 4px)))` }}
                  >
                    {topMenus.map((m) => (
                      <div key={m.name} className="flex-shrink-0 flex flex-col gap-1.5" style={{ width: "calc((100% - 24px) / 3)" }}>
                        <div className="rounded-xl overflow-hidden bg-slate-700 aspect-square flex items-center justify-center">
                          {m.img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl">{m.emoji}</span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-200 text-center leading-tight">{m.name}</p>
                        <p className="text-xs text-slate-500 text-center">ทำ {m.times} ครั้ง</p>
                      </div>
                    ))}
                  </div>
                </div>
                {menuCarouselIdx > 0 && (
                  <button
                    onClick={() => setMenuCarouselIdx((i) => Math.max(0, i - 1))}
                    className="absolute -left-3 top-1/3 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 shadow-sm hover:bg-slate-700 transition"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                )}
                {menuCarouselIdx < topMenus.length - 3 && (
                  <button
                    onClick={() => setMenuCarouselIdx((i) => Math.min(topMenus.length - 3, i + 1))}
                    className="absolute -right-3 top-1/3 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 shadow-sm hover:bg-slate-700 transition"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                )}
              </div>
              {topMenus.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {topMenus.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMenuCarouselIdx(Math.min(i, Math.max(0, topMenus.length - 3)))}
                      className={`h-1.5 rounded-full transition-all ${
                        i === menuCarouselIdx ? "w-4 bg-emerald-500" : "w-1.5 bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer tip ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/30 px-5 py-3 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-400">เคล็ดลับ:</span>{" "}
              วางแผนการซื้อวัตถุดิบจากรายงานค่าใช้จ่าย เพื่อช่วยลดค่าใช้จ่ายและลดของเสียจากการหมดอายุ
            </p>
          </div>

        </div>
      ) : activeTab === 1 ? (
        /* ─────────────────── TAB: ค่าใช้จ่าย ─────────────────── */
        <div className="space-y-5">

          {/* Row 1: 4 stat cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">ค่าใช้จ่ายรวม</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-emerald-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">฿2,450.75</p>
              <p className="text-xs text-red-400 mt-1 flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> 12.5% จากสัปดาห์ก่อน
              </p>
            </div>
            <div className="rounded-2xl border border-orange-900/50 bg-orange-900/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-orange-400">ค่าใช้จ่ายเฉลี่ยต่อวัน</span>
                <span className="w-7 h-7 rounded-lg bg-orange-900/60 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-orange-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">฿350.11</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 8.3% จากสัปดาห์ก่อน
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">รายการซื้อทั้งหมด</span>
                <span className="w-7 h-7 rounded-lg bg-blue-900/50 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-blue-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">18 <span className="text-sm font-normal text-slate-400">รายการ</span></p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> 3 รายการ จากสัปดาห์ก่อน
              </p>
            </div>
            <div className="rounded-2xl border border-purple-900/50 bg-purple-900/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-400">ประหยัดได้</span>
                <span className="w-7 h-7 rounded-lg bg-purple-900/60 flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-purple-400" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">฿349.35</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">จากการวางแผนเมนูและใช้วัตถุดิบในคลังให้คุ้มค่า</p>
            </div>
          </div>

          {/* Row 2: Chart + Donut + Stores */}
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Line chart */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">แนวโน้ม{expChartTitle}</h3>
                <div className="relative">
                  <button
                    onClick={() => setExpPeriodOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-600 rounded-lg px-2.5 py-1 hover:bg-slate-700 transition"
                  >
                    {expPeriodLabel}
                    <ChevronRight className={`h-3 w-3 transition-transform ${expPeriodOpen ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                  {expPeriodOpen && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-28 rounded-xl border border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
                      {PERIOD_OPTIONS.map((opt) => (
                        <button key={opt.value}
                          onClick={() => { setExpChartPeriod(opt.value); setExpPeriodOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs transition hover:bg-slate-700 ${expChartPeriod === opt.value ? "font-semibold text-emerald-400 bg-emerald-900/30" : "text-slate-300"}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
                {expChart.gridVals.map((v) => (
                  <g key={v}>
                    <line x1={PAD.l} y1={expChart.cyFn(v)} x2={W - PAD.r} y2={expChart.cyFn(v)} stroke="#1e293b" strokeWidth="1" />
                    <text x={PAD.l - 6} y={expChart.cyFn(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                      {v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : v}
                    </text>
                  </g>
                ))}
                <defs>
                  <linearGradient id="expAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <path d={expChart.areaPath} fill="url(#expAreaGrad)" />
                <path d={expChart.linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {expActiveData.map((d, i) => (
                  <g key={i}>
                    <circle cx={expChart.cxFn(i)} cy={expChart.cyFn(d.value)} r="4" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                    <text x={expChart.cxFn(i)} y={expChart.cyFn(d.value) - 9} textAnchor="middle" fontSize="9" fontWeight="600" fill="#16a34a">
                      {d.value >= 1000 ? d.value.toLocaleString("th-TH", { maximumFractionDigits: 0 }) : d.value.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </text>
                    <text x={expChart.cxFn(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
                  </g>
                ))}
              </svg>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400">
                <span>รวมค่าใช้จ่าย {expActiveData.length} {expChartPeriod === "week" ? "สัปดาห์" : expChartPeriod === "month" ? "เดือน" : "ปี"}ล่าสุด: <span className="font-semibold text-slate-300">฿{expTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span></span>
                <span className="text-red-500 font-medium flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> 12.5% ({expCompareLabel})
                </span>
              </div>
            </div>

            {/* Category donut */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">ค่าใช้จ่ายตามหมวดหมู่</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
                  <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${buildGradient(CATEGORIES)})` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-slate-800" style={{ width: 44, height: 44 }} />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 text-xs">
                  {CATEGORIES.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-400 flex-1 truncate">{c.label}</span>
                      <span className="text-slate-500">{c.pct}%</span>
                      <span className="font-medium text-slate-300 w-16 text-right">{c.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-slate-700 font-semibold text-slate-300">
                    <span>รวม</span><span>฿2,450.75</span>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full text-xs text-emerald-400 border border-emerald-700/60 rounded-lg py-1.5 hover:bg-emerald-900/30 transition">ดูรายละเอียด</button>
            </div>

            {/* Stores */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">ค่าใช้จ่ายตามแหล่งซื้อ</h3>
              <div className="space-y-4">
                {STORES.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-700 border border-slate-600 flex-shrink-0">
                          {s.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">•••</span>
                          )}
                        </span>
                        <span className="text-sm font-medium text-slate-300">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-200">฿{s.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs text-slate-400 ml-1.5">({s.pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-700 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-700 text-xs font-semibold text-slate-300">
                  <span>รวม</span><span>฿2,450.75</span>
                </div>
              </div>
              <button className="mt-3 w-full text-xs text-emerald-400 border border-emerald-700/60 rounded-lg py-1.5 hover:bg-emerald-900/30 transition">ดูรายละเอียด</button>
            </div>
          </div>

          {/* Row 3: Purchases table + Comparison */}
          <div className="grid gap-4 xl:grid-cols-5">
            {/* Purchases table */}
            <div className="xl:col-span-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">รายการซื้อล่าสุด</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[500px]">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700">
                      <th className="text-left pb-2 font-medium w-24">วันที่</th>
                      <th className="text-left pb-2 font-medium">รายการ</th>
                      <th className="text-left pb-2 font-medium">ร้านค้า</th>
                      <th className="text-left pb-2 font-medium">หมวดหมู่</th>
                      <th className="text-right pb-2 font-medium">ยอดรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PURCHASES.map((p) => (
                      <tr key={p.date} className="border-b border-slate-700/40 hover:bg-slate-700/30 transition">
                        <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">{p.date}</td>
                        <td className="py-2.5 pr-3 text-slate-300 max-w-[140px] truncate">{p.items}</td>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-slate-700 border border-slate-600 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.storeLogo} alt={p.store} className="w-full h-full object-contain" />
                            </span>
                            <span className="text-slate-300 whitespace-nowrap">{p.store}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-400 max-w-[120px] truncate">{p.category}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-200 whitespace-nowrap">฿{p.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-4 w-full text-xs text-emerald-400 border border-emerald-700/60 rounded-lg py-2 hover:bg-emerald-900/30 transition font-medium">ดูรายการซื้อทั้งหมด</button>
            </div>

            {/* Comparison + tip */}
            <div className="xl:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">เปรียบเทียบค่าใช้จ่าย</h3>
                <p className="text-xs text-slate-400 mb-4">เปรียบเทียบกับช่วงเวลาเดิม</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-emerald-900/30 border border-emerald-800/60 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">สัปดาห์นี้</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">3 – 9 มิ.ย. 2567</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">฿2,450.75</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-700/50 border border-slate-600/60 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">สัปดาห์ก่อน</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">27 พ.ย. – 2 มิ. 2567</p>
                    </div>
                    <p className="text-lg font-bold text-slate-200">฿2,800.10</p>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-slate-400 font-medium">ประหยัดได้</span>
                    <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                      <TrendingDown className="h-3.5 w-3.5" /> 12.5%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/30 px-5 py-4 flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-1">เคล็ดลับ</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    วางแผนเมนูล่วงหน้าและเลือกซื้อวัตถุดิบเท่าที่จำเป็น ช่วยลดค่าใช้จ่ายได้ 10–15% ต่อสัปดาห์
                  </p>
                </div>
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
