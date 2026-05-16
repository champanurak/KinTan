"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Info, ShoppingBasket, Building2, Store, Globe, MapPin,
  ChevronDown, Truck, Navigation,
} from "lucide-react";
import AppShell from "@/components/layout/app-shell";

type CategoryFilter = "all" | "supermarket" | "convenience" | "online" | "nearme";
type SortOption = "recommended" | "nearest" | "discount";

interface PromoInfo {
  title: string;
  subtitle: string;
  note?: string;
  expiry: string;
  bgClass: string;
  titleColor: string;
  subtitleColor: string;
  imageEmojis: string[];
}

interface Branch {
  name: string;
  address: string;
  distance: number;
  hours: string;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  fallbackInitial: string;
  fallbackClass: string;
  category: "supermarket" | "convenience" | "online";
  categoryLabel: string;
  websiteUrl: string;
  promo: PromoInfo;
  deliveryMin: number;
  distance: number;
  branches: Branch[];
}

const FILTERS: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all",          label: "ทั้งหมด",           icon: <ShoppingBasket className="h-3.5 w-3.5" /> },
  { value: "supermarket",  label: "ซุปเปอร์มาร์เก็ต", icon: <Building2 className="h-3.5 w-3.5" /> },
  { value: "convenience",  label: "ร้านสะดวกซื้อ",    icon: <Store className="h-3.5 w-3.5" /> },
  { value: "online",       label: "ออนไลน์",           icon: <Globe className="h-3.5 w-3.5" /> },
  { value: "nearme",       label: "ใกล้ฉัน",           icon: <MapPin className="h-3.5 w-3.5" /> },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "แนะนำ" },
  { value: "nearest",     label: "ใกล้ฉัน" },
  { value: "discount",    label: "ส่วนลดมากที่สุด" },
];

const partners: Partner[] = [
  {
    id: "lotuss",
    name: "Lotus's",
    logoUrl: "/partners/lotuss-icon.svg",
    fallbackInitial: "L",
    fallbackClass: "bg-emerald-100 text-emerald-700",
    category: "supermarket",
    categoryLabel: "ซุปเปอร์มาร์เก็ต",
    websiteUrl: "https://www.lotuss.com",
    promo: {
      title: "ลดสูงสุด 20%",
      subtitle: "เมื่อซื้อผักและผลไม้ครบ 300 บาท",
      expiry: "วันนี้ - 30 มิ.ย. 2567",
      bgClass: "bg-gradient-to-br from-emerald-400 to-green-500",
      titleColor: "text-white",
      subtitleColor: "text-emerald-50",
      imageEmojis: ["1f96c", "1f955", "1f345"],  // 🥬 🥕 🍅
    },
    deliveryMin: 699,
    distance: 1.2,
    branches: [
      { name: "สาขาลาดพร้าว",         address: "2142 ถ.ลาดพร้าว แขวงโชคดี",       distance: 1.2, hours: "07:00-22:00" },
      { name: "สาขารัชดาภิเษก",        address: "88 ถ.รัชดาภิเษก แขวงลาดยาว",       distance: 2.8, hours: "07:00-22:00" },
      { name: "สาขาเซ็นทรัลเวิลด์",    address: "999/9 ถ.พระราม 1 ปทุมวัน",          distance: 4.5, hours: "08:00-22:00" },
      { name: "สาขาบางกะปิ",           address: "18 ถ.บางกะปิ เขตบางกะปิ",           distance: 6.1, hours: "07:00-22:00" },
    ],
  },
  {
    id: "bigc",
    name: "Big C",
    logoUrl: "/partners/bigc-icon.svg",
    fallbackInitial: "B",
    fallbackClass: "bg-amber-100 text-amber-700",
    category: "supermarket",
    categoryLabel: "ซุปเปอร์มาร์เก็ต",
    websiteUrl: "https://www.bigc.co.th",
    promo: {
      title: "ซื้อ 1 แถม 1",
      subtitle: "สินค้าราคาพิเศษที่ร่วมรายการ",
      expiry: "วันนี้ - 25 มิ.ย. 2567",
      bgClass: "bg-gradient-to-br from-amber-200 to-yellow-300",
      titleColor: "text-amber-900",
      subtitleColor: "text-amber-800",
      imageEmojis: ["1f95c", "1f37f", "1f36a"],  // 🥜 🍿 🍪
    },
    deliveryMin: 599,
    distance: 2.5,
    branches: [
      { name: "สาขาแจ้งวัฒนะ",         address: "345 ถ.แจ้งวัฒนะ อ.ปากเกร็ด",          distance: 2.5, hours: "07:00-22:00" },
      { name: "สาขาฟิวเจอร์พาร์ค",     address: "94 ถ.พหลโยธิน เขตจตุจักร",            distance: 3.9, hours: "07:00-22:00" },
      { name: "สาขาบางใหญ่",            address: "888 ถ.บางใหญ่ เขตบางกอก",              distance: 5.2, hours: "07:00-22:00" },
    ],
  },
  {
    id: "tops",
    name: "Tops",
    logoUrl: "/partners/tops.png",
    fallbackInitial: "T",
    fallbackClass: "bg-red-100 text-red-700",
    category: "supermarket",
    categoryLabel: "ซุปเปอร์มาร์เก็ต",
    websiteUrl: "https://www.tops.co.th",
    promo: {
      title: "ลด 150 บาท",
      subtitle: "เมื่อซื้อครบ 1,500 บาท",
      note: "*เฉพาะสินค้าที่ร่วมรายการ",
      expiry: "วันนี้ - 15 ก.ค. 2567",
      bgClass: "bg-gradient-to-br from-rose-100 to-pink-200",
      titleColor: "text-rose-700",
      subtitleColor: "text-rose-600",
      imageEmojis: ["1f969", "1f357", "1f966"],  // 🥩 🍗 🥦
    },
    deliveryMin: 1000,
    distance: 3.1,
    branches: [
      { name: "สาขาเซ็นทรัลเวิลด์",    address: "999 ถ.พระราม 1 ปทุมวัน",               distance: 3.1, hours: "10:00-22:00" },
      { name: "สาขาเซ็นทรัลลาดพร้าว",  address: "1693 ถ.พหลโยธิน แขวงลาดยาว",           distance: 4.6, hours: "10:00-22:00" },
      { name: "สาขาเอ็มควอเทียร์",      address: "693 ถ.สุขุมวิท เขตคลองเตย",            distance: 5.8, hours: "10:00-22:00" },
    ],
  },
  {
    id: "makro",
    name: "Makro",
    logoUrl: "/partners/makro.ico",
    fallbackInitial: "M",
    fallbackClass: "bg-sky-100 text-sky-700",
    category: "supermarket",
    categoryLabel: "ซุปเปอร์มาร์เก็ต",
    websiteUrl: "https://www.siammakro.co.th",
    promo: {
      title: "ลดเพิ่ม 5%",
      subtitle: "สำหรับสมาชิกเอ็มโคร",
      expiry: "วันนี้ - 30 มิ.ย. 2567",
      bgClass: "bg-gradient-to-br from-pink-100 to-rose-200",
      titleColor: "text-red-600",
      subtitleColor: "text-red-500",
      imageEmojis: ["1f6d2", "1f96b", "1f955"],  // 🛒 🥫 🥕
    },
    deliveryMin: 1500,
    distance: 6.3,
    branches: [
      { name: "สาขาลาดพร้าว",           address: "3195 ถ.ลาดพร้าว เขตวังทองหลาง",        distance: 6.3, hours: "06:00-22:00" },
      { name: "สาขาบางนา",              address: "99 ถ.บางนา-ตราด เขตบางนา",             distance: 8.9, hours: "06:00-22:00" },
      { name: "สาขาดอนเมือง",           address: "333 ถ.วิภาวดีรังสิต เขตดอนเมือง",      distance: 11.4, hours: "06:00-22:00" },
    ],
  },
  {
    id: "cjmore",
    name: "CJ More",
    logoUrl: "/partners/cjmore.png",
    fallbackInitial: "CJ",
    fallbackClass: "bg-orange-100 text-orange-700",
    category: "convenience",
    categoryLabel: "ร้านสะดวกซื้อ",
    websiteUrl: "https://www.cjexpress.co.th",
    promo: {
      title: "ซื้อครบ 200 บาท",
      subtitle: "รับคูปองส่วนลด 20 บาท",
      expiry: "วันนี้ - 30 มิ.ย. 2567",
      bgClass: "bg-gradient-to-br from-teal-300 to-emerald-500",
      titleColor: "text-white",
      subtitleColor: "text-teal-50",
      imageEmojis: ["1f9c3", "1f964", "1f95b"],  // 🧃 🥤 🥛
    },
    deliveryMin: 200,
    distance: 0.8,
    branches: [
      { name: "สาขาถ.รัชดาภิเษก",      address: "120 ถ.รัชดาภิเษก เขตลาดยาว",           distance: 0.8, hours: "07:00-22:00" },
      { name: "สาขาถ.พหลโยธิน",        address: "456 ถ.พหลโยธิน แขวงสะพานใหม่",         distance: 1.5, hours: "07:00-22:00" },
      { name: "สาขาลาดยาว",             address: "78 ถ.ลาดยาว แขวงจตุจักร",               distance: 2.3, hours: "07:00-22:00" },
    ],
  },
  {
    id: "7eleven",
    name: "7-Eleven",
    logoUrl: "/partners/7eleven.png",
    fallbackInitial: "7E",
    fallbackClass: "bg-lime-100 text-lime-700",
    category: "convenience",
    categoryLabel: "ร้านสะดวกซื้อ",
    websiteUrl: "https://www.7eleven.co.th",
    promo: {
      title: "ลด 10 บาท",
      subtitle: "เมื่อซื้อครบ 100 บาท",
      expiry: "วันนี้ - 30 มิ.ย. 2567",
      bgClass: "bg-gradient-to-br from-sky-200 to-blue-300",
      titleColor: "text-blue-900",
      subtitleColor: "text-blue-800",
      imageEmojis: ["1f371", "1f95b", "1f9c3"],  // 🍱 🥛 🧃
    },
    deliveryMin: 150,
    distance: 0.5,
    branches: [
      { name: "สาขาใกล้บ้าน 1",         address: "12 ถ.พหลโยธิน แขวงสะพานใหม่",          distance: 0.5, hours: "24 ชั่วโมง" },
      { name: "สาขาใกล้บ้าน 2",         address: "77 ถ.รัชดาภิเษก แขวงลาดยาว",           distance: 0.9, hours: "24 ชั่วโมง" },
      { name: "สาขาตลาดสด",             address: "234 ถ.ลาดพร้าว แขวงโชคดี",              distance: 1.3, hours: "24 ชั่วโมง" },
      { name: "สาขาอาคารสำนักงาน",       address: "555 ถ.พหลโยธิน เขตจตุจักร",            distance: 2.0, hours: "24 ชั่วโมง" },
    ],
  },
];

export default function PartnersPage() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption]     = useState<SortOption>("recommended");
  const [sortOpen, setSortOpen]         = useState(false);
  const [brokenLogos, setBrokenLogos]   = useState<Set<string>>(new Set());
  const [infoOpen, setInfoOpen]         = useState(false);
  const [branchOpen, setBranchOpen]     = useState<string | null>(null);
  const [selectedBranchIdx, setSelectedBranchIdx] = useState<Record<string, number>>({});

  const getBranchDistance = (p: Partner) =>
    p.branches[selectedBranchIdx[p.id] ?? 0]?.distance ?? p.distance;

  const filtered = useMemo(() => {
    let list = [...partners];
    if (activeFilter === "nearme") {
      list = list.sort((a, b) => getBranchDistance(a) - getBranchDistance(b));
    } else if (activeFilter !== "all") {
      list = list.filter((p) => p.category === activeFilter);
    }
    if (sortOption === "nearest") list = [...list].sort((a, b) => getBranchDistance(a) - getBranchDistance(b));
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, sortOption, selectedBranchIdx]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "แนะนำ";

  return (
    <AppShell
      title="ร้านค้าพาร์ทเนอร์"
      subtitle="ค้นหาร้านค้าและโปรโมชั่นที่เชื่อมกับ Kin-Tan"
      headerAction={
        <button
          onClick={() => setInfoOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          <Info className="h-3.5 w-3.5" />
          วิธีใช้และสิทธิประโยชน์
        </button>
      }
    >

      {/* Top row: filters + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeFilter === f.value
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-700"
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Right: sort only */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative">
            <button
              onClick={() => setSortOpen((p) => !p)}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
            >
              เรียงตาม: {currentSortLabel}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-lg">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSortOption(o.value); setSortOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-xs transition hover:bg-slate-700 ${sortOption === o.value ? "font-semibold text-emerald-400" : "text-slate-300"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-12 text-center">
          <p className="text-slate-400">ไม่พบร้านค้าในหมวดหมู่นี้</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((partner) => (
            <article
              key={partner.id}
              className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-sm transition hover:shadow-lg"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-700">
                    {brokenLogos.has(partner.id) ? (
                      <span className={`flex h-full w-full items-center justify-center rounded-xl text-xs font-bold ${partner.fallbackClass}`}>
                        {partner.fallbackInitial}
                      </span>
                    ) : (
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        width={28}
                        height={28}
                        className="h-7 w-7 object-contain"
                        onError={() => setBrokenLogos((prev) => new Set(prev).add(partner.id))}
                      />
                    )}
                  </div>
                  <span className="text-base font-bold text-slate-100">{partner.name}</span>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-700/50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  {partner.categoryLabel}
                </span>
              </div>

              {/* Promo banner */}
              <div className={`relative mx-3 mb-3 h-28 overflow-hidden rounded-xl ${partner.promo.bgClass}`}>
                {/* Text */}
                <div className="absolute inset-0 flex flex-col justify-center px-4 py-3" style={{ width: "60%" }}>
                  <p className={`text-xl font-extrabold leading-tight ${partner.promo.titleColor}`}>
                    {partner.promo.title}
                  </p>
                  <p className={`mt-0.5 text-[11px] leading-snug ${partner.promo.subtitleColor}`}>
                    {partner.promo.subtitle}
                  </p>
                  {partner.promo.note && (
                    <p className={`text-[10px] ${partner.promo.subtitleColor} opacity-80`}>
                      {partner.promo.note}
                    </p>
                  )}
                  <p className={`mt-1.5 text-[10px] font-medium ${partner.promo.subtitleColor} opacity-70`}>
                    {partner.promo.expiry}
                  </p>
                </div>

                {/* Emoji product collage */}
                <div className="absolute right-0 top-0 h-full w-[44%] flex items-center justify-center overflow-hidden">
                  <div className="relative flex items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/promos/emoji/${partner.promo.imageEmojis[2]}.svg`} alt="" className="w-9 h-9 opacity-80" style={{ transform: "rotate(-6deg)" }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/promos/emoji/${partner.promo.imageEmojis[0]}.svg`} alt="" className="w-14 h-14" style={{ transform: "rotate(3deg)" }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/promos/emoji/${partner.promo.imageEmojis[1]}.svg`} alt="" className="w-10 h-10 opacity-90" style={{ transform: "rotate(6deg)" }} />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-3 pb-3">
                <button
                  onClick={() => setBranchOpen(partner.id)}
                  className="flex-1 rounded-xl border border-slate-600 py-2 text-center text-[12px] font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  ดูสาขา
                </button>
                <a
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-emerald-500 py-2 text-center text-[12px] font-semibold text-white transition hover:bg-emerald-600"
                >
                  ไปที่ร้านค้า
                </a>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-700/60 px-4 py-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Truck className="h-3 w-3 text-emerald-400" />
                  จัดส่งฟรีเมื่อครบ {partner.deliveryMin.toLocaleString()} บาท
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Navigation className="h-3 w-3 text-slate-500" />
                  {getBranchDistance(partner)} กม.
                  {(selectedBranchIdx[partner.id] ?? 0) > 0 && (
                    <span className="text-emerald-400 font-medium">• {partner.branches[selectedBranchIdx[partner.id]].name}</span>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Bottom banner */}
      <div className="overflow-hidden rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-green-950/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-base font-bold text-emerald-400">
              <span className="text-xl">🌿</span>
              ประหยัด คุ้มค่า ไม่ทิ้งอาหาร
            </p>
            <p className="mt-1 max-w-sm text-xs text-emerald-400/80">
              ใช้โปรโมชั่นอย่างชาญฉลาด ช่วยประหยัดค่าใช้จ่าย และลดการสูญเสียอาหารไปพร้อมกัน
            </p>
          </div>
          <div className="hidden sm:block">
            <Image
              src="/illustrations/login-grocery.svg"
              alt="grocery"
              width={80}
              height={80}
              className="h-20 w-20 object-contain opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Branch selection dialog */}
      {branchOpen && (() => {
        const p = partners.find(x => x.id === branchOpen)!;
        const currentIdx = selectedBranchIdx[p.id] ?? 0;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">เลือกสาขา</p>
                  <h3 className="text-base font-bold text-slate-100">{p.name}</h3>
                </div>
                <button onClick={() => setBranchOpen(null)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-700 text-slate-400">
                  ✕
                </button>
              </div>
              {/* Branch list */}
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-700/60">
                {p.branches.map((b, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setSelectedBranchIdx(prev => ({ ...prev, [p.id]: i }));
                        setBranchOpen(null);
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-700/50 ${i === currentIdx ? "bg-emerald-900/30" : ""}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === currentIdx ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                        {i === currentIdx ? "✓" : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${i === currentIdx ? "text-emerald-400" : "text-slate-200"}`}>{b.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{b.address}</p>
                        <p className="text-[11px] text-slate-500">{b.hours}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-bold ${i === currentIdx ? "text-emerald-400" : "text-slate-400"}`}>{b.distance} กม.</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}

      {/* Info modal */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
            <h3 className="mb-3 text-base font-bold text-slate-100">วิธีใช้และสิทธิประโยชน์</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>เลือกฟิลเตอร์เพื่อดูร้านค้าตามประเภทที่ต้องการ</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>กด &ldquo;ไปที่ร้านค้า&rdquo; เพื่อเปิดเว็บไซต์และรับโปรโมชั่น</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>โปรโมชั่นมีวันหมดอายุ ควรใช้ก่อนวันที่ระบุ</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span>ค่าจัดส่งฟรีเมื่อสั่งถึงขั้นต่ำที่กำหนด</li>
            </ul>
            <button
              onClick={() => setInfoOpen(false)}
              className="mt-4 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
