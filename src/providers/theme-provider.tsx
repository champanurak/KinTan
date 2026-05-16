"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<ThemeContextType>({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  // Load saved theme on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_prefs");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.theme) setThemeState(p.theme as Theme);
      }
    } catch {}
  }, []);

  // Apply theme to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [theme]);

  // Re-sync when prefs are saved from settings page
  useEffect(() => {
    function onPrefsUpdated() {
      try {
        const raw = localStorage.getItem("user_prefs");
        if (raw) {
          const p = JSON.parse(raw);
          if (p.theme) setThemeState(p.theme as Theme);
        }
      } catch {}
    }
    window.addEventListener("prefs_updated", onPrefsUpdated);
    return () => window.removeEventListener("prefs_updated", onPrefsUpdated);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
