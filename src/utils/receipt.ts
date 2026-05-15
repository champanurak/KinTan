import type { ReceiptItem } from "@/types/receipt";

const CATEGORY_KEYWORDS: Array<{ match: RegExp; category: string }> = [
  { match: /กาแฟ|coffee|latte|espresso/i, category: "เครื่องดื่ม" },
  { match: /ขนม|snack|chips|cookie/i, category: "ขนม" },
  { match: /ข้าว|rice|noodle|pasta/i, category: "อาหาร" },
  { match: /นม|milk|yogurt/i, category: "ของสด" },
  { match: /soap|shampoo|toothpaste|detergent/i, category: "ของใช้" }
];

export function normalizePrice(value: string): number {
  const cleaned = value.replace(/[,฿\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function categorizeProduct(name: string): string {
  const keywordMatch = CATEGORY_KEYWORDS.find(({ match }) => match.test(name));
  return keywordMatch?.category ?? "อื่น ๆ";
}

export function extractItemsFromText(text: string): ReceiptItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const priceMatch = line.match(/(\d+[.,]?\d*)\s*$/);
      const price = priceMatch ? normalizePrice(priceMatch[1]) : 0;
      const name = line.replace(/(\d+[.,]?\d*)\s*$/, "").trim() || line;
      const category = categorizeProduct(name);

      return {
        name,
        category,
        price,
        confidence: price > 0 ? 0.72 : 0.45
      } satisfies ReceiptItem;
    })
    .filter((item) => item.name.length > 1)
    .slice(0, 12);
}

export function sumReceipt(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
