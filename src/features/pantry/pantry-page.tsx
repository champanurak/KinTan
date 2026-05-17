"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ChevronDown, Trash2, TriangleAlert } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { usePantryStore, type PantryItem, type PantryCategory } from "@/store/pantry-store";

/* ─── Type alias (for local backwards compat) ─── */
type Category = PantryCategory;

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


export default function PantryPage() {
  const { categories, items, addCategory, removeCategory, toggleCategory } = usePantryStore();
  const [showDialog, setShowDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-create categories for items that have an unregistered category */
  useEffect(() => {
    const state = usePantryStore.getState();
    const catNames = new Set(state.categories.map(c => c.name));
    items.forEach(it => {
      if (it.category && !catNames.has(it.category)) {
        catNames.add(it.category);
        const p = presetFor(it.category);
        state.addCategory({ name: it.category, icon: p.icon, color: p.color, open: true });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
    addCategory({ name: trimmed, icon: p.icon, color: p.color, open: true });
    setShowDialog(false);
  }

  /* delete category */
  function openDeleteDialog(name: string) {
    setDeleteTarget(name);
  }

  function handleDeleteCategory() {
    if (!deleteTarget) return;
    removeCategory(deleteTarget);
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
          <h2 className="text-xl font-semibold text-slate-100">รายการวัตถุดิบ</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {categories.length} หมวดหมู่ · {totalItems} รายการทั้งหมด
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Collapse list */}
      <div className="space-y-3">
        {categories.map(cat => {
          const catItems = itemsFor(cat.name);
          return (
            <div key={cat.name} className="rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden shadow-sm">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${cat.open ? "rotate-180" : "-rotate-90"}`}
                  />
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ring-1 ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold text-slate-100">{cat.name}</p>
                    <p className="text-xs text-slate-400">{catItems.length} รายการ</p>
                  </div>
                </button>
                <button
                  onClick={() => openDeleteDialog(cat.name)}
                  className="ml-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-900/30 hover:text-red-400 transition"
                  title="ลบหมวดหมู่"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Collapsed content */}
              {cat.open && (
                <div className="border-t border-slate-700/60 px-5 py-3">
                  {catItems.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">ยังไม่มีรายการในหมวดหมู่นี้</p>
                  ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-700">
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
                          <tr key={it.id} className="border-b border-slate-700/40 last:border-0 hover:bg-slate-700/30">
                            <td className="py-2.5 font-medium text-slate-200">{it.name}</td>
                            <td className="py-2.5 text-center font-semibold text-slate-200">{it.quantity}</td>
                            <td className="py-2.5 text-center text-slate-400">{it.unit}</td>
                            <td className="py-2.5 text-right font-semibold text-emerald-400">{it.price != null ? it.price.toFixed(2) : "\u2014"} ฿</td>
                            <td className="py-2.5 text-right text-slate-400 text-xs">
                              {it.createdAt
                                ? new Date(it.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                                : <span className="text-slate-500">\u2014</span>
                              }
                            </td>
                            <td className={`py-2.5 text-right text-xs ${expiryClass}`}>
                              {it.expiresAt
                                ? (
                                  <span className="flex items-center justify-end gap-1">
                                    {status !== "ok" && status !== "none" && (
                                      <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                    {new Date(it.expiresAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                                  </span>
                                )
                                : <span className="text-slate-600">—</span>
                              }
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Category Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">เพิ่มหมวดหมู่ใหม่</h3>
            <p className="text-sm text-slate-400 mb-4">ระบุชื่อหมวดหมู่วัตถุดิบที่ต้องการเพิ่ม</p>
            <input
              ref={inputRef}
              type="text"
              value={newCatName}
              onChange={e => { setNewCatName(e.target.value); setDialogError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSaveCategory()}
              placeholder="เช่น ผักสด, เครื่องดื่ม..."
              className="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {dialogError && (
              <p className="mt-2 text-xs text-red-400">{dialogError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl mx-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1">ลบหมวดหมู่</h3>
            <p className="text-sm text-slate-400 mb-1">ต้องการลบหมวดหมู่</p>
            <p className="text-sm font-semibold text-slate-200 mb-4">&ldquo;{deleteTarget}&rdquo; ใช่หรือไม่?</p>
            <p className="text-xs text-slate-500 mb-5">รายการสินค้าในหมวดหมู่นี้จะไม่ถูกลบ แต่จะไม่แสดงในหมวดนี้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition"
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
