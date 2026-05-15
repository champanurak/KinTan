"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Camera, Package, Bell, ClipboardList, Heart,
  ShoppingCart, BarChart2, Settings, Search, MessageCircle,
  ChevronDown, MoreHorizontal, X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

type NavItem = { href: string; label: string; icon: React.ReactNode };
type AppShellProps = { title: string; subtitle?: string; headerAction?: React.ReactNode; children: React.ReactNode };

const navItems: NavItem[] = [
  { href: "/home",                label: "หน้าหลัก",          icon: <Home className="h-4 w-4" /> },
  { href: "/scan-receipt",        label: "สแกนใบเสร็จ",       icon: <Camera className="h-4 w-4" /> },
  { href: "/pantry",              label: "คลังวัตถุดิบ",      icon: <Package className="h-4 w-4" /> },
  { href: "/expiring-soon",       label: "แจ้งเตือน",         icon: <Bell className="h-4 w-4" /> },
  { href: "/menu-recommendations",label: "แนะนำเมนู",         icon: <ClipboardList className="h-4 w-4" /> },
  { href: "/nutrition",           label: "โภชนาการ",          icon: <Heart className="h-4 w-4" /> },
  { href: "/partners",            label: "ร้านค้า",           icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/reports",             label: "รายงาน",            icon: <BarChart2 className="h-4 w-4" /> },
  { href: "/settings",            label: "ตั้งค่า",           icon: <Settings className="h-4 w-4" /> },
];

const PRIMARY_HREFS = ["/home", "/scan-receipt", "/pantry", "/expiring-soon", "/menu-recommendations"];
const bottomNavItems = navItems.filter((n) => PRIMARY_HREFS.includes(n.href));
const moreNavItems   = navItems.filter((n) => !PRIMARY_HREFS.includes(n.href));

export default function AppShell({ title, subtitle, headerAction, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen]         = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setIsMoreOpen(false); }, [pathname]);

  function handleLogout() {
    logout();
    setIsUserMenuOpen(false);
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-white md:bg-[radial-gradient(circle_at_18%_10%,#eef3eb_0%,#e7ece7_36%,#e3e7e3_100%)] md:p-6 xl:p-10">

      {/* Mobile sticky top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base">🍊</div>
          <p className="font-[family-name:var(--font-display)] text-base font-semibold leading-none text-slate-900">Kin-Tan</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
          </button>
          <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500">
            <MessageCircle className="h-4 w-4" />
          </a>
          <div className="relative">
            <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {(user?.email?.[0] || "K").toUpperCase()}
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <Link href="/settings#profile" onClick={() => setIsUserMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">โปรไฟล์</Link>
                <Link href="/settings"         onClick={() => setIsUserMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">ตั้งค่า</Link>
                <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">ออกจากระบบ</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tablet/Desktop card layout */}
      <div className="md:mx-auto md:grid md:w-full md:max-w-6xl md:overflow-hidden md:rounded-[1.6rem] md:border md:border-slate-200 md:bg-white md:shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] md:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">

        {/* Sidebar (tablet+) */}
        <aside className="hidden md:flex md:flex-col border-r border-slate-200 bg-slate-50/90 p-5">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-xl">🍊</div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl text-slate-900">Kin-Tan</p>
                <p className="text-xs text-slate-500">จัดการของกิน ไม่ทิ้ง ไม่เสีย</p>
              </div>
            </div>
          </div>
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  <span className={active ? "text-emerald-600" : "text-slate-400"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-4">
            <p className="text-sm font-semibold text-emerald-800">อัปเกรดเป็น Premium</p>
            <p className="mt-1 text-xs text-emerald-700">ใช้งานฟีเจอร์วิเคราะห์ขั้นสูงได้ทันที</p>
            <button type="button" className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">อัปเกรด</button>
          </div>
        </aside>

        {/* Main content */}
        <section className="px-4 py-4 pb-24 md:p-6 md:pb-6">

          {/* Desktop header bar */}
          <header className="mb-5 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:flex">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">ค้นหาวัตถุดิบ / เมนู / ร้านค้า...</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
              </button>
              <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden lg:inline">ผู้ช่วย AI</span>
              </a>
              <div className="relative" ref={userMenuRef}>
                <button type="button" onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  aria-expanded={isUserMenuOpen} aria-haspopup="menu">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {(user?.email?.[0] || "K").toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">สวัสดี, {user?.email?.split("@")[0] || "คุณกินทัน"}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" role="menu">
                    <Link href="/settings#profile" role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">โปรไฟล์</Link>
                    <Link href="/settings"         role="menuitem" onClick={() => setIsUserMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">ตั้งค่า</Link>
                    <button type="button" role="menuitem" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">ออกจากระบบ</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page title */}
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900 sm:text-lg md:text-xl">{title}</h1>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
              </div>
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          </div>

          <div className="space-y-4">{children}</div>
        </section>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition ${active ? "text-emerald-600" : "text-slate-400"}`}>
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                <span className="truncate leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setIsMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center"><MoreHorizontal className="h-4 w-4" /></span>
            <span className="leading-none">เพิ่มเติม</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-5 pt-5 pb-10 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-base font-semibold text-slate-900">เมนูเพิ่มเติม</p>
              <button type="button" onClick={() => setIsMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="grid grid-cols-4 gap-3">
              {moreNavItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-[11px] font-medium transition ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${active ? "bg-emerald-200 text-emerald-700 ring-emerald-200" : "bg-white text-slate-500 ring-slate-200"}`}>
                      {item.icon}
                    </span>
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
