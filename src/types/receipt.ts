export type ReceiptItem = {
  name: string;
  category: string;
  price: number;
  confidence: number;
  quantity?: number;
  unit?: string;
  suggestedStores?: string[];
};

export type AnalyzeReceiptResponse = {
  receiptId: string;
  source: "openai" | "ocr-fallback";
  items: ReceiptItem[];
  total: number;
  rawText: string;
};
