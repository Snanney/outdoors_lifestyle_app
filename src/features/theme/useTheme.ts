import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON } from "../../lib";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(): Theme {
  const stored = readJSON<Theme | null>(STORAGE_KEY, null);
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
}

/**
 * Light/dark theme state. Defaults to the OS preference, is overridable by the
 * user, and persists on the device (ADR-0006). Applying the theme sets
 * `data-theme` on <html> (drives the CSS variables) and updates the PWA
 * theme-color so the browser chrome matches.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#10140f" : "#ffffff");
    }

    writeJSON(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return { theme, setTheme, toggleTheme };
}
