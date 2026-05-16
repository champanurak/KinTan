"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  X,
  ShoppingCart,
  Lightbulb,
  CircleCheckBig,
  Minus,
  Plus,
} from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { recordCook } from "@/lib/cook-stats";

interface IngredientItem {
  name: string;
  required: number;
  unit: string;
  emoji: string;
  matchKey: string;
}

interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep: string;
  emoji: string;
  imageClass: string;
  recipeImage?: string;
  matchKeywords: string[];
  ingredients: IngredientItem[];
  steps: string[];
  tip?: string;
}

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface IngredientStatus {
  availableText: string;
  enough: boolean;
}

function getIngredientStatus(
  ingredient: IngredientItem,
  pantryItems: PantryItem[],
  servings: number,
  baseServings = 2,
): IngredientStatus {
  const required = (ingredient.required * servings) / baseServings;
  const pantryItem = pantryItems.find(
    (p) =>
      p.name.toLowerCase().includes(ingredient.matchKey.toLowerCase()) ||
      ingredient.matchKey.toLowerCase().includes(p.name.toLowerCase()),
  );
  if (!pantryItem) {
    return {
      availableText: `ขาด ${required} ${ingredient.unit}`,
      enough: false,
    };
  }
  if (pantryItem.quantity >= required) {
    return {
      availableText: `มี ${pantryItem.quantity} ${pantryItem.unit}`,
      enough: true,
    };
  }
  const short = required - pantryItem.quantity;
  return { availableText: `ขาด ${short} ${ingredient.unit}`, enough: false };
}

type RecommendedMenu = MenuItem & {
  matchedCount: number;
  matchPercent: number;
  matchedKeywords: string[];
};

const LIKED_MENUS_KEY = "liked_menu_recommendations";

const menus: MenuItem[] = [
  {
    id: "m1",
    name: "ผัดกะเพราไก่",
    calories: 520,
    protein: 35,
    carbs: 42,
    fat: 20,
    prep: "15 นาที",
    emoji: "🌿",
    imageClass: "from-emerald-100 to-lime-100",
    recipeImage: "/recipes/pad-krapao.svg",
    matchKeywords: ["ไก่", "กะเพรา", "กระเทียม", "พริก", "น้ำปลา"],
    ingredients: [
      {
        name: "อกไก่สับ",
        required: 250,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "ไก่",
      },
      {
        name: "ใบกะเพรา",
        required: 1,
        unit: "ถ้วย",
        emoji: "🌿",
        matchKey: "กะเพรา",
      },
      {
        name: "กระเทียมสับ",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "พริกสด",
        required: 5,
        unit: "เม็ด",
        emoji: "🌶️",
        matchKey: "พริก",
      },
      {
        name: "น้ำมันพืช",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
      {
        name: "น้ำมันหอย",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมันหอย",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
      {
        name: "น้ำตาล",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
    ],
    steps: [
      "โขลกพริกกับกระเทียมพอหยาบ",
      "ตั้งกระทะใส่น้ำมันพืช ผัดพริกกระเทียมด้วยไฟแรงจนหอม",
      "ใส่ไก่สับผัดจนสุก ปรุงรสด้วยน้ำมันหอย น้ำปลา ซีอิ๊ว และน้ำตาล",
      "ใส่ใบกะเพรา ผัดเร็วๆ แล้วปิดไฟ เสิร์ฟพร้อมข้าวและไข่ดาว",
    ],
    tip: "ใช้ไฟแรงและกะเพราสดเพื่อให้ได้กลิ่นหอมที่ดีที่สุด",
  },
  {
    id: "m2",
    name: "สุกี้หมูน้ำ",
    calories: 380,
    protein: 28,
    carbs: 26,
    fat: 12,
    prep: "20 นาที",
    emoji: "🍲",
    imageClass: "from-blue-100 to-cyan-100",
    recipeImage: "/recipes/suki-clear.svg",
    matchKeywords: ["ผักกาด", "หมู", "วุ้นเส้น", "ไข่", "น้ำจิ้มสุกี้"],
    ingredients: [
      {
        name: "น้ำซุปหมู",
        required: 600,
        unit: "มล.",
        emoji: "💧",
        matchKey: "น้ำ",
      },
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "หมูสไลซ์",
        required: 200,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "หมู",
      },
      {
        name: "วุ้นเส้น (แช่น้ำแล้ว)",
        required: 1,
        unit: "กำ",
        emoji: "🍜",
        matchKey: "วุ้นเส้น",
      },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "น้ำจิ้มสุกี้",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำจิ้มสุกี้",
      },
    ],
    steps: [
      "แช่วุ้นเส้นในน้ำเย็น 15 นาทีให้นุ่ม",
      "ต้มน้ำซุป 600 มล. ให้เดือด ใส่หมูสไลซ์จนสุก",
      "เติมผักกาดและวุ้นเส้น ต้มต่อ 2 นาที",
      "ตอกไข่ รอไข่สุก ราดน้ำจิ้มสุกี้แล้วเสิร์ฟ",
    ],
    tip: "เพิ่มเต้าหู้หรือเห็ดเพื่อเพิ่มคุณค่าทางโภชนาการ",
  },
  {
    id: "m3",
    name: "ข้าวผัดผักรวม",
    calories: 450,
    protein: 14,
    carbs: 65,
    fat: 15,
    prep: "18 นาที",
    emoji: "🍳",
    imageClass: "from-amber-100 to-orange-100",
    matchKeywords: ["ข้าว", "แครอท", "ข้าวโพด", "ไข่", "ซีอิ๊ว"],
    ingredients: [
      {
        name: "ข้าวสวย (ค้างคืน)",
        required: 1.5,
        unit: "ถ้วย",
        emoji: "🍚",
        matchKey: "ข้าว",
      },
      {
        name: "แครอทหั่นเต๋า",
        required: 0.5,
        unit: "ถ้วย",
        emoji: "🥕",
        matchKey: "แครอท",
      },
      {
        name: "ข้าวโพด",
        required: 0.5,
        unit: "ถ้วย",
        emoji: "🌽",
        matchKey: "ข้าวโพด",
      },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "น้ำมันพืช",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
      {
        name: "พริกไทยป่น",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "⚫",
        matchKey: "พริกไทย",
      },
    ],
    steps: [
      "ตั้งกระทะใส่น้ำมันพืช ตอกไข่ลงผัดให้สุกแบบคลุกเคล้า",
      "ใส่แครอทและข้าวโพด ผัดด้วยไฟแรงให้สุกกรอบ",
      "ใส่ข้าวสวย คลุกให้ข้าวแตกเม็ด ผัดจนร้อนทั่ว",
      "ปรุงรสด้วยซีอิ๊วขาวและพริกไทย คลุกให้เข้ากัน เสิร์ฟ",
    ],
    tip: "ใช้ข้าวเย็นค้างคืนจะทำให้ข้าวผัดไม่เละ",
  },
  {
    id: "m4",
    name: "ต้มจืดเต้าหู้หมูสับ",
    calories: 290,
    protein: 24,
    carbs: 10,
    fat: 16,
    prep: "25 นาที",
    emoji: "🥣",
    imageClass: "from-slate-100 to-blue-50",
    recipeImage: "/recipes/tom-jued.svg",
    matchKeywords: ["เต้าหู้", "หมู", "ผักกาด", "ต้นหอม", "ซีอิ๊ว"],
    ingredients: [
      { name: "น้ำ", required: 600, unit: "มล.", emoji: "💧", matchKey: "น้ำ" },
      {
        name: "เต้าหู้ไข่",
        required: 2,
        unit: "หลอด",
        emoji: "🟡",
        matchKey: "เต้าหู้",
      },
      {
        name: "หมูสับ",
        required: 200,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "หมู",
      },
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "ต้นหอม",
        required: 1,
        unit: "ต้น",
        emoji: "🌱",
        matchKey: "ต้นหอม",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
    ],
    steps: [
      "ต้มน้ำ 600 มล. ให้เดือด ปั้นหมูสับเป็นก้อนเล็กๆ ใส่ลงหม้อ",
      "พอหมูสุก ใส่ผักกาดขาวและเต้าหู้",
      "ปรุงรสด้วยซีอิ๊วขาว ชิมให้ได้รสที่ต้องการ",
      "โรยต้นหอม ปิดไฟ เสิร์ฟร้อนๆ",
    ],
    tip: "ปั้นหมูสับเป็นก้อนเล็กๆ จะทำให้สุกเร็วและน่ารับประทาน",
  },
  {
    id: "m5",
    name: "ข้าวมันไก่",
    calories: 520,
    protein: 35,
    carbs: 60,
    fat: 12,
    prep: "45 นาที",
    emoji: "🍚",
    imageClass: "from-yellow-100 to-orange-100",
    matchKeywords: ["ไก่", "ข้าว", "ขิง", "กระเทียม"],
    ingredients: [
      {
        name: "อกไก่",
        required: 300,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      { name: "น้ำ", required: 1, unit: "ลิตร", emoji: "💧", matchKey: "น้ำ" },
      {
        name: "ข้าวหอมมะลิ",
        required: 2,
        unit: "ถ้วย",
        emoji: "🍚",
        matchKey: "ข้าว",
      },
      {
        name: "ขิงแก่",
        required: 5,
        unit: "แว่น",
        emoji: "🌱",
        matchKey: "ขิง",
      },
      {
        name: "กระเทียม",
        required: 4,
        unit: "กลีบ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "เกลือ",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "เกลือ",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
      {
        name: "น้ำจิ้มเต้าเจี้ยว",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำจิ้ม",
      },
    ],
    steps: [
      "ต้มน้ำ 1 ลิตร กับขิงและกระเทียม ใส่ไก่ต้มประมาณ 25 นาที ใส่เกลือ",
      "นำน้ำต้มไก่ 2 ถ้วยมาหุงข้าวแทนน้ำเปล่า",
      "หั่นไก่เป็นชิ้นพอดีคำ หรือฉีกเป็นเส้น",
      "จัดข้าวใส่จาน วางไก่ ราดซีอิ๊ว เสิร์ฟพร้อมน้ำจิ้มเต้าเจี้ยว",
    ],
    tip: "ใช้น้ำต้มไก่หุงข้าวแทนน้ำเปล่า ข้าวจะหอมและมีรสชาติมากขึ้น",
  },
  {
    id: "m6",
    name: "ต้มข่าไก่",
    calories: 310,
    protein: 28,
    carbs: 8,
    fat: 18,
    prep: "30 นาที",
    emoji: "🥥",
    imageClass: "from-amber-100 to-yellow-100",
    matchKeywords: ["ไก่", "กะทิ", "ข่า", "ตะไคร้"],
    ingredients: [
      {
        name: "ไก่หั่นชิ้น",
        required: 250,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      {
        name: "กะทิ",
        required: 400,
        unit: "มล.",
        emoji: "🥥",
        matchKey: "กะทิ",
      },
      {
        name: "ข่าอ่อน",
        required: 6,
        unit: "แว่น",
        emoji: "🌱",
        matchKey: "ข่า",
      },
      {
        name: "ตะไคร้",
        required: 1,
        unit: "ต้น",
        emoji: "🌿",
        matchKey: "ตะไคร้",
      },
      {
        name: "ใบมะกรูด",
        required: 4,
        unit: "ใบ",
        emoji: "🍃",
        matchKey: "ใบมะกรูด",
      },
      {
        name: "เห็ด",
        required: 100,
        unit: "กรัม",
        emoji: "🍄",
        matchKey: "เห็ด",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
      {
        name: "มะนาว",
        required: 1,
        unit: "ลูก",
        emoji: "🍋",
        matchKey: "มะนาว",
      },
      {
        name: "น้ำตาลปี๊บ",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
    ],
    steps: [
      "เคี่ยวกะทิกับข่า ตะไคร้ และใบมะกรูดให้หอม",
      "ใส่ไก่ลงต้มจนสุก",
      "เติมเห็ด ปรุงรสด้วยน้ำปลา น้ำมะนาว และน้ำตาลปี๊บเล็กน้อย",
      "ปิดไฟ โรยพริกสดตามชอบ เสิร์ฟร้อนๆ",
    ],
    tip: "เติมน้ำมะนาวหลังปิดไฟเท่านั้น เพื่อรักษากลิ่นหอมและรสเปรี้ยว",
  },
  {
    id: "m7",
    name: "ไก่ย่างซอสบาร์บีคิว",
    calories: 420,
    protein: 38,
    carbs: 12,
    fat: 22,
    prep: "35 นาที",
    emoji: "🔥",
    imageClass: "from-orange-100 to-red-100",
    matchKeywords: ["ไก่", "กระเทียม", "น้ำผึ้ง"],
    ingredients: [
      {
        name: "ไก่",
        required: 300,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      {
        name: "ซอสบาร์บีคิว",
        required: 3,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซอส",
      },
      {
        name: "กระเทียม",
        required: 3,
        unit: "กลีบ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "น้ำผึ้ง",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🍯",
        matchKey: "น้ำผึ้ง",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
    ],
    steps: [
      "หมักไก่กับซอสบาร์บีคิว กระเทียม น้ำผึ้ง และซีอิ๊ว 20 นาที",
      "ย่างไก่บนเตาหรือกระทะด้วยไฟปานกลาง",
      "พลิกไก่และทาซอสซ้ำทุก 5 นาที",
      "ย่างจนสุกทอง เสิร์ฟพร้อมข้าว",
    ],
    tip: "หมักไก่ไว้ในตู้เย็นข้ามคืนเพื่อรสชาติที่ลึกขึ้น",
  },
  {
    id: "m8",
    name: "สมูทตี้ผลไม้",
    calories: 220,
    protein: 8,
    carbs: 38,
    fat: 4,
    prep: "10 นาที",
    emoji: "🍓",
    imageClass: "from-pink-100 to-rose-100",
    matchKeywords: ["นม", "กล้วย", "น้ำผึ้ง"],
    ingredients: [
      { name: "นมสด", required: 200, unit: "มล.", emoji: "🥛", matchKey: "นม" },
      {
        name: "กล้วย",
        required: 1,
        unit: "ลูก",
        emoji: "🍌",
        matchKey: "กล้วย",
      },
      {
        name: "สตรอว์เบอร์รี่",
        required: 5,
        unit: "ลูก",
        emoji: "🍓",
        matchKey: "ผลไม้",
      },
      {
        name: "น้ำผึ้ง",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🍯",
        matchKey: "น้ำผึ้ง",
      },
      {
        name: "น้ำแข็ง",
        required: 1,
        unit: "ถ้วย",
        emoji: "🧊",
        matchKey: "น้ำแข็ง",
      },
    ],
    steps: [
      "ใส่ผลไม้ทั้งหมดลงในเครื่องปั่น",
      "เทนมสดและน้ำผึ้งลงไป",
      "ปั่นจนเนียน เสิร์ฟทันที",
    ],
    tip: "แช่แข็งกล้วยก่อนใช้จะได้เนื้อสมูทตี้ที่ข้นและเย็น",
  },
  {
    id: "m9",
    name: "โอวัลตินนม",
    calories: 180,
    protein: 7,
    carbs: 30,
    fat: 5,
    prep: "5 นาที",
    emoji: "🥛",
    imageClass: "from-amber-100 to-orange-100",
    matchKeywords: ["นม", "น้ำตาล"],
    ingredients: [
      { name: "นมสด", required: 200, unit: "มล.", emoji: "🥛", matchKey: "นม" },
      {
        name: "โอวัลติน",
        required: 3,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "โอวัลติน",
      },
      {
        name: "น้ำร้อน",
        required: 50,
        unit: "มล.",
        emoji: "☕",
        matchKey: "น้ำ",
      },
      {
        name: "น้ำตาล",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
    ],
    steps: [
      "ละลายโอวัลตินกับน้ำร้อนเล็กน้อย",
      "อุ่นนมสดให้ร้อนแต่ไม่เดือด",
      "เทนมลงในแก้ว คนให้เข้ากัน ใส่น้ำตาลตามชอบ",
    ],
    tip: "ชงแบบร้อนหรือเย็นก็อร่อยได้ เพิ่มน้ำแข็งสำหรับเมนูเย็น",
  },
  {
    id: "m10",
    name: "พุดดิ้งนม",
    calories: 290,
    protein: 9,
    carbs: 45,
    fat: 8,
    prep: "25 นาที",
    emoji: "🍮",
    imageClass: "from-yellow-100 to-amber-100",
    matchKeywords: ["นม", "ไข่", "น้ำตาล"],
    ingredients: [
      { name: "นมสด", required: 500, unit: "มล.", emoji: "🥛", matchKey: "นม" },
      {
        name: "ไข่ไก่",
        required: 3,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "น้ำตาล",
        required: 4,
        unit: "ช้อนโต๊ะ",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
      {
        name: "กลิ่นวานิลา",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "วานิลา",
      },
    ],
    steps: [
      "ตีไข่กับน้ำตาลให้เข้ากัน",
      "เทนมสดอุ่นๆ ลงในไข่ทีละน้อย คนตลอด",
      "เทใส่พิมพ์ นึ่งด้วยไฟอ่อน 20 นาที",
      "แช่เย็นก่อนเสิร์ฟ",
    ],
    tip: "นึ่งไฟอ่อนๆ จะได้เนื้อพุดดิ้งที่เนียนไม่มีฟอง",
  },
  {
    id: "m11",
    name: "เห็ดผัดน้ำมันหอย",
    calories: 180,
    protein: 6,
    carbs: 12,
    fat: 10,
    prep: "15 นาที",
    emoji: "🍄",
    imageClass: "from-stone-100 to-amber-100",
    matchKeywords: ["เห็ด", "กระเทียม"],
    ingredients: [
      {
        name: "เห็ดหอม",
        required: 200,
        unit: "กรัม",
        emoji: "🍄",
        matchKey: "เห็ด",
      },
      {
        name: "น้ำมันพืช",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
      {
        name: "น้ำมันหอย",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมันหอย",
      },
      {
        name: "กระเทียม",
        required: 4,
        unit: "กลีบ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "พริกไทย",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "⚫",
        matchKey: "พริกไทย",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
    ],
    steps: [
      "ตั้งกระทะใส่น้ำมันพืช ผัดกระเทียมด้วยไฟกลางจนหอม",
      "ใส่เห็ดลงผัดด้วยไฟแรง",
      "ปรุงรสด้วยน้ำมันหอยและซีอิ๊ว โรยพริกไทย เสิร์ฟ",
    ],
    tip: "ผัดไฟแรงเร็วเพื่อให้เห็ดสุกกรอบ ไม่อืดน้ำ",
  },
  {
    id: "m12",
    name: "ต้มยำเห็ด",
    calories: 150,
    protein: 8,
    carbs: 10,
    fat: 6,
    prep: "20 นาที",
    emoji: "🍲",
    imageClass: "from-red-100 to-orange-100",
    matchKeywords: ["เห็ด", "ตะไคร้", "พริก"],
    ingredients: [
      {
        name: "เห็ดหอม",
        required: 150,
        unit: "กรัม",
        emoji: "🍄",
        matchKey: "เห็ด",
      },
      {
        name: "ตะไคร้",
        required: 1,
        unit: "ต้น",
        emoji: "🌿",
        matchKey: "ตะไคร้",
      },
      { name: "ข่า", required: 3, unit: "แว่น", emoji: "🌱", matchKey: "ข่า" },
      {
        name: "ใบมะกรูด",
        required: 3,
        unit: "ใบ",
        emoji: "🍃",
        matchKey: "ใบมะกรูด",
      },
      {
        name: "พริกขี้หนู",
        required: 3,
        unit: "เม็ด",
        emoji: "🌶️",
        matchKey: "พริก",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
      {
        name: "มะนาว",
        required: 1,
        unit: "ลูก",
        emoji: "🍋",
        matchKey: "มะนาว",
      },
    ],
    steps: [
      "ต้มน้ำ 400 มล. กับตะไคร้ ข่า และใบมะกรูดจนเดือด",
      "ใส่เห็ดลงต้ม 5 นาที",
      "ปรุงรสด้วยน้ำปลาและคั้นมะนาว ชิมรส ใส่พริกตามชอบ",
      "เสิร์ฟร้อนๆ",
    ],
    tip: "เพิ่มมะเขือเทศเพื่อให้สีสวยและรสชาติกลมกล่อมขึ้น",
  },
  {
    id: "m13",
    name: "เต้าหู้ทอดกระเทียม",
    calories: 280,
    protein: 16,
    carbs: 10,
    fat: 18,
    prep: "20 นาที",
    emoji: "🧄",
    imageClass: "from-yellow-100 to-lime-100",
    matchKeywords: ["เต้าหู้", "กระเทียม", "ซีอิ๊ว"],
    ingredients: [
      {
        name: "เต้าหู้แข็ง",
        required: 200,
        unit: "กรัม",
        emoji: "🟡",
        matchKey: "เต้าหู้",
      },
      {
        name: "กระเทียม",
        required: 5,
        unit: "กลีบ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "น้ำมันพืช",
        required: 3,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
      {
        name: "พริกไทย",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "⚫",
        matchKey: "พริกไทย",
      },
    ],
    steps: [
      "หั่นเต้าหู้เป็นแว่น ซับน้ำให้แห้ง",
      "ทอดเต้าหู้ในน้ำมันจนเหลืองกรอบ",
      "ผัดกระเทียมพร้อมซีอิ๊ว ราดบนเต้าหู้",
    ],
    tip: "ซับน้ำออกจากเต้าหู้ให้แห้งก่อนทอด จะได้ผิวกรอบสวย",
  },
  {
    id: "m14",
    name: "ต้มยำเต้าหู้",
    calories: 160,
    protein: 12,
    carbs: 7,
    fat: 8,
    prep: "20 นาที",
    emoji: "🌶️",
    imageClass: "from-red-100 to-pink-100",
    matchKeywords: ["เต้าหู้", "ตะไคร้", "พริก"],
    ingredients: [
      {
        name: "เต้าหู้",
        required: 150,
        unit: "กรัม",
        emoji: "🟡",
        matchKey: "เต้าหู้",
      },
      {
        name: "ตะไคร้",
        required: 1,
        unit: "ต้น",
        emoji: "🌿",
        matchKey: "ตะไคร้",
      },
      { name: "ข่า", required: 3, unit: "แว่น", emoji: "🌱", matchKey: "ข่า" },
      {
        name: "ใบมะกรูด",
        required: 3,
        unit: "ใบ",
        emoji: "🍃",
        matchKey: "ใบมะกรูด",
      },
      {
        name: "พริกขี้หนู",
        required: 2,
        unit: "เม็ด",
        emoji: "🌶️",
        matchKey: "พริก",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
      {
        name: "มะนาว",
        required: 1,
        unit: "ลูก",
        emoji: "🍋",
        matchKey: "มะนาว",
      },
    ],
    steps: [
      "ต้มน้ำ 400 มล. กับตะไคร้ ข่า และใบมะกรูดจนเดือด",
      "ใส่เต้าหู้หั่นชิ้นลงต้ม 3–4 นาที",
      "ปรุงรสด้วยน้ำปลา คั้นมะนาว และใส่พริกตามชอบ",
      "เสิร์ฟร้อนๆ",
    ],
    tip: "ใส่เห็ดหรือผักตามชอบเพื่อเพิ่มคุณค่าอาหาร",
  },
  {
    id: "m15",
    name: "แกงแครอท",
    calories: 210,
    protein: 5,
    carbs: 28,
    fat: 9,
    prep: "30 นาที",
    emoji: "🥕",
    imageClass: "from-orange-100 to-amber-100",
    matchKeywords: ["แครอท", "กะทิ"],
    ingredients: [
      {
        name: "แครอท",
        required: 2,
        unit: "หัว",
        emoji: "🥕",
        matchKey: "แครอท",
      },
      {
        name: "กะทิ",
        required: 400,
        unit: "มล.",
        emoji: "🥥",
        matchKey: "กะทิ",
      },
      { name: "น้ำ", required: 200, unit: "มล.", emoji: "💧", matchKey: "น้ำ" },
      {
        name: "ผงกะหรี่",
        required: 2,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "กะหรี่",
      },
      {
        name: "หัวหอม",
        required: 1,
        unit: "หัว",
        emoji: "🧅",
        matchKey: "หัวหอม",
      },
      {
        name: "กระเทียม",
        required: 3,
        unit: "กลีบ",
        emoji: "🧄",
        matchKey: "กระเทียม",
      },
      {
        name: "น้ำมันพืช",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
    ],
    steps: [
      "ตั้งกระทะใส่น้ำมันพืช ผัดหัวหอมและกระเทียมจนหอม",
      "ใส่ผงกะหรี่ผัดสักครู่ให้หอม",
      "เทกะทิและน้ำ 200 มล. ลงหม้อ ใส่แครอท เคี่ยวด้วยไฟปานกลาง 15 นาทีจนนุ่ม",
      "ปรุงรสด้วยน้ำปลา ชิมให้ได้รสที่ชอบ เสิร์ฟพร้อมข้าว",
    ],
    tip: "ใส่มันฝรั่งหรือถั่วลันเตาเพิ่มเพื่อให้ครบสารอาหาร",
  },
  {
    id: "m16",
    name: "สลัดแครอท",
    calories: 120,
    protein: 3,
    carbs: 18,
    fat: 4,
    prep: "10 นาที",
    emoji: "🥗",
    imageClass: "from-orange-100 to-lime-100",
    matchKeywords: ["แครอท"],
    ingredients: [
      {
        name: "แครอท",
        required: 2,
        unit: "หัว",
        emoji: "🥕",
        matchKey: "แครอท",
      },
      {
        name: "น้ำมันมะกอก",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำมันมะกอก",
      },
      {
        name: "น้ำส้มสายชู",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำส้ม",
      },
      {
        name: "น้ำตาล",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
      {
        name: "เกลือ",
        required: 0.5,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "เกลือ",
      },
    ],
    steps: [
      "ขูดแครอทเป็นเส้นหรือหั่นเป็นแว่นบาง",
      "ผสมน้ำสลัดจากน้ำมันมะกอก น้ำส้มสายชู น้ำตาล และเกลือ",
      "คลุกแครอทกับน้ำสลัด เสิร์ฟ",
    ],
    tip: "เพิ่มผักชีหรือถั่วลิสงคั่วเพื่อเพิ่มรสและกลิ่น",
  },
  {
    id: "m17",
    name: "น้ำแครอทปั่น",
    calories: 95,
    protein: 2,
    carbs: 20,
    fat: 0,
    prep: "5 นาที",
    emoji: "🥤",
    imageClass: "from-orange-100 to-yellow-100",
    matchKeywords: ["แครอท"],
    ingredients: [
      {
        name: "แครอท",
        required: 3,
        unit: "หัว",
        emoji: "🥕",
        matchKey: "แครอท",
      },
      {
        name: "น้ำเปล่า",
        required: 200,
        unit: "มล.",
        emoji: "💧",
        matchKey: "น้ำ",
      },
      {
        name: "น้ำผึ้ง",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🍯",
        matchKey: "น้ำผึ้ง",
      },
    ],
    steps: [
      "ปอกเปลือกแครอทและหั่นชิ้น",
      "ปั่นแครอทกับน้ำจนละเอียด",
      "กรองด้วยผ้าหรือตะแกรง เติมน้ำผึ้ง เสิร์ฟ",
    ],
    tip: "เพิ่มขิงสดเล็กน้อยเพื่อรสชาติที่สดชื่นขึ้น",
  },
  {
    id: "m18",
    name: "พาร์เฟ่ต์โยเกิร์ต",
    calories: 260,
    protein: 12,
    carbs: 38,
    fat: 6,
    prep: "10 นาที",
    emoji: "🫙",
    imageClass: "from-pink-100 to-purple-100",
    matchKeywords: ["โยเกิร์ต", "น้ำผึ้ง"],
    ingredients: [
      {
        name: "โยเกิร์ตธรรมชาติ",
        required: 200,
        unit: "กรัม",
        emoji: "🫙",
        matchKey: "โยเกิร์ต",
      },
      {
        name: "กราโนลา",
        required: 4,
        unit: "ช้อนโต๊ะ",
        emoji: "🌾",
        matchKey: "กราโนลา",
      },
      {
        name: "สตรอว์เบอร์รี่",
        required: 5,
        unit: "ลูก",
        emoji: "🍓",
        matchKey: "ผลไม้",
      },
      {
        name: "น้ำผึ้ง",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🍯",
        matchKey: "น้ำผึ้ง",
      },
      {
        name: "บลูเบอร์รี่",
        required: 10,
        unit: "เม็ด",
        emoji: "🫐",
        matchKey: "ผลไม้",
      },
    ],
    steps: [
      "ตักโยเกิร์ตใส่แก้วหรือชาม",
      "โรยกราโนลาและผลไม้สด",
      "ราดน้ำผึ้ง เสิร์ฟทันที",
    ],
    tip: "แช่เย็นโยเกิร์ตไว้ก่อนใช้จะได้รสชาติที่สดชื่นกว่า",
  },
  {
    id: "m19",
    name: "ลาซีโยเกิร์ต",
    calories: 170,
    protein: 8,
    carbs: 22,
    fat: 5,
    prep: "5 นาที",
    emoji: "🥛",
    imageClass: "from-blue-100 to-purple-100",
    matchKeywords: ["โยเกิร์ต", "น้ำตาล"],
    ingredients: [
      {
        name: "โยเกิร์ตธรรมชาติ",
        required: 200,
        unit: "กรัม",
        emoji: "🫙",
        matchKey: "โยเกิร์ต",
      },
      {
        name: "น้ำเย็น",
        required: 150,
        unit: "มล.",
        emoji: "💧",
        matchKey: "น้ำ",
      },
      {
        name: "น้ำตาล",
        required: 2,
        unit: "ช้อนชา",
        emoji: "🧂",
        matchKey: "น้ำตาล",
      },
      {
        name: "น้ำแข็ง",
        required: 1,
        unit: "ถ้วย",
        emoji: "🧊",
        matchKey: "น้ำแข็ง",
      },
    ],
    steps: [
      "ปั่นโยเกิร์ต น้ำ และน้ำตาลเข้าด้วยกัน",
      "เทใส่แก้วที่มีน้ำแข็ง",
      "โรยกุหลาบแห้งหรือมิ้นต์ตกแต่ง",
    ],
    tip: "เพิ่มน้ำกุหลาบ 1 ช้อนชาเพื่อรสชาติแบบดั้งเดิม",
  },
  {
    id: "m20",
    name: "สมูทตี้โยเกิร์ต",
    calories: 240,
    protein: 10,
    carbs: 40,
    fat: 4,
    prep: "8 นาที",
    emoji: "🍌",
    imageClass: "from-yellow-100 to-green-100",
    matchKeywords: ["โยเกิร์ต", "กล้วย", "นม"],
    ingredients: [
      {
        name: "โยเกิร์ตธรรมชาติ",
        required: 150,
        unit: "กรัม",
        emoji: "🫙",
        matchKey: "โยเกิร์ต",
      },
      {
        name: "กล้วย",
        required: 1,
        unit: "ลูก",
        emoji: "🍌",
        matchKey: "กล้วย",
      },
      { name: "นมสด", required: 100, unit: "มล.", emoji: "🥛", matchKey: "นม" },
      {
        name: "น้ำผึ้ง",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🍯",
        matchKey: "น้ำผึ้ง",
      },
      {
        name: "น้ำแข็ง",
        required: 0.5,
        unit: "ถ้วย",
        emoji: "🧊",
        matchKey: "น้ำแข็ง",
      },
    ],
    steps: [
      "ใส่โยเกิร์ต กล้วย และนมลงในเครื่องปั่น",
      "เติมน้ำผึ้งและน้ำแข็ง",
      "ปั่นจนเนียนเรียบ เสิร์ฟทันที",
    ],
    tip: "ใช้กล้วยแช่แข็งจะได้เนื้อสมูทตี้ที่ข้นและเย็นกว่า",
  },
  {
    id: "m21",
    name: "มาม่าต้มยำไก่",
    calories: 450,
    protein: 15,
    carbs: 58,
    fat: 14,
    prep: "15 นาที",
    emoji: "🍜",
    imageClass: "from-red-100 to-orange-100",
    matchKeywords: ["ไก่", "ไข่"],
    ingredients: [
      {
        name: "มาม่า",
        required: 1,
        unit: "ซอง",
        emoji: "🍜",
        matchKey: "มาม่า",
      },
      {
        name: "ไก่สับ",
        required: 100,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      { name: "น้ำ", required: 400, unit: "มล.", emoji: "💧", matchKey: "น้ำ" },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "ต้นหอม",
        required: 1,
        unit: "ต้น",
        emoji: "🌱",
        matchKey: "ต้นหอม",
      },
    ],
    steps: [
      "ต้มน้ำให้เดือด ใส่ไก่สับลงไปก่อน",
      "ใส่มาม่าและซองปรุงรส",
      "ตอกไข่ลงหม้อ รอไข่สุก",
      "โรยต้นหอม เสิร์ฟร้อนๆ",
    ],
    tip: "อย่าใส่ซองปรุงรสจนหมด เพื่อควบคุมความเค็ม",
  },
  {
    id: "m22",
    name: "ยำมะเขือ",
    calories: 150,
    protein: 4,
    carbs: 15,
    fat: 8,
    prep: "15 นาที",
    emoji: "🍆",
    imageClass: "from-purple-100 to-pink-100",
    matchKeywords: ["หมู", "พริก"],
    ingredients: [
      {
        name: "มะเขือยาว",
        required: 2,
        unit: "ลูก",
        emoji: "🍆",
        matchKey: "มะเขือ",
      },
      {
        name: "หมูสับ",
        required: 100,
        unit: "กรัม",
        emoji: "🥩",
        matchKey: "หมู",
      },
      {
        name: "หอมแดง",
        required: 2,
        unit: "หัว",
        emoji: "🧅",
        matchKey: "หอมแดง",
      },
      {
        name: "พริกขี้หนู",
        required: 3,
        unit: "เม็ด",
        emoji: "🌶️",
        matchKey: "พริก",
      },
      {
        name: "น้ำปลา",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำปลา",
      },
      {
        name: "น้ำมะนาว",
        required: 1,
        unit: "ช้อนโต๊ะ",
        emoji: "🍋",
        matchKey: "มะนาว",
      },
      {
        name: "น้ำมันพืช",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "น้ำมัน",
      },
    ],
    steps: [
      "ย่างหรืออบมะเขือทั้งลูกจนสุกดำ ปอกเปลือก ฉีกเป็นเส้น",
      "ตั้งกระทะน้ำมันเล็กน้อย ผัดหมูสับให้สุก พักไว้",
      "คลุกมะเขือ หมูสับ และหอมแดงซอยเข้าด้วยกัน",
      "ปรุงรสด้วยน้ำปลา น้ำมะนาว และพริก ชิมรสเสิร์ฟ",
    ],
    tip: "ย่างมะเขือบนเตาถ่านจะได้กลิ่นหอมควัน",
  },
  {
    id: "m23",
    name: "ต้มจืดไก่สับ",
    calories: 210,
    protein: 22,
    carbs: 6,
    fat: 10,
    prep: "20 นาที",
    emoji: "🍲",
    imageClass: "from-slate-100 to-sky-100",
    matchKeywords: ["ไก่", "ผักกาด", "ต้นหอม"],
    ingredients: [
      {
        name: "ไก่สับ",
        required: 200,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "ต้นหอม",
        required: 2,
        unit: "ต้น",
        emoji: "🌱",
        matchKey: "ต้นหอม",
      },
      {
        name: "ซีอิ๊วขาว",
        required: 1,
        unit: "ช้อนชา",
        emoji: "🫙",
        matchKey: "ซีอิ๊ว",
      },
      {
        name: "น้ำซุป",
        required: 500,
        unit: "มล.",
        emoji: "💧",
        matchKey: "น้ำ",
      },
    ],
    steps: [
      "ต้มน้ำซุปให้เดือด ปั้นไก่สับเป็นลูกเล็กๆ ใส่หม้อ",
      "ใส่ผักกาดขาว ต้มจนผักนุ่ม",
      "ปรุงรสด้วยซีอิ๊วขาว",
      "โรยต้นหอม เสิร์ฟร้อนๆ",
    ],
    tip: "เพิ่มเต้าหู้ขาวได้เพื่อโปรตีนเพิ่มเติม",
  },
  {
    id: "m24",
    name: "สุกี้ไก่น้ำ",
    calories: 360,
    protein: 30,
    carbs: 26,
    fat: 10,
    prep: "20 นาที",
    emoji: "🍲",
    imageClass: "from-sky-100 to-cyan-100",
    recipeImage: "/recipes/suki-clear.svg",
    matchKeywords: ["ผักกาด", "ไก่", "วุ้นเส้น", "ไข่", "น้ำจิ้มสุกี้"],
    ingredients: [
      {
        name: "น้ำซุปไก่",
        required: 600,
        unit: "มล.",
        emoji: "💧",
        matchKey: "น้ำ",
      },
      {
        name: "ผักกาดขาว",
        required: 1,
        unit: "ถ้วย",
        emoji: "🥬",
        matchKey: "ผักกาด",
      },
      {
        name: "อกไก่สไลซ์",
        required: 200,
        unit: "กรัม",
        emoji: "🍗",
        matchKey: "ไก่",
      },
      {
        name: "วุ้นเส้น (แช่น้ำแล้ว)",
        required: 1,
        unit: "กำ",
        emoji: "🍜",
        matchKey: "วุ้นเส้น",
      },
      {
        name: "ไข่ไก่",
        required: 1,
        unit: "ฟอง",
        emoji: "🥚",
        matchKey: "ไข่",
      },
      {
        name: "น้ำจิ้มสุกี้",
        required: 2,
        unit: "ช้อนโต๊ะ",
        emoji: "🫙",
        matchKey: "น้ำจิ้มสุกี้",
      },
    ],
    steps: [
      "แช่วุ้นเส้นในน้ำเย็น 15 นาทีให้นุ่ม",
      "ต้มน้ำซุปไก่ 600 มล. ให้เดือด ใส่อกไก่สไลซ์จนสุก",
      "เติมผักกาดและวุ้นเส้น ต้มต่อ 2 นาที",
      "ตอกไข่ รอไข่สุก ราดน้ำจิ้มสุกี้แล้วเสิร์ฟ",
    ],
    tip: "เพิ่มเต้าหู้หรือเห็ดเพื่อเพิ่มคุณค่าทางโภชนาการ",
  },
];

export default function MenuRecommendationsPage() {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [likedMenus, setLikedMenus] = useState<Set<string>>(new Set());
  const [servings, setServings] = useState(2);
  const [cookConfirmMenu, setCookConfirmMenu] = useState<MenuItem | null>(null);

  useEffect(() => {
    try {
      const merged = new Set<string>();
      const a = localStorage.getItem(LIKED_MENUS_KEY);
      if (a) {
        const p = JSON.parse(a);
        if (Array.isArray(p)) p.forEach((id: string) => merged.add(id));
      }
      const b = localStorage.getItem("liked_expiring_menus");
      if (b) {
        const p = JSON.parse(b);
        if (Array.isArray(p)) p.forEach((id: string) => merged.add(id));
      }
      if (merged.size > 0) setLikedMenus(merged);
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const menuId = params.get("menu");
    if (menuId) {
      const found = menus.find((m) => m.id === menuId);
      if (found) {
        setSelectedMenu(found);
        setServings(2);
      }
    }
  }, []);

  useEffect(() => {
    const loadPantryItems = () => {
      try {
        const raw = localStorage.getItem("pantry_items");
        if (!raw) {
          setPantryItems([]);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPantryItems(parsed);
        } else {
          setPantryItems([]);
        }
      } catch {
        setPantryItems([]);
      }
    };

    loadPantryItems();
    window.addEventListener("focus", loadPantryItems);
    return () => window.removeEventListener("focus", loadPantryItems);
  }, []);

  const recommendedMenus = useMemo<RecommendedMenu[]>(() => {
    if (pantryItems.length === 0) return [];

    const pantryNames = pantryItems.map((item) => item.name.toLowerCase());

    const scoredMenus = menus.map((menu) => {
      const matchedKeywords = menu.matchKeywords.filter((keyword) =>
        pantryNames.some((name) => name.includes(keyword.toLowerCase())),
      );

      const matchedCount = matchedKeywords.length;
      const matchPercent = Math.round(
        (matchedCount / menu.matchKeywords.length) * 100,
      );

      return {
        ...menu,
        matchedKeywords,
        matchedCount,
        matchPercent,
      };
    });

    return scoredMenus
      .filter((menu) => menu.matchedCount > 0)
      .sort((a, b) => {
        const aLiked = likedMenus.has(a.id) ? 1 : 0;
        const bLiked = likedMenus.has(b.id) ? 1 : 0;
        if (bLiked !== aLiked) return bLiked - aLiked;
        return (
          b.matchPercent - a.matchPercent || b.matchedCount - a.matchedCount
        );
      });
  }, [pantryItems, likedMenus]);

  function toggleLikeMenu(menuId: string) {
    setLikedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      localStorage.setItem(LIKED_MENUS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <AppShell
      title="แนะนำเมนู"
      subtitle="เมนูที่เหมาะกับวัตถุดิบที่คุณมีอยู่ตอนนี้"
    >
      {pantryItems.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">ยังไม่มีวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">
            เพิ่มวัตถุดิบจากหน้า สแกนใบเสร็จ ก่อน
            เพื่อให้ระบบแนะนำเมนูตามของที่มีอยู่จริง
          </p>
        </div>
      ) : null}

      {pantryItems.length > 0 && recommendedMenus.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
          <p className="font-semibold">ยังไม่พบเมนูที่ตรงกับวัตถุดิบในคลัง</p>
          <p className="mt-1 text-sm">
            ลองเพิ่มวัตถุดิบให้หลากหลายขึ้น เช่น ผัก ไข่ หรือเครื่องปรุง
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendedMenus.map((menu) => (
          <article
            key={menu.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${menu.imageClass} flex items-center justify-center relative overflow-hidden`}
            >
              <span className="text-6xl">{menu.emoji}</span>
              <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700">
                {menu.prep}
              </span>
              <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                ตรง {menu.matchPercent}%
              </span>
              <button
                type="button"
                onClick={() => toggleLikeMenu(menu.id)}
                className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition ${likedMenus.has(menu.id) ? "border-red-200 bg-red-100 text-red-500" : "border-white/60 bg-white/85 text-slate-500 hover:bg-white"}`}
                aria-label="favorite-menu"
                title="เมนูโปรด"
              >
                <Heart
                  className="h-4 w-4"
                  fill={likedMenus.has(menu.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {menu.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {menu.calories} kcal · โปรตีน {menu.protein}g
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              วัตถุดิบที่มี: {menu.matchedKeywords.join(" • ")}
            </p>
            <button
              type="button"
              onClick={() => setCookConfirmMenu(menu)}
              className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              🍳 ทำเมนูนี้
            </button>
          </article>
        ))}
      </section>

      {/* ── Cook confirm dialog ── */}
      {cookConfirmMenu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl mx-4 text-center">
            <span className="text-5xl block mb-3">{cookConfirmMenu.emoji}</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{cookConfirmMenu.name}</h3>
            <p className="text-sm text-slate-500 mb-5">เริ่มทำเมนูนี้เลยไหม? ใช้เวลาประมาณ {cookConfirmMenu.prep}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCookConfirmMenu(null)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                ยังก่อน
              </button>
              <button
                onClick={() => {
                  recordCook(cookConfirmMenu.id, {
                    name: cookConfirmMenu.name,
                    emoji: cookConfirmMenu.emoji,
                    img: cookConfirmMenu.recipeImage,
                  });
                  setSelectedMenu(cookConfirmMenu);
                  setServings(2);
                  setCookConfirmMenu(null);
                }}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                เริ่มทำเลย!
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMenu && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-slate-100">
              {/* recipe thumbnail */}
              <div
                className={`h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${selectedMenu.imageClass} flex items-center justify-center overflow-hidden`}
              >
                {selectedMenu.recipeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMenu.recipeImage}
                    alt={selectedMenu.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{selectedMenu.emoji}</span>
                )}
              </div>
              {/* title + time */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900">
                  สูตร: {selectedMenu.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  เวลาโดยประมาณ {selectedMenu.prep}
                </p>
                {/* serving counter */}
                <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-full border border-emerald-100 bg-green-50 px-4 py-1.5 w-fit max-w-full">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    {/* plate with fork (left) and spoon (right) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-[18px] w-[22px] shrink-0"
                      viewBox="0 0 28 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* fork — 3 tines → merge → handle */}
                      <line x1="3.5" y1="1" x2="3.5" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="6" />
                      <line x1="6.5" y1="1" x2="6.5" y2="6" />
                      <path d="M3.5 6 Q5 7.5 5 9 L5 23" />
                      {/* plate — outer rim + inner circle */}
                      <circle cx="14" cy="12" r="8" />
                      <circle cx="14" cy="12" r="5.5" />
                      {/* spoon — oval bowl + handle */}
                      <ellipse cx="23" cy="5.5" rx="2" ry="3.5" />
                      <line x1="23" y1="9" x2="23" y2="23" />
                    </svg>
                    <span className="text-slate-600">ทำได้</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center transition select-none"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-lg font-bold text-slate-900 tabular-nums">
                      {servings}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServings((s) => s + 1)}
                      className="h-8 w-8 rounded-full border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center transition select-none"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-slate-500">มื้อ</span>
                </div>
              </div>
              {/* heart + close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleLikeMenu(selectedMenu.id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${likedMenus.has(selectedMenu.id) ? "border-red-200 bg-red-50 text-red-500" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"}`}
                  aria-label="favorite-menu-dialog"
                >
                  <Heart
                    className="h-4 w-4"
                    fill={
                      likedMenus.has(selectedMenu.id) ? "currentColor" : "none"
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMenu(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Body (scrollable) ── */}
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              {/* two-column */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* ── Left: Ingredients ── */}
                <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                    <h4 className="font-semibold text-emerald-800">ส่วนผสม</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                          <th className="text-left font-medium px-4 py-2">
                            วัตถุดิบ
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            จำนวนที่ต้องใช้
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            มีในครัว
                          </th>
                          <th className="text-center font-medium px-2 py-2">
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedMenu.ingredients.map((ing) => {
                          const status = getIngredientStatus(
                            ing,
                            pantryItems,
                            servings,
                          );
                          const requiredAmt = (ing.required * servings) / 2;
                          return (
                            <tr key={ing.name} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                                    {ing.emoji}
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {ing.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-2.5 text-center text-slate-700">
                                {requiredAmt % 1 === 0
                                  ? requiredAmt
                                  : requiredAmt.toFixed(1)}{" "}
                                {ing.unit}
                              </td>
                              <td
                                className={`px-2 py-2.5 text-center text-xs font-medium ${status.enough ? "text-slate-600" : "text-red-500"}`}
                              >
                                {status.availableText}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                {status.enough ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 mx-auto">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Order missing button */}
                  {selectedMenu.ingredients.some(
                    (ing) =>
                      !getIngredientStatus(ing, pantryItems, servings).enough,
                  ) && (
                    <div className="px-4 py-3 border-t border-slate-100">
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        สั่งซื้อวัตถุดิบที่ขาด
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Right: Steps ── */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                  <div className="bg-sky-50 px-4 py-3 border-b border-sky-100">
                    <h4 className="font-semibold text-sky-800">วิธีทำ</h4>
                  </div>
                  {/* Recipe image / emoji hero */}
                  {selectedMenu.recipeImage ? (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedMenu.recipeImage}
                        alt={selectedMenu.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`h-44 w-full flex items-center justify-center bg-gradient-to-br ${selectedMenu.imageClass}`}
                    >
                      <span className="text-7xl drop-shadow">
                        {selectedMenu.emoji}
                      </span>
                    </div>
                  )}
                  <div className="px-4 py-4">
                    <ol className="space-y-3">
                      {selectedMenu.steps.map((step, idx) => (
                        <li
                          key={`${selectedMenu.id}-step-${idx}`}
                          className="flex items-start gap-3 text-sm text-slate-700"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* ── Nutritional info ── */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                  <CircleCheckBig className="h-4 w-4" />
                  โภชนาการต่อ 1 มื้อ (โดยประมาณ)
                </p>
                <div className="grid grid-cols-4 divide-x divide-emerald-200 text-center">
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.calories}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">kcal</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      พลังงาน
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.protein}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      โปรตีน
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.carbs}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      คาร์บ
                    </p>
                  </div>
                  <div className="px-2">
                    <p className="text-base font-bold text-slate-900">
                      {selectedMenu.fat}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">g</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ไขมัน
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Tip ── */}
              {selectedMenu.tip && (
                <div className="rounded-xl border border-emerald-100 bg-green-50 px-4 py-3 flex items-start gap-2 text-sm text-slate-700">
                  <Lightbulb className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <p>
                    <span className="font-semibold text-emerald-700">
                      เคล็ดลับ:
                    </span>{" "}
                    {selectedMenu.tip}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
