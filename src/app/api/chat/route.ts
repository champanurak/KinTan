import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

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

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function buildSystemPrompt(ctx?: PantryContext): string {
  const base = `คุณคือ "กินตัน AI" ผู้ช่วยอัจฉริยะของแอป Kin-Tan เชี่ยวชาญด้านการจัดการวัตถุดิบในครัว โภชนาการ และการวางแผนอาหาร
คุณตอบเป็นภาษาไทยเสมอ สั้น กระชับ เป็นมิตร และเป็นประโยชน์
ความเชี่ยวชาญ: จัดการวัตถุดิบ ลดของเสีย แนะนำเมนู โภชนาการ วางแผนอาหาร ถนอมอาหาร
ตอบสั้น ๆ 2-4 ประโยค ยกเว้นถูกขอให้อธิบายละเอียด`;

  if (!ctx?.items?.length) return base;

  const userName = ctx.userName ? `\nชื่อผู้ใช้: ${ctx.userName}` : "";

  const expiring = ctx.items
    .filter(i => {
      const d = daysUntil(i.expiresAt);
      return d !== null && d <= 7;
    })
    .sort((a, b) => {
      const da = daysUntil(a.expiresAt) ?? 999;
      const db = daysUntil(b.expiresAt) ?? 999;
      return da - db;
    });

  const itemLines = ctx.items.map(i => {
    const d = daysUntil(i.expiresAt);
    const expInfo = d === null ? "(ไม่ระบุวันหมดอายุ)"
      : d < 0 ? `(หมดอายุแล้ว ${Math.abs(d)} วัน)`
      : d === 0 ? "(หมดอายุวันนี้!)"
      : `(หมดอายุใน ${d} วัน)`;
    return `- ${i.name} ${i.quantity} ${i.unit} [${i.category}] ${expInfo}`;
  }).join("\n");

  const expiringNote = expiring.length > 0
    ? `\n\n⚠️ วัตถุดิบใกล้หมดอายุ (ควรใช้ก่อน):\n${expiring.map(i => {
        const d = daysUntil(i.expiresAt)!;
        return `- ${i.name} ${i.quantity} ${i.unit} (อีก ${d} วัน)`;
      }).join("\n")}`
    : "";

  return `${base}${userName}\n\n📦 วัตถุดิบในคลังปัจจุบัน (${ctx.items.length} รายการ):\n${itemLines}${expiringNote}\n\nใช้ข้อมูลนี้ตอบคำถามผู้ใช้ให้ตรงกับของจริงที่มีอยู่`;
}

const FALLBACK_REPLIES: Record<string, string> = {
  default: "ขออภัยค่ะ ขณะนี้ระบบ AI ยังไม่ได้เชื่อมต่อ กรุณาตั้งค่า OPENAI_API_KEY เพื่อใช้งานผู้ช่วย AI ค่ะ",
};

function getFallbackReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes("หมดอายุ") || msg.includes("expir")) {
    return "ขณะนี้ระบบ AI ยังไม่ได้เชื่อมต่อ แต่คุณสามารถดูรายการที่ใกล้หมดอายุได้ที่หน้า 'แจ้งเตือน' ค่ะ";
  }
  if (msg.includes("เมนู") || msg.includes("ทำอะไร") || msg.includes("recipe")) {
    return "ขณะนี้ระบบ AI ยังไม่ได้เชื่อมต่อ แต่คุณสามารถดูเมนูแนะนำได้ที่หน้า 'แนะนำเมนู' ค่ะ";
  }
  if (msg.includes("แคลอรี") || msg.includes("โภชนาการ") || msg.includes("nutrition")) {
    return "ขณะนี้ระบบ AI ยังไม่ได้เชื่อมต่อ แต่คุณสามารถติดตามโภชนาการได้ที่หน้า 'โภชนาการ' ค่ะ";
  }
  return FALLBACK_REPLIES.default;
}

export async function POST(request: Request) {
  let messages: Array<{ role: "user" | "assistant"; content: string }>;
  let context: PantryContext | undefined;

  try {
    const body = await request.json();
    messages = body.messages ?? [];
    context = body.context;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const openai = getOpenAIClient();

  if (!openai) {
    const lastMsg = messages[messages.length - 1]?.content ?? "";
    return NextResponse.json({ reply: getFallbackReply(lastMsg) });
  }

  const systemPrompt = buildSystemPrompt(context);

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = response.output_text?.trim() ?? "ขออภัย ไม่สามารถตอบได้ในขณะนี้ค่ะ";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] OpenAI error:", err);
    return NextResponse.json({ reply: "เกิดข้อผิดพลาดจากระบบ AI กรุณาลองใหม่อีกครั้งค่ะ" });
  }
}
