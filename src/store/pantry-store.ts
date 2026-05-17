import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PantryItem {
  id: number;
  name: string;
  unit: string;
  price?: number;
  quantity: number;
  category: string;
  createdAt?: string;
  expiresAt?: string;
  forNutrition?: boolean;
  alertExpiry?: boolean;
}

export interface PantryCategory {
  name: string;
  icon: string;
  color: string;
  open: boolean;
}

const DEFAULT_CATEGORIES: PantryCategory[] = [
  { name: "เนื้อสัตว์",   icon: "🥩", color: "bg-red-100 text-red-700 ring-red-200",        open: false },
  { name: "นมและเนย",     icon: "🥛", color: "bg-blue-100 text-blue-700 ring-blue-200",      open: false },
  { name: "เครื่องปรุง",  icon: "🧂", color: "bg-yellow-100 text-yellow-700 ring-yellow-200", open: false },
  { name: "ของใช้ในบ้าน", icon: "🏠", color: "bg-slate-100 text-slate-700 ring-slate-200",   open: false },
];

interface PantryState {
  items: PantryItem[];
  categories: PantryCategory[];
  setItems: (items: PantryItem[]) => void;
  addItems: (items: PantryItem[]) => void;
  updateItem: (id: number, updates: Partial<PantryItem>) => void;
  removeItem: (id: number) => void;
  setCategories: (categories: PantryCategory[]) => void;
  addCategory: (category: PantryCategory) => void;
  removeCategory: (name: string) => void;
  toggleCategory: (name: string) => void;
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],
      categories: DEFAULT_CATEGORIES,

      setItems: (items) => set({ items }),

      addItems: (newItems) =>
        set((s) => ({ items: [...s.items, ...newItems] })),

      updateItem: (id, updates) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
        })),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

      setCategories: (categories) => set({ categories }),

      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),

      removeCategory: (name) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.name !== name),
        })),

      toggleCategory: (name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.name === name ? { ...c, open: !c.open } : c
          ),
        })),
    }),
    { name: "pantry_store" }
  )
);
