"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/app-shell";
import Card, { StatCard } from "@/app/components/card";
import Badge from "@/app/components/badge";

const quickStats = [
  {
    label: "วัตถุดิบคงเหลือ",
    value: "128",
    note: "รายการ",
    iconClassName: "bg-emerald-100 text-emerald-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h1.4a1 1 0 01.97.757L6 7m0 0h12.45a1 1 0 01.97 1.243l-1 4A1 1 0 0117.45 13H7.2a1 1 0 01-.98-.804L6 7zm2 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm8 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5.5h3m-1.5-1.5v3" />
      </svg>
    )
  },
  {
    label: "ใกล้หมดอายุ",
    value: "12",
    note: "รายการ",
    iconClassName: "bg-amber-100 text-amber-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3l-8.47-14.14a2 2 0 00-3.42 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
      </svg>
    )
  },
  {
    label: "งบประมาณเดือนนี้",
    value: "฿1,250",
    note: "คงเหลือ",
    iconClassName: "bg-emerald-100 text-emerald-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 10c0-3.866 3.134-7 7-7s7 3.134 7 7v1.5A3.5 3.5 0 0122.5 15v2A3.5 3.5 0 0119 20.5H13.5V21a2 2 0 11-4 0v-.5H9A6 6 0 013 14.5V13a3 3 0 013-3zm7.75-2.25a.75.75 0 00-1.5 0V9h-1a.75.75 0 000 1.5h1V12h-1a.75.75 0 000 1.5h1v1.25a.75.75 0 001.5 0V13.5h1a.75.75 0 000-1.5h-1v-1.5h1a.75.75 0 000-1.5h-1V7.75z" />
      </svg>
    )
  },
  {
    label: "ลดขยะอาหาร",
    value: "40%",
    note: "จากเดือนก่อน",
    iconClassName: "bg-lime-100 text-lime-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 3C9.5 3 5 7.5 5 16c0 1.1.9 2 2 2 8.5 0 13-4.5 13-13 0-1.1-.9-2-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17c2-2 5-5 10-8" />
      </svg>
    )
  }
];

const expiringItems = [
  {
    id: "chicken",
    name: "ไก่สด",
    amount: "1.2 กก.",
    daysLeft: 0,
    badgeText: "วันนี้",
    imageSrc: "/products/chicken.svg",
    menus: ["ผัดกะเพราไก่", "ไก่ผัดขิง", "ต้มจืดไก่สับ"]
  },
  {
    id: "milk",
    name: "นมสด",
    amount: "1 ลิตร",
    daysLeft: 2,
    badgeText: "2 วัน",
    imageSrc: "/products/milk.svg",
    menus: ["พาสต้านมสด", "ซุปครีมเห็ด", "โอเวอร์ไนต์โอ๊ต"]
  },
  {
    id: "lettuce",
    name: "ผักกาดหอม",
    amount: "1 หัว",
    daysLeft: 4,
    badgeText: "4 วัน",
    imageSrc: "/products/lettuce.svg",
    menus: ["สลัดผักสด", "ผัดผักรวม", "แซนด์วิชผักกาดหอม"]
  },
  {
    id: "instant-noodle",
    name: "มาม่า",
    amount: "2 ห่อ",
    daysLeft: 30,
    badgeText: "30 วัน",
    imageSrc: "/products/instant-noodle.svg",
    menus: ["มาม่าผัดแห้ง", "มาม่าต้มยำ", "ยำมาม่าทะเล"]
  }
];

const recipes = [
  {
    name: "ผัดกะเพราไก่",
    expiryUsage: 80,
    calories: "520 kcal",
    protein: "35g",
    photo: "/recipes/pad-krapao.svg"
  },
  {
    name: "สุกี้น้ำใส",
    expiryUsage: 70,
    calories: "380 kcal",
    protein: "28g",
    photo: "/recipes/suki-clear.svg"
  },
  {
    name: "มาม่าต้มยำไก่",
    expiryUsage: 60,
    calories: "450 kcal",
    protein: "15g",
    photo: "/recipes/mama-tomyum.svg"
  },
  {
    name: "ยำมะเขือ",
    expiryUsage: 50,
    calories: "150 kcal",
    protein: "4g",
    photo: "/recipes/yum-makua.svg"
  },
  {
    name: "ต้มจืดไก่สับ",
    expiryUsage: 90,
    calories: "210 kcal",
    protein: "22g",
    photo: "/recipes/tom-jued.svg"
  }
];

export default function HomeDashboardPage() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(3);
  const maxIndex = Math.max(0, recipes.length - visibleCount);

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

  function toggleLike(idx: number) {
    setLikedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }
  const selectedItem = useMemo(
    () => expiringItems.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId]
  );

  return (
    <AppShell title="หน้าหลัก" subtitle="สรุปภาพรวมการจัดการอาหารในบ้านของคุณ">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-100/80 via-emerald-50 to-green-50 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Text */}
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              สดไว ค้มค่า ลดสูญเปล่า
            </p>
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">
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
            <div className="hidden flex-col items-center gap-1.5 rounded-2xl border border-emerald-200 bg-white/80 px-3 py-3 shadow-sm sm:flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                🤖
              </div>
              <p className="text-xs font-semibold text-emerald-700">กินทัน</p>
              <p className="max-w-[90px] text-center text-[10px] leading-snug text-slate-500">
                ช่วยคุณจัดการของกิน อย่างชาญฉลาด
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
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

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="rounded-2xl h-full">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">รายการใกล้หมดอายุ</h3>
              <Link href="/expiring-soon" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                ดูทั้งหมด
              </Link>
            </div>

            <div className="space-y-2">
              {expiringItems.map((item) => (
                <div key={item.id} className="flex gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  {/* Image */}
                  <div className="h-10 w-10 shrink-0 self-center overflow-hidden rounded-lg bg-slate-100">
                    <Image src={item.imageSrc} alt={item.name} width={40} height={40} className="h-full w-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: name + badge */}
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
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
                        className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 whitespace-nowrap"
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

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">เมนูแนะนำจากวัตถุดิบที่มี</h3>
              <Link href="/menu-recommendations" className="text-sm font-medium text-sky-600 hover:text-sky-700">ดูทั้งหมด</Link>
            </div>

            {/* Carousel wrapper */}
            <div className="relative">
              {/* Cards */}
              <div className="overflow-hidden">
                <div
                  className="flex gap-3 transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(calc(-${carouselIndex} * (((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount}) + 12px)))`
                  }}
                >
                  {recipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                      style={{ width: `calc((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount})` }}
                    >
                      {/* Photo */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
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
                        <p className="text-sm font-semibold text-slate-900">{recipe.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          ใช้วัตถุดิบ {recipe.expiryUsage}% ที่ใกล้หมดอายุ
                        </p>

                        {/* Nutrition */}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="10" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                            </svg>
                            {recipe.calories}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C9.243 2 7 4.243 7 7c0 1.657.672 3.157 1.757 4.243C6.08 12.478 5 14.596 5 17v3h14v-3c0-2.404-1.08-4.522-3.757-5.757A5.966 5.966 0 0017 7c0-2.757-2.243-5-5-5z" />
                            </svg>
                            {recipe.protein} โปรตีน
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className="flex-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            ทำเมนูนี้
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleLike(idx)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50"
                            aria-label="ถูกใจ"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition ${likedRecipes.has(idx) ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-slate-400"}`}
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
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
                  className="absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 md:flex"
                  aria-label="ถัดไป"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Prev arrow */}
              {carouselIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => Math.max(i - 1, 0))}
                  className="absolute -left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 md:flex"
                  aria-label="ก่อนหน้า"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-2xl">การใช้วัตถุดิบ (7 วันที่ผ่านมา)</h3>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100 bg-white p-2 sm:p-3">
            <svg viewBox="0 0 760 290" className="min-w-[620px] w-full" role="img" aria-label="กราฟการใช้วัตถุดิบ 7 วัน">
              <line x1="30" y1="20" x2="30" y2="240" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="30" y1="240" x2="660" y2="240" stroke="#cbd5e1" strokeWidth="2" />

              <polyline points="30,82 120,110 210,76 300,112 390,70 480,95 570,88" fill="none" stroke="#2f9e44" strokeWidth="3" />
              <circle cx="30" cy="82" r="6" fill="#2f9e44" />
              <circle cx="120" cy="110" r="6" fill="#2f9e44" />
              <circle cx="210" cy="76" r="6" fill="#2f9e44" />
              <circle cx="300" cy="112" r="6" fill="#2f9e44" />
              <circle cx="390" cy="70" r="6" fill="#2f9e44" />
              <circle cx="480" cy="95" r="6" fill="#2f9e44" />
              <circle cx="570" cy="88" r="6" fill="#2f9e44" />

              <polyline points="30,150 120,162 210,128 300,162 390,126 480,164 570,168" fill="none" stroke="#2aa5b8" strokeWidth="3" strokeDasharray="8 6" />
              <circle cx="30" cy="150" r="6" fill="#2aa5b8" />
              <circle cx="120" cy="162" r="6" fill="#2aa5b8" />
              <circle cx="210" cy="128" r="6" fill="#2aa5b8" />
              <circle cx="300" cy="162" r="6" fill="#2aa5b8" />
              <circle cx="390" cy="126" r="6" fill="#2aa5b8" />
              <circle cx="480" cy="164" r="6" fill="#2aa5b8" />
              <circle cx="570" cy="168" r="6" fill="#2aa5b8" />

              <polyline points="30,206 120,218 210,196 300,218 390,196 480,220 570,214" fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="8 6" />
              <circle cx="30" cy="206" r="6" fill="#fb923c" />
              <circle cx="120" cy="218" r="6" fill="#fb923c" />
              <circle cx="210" cy="196" r="6" fill="#fb923c" />
              <circle cx="300" cy="218" r="6" fill="#fb923c" />
              <circle cx="390" cy="196" r="6" fill="#fb923c" />
              <circle cx="480" cy="220" r="6" fill="#fb923c" />
              <circle cx="570" cy="214" r="6" fill="#fb923c" />

              <g fill="#475569" fontSize="28" fontFamily="Sarabun, sans-serif">
                <text x="28" y="278">จ.</text>
                <text x="116" y="278">อ.</text>
                <text x="205" y="278">พ.</text>
                <text x="293" y="278">พฤ.</text>
                <text x="384" y="278">ศ.</text>
                <text x="474" y="278">ส.</text>
                <text x="565" y="278">อา.</text>
              </g>

              <line x1="615" y1="60" x2="655" y2="60" stroke="#2f9e44" strokeWidth="4" />
              <text x="665" y="68" fill="#334155" fontSize="24" fontFamily="Sarabun, sans-serif">ใช้ไป</text>

              <line x1="615" y1="118" x2="655" y2="118" stroke="#2aa5b8" strokeWidth="4" strokeDasharray="8 6" />
              <text x="665" y="126" fill="#334155" fontSize="24" fontFamily="Sarabun, sans-serif">เติมเข้า</text>

              <line x1="615" y1="176" x2="655" y2="176" stroke="#fb923c" strokeWidth="4" strokeDasharray="8 6" />
              <text x="665" y="184" fill="#334155" fontSize="24" fontFamily="Sarabun, sans-serif">ใกล้หมดอายุ</text>
            </svg>
          </div>
        </Card>

        <Card className="rounded-2xl overflow-hidden">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-2xl">โภชนาการวันนี้</h3>

          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
            <div className="relative mx-auto h-36 w-36 sm:h-36 sm:w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#d9f2de" strokeWidth="11" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#41b255" strokeWidth="11" strokeDasharray="263.89" strokeDashoffset="47" strokeLinecap="round" />
              </svg>
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[36px] font-semibold leading-none tracking-tight text-emerald-600">82%</p>
            </div>

            <div className="min-w-0 w-full">
              <div className="space-y-2 text-sm text-slate-700 sm:text-base">
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
                  className="w-full rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-5 text-sm font-semibold text-slate-900">กระบวนการใช้งาน</h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              step: "1",
              label: "สแกนใบเสร็จ",
              desc: "ถ่ายภาพหรืออัปโหลดใบเสร็จ",
              color: "bg-emerald-100 text-emerald-700",
              border: "border-emerald-200"
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.414 2.083L19.5 12M9.75 3.104c1.356-.224 2.73-.354 4.12-.38M5 14.5l4.914 4.914a1 1 0 001.414 0L19.5 12m-14.5 2.5L4 19m15.5-7l1 7" />
                </svg>
              ),
              step: "2",
              label: "วิเคราะห์ด้วย AI",
              desc: "ระบบอ่านรายการสินค้าอัตโนมัติ",
              color: "bg-violet-100 text-violet-700",
              border: "border-violet-200"
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              ),
              step: "3",
              label: "บันทึกคลัง",
              desc: "เพิ่มวัตถุดิบเข้าคลังอัตโนมัติ",
              color: "bg-amber-100 text-amber-700",
              border: "border-amber-200"
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                </svg>
              ),
              step: "4",
              label: "วางแผนเมนู",
              desc: "รับคำแนะนำเมนูจากของที่มี",
              color: "bg-sky-100 text-sky-700",
              border: "border-sky-200"
            }
          ].map((item, idx, arr) => (
            <div key={idx} className="relative flex flex-col items-center gap-3 text-center">
              {/* Connector line between steps */}
              {idx < arr.length - 1 && (
                <div className="absolute left-[calc(50%+32px)] top-6 hidden h-0.5 w-[calc(100%-8px)] bg-gradient-to-r from-slate-200 to-slate-100 sm:block" />
              )}

              {/* Step circle */}
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${item.color} ${item.border} shadow-sm`}>
                {item.icon}
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow ring-1 ring-slate-200" style={{ color: "inherit" }}>
                  {item.step}
                </span>
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" onClick={() => setSelectedItemId(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">เมนูแนะนำจาก {selectedItem.name}</h3>
                <p className="mt-1 text-sm text-slate-500">เลือกเมนูที่อยากทำจากวัตถุดิบนี้</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemId(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                ปิด
              </button>
            </div>

            <div className="space-y-2">
              {selectedItem.menus.map((menu) => (
                <div key={menu} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-800">{menu}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemId(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
