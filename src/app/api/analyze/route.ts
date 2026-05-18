import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { extractItemsFromText, sumReceipt } from "@/utils/receipt";
import type { AnalyzeReceiptResponse, ReceiptItem } from "@/types/receipt";
import { getGoogleOcrFallbackText } from "@/services/ocr-fallback";

export const runtime = "nodejs";

const DEFAULT_CATEGORIES = [
  "โปรตีน (เนื้อสัตว์ ไก่ หมู ปลา ไข่ ทะเล)",
  "ผักและผลไม้",
  "นมและผลิตภัณฑ์นม (นม เนย ชีส โยเกิร์ต)",
  "แป้งและข้าวเมล็ด (ข้าว แป้ง บะหมี่ ขนมปัง)",
  "เครื่องปรุง (ซีอิ้ว น้ำปลา ซอส น้ำมัน)",
  "เครื่องดื่ม (น้ำ น้ำผลไม้ กาแฟ ชา)",
  "ของหวานและขนม",
  "ของใช้ในบ้าน (ผงซักฟอก สบู่ แชมพู)",
  "อื่นๆ",
];

function buildMockResponse(
  rawText: string,
  source: AnalyzeReceiptResponse["source"],
): AnalyzeReceiptResponse {
  const items = extractItemsFromText(rawText);
  return {
    receiptId: `rcpt_${Date.now()}`,
    source,
    items,
    total: sumReceipt(items),
    rawText,
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const receiptText = String(formData.get("receiptText") ?? "").trim();

  // รับหมวดหมู่จากคลังวัตถุดิบของผู้ใช้ (ถ้ามี) ไม่งั้นใช้ default
  let categoryNames: string[] = DEFAULT_CATEGORIES;
  const categoriesRaw = formData.get("categories");
  if (typeof categoriesRaw === "string" && categoriesRaw) {
    try {
      const parsed = JSON.parse(categoriesRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // รวม pantry categories กับ DEFAULT_CATEGORIES เพื่อให้ AI มีตัวเลือกครบ
        // (pantry อาจมีแค่ 4-5 หมวด แต่ใบเสร็จอาจมีสินค้าหลากหลายกว่านั้น)
        categoryNames = [...new Set([...parsed, ...DEFAULT_CATEGORIES])];
      }
    } catch {
      // ถ้า parse ไม่ได้ ใช้ default
    }
  }

  if (!(image instanceof File) && !receiptText) {
    return NextResponse.json(
      { error: "Please provide an image or receipt text." },
      { status: 400 },
    );
  }

  const openAI = getOpenAIClient();

  if (image instanceof File) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    // ── ลอง Google Vision OCR ก่อน (แม่นยำกว่า AI vision สำหรับ Thai text) ──
    const googleOcrText = await getGoogleOcrFallbackText(imageBase64);
    if (googleOcrText && openAI) {
      try {
        const categoryList = categoryNames.map((c) => `"${c}"`).join(", ");
        const parseResponse = await openAI.responses.create({
          model: "gpt-4.1",
          input: [
            {
              role: "system",
              content: `คุณคือผู้ช่วย parse ข้อมูลใบเสร็จจากข้อความ OCR ที่อ่านมาแล้ว
ส่งข้อมูลใน JSON ตาม schema ที่กำหนด

กฎ:
- name: คัดลอกชื่อสินค้าจาก OCR ทุกตัวอักษร ห้ามเปลี่ยน
- quantity: จำนวนสินค้าในแถว (ตัวเลขก่อนหน่วย)
- unit: หน่วยนับ เช่น แพ็ค ลัง ถุง ขวด กล่อง ห่อ กระป๋อง ฟอง
- unit_price: ราคาต่อหน่วย (ตัวเลขในคอลัมน์ UNIT PRICE/ราคาต่อหน่วย)
- row_total: ราคารวมของแถว (ตัวเลขคอลัมน์สุดท้าย TOTAL/จำนวนเงินรวม = unit_price × quantity)
- category: เลือกจาก [${categoryList}] เท่านั้น
- ห้ามเพิ่มหรือลดรายการจาก OCR text`,
            },
            {
              role: "user",
              content: `นี่คือข้อความ OCR ที่อ่านได้จากใบเสร็จ:\n\n${googleOcrText}\n\nแปลงรายการสินค้าทั้งหมดเป็น JSON`,
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "receipt",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  grand_total: { type: "number" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        row: { type: "integer" },
                        article_no: { type: "string" },
                        name: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" },
                        unit_price: { type: "number" },
                        row_total: { type: "number" },
                        category: { type: "string" },
                      },
                      required: [
                        "row",
                        "article_no",
                        "name",
                        "quantity",
                        "unit",
                        "unit_price",
                        "row_total",
                        "category",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["grand_total", "items"],
                additionalProperties: false,
              },
            },
          },
          temperature: 0,
          max_output_tokens: 8192,
        });
        const rawText = parseResponse.output_text?.trim() ?? "";
        let parsed: {
          grand_total: number;
          items: Array<{
            row: number;
            article_no: string;
            name: string;
            quantity: number;
            unit: string;
            unit_price: number;
            row_total: number;
            category: string;
          }>;
        } | null = null;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          /* fall through */
        }
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          const items: ReceiptItem[] = parsed.items.map((it) => {
            const qty = Number(it.quantity) || 1;
            const rowTotal = Number(it.row_total) || 0;
            // คำนวณ unit_price จาก row_total ÷ quantity เพื่อความแม่นยำ 100%
            // ป้องกันกรณี AI สับสนระหว่างคอลัมน์ unit_price กับ row_total
            const unitPrice =
              qty > 0
                ? Math.round((rowTotal / qty) * 100) / 100
                : Number(it.unit_price) || 0;
            return {
              name: it.name,
              category: it.category || "อื่นๆ",
              price: unitPrice,
              confidence: 0.95,
              unit: it.unit || "ชิ้น",
              quantity: qty,
            };
          });
          return NextResponse.json({
            receiptId: `rcpt_${Date.now()}`,
            source: "openai",
            items,
            total:
              parsed.grand_total && parsed.grand_total > 0
                ? parsed.grand_total
                : items.reduce((s, it) => s + it.price * (it.quantity ?? 1), 0),
            rawText: googleOcrText,
          } satisfies AnalyzeReceiptResponse);
        }
      } catch {
        // fall through to AI vision
      }
    }

    if (!openAI) {
      return NextResponse.json(
        buildMockResponse(googleOcrText || "No OCR result", "ocr-fallback"),
      );
    }

    const categoryList = categoryNames.map((c) => `"${c}"`).join(", ");

    const systemContent = `คุณคือระบบ OCR สำหรับใบเสร็จร้านค้าไทย

ตารางในใบเสร็จมีคอลัมน์เรียงจากซ้ายไปขวาดังนี้ (ต้องจำให้แม่นก่อนอ่าน):
คอลัมน์ 1: ลำดับ / ITEM          → เลขแถว (1, 2, 3, ...)
คอลัมน์ 2: รหัสสินค้า / ARTICLE NO. → ตัวเลข 6 หลัก
คอลัมน์ 3: รายละเอียด / DESCRIPTION  → ชื่อสินค้าภาษาไทย (คอลัมน์กว้างที่สุด)
คอลัมน์ 4: จำนวน / QUANTITY       → ตัวเลขจำนวน
คอลัมน์ 5: หน่วยบรรจุ / UNIT       → หน่วย เช่น แพ็ค ลัง ถุง ขวด กล่อง ห่อ กระป๋อง ฟอง
คอลัมน์ 6: ราคาต่อหน่วย / UNIT PRICE → ราคาต่อหน่วยเดียว
คอลัมน์ 7: รหัส ภ.พ. / VAT CODE   → ตัวเลข (ละเว้นทั้งหมด)
คอลัมน์ 8: จำนวนเงินรวม / TOTAL    → คอลัมน์สุดท้ายด้านขวา = คอลัมน์ 6 × คอลัมน์ 4

คำแนะนำในการอ่าน:
- name: คัดลอกคอลัมน์ 3 ทุกตัวอักษร ห้ามแก้ไข
- article_no: คอลัมน์ 2 ตัวเลข 6 หลัก ใช้ยืนยันแต่ละแถว
- quantity: คอลัมน์ 4
- unit: คอลัมน์ 5
- unit_price: คอลัมน์ 6 (ไม่ใช่คอลัมน์ 8)
- row_total: คอลัมน์ 8 (= unit_price × quantity)
- grand_total: ยอดรวมทั้งสิ้น จากส่วน "รวมทั้งสิ้น / Total Amount" ที่ด้านล่างใบเสร็จ
- category: เลือกจาก [${categoryList}] เท่านั้น

การแยกแยะ:
- "ถ่านไม้" (charcoal หน่วย กก./ถุง) ≠ "ถ่านไฟฉาย" (battery)
- "สบู่" (soap) ≠ "สุขภัณฑ์"
- "ไม้แขวนเสื้อ" (clothes hanger) ≠ "ไม้จิ้มฟัน"
- "พลาสติกแรป" = cling wrap ≠ ถุงพลาสติก
- "ฟอยล์ห่ออาหาร" = aluminum foil ม้วน`;

    try {
      const response = await openAI.responses.create({
        model: "gpt-4.1",
        input: [
          { role: "system", content: systemContent },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `อ่านทุกแถวในตารางรายการสินค้าของใบเสร็จนี้ให้ครบถ้วนทุกแถว
ห้ามข้ามแถวใด ห้ามเพิ่มแถวที่ไม่มี
ข้อมูลทุกช่องต้องอ่านจากใบเสร็จเท่านั้น ห้ามเดาหรือสร้างขึ้นมาเอง`,
              },
              { type: "input_image", image_url: dataUrl, detail: "high" },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "receipt",
            strict: true,
            schema: {
              type: "object",
              properties: {
                grand_total: { type: "number" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      row: { type: "integer" },
                      article_no: { type: "string" },
                      name: { type: "string" },
                      quantity: { type: "number" },
                      unit: { type: "string" },
                      unit_price: { type: "number" },
                      row_total: { type: "number" },
                      category: { type: "string" },
                    },
                    required: [
                      "row",
                      "article_no",
                      "name",
                      "quantity",
                      "unit",
                      "unit_price",
                      "row_total",
                      "category",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["grand_total", "items"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0,
        max_output_tokens: 8192,
      });

      const rawText = response.output_text?.trim() ?? "";

      let parsed: {
        grand_total: number;
        items: Array<{
          row: number;
          article_no: string;
          name: string;
          quantity: number;
          unit: string;
          unit_price: number;
          row_total: number;
          category: string;
        }>;
      } | null = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        /* fall through */
      }

      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        const items: ReceiptItem[] = parsed.items.map((it) => {
          const qty = Number(it.quantity) || 1;
          const rowTotal = Number(it.row_total) || 0;
          const unitPrice =
            qty > 0
              ? Math.round((rowTotal / qty) * 100) / 100
              : Number(it.unit_price) || 0;
          return {
            name: it.name,
            category: it.category || "อื่นๆ",
            price: unitPrice,
            confidence: 0.9,
            unit: it.unit || "ชิ้น",
            quantity: qty,
          };
        });
        return NextResponse.json({
          receiptId: `rcpt_${Date.now()}`,
          source: "openai",
          items,
          total:
            parsed.grand_total && parsed.grand_total > 0
              ? parsed.grand_total
              : items.reduce((s, it) => s + it.price * (it.quantity ?? 1), 0),
          rawText,
        } satisfies AnalyzeReceiptResponse);
      }

      return NextResponse.json(
        buildMockResponse(rawText || "OpenAI analysis completed.", "openai"),
      );
    } catch {
      // Fall through to OCR fallback.
    }
  }

  if (image instanceof File) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = buffer.toString("base64");
    const ocrText =
      (await getGoogleOcrFallbackText(imageBase64)) ?? receiptText;
    return NextResponse.json(
      buildMockResponse(
        ocrText || "Fallback OCR not configured.",
        "ocr-fallback",
      ),
    );
  }

  return NextResponse.json(
    buildMockResponse(receiptText || "Manual text analysis", "ocr-fallback"),
  );
}
