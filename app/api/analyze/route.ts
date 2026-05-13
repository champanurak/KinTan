import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { extractItemsFromText, sumReceipt } from "@/lib/receipt";
import type { AnalyzeReceiptResponse } from "@/lib/types";
import { getGoogleOcrFallbackText } from "@/lib/fallback";

export const runtime = "nodejs";

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
            content: "You analyze receipt images and return compact JSON with rawText and item candidates."
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: "Extract receipt line items, prices, and likely categories. Return JSON only." },
              { type: "input_image", image_url: dataUrl, detail: "auto" }
            ]
          }
        ]
      });

      const rawText = response.output_text?.trim() || receiptText || "";
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
