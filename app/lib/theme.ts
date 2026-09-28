export type Theme = "light" | "dark";

export const THEME_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

/**
 * Runs synchronously in <head>, before the first paint, so a returning visitor
 * never sees a flash of the default theme. The try/catch covers browsers where
 * localStorage throws (private mode, blocked storage).
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Theme still applies for this session even if storage is unavailable.
  }
}
