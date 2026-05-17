import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarDataUrl?: string | null;
}

export interface UserPrefs {
  language: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  theme: "light" | "dark" | "system";
}

interface UserState {
  profile: UserProfile;
  prefs: UserPrefs;
  setProfile: (updates: Partial<UserProfile>) => void;
  setPrefs: (updates: Partial<UserPrefs>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "test",
  email: "test@example.com",
  phone: "081-234-5678",
  avatarDataUrl: null,
};

const DEFAULT_PREFS: UserPrefs = {
  language: "ภาษาไทย",
  currency: "บาท (฿)",
  dateFormat: "วันที่ 9 ม.ค. 2567",
  timezone: "(GMT+07:00) กรุงเทพฯ",
  theme: "system",
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      prefs: DEFAULT_PREFS,

      setProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      setPrefs: (updates) =>
        set((s) => ({ prefs: { ...s.prefs, ...updates } })),
    }),
    { name: "user_store" }
  )
);
