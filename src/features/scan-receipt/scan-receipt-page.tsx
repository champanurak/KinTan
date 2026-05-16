"use client";

import { useState, useRef, useMemo, Fragment } from "react";
import { Camera, ImageIcon, Filter, Pencil, Check, Plus, FileText, X } from "lucide-react";
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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
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
      const imageUrl = reader.result as string;
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
        // First receipt scan — show image preview; user clicks button to proceed to step 2
        setUploadedImageUrl(imageUrl);
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
      <div className="mb-6 flex items-center rounded-2xl border border-slate-700 bg-slate-800/60 px-6 py-5">
        {stepConfig.map((config, idx) => (
          <Fragment key={config.num}>
            {/* Circle + Label */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition ${
                  step >= config.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-600 text-slate-400"
                }`}
              >
                {config.num}
              </div>
              <p className={`text-xs font-medium text-center ${step >= config.num ? "text-emerald-400" : "text-slate-500"}`}>
                {config.label}
              </p>
            </div>

            {/* Connector line between steps */}
            {idx < stepConfig.length - 1 && (
              <div className={`h-0.5 flex-1 mx-4 mb-5 transition ${step > config.num ? "bg-emerald-600" : "bg-slate-600"}`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step 1: Scan Receipt */}
      {step === 1 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Camera Input */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-emerald-700/60 bg-emerald-900/30 p-6 transition hover:bg-emerald-900/50"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-100">สแกนใบเสร็จ</p>
                  <p className="text-xs text-slate-400 mt-0.5">ถ่ายรูปใบเสร็จเพื่อสแกนอัตโนมัติ</p>
                </div>
              </div>
            </button>

            <p className="my-4 text-center text-sm text-slate-500">หรือ</p>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700 flex items-center justify-center gap-2"
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

          {/* Right: Receipt Preview — shows uploaded image or empty state */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 flex items-center justify-center min-h-[240px]">
            {uploadedImageUrl ? (
              <div className="w-full space-y-4">
                <div className="relative">
                  <img
                    src={uploadedImageUrl}
                    alt="รูปใบเสร็จ"
                    className="w-full rounded-xl object-contain max-h-72"
                  />
                  <button
                    onClick={() => setUploadedImageUrl(null)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  วิเคราะห์ใบเสร็จ
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600 bg-slate-700/50">
                  <FileText className="h-7 w-7 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">ไม่มีข้อมูล</p>
                  <p className="text-xs text-slate-500 mt-1">สแกนหรืออัปโหลดใบเสร็จ<br />เพื่อแสดงรายการสินค้า</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Review Items */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          {/* Header with items count and edit */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-slate-100">รายการที่ตรวจพบ</h3>
            </div>
            <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm">
              <Pencil className="h-4 w-4" />
              แก้ไขรายการ
            </button>
          </div>

          {/* Items list with quantity controls */}
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-700/50 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xl">
                  {item.id === 1 && "🍗"}
                  {item.id === 2 && "🥛"}
                  {item.id === 3 && "🥚"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.price.toFixed(2)} บาท · {item.unit}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-emerald-900/30 border border-emerald-700/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">ตรวจพบสินค้า {items.length} รายการ</p>
                <p className="text-xs font-semibold text-emerald-400">รวมทั้งหมด {totalPrice.toFixed(2)} บาท</p>
              </div>
            </div>
            <button onClick={handleAddMoreReceipts} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm">
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
                setUploadedImageUrl(null);
              }}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/50 mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">บันทึกเสร็จสิ้น</h3>
            <p className="text-slate-400">สินค้า {items.length} รายการได้ถูกบันทึกเข้าคลังของคุณแล้ว</p>
          </div>

          <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-4 mb-6">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-200 font-medium">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-slate-200">{(item.price * item.quantity).toFixed(2)} บาท</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-600 mt-3 pt-3 flex justify-between font-semibold">
              <span className="text-slate-300">รวมทั้งหมด</span>
              <span className="text-emerald-400">{totalPrice.toFixed(2)} บาท</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setUploadedImageUrl(null);
              }}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700"
            >
              สแกนใบเสร็จอันถัดไป
            </button>
            <button
              onClick={() => {
                setStep(1);
                setUploadedImageUrl(null);
              }}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
