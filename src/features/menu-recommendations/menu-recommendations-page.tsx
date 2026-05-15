"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, X, ShoppingCart, Lightbulb, CircleCheckBig, Minus, Plus } from "lucide-react";
import AppShell from "@/components/layout/app-shell";

interface IngredientItem {
  name: string;
  required: number;
  unit: string;
  emoji: string;
  matchKey: string;
}

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
  recipeImage?: string;
  matchKeywords: string[];
  ingredients: IngredientItem[];
  steps: string[];
  tip?: string;
}

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface IngredientStatus {
  availableText: string;
  enough: boolean;
}

function getIngredientStatus(
  ingredient: IngredientItem,
  pantryItems: PantryItem[],
  servings: number,
  baseServings = 2,
): IngredientStatus {
  const required = (ingredient.required * servings) / baseServings;
  const pantryItem = pantryItems.find(
    (p) =>
      p.name.toLowerCase().includes(ingredient.matchKey.toLowerCase()) ||
      ingredient.matchKey.toLowerCase().includes(p.name.toLowerCase()),
  );
  if (!pantryItem) {
    return {
      availableText: `ขาด ${required} ${ingredient.unit}`,
      enough: false,
    };
  }
  if (pantryItem.quantity >= required) {
    return {
      availableText: `มี ${pantryItem.quantity} ${pantryItem.unit}`,
      enough: true,
    };
  }
  const short = required - pantryItem.quantity;
  return { availableText: `ขาด ${short} ${ingredient.unit}`, enough: false };
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
    recipeImage: "/recipes/pad-krapao.svg",
    matchKeywords: ["ไก่", "กะเพรา", "กระเทียม", "พริก", "น้ำปลา"],
    ingredients: [
      {
        name: "อกไก่สับ",
        required: 250,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "ไก่",
      },
      {
        name: "ใบกะเพรา",
        required: 1,
        unit: "ถ้วย",
        emoji: "🌿",
        matchKey: "กะเพรา",
      },
      {
        name: "กระเทียมสับ",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "พริกสด",
        required: 5,
        unit: "เม็ด",
        emoji: "🌶️",
        matchKey: "พริก",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
    ],
    steps: [
      "โขลกพริกกับกระเทียมพอหยาบ",
      "ผัดพริกกระเทียมให้หอม",
      "ใส่ไก่สับผัดจนสุก",
      "ปรุงรสและใส่ใบกะเพรา ผัดเร็วๆ แล้วปิดไฟ",
    ],
    tip: "ใช้ไฟแรงและกะเพราสดเพื่อให้ได้กลิ่นหอมที่ดีที่สุด",
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
    recipeImage: "/recipes/suki-clear.svg",
    matchKeywords: ["ผักกาด", "หมู", "ไก่", "วุ้นเส้น", "ไข่", "น้ำจิ้มสุกี้"],
    ingredients: [
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "หมูหรือไก่",
        required: 200,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "หมู",
      },
      {
        name: "วุ้นเส้น",
        required: 1,
        unit: "กำ",
        emoji: "🍜",
        matchKey: "วุ้นเส้น",
      },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "น้ำจิ้มสุกี้",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำจิ้มสุกี้",
      },
    ],
    steps: [
      "ต้มน้ำซุปให้เดือด",
      "ใส่เนื้อสัตว์จนสุก",
      "เติมผักและวุ้นเส้น",
      "ตอกไข่ ปรุงรสด้วยน้ำจิ้มสุกี้ แล้วเสิร์ฟ",
    ],
    tip: "เพิ่มเต้าหู้หรือเห็ดเพื่อเพิ่มคุณค่าทางโภชนาการ",
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
    ingredients: [
      {
        name: "ข้าวสวย",
        required: 1.5,
        unit: "ถ้วย",
        emoji: "🍚",
        matchKey: "ข้าว",
      },
      {
        name: "แครอทหั่นเต๋า",
        required: 0.5,
        unit: "ถ้วย",
        emoji: "🥕",
        matchKey: "แครอท",
      },
      {
        name: "ข้าวโพด",
        required: 0.5,
        unit: "ถ้วย",
        emoji: "🌽",
        matchKey: "ข้าวโพด",
      },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
    ],
    steps: [
      "ตั้งกระทะใส่น้ำมันและผัดไข่",
      "ใส่ผักรวมผัดให้สุกกรอบ",
      "ใส่ข้าวสวยและคลุกให้เข้ากัน",
      "ปรุงรสด้วยซีอิ๊วและพริกไทย พร้อมเสิร์ฟ",
    ],
    tip: "ใช้ข้าวเย็นค้างคืนจะทำให้ข้าวผัดไม่เละ",
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
    recipeImage: "/recipes/tom-jued.svg",
    matchKeywords: ["เต้าหู้", "หมู", "ผักกาด", "ต้นหอม", "ซีอิ๊ว"],
    ingredients: [
      {
        name: "เต้าหู้ไข่",
        required: 2,
        unit: "หลอด",
        emoji: "🟡",
        matchKey: "เต้าหู้",
      },
      {
        name: "หมูสับ",
        required: 200,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "หมู",
      },
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "ต้นหอม",
        required: 1,
        unit: "ต้น",
        emoji: "🌱",
        matchKey: "ต้นหอม",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
    ],
    steps: [
      "ต้มน้ำให้เดือดแล้วปั้นหมูสับลงหม้อ",
      "ใส่ผักกาดขาวและเต้าหู้",
      "ปรุงรสด้วยซีอิ๊วขาว",
      "โรยต้นหอมแล้วปิดไฟ",
    ],
    tip: "ปั้นหมูสับเป็นก้อนเล็กๆ จะทำให้สุกเร็วและน่ารับประทาน",
  },
];

export default function MenuRecommendationsPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [likedMenus, setLikedMenus] = useState<Set<string>>(new Set());
  const [servings, setServings] = useState(2);

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
        pantryNames.some((name) => name.includes(keyword.toLowerCase())),
      );

      const matchedCount = matchedKeywords.length;
      const matchPercent = Math.round(
        (matchedCount / menu.matchKeywords.length) * 100,
      );

      return {
        ...menu,
        matchedKeywords,
        matchedCount,
        matchPercent,
      };
    });

    return scoredMenus
      .filter((menu) => menu.matchedCount > 0)
      .sort(
        (a, b) =>
          b.matchPercent - a.matchPercent || b.matchedCount - a.matchedCount,
      );
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
    <AppShell
      title="แนะนำเมนู"
      subtitle="เมนูที่เหมาะกับวัตถุดิบที่คุณมีอยู่ตอนนี้"
    >
      {pantryItems.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">ยังไม่มีวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">
            เพิ่มวัตถุดิบจากหน้า สแกนใบเสร็จ ก่อน
            เพื่อให้ระบบแนะนำเมนูตามของที่มีอยู่จริง
          </p>
        </div>
      ) : null}

      {pantryItems.length > 0 && recommendedMenus.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
          <p className="font-semibold">ยังไม่พบเมนูที่ตรงกับวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">
            ลองเพิ่มวัตถุดิบให้หลากหลายขึ้น เช่น ผัก ไข่ หรือเครื่องปรุง
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendedMenus.map((menu) => (
          <article
            key={menu.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${menu.imageClass} flex items-center justify-center relative overflow-hidden`}
            >
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
                <Heart className="h-4 w-4" fill={likedMenus.has(menu.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {menu.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {menu.calories} kcal · โปรตีน {menu.protein}g
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              วัตถุดิบที่มี: {menu.matchedKeywords.join(" • ")}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedMenu(menu);
                setServings(2);
              }}
              className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              ดูสูตร
            </button>
          </article>
        ))}
      </section>

      {selectedMenu && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-slate-100">
              {/* recipe thumbnail */}
              <div
                className={`h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${selectedMenu.imageClass} flex items-center justify-center overflow-hidden`}
              >
                {selectedMenu.recipeImage ? (
                  <img
                    src={selectedMenu.recipeImage}
                    alt={selectedMenu.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{selectedMenu.emoji}</span>
                )}
              </div>
              {/* title + time */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900">
                  สูตร: {selectedMenu.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  เวลาโดยประมาณ {selectedMenu.prep}
                </p>
                {/* serving counter */}
                <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-full border border-emerald-100 bg-green-50 px-4 py-1.5 w-fit max-w-full">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    {/* plate with fork (left) and spoon (right) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[18px] w-[22px] shrink-0"
                      viewBox="0 0 28 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* fork — 3 tines → merge → handle */}
                      <line x1="3.5" y1="1" x2="3.5" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="6" />
                      <line x1="6.5" y1="1" x2="6.5" y2="6" />
                      <path d="M3.5 6 Q5 7.5 5 9 L5 23" />
                      {/* plate — outer rim + inner circle */}
                      <circle cx="14" cy="12" r="8" />
                      <circle cx="14" cy="12" r="5.5" />
                      {/* spoon — oval bowl + handle */}
                      <ellipse cx="23" cy="5.5" rx="2" ry="3.5" />
                      <line x1="23" y1="9" x2="23" y2="23" />
                    </svg>
                    <span className="text-slate-600">ทำได้</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center transition select-none"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-lg font-bold text-slate-900 tabular-nums">
                      {servings}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => s + 1)}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center transition select-none"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-slate-500">มื้อ</span>
                </div>
              </div>
              {/* heart + close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleLikeMenu(selectedMenu.id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${likedMenus.has(selectedMenu.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"}`}
                  aria-label="favorite-menu-dialog"
                >
                  <Heart className="h-4 w-4" fill={likedMenus.has(selectedMenu.id) ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMenu(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Body (scrollable) ── */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              {/* two-column */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* ── Left: Ingredients ── */}
                <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                    <h4 className="font-semibold text-emerald-800">ส่วนผสม</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="text-left font-medium px-4 py-2">
                            วัตถุดิบ
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            จำนวนที่ต้องใช้
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            มีในครัว
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedMenu.ingredients.map((ing) => {
                          const status = getIngredientStatus(
                            ing,
                            pantryItems,
                            servings,
                          );
                          const requiredAmt = (ing.required * servings) / 2;
                          return (
                            <tr key={ing.name} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                                    {ing.emoji}
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {ing.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-2.5 text-center text-slate-700">
                                {requiredAmt % 1 === 0
                                  ? requiredAmt
                                  : requiredAmt.toFixed(1)}{" "}
                                {ing.unit}
                              </td>
                              <td
                                className={`px-2 py-2.5 text-center text-xs font-medium ${status.enough ? "text-slate-600" : "text-red-500"}`}
                              >
                                {status.availableText}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                {status.enough ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Order missing button */}
                  {selectedMenu.ingredients.some(
                    (ing) =>
                      !getIngredientStatus(ing, pantryItems, servings).enough,
                  ) && (
                    <div className="px-4 py-3 border-t border-slate-100">
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        สั่งซื้อวัตถุดิบที่ขาด
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Right: Steps ── */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                  <div className="bg-sky-50 px-4 py-3 border-b border-sky-100">
                    <h4 className="font-semibold text-sky-800">วิธีทำ</h4>
                  </div>
                  <div className="px-4 py-4">
                    <ol className="space-y-3">
                      {selectedMenu.steps.map((step, idx) => (
                        <li
                          key={`${selectedMenu.id}-step-${idx}`}
                          className="flex items-start gap-3 text-sm text-slate-700"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    {/* recipe image below steps */}
                    {selectedMenu.recipeImage && (
                      <div className="mt-4 rounded-xl overflow-hidden h-44 bg-slate-100 flex items-center justify-center">
                        <img
                          src={selectedMenu.recipeImage}
                          alt={selectedMenu.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Nutritional info ── */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                  <CircleCheckBig className="h-4 w-4" />
                  โภชนาการต่อ 1 มื้อ (โดยประมาณ)
                </p>
                <div className="grid grid-cols-4 divide-x divide-emerald-200 text-center">
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.calories}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">kcal</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      พลังงาน
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.protein}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      โปรตีน
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.carbs}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      คาร์บ
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.fat}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ไขมัน
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Tip ── */}
              {selectedMenu.tip && (
                <div className="rounded-xl border border-emerald-100 bg-green-50 px-4 py-3 flex items-start gap-2 text-sm text-slate-700">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <p>
                    <span className="font-semibold text-emerald-700">
                      เคล็ดลับ:
                    </span>{" "}
                    {selectedMenu.tip}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
