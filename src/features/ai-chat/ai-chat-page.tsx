"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import AppShell from "@/components/layout/app-shell";
import { Send, Sparkles, User, RefreshCw, ChevronRight } from "lucide-react";
import { usePantryStore } from "@/store/pantry-store";
import { useUserStore } from "@/store/user-store";

/* ── Types ── */
type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
  ts: number;
}

interface PantryItem {
  id: number;
  name: string;
  unit: string;
  price?: number;
  quantity: number;
  category: string;
  expiresAt?: string;
}

interface PantryContext {
  items?: PantryItem[];
  userName?: string;
}

/* ── Suggestions ── */
const SUGGESTIONS = [
  "มีอะไรใกล้หมดอายุบ้าง?",
  "แนะนำเมนูจากวัตถุดิบที่มี",
  "ช่วยวางแผนอาหารสัปดาห์นี้",
  "วิธีลดของเสียในครัว",
  "เช็คแคลอรี่อาหารที่กินวันนี้",
  "วิธีถนอมอาหารให้อยู่ได้นาน",
];

/* ── Helpers ── */
function uid() {
  return Math.random().toString(36).slice(2);
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/* ── Message bubble ── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
        isUser
          ? "bg-emerald-600 text-white"
          : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
      }`}>
        {isUser
          ? <User className="h-4 w-4" />
          : <Sparkles className="h-4 w-4" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[72%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-emerald-600 text-white"
            : "rounded-bl-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.ts)}</span>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pantryItems = usePantryStore((s) => s.items);
  const userName = useUserStore((s) => s.profile.name);

  /* Scroll to bottom whenever messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: uid(), role: "user", content: text.trim(), ts: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          context: { items: pantryItems, userName: userName || undefined },
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply ?? "ขออภัย เกิดข้อผิดพลาดค่ะ",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: "เกิดข้อผิดพลาด กรุณาลองใหม่ค่ะ", ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <AppShell title="ผู้ช่วย AI" subtitle="กินตัน AI — ผู้ช่วยด้านครัวและโภชนาการของคุณ">
      {/* Chat container — centered, fills remaining height */}
      <div style={{ width: "100%", maxWidth: "36rem", margin: "0 auto" }} className="flex flex-col h-[calc(100vh-160px)] min-h-[480px]">

        {/* ── Message area ── */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">

          {messages.length === 0 ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                <Sparkles className="h-9 w-9 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">สวัสดีค่ะ! ฉันคือกินตัน AI</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ผู้ช่วยด้านครัวและโภชนาการ พร้อมช่วยคุณทุกเรื่อง</p>
              </div>

              {/* Suggestion chips */}
              <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-left text-xs text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <span>{s}</span>
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages list */
            <>
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}
              {loading && (
                <div className="flex items-end gap-2.5">
                  <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className="mt-3 flex flex-col gap-2" style={{ paddingLeft: "2rem", paddingRight: "2rem" }}>
          {/* Clear button (only when there are messages) */}
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                เริ่มการสนทนาใหม่
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 transition-colors shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none leading-relaxed"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400">
            กินตัน AI อาจให้ข้อมูลที่ไม่ถูกต้อง ควรตรวจสอบข้อมูลสำคัญเสมอ
          </p>
        </div>
      </div>
    </AppShell>
  );
}
