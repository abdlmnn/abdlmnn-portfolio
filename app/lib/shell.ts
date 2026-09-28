import {
  commands,
  contact,
  projects,
  shellCommands,
  type SectionId,
} from "./data";
import { isTheme, type Theme } from "./theme";

export type ShellTone = "prompt" | "ok" | "error" | "muted" | "text";

export interface ShellLine {
  text: string;
  tone: ShellTone;
  col?: "left" | "right";
}

export type ShellAction = "clear" | "close";

export interface ShellContext {
  scrollTo: (id: SectionId) => void;
  openLink: (url: string) => void;
  getTheme: () => string | null;
  setTheme: (theme: Theme) => void;
}

export const SHELL_TONE_CLASS: Record<ShellTone, string> = {
  prompt: "text-cyan",
  ok: "text-ok",
  error: "text-danger",
  muted: "text-muted",
  text: "text-fg",
};

/** Every word Tab can complete: navigation commands plus shell commands. */
export const SHELL_FIRST_WORDS: string[] = [
  ...commands.map((command) => command.name),
  "dirs",
  ...shellCommands.map((command) => command.name),
];

/**
 * A conversational guide — the `help` response.
 * Organized in 3 columns for readability.
 */
export function shellHelp(): ShellLine[] {
  // Collect all commands with their summaries
  const allCommands: Array<{ name: string; summary: string; isDir: boolean }> = [
    { name: "dirs", summary: "show the full directory tree", isDir: true },
    ...commands.map((c) => ({
      name: c.name,
      summary: c.summary,
      isDir: false,
    })),
    ...shellCommands.map((c) => ({
      name: `${c.name} ${c.args}`.trim(),
      summary: c.summary,
      isDir: false,
    })),
  ];

  const COLS = 3;
  const COL_WIDTH = 28;
  const ROWS = Math.ceil(allCommands.length / COLS);

  const lines: ShellLine[] = [];

  for (let row = 0; row < ROWS; row++) {
    const rowParts: string[] = [];
    for (let col = 0; col < COLS; col++) {
      const idx = col * ROWS + row;
      if (idx < allCommands.length) {
        const cmd = allCommands[idx];
        const label = cmd.name.padEnd(20);
        const summary = cmd.summary;
        const line = `${label} ${summary}`;
        rowParts.push(line.padEnd(COL_WIDTH));
      } else {
        rowParts.push(" ".repeat(COL_WIDTH));
      }
    }
    const tone = row === 0 ? "prompt" : "text";
    lines.push({ text: rowParts.join("  "), tone });
  }

  return lines;
}

/**
 * The single command engine behind every shell tab.
 * Callers own history, line ids, and what `clear` / `close` mean for them.
 */
export function runShellCommand(
  raw: string,
  ctx: ShellContext,
): { lines: ShellLine[]; action?: ShellAction } {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const [name, ...args] = input.split(/\s+/);
  const echo: ShellLine = { text: `❯ ${input}`, tone: "prompt" };
  const out: ShellLine[] = [];

  const navigate = commands.find((command) => command.name === name);
  if (navigate) {
    ctx.scrollTo(navigate.section);
    out.push({ text: `→ ${navigate.name} — ${navigate.summary}`, tone: "ok" });
    if (navigate.name === "ping") {
      out.push({ text: contact.email, tone: "ok" });
    }
    return { lines: [echo, ...out] };
  }

  switch (name) {
    case "dirs": {
      const projectTags = [...new Set(projects.flatMap((p) => p.tags))]
        .filter((t) => t !== "Web")
        .sort();
      const out: ShellLine[] = [
        { text: "dirs", tone: "prompt", col: "left" },
        ...commands.map<ShellLine>((command, index) => ({
          text: `  ${index === commands.length - 1 ? "└─" : "├─"} ${command.name}/`,
          tone: "muted",
          col: "left" as const,
        })),
        { text: "projects", tone: "prompt", col: "right" },
        ...projectTags.map<ShellLine>((tag, index) => ({
          text: `  ${index === projectTags.length - 1 ? "└─" : "├─"} ${tag}`,
          tone: "muted",
          col: "right" as const,
        })),
      ];
      return { lines: [echo, ...out] };
    }

    case "ls":
      const allTags = projects.flatMap((p) => p.tags);
      const uniqueTags = [...new Set(allTags)].sort();
      for (const tag of uniqueTags) {
        out.push({ text: tag, tone: "muted" });
      }
      return { lines: [echo, ...out] };

    case "github":
    case "linkedin": {
      const url = contact[name];
      ctx.openLink(url);
      return { lines: [echo, { text: `→ ${url}`, tone: "ok" }] };
    }

    case "theme": {
      const arg = args[0];
      if (arg === undefined) {
        const next = ctx.getTheme() === "dark" ? "light" : "dark";
        ctx.setTheme(next);
        return { lines: [echo, { text: `→ theme: ${next}`, tone: "ok" }] };
      }
      if (isTheme(arg)) {
        ctx.setTheme(arg);
        return { lines: [echo, { text: `→ theme: ${arg}`, tone: "ok" }] };
      }
      return {
        lines: [
          echo,
          { text: `theme: expected light or dark, got "${arg}"`, tone: "error" },
        ],
      };
    }

    case "home":
      ctx.scrollTo(commands[0].section);
      return { lines: [echo, { text: "→ home", tone: "ok" }] };

    case "clear":
    case "cls":
      return { lines: [], action: "clear" };

    case "close":
    case "exit":
      return { lines: [echo], action: "close" };

    case "help":
      return { lines: [echo, ...shellHelp()] };

    case "agent":
      return {
        lines: [
          echo,
          { text: "  AI Coding Agent", tone: "prompt" },
          { text: "  ──────────────", tone: "muted" },
          { text: "  Opens an AI assistant that can:", tone: "text" },
          { text: "  • Read, write, and edit files", tone: "text" },
          { text: "  • Run commands and tests", tone: "text" },
          { text: "  • Search codebases and docs", tone: "text" },
          { text: "  • Plan and execute multi-step tasks", tone: "text" },
          { text: "", tone: "text" },
          { text: "  Type your request naturally:", tone: "ok" },
          { text: '  > agent "add a contact form to the site"', tone: "prompt" },
          { text: '  > agent "fix the mobile navbar bug"', tone: "prompt" },
          { text: '  > agent "refactor the auth module"', tone: "prompt" },
        ],
      };

    case "game":
      return {
        lines: [
          echo,
          { text: "  Terminal Games", tone: "prompt" },
          { text: "  ────────────", tone: "muted" },
          { text: "  snake     — Classic snake game", tone: "text" },
          { text: "  2048      — Slide and combine tiles", tone: "text" },
          { text: "  tetris    — Falling blocks", tone: "text" },
          { text: "  mines     — Minesweeper", tone: "text" },
          { text: "", tone: "text" },
          { text: "  Usage: game <name>", tone: "ok" },
          { text: "  Example: game snake", tone: "prompt" },
        ],
      };

    default:
      return {
        lines: [
          echo,
          { text: `command not found: ${name} — try help`, tone: "error" },
        ],
      };
  }
}
