"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/app/components/app-shell";

/* ─── Types ─── */
interface PantryItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  expiresAt?: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
  open: boolean;
}

/* ─── Preset icons / colors per keyword ─── */
const CATEGORY_PRESETS: Record<string, { icon: string; color: string }> = {
  "เนื้อสัตว์":             { icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200" },
  "โปรตีน":                { icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200" },
  "นมและเนย":              { icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  "นมและผลิตภัณฑ์นม":     { icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  "เครื่องปรุง":           { icon: "🧂", color: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  "ของใช้ในบ้าน":          { icon: "🏠", color: "bg-slate-100 text-slate-700 ring-slate-200" },
  "ผักและผลไม้":           { icon: "🥦", color: "bg-green-100 text-green-700 ring-green-200" },
  "แป้งและข้าวเมล็ด":     { icon: "🌾", color: "bg-amber-100 text-amber-700 ring-amber-200" },
  "อื่นๆ":                 { icon: "📦", color: "bg-purple-100 text-purple-700 ring-purple-200" },
};

const DEFAULT_PRESET = { icon: "🗂️", color: "bg-slate-100 text-slate-700 ring-slate-200" };

function presetFor(name: string) {
  return CATEGORY_PRESETS[name] ?? DEFAULT_PRESET;
}

/* ─── Expiry helpers ─── */
function expiryStatus(expiresAt?: string): "expired" | "soon" | "ok" | "none" {
  if (!expiresAt) return "none";
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "ok";
}

/* ─── Default categories ─── */
const DEFAULT_CATEGORIES: Category[] = [
  { name: "เนื้อสัตว์",     icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200",     open: true },
  { name: "นมและเนย",       icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200",   open: true },
  { name: "เครื่องปรุง",    icon: "🧂", color: "bg-yellow-100 text-yellow-700 ring-yellow-200", open: true },
  { name: "ของใช้ในบ้าน",   icon: "🏠", color: "bg-slate-100 text-slate-700 ring-slate-200",  open: true },
];

const STORAGE_KEY_CATS = "pantry_categories";
const STORAGE_KEY_ITEMS = "pantry_items";

export default function PantryPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* load from localStorage */
  useEffect(() => {
    try {
      const storedCats = localStorage.getItem(STORAGE_KEY_CATS);
      if (storedCats) setCategories(JSON.parse(storedCats));
    } catch {}

    try {
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (storedItems) {
        const parsed: PantryItem[] = JSON.parse(storedItems);
        setItems(parsed);
        /* Auto-create categories for items that have an unregistered category */
        setCategories(prev => {
          const names = new Set(prev.map(c => c.name));
          const extra: Category[] = [];
          parsed.forEach(it => {
            if (it.category && !names.has(it.category)) {
              names.add(it.category);
              const p = presetFor(it.category);
              extra.push({ name: it.category, icon: p.icon, color: p.color, open: true });
            }
          });
          return extra.length ? [...prev, ...extra] : prev;
        });
      }
    } catch {}
  }, []);

  /* persist categories */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(categories));
  }, [categories]);

  /* toggle collapse */
  function toggleCategory(name: string) {
    setCategories(prev =>
      prev.map(c => c.name === name ? { ...c, open: !c.open } : c)
    );
  }

  /* open dialog */
  function openAddDialog() {
    setNewCatName("");
    setDialogError("");
    setShowDialog(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  /* save new category */
  function handleSaveCategory() {
    const trimmed = newCatName.trim();
    if (!trimmed) { setDialogError("กรุณากรอกชื่อหมวดหมู่"); return; }
    if (categories.some(c => c.name === trimmed)) {
      setDialogError("มีหมวดหมู่นี้อยู่แล้ว");
      return;
    }
    const p = presetFor(trimmed);
    setCategories(prev => [...prev, { name: trimmed, icon: p.icon, color: p.color, open: true }]);
    setShowDialog(false);
  }

  /* delete category */
  function openDeleteDialog(name: string) {
    setDeleteTarget(name);
  }

  function handleDeleteCategory() {
    if (!deleteTarget) return;
    setCategories(prev => prev.filter(c => c.name !== deleteTarget));
    setDeleteTarget(null);
  }

  /* items per category */
  function itemsFor(catName: string) {
    return items.filter(it => it.category === catName);
  }

  const totalItems = items.length;

  return (
    <AppShell title="คลังวัตถุดิบ" subtitle="จัดการวัตถุดิบทั้งหมดที่มีอยู่ในบ้าน">

      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">รายการวัตถุดิบ</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {categories.length} หมวดหมู่ · {totalItems} รายการทั้งหมด
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Collapse list */}
      <div className="space-y-3">
        {categories.map(cat => {
          const catItems = itemsFor(cat.name);
          return (
            <div key={cat.name} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${cat.open ? "rotate-180" : "-rotate-90"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ring-1 ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{cat.name}</p>
                    <p className="text-xs text-slate-500">{catItems.length} รายการ</p>
                  </div>
                </button>
                <button
                  onClick={() => openDeleteDialog(cat.name)}
                  className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                  title="ลบหมวดหมู่"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Collapsed content */}
              {cat.open && (
                <div className="border-t border-slate-100 px-5 py-3">
                  {catItems.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">ยังไม่มีรายการในหมวดหมู่นี้</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="py-2 text-left font-medium">ชื่อสินค้า</th>
                          <th className="py-2 text-center font-medium">จำนวน</th>
                          <th className="py-2 text-center font-medium">หน่วย</th>
                          <th className="py-2 text-right font-medium">ราคา</th>
                          <th className="py-2 text-right font-medium">วันที่เพิ่ม</th>
                          <th className="py-2 text-right font-medium">วันหมดอายุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catItems.map(it => {
                          const status = expiryStatus(it.expiresAt);
                          const expiryClass =
                            status === "expired" ? "text-red-600 font-semibold" :
                            status === "soon"    ? "text-red-500 font-semibold" :
                            "text-slate-500";
                          return (
                          <tr key={it.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                            <td className="py-2.5 font-medium text-slate-900">{it.name}</td>
                            <td className="py-2.5 text-center font-semibold text-slate-900">{it.quantity}</td>
                            <td className="py-2.5 text-center text-slate-600">{it.unit}</td>
                            <td className="py-2.5 text-right font-semibold text-emerald-700">{it.price.toFixed(2)} ฿</td>
                            <td className="py-2.5 text-right text-slate-500 text-xs">
                              {new Date(it.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                            </td>
                            <td className={`py-2.5 text-right text-xs ${expiryClass}`}>
                              {it.expiresAt
                                ? (
                                  <span className="flex items-center justify-end gap-1">
                                    {status !== "ok" && status !== "none" && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                      </svg>
                                    )}
                                    {new Date(it.expiresAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                                  </span>
                                )
                                : <span className="text-slate-300">—</span>
                              }
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">เพิ่มหมวดหมู่ใหม่</h3>
            <p className="text-sm text-slate-500 mb-4">ระบุชื่อหมวดหมู่วัตถุดิบที่ต้องการเพิ่ม</p>
            <input
              ref={inputRef}
              type="text"
              value={newCatName}
              onChange={e => { setNewCatName(e.target.value); setDialogError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSaveCategory()}
              placeholder="เช่น ผักสด, เครื่องดื่ม..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {dialogError && (
              <p className="mt-2 text-xs text-red-500">{dialogError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">ลบหมวดหมู่</h3>
            <p className="text-sm text-slate-500 mb-1">ต้องการลบหมวดหมู่</p>
            <p className="text-sm font-semibold text-slate-900 mb-4">&ldquo;{deleteTarget}&rdquo; ใช่หรือไม่?</p>
            <p className="text-xs text-slate-400 mb-5">รายการสินค้าในหมวดหมู่นี้จะไม่ถูกลบ แต่จะไม่แสดงในหมวดนี้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition"
              >
                ลบหมวดหมู่
              </button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
