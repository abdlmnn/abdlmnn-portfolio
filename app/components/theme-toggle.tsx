"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readStoredTheme } from "../lib/theme";

export default function ThemeToggle() {
  // React's dev Strict Mode remount resets <html> to the attributes it manages
  // from JSX, dropping the one the inline script set. Re-apply it. No-op in prod.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="rounded p-2 text-muted transition-colors hover:bg-line/40 hover:text-fg"
    >
      <span aria-hidden="true" className="dark:hidden">
        ☾
      </span>
      <span aria-hidden="true" className="hidden dark:inline">
        ☀
      </span>
    </button>
  );
}
