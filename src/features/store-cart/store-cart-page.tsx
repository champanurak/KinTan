"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, ChevronRight, Check, Minus, Plus, Trash2 } from "lucide-react";
import { useShoppingStore } from "@/store/shopping-store";

const PARTNER_INFO: Record<string, { name: string; source: string }> = {
  lotuss:   { name: "Lotus's",  source: "โลตัส โกเฟรซ และ ซูเปอร์มาร์เก็ต" },
  bigc:     { name: "Big C",    source: "Big C และ ซูเปอร์มาร์เก็ต" },
  tops:     { name: "Tops",     source: "Tops ซูเปอร์มาร์เก็ต" },
  makro:    { name: "Makro",    source: "แม็คโครและร้านค้าพาร์ทเนอร์" },
  cjmore:   { name: "CJ More",  source: "CJ Express" },
  "7eleven":{ name: "7-Eleven", source: "7-Eleven และพาร์ทเนอร์" },
};

function getMockPrice(name: string): number {
  const map: Record<string, number> = {
    วุ้นเส้น: 15, น้ำจิ้มสุกี้: 63, น้ำจิ้ม: 63, หมู: 89, ไก่: 75, ไข่: 45,
    ผักกาด: 25, กะเพรา: 15, กระเทียม: 20, พริก: 18, น้ำปลา: 35,
    ซีอิ๊ว: 28, น้ำมัน: 55, แครอท: 25, ข้าวโพด: 35, น้ำมันหอย: 42,
    ข้าว: 35, ซุป: 30, วุ้น: 15,
  };
  for (const key of Object.keys(map)) {
    if (name.includes(key)) return map[key];
  }
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return 19 + (Math.abs(h) % 71);
}

const SUGGESTED_PRODUCTS = [
  { emoji: "🥕", name: "แครอท 500 ก.", price: 25 },
  { emoji: "🧄", name: "กระเทียมสับ", price: 20 },
  { emoji: "🌶️", name: "พริกสด 100 ก.", price: 18 },
  { emoji: "🥬", name: "ผักกาดขาว", price: 22 },
];

export default function StoreCartPage() {
  const params = useSearchParams();
  const partnerId = params.get("partner") ?? "lotuss";
  const partnerInfo = PARTNER_INFO[partnerId] ?? PARTNER_INFO.lotuss;

  const { missingItems, clearMissingItems } = useShoppingStore();

  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkoutDone, setCheckoutDone] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const c: Record<string, boolean> = {};
    const q: Record<string, number> = {};
    missingItems.forEach((item) => { c[item.name] = true; q[item.name] = 1; });
    setChecked(c);
    setQuantities(q);
  }, [mounted, missingItems]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">กำลังโหลด...</p>
      </div>
    );
  }

  const checkedItems = missingItems.filter((i) => checked[i.name]);
  const total = checkedItems.reduce(
    (sum, i) => sum + getMockPrice(i.name) * (quantities[i.name] ?? 1),
    0,
  );
  const FREE_MIN = 100;
  const remaining = Math.max(0, FREE_MIN - total);
  const allChecked = missingItems.length > 0 && missingItems.every((i) => checked[i.name]);

  function toggleAll() {
    const next = !allChecked;
    const u: Record<string, boolean> = {};
    missingItems.forEach((i) => { u[i.name] = next; });
    setChecked(u);
  }

  function uncheckAll() {
    const u: Record<string, boolean> = {};
    missingItems.forEach((i) => { u[i.name] = false; });
    setChecked(u);
  }

  function handleCheckout() {
    setCheckoutDone(true);
    setTimeout(() => {
      clearMissingItems();
      window.close();
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── Address bar ── */}
      <div className="flex items-center gap-3 bg-white px-4 py-3">
        <MapPin className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            อาคารซี.พี.ทาวเวอร์ 313 ถ.สีลม แขวงสีลม เขตบางรัก
          </p>
          <p className="text-xs text-gray-500">Mr.Axons • 06349596000</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
      </div>

      {/* ── Delivery info ── */}
      <div className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
          <span className="text-xl">🛵</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">จัดส่งทันทีภายใน 1 ชม.</p>
          <p className="text-xs text-gray-500">จาก{partnerInfo.source}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
      </div>

      {/* ── Cart card ── */}
      <div className="mt-2 bg-white">

        {/* Select all row */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <button className="flex items-center gap-2.5" onClick={toggleAll}>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded ${
                allChecked ? "bg-teal-400" : "border-2 border-gray-300 bg-white"
              }`}
            >
              {allChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium text-gray-700">ทั้งหมด</span>
          </button>
          <button onClick={uncheckAll} aria-label="ยกเลิกทั้งหมด">
            <Trash2 className="h-5 w-5 text-gray-400 transition hover:text-red-400" />
          </button>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-100">
          {missingItems.map((item) => {
            const price = getMockPrice(item.name);
            const qty = quantities[item.name] ?? 1;
            const isChecked = checked[item.name] ?? true;
            return (
              <div key={item.name} className="px-4 py-4">
                {/* Main item row */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChecked((prev) => ({ ...prev, [item.name]: !prev[item.name] }))}
                    aria-label={`เลือก ${item.name}`}
                    className="shrink-0"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded ${
                        isChecked ? "bg-teal-400" : "border-2 border-gray-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>

                  {/* Product emoji image */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-4xl shadow-sm">
                    {item.emoji}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-gray-800">{item.name}</p>
                    <p className="mt-1 text-base font-bold text-red-500">฿ {price.toFixed(2)}</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.name]: Math.max(1, (prev[item.name] ?? 1) - 1),
                        }))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
                      aria-label="ลด"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-gray-800">{qty}</span>
                    <button
                      onClick={() =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.name]: (prev[item.name] ?? 1) + 1,
                        }))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-400 text-teal-500 transition hover:bg-teal-50"
                      aria-label="เพิ่ม"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Promo hint */}
                <div className="ml-8 mt-2.5 rounded-xl bg-amber-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      % ลดทันที
                    </span>
                    <p className="text-xs text-amber-700">ซื้อครบ 299.- ลดทันที 10.-</p>
                    <ChevronRight className="ml-auto h-3.5 w-3.5 rotate-90 text-amber-400" />
                  </div>
                  <p className="mt-0.5 text-[10px] text-amber-600/80">ซื้อครบ 499.- ลดทันที 20.-...</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add more link */}
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            ต้องการเพิ่มสินค้า?{" "}
            <button onClick={() => window.close()} className="font-medium text-teal-500 hover:underline">
              กลับไปช้อปปิ้ง
            </button>
          </p>
        </div>
      </div>

      {/* ── Suggested products ── */}
      <div className="mt-2 bg-white">
        <p className="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-600">
          สินค้าที่คุณอาจสนใจ
        </p>
        <div className="flex gap-3 overflow-x-auto px-4 py-3 pb-4">
          {SUGGESTED_PRODUCTS.map((s) => (
            <div
              key={s.name}
              className="w-28 shrink-0 rounded-xl border border-gray-200 bg-white p-2 text-center shadow-sm"
            >
              <div className="mb-1 text-4xl">{s.emoji}</div>
              <p className="text-[11px] font-medium leading-tight text-gray-700">{s.name}</p>
              <p className="mt-0.5 text-[12px] font-bold text-red-500">฿{s.price}</p>
              <button className="mt-1.5 w-full rounded-lg border border-teal-400 py-1 text-[10px] font-semibold text-teal-500 transition hover:bg-teal-50">
                เพิ่ม
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-52" />

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">

        {/* Free delivery progress */}
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span>🛵</span>
            <p className="text-[11px] text-amber-700">
              {remaining > 0
                ? `ส่งฟรี! เมื่อช็อปเพิ่ม ฿${remaining} (ขั้นต่ำ ฿${FREE_MIN})`
                : "คุณได้รับการจัดส่งฟรี! 🎉"}
            </p>
          </div>
          {remaining > 0 && (
            <button className="rounded-full border border-teal-400 px-2.5 py-0.5 text-[11px] font-semibold text-teal-500">
              เพิ่มสินค้า
            </button>
          )}
        </div>

        {/* Coupon */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🎫</span>
            <span className="text-sm text-gray-700">คูปองและคูปองเงินสด</span>
          </div>
          <span className="text-sm text-gray-400">เลือก ›</span>
        </div>

        {/* Coins */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🪙</span>
            <span className="text-sm text-gray-700">ใช้{partnerInfo.name}คอยน์ (0 คอยน์)</span>
          </div>
          <div className="relative h-6 w-11 cursor-pointer rounded-full bg-gray-200">
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition" />
          </div>
        </div>

        {/* Total + checkout */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">ยอดชำระ</p>
            <p className="text-2xl font-extrabold text-gray-800">฿{total}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkedItems.length === 0}
            className={`rounded-full px-8 py-3 text-sm font-bold text-white transition ${
              checkoutDone
                ? "bg-teal-600"
                : checkedItems.length === 0
                ? "cursor-not-allowed bg-gray-300"
                : "bg-teal-400 hover:bg-teal-500"
            }`}
          >
            {checkoutDone ? "✓ สั่งซื้อแล้ว!" : `เช็คเอาท์ (${checkedItems.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
