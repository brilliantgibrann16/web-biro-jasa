"use client";

import { Moon, Sun } from "lucide-react";
import { MotionConfig } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  mounted: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "tiga-saudara-theme";
const THEME_CHANGE_EVENT = "tiga-saudara-theme-change";
const DEFAULT_THEME: Theme = "light";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function getThemeSnapshot(): Theme {
  const documentTheme = document.documentElement.getAttribute("data-theme");
  if (isTheme(documentTheme)) return documentTheme;

  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (isTheme(storedTheme)) return storedTheme;
  } catch {
    // Storage can be unavailable in hardened/private browsing contexts.
  }

  return DEFAULT_THEME;
}

function getServerThemeSnapshot(): Theme {
  return DEFAULT_THEME;
}

function subscribeToTheme(onStoreChange: () => void) {
  const handleThemeChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !isTheme(event.newValue)) return;
    document.documentElement.setAttribute("data-theme", event.newValue);
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function subscribeToMounted() {
  return () => undefined;
}

function getMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The visual theme still works when storage is unavailable.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  const toggle = useCallback(() => {
    applyTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  const value = useMemo(
    () => ({ theme, mounted, toggle }),
    [mounted, theme, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a <ThemeProvider>");
  return ctx;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mounted, theme, toggle } = useTheme();
  const isDark = mounted && theme === "dark";
  const label = mounted
    ? isDark
      ? "Ganti ke mode terang"
      : "Ganti ke mode gelap"
    : "Ubah tema warna";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!mounted}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-current/20 bg-current/[0.06] transition-colors duration-300 hover:bg-current/10 disabled:cursor-wait ${className}`}
      aria-label={label}
      title={mounted ? (isDark ? "Mode Terang" : "Mode Gelap") : "Tema warna"}
    >
      <span className="sr-only">{label}</span>
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          mounted && !isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-90"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 -rotate-90"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
