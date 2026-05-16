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
  ChevronRight, ExternalLink,
  Sun, Moon, Monitor, HelpCircle,
} from "lucide-react";
import { useForm, Controller, useWatch, type Control } from "react-hook-form";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";

type ProfileForm = { name: string; email: string; phone: string };

/** Isolated so only this tiny component re-renders on name-field keystrokes */
function AvatarInitial({ control }: { control: Control<ProfileForm> }) {
  const name = useWatch({ control, name: "name" });
  return <>{name?.[0]?.toUpperCase() || "T"}</>;
}
type PrefsForm   = { language: string; currency: string; dateFormat: string; timezone: string };

const TABS = ["บัญชีผู้ใช้", "คนในครัวเรือน", "การแจ้งเตือน", "การจัดการหน่วย", "ความปลอดภัย", "การเชื่อมต่อ", "อื่นๆ"];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-600"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
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
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [saved, setSaved]             = useState(false);
  const [prefsSaved, setPrefsSaved]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronous — no extra state/effect needed; "use client" always runs in browser
  const resolvedTheme: "light" | "dark" = theme === "dark" ? "dark" : "light";

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: profileReset,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: { name: "test", email: "test@example.com", phone: "081-234-5678" },
  });

  const {
    control: prefsControl,
    handleSubmit: handlePrefsSubmit,
    reset: prefsReset,
  } = useForm<PrefsForm>({
    defaultValues: {
      language: "ภาษาไทย",
      currency: "บาท (฿)",
      dateFormat: "วันที่ 9 ม.ค. 2567",
      timezone: "(GMT+07:00) กรุงเทพฯ",
    },
  });

  useEffect(() => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      profileReset({
        name:  p.name  || "test",
        email: p.email || "test@example.com",
        phone: p.phone || "081-234-5678",
      });
      if (p.avatarDataUrl) setAvatarDataUrl(p.avatarDataUrl);
    } catch {}
  }, [profileReset]);

  useEffect(() => {
    const raw = localStorage.getItem("user_prefs");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      prefsReset({
        language:   p.language   || "ภาษาไทย",
        currency:   p.currency   || "บาท (฿)",
        dateFormat: p.dateFormat || "วันที่ 9 ม.ค. 2567",
        timezone:   p.timezone   || "(GMT+07:00) กรุงเทพฯ",
      });
    } catch {}
  }, [prefsReset]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatarDataUrl((evt.target?.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  }

  function onSaveProfile(data: ProfileForm) {
    const profile = { ...data, avatarDataUrl };
    localStorage.setItem("user_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("profile_updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function onSavePrefs(data: PrefsForm) {
    const prefs = { ...data, theme };
    localStorage.setItem("user_prefs", JSON.stringify(prefs));
    window.dispatchEvent(new Event("prefs_updated"));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  }

  return (
    <AppShell title="ตั้งค่า" subtitle="จัดการข้อมูลบัญชี การตั้งค่าแอป และการแจ้งเตือน">

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === i ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"
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
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">ข้อมูลบัญชี</h3>
              <form onSubmit={handleProfileSubmit(onSaveProfile)}>
                <div className="space-y-3">
                  <Controller
                    name="name"
                    control={profileControl}
                    rules={{ required: "กรุณากรอกชื่อ" }}
                    render={({ field }) => (
                      <TextInput label="ชื่อ" value={field.value} onChange={field.onChange} error={profileErrors.name?.message} />
                    )}
                  />
                  <Controller
                    name="email"
                    control={profileControl}
                    rules={{ required: "กรุณากรอกอีเมล", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "รูปแบบอีเมลไม่ถูกต้อง" } }}
                    render={({ field }) => (
                      <TextInput label="อีเมล" value={field.value} onChange={field.onChange} type="email" error={profileErrors.email?.message} />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextInput label="เบอร์โทรศัพท์" value={field.value} onChange={field.onChange} type="tel" />
                    )}
                  />
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">รูปโปรไฟล์</label>
                    <div className="flex items-center gap-3">
                      {avatarDataUrl ? (
                        <img src={avatarDataUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 select-none"><AvatarInitial control={profileControl} /></div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition">เปลี่ยนรูป</button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">รองรับไฟล์โปรไฟล์ทุกประเภท ขนาดไม่เกิน 2MB</p>
                  </div>
                </div>
                <button type="submit" className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                  {saved ? "✓ บันทึกแล้ว" : "บันทึกข้อมูล"}
                </button>
              </form>
            </div>

            {/* การตั้งค่าส่วนตัว */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">การตั้งค่าส่วนตัว</h3>
              <form onSubmit={handlePrefsSubmit(onSavePrefs)}>
                <div className="space-y-4">
                  <Controller
                    name="language"
                    control={prefsControl}
                    render={({ field }) => (
                      <SelectInput label="ภาษา" value={field.value} onChange={field.onChange}>
                        <option>ภาษาไทย</option>
                        <option>English</option>
                      </SelectInput>
                    )}
                  />

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">ธีม</label>
                    <div role="radiogroup" className="flex rounded-xl border border-slate-600 overflow-hidden">
                      {([
                        { val: "light", icon: <Sun className="h-4 w-4" />,  label: "สว่าง" },
                        { val: "dark",  icon: <Moon className="h-4 w-4" />, label: "มืด" },
                      ] as const).map((t) => (
                        <button key={t.val} type="button"
                          role="radio"
                          aria-checked={resolvedTheme === t.val}
                          onClick={() => setTheme(t.val)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                            resolvedTheme === t.val
                              ? "bg-emerald-600 text-white"
                              : "text-slate-400 hover:bg-slate-700/40 dark:text-slate-400 dark:hover:bg-slate-700"
                          }`}
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Controller
                    name="currency"
                    control={prefsControl}
                    render={({ field }) => (
                      <SelectInput label="สกุลเงิน" value={field.value} onChange={field.onChange}>
                        <option>บาท (฿)</option>
                        <option>USD ($)</option>
                      </SelectInput>
                    )}
                  />

                  <Controller
                    name="dateFormat"
                    control={prefsControl}
                    render={({ field }) => (
                      <SelectInput label="รูปแบบวันที่" value={field.value} onChange={field.onChange}>
                        <option>วันที่ 9 ม.ค. 2567</option>
                        <option>09/01/2567</option>
                      </SelectInput>
                    )}
                  />

                  <Controller
                    name="timezone"
                    control={prefsControl}
                    render={({ field }) => (
                      <SelectInput label="เขตเวลา" value={field.value} onChange={field.onChange}>
                        <option>(GMT+07:00) กรุงเทพฯ</option>
                        <option>(GMT+00:00) UTC</option>
                        <option>(GMT+09:00) โตเกียว</option>
                        <option>(GMT-05:00) นิวยอร์ก</option>
                      </SelectInput>
                    )}
                  />
                </div>
                <button type="submit" className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                  {prefsSaved ? "✓ บันทึกแล้ว" : "บันทึกการตั้งค่า"}
                </button>
              </form>
            </div>

            {/* การแจ้งเตือน */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">การแจ้งเตือน</h3>
              <div className="space-y-4">
                {[
                  { icon: <Bell className="h-4 w-4 text-orange-400" />,      bg: "bg-orange-900/40",  title: "แจ้งเตือนวัตถุดิบใกล้หมดอายุ", sub: "แจ้งเตือนล่วงหน้าวัตถุดิบหมดอายุ", val: notifExpiry,  set: setNotifExpiry },
                  { icon: <Clock className="h-4 w-4 text-emerald-400" />,    bg: "bg-emerald-900/40", title: "แจ้งเตือนเมนูแนะนำ",             sub: "แนะนำเมนูตามวัตถุดิบที่มี",       val: notifMenu,    set: setNotifMenu },
                  { icon: <Tag className="h-4 w-4 text-blue-400" />,         bg: "bg-blue-900/40",    title: "แจ้งเตือนโปรโมชั่น",            sub: "รับโปรโมชั่นและข่าวสาร",          val: notifPromo,   set: setNotifPromo },
                  { icon: <BarChart2 className="h-4 w-4 text-purple-400" />, bg: "bg-purple-900/40",  title: "สรุปรายจ่ายรายสัปดาห์",         sub: "ส่งสรุปค่าใช้จ่ายทุกสัปดาห์",     val: notifWeekly,  set: setNotifWeekly },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <Toggle value={item.val} onChange={() => item.set(!item.val)} />
                  </div>
                ))}
              </div>
              <button type="button" className="mt-5 w-full rounded-xl border border-emerald-700/60 py-2 text-sm text-emerald-400 hover:bg-emerald-900/30 transition">จัดการการแจ้งเตือนทั้งหมด</button>
            </div>
          </div>

          {/* ── Row 2 ── */}
          <div className="grid gap-5 xl:grid-cols-3">

            {/* การจัดการข้อมูล */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">การจัดการข้อมูล</h3>
              <div className="space-y-3">
                {[
                  { icon: <UploadCloud className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-900/40", title: "สำรองข้อมูล",  sub: "ดาวน์โหลดข้อมูลทั้งหมดของคุณ", label: "สำรองข้อมูล",  btn: "border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/30" },
                  { icon: <RefreshCw className="h-4 w-4 text-blue-400" />,      bg: "bg-blue-900/40",    title: "กู้คืนข้อมูล", sub: "กู้คืนข้อมูลจากไฟล์สำรอง",     label: "กู้คืนข้อมูล", btn: "border-blue-700/60 text-blue-400 hover:bg-blue-900/30" },
                  { icon: <Trash2 className="h-4 w-4 text-red-400" />,          bg: "bg-red-900/40",     title: "ล้างข้อมูล",   sub: "ลบข้อมูลทั้งหมดอย่างถาวร",     label: "ล้างข้อมูล",   btn: "border-red-700/60 text-red-400 hover:bg-red-900/30" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                    <button type="button" className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition flex-shrink-0 ${item.btn}`}>{item.label}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* หน่วยเริ่มต้น */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">หน่วยเริ่มต้น</h3>
              <div className="space-y-1">
                {[
                  { icon: <Scale className="h-4 w-4 text-slate-400" />,       label: "น้ำหนัก",  value: "กรัม (g)" },
                  { icon: <FlaskConical className="h-4 w-4 text-slate-400" />, label: "ปริมาตร",  value: "มิลลิลิตร (ml)" },
                  { icon: <Thermometer className="h-4 w-4 text-slate-400" />,  label: "อุณหภูมิ", value: "องศาเซลเซียส (°C)" },
                ].map((item) => (
                  <button key={item.label} type="button" className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-700/50 transition">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="text-sm text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      {item.value}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
              <button type="button" className="mt-3 w-full rounded-xl border border-emerald-700/60 py-2 text-sm text-emerald-400 hover:bg-emerald-900/30 transition">แก้ไขหน่วยทั้งหมด</button>
            </div>

            {/* เกี่ยวกับแอป */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">เกี่ยวกับแอป</h3>
              <div className="flex flex-col items-center py-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-3xl select-none">🍊</span>
                </div>
                <p className="font-bold text-slate-100">Kin-Tan</p>
                <p className="text-xs text-slate-400 mt-0.5">เวอร์ชัน 1.4.0</p>
              </div>
              <div className="space-y-1 mb-4">
                {["ข้อตกลงการใช้งาน", "นโยบายความเป็นส่วนตัว"].map((item) => (
                  <button key={item} type="button" className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-700/50 transition">
                    <span className="text-sm text-slate-300">{item}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { logout(); router.push("/"); }} className="w-full rounded-xl border border-red-700/60 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-900/30 transition">ออกจากระบบ</button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-5 w-5 text-slate-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-200">ต้องการความช่วยเหลือ?</p>
                <p className="text-xs text-slate-400">อ่านคำถามที่พบบ่อย หรือ ติดต่อทีมงานของเรา</p>
              </div>
            </div>
            <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 border border-slate-600 rounded-xl px-4 py-2 hover:bg-slate-700 transition whitespace-nowrap flex-shrink-0">
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

