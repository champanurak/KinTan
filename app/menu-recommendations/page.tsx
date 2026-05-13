"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/app-shell";

interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep: string;
  emoji: string;
  imageClass: string;
  matchKeywords: string[];
  ingredients: string[];
  steps: string[];
}

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

type RecommendedMenu = MenuItem & {
  matchedCount: number;
  matchPercent: number;
  matchedKeywords: string[];
};

const LIKED_MENUS_KEY = "liked_menu_recommendations";

const menus: MenuItem[] = [
  {
    id: "m1",
    name: "ผัดกะเพราไก่",
    calories: 520,
    protein: 35,
    carbs: 42,
    fat: 20,
    prep: "15 นาที",
    emoji: "🌿",
    imageClass: "from-emerald-100 to-lime-100",
    matchKeywords: ["ไก่", "กะเพรา", "กระเทียม", "พริก", "น้ำปลา"],
    ingredients: ["อกไก่สับ 250 กรัม", "ใบกะเพรา 1 ถ้วย", "กระเทียมสับ 1 ช้อนโต๊ะ", "พริก 5-7 เม็ด", "น้ำปลา 1 ช้อนชา"],
    steps: ["โขลกพริกกับกระเทียมพอหยาบ", "ผัดพริกกระเทียมให้หอม", "ใส่ไก่สับผัดจนสุก", "ปรุงรสและใส่ใบกะเพรา ผัดเร็วๆ แล้วปิดไฟ"],
  },
  {
    id: "m2",
    name: "สุกี้น้ำ",
    calories: 380,
    protein: 28,
    carbs: 26,
    fat: 12,
    prep: "20 นาที",
    emoji: "🍲",
    imageClass: "from-blue-100 to-cyan-100",
    matchKeywords: ["ผักกาด", "หมู", "ไก่", "วุ้นเส้น", "ไข่", "น้ำจิ้มสุกี้"],
    ingredients: ["ผักกาดขาว 1 ถ้วย", "หมูหรือไก่ 200 กรัม", "วุ้นเส้น 1 กำ", "ไข่ไก่ 1 ฟอง", "น้ำจิ้มสุกี้ 2 ช้อนโต๊ะ"],
    steps: ["ต้มน้ำซุปให้เดือด", "ใส่เนื้อสัตว์จนสุก", "เติมผักและวุ้นเส้น", "ตอกไข่ ปรุงรสด้วยน้ำจิ้มสุกี้ แล้วเสิร์ฟ"],
  },
  {
    id: "m3",
    name: "ข้าวผัดผักรวม",
    calories: 450,
    protein: 14,
    carbs: 65,
    fat: 15,
    prep: "18 นาที",
    emoji: "🍳",
    imageClass: "from-amber-100 to-orange-100",
    matchKeywords: ["ข้าว", "แครอท", "ข้าวโพด", "ไข่", "ซีอิ๊ว"],
    ingredients: ["ข้าวสวย 1.5 ถ้วย", "แครอทหั่นเต๋า 1/2 ถ้วย", "ข้าวโพด 1/2 ถ้วย", "ไข่ไก่ 1 ฟอง", "ซีอิ๊วขาว 1 ช้อนโต๊ะ"],
    steps: ["ตั้งกระทะใส่น้ำมันและผัดไข่", "ใส่ผักรวมผัดให้สุกกรอบ", "ใส่ข้าวสวยและคลุกให้เข้ากัน", "ปรุงรสด้วยซีอิ๊วและพริกไทย พร้อมเสิร์ฟ"],
  },
  {
    id: "m4",
    name: "ต้มจืดเต้าหู้หมูสับ",
    calories: 290,
    protein: 24,
    carbs: 10,
    fat: 16,
    prep: "25 นาที",
    emoji: "🥣",
    imageClass: "from-slate-100 to-blue-50",
    matchKeywords: ["เต้าหู้", "หมู", "ผักกาด", "ต้นหอม", "ซีอิ๊ว"],
    ingredients: ["เต้าหู้ไข่ 2 หลอด", "หมูสับ 200 กรัม", "ผักกาดขาว 1 ถ้วย", "ต้นหอม 1 ต้น", "ซีอิ๊วขาว 1 ช้อนชา"],
    steps: ["ต้มน้ำให้เดือดแล้วปั้นหมูสับลงหม้อ", "ใส่ผักกาดขาวและเต้าหู้", "ปรุงรสด้วยซีอิ๊วขาว", "โรยต้นหอมแล้วปิดไฟ"],
  },
];

export default function MenuRecommendationsPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [likedMenus, setLikedMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_MENUS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLikedMenus(new Set(parsed));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const loadPantryItems = () => {
      try {
        const raw = localStorage.getItem("pantry_items");
        if (!raw) {
          setPantryItems([]);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPantryItems(parsed);
        } else {
          setPantryItems([]);
        }
      } catch {
        setPantryItems([]);
      }
    };

    loadPantryItems();
    window.addEventListener("focus", loadPantryItems);
    return () => window.removeEventListener("focus", loadPantryItems);
  }, []);

  const recommendedMenus = useMemo<RecommendedMenu[]>(() => {
    if (pantryItems.length === 0) return [];

    const pantryNames = pantryItems.map((item) => item.name.toLowerCase());

    const scoredMenus = menus.map((menu) => {
      const matchedKeywords = menu.matchKeywords.filter((keyword) =>
        pantryNames.some((name) => name.includes(keyword.toLowerCase()))
      );

      const matchedCount = matchedKeywords.length;
      const matchPercent = Math.round((matchedCount / menu.matchKeywords.length) * 100);

      return {
        ...menu,
        matchedKeywords,
        matchedCount,
        matchPercent,
      };
    });

    return scoredMenus
      .filter((menu) => menu.matchedCount > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent || b.matchedCount - a.matchedCount);
  }, [pantryItems]);

  function toggleLikeMenu(menuId: string) {
    setLikedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      localStorage.setItem(LIKED_MENUS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <AppShell title="แนะนำเมนู" subtitle="เมนูที่เหมาะกับวัตถุดิบที่คุณมีอยู่ตอนนี้">
      {pantryItems.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">ยังไม่มีวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">เพิ่มวัตถุดิบจากหน้า สแกนใบเสร็จ ก่อน เพื่อให้ระบบแนะนำเมนูตามของที่มีอยู่จริง</p>
        </div>
      ) : null}

      {pantryItems.length > 0 && recommendedMenus.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
          <p className="font-semibold">ยังไม่พบเมนูที่ตรงกับวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">ลองเพิ่มวัตถุดิบให้หลากหลายขึ้น เช่น ผัก ไข่ หรือเครื่องปรุง</p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendedMenus.map((menu) => (
          <article key={menu.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${menu.imageClass} flex items-center justify-center relative overflow-hidden`}>
              <span className="text-6xl">{menu.emoji}</span>
              <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700">
                {menu.prep}
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                ตรง {menu.matchPercent}%
              </span>
              <button
                type="button"
                onClick={() => toggleLikeMenu(menu.id)}
                className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition ${likedMenus.has(menu.id) ? "border-red-200 bg-red-100 text-red-500" : "border-white/60 bg-white/85 text-slate-500 hover:bg-white"}`}
                aria-label="favorite-menu"
                title="เมนูโปรด"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={likedMenus.has(menu.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{menu.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{menu.calories} kcal · โปรตีน {menu.protein}g</p>
            <p className="mt-1 text-xs text-emerald-700">วัตถุดิบที่มี: {menu.matchedKeywords.join(" • ")}</p>
            <button
              type="button"
              onClick={() => setSelectedMenu(menu)}
              className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              ดูสูตร
            </button>
          </article>
        ))}
      </section>

      {selectedMenu && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedMenu.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">สูตร: {selectedMenu.name}</h3>
                  <p className="text-xs text-slate-500">เวลาโดยประมาณ {selectedMenu.prep}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLikeMenu(selectedMenu.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${likedMenus.has(selectedMenu.id) ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  aria-label="favorite-menu-dialog"
                  title="เมนูโปรด"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={likedMenus.has(selectedMenu.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedMenu(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <h4 className="mb-3 font-semibold text-emerald-800">ส่วนผสม</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {selectedMenu.ingredients.map((ing) => (
                      <li key={ing} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-600">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <h4 className="mb-3 font-semibold text-blue-800">วิธีทำ</h4>
                  <ol className="space-y-2 text-sm text-slate-700">
                    {selectedMenu.steps.map((step, idx) => (
                      <li key={`${selectedMenu.id}-${idx}`} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                โภชนาการต่อจาน: {selectedMenu.calories} kcal, โปรตีน {selectedMenu.protein}g, คาร์บ {selectedMenu.carbs}g, ไขมัน {selectedMenu.fat}g
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
