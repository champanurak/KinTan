"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Camera,
  Package,
  Bell,
  ClipboardList,
  Heart,
  ShoppingCart,
  BarChart2,
  Settings,
  Search,
  MessageCircle,
  ChevronDown,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

type NavItem = { href: string; label: string; icon: React.ReactNode };
type AppShellProps = {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: "/home", label: "หน้าหลัก", icon: <Home className="h-4 w-4" /> },
  {
    href: "/scan-receipt",
    label: "สแกนใบเสร็จ",
    icon: <Camera className="h-4 w-4" />,
  },
  {
    href: "/pantry",
    label: "คลังวัตถุดิบ",
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: "/expiring-soon",
    label: "แจ้งเตือน",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    href: "/menu-recommendations",
    label: "แนะนำเมนู",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    href: "/nutrition",
    label: "โภชนาการ",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    href: "/partners",
    label: "ร้านค้า",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    href: "/reports",
    label: "รายงาน",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    href: "/settings",
    label: "ตั้งค่า",
    icon: <Settings className="h-4 w-4" />,
  },
];

const PRIMARY_HREFS = [
  "/home",
  "/scan-receipt",
  "/pantry",
  "/expiring-soon",
  "/menu-recommendations",
];
const bottomNavItems = navItems.filter((n) => PRIMARY_HREFS.includes(n.href));
const moreNavItems = navItems.filter((n) => !PRIMARY_HREFS.includes(n.href));

export default function AppShell({
  title,
  subtitle,
  headerAction,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    avatarDataUrl?: string;
  } | null>(null);

  useEffect(() => {
    function loadProfile() {
      const raw = localStorage.getItem("user_profile");
      if (!raw) return;
      try {
        setProfile(JSON.parse(raw));
      } catch {}
    }
    loadProfile();
    window.addEventListener("profile_updated", loadProfile);
    return () => window.removeEventListener("profile_updated", loadProfile);
  }, []);

  const notifItems = [
    {
      emoji: "🥩",
      bg: "bg-red-50",
      name: "เนื้อสันในวัว",
      code: "RM-001",
      qty: "2.5 กก.",
      daysLeft: 1,
      expiry: "17 พ.ค. 2569",
      badge: "bg-red-100 text-red-600",
      expClass: "text-red-500",
    },
    {
      emoji: "🥛",
      bg: "bg-blue-50",
      name: "นมสดพาสเจอร์ไรส์",
      code: "DA-004",
      qty: "3 ขวด",
      daysLeft: 2,
      expiry: "18 พ.ค. 2569",
      badge: "bg-orange-100 text-orange-600",
      expClass: "text-orange-500",
    },
    {
      emoji: "🥚",
      bg: "bg-amber-50",
      name: "ไข่ไก่ เบอร์ 2",
      code: "EG-002",
      qty: "20 ฟอง",
      daysLeft: 3,
      expiry: "19 พ.ค. 2569",
      badge: "bg-amber-100 text-amber-600",
      expClass: "text-amber-500",
    },
    {
      emoji: "🌾",
      bg: "bg-yellow-50",
      name: "แป้งสาลีเนกประสงค์",
      code: "ING-010",
      qty: "1.2 กก.",
      daysLeft: 5,
      expiry: "21 พ.ค. 2569",
      badge: "bg-yellow-100 text-yellow-600",
      expClass: "text-yellow-600",
    },
    {
      emoji: "🫙",
      bg: "bg-slate-50",
      name: "ซอสหอยนางรม",
      code: "ING-015",
      qty: "1 ขวด",
      daysLeft: 7,
      expiry: "23 พ.ค. 2569",
      badge: "bg-green-100 text-green-600",
      expClass: "text-green-600",
    },
  ];
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    setIsUserMenuOpen(false);
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 md:p-6 xl:p-10">
      {/* Mobile sticky top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-700 bg-slate-900/95 px-4 backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base">
            🍊
          </div>
          <p className="font-[family-name:var(--font-display)] text-base font-semibold leading-none text-slate-100">
            Kin-Tan
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 overflow-hidden"
            >
              {profile?.avatarDataUrl ? (
                <img
                  src={profile.avatarDataUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile?.name?.[0] || user?.email?.[0] || "K").toUpperCase()
              )}
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-lg">
                <Link
                  href="/settings#profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  โปรไฟล์
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  ตั้งค่า
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-900/30"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tablet/Desktop card layout */}
      <div className="md:mx-auto md:grid md:w-full md:max-w-6xl md:overflow-hidden md:rounded-[1.6rem] md:border md:shadow-[0_18px_60px_-28px_rgba(15,23,42,0.35)] md:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">
        {/* Sidebar (tablet+) */}
        <aside className="hidden md:flex md:flex-col border-r border-slate-700 bg-slate-50 p-5">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-xl">
                🍊
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl text-slate-100">
                  Kin-Tan
                </p>
                <p className="text-xs text-slate-500">
                  จัดการของกิน ไม่ทิ้ง ไม่เสีย
                </p>
              </div>
            </div>
          </div>
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200 dark:bg-slate-800 dark:text-emerald-400 dark:ring-slate-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"}`}
                >
                  <span
                    className={
                      active
                        ? "text-emerald-800 dark:text-emerald-400"
                        : "text-slate-400"
                    }
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-900/20 p-4">
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 leading-snug">
              อัปเกรดเป็น Premium
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              ใช้งานฟีเจอร์วิเคราะห์ขั้นสูงได้ทันที
            </p>
            <div className="flex items-end justify-center gap-2 mt-2 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/mascot-bag.svg"
                alt=""
                className="w-[68px] h-[68px] object-contain"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/mascot-bag.svg"
                alt=""
                className="w-[54px] h-[54px] object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => router.push("/upgrade")}
              className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              อัปเกรด
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="px-4 py-4 pb-24 md:p-6 md:pb-6 bg-slate-900">
          {/* Desktop header bar */}
          <header className="mb-5 hidden items-center gap-3 rounded-2xl  bg-slate-800/60  md:flex md:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNotifOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden lg:inline">ผู้ช่วย AI</span>
              </a>
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 overflow-hidden">
                    {profile?.avatarDataUrl ? (
                      <img
                        src={profile.avatarDataUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        profile?.name?.[0] ||
                        user?.email?.[0] ||
                        "K"
                      ).toUpperCase()
                    )}
                  </div>
                  <span className="hidden lg:inline">
                    สวัสดี,{" "}
                    {profile?.name || user?.email?.split("@")[0] || "คุณกินทัน"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-lg"
                    role="menu"
                  >
                    <Link
                      href="/settings#profile"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    >
                      โปรไฟล์
                    </Link>
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                    >
                      ตั้งค่า
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-900/30"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page title */}
          <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-100 sm:text-lg md:text-xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
          </div>

          <div className="space-y-4">{children}</div>
        </section>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition ${active ? "text-emerald-600" : "text-slate-400"}`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {item.icon}
                </span>
                <span className="truncate leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium text-slate-400"
          >
            <span className="flex h-5 w-5 items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
            <span className="leading-none">เพิ่มเติม</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-slate-800 border-t border-slate-700 px-5 pt-5 pb-10 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-base font-semibold text-slate-100">
                เมนูเพิ่มเติม
              </p>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="grid grid-cols-4 gap-3">
              {moreNavItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-[11px] font-medium transition ${active ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"}`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${active ? "bg-emerald-900/60 text-emerald-400 ring-emerald-700" : "bg-slate-700 text-slate-400 ring-slate-600"}`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      {/* Notification dialog */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-700">
              <span className="text-xl">🔔</span>
              <h3 className="flex-1 text-base font-bold text-slate-100">
                แจ้งเตือนวัตถุดิบ/สินค้าใกล้หมดอายุ
              </h3>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 text-sm"
              >
                ✕
              </button>
            </div>
            {/* Warning banner */}
            <div className="mx-4 mt-3 flex items-center gap-3 rounded-xl bg-amber-900/30 border border-amber-700/50 px-4 py-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-400">
                  พบวัตถุดิบ/สินค้าใกล้หมดอายุ {notifItems.length} รายการ
                </p>
                <p className="text-xs text-amber-500/80">
                  กรุณาตรวจสอบและวางแผนการใช้งานก่อนหมดอายุ
                </p>
              </div>
              <Link
                href="/expiring-soon"
                onClick={() => setIsNotifOpen(false)}
                className="shrink-0 rounded-lg border border-amber-700/60 bg-amber-900/40 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-900/60"
              >
                ดูทั้งหมด
              </Link>
            </div>
            {/* Item list */}
            <ul className="flex-1 overflow-y-auto divide-y divide-slate-700/50 px-2 mt-2">
              {notifItems.map((item, i) => (
                <li key={i}>
                  <Link
                    href="/expiring-soon"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-700/50 transition"
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${item.bg}`}
                    >
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        คงเหลือ: {item.qty}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.badge}`}
                      >
                        เหลือ {item.daysLeft} วัน
                      </span>
                      <p
                        className={`mt-0.5 text-[11px] font-medium ${item.expClass}`}
                      >
                        หมดอายุ {item.expiry}
                      </p>
                    </div>
                    <span className="text-slate-500 text-sm">›</span>
                  </Link>
                </li>
              ))}
            </ul>
            {/* Footer */}
            <div className="flex items-center border-t border-slate-700 px-5 py-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="text-sm">🗓️</span>
                อัปเดตล่าสุด 16 พ.ค. 2569 เวลา 09:30 น.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
