"use client";

import { useState, useRef, useMemo, Fragment, useEffect } from "react";
import { Camera, ImageIcon, Filter, Check, Plus, FileText, X, Loader2, ScanLine, Sun, AlignCenter, Store, Lock, RefreshCw, MoreVertical, ChevronDown, Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import AppShell from "@/components/layout/app-shell";
import { usePantryStore, type PantryCategory } from "@/store/pantry-store";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";
import AddItemDialog from "./add-item-dialog";

type Item = {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  category: string;
};

const CATEGORY_EMOJI: Record<string, string> = {
  "โปรตีน": "🥩",
  "ผักและผลไม้": "🥦",
  "นมและผลิตภัณฑ์นม": "🥛",
  "แป้งและข้าวเม็ด": "🌾",
  "เครื่องปรุง": "🧂",
  "เครื่องดื่ม": "🥤",
  "ของหวานและขนม": "🍯",
  "ของใช้ในบ้าน": "🧹",
  // pantry defaults
  "เนื้อสัตว์": "🥩",
  "นมและเนย": "🥛"
};

function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? "📦";
}

const CATEGORY_PRESETS_SC: Record<string, { icon: string; color: string }> = {
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

function presetForCategory(name: string) {
  return CATEGORY_PRESETS_SC[name] ?? { icon: "🗂️", color: "bg-slate-100 text-slate-700 ring-slate-200" };
}

const COMMON_UNITS = ["ชิ้น", "ขวด", "กิโลกรัม", "กรัม", "แพ็ค", "โหล", "ลิตร", "มิลลิลิตร", "ฟอง", "ถุง", "กล่อง", "ห่อ"];

const PRODUCT_IMG_KEYWORDS: [string, string][] = [
  ["ไก่",    "/products/chicken.svg"],
  ["นม",     "/products/milk.svg"],
  ["ผัก",    "/products/lettuce.svg"],
  ["บะหมี่", "/products/instant-noodle.svg"],
];
function productImage(name: string): string | null {
  const match = PRODUCT_IMG_KEYWORDS.find(([kw]) => name.includes(kw));
  return match ? match[1] : null;
}

/** Try to match an AI-assigned category to the closest existing pantry category */
function matchToPantry(aiCat: string, pantryCategories: PantryCategory[]): string {
  const names = pantryCategories.map((c) => c.name);
  // 1. Exact match
  if (names.includes(aiCat)) return aiCat;
  // 2. Prefix / substring match (e.g. "นมและผลิตภัณฑ์นม" → "นมและเนย")
  const sub = names.find(
    (n) => n.includes(aiCat.slice(0, 3)) || aiCat.includes(n.slice(0, 3))
  );
  if (sub) return sub;
  // 3. No match — keep AI category (will be created as new on save)
  return aiCat;
}

export default function ScanReceiptPage() {
  const { addItems, addCategory, categories: pantryCategories } = usePantryStore();
  const [step, setStep] = useState(1);
  const [isAddingMoreReceipts, setIsAddingMoreReceipts] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  // Demo mode: ?demo=2 in URL loads step 2 with mock items
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "2") {
      setItems([
        { id: 1, name: "อกไก่ 500 ก.", unit: "ชิ้น", price: 65, quantity: 1, category: "เนื้อสัตว์" },
        { id: 2, name: "นมสด 1 ขวด", unit: "ขวด", price: 42, quantity: 1, category: "เครื่องดื่ม" },
        { id: 3, name: "ไข่ไก่ 10 ฟอง", unit: "ชิ้น", price: 45, quantity: 1, category: "อาหารแช่แข็ง" },
      ]);
      setStep(2);
    }
  }, []);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      if (isAddingMoreReceipts) {
        // When adding more receipts, call API and merge results
        setIsAddingMoreReceipts(false);
        analyzeFile(file, true);
      } else {
        // First receipt scan — show image preview
        setUploadedImageUrl(imageUrl);
        setUploadedFile(file);
        setAnalyzeError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeFile = async (file: File, merge = false) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const mapped: Item[] = (data.items ?? []).map(
        (it: { name: string; price?: number; quantity?: number; unit?: string; category?: string }) => ({
          id: Date.now() + Math.random(),
          name: it.name,
          price: it.price ?? 0,
          quantity: it.quantity ?? 1,
          unit: it.unit ?? "ชิ้น",
          // auto-match AI category to closest existing pantry category
          category: matchToPantry(it.category ?? "อื่นๆ", usePantryStore.getState().categories),
        })
      );
      if (mapped.length === 0) throw new Error("no_items");
      setItems((prev) => merge ? [...prev, ...mapped] : mapped);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message === "no_items"
        ? "ไม่พบรายการในใบเสร็จ กรุณาลองใหม่"
        : "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่";
      setAnalyzeError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      handleImageUpload(file);
      // Reset input so same file can be selected again
      e.currentTarget.value = "";
    }
  };

  const updateItemQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const updateItemCategory = (id: number, category: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, category } : item)));
  };

  const handleAddMoreReceipts = () => {
    setIsAddingMoreReceipts(true);
    cameraInputRef.current?.click();
  };

  // ── Step 2 helpers ──────────────────────────────────────
  const [closedCategories, setClosedCategories] = useState<Set<string>>(new Set());
  const [showItemMenu, setShowItemMenu] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const groupedItems = useMemo(() => {
    const map = new Map<string, Item[]>();
    items.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const toggleLocalCategory = (cat: string) => {
    setClosedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItemUnit = (id: number, unit: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unit } : item)));
  };

  // ── Edit item inline ──────────────────────────────────
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Item>>({});

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditDraft({ name: item.name, price: item.price, quantity: item.quantity, unit: item.unit, category: item.category });
    setShowItemMenu(null);
  };
  const commitEdit = () => {
    if (editingItemId === null) return;
    setItems((prev) => prev.map((it) => it.id === editingItemId ? { ...it, ...editDraft } as Item : it));
    setEditingItemId(null);
  };
  const cancelEdit = () => setEditingItemId(null);

  // ── Rename category (reassign all items in group) ─────
  const [categoryPopover, setCategoryPopover] = useState<string | null>(null);

  const reassignCategory = (oldName: string, newName: string) => {
    setItems((prev) => prev.map((it) => it.category === oldName ? { ...it, category: newName } : it));
    setCategoryPopover(null);
  };

  // ── Add new category from popover ───────────────
  const [showNewCatDialog, setShowNewCatDialog] = useState(false);
  const [newCatDialogName, setNewCatDialogName] = useState("");
  const [newCatDialogError, setNewCatDialogError] = useState("");
  const [newCatDialogSource, setNewCatDialogSource] = useState<string | null>(null);
  const newCatInputRef = useRef<HTMLInputElement>(null);

  function openNewCatDialog(sourceCat: string) {
    setNewCatDialogSource(sourceCat);
    setNewCatDialogName("");
    setNewCatDialogError("");
    setCategoryPopover(null);
    setShowNewCatDialog(true);
    setTimeout(() => newCatInputRef.current?.focus(), 50);
  }

  function handleSaveNewCat() {
    const trimmed = newCatDialogName.trim();
    if (!trimmed) { setNewCatDialogError("กรุณากรอกชื่อหมวดหมู่"); return; }
    if (pantryCategories.some((c) => c.name === trimmed)) {
      setNewCatDialogError("มีหมวดหมู่นี้อยู่แล้ว"); return;
    }
    const p = presetForCategory(trimmed);
    addCategory({ name: trimmed, icon: p.icon, color: p.color, open: true });
    setShowNewCatDialog(false);
    // เปิด popover กลับมาเพื่อให้หมวดหมู่ใหม่ปรากฏในลิสต์
    setCategoryPopover(newCatDialogSource);
  }

  const clearAllItems = () => {
    setItems([]);
    setClosedCategories(new Set());
  };

  const handleSaveTopantry = async () => {
    // Auto-create pantry categories for items with categories not yet in pantry
    const existingNames = new Set(pantryCategories.map((c) => c.name));
    items.forEach((item) => {
      if (!existingNames.has(item.category)) {
        existingNames.add(item.category);
        addCategory({
          name: item.category,
          icon: categoryEmoji(item.category),
          color: "bg-purple-100 text-purple-700 ring-purple-200",
          open: true,
        });
      }
    });

    const categorizedItems = items.map((item) => ({
      ...item,
      createdAt: new Date().toISOString(),
      id: Date.now() + Math.random(),
    }));
    addItems(categorizedItems);
    setStep(3);
  };

  const stepConfig = [
    { num: 1, label: "สแกนใบเสร็จ" },
    { num: 2, label: "ตรวจสอบรายการ" },
    { num: 3, label: "บันทึกสินค้า" },
  ];

  return (
    <>
      <AppShell title="สแกนใบเสร็จ" subtitle="อัปโหลดรูปใบเสร็จเพื่อแยกรายการสินค้าอัตโนมัติ">
      {/* Step Indicator */}
      <div className="mb-6 flex items-center rounded-2xl border border-slate-700 bg-slate-800/60 px-6 py-5">
        {stepConfig.map((config, idx) => (
          <Fragment key={config.num}>
            {/* Circle + Label */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition ${
                  step >= config.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-600 text-slate-400"
                }`}
              >
                {config.num}
              </div>
              <p className={`text-xs font-medium text-center ${step >= config.num ? "text-emerald-400" : "text-slate-500"}`}>
                {config.label}
              </p>
            </div>

            {/* Connector line between steps */}
            {idx < stepConfig.length - 1 && (
              <div className={`h-0.5 flex-1 mx-4 mb-5 transition ${step > config.num ? "bg-emerald-600" : "bg-slate-600"}`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step 1: Scan Receipt */}
      {step === 1 && (
        <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Camera Input */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-emerald-700/60 bg-emerald-900/30 p-6 transition hover:bg-emerald-900/50"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-100">สแกนใบเสร็จ</p>
                  <p className="text-xs text-slate-400 mt-0.5">ถ่ายรูปใบเสร็จเพื่อสแกนอัตโนมัติ</p>
                </div>
              </div>
            </button>

            <p className="my-4 text-center text-sm text-slate-500">หรือ</p>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700 flex items-center justify-center gap-2"
            >
              <ImageIcon className="h-5 w-5" />
              อัปโหลดรูปจากแกลเลอรี่
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Right: Receipt Preview — shows uploaded image or empty state */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex items-center justify-center min-h-[240px]">
            {uploadedImageUrl ? (
              <div className="w-full space-y-4">
                <div className="relative">
                  <img
                    src={uploadedImageUrl}
                    alt="รูปใบเสร็จ"
                    className="w-full rounded-xl object-contain max-h-72"
                  />
                  <button
                    onClick={() => setUploadedImageUrl(null)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => uploadedFile && analyzeFile(uploadedFile)}
                  disabled={analyzing || !uploadedFile}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI กำลังวิเคราะห์...
                    </>
                  ) : (
                    "วิเคราะห์ใบเสร็จ ✨"
                  )}
                </button>
                {analyzeError && (
                  <p className="text-xs text-red-400 text-center">{analyzeError}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600 bg-slate-700/50">
                  <FileText className="h-7 w-7 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">ไม่มีข้อมูล</p>
                  <p className="text-xs text-slate-500 mt-1">สแกนหรืออัปโหลดใบเสร็จ<br />เพื่อแสดงรายการสินค้า</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <p className="mb-4 font-semibold text-slate-100">เคล็ดลับในการสแกนใบเสร็จ</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {([
              { Icon: ScanLine,    title: "ถ่ายให้ชัดเจน",   desc: "ภาพต้องคมชัด มองเห็นตัวหนังสือครบถ้วน" },
              { Icon: Sun,         title: "แสงเพียงพอ",      desc: "หลีกเลี่ยงแสงสะท้อนและเงาบนกระดาษ" },
              { Icon: AlignCenter, title: "วางให้ตรง",       desc: "ให้ใบเสร็จอยู่ในกรอบและไม่เอียง" },
              { Icon: Store,       title: "รองรับทุกร้าน",   desc: "รองรับใบเสร็จจากร้านค้าทั่วไปและซูเปอร์มาร์เก็ต" },
            ] as const).map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-slate-700/40 bg-slate-800/50 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-900/40">
                  <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-900/20 border border-emerald-700/30 px-4 py-2.5">
            <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
            <p className="text-xs text-slate-400">ข้อมูลใบเสร็จของคุณจะถูกเก็บเป็นความลับ และใช้เพื่อการจัดการของคุณเท่านั้น</p>
          </div>
        </div>
        </div>
      )}

      {/* Step 2: Review Items */}
      {/* dismiss popover on outside click */}
      {step === 2 && (
        <div
          className="grid gap-5 lg:grid-cols-[1fr_320px]"
          onClick={() => { setShowItemMenu(null); setCategoryPopover(null); }}
        >

          {/* ── Left panel: Items list ─────────────────────── */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">

            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100">รายการสินค้าที่ตรวจพบ</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setClosedCategories(new Set()); }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  จัดกลุ่มอัตโนมัติใหม่
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); clearAllItems(); }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-900/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  ล้างรายการทั้งหมด
                </button>
              </div>
            </div>

            {/* AI info banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-2.5">
              <span className="shrink-0 text-sm text-emerald-400">✨</span>
              <p className="text-xs text-emerald-300">AI แบ่งประเภทสินค้าให้แล้ว คุณสามารถแก้ไขสินค้า ปริมาณ หรือหมวดหมู่ได้</p>
            </div>

            {/* Items grouped by category */}
            <div className="space-y-3">
              {groupedItems.map(([cat, catItems]) => {
                const isClosed = closedCategories.has(cat);
                const catIcon = pantryCategories.find((c) => c.name === cat)?.icon ?? categoryEmoji(cat);
                const allCategories = [
                  ...pantryCategories.map((c) => c.name),
                  ...items.filter((it) => !pantryCategories.some((c) => c.name === it.category)).map((it) => it.category),
                ].filter((v, i, a) => a.indexOf(v) === i);

                return (
                  <div key={cat} className="rounded-xl border border-slate-700/60">

                    {/* Category header */}
                    <div className="flex items-center justify-between rounded-t-xl bg-slate-700/30 px-4 py-2.5">
                      <button
                        onClick={() => toggleLocalCategory(cat)}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <span className="text-base leading-none">{catIcon}</span>
                        <span className="text-sm font-semibold text-slate-200">{cat}</span>
                        <span className="text-xs text-slate-400">({catItems.length})</span>
                      </button>

                      {/* แก้ไขหมวดหมู่ popover button */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setCategoryPopover(categoryPopover === cat ? null : cat)}
                          className="mr-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                        >
                          <Pencil className="h-3 w-3" />
                          แก้ไขหมวดหมู่
                        </button>
                        {categoryPopover === cat && (
                          <div className="absolute left-0 top-8 z-20 min-w-[180px] rounded-xl border border-slate-600 bg-slate-800 py-1.5 shadow-xl">
                            <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">เปลี่ยนเป็นหมวด</p>
                            {allCategories.filter((c) => c !== cat).map((c) => {
                              const icon = pantryCategories.find((p) => p.name === c)?.icon ?? categoryEmoji(c);
                              return (
                                <button
                                  key={c}
                                  onClick={() => reassignCategory(cat, c)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                                >
                                  <span>{icon}</span>{c}
                                </button>
                              );
                            })}
                            <div className="mt-1 border-t border-slate-700/60 pt-1">
                              <button
                                onClick={() => openNewCatDialog(cat)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-700"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                เพิ่มหมวดหมู่ใหม่
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button onClick={() => toggleLocalCategory(cat)} className="text-slate-400">
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isClosed ? "" : "rotate-180"}`} />
                      </button>
                    </div>

                    {/* Item rows */}
                    {!isClosed && (
                      <div className="divide-y divide-slate-700/40">
                        {catItems.map((item) => {
                          const imgSrc = productImage(item.name);
                          const isEditing = editingItemId === item.id;

                          return (
                            <div key={item.id}>
                              {isEditing ? (
                                /* ── Inline edit row ── */
                                <div className="flex flex-col gap-3 bg-slate-700/20 px-4 py-3">
                                  <div className="flex gap-2">
                                    <TextInput
                                      className="min-w-0 flex-1"
                                      autoFocus
                                      value={editDraft.name ?? ""}
                                      onChange={(v) => setEditDraft((d) => ({ ...d, name: v }))}
                                      placeholder="ชื่อสินค้า"
                                    />
                                    <TextInput
                                      className="w-24"
                                      type="number"
                                      min={0}
                                      step={0.01}
                                      value={editDraft.price != null ? String(editDraft.price) : ""}
                                      onChange={(v) => setEditDraft((d) => ({ ...d, price: parseFloat(v) || 0 }))}
                                      placeholder="ราคา"
                                      unit="฿"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <SelectInput
                                      value={editDraft.unit ?? "ชิ้น"}
                                      onChange={(v) => setEditDraft((d) => ({ ...d, unit: v }))}
                                    >
                                      {COMMON_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                    </SelectInput>
                                    <SelectInput
                                      className="flex-1"
                                      value={editDraft.category ?? cat}
                                      onChange={(v) => setEditDraft((d) => ({ ...d, category: v }))}
                                    >
                                      {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </SelectInput>
                                    <div className="ml-auto flex gap-2">
                                      <button onClick={cancelEdit} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">ยกเลิก</button>
                                      <button onClick={commitEdit} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">บันทึก</button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* ── Normal display row ── */
                                <div className="flex items-center gap-3 px-4 py-3">
                                  {/* Product image / emoji */}
                                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-700/50">
                                    {imgSrc ? (
                                      <Image src={imgSrc} alt={item.name} fill className="object-contain p-1" />
                                    ) : (
                                      <span className="text-xl leading-none">{categoryEmoji(item.category)}</span>
                                    )}
                                  </div>

                                  {/* Name + price */}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
                                    <p className="text-xs text-slate-400">{item.price.toFixed(2)} บาท · {item.unit}</p>
                                  </div>

                                  {/* Qty controls */}
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >−</button>
                                    <span className="w-6 text-center text-sm font-semibold text-slate-100">{item.quantity}</span>
                                    <button
                                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >+</button>
                                  </div>

                                  {/* Unit dropdown */}
                                  <select
                                    value={item.unit}
                                    onChange={(e) => updateItemUnit(item.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="shrink-0 cursor-pointer rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
                                  >
                                    {COMMON_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                  </select>

                                  {/* Line total */}
                                  <span className="w-14 shrink-0 text-right text-sm font-semibold text-slate-100">
                                    {(item.price * item.quantity).toFixed(2)}
                                  </span>

                                  {/* ⋮ menu */}
                                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => setShowItemMenu(showItemMenu === item.id ? null : item.id)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                    {showItemMenu === item.id && (
                                      <div className="absolute right-0 top-8 z-10 min-w-[140px] rounded-xl border border-slate-600 bg-slate-800 py-1 shadow-lg">
                                        <button
                                          onClick={() => startEditItem(item)}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                                        >
                                          <Pencil className="h-4 w-4 text-slate-400" />
                                          แก้ไขรายการ
                                        </button>
                                        <button
                                          onClick={() => { removeItem(item.id); setShowItemMenu(null); }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          ลบรายการ
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add item button */}
            <button
              onClick={() => setShowAddDialog(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600 py-3 text-sm text-slate-400 transition hover:border-emerald-600 hover:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              เพิ่มรายการสินค้า
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">หากมีสินค้าในใบเสร็จที่ AI ตรวจไม่พบ คุณสามารถเพิ่มเองได้</p>

            {/* Summary row */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-3">
              <Check className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">ตรวจพบสินค้า {items.length} รายการ</p>
                <p className="text-xs font-semibold text-emerald-400">รวมทั้งหมด {totalPrice.toFixed(2)} บาท</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setStep(1); setUploadedImageUrl(null); }}
                className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSaveTopantry}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
              >
                ถัดไป: บันทึกสินค้า
              </button>
            </div>
          </div>

          {/* ── Right panel: Receipt preview + summary ────── */}
          <div className="flex flex-col gap-4">
            {/* Receipt image */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-100">ตัวอย่างใบเสร็จ</p>
              {uploadedImageUrl ? (
                <img src={uploadedImageUrl} alt="ใบเสร็จ" className="w-full rounded-xl object-contain" style={{ maxHeight: 260 }} />
              ) : (
                <div className="flex h-44 items-center justify-center rounded-xl bg-slate-700/40">
                  <FileText className="h-10 w-10 text-slate-500" />
                </div>
              )}
            </div>

            {/* Summary table */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-100">สรุปยอดรวม</p>
              <div className="space-y-2.5">
                {[
                  { label: "จำนวนรายการ", value: `${items.length} รายการ`, muted: false },
                  { label: "ราคารวม",      value: `${totalPrice.toFixed(2)} บาท`, muted: false },
                  { label: "ส่วนลด",       value: "-", muted: true },
                  { label: "ภาษี (ถ้ามี)", value: "-", muted: true },
                ].map(({ label, value, muted }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className={muted ? "text-slate-500" : "text-slate-200"}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-700/60 pt-2.5">
                  <span className="font-semibold text-slate-100">ยอดสุทธิ</span>
                  <span className="font-bold text-emerald-400">{totalPrice.toFixed(2)} บาท</span>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-900/20 px-4 py-2.5">
              <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
              <p className="text-xs text-slate-400">ข้อมูลใบเสร็จของคุณจะถูกเก็บเป็นความลับ และใช้เพื่อการจัดการของคุณเท่านั้น</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/50 mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">บันทึกเสร็จสิ้น</h3>
            <p className="text-slate-400">สินค้า {items.length} รายการได้ถูกบันทึกเข้าคลังของคุณแล้ว</p>
          </div>

          <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-4 mb-6">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{categoryEmoji(item.category)}</span>
                    <div className="min-w-0">
                      <span className="text-slate-200 font-medium">{item.name} × {item.quantity}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.category}</p>
                    </div>
                  </div>
                  <span className="font-medium text-slate-200 shrink-0">{(item.price * item.quantity).toFixed(2)} บาท</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-600 mt-3 pt-3 flex justify-between font-semibold">
              <span className="text-slate-300">รวมทั้งหมด</span>
              <span className="text-emerald-400">{totalPrice.toFixed(2)} บาท</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setUploadedImageUrl(null);
              }}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              สแกนใบเสร็จอันถัดไป
            </button>
            <button
              onClick={() => {
                setStep(1);
                setUploadedImageUrl(null);
              }}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </AppShell>

    {/* Add Item Dialog */}
    {showAddDialog && (
      <AddItemDialog
        onAdd={(item) => {
          setItems((prev) => [
            ...prev,
            { id: Date.now(), name: item.name, unit: item.unit, price: item.price, quantity: item.quantity, category: item.category },
          ]);
          if (item.addToPantry) {
            if (!pantryCategories.some((c) => c.name === item.category)) {
              addCategory({ name: item.category, icon: "📦", color: "bg-slate-100 text-slate-700 ring-slate-200", open: false });
            }
            addItems([{
              id: Date.now(),
              name: item.name,
              unit: item.unit,
              price: item.price,
              quantity: item.quantity,
              category: item.category,
              expiresAt: item.expiryDate || undefined,
              forNutrition: item.forNutrition,
              alertExpiry: item.alertExpiry,
            }]);
          }
          setShowAddDialog(false);
        }}
        onClose={() => setShowAddDialog(false)}
      />
    )}

    {/* Add New Category Dialog (from popover) */}
    {showNewCatDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-1 text-lg font-semibold text-slate-100">เพิ่มหมวดหมู่ใหม่</h3>
          <p className="mb-4 text-sm text-slate-400">ระบุชื่อหมวดหมู่วัตถุดิบที่ต้องการเพิ่ม</p>
          <input
            ref={newCatInputRef}
            type="text"
            value={newCatDialogName}
            onChange={(e) => { setNewCatDialogName(e.target.value); setNewCatDialogError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSaveNewCat()}
            placeholder="เช่น ผักสด, เครื่องดื่ม..."
            className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {newCatDialogError && <p className="mt-2 text-xs text-red-400">{newCatDialogError}</p>}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setShowNewCatDialog(false)}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveNewCat}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
