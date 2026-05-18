import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShoppingItem {
  name: string;
  emoji: string;
  required: number;
  unit: string;
}

interface ShoppingState {
  missingItems: ShoppingItem[];
  fromMenuName: string;
  setMissingItems: (items: ShoppingItem[], menuName: string) => void;
  clearMissingItems: () => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      missingItems: [],
      fromMenuName: "",
      setMissingItems: (missingItems, fromMenuName) =>
        set({ missingItems, fromMenuName }),
      clearMissingItems: () => set({ missingItems: [], fromMenuName: "" }),
    }),
    { name: "shopping_store" },
  ),
);
