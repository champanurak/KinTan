"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Camera, Package, TriangleAlert, Wallet, Leaf, Clock, Beef, Heart, ChevronRight, ChevronLeft, BrainCircuit, FileBarChart2, X } from "lucide-react";
import { CookConfirmDialog } from "@/components/ui/cook-confirm-dialog";
import { NutritionGrid } from "@/components/ui/nutrition-grid";
import { LikeButton } from "@/components/ui/like-button";
import AppShell from "@/components/layout/app-shell";
import Card, { StatCard } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { recordCook } from "@/lib/cook-stats";
import { usePantryStore } from "@/store/pantry-store";
import { useShoppingStore } from "@/store/shopping-store";

const quickStats = [
  {
    label: "วัตถุดิบคงเหลือ",
    value: "128",
    note: "รายการ",
    iconClassName: "bg-emerald-100 text-emerald-700",
    icon: <Package className="h-7 w-7" />,
  },
  {
    label: "ใกล้หมดอายุ",
    value: "12",
    note: "รายการ",
    iconClassName: "bg-amber-100 text-amber-500",
    icon: <TriangleAlert className="h-7 w-7" />,
  },
];

const expiringItems = [
  {
    id: "chicken",
    name: "ไก่สด",
    emoji: "🍗",
    amount: "1.2 กก.",
    daysLeft: 0,
    badgeText: "วันนี้",
    imageSrc: "/products/chicken.svg",
    menus: [
      { menuId: "m5",  name: "ข้าวมันไก่",      emoji: "🍚", time: "45 นาที", calories: 520, protein: 35, carb: 60, fat: 12 },
      { menuId: "m1",  name: "ผัดกะเพราไก่",    emoji: "🌿", time: "15 นาที", calories: 520, protein: 35, carb: 42, fat: 20 },
      { menuId: "m6",  name: "ต้มข่าไก่",        emoji: "🥥", time: "30 นาที", calories: 310, protein: 28, carb:  8, fat: 18 },
      { menuId: "m23", name: "ต้มจืดไก่สับ",    emoji: "🍲", time: "20 นาที", calories: 210, protein: 22, carb:  6, fat: 10 },
    ],
  },
  {
    id: "milk",
    name: "นมสด",
    emoji: "🥛",
    amount: "1 ลิตร",
    daysLeft: 2,
    badgeText: "2 วัน",
    imageSrc: "/products/milk.svg",
    menus: [
      { menuId: "m8",  name: "สมูทตี้ผลไม้",  emoji: "🍹", time: "10 นาที", calories: 220, protein:  8, carb: 38, fat:  4 },
      { menuId: "m9",  name: "โอวัลตินนม",    emoji: "☕", time: "5 นาที",  calories: 180, protein:  7, carb: 30, fat:  5 },
      { menuId: "m10", name: "พุดดิ้งนม",     emoji: "🍮", time: "25 นาที", calories: 290, protein:  9, carb: 45, fat:  8 },
    ],
  },
  {
    id: "lettuce",
    name: "ผักกาดหอม",
    emoji: "🥬",
    amount: "1 หัว",
    daysLeft: 4,
    badgeText: "4 วัน",
    imageSrc: "/products/lettuce.svg",
    menus: [
      { menuId: "m3",  name: "ข้าวผัดผักรวม",         emoji: "🥣", time: "18 นาที", calories: 450, protein: 14, carb: 65, fat: 15 },
      { menuId: "m16", name: "สลัดแครอท",             emoji: "🥗", time: "10 นาที", calories: 120, protein:  3, carb: 18, fat:  4 },
      { menuId: "m13", name: "เต้าหู้ทอดกระเทียม",   emoji: "🧄", time: "20 นาที", calories: 280, protein: 16, carb: 10, fat: 18 },
    ],
  },
  {
    id: "instant-noodle",
    name: "มาม่า",
    emoji: "🍜",
    amount: "2 ห่อ",
    daysLeft: 30,
    badgeText: "30 วัน",
    imageSrc: "/products/instant-noodle.svg",
    menus: [
      { menuId: "m21", name: "มาม่าต้มยำไก่", emoji: "🌶️", time: "15 นาที", calories: 450, protein: 15, carb: 58, fat: 14 },
      { menuId: "m2",  name: "สุกี้หมูน้ำ",   emoji: "🍲", time: "20 นาที", calories: 380, protein: 28, carb: 26, fat: 12 },
      { menuId: "m22", name: "ยำมะเขือ",       emoji: "🍆", time: "15 นาที", calories: 150, protein:  4, carb: 15, fat:  8 },
    ],
  },
];

const recommendedPurchases = [
  { id: "eggs", name: "ไข่ไก่", daysLeft: 2, emoji: "🥚", required: 30, unit: "ฟอง" },
  { id: "milk", name: "นมสด",  daysLeft: 3, emoji: "🥛", required: 1,  unit: "ลิตร" },
];

const recipes = [
  {
    name: "ผัดกะเพราไก่",
    menuId: "m1",
    emoji: "🌿",
    expiryUsage: 80,
    calories: "520 kcal",
    protein: "35g",
    photo: "/recipes/pad-krapao.svg"
  },
  {
    name: "สุกี้หมูน้ำ",
    menuId: "m2",
    emoji: "🍲",
    expiryUsage: 70,
    calories: "380 kcal",
    protein: "28g",
    photo: "/recipes/suki-clear.svg"
  },
  {
    name: "มาม่าต้มยำไก่",
    menuId: "m21",
    emoji: "🍜",
    expiryUsage: 60,
    calories: "450 kcal",
    protein: "15g",
    photo: "/recipes/mama-tomyum.svg"
  },
  {
    name: "ยำมะเขือ",
    menuId: "m22",
    emoji: "🍆",
    expiryUsage: 50,
    calories: "150 kcal",
    protein: "4g",
    photo: "/recipes/yum-makua.svg"
  },
  {
    name: "ต้มจืดไก่สับ",
    menuId: "m23",
    emoji: "🍲",
    expiryUsage: 90,
    calories: "210 kcal",
    protein: "22g",
    photo: "/recipes/tom-jued.svg"
  }
];

export default function HomeDashboardPage() {
  const router = useRouter();
  const pantryItems = usePantryStore((s) => s.items);
  const setMissingItems = useShoppingStore((s) => s.setMissingItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [cookingMenu, setCookingMenu] = useState<{ menuId: string; name: string; emoji: string; time: string } | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(3);
  const [cookConfirmRecipe, setCookConfirmRecipe] = useState<typeof recipes[number] | null>(null);

  const sortedRecipes = useMemo(
    () => [...recipes].sort((a, b) => {
      const aL = likedRecipes.has(a.menuId) ? 1 : 0;
      const bL = likedRecipes.has(b.menuId) ? 1 : 0;
      return bL - aL;
    }),
    [likedRecipes],
  );

  const maxIndex = Math.max(0, sortedRecipes.length - visibleCount);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("liked_menu_recommendations");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLikedRecipes(new Set<string>(parsed));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setVisibleCount(1);
      } else if (width < 1280) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    setCarouselIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  function toggleLike(menuId: string) {
    setLikedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId); else next.add(menuId);
      localStorage.setItem("liked_menu_recommendations", JSON.stringify([...next]));
      setCarouselIndex(0);
      return next;
    });
  }
  const selectedItem = useMemo(
    () => expiringItems.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId]
  );

  // ── Dynamic stats from pantry store ────────────────────────────────────────
  const dynamicStats = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    // ค่าใช้จ่ายเดือนนี้: ผลรวม price × quantity ของ items ที่ createdAt อยู่ในเดือนนี้
    const spendingThisMonth = pantryItems.reduce((sum, item) => {
      if (!item.createdAt || item.price == null) return sum;
      const d = new Date(item.createdAt);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    // ของเสียเดือนนี้: % ของ items ที่หมดอายุในเดือนนี้ เทียบกับ items ทั้งหมด
    const expiredThisMonth = pantryItems.filter(
      (item) => {
        if (!item.expiresAt) return false;
        const d = new Date(item.expiresAt);
        return d < now && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
      },
    );
    const wastePercent =
      pantryItems.length > 0
        ? Math.round((expiredThisMonth.length / pantryItems.length) * 100)
        : 0;

    return { spendingThisMonth, wastePercent };
  }, [pantryItems]);

  const allStats = useMemo(
    () => [
      ...quickStats,
      {
        label: "ค่าใช้จ่ายเดือนนี้",
        value: `฿${dynamicStats.spendingThisMonth.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`,
        note: "จากใบเสร็จสแกน",
        iconClassName: "bg-emerald-100 text-emerald-700",
        icon: <Wallet className="h-7 w-7" />,
      },
      {
        label: "ของเสียเดือนนี้",
        value: `${dynamicStats.wastePercent}%`,
        note: "วัตถุดิบหมดอายุในเดือนนี้",
        iconClassName: "bg-lime-100 text-lime-700",
        icon: <Leaf className="h-7 w-7" />,
      },
    ],
    [dynamicStats],
  );

  return (
    <AppShell title="หน้าหลัก" subtitle="สรุปภาพรวมการจัดการอาหารในบ้านของคุณ">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-green-950/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Text */}
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-slate-100 sm:text-3xl">
              สดไว ค้มค่า ลดสูญเปล่า
            </p>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              เปลี่ยน จัดการของกิน ไม่ทิ้ง ไม่เสีย 🌿
            </p>
          </div>

          {/* Right: Grocery illustration + mascot */}
          <div className="flex shrink-0 items-center gap-2 self-end sm:gap-3">
            {/* Grocery bag */}
            <div className="relative flex h-20 w-20 items-end justify-center sm:h-24 sm:w-24">
              {/* Vegetables peeking out */}
              <div className="absolute -top-1 left-1 text-2xl sm:text-3xl" style={{transform:"rotate(-15deg)"}}>🥬</div>
              <div className="absolute -top-2 left-7 text-2xl sm:left-8 sm:text-3xl" style={{transform:"rotate(5deg)"}}>🥕</div>
              <div className="absolute -top-1 right-1 text-xl sm:right-2 sm:text-2xl" style={{transform:"rotate(10deg)"}}>🍅</div>
              <div className="absolute top-3 left-9 text-xl sm:left-10 sm:text-2xl">🥛</div>
              {/* Bag */}
              <div className="h-12 w-16 rounded-b-xl rounded-t-sm bg-amber-700/80 shadow-md sm:h-14 sm:w-20" />
              {/* Bag handles */}
              <div className="absolute top-2 left-3 h-4 w-4 rounded-full border-[3px] border-amber-700/80 bg-transparent sm:left-4 sm:h-5 sm:w-5 sm:border-4" />
              <div className="absolute top-2 right-3 h-4 w-4 rounded-full border-[3px] border-amber-700/80 bg-transparent sm:right-4 sm:h-5 sm:w-5 sm:border-4" />
            </div>

            {/* กินทัน mascot card */}
            <div className="hidden flex-col items-center gap-1.5 rounded-2xl border border-emerald-800/60 bg-slate-800/80 px-3 py-3 shadow-sm sm:flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                🤖
              </div>
              <p className="text-xs font-semibold text-emerald-400">กินทัน</p>
              <p className="max-w-[90px] text-center text-[10px] leading-snug text-slate-400">
                ช่วยคุณจัดการของกิน อย่างชาญฉลาด
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {allStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="rounded-2xl h-full">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">รายการใกล้หมดอายุ</h3>
              <Link href="/expiring-soon" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="space-y-2">
              {expiringItems.map((item) => (
                <div key={item.id} className="flex gap-2.5 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2.5">
                  {/* Image */}
                  <div className="h-10 w-10 shrink-0 self-center overflow-hidden rounded-lg bg-slate-700">
                    <Image src={item.imageSrc} alt={item.name} width={40} height={40} className="h-full w-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: name + badge */}
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-slate-100">{item.name}</p>
                      <Badge variant={item.daysLeft === 0 ? "danger" : item.daysLeft <= 2 ? "warning" : item.daysLeft <= 7 ? "info" : "default"} className="shrink-0 whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold">
                        {item.badgeText}
                      </Badge>
                    </div>
                    {/* Row 2: amount + button */}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="whitespace-nowrap text-xs text-slate-400">{item.amount}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className="shrink-0 rounded-lg border border-slate-600 px-2 py-1 text-[10px] font-medium text-slate-300 transition hover:bg-slate-700 whitespace-nowrap"
                      >
                        ดูเมนูแนะนำ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 h-full">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">เมนูแนะนำจากวัตถุดิบที่มี</h3>
              <Link href="/menu-recommendations" className="text-sm font-medium text-sky-600 hover:text-sky-700">ดูทั้งหมด</Link>
            </div>

            {/* Carousel wrapper */}
            <div className="relative">
              {/* Cards */}
              <div className="overflow-hidden">
                <div
                  className="flex w-full gap-3 transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(calc(-${carouselIndex} * (((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount}) + 12px)))`
                  }}
                >
                  {sortedRecipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                      style={{ width: `calc((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount})` }}
                    >
                      {/* Photo */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-700">
                        <Image
                          src={recipe.photo}
                          alt={recipe.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 90vw, 200px"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="text-sm font-semibold text-slate-100">{recipe.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          ใช้วัตถุดิบ {recipe.expiryUsage}% ที่ใกล้หมดอายุ
                        </p>

                        {/* Nutrition */}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {recipe.calories}
                          </span>
                          <span className="flex items-center gap-1">
                            <Beef className="h-3 w-3 text-slate-400" />
                            {recipe.protein} โปรตีน
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setCookConfirmRecipe(recipe)}
                            className="flex-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            ทำเมนูนี้
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLike(recipe.menuId)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600 transition hover:bg-slate-700"
                            aria-label="ถูกใจ"
                          >
                            <Heart
                              className={`h-4 w-4 transition ${likedRecipes.has(recipe.menuId) ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-slate-400"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next arrow */}
              {carouselIndex < maxIndex && (
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.min(i + 1, maxIndex))}
                  className="absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-800 shadow-sm transition hover:bg-slate-700 md:flex"
                  aria-label="ถัดไป"
                >
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              )}

              {/* Prev arrow */}
              {carouselIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.max(i - 1, 0))}
                  className="absolute -left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-800 shadow-sm transition hover:bg-slate-700 md:flex"
                  aria-label="ก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* ─── สั่งซื้อวัตถุดิบที่แนะนำ ─── */}
        <Card className="rounded-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">สั่งซื้อวัตถุดิบที่แนะนำ</h3>
            <Link href="/partners" className="text-sm font-medium text-sky-600 hover:text-sky-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="divide-y divide-slate-700">
            {recommendedPurchases.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {/* Product image */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-3xl ring-1 ring-slate-600">
                  {item.emoji}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">ใกล้หมด {item.daysLeft} วัน</p>
                </div>
                {/* Order button */}
                <button
                  type="button"
                  onClick={() => {
                    setMissingItems(
                      [{ name: item.name, emoji: item.emoji, required: item.required, unit: item.unit }],
                      "สั่งซื้อวัตถุดิบที่แนะนำ",
                    );
                    router.push("/partners");
                  }}
                  className="shrink-0 rounded-lg border border-emerald-600/60 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-900/30"
                >
                  สั่งซื้อ
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-700 pt-3">
            <Link
              href="/partners"
              className="block w-full py-1.5 text-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              ดูวัตถุดิบแนะนำทั้งหมด
            </Link>
          </div>
        </Card>

        {/* ─── โภชนาการวันนี้ ─── */}
        <Card className="rounded-2xl overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-100">โภชนาการวันนี้</h3>

          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
            <div className="relative mx-auto h-36 w-36 sm:h-36 sm:w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1a3a22" strokeWidth="11" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#41b255" strokeWidth="11" strokeDasharray="263.89" strokeDashoffset="47" strokeLinecap="round" />
              </svg>
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[36px] font-semibold leading-none tracking-tight text-emerald-600">82%</p>
            </div>

            <div className="min-w-0 w-full">
              <div className="space-y-2 text-sm text-slate-300 sm:text-base">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="shrink-0 font-medium">แคลอรี่</p>
                  <p className="text-right text-xs sm:text-sm">1,650 / 2,000</p>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="shrink-0 font-medium">โปรตีน</p>
                  <p className="text-right text-xs sm:text-sm">65 / 100 g</p>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="shrink-0 font-medium">คาร์บ</p>
                  <p className="text-right text-xs sm:text-sm">180 / 250 g</p>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="shrink-0 font-medium">ไขมัน</p>
                  <p className="text-right text-xs sm:text-sm">45 / 70 g</p>
                </div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => router.push("/nutrition")}
                  className="w-full rounded-xl border border-emerald-700/60 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-900/30"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="mb-5 text-sm font-semibold text-slate-100">กระบวนการใช้งาน</h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: <Camera className="h-6 w-6" />,
              step: "1",
              label: "สแกนใบเสร็จ",
              desc: "ถ่ายภาพหรืออัปโหลดใบเสร็จ",
              color: "bg-emerald-900/60 text-emerald-400",
              border: "border-emerald-700/60"
            },
            {
              icon: <BrainCircuit className="h-6 w-6" />,
              step: "2",
              label: "วิเคราะห์ด้วย AI",
              desc: "ระบบอ่านรายการสินค้าอัตโนมัติ",
              color: "bg-violet-900/60 text-violet-400",
              border: "border-violet-700/60"
            },
            {
              icon: <Package className="h-6 w-6" />,
              step: "3",
              label: "บันทึกคลัง",
              desc: "เพิ่มวัตถุดิบเข้าคลังอัตโนมัติ",
              color: "bg-amber-900/60 text-amber-400",
              border: "border-amber-700/60"
            },
            {
              icon: <FileBarChart2 className="h-6 w-6" />,
              step: "4",
              label: "วางแผนเมนู",
              desc: "รับคำแนะนำเมนูจากของที่มี",
              color: "bg-sky-900/60 text-sky-400",
              border: "border-sky-700/60"
            }
          ].map((item, idx, arr) => (
            <div key={idx} className="relative flex flex-col items-center gap-3 text-center">
              {/* Connector line between steps */}
              {idx < arr.length - 1 && (
                <div className="absolute left-[calc(50%+32px)] top-6 hidden h-0.5 w-[calc(100%-8px)] bg-gradient-to-r from-slate-600 to-slate-700 sm:block" />
              )}

              {/* Step circle */}
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${item.color} ${item.border} shadow-sm`}>
                {item.icon}
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold shadow ring-1 ring-slate-600" style={{ color: "inherit" }}>
                  {item.step}
                </span>
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cookConfirmRecipe && (
        <CookConfirmDialog
          emoji={cookConfirmRecipe.emoji}
          name={cookConfirmRecipe.name}
          zIndex="z-50"
          onCancel={() => setCookConfirmRecipe(null)}
          onConfirm={() => {
            recordCook(cookConfirmRecipe.menuId, {
              name: cookConfirmRecipe.name,
              emoji: cookConfirmRecipe.emoji,
              img: cookConfirmRecipe.photo,
            });
            setCookConfirmRecipe(null);
            router.push(`/menu-recommendations?menu=${cookConfirmRecipe.menuId}`);
          }}
        />
      )}

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItemId(null)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-700 px-5 py-4 shrink-0">
              <span className="text-3xl leading-none">{selectedItem.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-100">เมนูจาก{selectedItem.name}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{selectedItem.menus.length} เมนูแนะนำ · เมนูที่ถูกใจขึ้นก่อน</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemId(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-400 transition hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable card list */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {selectedItem.menus.map((menu) => (
                <div key={menu.name} className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-2xl">
                      {menu.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-100">{menu.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" /> {menu.time}
                      </p>
                    </div>
                    <LikeButton liked={false} onClick={() => {}} />
                  </div>

                  {/* Nutrition grid */}
                  <NutritionGrid
                    calories={menu.calories}
                    protein={menu.protein}
                    carb={menu.carb}
                    fat={menu.fat}
                    className="mt-3"
                  />

                  {/* Cook button */}
                  <button
                    type="button"
                    onClick={() => setCookingMenu({ menuId: menu.menuId, name: menu.name, emoji: menu.emoji, time: menu.time })}
                    className="mt-3 w-full rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    🍳 ทำเมนูนี้
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Cook confirm dialog ── */}
      {cookingMenu && (
        <CookConfirmDialog
          emoji={cookingMenu.emoji}
          name={cookingMenu.name}
          time={cookingMenu.time}
          onCancel={() => setCookingMenu(null)}
          onConfirm={() => {
            recordCook(cookingMenu.menuId, { name: cookingMenu.name, emoji: cookingMenu.emoji });
            setCookingMenu(null);
            setSelectedItemId(null);
            router.push(`/menu-recommendations?menu=${cookingMenu.menuId}`);
          }}
        />
      )}
    </AppShell>
  );
}
