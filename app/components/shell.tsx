"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { commands, resume, type SectionId } from "../lib/data";
import PaneTerminal from "./pane-terminal";
import Sidebar from "./sidebar";
import TabBar from "./tabbar";

export interface ShellTab {
  id: number;
  kind: "page" | "shell" | "resume";
  /** Last command a shell tab ran — doubles as its strip label. */
  label?: string;
}

const MAX_SHELL_TABS = 4;

export default function Shell({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<SectionId>(commands[0].section);
  const [navOpen, setNavOpen] = useState(false);
  const [tabs, setTabs] = useState<ShellTab[]>([{ id: 1, kind: "page" }]);
  const [activeTab, setActiveTab] = useState(1);
  const nextTabId = useRef(2);
  const paneRef = useRef<HTMLElement>(null);
  const tabsRef = useRef(tabs);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    tabsRef.current = tabs;
    activeTabRef.current = activeTab;
  });

  useEffect(() => {
    const root = paneRef.current;
    if (!root) return;

    // The band across the top of the pane decides which section is "current".
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id as SectionId);
      },
      { root, rootMargin: "-10% 0px -80% 0px" },
    );

    for (const { section } of commands) {
      const el = root.querySelector(`#${section}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Inactive tabs stay mounted but hidden, so flipping to tab 1 then
  // scrolling works in the same tick chain without losing terminal state.
  const goToSection = useCallback((id: SectionId) => {
    setActiveTab(1);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        paneRef.current
          ?.querySelector(`#${id}`)
          ?.scrollIntoView({ behavior: "smooth" });
      }),
    );
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  // Tab / Shift+Tab to cycle through tabs (when not typing in an input)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      const tabsArray = tabsRef.current.filter((t) => t.kind !== "page");
      if (tabsArray.length <= 1) return;
      const currentIdx = tabsArray.findIndex((t) => t.id === activeTabRef.current);
      if (currentIdx === -1) return;
      const nextIdx = event.shiftKey
        ? (currentIdx - 1 + tabsArray.length) % tabsArray.length
        : (currentIdx + 1) % tabsArray.length;
      setActiveTab(tabsArray[nextIdx].id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus the newest shell tab, or start one — shared by the ` shortcut and
  // the sidebar's terminal button.
  const focusShell = useCallback(() => {
    const shells = tabsRef.current.filter((tab) => tab.kind === "shell");
    if (shells.length > 0) {
      setActiveTab(shells[shells.length - 1].id);
      return;
    }
    const id = nextTabId.current++;
    setTabs((prev) => [...prev, { id, kind: "shell", label: "terminal" }]);
    setActiveTab(id);
  }, []);

  // Backtick opens a shell tab, or focuses the latest one. Never hijacks
  // typing inside an input.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "`") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      event.preventDefault();
      const active = tabsRef.current.find(
        (tab) => tab.id === activeTabRef.current,
      );
      if (active?.kind === "shell") return;
      focusShell();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusShell]);

  const shellCount = tabs.filter((tab) => tab.kind === "shell").length;

  function addTab() {
    if (shellCount >= MAX_SHELL_TABS) return;
    const id = nextTabId.current++;
    setTabs((prev) => [...prev, { id, kind: "shell", label: "terminal" }]);
    setActiveTab(id);
  }

  function closeTab(id: number) {
    const idx = tabs.findIndex((tab) => tab.id === id);
    const remaining = tabs.filter((tab) => tab.id !== id);
    setTabs(remaining);
    if (activeTab === id) {
      const fallback = remaining[Math.max(0, idx - 1)] ?? remaining[0];
      setActiveTab(fallback.id);
    }
  }

  // The resume opens as its own tab; a second click just switches to it.
  function openResume() {
    const existing = tabs.find((tab) => tab.kind === "resume");
    if (existing) {
      setActiveTab(existing.id);
      return;
    }
    const id = nextTabId.current++;
    setTabs((prev) => [...prev, { id, kind: "resume" }]);
    setActiveTab(id);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {navOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="absolute inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <Sidebar
        active={active}
        open={navOpen}
        onNavigate={() => setNavOpen(false)}
        onOpenResume={openResume}
        onOpenShell={focusShell}
        scrollTo={goToSection}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          canAdd={shellCount < MAX_SHELL_TABS}
          onSelect={setActiveTab}
          onAdd={addTab}
          onClose={closeTab}
          onMenu={() => setNavOpen((open) => !open)}
        />

        <main
          ref={paneRef}
          className={`scroll-pane flex-1 overflow-y-auto ${activeTab === 1 ? "" : "hidden"}`}
        >
          {children}
        </main>

        {tabs
          .filter((tab) => tab.kind !== "page")
          .map((tab) => (
            <div
              key={tab.id}
              className={`min-h-0 flex-1 ${activeTab === tab.id ? "flex flex-col" : "hidden"}`}
            >
              {tab.kind === "shell" ? (
                <PaneTerminal
                  n={tab.id}
                  focused={activeTab === tab.id}
                  onClose={() => closeTab(tab.id)}
                  scrollTo={goToSection}
                />
              ) : (
                <object
                  data={resume.file}
                  type="application/pdf"
                  aria-label={resume.name}
                  className="min-h-0 w-full flex-1"
                >
                  <p className="p-6 font-mono text-sm text-muted">
                    This browser can&apos;t preview PDFs —{" "}
                    <a
                      href={resume.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline"
                    >
                      open {resume.name}
                    </a>
                  </p>
                </object>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
