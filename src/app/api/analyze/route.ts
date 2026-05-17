import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { extractItemsFromText, sumReceipt } from "@/utils/receipt";
import type { AnalyzeReceiptResponse, ReceiptItem } from "@/types/receipt";
import { getGoogleOcrFallbackText } from "@/services/ocr-fallback";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `คุณคือผู้ช่วยวิเคราะห์ใบเสร็จร้านค้าภาษาไทย
สแกนรายการสินค้าทั้งหมดในใบเสร็จ แล้วตอบกลับด้วย JSON array เท่านั้น ไม่มีข้อความอื่น

รูปแบบ JSON ที่ต้องการ:
[
  {"name": "ชื่อสินค้า", "price": 0.00, "quantity": 1, "unit": "ชิ้น", "category": "หมวดหมู่"}
]

หมวดหมู่ที่ใช้ได้ (เลือกที่เหมาะสมที่สุด):
- โปรตีน (เนื้อสัตว์ ไก่ หมู ปลา ไข่ ทะเล)
- ผักและผลไม้
- นมและผลิตภัณฑ์นม (นม เนย ชีส โยเกิร์ต)
- แป้งและข้าวเมล็ด (ข้าว แป้ง บะหมี่ ขนมปัง)
- เครื่องปรุง (ซีอิ้ว น้ำปลา ซอส น้ำมัน)
- เครื่องดื่ม (น้ำ น้ำผลไม้ กาแฟ ชา)
- ของหวานและขนม
- ของใช้ในบ้าน (ผงซักฟอก สบู่ แชมพู)
- อื่นๆ

กฎ:
- ถ้าราคาไม่ชัดเจนให้ใส่ 0
- quantity default คือ 1
- unit เลือกจาก: ชิ้น, แพ็ก, ขวด, กล่อง, ถุง, กก., ลิตร, มล., อัน
- name ให้ใช้ชื่อที่กระชับและเข้าใจง่าย`;

interface AiItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

function parseAiResponse(text: string): AiItem[] {
  try {
    // Extract JSON array from the response (handle markdown code blocks)
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((it: AiItem) => it.name && typeof it.name === "string");
  } catch {
    return [];
  }
}

function buildMockResponse(rawText: string, source: AnalyzeReceiptResponse["source"]): AnalyzeReceiptResponse {
  const items = extractItemsFromText(rawText);
  return {
    receiptId: `rcpt_${Date.now()}`,
    source,
    items,
    total: sumReceipt(items),
    rawText
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const receiptText = String(formData.get("receiptText") ?? "").trim();

  if (!(image instanceof File) && !receiptText) {
    return NextResponse.json({ error: "Please provide an image or receipt text." }, { status: 400 });
  }

  const openAI = getOpenAIClient();

  if (openAI && image instanceof File) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    try {
      const response = await openAI.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: "วิเคราะห์ใบเสร็จนี้และแสดงรายการสินค้าทั้งหมดในรูปแบบ JSON" },
              { type: "input_image", image_url: dataUrl, detail: "auto" }
            ]
          }
        ]
      });

      const rawText = response.output_text?.trim() ?? "";
      const aiItems = parseAiResponse(rawText);

      if (aiItems.length > 0) {
        const items: ReceiptItem[] = aiItems.map((it) => ({
          name: it.name,
          category: it.category || "อื่นๆ",
          price: Number(it.price) || 0,
          confidence: 0.9,
          unit: it.unit || "ชิ้น",
          quantity: Number(it.quantity) || 1,
        }));
        return NextResponse.json({
          receiptId: `rcpt_${Date.now()}`,
          source: "openai",
          items,
          total: items.reduce((s, it) => s + it.price * (it.quantity ?? 1), 0),
          rawText,
        } satisfies AnalyzeReceiptResponse);
      }

      // AI returned text but couldn't parse as JSON — fallback to text extraction
      return NextResponse.json(buildMockResponse(rawText || "OpenAI analysis completed.", "openai"));
    } catch {
      // Fall through to OCR fallback.
    }
  }

  if (image instanceof File) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const ocrText = (await getGoogleOcrFallbackText(imageBase64)) ?? receiptText;
    return NextResponse.json(buildMockResponse(ocrText || "Fallback OCR not configured.", "ocr-fallback"));
  }

  return NextResponse.json(buildMockResponse(receiptText || "Manual text analysis", "ocr-fallback"));
}

