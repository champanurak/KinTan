"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

const features = [
  {
    title: "จัดการวัตถุดิบในครัว",
    description: "ติดตามของสดและของแห้งก่อนหมดอายุ"
  },
  {
    title: "ลดขยะอาหาร",
    description: "ช่วยลดการสูญเสียอาหารและรักษ์โลก"
  },
  {
    title: "ประหยัดค่าใช้จ่าย",
    description: "วางแผนเมนูและใช้วัตถุดิบอย่างคุ้มค่า"
  }
];

function MailIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V8a3.5 3.5 0 1 1 7 0v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 10h14l-1.2 7.6a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 10Z" />
      <path d="m8 10 4-6 4 6" />
      <path d="M9.5 13.5h5" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Redirect to home if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/home");
    }
  }, [isLoggedIn, router]);

  const mockUser = {
    email: "test@test.com",
    password: "1234"
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (identity.trim().toLowerCase() === mockUser.email && password === mockUser.password) {
      setMessage("เข้าสู่ระบบสำเร็จ (Mock)");
      login(mockUser.email);
      router.push("/home");
      return;
    }

    setMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#0a1628_0%,#07111f_50%,#060e1a_100%)] px-4 py-8 text-slate-100 md:px-8 md:py-14">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-slate-700/80 bg-slate-800/95 shadow-[0_18px_60px_-25px_rgba(0,0,0,0.6)] backdrop-blur md:grid-cols-2">
          <aside className="relative border-b border-emerald-900/60 bg-gradient-to-b from-emerald-900/40 to-emerald-900/20 p-8 md:border-b-0 md:border-r md:p-10">
            <div className="mx-auto max-w-sm">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-700 shadow-sm ring-1 ring-emerald-700">
                  <span className="text-3xl" aria-hidden="true">
                    🍊
                  </span>
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-display)] text-[2rem] leading-none text-slate-100">Kin-Tan (กินทัน)</h1>
                  <p className="mt-1 text-sm text-slate-400">จัดการของกิน ไม่ทิ้ง ไม่เสีย</p>
                </div>
              </div>

              <p className="mt-8 max-w-xs text-3xl font-semibold leading-tight text-emerald-300">
                ลดของสูญเปล่า
                <br />
                เปลี่ยนขยะให้เป็นคุณค่า
                <span className="ml-2">🌿</span>
              </p>

              <div className="mt-8 space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 rounded-2xl bg-slate-700/50 p-3 ring-1 ring-emerald-800/60">
                    <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-emerald-900/60">
                      <BasketIcon />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{feature.title}</p>
                      <p className="mt-0.5 text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none mt-5 md:mt-8">
              <Image src="/illustrations/login-grocery.svg" alt="Grocery illustration" width={640} height={300} className="h-auto w-full" priority />
            </div>
          </aside>

          <section className="p-8 md:p-10">
            <div className="mx-auto max-w-sm">
              <h2 className="font-[family-name:var(--font-display)] text-5xl leading-none text-slate-100">เข้าสู่ระบบ</h2>
              <p className="mt-2 text-base text-slate-400">ยินดีต้อนรับกลับมา 🌱</p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">อีเมลหรือเบอร์โทรศัพท์</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-700 px-3 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-900/50">
                    <MailIcon />
                    <input
                      type="text"
                      value={identity}
                      onChange={(event) => setIdentity(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="กรอกอีเมลหรือเบอร์โทรศัพท์"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">รหัสผ่าน</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-700 px-3 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-900/50">
                    <LockIcon />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="กรอกรหัสผ่าน"
                    />
                    <button
                      type="button"
                      aria-label="แสดงหรือซ่อนรหัสผ่าน"
                      onClick={() => setShowPassword((value) => !value)}
                      className="transition hover:opacity-70"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="inline-flex items-center gap-2 text-slate-400">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                    <span>จดจำฉัน</span>
                  </label>
                  <button type="button" className="font-medium text-emerald-400 transition hover:text-emerald-300">
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-base font-semibold text-white shadow-[0_8px_20px_-10px_rgba(22,163,74,0.9)] transition hover:brightness-105"
                >
                  เข้าสู่ระบบ
                </button>

                <div className="rounded-xl border border-emerald-800/60 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-300">
                  Mock username: <span className="font-semibold">test@test.com</span>, password: <span className="font-semibold">1234</span>
                </div>

                {message ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-700/50 px-4 py-3 text-sm text-slate-300">{message}</div>
                ) : null}

                <div className="relative py-1 text-center text-sm text-slate-500">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-700" />
                  <span className="relative bg-slate-800 px-3">หรือ</span>
                </div>

                <button
                  type="button"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-700 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-600"
                >
                  <span className="text-xl" aria-hidden="true">
                    G
                  </span>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                <p className="pt-1 text-center text-sm text-slate-400">
                  ยังไม่มีบัญชีใช่ไหม? <button type="button" className="font-semibold text-emerald-400 hover:text-emerald-300">สมัครสมาชิก</button>
                </p>
              </form>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
