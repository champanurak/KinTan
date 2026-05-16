"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import {
  Bell, Clock, Tag, BarChart2,
  UploadCloud, RefreshCw, Trash2,
  Scale, FlaskConical, Thermometer,
  ChevronRight, ChevronDown, ExternalLink,
  Sun, Moon, Monitor, HelpCircle,
} from "lucide-react";

const TABS = ["บัญชีผู้ใช้", "คนในครัวเรือน", "การแจ้งเตือน", "การจัดการหน่วย", "ความปลอดภัย", "การเชื่อมต่อ", "อื่นๆ"];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-600"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SelectField({ label, value, onChange, children }: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 transition pr-8 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab]     = useState(0);
  const { theme, setTheme }           = useTheme();
  const { logout }                    = useAuth();
  const router                        = useRouter();
  const [notifExpiry, setNotifExpiry] = useState(true);
  const [notifMenu, setNotifMenu]     = useState(true);
  const [notifPromo, setNotifPromo]   = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [name, setName]               = useState("test");
  const [email, setEmail]             = useState("test@example.com");
  const [phone, setPhone]             = useState("081-234-5678");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [saved, setSaved]             = useState(false);
  // การตั้งค่าส่วนตัว
  const [language, setLanguage]       = useState("ภาษาไทย");
  const [currency, setCurrency]       = useState("บาท (฿)");
  const [dateFormat, setDateFormat]   = useState("วันที่ 9 ม.ค. 2567");
  const [timezone, setTimezone]       = useState("(GMT+07:00) กรุงเทพฯ");
  const [prefsSaved, setPrefsSaved]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.name)         setName(p.name);
      if (p.email)        setEmail(p.email);
      if (p.phone)        setPhone(p.phone);
      if (p.avatarDataUrl) setAvatarDataUrl(p.avatarDataUrl);
    } catch {}
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user_prefs");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.language)   setLanguage(p.language);
      if (p.currency)   setCurrency(p.currency);
      if (p.dateFormat) setDateFormat(p.dateFormat);
      if (p.timezone)   setTimezone(p.timezone);
    } catch {}
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatarDataUrl((evt.target?.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const profile = { name, email, phone, avatarDataUrl };
    localStorage.setItem("user_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("profile_updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSavePrefs() {
    const prefs = { language, theme, currency, dateFormat, timezone };
    localStorage.setItem("user_prefs", JSON.stringify(prefs));
    window.dispatchEvent(new Event("prefs_updated"));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  }

  return (
    <AppShell title="ตั้งค่า" subtitle="จัดการข้อมูลบัญชี การตั้งค่าแอป และการแจ้งเตือน">

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === i ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 ? (
        <div className="space-y-5">

          {/* ── Row 1 ── */}
          <div className="grid gap-5 xl:grid-cols-3">

            {/* ข้อมูลบัญชี */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">ข้อมูลบัญชี</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">ชื่อ</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 transition dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">อีเมล</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 transition dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">เบอร์โทรศัพท์</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400 transition dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">รูปโปรไฟล์</label>
                  <div className="flex items-center gap-3">
                    {avatarDataUrl ? (
                      <img src={avatarDataUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 select-none">{name?.[0]?.toUpperCase() || "T"}</div>
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">เปลี่ยนรูป</button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">รองรับไฟล์โปรไฟล์ทุกประเภท ขนาดไม่เกิน 2MB</p>
                </div>
              </div>
              <button type="button" onClick={handleSave} className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                {saved ? "✓ บันทึกแล้ว" : "บันทึกข้อมูล"}
              </button>
            </div>

            {/* การตั้งค่าส่วนตัว */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">การตั้งค่าส่วนตัว</h3>
              <div className="space-y-4">
                <SelectField label="ภาษา" value={language} onChange={setLanguage}>
                  <option>ภาษาไทย</option>
                  <option>English</option>
                </SelectField>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">ธีม</label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                    {([
                      { val: "light",  icon: <Sun className="h-3.5 w-3.5" />,     label: "สว่าง" },
                      { val: "dark",   icon: <Moon className="h-3.5 w-3.5" />,    label: "มืด" },
                      { val: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "ตามระบบ" },
                    ] as const).map((t) => (
                      <button key={t.val} type="button"
                        onClick={() => setTheme(t.val)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition ${
                          theme === t.val ? "bg-emerald-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SelectField label="สกุลเงิน" value={currency} onChange={setCurrency}>
                  <option>บาท (฿)</option>
                  <option>USD ($)</option>
                </SelectField>

                <SelectField label="รูปแบบวันที่" value={dateFormat} onChange={setDateFormat}>
                  <option>วันที่ 9 ม.ค. 2567</option>
                  <option>09/01/2567</option>
                </SelectField>

                <SelectField label="เขตเวลา" value={timezone} onChange={setTimezone}>
                  <option>(GMT+07:00) กรุงเทพฯ</option>
                  <option>(GMT+00:00) UTC</option>
                  <option>(GMT+09:00) โตเกียว</option>
                  <option>(GMT-05:00) นิวยอร์ก</option>
                </SelectField>
              </div>
              <button type="button" onClick={handleSavePrefs} className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                {prefsSaved ? "✓ บันทึกแล้ว" : "บันทึกการตั้งค่า"}
              </button>
            </div>

            {/* การแจ้งเตือน */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">การแจ้งเตือน</h3>
              <div className="space-y-4">
                {[
                  { icon: <Bell className="h-4 w-4 text-orange-500" />,      bg: "bg-orange-50",  title: "แจ้งเตือนวัตถุดิบใกล้หมดอายุ", sub: "แจ้งเตือนล่วงหน้าวัตถุดิบหมดอายุ", val: notifExpiry,  set: setNotifExpiry },
                  { icon: <Clock className="h-4 w-4 text-emerald-500" />,    bg: "bg-emerald-50", title: "แจ้งเตือนเมนูแนะนำ",             sub: "แนะนำเมนูตามวัตถุดิบที่มี",       val: notifMenu,    set: setNotifMenu },
                  { icon: <Tag className="h-4 w-4 text-blue-500" />,         bg: "bg-blue-50",    title: "แจ้งเตือนโปรโมชั่น",            sub: "รับโปรโมชั่นและข่าวสาร",          val: notifPromo,   set: setNotifPromo },
                  { icon: <BarChart2 className="h-4 w-4 text-purple-500" />, bg: "bg-purple-50",  title: "สรุปรายจ่ายรายสัปดาห์",         sub: "ส่งสรุปค่าใช้จ่ายทุกสัปดาห์",     val: notifWeekly,  set: setNotifWeekly },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <Toggle value={item.val} onChange={() => item.set(!item.val)} />
                  </div>
                ))}
              </div>
              <button type="button" className="mt-5 w-full rounded-xl border border-emerald-200 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition dark:border-emerald-700 dark:hover:bg-emerald-900/30">จัดการการแจ้งเตือนทั้งหมด</button>
            </div>
          </div>

          {/* ── Row 2 ── */}
          <div className="grid gap-5 xl:grid-cols-3">

            {/* การจัดการข้อมูล */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">การจัดการข้อมูล</h3>
              <div className="space-y-3">
                {[
                  { icon: <UploadCloud className="h-4 w-4 text-emerald-500" />, bg: "bg-emerald-50", title: "สำรองข้อมูล",  sub: "ดาวน์โหลดข้อมูลทั้งหมดของคุณ", label: "สำรองข้อมูล",  btn: "border-emerald-300 text-emerald-600 hover:bg-emerald-50" },
                  { icon: <RefreshCw className="h-4 w-4 text-blue-500" />,      bg: "bg-blue-50",    title: "กู้คืนข้อมูล", sub: "กู้คืนข้อมูลจากไฟล์สำรอง",     label: "กู้คืนข้อมูล", btn: "border-blue-300 text-blue-600 hover:bg-blue-50" },
                  { icon: <Trash2 className="h-4 w-4 text-red-500" />,          bg: "bg-red-50",     title: "ล้างข้อมูล",   sub: "ลบข้อมูลทั้งหมดอย่างถาวร",     label: "ล้างข้อมูล",   btn: "border-red-300 text-red-500 hover:bg-red-50" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <button type="button" className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition flex-shrink-0 ${item.btn}`}>{item.label}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* หน่วยเริ่มต้น */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">หน่วยเริ่มต้น</h3>
              <div className="space-y-1">
                {[
                  { icon: <Scale className="h-4 w-4 text-slate-500" />,       label: "น้ำหนัก",  value: "กรัม (g)" },
                  { icon: <FlaskConical className="h-4 w-4 text-slate-500" />, label: "ปริมาตร",  value: "มิลลิลิตร (ml)" },
                  { icon: <Thermometer className="h-4 w-4 text-slate-500" />,  label: "อุณหภูมิ", value: "องศาเซลเซียส (°C)" },
                ].map((item) => (
                  <button key={item.label} type="button" className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.value}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
              <button type="button" className="mt-3 w-full rounded-xl border border-emerald-200 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition dark:border-emerald-700 dark:hover:bg-emerald-900/30">แก้ไขหน่วยทั้งหมด</button>
            </div>

            {/* เกี่ยวกับแอป */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">เกี่ยวกับแอป</h3>
              <div className="flex flex-col items-center py-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-3xl select-none">🍊</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Kin-Tan</p>
                <p className="text-xs text-slate-400 mt-0.5">เวอร์ชัน 1.4.0</p>
              </div>
              <div className="space-y-1 mb-4">
                {["ข้อตกลงการใช้งาน", "นโยบายความเป็นส่วนตัว"].map((item) => (
                  <button key={item} type="button" className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition dark:hover:bg-slate-700">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { logout(); router.push("/"); }} className="w-full rounded-xl border border-red-300 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition">ออกจากระบบ</button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-center justify-between gap-3 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 dark:bg-slate-700">
                <HelpCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">ต้องการความช่วยเหลือ?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">อ่านคำถามที่พบบ่อย หรือ ติดต่อทีมงานของเรา</p>
              </div>
            </div>
            <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition whitespace-nowrap flex-shrink-0 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
              ไปที่ศูนย์ช่วยเหลือ <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <div className="text-5xl mb-4">🚧</div>
          <p className="text-lg font-medium text-slate-500">กำลังพัฒนา</p>
          <p className="text-sm mt-1">ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้</p>
        </div>
      )}
    </AppShell>
  );
}

