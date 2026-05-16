"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Clock } from "lucide-react";
import { CookConfirmDialog } from "@/components/ui/cook-confirm-dialog";
import { NutritionGrid } from "@/components/ui/nutrition-grid";
import { LikeButton } from "@/components/ui/like-button";
import AppShell from "@/components/layout/app-shell";
import { recordCook } from "@/lib/cook-stats";

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  menuId?: string;
}

interface ExpiringItem {
  name: string;
  daysLeft: number;
  emoji: string;
  image: string;
  color: string;
  recipes: Recipe[];
}

interface RecipeGuide {
  ingredients: string[];
  steps: string[];
}

const RECIPE_DB: Record<string, Recipe[]> = {
  "ไก่สด": [
    { id: "r1", name: "ข้าวมันไก่", emoji: "🍚", calories: 520, protein: 35, carbs: 60, fat: 12, time: 45, menuId: "m5" },
    { id: "r2", name: "ไก่ผัดกะเพรา", emoji: "🌿", calories: 380, protein: 30, carbs: 15, fat: 20, time: 20, menuId: "m1" },
    { id: "r3", name: "ต้มข่าไก่", emoji: "🥥", calories: 310, protein: 28, carbs: 8, fat: 18, time: 30, menuId: "m6" },
    { id: "r4", name: "ไก่ย่างซอสบาร์บีคิว", emoji: "🔥", calories: 420, protein: 38, carbs: 12, fat: 22, time: 35, menuId: "m7" },
  ],
  "นมสด": [
    { id: "r5", name: "สมูทตี้ผลไม้", emoji: "🍓", calories: 220, protein: 8, carbs: 38, fat: 4, time: 10, menuId: "m8" },
    { id: "r6", name: "โอวัลตินนม", emoji: "🥛", calories: 180, protein: 7, carbs: 30, fat: 5, time: 5, menuId: "m9" },
    { id: "r7", name: "พุดดิ้งนม", emoji: "🍮", calories: 290, protein: 9, carbs: 45, fat: 8, time: 25, menuId: "m10" },
  ],
  "เห็ดหอม": [
    { id: "r8", name: "เห็ดผัดน้ำมันหอย", emoji: "🍄", calories: 180, protein: 6, carbs: 12, fat: 10, time: 15, menuId: "m11" },
    { id: "r9", name: "ต้มยำเห็ด", emoji: "🍲", calories: 150, protein: 8, carbs: 10, fat: 6, time: 20, menuId: "m12" },
    { id: "r10", name: "ข้าวผัดเห็ด", emoji: "🍳", calories: 420, protein: 12, carbs: 65, fat: 14, time: 20, menuId: "m3" },
  ],
  "เต้าหู้": [
    { id: "r11", name: "แกงจืดเต้าหู้", emoji: "🥣", calories: 190, protein: 14, carbs: 8, fat: 9, time: 25, menuId: "m4" },
    { id: "r12", name: "เต้าหู้ทอดกระเทียม", emoji: "🧄", calories: 280, protein: 16, carbs: 10, fat: 18, time: 20, menuId: "m13" },
    { id: "r13", name: "ต้มยำเต้าหู้", emoji: "🌶️", calories: 160, protein: 12, carbs: 7, fat: 8, time: 20, menuId: "m14" },
  ],
  "แครอท": [
    { id: "r14", name: "แกงแครอต", emoji: "🥕", calories: 210, protein: 5, carbs: 28, fat: 9, time: 30, menuId: "m15" },
    { id: "r15", name: "สลัดแครอต", emoji: "🥗", calories: 120, protein: 3, carbs: 18, fat: 4, time: 10, menuId: "m16" },
    { id: "r16", name: "น้ำแครอตปั่น", emoji: "🥤", calories: 95, protein: 2, carbs: 20, fat: 0, time: 5, menuId: "m17" },
  ],
  "โยเกิร์ต": [
    { id: "r17", name: "พาร์เฟ่ต์โยเกิร์ต", emoji: "🧴", calories: 260, protein: 12, carbs: 38, fat: 6, time: 10, menuId: "m18" },
    { id: "r18", name: "ลาซีโยเกิร์ต", emoji: "🥛", calories: 170, protein: 8, carbs: 22, fat: 5, time: 5, menuId: "m19" },
    { id: "r19", name: "สมูทตี้โยเกดิร์ต", emoji: "🍌", calories: 240, protein: 10, carbs: 40, fat: 4, time: 8, menuId: "m20" },
  ],
};

const ITEM_DATA: ExpiringItem[] = [
  { name: "ไก่สด",    daysLeft: 1, emoji: "🍗", image: "from-orange-100 to-orange-200", color: "border-orange-200",  recipes: RECIPE_DB["ไก่สด"] },
  { name: "นมสด",    daysLeft: 2, emoji: "🥛", image: "from-blue-100 to-blue-200",     color: "border-blue-200",    recipes: RECIPE_DB["นมสด"] },
  { name: "เห็ดหอม", daysLeft: 3, emoji: "🍄", image: "from-amber-100 to-amber-200",   color: "border-amber-200",   recipes: RECIPE_DB["เห็ดหอม"] },
  { name: "เต้าหู้", daysLeft: 2, emoji: "🟡", image: "from-yellow-100 to-yellow-200", color: "border-yellow-200",  recipes: RECIPE_DB["เต้าหู้"] },
  { name: "แครอท",   daysLeft: 4, emoji: "🥕", image: "from-red-100 to-orange-100",    color: "border-red-100",     recipes: RECIPE_DB["แครอท"] },
  { name: "โยเกิร์ต", daysLeft: 1, emoji: "🫙", image: "from-pink-100 to-pink-200",   color: "border-pink-200",    recipes: RECIPE_DB["โยเกิร์ต"] },
];

const RECIPE_GUIDE_DB: Record<string, RecipeGuide> = {
  r1: {
    ingredients: ["อกไก่ 300 กรัม", "ข้าวหอมมะลิ 2 ถ้วย", "ขิงแก่ 5 แว่น", "กระเทียม 4 กลีบ", "ซีอิ๊วขาว 1 ช้อนโต๊ะ"],
    steps: ["ต้มไก่กับขิงและกระเทียมประมาณ 25 นาที", "นำน้ำต้มไก่มาหุงข้าวให้หอม", "หั่นไก่เป็นชิ้นพอดีคำ", "จัดเสิร์ฟพร้อมข้าวและน้ำจิ้มเต้าเจี้ยว"],
  },
  r2: {
    ingredients: ["ไก่สับ 250 กรัม", "ใบกะเพรา 1 ถ้วย", "พริก-กระเทียมโขลก 2 ช้อนโต๊ะ", "ซีอิ๊วขาว 1 ช้อนโต๊ะ", "น้ำมันพืช 1 ช้อนโต๊ะ"],
    steps: ["ตั้งกระทะใส่น้ำมัน ผัดพริกกระเทียมจนหอม", "ใส่ไก่สับผัดจนสุก", "ปรุงรสด้วยซีอิ๊วและน้ำปลาเล็กน้อย", "ใส่ใบกะเพรา ผัดเร็วๆ แล้วปิดไฟ"],
  },
  r3: {
    ingredients: ["ไก่หั่นชิ้น 250 กรัม", "กะทิ 400 มล.", "ข่าอ่อน 6 แว่น", "ตะไคร้ 1 ต้น", "เห็ด 100 กรัม"],
    steps: ["เคี่ยวกะทิกับข่าและตะไคร้ให้หอม", "ใส่ไก่ลงต้มจนสุก", "เติมเห็ดและปรุงรสเปรี้ยวเค็มหวาน", "ปิดไฟแล้วโรยพริกสดตามชอบ"],
  },
};

const LIKED_KEY = "liked_recipes";

export default function ExpiringSoonPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<ExpiringItem | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [guideRecipe, setGuideRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_KEY);
      if (raw) setLiked(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function toggleLike(id: string, menuId?: string) {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(LIKED_KEY, JSON.stringify([...next]));

      // sync to liked_expiring_menus for menu-recommendations ordering only
      if (menuId) {
        try {
          const raw = localStorage.getItem("liked_expiring_menus");
          const menuSet = new Set<string>(raw ? JSON.parse(raw) : []);
          if (next.has(id)) {
            menuSet.add(menuId);
          } else {
            menuSet.delete(menuId);
          }
          localStorage.setItem("liked_expiring_menus", JSON.stringify([...menuSet]));
        } catch {}
      }

      return next;
    });
  }

  function sortedRecipes(recipes: Recipe[]) {
    return [...recipes].sort((a, b) => (liked.has(a.id) ? 0 : 1) - (liked.has(b.id) ? 0 : 1));
  }

  function getRecipeGuide(recipe: Recipe): RecipeGuide {
    if (RECIPE_GUIDE_DB[recipe.id]) return RECIPE_GUIDE_DB[recipe.id];
    return {
      ingredients: [
        `วัตถุดิบหลักสำหรับ${recipe.name} 1 ชุด`,
        "กระเทียมสับ 1 ช้อนโต๊ะ",
        "น้ำมันพืช 1 ช้อนโต๊ะ",
        "เครื่องปรุงรสตามชอบ",
      ],
      steps: [
        `เตรียมวัตถุดิบทั้งหมดสำหรับ${recipe.name}`,
        "ผัดหรือปรุงวัตถุดิบหลักให้สุกกำลังดี",
        "ปรุงรสและชิมรสชาติให้พอดี",
        "จัดเสิร์ฟทันทีขณะร้อน",
      ],
    };
  }

  const urgentCount = ITEM_DATA.filter(i => i.daysLeft <= 2).length;

  return (
    <AppShell title="แจ้งเตือน" subtitle="ดูรายการที่ควรใช้ก่อนเพื่อลดการทิ้งอาหาร">

      {urgentCount > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-red-900/30 border border-red-700/50 px-5 py-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-400">มี {urgentCount} รายการที่หมดอายุภายใน 2 วัน!</p>
            <p className="text-sm text-red-500/80">ควรรีบนำไปปรุงอาหารก่อนนะ</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEM_DATA.map(item => {
          const urgent = item.daysLeft <= 2;
          return (
            <div key={item.name} className={`rounded-2xl border overflow-hidden bg-slate-800/60 shadow-sm ${item.color}`}>
              <div className={`h-36 bg-gradient-to-br ${item.image} flex items-center justify-center relative`}>
                <span className="text-7xl select-none">{item.emoji}</span>
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${urgent ? "bg-red-500 text-white" : "bg-slate-700/70 text-white"}`}>
                  {item.daysLeft <= 0 ? "หมดอายุ" : `${item.daysLeft} วัน`}
                </span>
              </div>
              <div className="p-4">
                <p className="text-base font-semibold text-slate-100">{item.name}</p>
                <p className={`mt-0.5 text-sm ${urgent ? "text-red-400 font-medium" : "text-slate-400"}`}>
                  {urgent ? `⚠️ ด่วน! เหลือ ${item.daysLeft} วัน` : `เหลือ ${item.daysLeft} วันก่อนหมดอายุ`}
                </p>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
                >
                  ดูเมนูที่แนะนำ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe list dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedItem.emoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">เมนูจาก{selectedItem.name}</h3>
                    <p className="text-xs text-slate-400">{selectedItem.recipes.length} เมนูแนะนำ · เมนูที่ถูกใจขึ้นก่อน</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-slate-400 hover:bg-slate-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              {sortedRecipes(selectedItem.recipes).map(recipe => {
                const isLiked = liked.has(recipe.id);
                return (
                  <div key={recipe.id} className={`rounded-2xl border p-4 transition ${isLiked ? "border-emerald-700/60 bg-emerald-900/30" : "border-slate-700 bg-slate-800"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-2xl">
                          {recipe.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-100">{recipe.name}</p>
                            {isLiked && <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">❤️ ถูกใจ</span>}
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" /> {recipe.time} นาที
                          </p>
                        </div>
                      </div>
                      <LikeButton
                        liked={isLiked}
                        onClick={() => toggleLike(recipe.id, recipe.menuId)}
                      />
                    </div>

                    <NutritionGrid
                      calories={recipe.calories}
                      protein={recipe.protein}
                      carb={recipe.carbs}
                      fat={recipe.fat}
                      className="mb-3"
                    />

                    <button
                      onClick={() => setCookingRecipe(recipe)}
                      className="w-full rounded-full bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                    >
                      🍳 ทำเมนูนี้
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {cookingRecipe && (
        <CookConfirmDialog
          emoji={cookingRecipe.emoji}
          name={cookingRecipe.name}
          time={`${cookingRecipe.time} นาที`}
          onCancel={() => setCookingRecipe(null)}
          onConfirm={() => {
            if (cookingRecipe?.menuId) {
              recordCook(cookingRecipe.menuId, {
                name: cookingRecipe.name,
                emoji: cookingRecipe.emoji,
              });
              setCookingRecipe(null);
              setSelectedItem(null);
              router.push(`/menu-recommendations?menu=${cookingRecipe.menuId}`);
            } else {
              if (cookingRecipe) setGuideRecipe(cookingRecipe);
              setCookingRecipe(null);
              setSelectedItem(null);
            }
          }}
        />
      )}

      {/* Recipe guide dialog */}
      {guideRecipe && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{guideRecipe.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">สูตร: {guideRecipe.name}</h3>
                  <p className="text-xs text-slate-400">เวลาโดยประมาณ {guideRecipe.time} นาที</p>
                </div>
              </div>
              <button
                onClick={() => setGuideRecipe(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-emerald-800/60 bg-emerald-900/30 p-4">
                  <h4 className="mb-3 font-semibold text-emerald-400">ส่วนผสม</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {getRecipeGuide(guideRecipe).ingredients.map((ing) => (
                      <li key={ing} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-500">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-800/60 bg-blue-900/30 p-4">
                  <h4 className="mb-3 font-semibold text-blue-400">วิธีทำ</h4>
                  <ol className="space-y-2 text-sm text-slate-300">
                    {getRecipeGuide(guideRecipe).steps.map((step, idx) => (
                      <li key={`${guideRecipe.id}-${idx}`} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-700/50 p-3 text-xs text-slate-400">
                โภชนาการต่อจาน: {guideRecipe.calories} kcal, โปรตีน {guideRecipe.protein}g, คาร์บ {guideRecipe.carbs}g, ไขมัน {guideRecipe.fat}g
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
