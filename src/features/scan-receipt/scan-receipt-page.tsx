"use client";

import { useState, useRef, useMemo } from "react";
import { Camera, ImageIcon, Filter, Pencil, Check, Plus } from "lucide-react";
import AppShell from "@/components/layout/app-shell";

type Item = {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

export default function ScanReceiptPage() {
  const [step, setStep] = useState(1);
  const [isAddingMoreReceipts, setIsAddingMoreReceipts] = useState(false);
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "อกไก่ 500 น.", unit: "แพ็ก", price: 65.0, quantity: 1 },
    { id: 2, name: "นมสด 1 ขวด", unit: "ขวด", price: 42.0, quantity: 1 },
    { id: 3, name: "ไข่ไก่ 10 ฟอง", unit: "แพ็ก", price: 45.0, quantity: 1 },
  ]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (isAddingMoreReceipts) {
        // When adding more receipts, simulate adding new items and keep step 2 open
        const newItems: Item[] = [
          { id: Math.random(), name: "ข้าวสวย 5 กิโล", unit: "ถุง", price: 150.0, quantity: 1 },
          { id: Math.random(), name: "น้ำมันหมู 1 ลิตร", unit: "ขวด", price: 220.0, quantity: 1 },
        ];
        setItems(prev => [...prev, ...newItems]);
        setIsAddingMoreReceipts(false);
        // Stay on step 2 to review merged items
      } else {
        // First receipt scan - move to step 2
        setTimeout(() => setStep(2), 100);
      }
    };
    reader.readAsDataURL(file);
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

  const handleAddMoreReceipts = () => {
    // Open camera to scan another receipt
    setIsAddingMoreReceipts(true);
    cameraInputRef.current?.click();
  };

  const handleSaveTopantry = async () => {
    // Categorize items using keyword-based logic
    const categorizeItem = (name: string): string => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes("นม") || lowerName.includes("เนย") || lowerName.includes("ชีส")) {
        return "นมและผลิตภัณฑ์นม";
      }
      if (lowerName.includes("ไก่") || lowerName.includes("เนื้อ") || lowerName.includes("หมู") || lowerName.includes("ปลา") || lowerName.includes("ไข่")) {
        return "โปรตีน";
      }
      if (lowerName.includes("ข้าว") || lowerName.includes("แป้ง")) {
        return "แป้งและข้าวเมล็ด";
      }
      if (lowerName.includes("ผัก") || lowerName.includes("ผลไม้")) {
        return "ผักและผลไม้";
      }
      return "อื่นๆ";
    };

    const categorizedItems = items.map((item) => ({
      ...item,
      category: categorizeItem(item.name),
      createdAt: new Date().toISOString(),
      id: Date.now() + Math.random(),
    }));

    // Save to localStorage for pantry page
    const existingPantry = JSON.parse(localStorage.getItem("pantry_items") || "[]");
    const updatedPantry = [...existingPantry, ...categorizedItems];
    localStorage.setItem("pantry_items", JSON.stringify(updatedPantry));

    setStep(3);
  };

  const stepConfig = [
    { num: 1, label: "สแกนใบเสร็จ" },
    { num: 2, label: "ตรวจสอบรายการ" },
    { num: 3, label: "บันทึกสินค้า" },
  ];

  return (
    <AppShell title="สแกนใบเสร็จ" subtitle="อัปโหลดรูปใบเสร็จเพื่อแยกรายการสินค้าอัตโนมัติ">
      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
        {stepConfig.map((config, idx) => (
          <div key={config.num} className="flex items-center flex-1">
            {/* Circle + Label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition ${
                  step >= config.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {config.num}
              </div>
              <p className={`text-xs font-medium text-center ${step >= config.num ? "text-emerald-700" : "text-slate-500"}`}>
                {config.label}
              </p>
            </div>

            {/* Connector line */}
            {idx < stepConfig.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition ${step > config.num ? "bg-emerald-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Scan Receipt */}
      {step === 1 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Camera Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 transition hover:bg-emerald-100"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">สแกนใบเสร็จ</p>
                  <p className="text-xs text-slate-600 mt-0.5">ถ่ายรูปใบเสร็จเพื่อสแกนอัตโนมัติ</p>
                </div>
              </div>
            </button>

            <p className="my-4 text-center text-sm text-slate-500">หรือ</p>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 flex items-center justify-center gap-2"
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

          {/* Right: Receipt Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-center font-bold text-lg text-slate-900 mb-3">Tops market</p>
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3">
                <div className="flex justify-between text-xs">
                  <span>วันที่</span>
                  <span>20 เม.ค. 2567 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 15:30</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>อกไก่ 500 น.</span>
                  <span className="font-semibold text-slate-900">65.00</span>
                </div>
                <div className="flex justify-between">
                  <span>นมสด 1 ขวด</span>
                  <span className="font-semibold text-slate-900">42.00</span>
                </div>
                <div className="flex justify-between">
                  <span>ไข่ไก่ 10 ฟอง</span>
                  <span className="font-semibold text-slate-900">45.00</span>
                </div>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-3 mt-3 flex justify-between font-semibold">
                <span>รวม</span>
                <span className="text-emerald-700">152.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review Items */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {/* Header with items count and edit */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">รายการที่ตรวจพบ</h3>
            </div>
            <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
              <Pencil className="h-4 w-4" />
              แก้ไขรายการ
            </button>
          </div>

          {/* Items list with quantity controls */}
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xl">
                  {item.id === 1 && "🍗"}
                  {item.id === 2 && "🥛"}
                  {item.id === 3 && "🥚"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.price.toFixed(2)} บาท · {item.unit}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">ตรวจพบสินค้า {items.length} รายการ</p>
                <p className="text-xs font-semibold text-emerald-700">รวมทั้งหมด {totalPrice.toFixed(2)} บาท</p>
              </div>
            </div>
            <button onClick={handleAddMoreReceipts} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm">
              <Plus className="h-4 w-4" />
              เพิ่มใบเสร็จ
            </button>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSaveTopantry}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              บันทึกสินค้า
            </button>
            <button
              onClick={() => {
                setStep(1);
              }}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">บันทึกเสร็จสิ้น</h3>
            <p className="text-slate-600">สินค้า {items.length} รายการได้ถูกบันทึกเข้าคลังของคุณแล้ว</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 mb-6">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-900 font-medium">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-slate-900">{(item.price * item.quantity).toFixed(2)} บาท</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-semibold">
              <span className="text-slate-900">รวมทั้งหมด</span>
              <span className="text-emerald-600">{totalPrice.toFixed(2)} บาท</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
              }}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              สแกนใบเสร็จอันถัดไป
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
