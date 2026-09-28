"use client";

import { identity } from "../lib/data";
import type { ShellTab } from "./shell";

/** Shell tabs borrow their strip label from the last command they ran. */
function tabLabel(tab: ShellTab): string {
  if (tab.kind === "shell") return tab.label ?? "terminal";
  if (tab.kind === "resume") return "resume";
  return identity.handle;
}

export default function TabBar({
  tabs,
  activeTab,
  canAdd,
  onSelect,
  onAdd,
  onClose,
  onMenu,
}: {
  tabs: ShellTab[];
  activeTab: number;
  canAdd: boolean;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onClose: (id: number) => void;
  onMenu: () => void;
}) {
  return (
    <header className="flex h-9 shrink-0 items-stretch border-b border-line bg-panel">
      <nav
        aria-label="Tabs"
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto"
      >
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              className={`flex shrink-0 items-center gap-1 border-r border-line pr-1.5 pl-3 font-mono text-xs transition-colors ${
                selected
                  ? "bg-raised text-fg"
                  : "text-muted hover:text-fg"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-label={`Go to tab ${tab.id}`}
                className="flex items-center gap-2 py-2"
              >
                <span className="tabular-nums">{tab.id}</span>
                <span>{tabLabel(tab)}</span>
              </button>
              {selected && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                />
              )}
              {tab.kind !== "page" && (
                <button
                  type="button"
                  onClick={() => onClose(tab.id)}
                  aria-label={`Close tab ${tab.id}`}
                  className="rounded px-1 text-muted transition-colors hover:text-fg"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          aria-label="New terminal tab"
          title={canAdd ? "New terminal tab" : "Tab limit reached"}
          className="shrink-0 px-3 font-mono text-sm text-muted transition-colors hover:text-fg disabled:opacity-30 disabled:hover:text-muted"
        >
          +
        </button>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 px-2">
        <button
          onClick={onMenu}
          aria-label="Toggle navigation"
          className="rounded p-1.5 text-muted transition-colors hover:bg-raised hover:text-fg lg:hidden"
        >
          <span aria-hidden="true" className="font-mono text-base leading-none">
            ≡
          </span>
        </button>
      </div>
    </header>
  );
}
