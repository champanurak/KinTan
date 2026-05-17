"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  X, Search, Plus, Check, Lightbulb, Sparkles,
  ShoppingBasket,
} from "lucide-react";
import { usePantryStore } from "@/store/pantry-store";
import { SelectInput } from "@/components/ui/select-input";
import { TextInput } from "@/components/ui/text-input";
import { DatePicker } from "@/components/ui/date-picker";

/* ─── Category presets (same as pantry page) ─────────────────── */
const CATEGORY_PRESETS: Record<string, { icon: string; color: string }> = {
  "เนื้อสัตว์":           { icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200" },
  "โปรตีน":                { icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200" },
  "นมและเนย":              { icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  "นมและผลิตภัณฑ์นม": { icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  "เครื่องปรุง":           { icon: "🧂", color: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  "ของใช้ในบ้าน":          { icon: "🏠", color: "bg-slate-100 text-slate-700 ring-slate-200" },
  "ผักและผลไม้":           { icon: "🥦", color: "bg-green-100 text-green-700 ring-green-200" },
  "แป้งและข้าวเมล็ด":     { icon: "🌾", color: "bg-amber-100 text-amber-700 ring-amber-200" },
  "เครื่องดื่ม":           { icon: "🥤", color: "bg-cyan-100 text-cyan-700 ring-cyan-200" },
  "อาหารแช่แข็ง":         { icon: "🧧", color: "bg-sky-100 text-sky-700 ring-sky-200" },
  "อื่นๆ":                 { icon: "📦", color: "bg-purple-100 text-purple-700 ring-purple-200" },
};

function presetFor(name: string) {
  return CATEGORY_PRESETS[name] ?? { icon: "🗂️", color: "bg-slate-100 text-slate-700 ring-slate-200" };
}

/* ─── AI knowledge base ──────────────────────────────────────── */
interface AiEntry {
  keywords: string[];
  category: string;
  unit: string;
  shelfMin: number;
  shelfMax: number;
  tip: string;
  nutrition: { protein: number; carb: number; fat: number; kcal: number };
}

const AI_DB: AiEntry[] = [
  {
    keywords: ["ไก่", "อกไก่", "น่องไก่", "ปีกไก่", "ซี่โครงไก่"],
    category: "เนื้อสัตว์", unit: "ชิ้น", shelfMin: 3, shelfMax: 5,
    tip: "ควรเก็บในตู้เย็น อุณหภูมิ 0–4°C เพื่อความสด หรือแช่แข็งได้นาน 3 เดือน",
    nutrition: { protein: 23, carb: 0, fat: 1.2, kcal: 110 },
  },
  {
    keywords: ["หมู", "เนื้อหมู", "สันหมู", "คอหมู"],
    category: "เนื้อสัตว์", unit: "กรัม", shelfMin: 3, shelfMax: 5,
    tip: "ควรเก็บในตู้เย็น 0–4°C แช่แข็งได้นาน 3 เดือน",
    nutrition: { protein: 20, carb: 0, fat: 7, kcal: 150 },
  },
  {
    keywords: ["วัว", "เนื้อวัว", "สันโค"],
    category: "เนื้อสัตว์", unit: "กรัม", shelfMin: 3, shelfMax: 5,
    tip: "เก็บในตู้เย็นที่ 0–4°C ไม่เกิน 5 วัน หรือแช่แข็ง 6–12 เดือน",
    nutrition: { protein: 26, carb: 0, fat: 15, kcal: 250 },
  },
  {
    keywords: ["ปลา", "ปลาทู", "ปลาทูน่า", "ปลาแซลมอน"],
    category: "เนื้อสัตว์", unit: "ชิ้น", shelfMin: 1, shelfMax: 2,
    tip: "ปลาสดเน่าเสียเร็ว ควรแช่แข็งหากไม่ใช้ภายใน 1–2 วัน",
    nutrition: { protein: 20, carb: 0, fat: 5, kcal: 120 },
  },
  {
    keywords: ["กุ้ง", "หอย", "ปู", "หมึก"],
    category: "เนื้อสัตว์", unit: "กรัม", shelfMin: 1, shelfMax: 2,
    tip: "อาหารทะเลเน่าเสียเร็ว ควรแช่แข็งหากไม่ใช้ภายใน 24 ชั่วโมง",
    nutrition: { protein: 18, carb: 1, fat: 1, kcal: 85 },
  },
  {
    keywords: ["ไข่", "ไข่ไก่", "ไข่เป็ด", "ไข่นกกระทา"],
    category: "อาหารแช่แข็ง", unit: "ฟอง", shelfMin: 21, shelfMax: 28,
    tip: "ไม่ต้องล้างก่อนเก็บ เก็บในตู้เย็นได้ 3–4 สัปดาห์",
    nutrition: { protein: 6, carb: 0.6, fat: 4.8, kcal: 72 },
  },
  {
    keywords: ["นม", "นมสด", "นมจืด"],
    category: "เครื่องดื่ม", unit: "ขวด", shelfMin: 5, shelfMax: 7,
    tip: "เก็บในตู้เย็น เปิดแล้วดื่มภายใน 3 วัน",
    nutrition: { protein: 3.4, carb: 4.8, fat: 3.6, kcal: 61 },
  },
  {
    keywords: ["ผัก", "ผักกาด", "ผักบุ้ง", "คะน้า", "ผักโขม", "บร็อคโคลี", "กะหล่ำ"],
    category: "ผักและผลไม้", unit: "กิโลกรัม", shelfMin: 3, shelfMax: 5,
    tip: "ห่อด้วยกระดาษก่อนใส่ถุง เก็บในชั้นผักของตู้เย็น",
    nutrition: { protein: 2, carb: 4, fat: 0.3, kcal: 25 },
  },
  {
    keywords: ["ผลไม้", "กล้วย", "แอปเปิ้ล", "ส้ม", "มะม่วง"],
    category: "ผักและผลไม้", unit: "ชิ้น", shelfMin: 3, shelfMax: 7,
    tip: "เก็บในที่ร่มหรือตู้เย็น หลีกเลี่ยงแสงแดดโดยตรง",
    nutrition: { protein: 0.5, carb: 20, fat: 0.2, kcal: 80 },
  },
  {
    keywords: ["บะหมี่", "มาม่า", "สำเร็จรูป"],
    category: "แป้งและข้าวเม็ด", unit: "ซอง", shelfMin: 180, shelfMax: 365,
    tip: "เก็บในที่แห้งและเย็น ไม่ต้องแช่เย็น",
    nutrition: { protein: 7, carb: 56, fat: 12, kcal: 360 },
  },
  {
    keywords: ["ข้าว", "ข้าวสาร"],
    category: "แป้งและข้าวเม็ด", unit: "กิโลกรัม", shelfMin: 180, shelfMax: 365,
    tip: "เก็บในภาชนะปิดสนิท หลีกเลี่ยงความชื้นและแมลง",
    nutrition: { protein: 2.7, carb: 28, fat: 0.3, kcal: 130 },
  },
  {
    keywords: ["น้ำมัน", "น้ำมันพืช", "น้ำมันมะกอก"],
    category: "เครื่องปรุง", unit: "ขวด", shelfMin: 180, shelfMax: 365,
    tip: "เก็บในที่มืดและเย็น หลีกเลี่ยงแสงแดดโดยตรง",
    nutrition: { protein: 0, carb: 0, fat: 14, kcal: 120 },
  },
];

function getAiSuggestion(name: string): AiEntry | null {
  if (!name.trim()) return null;
  return AI_DB.find((entry) => entry.keywords.some((kw) => name.includes(kw))) ?? null;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/* ─── Toggle component ───────────────────────────────────────── */
function Toggle({
  checked, onChange, label, sub,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex cursor-pointer items-start gap-3" onClick={() => onChange(!checked)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-400"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Main dialog ────────────────────────────────────────────── */
interface AddItemDialogProps {
  onAdd: (item: {
    name: string;
    unit: string;
    price: number;
    quantity: number;
    category: string;
    expiryDate: string;
    addToPantry: boolean;
    forNutrition: boolean;
    alertExpiry: boolean;
  }) => void;
  onClose: () => void;
}

const COMMON_UNITS = ["ชิ้น", "ขวด", "กิโลกรัม", "กรัม", "แพ็ค", "โหล", "ลิตร", "มิลลิลิตร", "ฟอง", "ถุง", "กล่อง", "ห่อ", "ซอง"];

export default function AddItemDialog({ onAdd, onClose }: AddItemDialogProps) {
  const { categories: pantryCategories, addCategory } = usePantryStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("ชิ้น");
  const [pricePerUnit, setPricePerUnit] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [addToPantry, setAddToPantry] = useState(true);
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [alertExpiry, setAlertExpiry] = useState(true);

  /* ── Add-category mini dialog ── */
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");
  const catInputRef = useRef<HTMLInputElement>(null);

  function openCatDialog() {
    setNewCatName("");
    setCatError("");
    setShowCatDialog(true);
    setTimeout(() => catInputRef.current?.focus(), 50);
  }

  function handleSaveCat() {
    const trimmed = newCatName.trim();
    if (!trimmed) { setCatError("กรุณากรอกชื่อหมวดหมู่"); return; }
    if (pantryCategories.some((c) => c.name === trimmed)) {
      setCatError("มีหมวดหมู่นี้อยู่แล้ว"); return;
    }
    const p = presetFor(trimmed);
    addCategory({ name: trimmed, icon: p.icon, color: p.color, open: true });
    setCategory(trimmed);
    setShowCatDialog(false);
  }

  const totalPrice = parseFloat(pricePerUnit || "0") * quantity;
  const ai = useMemo(() => getAiSuggestion(name), [name]);

  // Auto-fill category/unit when AI suggestion changes
  useEffect(() => {
    if (!ai) return;
    if (!category) setCategory(ai.category);
    setUnit(ai.unit);
    if (!expiryDate) setExpiryDate(addDays(ai.shelfMax));
  }, [ai]);  // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = name.trim() !== "" && (category || ai?.category);

  const doAdd = (addMore = false) => {
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      unit,
      price: parseFloat(pricePerUnit || "0"),
      quantity,
      category: category || ai?.category || "อื่นๆ",
      expiryDate,
      addToPantry,
      forNutrition: includeNutrition,
      alertExpiry,
    });
    if (addMore) {
      setName(""); setCategory(""); setQuantity(1);
      setUnit("ชิ้น"); setPricePerUnit(""); setExpiryDate("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-4 border-b border-slate-700/60 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-900/50 text-2xl">
            <ShoppingBasket className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-100">เพิ่มรายการสินค้า</h2>
            <p className="text-sm text-slate-400">กรอกข้อมูลสินค้าเพื่อเพิ่มเข้าคลังวัตถุดิบ</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="grid gap-0 md:grid-cols-[1fr_300px]">

          {/* Left: Form */}
          <div className="space-y-5 p-6">

            {/* ชื่อสินค้า */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                ชื่อสินค้า <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น อกไก่, นมสด, ไข่ไก่"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 pr-10 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                หมวดหมู่ <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <SelectInput
                  className="flex-1"
                  value={category}
                  onChange={setCategory}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {pantryCategories.map((c) => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                  {ai && !pantryCategories.some((c) => c.name === ai.category) && (
                    <option value={ai.category}>✨ {ai.category} (AI แนะนำ)</option>
                  )}
                </SelectInput>
                <button
                  type="button"
                  onClick={openCatDialog}
                  className="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-slate-600 px-3 py-2.5 text-xs text-slate-400 hover:border-emerald-600 hover:text-emerald-400">
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มหมวดหมู่
                </button>
              </div>
            </div>

            {/* จำนวน + หน่วย */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">
                  จำนวน <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-slate-600 bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-700"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="min-w-0 flex-1 bg-transparent py-2 text-center text-sm font-semibold text-slate-100 outline-none [appearance:textfield]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-400 hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">
                  หน่วย <span className="text-red-400">*</span>
                </label>
                <SelectInput value={unit} onChange={setUnit}>
                  {COMMON_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </SelectInput>
              </div>
            </div>

            {/* ราคา */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">ราคา</label>
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="ราคาต่อหน่วย"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={pricePerUnit}
                  onChange={setPricePerUnit}
                  unit="บาท"
                />
                <TextInput
                  label="ราคารวม"
                  value={totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}
                  onChange={() => {}}
                  unit="บาท"
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* วันหมดอายุ */}
            <DatePicker
              label="วันหมดอายุ"
              value={expiryDate}
              onChange={setExpiryDate}
            />

            {/* Toggles */}
            <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
              <Toggle
                checked={addToPantry}
                onChange={setAddToPantry}
                label="เพิ่มเข้าคลังทันที"
                sub="เพิ่มสินค้าเข้าคลังหลังบันทึก"
              />
              <Toggle
                checked={includeNutrition}
                onChange={setIncludeNutrition}
                label="ใช้สำหรับคำนวณโภชนาการ"
                sub="รวมในแผนอาหารและรายงาน"
              />
              <Toggle
                checked={alertExpiry}
                onChange={setAlertExpiry}
                label="แจ้งเตือนก่อนหมดอายุ"
                sub="แจ้งเตือนล่วงหน้า 2 วัน"
              />
            </div>
          </div>

          {/* Right: AI panel */}
          <div className="border-l border-slate-700/60 bg-slate-800/30 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-100">AI ผู้ช่วยแนะนำ</span>
            </div>
            <p className="mb-4 text-xs text-slate-400">ข้อมูลและคำแนะนำจาก AI เพื่อความแม่นยำ</p>

            {ai ? (
              <div className="space-y-3">
                {/* Suggestions */}
                {[
                  { label: "หมวดหมู่ที่แนะนำ", value: ai.category, isTag: true },
                  { label: "หน่วยที่แนะนำ", value: ai.unit, isTag: true },
                  { label: "อายุสินค้าโดยประมาณ", value: `${ai.shelfMin} – ${ai.shelfMax} วัน`, isTag: false },
                ].map(({ label, value, isTag }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{label}</span>
                    <div className="flex items-center gap-1.5">
                      {isTag ? (
                        <span className="rounded-full border border-emerald-700/50 bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                          {value}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-200">{value}</span>
                      )}
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                ))}

                {/* Tip */}
                <div className="mt-2 rounded-xl border border-emerald-700/30 bg-emerald-900/20 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">เคล็ดลับ</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{ai.tip}</p>
                </div>

                {/* Nutrition */}
                <div className="mt-2">
                  <p className="mb-2 text-xs text-slate-400">ข้อมูลโภชนาการต่อหน่วย <span className="text-slate-500">(โดยประมาณ)</span></p>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { label: "โปรตีน", value: `${ai.nutrition.protein} g` },
                      { label: "คาร์บ",  value: `${ai.nutrition.carb} g` },
                      { label: "ไขมัน",  value: `${ai.nutrition.fat} g` },
                      { label: "พลังงาน", value: `${ai.nutrition.kcal} kcal` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-slate-700/50 px-1.5 py-2">
                        <p className="text-[10px] text-slate-400">{label}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-100">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/50">
                  <Sparkles className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">พิมพ์ชื่อสินค้า</p>
                <p className="mt-1 text-xs text-slate-500">AI จะแนะนำข้อมูลให้อัตโนมัติ</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 border-t border-slate-700/60 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => doAdd(false)}
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            เพิ่มสินค้า
          </button>
          <button
            onClick={() => doAdd(true)}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-xl border border-emerald-600/70 bg-emerald-900/30 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            เพิ่มต่อ
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Add Category Dialog ── */}
      {showCatDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-100 mb-1">เพิ่มหมวดหมู่ใหม่</h3>
            <p className="text-sm text-slate-400 mb-4">ระบุชื่อหมวดหมู่วัตถุดิบที่ต้องการเพิ่ม</p>
            <input
              ref={catInputRef}
              type="text"
              value={newCatName}
              onChange={(e) => { setNewCatName(e.target.value); setCatError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCat()}
              placeholder="เช่น ผักสด, เครื่องดื่ม..."
              className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {catError && <p className="mt-2 text-xs text-red-400">{catError}</p>}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCatDialog(false)}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveCat}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
