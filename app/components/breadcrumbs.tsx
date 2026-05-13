"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const pathLabels: Record<string, string> = {
  "/home": "หน้าหลัก",
  "/scan-receipt": "สแกนใบเสร็จ",
  "/pantry": "คลังวัตถุดิบ",
  "/expiring-soon": "แจ้งเตือน",
  "/menu-recommendations": "แนะนำเมนู",
  "/nutrition": "โภชนาการ",
  "/partners": "ร้านค้าพาร์ทเนอร์",
  "/reports": "สถิติ & รายงาน",
  "/settings": "ตั้งค่า"
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Skip breadcrumbs on login page
  if (pathname === "/") {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "หน้าหลัก", href: "/home" }
  ];

  const currentLabel = pathLabels[pathname];
  if (currentLabel && pathname !== "/home") {
    breadcrumbs.push({
      label: currentLabel,
      href: pathname
    });
  }

  return (
    <nav className="mb-4 flex items-center gap-2 text-sm" aria-label="breadcrumb">
      {breadcrumbs.map((item, idx) => (
        <div key={item.href} className="flex items-center gap-2">
          {idx > 0 && <span className="text-slate-400">/</span>}
          {idx === breadcrumbs.length - 1 ? (
            <span className="text-slate-600 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-emerald-600 hover:text-emerald-700 transition">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
